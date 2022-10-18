import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { RedisService } from 'nestjs-redis';
import { isValidObjectId } from 'mongoose';
import { CreateBookDto } from '@modules/book/etc/create-book.dto';
import CONFIG from '@config';

@Injectable()
export class BookService {
  constructor(
    @InjectModel('Book') private readonly bookModel,
    private httpService: HttpService,
    private redisService: RedisService,
  ) {}

  async getById(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid id');

    const cachedBook = await this.redisService
      .getClient('books')
      .get(`book:${id}`);

    if (cachedBook) return JSON.parse(cachedBook);

    const book = await this.bookModel.findById(id);

    if (!book) throw new NotFoundException('Book not found');

    await this.redisService
      .getClient('books')
      .set(`book:${id}`, JSON.stringify(book));

    return book;
  }

  async create(dto: CreateBookDto, user: UserDocument) {
    const { title } = dto;

    const book = await this.getBookFromGoogleApi(title);
    if (!book) throw new NotFoundException('Book not found');

    const existingTitle = await this.bookModel.findOne({
      title: book.volumeInfo.title,
    });

    if (existingTitle) throw new NotFoundException('Book already exists');

    const existingVolumeId = await this.bookModel.findOne({
      volumeId: book.id,
    });

    if (existingVolumeId) throw new NotFoundException('Book already exists');

    const model = new this.bookModel({
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors,
      creator: user._id,
      description: book.volumeInfo.description,
      pageCount: book.volumeInfo.pageCount,
      publishedDate: book.volumeInfo.publishedDate,
      categories: book.volumeInfo.categories,
      country: book.accessInfo.country,
      previewLink: book.volumeInfo.previewLink,
      thumbnail: book.volumeInfo.imageLinks?.thumbnail,
      smallThumbnail: book.volumeInfo.imageLinks?.smallThumbnail,
      etag: book.etag,
      volumeId: book.id,
    });

    await model.save().catch((error) => {
      console.log(error);
      throw new InternalServerErrorException();
    });

    await this.redisService
      .getClient('books')
      .set(`book:${model._id.toString()}`, JSON.stringify(model));

    return true;
  }

  async delete(id: string, user: UserDocument) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid id');

    const book = await this.bookModel.findById(id);

    if (!book) throw new NotFoundException('Book not found');

    if (book.creator.toString() !== user._id.toString())
      throw new ForbiddenException('You are not allowed to delete this book');

    await book.delete();

    await this.redisService.getClient('books').del(`book:${id}`);

    return true;
  }

  async getBookFromGoogleApi(searchText: string) {
    const URL = `https://www.googleapis.com/books/v1/volumes?q=${searchText}&key=${CONFIG.GOOGLE_API_KEY}&maxResults=40`;
    const response = await this.httpService
      .get(URL)
      .toPromise()
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException(error);
      });

    if (response.status === 200 && response.data && response.data.totalItems) {
      return response.data.items[0];
    } else throw new NotFoundException('Book not found');
  }
}

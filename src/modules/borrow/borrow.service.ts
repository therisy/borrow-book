import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isValidObjectId, PaginateModel } from "mongoose";
import { BookService } from "@modules/book/book.service";
import { Borrow } from "@modules/borrow/etc/borrow.schema";
import { ReturnBorrowDto } from "@modules/borrow/etc/return-borrow.dto";

@Injectable()
export class BorrowService {
  constructor(
    @InjectModel("Borrow") private readonly model: PaginateModel<Borrow>,
    private readonly bookService: BookService
  ) {
  }

  async getAll(page = 1, user: string, returned: string) {
    const queryObject = {};

    if (user) {
      if (!isValidObjectId(user)) throw new BadRequestException("Invalid User id");

      queryObject["user"] = user;
    }

    if (returned) queryObject["returned"] = returned === "true";

    const paginate = await this.model.paginate(
      {
        ...queryObject
      },
      {
        page,
        limit: 10,
        populate: "book",
        sort: { createdAt: -1 }
      });

    return paginate;
  }

  async getMyBorrows(user: UserDocument, page = 1, returned: boolean) {
    const paginate = await this.model.paginate(
      { user: user._id, returned },
      {
        page,
        limit: 10,
        populate: "book",
        sort: { createdAt: -1 }
      });

    return paginate;
  }

  async createBorrow(id, user: UserDocument) {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid id");

    const book = await this.bookService.getById(id);
    if (!book) throw new NotFoundException("Book not found");

    const valid = await this.hasBookFromAnotherUser(user._id, book._id);
    if (valid)
      throw new ConflictException("You already have a book from another user");

    const hasRead = await this.hasRead(user._id, book._id);
    if (hasRead) throw new ConflictException("You already read this book");

    const borrow = new this.model({
      book: book._id,
      user: user._id,
      returned: false,
      score: 0
    });

    await borrow.save();

    return true;
  }

  async returnBorrow(dto: ReturnBorrowDto, book, user: UserDocument) {
    if (!isValidObjectId(book)) throw new BadRequestException("Invalid id");

    const borrow = await this.model.findOne({ user: user._id, book, returned: false });
    if (!borrow) throw new NotFoundException("Borrow not found");

    await borrow.updateOne({
      returned: true,
      score: dto.score
    });

    return true;
  }

  async hasRead(user: string, book: string): Promise<boolean> {
    if (!isValidObjectId(user)) throw new BadRequestException("Invalid User id");
    if (!isValidObjectId(book)) throw new BadRequestException("Invalid Book id");

    const borrow = await this.model.findOne({
      user: user,
      book: book,
      returned: true
    });

    return !!borrow;
  }

  async hasBookFromAnotherUser(
    user: string,
    book: BookDocument
  ): Promise<boolean> {
    if (!isValidObjectId(user)) throw new BadRequestException("Invalid User id");
    if (!isValidObjectId(book)) throw new BadRequestException("Invalid Book id");

    const borrow = await this.model.findOne({
      user: user,
      book: book,
      returned: false,
      createdAt: {
        $gt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7,
        $lt: Math.floor(Date.now() / 1000)
      }
    });

    return !!borrow;
  }
}

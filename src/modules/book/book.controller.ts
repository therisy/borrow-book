import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@decorators/role.decorator';
import { RoleTypes } from '@enums/role.enum';
import { BookService } from '@modules/book/book.service';

@Controller('book')
@ApiTags('Book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards()
  @Role(RoleTypes.ADMIN)
  @Post()
  async create() {
    return await this.bookService.create();
  }
}

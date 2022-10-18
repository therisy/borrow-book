import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@decorators/role.decorator';
import { RoleTypes } from '@enums/role.enum';
import { BookService } from '@modules/book/book.service';
import { User } from '@decorators/user.decorator';
import { JwtGuard } from '@guards/jwt.guard';
import { RoleGuard } from '@guards/role.guard';
import { CreateBookDto } from '@modules/book/etc/create-book.dto';

@Controller('book')
@ApiTags('Book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.bookService.getById(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Role(RoleTypes.ADMIN)
  @Post()
  async create(@Body() dto: CreateBookDto, @User() user: UserDocument) {
    return await this.bookService.create(dto, user);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Role(RoleTypes.ADMIN)
  @Delete()
  async delete(@Param('id') id: string, @User() user: UserDocument) {
    return await this.bookService.delete(id, user);
  }
}

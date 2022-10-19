import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiTags } from '@nestjs/swagger';
import { BorrowService } from '@modules/borrow/borrow.service';
import { RoleGuard } from '@guards/role.guard';
import { JwtGuard } from '@guards/jwt.guard';
import { Role } from '@decorators/role.decorator';
import { RoleTypes } from '@enums/role.enum';
import { User } from '@decorators/user.decorator';
import { ReturnBorrowDto } from "@modules/borrow/etc/return-borrow.dto";

@Controller('borrow')
@ApiTags('Borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Role(RoleTypes.USER)
  @Get('@me')
  async getMyBorrows(
    @Query('page') page: number,
    @Query('returned', ParseBoolPipe) returned: boolean,
    @User() user: UserDocument
  ) {
    return this.borrowService.getMyBorrows(user, page, returned);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Role(RoleTypes.USER)
  @Post(':id')
  async createBorrow(@Param('id') id: string, @User() user: UserDocument) {
    return this.borrowService.createBorrow(id, user);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Role(RoleTypes.USER)
  @Delete(':id')
  async returnBorrow(
    @Body() dto: ReturnBorrowDto,
    @Param('id') id: string,
    @User() user: UserDocument
  ) {
    return this.borrowService.returnBorrow(dto, id, user);
  }

  /* ADMIN ROUTES */
  @UseGuards(JwtGuard, RoleGuard)
  @Get()
  async getAll(
    @Query('page') page: number,
    @Query('user') user: string,
    @Query('returned') returned: string,
  ) {
    return this.borrowService.getAll(page, user, returned);
  }
}

import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Throttle } from '@nestjs/throttler';
import { CreateUserDto } from './etc/create-user.dto';
import { User } from '@decorators/user.decorator';
import { JwtGuard } from '@guards/jwt.guard';
import { RoleGuard } from '@guards/role.guard';
import { Role } from '@decorators/role.decorator';
import { RoleTypes } from '@enums/role.enum';
import { UpdateUserDto } from '@modules/user/etc/update-user.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Throttle(1, 60 * 8)
  @Post()
  async create(@Body() createDTO: CreateUserDto) {
    return await this.userService.create(createDTO);
  }

  @Get('@me')
  @UseGuards(JwtGuard, RoleGuard)
  @Role(RoleTypes.USER)
  async getMe(@User() user) {
    return await this.userService.getMe(user);
  }

  @Patch('@me')
  @UseGuards(JwtGuard, RoleGuard)
  @Role(RoleTypes.USER)
  async update(@User() user, @Body() updateDTO: UpdateUserDto) {
    return await this.userService.update(user, updateDTO);
  }

  @Put('password')
  @UseGuards(JwtGuard, RoleGuard)
  @Role(RoleTypes.USER)
  async updatePassword(@User() user, @Body() updateDTO: UpdateUserDto) {
    return await this.userService.updatePassword(user, updateDTO);
  }
}

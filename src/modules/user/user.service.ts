import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '@modules/user/etc/user.schema';
import { CreateUserDto } from './etc/create-user.dto';
import { RoleTypes } from '@enums/role.enum';
import { UpdateUserDto } from '@modules/user/etc/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly model: Model<User>) {}

  async create(dto: CreateUserDto): Promise<boolean> {
    dto.username = dto.username.toLowerCase();

    const exist = await this.model.findOne({ username: dto.username });
    if (exist) throw new ConflictException('Username already exists');

    const user = new this.model(dto);
    user.role = RoleTypes.USER;
    user.password = await bcrypt.hash(user.password, 10);

    await user.save();

    return true;
  }

  async getMe(user) {
    return Object.assign(user, {
      password: undefined,
      updatedAt: undefined,
    });
  }

  async getByUsernameAsAdmin(username: string): Promise<User> {
    return this.model.findOne({
      username: username.toLowerCase(),
    });
  }

  async getUserById(id: string): Promise<User> {
    return this.model.findOne({ _id: id, freeze: { $ne: true } });
  }

  async update(user: User, dto: UpdateUserDto): Promise<User> {
    const exist = await this.model.findOne({
      username: dto.username,
      freeze: { $ne: true },
    });
    if (exist && exist.id !== user.id)
      throw new ConflictException('Username already exists');

    return this.model.findOneAndUpdate(
      {
        _id: user._id,
      },
      { username: dto.username },
      { new: true },
    );
  }

  async updatePassword(user: User, dto): Promise<boolean> {
    const exist = await this.model.findById(user._id);
    if (!exist) throw new BadRequestException('User not found');

    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new BadRequestException('New password not match');
    }

    const match = await bcrypt.compare(dto.newPassword, exist.password);
    if (!match) throw new BadRequestException('Password not match');

    exist.password = await bcrypt.hash(dto.newPassword, 10);
    await exist.save();

    return true;
  }
}

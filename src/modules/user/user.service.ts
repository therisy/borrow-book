import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { HttpService } from '@nestjs/axios';
import { User } from '@modules/user/etc/user.schema';
import { CreateUserDto } from './etc/create-user.dto';
import { RoleTypes } from '@enums/role.enum';
import { UpdateUserDto } from '@modules/user/etc/update-user.dto';
import CONFIG from '@config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly model: Model<User>,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: CreateUserDto): Promise<boolean> {
    dto.username = dto.username.toLowerCase();

    /*
      in the comment line because there is no frontend at the moment

     * const captchaValid = this.captchaValidator(dto.captcha);
     * if (!captchaValid) throw new BadRequestException('Captcha not valid');
     */

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

  async getUserById(id: string): Promise<UserDocument> {
    return this.model.findOne({ _id: id }, { password: 0 });
  }

  async update(user: User, dto: UpdateUserDto): Promise<UserDocument> {
    const exist = await this.model.findOne({
      username: dto.username,
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

  async captchaValidator(captcha: string): Promise<boolean> {
    const response = await this.httpService
      .post(
        CONFIG.HCAPTCHA_API,
        `response=${captcha}&secret=${CONFIG.HCAPTCHA_SECRET}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      )
      .toPromise();

    return response.data?.success;
  }
}

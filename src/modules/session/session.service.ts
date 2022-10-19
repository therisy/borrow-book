import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '@modules/user/user.service';
import { CreateSessionDto } from './etc/create-session.dto';
import { FastifyReply } from 'fastify';

@Injectable()
export class SessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {}

  async create(
    dto: CreateSessionDto,
    response: FastifyReply,
  ): Promise<boolean> {
    /* in the comment line because there is no frontend at the moment
     * const captchaValid = this.userService.captchaValidator(dto.captcha);
     * if (!captchaValid) throw new BadRequestException('Captcha not valid');
     */

    const user = await this.userService.getByUsernameAsAdmin(dto.username);
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new NotFoundException('Password does not match');

    const token = this.jwtService.sign({
      id: user._id,
      username: user.username,
    });

    response.setCookie('access_token', token, {
      httpOnly: true, // prevent client side access
    });

    return true;
  }

  async verify(payload: JwtPayload): Promise<UserDocument> {
    const timeDiff = payload.exp - Date.now() / 1000;
    if (timeDiff <= 0) throw new UnauthorizedException('Access token expired');

    const user = await this.userService.getUserById(payload.id);
    if (!user) throw new UnauthorizedException('User not found');

    return user;
  }
}

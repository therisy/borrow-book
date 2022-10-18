import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { SessionService } from './session.service';
import { CreateSessionDto } from './etc/create-session.dto';

@Controller('session')
@ApiTags('Session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async create(
    @Body() dto: CreateSessionDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<boolean> {
    return await this.sessionService.create(dto, response);
  }
}

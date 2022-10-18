import { Injectable } from '@nestjs/common';
import { SessionService } from '@modules/session/session.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import CONFIG from '@config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly sessionService: SessionService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: FastifyRequest) => {
          return request?.cookies['access_token'];
        },
      ]),
      secretOrKey: CONFIG.SECRET,
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  // noinspection JSUnusedGlobalSymbols
  public validate(payload: JwtPayload): Promise<UserDocument> {
    return this.sessionService.verify(payload);
  }
}

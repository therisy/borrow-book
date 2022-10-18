import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleTypes } from '@enums/role.enum';
import { User } from '@modules/user/etc/user.schema';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user: User = request.user;
    if (!user) return false;

    let role: RoleTypes = this.reflector.get<RoleTypes>(
      'role',
      context.getHandler(),
    );
    if (!role) role = RoleTypes.ADMIN;

    return role <= user.role;
  }
}

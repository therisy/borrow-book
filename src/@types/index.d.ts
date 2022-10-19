import { RoleTypes } from '@enums/role.enum';

declare global {
  interface JwtPayload {
    id: string;
    username: string;
    iat: number;
    exp: number;
  }

  interface UserDocument {
    _id: string;
    username: string;
    role: RoleTypes;
    createdAt: number;
    updatedAt: number;
  }

  interface BookDocument {
    user: string;
    book: string;
    returned: boolean;
    score: number;
    createdAt: number;
    updatedAt: number;
  }
}

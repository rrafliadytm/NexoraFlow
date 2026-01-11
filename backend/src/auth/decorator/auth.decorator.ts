import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { AuthUser } from '../../common/types/types';

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    const authHeader: string | undefined = request.headers.authorization;

    if (!user || !authHeader) {
      throw new HttpException('Unauthorized', 401);
    }

    const accessToken = authHeader.replace('Bearer ', '');

    return {
      ...user,
      access_token: accessToken,
    } as AuthUser;
  },
);

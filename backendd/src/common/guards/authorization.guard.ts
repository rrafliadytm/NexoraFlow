import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '@app/common/decorators/require-permission.decorator';
import { AuthUser } from '@app/common/types/types';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<string>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const authHeader: string | undefined = request.headers.authorization;

    if (!user || !authHeader) {
      throw new HttpException('Unauthorized', 401);
    }

    const accessToken = authHeader.replace('Bearer ', '');

    const authUser: AuthUser = {
      ...user,
      access_token: accessToken,
    };

    const organizationId = request.params.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    await this.authorizationService.assertAuthorized(
      authUser,
      organizationId,
      permission,
    );

    return true;
  }
}

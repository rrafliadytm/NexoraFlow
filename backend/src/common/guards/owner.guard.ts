import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_OWNER_KEY } from '../decorators/require-owner.decorator';
import { SupabaseService } from '../services/supabase.service';
import { firstOrSelf } from '../utils/normalize.utils';
import { AuthUser } from '../types/types';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const enabled = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!enabled) return true;

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

    const { data, error } = await this.supabaseService
      .getUserClient(authUser.access_token)
      .from('organization_memberships')
      .select(`organization_id, profile_id, role:roles ( name )`)
      .eq('profile_id', authUser.sub)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new NotFoundException('Organization not found');

    const roleName = firstOrSelf(data.role)?.name;

    if (roleName !== 'Owner') {
      throw new ForbiddenException(
        'Only organization owner can do this action',
      );
    }

    return true;
  }
}

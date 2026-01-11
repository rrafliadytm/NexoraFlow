import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { firstOrSelf } from '../utils/normalize.utils';
import { SupabaseService } from './supabase.service';
import { AuthUser } from '../types/types';

type AuthzResult =
  | { ok: true }
  | {
      ok: false;
      statusCode: number;
      message: string;
      reason: 'MEMBERSHIP_NOT_FOUND' | 'ROLE_NOT_FOUND' | 'PERMISSION_MISSING';
      missingPermission?: string;
    };

type AssertOptions = {
  notMemberMessage?: string;
  forbiddenMessage?: string;
  hideExistence?: boolean;
};

@Injectable()
export class AuthorizationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private impliesManage(actionCode: string, codes: Set<string>): boolean {
    const resource = actionCode.split('.')[0]; // "role"
    const manageCode = resource ? `${resource}.manage` : null;
    return (
      codes.has(actionCode) || (manageCode ? codes.has(manageCode) : false)
    );
  }

  /**
   * Returns structured result (no throwing except internal failures).
   */
  async isAuthorized(
    user: AuthUser,
    organizationId: string,
    actionCode: string,
  ): Promise<AuthzResult> {
    const client = this.supabaseService.getUserClient(user.access_token);

    // 1) membership -> role id
    const { data: membership, error: membershipError } = await client
      .from('organization_memberships')
      .select(`role:roles ( id )`)
      .eq('organization_id', organizationId)
      .eq('profile_id', user.sub)
      .maybeSingle();

    if (membershipError) {
      throw new InternalServerErrorException(
        `Failed to fetch membership: ${membershipError.message}`,
      );
    }

    if (!membership) {
      return {
        ok: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Organization membership not found',
        reason: 'MEMBERSHIP_NOT_FOUND',
      };
    }

    const role = firstOrSelf(membership.role);
    if (!role?.id) {
      return {
        ok: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Role not found for this membership',
        reason: 'ROLE_NOT_FOUND',
      };
    }

    // 2) permissions for role
    const { data: rpRows, error: permissionsError } = await client
      .from('role_permissions')
      .select(`permission:permissions ( code )`)
      .eq('role_id', role.id);

    if (permissionsError) {
      throw new InternalServerErrorException(
        `Failed to fetch permissions: ${permissionsError.message}`,
      );
    }

    const codes = new Set(
      (rpRows ?? [])
        .map((r: any) => firstOrSelf(r.permission)?.code)
        .filter(Boolean),
    );

    const allowed = this.impliesManage(actionCode, codes);
    if (allowed) return { ok: true };

    return {
      ok: false,
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Missing required permission',
      reason: 'PERMISSION_MISSING',
      missingPermission: actionCode,
    };
  }

  /**
   * Throws customizable exceptions.
   */
  async assertAuthorized(
    user: AuthUser,
    organizationId: string,
    actionCode: string,
    options: AssertOptions = {},
  ): Promise<void> {
    const res = await this.isAuthorized(user, organizationId, actionCode);

    if (res.ok) return;

    // If you don't want to leak whether org exists, return 403 for non-members too.
    if (res.reason === 'MEMBERSHIP_NOT_FOUND') {
      if (options.hideExistence) {
        throw new ForbiddenException(
          options.notMemberMessage ??
            'You are not allowed to access this organization',
        );
      }
      throw new NotFoundException(options.notMemberMessage ?? res.message);
    }

    if (res.reason === 'PERMISSION_MISSING') {
      throw new ForbiddenException(
        options.forbiddenMessage ??
          `You are not authorized to perform this action. Required permission: ${actionCode}`,
      );
    }

    // fallback (role not found, etc.)
    throw new HttpException(
      options.forbiddenMessage ?? res.message,
      res.statusCode ?? HttpStatus.FORBIDDEN,
    );
  }
}

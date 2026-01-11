import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthUser } from '@app/common/types/types';
import { SupabaseService } from '@app/common/services/supabase.service';
import { firstOrSelf } from '@app/common/utils/normalize.utils';
import { ListQueryDto, SortOrder } from '@app/common/dto/query.dto';

@Injectable()
export class RoleService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(user: AuthUser, organizationId: string, dto: CreateRoleDto) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .rpc('create_role_with_permissions', {
        p_organization_id: organizationId,
        p_name: dto.name,
        p_description: dto.description,
        p_permission_ids: dto.permission_ids,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async findAll(user: AuthUser, organizationId: string, query: ListQueryDto) {
    const filtersObj = query.filters ? JSON.parse(query.filters) : {};
    const permissionIds: number[] = Array.isArray(filtersObj.permission_ids)
      ? filtersObj.permission_ids.map(Number).filter(Number.isInteger)
      : [];

    let roleIds: string[] | null = null;

    if (permissionIds.length) {
      const { data: rows, error } = await this.supabaseService
        .getUserClient(user.access_token)
        .rpc('role_ids_with_all_permissions', {
          p_organization_id: organizationId,
          p_permission_ids: permissionIds,
        });

      if (error) throw new InternalServerErrorException(error.message);
      roleIds = (rows ?? []).map((r: any) => r.role_id);
    }

    let qb = this.supabaseService
      .getUserClient(user.access_token)
      .from('roles')
      .select(
        `
      *,
      role_permissions (
        permission:permissions (id, code, description)
      )
    `,
        { count: 'exact' },
      )
      .or(`organization_id.eq.${organizationId},organization_id.is.null`);

    if (roleIds) {
      // If no roles matched ALL permissions, return early
      if (roleIds.length === 0) {
        return {
          data: [],
          meta: { page: query.page ?? 1, limit: query.limit ?? 10, total: 0 },
        };
      }
      qb = qb.in('id', roleIds);
    }

    // optional: search
    if (query.search?.trim()) {
      const term = query.search.trim();
      qb = qb.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }

    // sort (whitelist!)
    const allowedSort = new Set(['created_at', 'name', 'updated_at']);
    const sortBy = allowedSort.has(query.sort_by ?? '')
      ? query.sort_by!
      : 'created_at';
    const ascending = (query.sort_order ?? SortOrder.DESC) === SortOrder.ASC;
    qb = qb.order(sortBy, { ascending });

    // pagination
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    qb = qb.range(from, to);

    const { data, error, count } = await qb;
    if (error) throw new InternalServerErrorException(error.message);

    // map permissions as you already do...
    const mapped = (data ?? []).map((role: any) => ({
      ...role,
      permissions: (role.role_permissions ?? [])
        .map((rp: any) => firstOrSelf(rp.permission) ?? null)
        .filter(Boolean),
      role_permissions: undefined,
    }));

    // Optional: return meta
    return {
      data: mapped,
      meta: {
        page,
        limit,
        total: count ?? null,
        totalPages: count != null ? Math.ceil(count / limit) : null,
        sortBy,
        sortOrder: query.sort_order ?? SortOrder.DESC,
        search: query.search ?? null,
      },
    };
  }

  async findOne(user: AuthUser, organizationId: string, roleId: string) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('roles')
      .select(
        `
      *,
      role_permissions (
        permission:permissions (
          id,
          code,
          description
        )
      )
    `,
      )
      .eq('id', roleId)
      .or(`organization_id.eq.${organizationId},organization_id.is.null`);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch role: ${error.message}`,
      );
    }

    const role = firstOrSelf(data);
    if (!role) {
      throw new BadRequestException(`Role not found`);
    }

    return {
      ...role,
      permissions: (role.role_permissions ?? [])
        .map((rp: any) => firstOrSelf(rp.permission) ?? null)
        .filter(Boolean),
      role_permissions: undefined,
    };
  }

  async update(
    user: AuthUser,
    organizationId: string,
    roleId: string,
    dto: UpdateRoleDto,
  ) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .rpc('update_role_with_permissions', {
        p_role_id: roleId,
        p_organization_id: organizationId,
        p_name: dto.name,
        p_description: dto.description,
        p_permission_ids: dto.permission_ids,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async remove(user: AuthUser, organizationId: string, roleId: string) {
    const { error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('roles')
      .delete()
      .eq('id', roleId)
      .eq('organization_id', organizationId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

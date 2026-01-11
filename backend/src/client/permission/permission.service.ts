import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '@app/common/services/supabase.service';
import { AuthUser } from '@app/common/types/types';
import { OrganizationService } from '@app/client/organization/services/organization.service';
import { SearchQueryDto, SortOrder } from '@app/common/dto/query.dto';

@Injectable()
export class PermissionService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly organizationService: OrganizationService,
  ) {}

  async findAllByOrganization(
    user: AuthUser,
    organizationId: string,
    query: SearchQueryDto,
  ) {
    const organization = await this.organizationService.findOne(
      user,
      organizationId,
    );

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let qb = this.supabaseService
      .getUserClient(user.access_token)
      .from('plan_permissions')
      .select(
        `
        permission:permissions (
          id,
          code,
          description
        )
      `,
        { count: 'exact' },
      )
      .eq('plan_id', organization.plan_id);

    // Search on embedded relation (permission)
    if (query.search?.trim()) {
      const term = query.search.trim();
      qb = qb.or(`code.ilike.%${term}%,description.ilike.%${term}%`, {
        foreignTable: 'permission',
      });
    }

    // Pagination
    qb = qb.range(from, to);

    const { data, error, count } = await qb;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch permissions: ${error.message}`,
      );
    }

    return {
      data: (data ?? []).map((row: any) => row.permission).filter(Boolean),
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: count != null ? Math.ceil(count / limit) : 0,
        search: query.search ?? null,
      },
    };
  }
}

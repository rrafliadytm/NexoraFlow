import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateMemberDto } from './dto/update-member.dto';
import { SupabaseService } from '@app/common/services/supabase.service';
import { AuthUser } from '@app/common/types/types';
import { ListQueryDto, SortOrder } from '@app/common/dto/query.dto';

@Injectable()
export class MemberService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(user: AuthUser, organizationId: string, query: ListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const allowedSort = new Set([
      'created_at',
      'display_name',
      'profile.first_name',
      'profile.last_name',
      'profile.email',
      'role.name',
    ]);

    const sortBy = allowedSort.has(query.sort_by ?? '')
      ? query.sort_by!
      : 'created_at';

    const sortOrder = query.sort_order ?? SortOrder.ASC;

    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .rpc('list_organization_members', {
        p_organization_id: organizationId,
        p_search: query.search ?? null,
        p_sort_by: sortBy,
        p_sort_order: sortOrder,
        p_page: page,
        p_limit: limit,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch members: ${error.message}`,
      );
    }

    const rows = data ?? [];
    const total = rows.length ? Number(rows[0].total_count) : 0;

    return {
      data: rows.map(({ total_count, ...rest }: any) => rest),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        search: query.search ?? null,
        sort_by: sortBy,
        sort_order: sortOrder,
      },
    };
  }

  async findOne(user: AuthUser, organizationId: string, profileId: string) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organization_memberships')
      .select(
        `
          id,
          display_name,
          created_at,
          profile:profiles (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            status
          ),
          role:roles (
            id,
            name
          )
        `,
      )
      .eq('organization_id', organizationId)
      .eq('id', profileId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch member: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException('Member not found in this organization');
    }

    return data;
  }

  async update(
    user: AuthUser,
    organizationId: string,
    profileId: string,
    dto: UpdateMemberDto,
  ) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    const patch: Record<string, any> = {};
    if (dto.display_name !== undefined) patch.display_name = dto.display_name;
    if (dto.role_id !== undefined) patch.role_id = dto.role_id;

    // Keep audit fields if your table has them (remove if not)
    patch.updated_at = new Date().toISOString();
    patch.updated_by = user.sub;

    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organization_memberships')
      .update(patch)
      .eq('organization_id', organizationId)
      .eq('profile_id', profileId)
      .select(
        `
          id,
          display_name,
          created_at,
          updated_at,
          profile:profiles (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            status
          ),
          role:roles (
            id,
            name
          )
        `,
      )
      .single();

    if (error) {
      // e.g. invalid role_id FK, RLS issue, etc.
      throw new InternalServerErrorException(
        `Failed to update member: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException('Member not found in this organization');
    }

    return data;
  }

  async remove(user: AuthUser, organizationId: string, profileId: string) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organization_memberships')
      .delete()
      .eq('organization_id', organizationId)
      .eq('profile_id', profileId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to remove member: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException('Member not found in this organization');
    }

    return { id: data.id };
  }
}

import { Injectable } from '@nestjs/common';
import { UpdateOrganizationMembershipDto } from '../dto/update-organization-membership.dto';
import { SupabaseService } from '@app/common/services/supabase.service';
import { AuthUser } from '@app/common/types/types';
import { ListQueryDto } from '@app/common/dto/query.dto';

@Injectable()
export class OrganizationMembershipService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(user: AuthUser, organizationId: string, query: ListQueryDto) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organization_memberships')
      .select(
        `
        *,
        profile:profiles(*)
        `,
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} organizationMembership`;
  }

  update(
    id: number,
    updateOrganizationMembershipDto: UpdateOrganizationMembershipDto,
  ) {
    return `This action updates a #${id} organizationMembership`;
  }

  remove(id: number) {
    return `This action removes a #${id} organizationMembership`;
  }
}

import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { SupabaseService } from '@app/common/services/supabase.service';
import { AuthUser } from '@app/common/types/types';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '@app/common/services/storage.service';
import { firstOrSelf } from '@app/common/utils/normalize.utils';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    user: AuthUser,
    dto: CreateOrganizationDto,
    file?: Express.Multer.File,
  ) {
    const organizations = await this.findAll(user);
    if (organizations.some((org) => org.organization?.plan?.id === 1)) {
      throw new InternalServerErrorException(
        'Only one organization allowed on the free plan',
      );
    }

    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .rpc('create_organization_with_owner', {
        p_name: dto.name,
        p_locale: dto.locale,
        p_contact_email: dto.contact_email,
        p_contact_phone: dto.contact_phone,
        p_plan_id: 1,
        p_profile_id: user.sub,
        p_role_id: this.configService.getOrThrow<string>('OWNER_ROLE_ID'),
      });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create organization: ${error.message}`,
      );
    }

    if (file) {
      const logoPath = this.storageService.uploadOrganizationLogo(
        data.id,
        file,
      );

      const { data: updatedOrg, error: updateError } =
        await this.supabaseService
          .getUserClient(user.access_token)
          .from('organizations')
          .update({
            logo_path: logoPath,
          })
          .eq('id', data.id)
          .select('*')
          .single();

      if (updateError) {
        throw new InternalServerErrorException(
          `Failed to update organization logo: ${updateError.message}`,
        );
      }

      return updatedOrg;
    }

    return data;
  }

  async findAll(user: AuthUser) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organization_memberships')
      .select(
        `
        created_at,
        organization:organizations (
          id,
          name,
          slug,
          plan:plans (
            id,
            name
          )
        ),
        role:roles (
          id,
          name
        )
        `,
      )
      .eq('profile_id', user.sub);

    if (error)
      throw new InternalServerErrorException(
        `Failed to fetch organizations: ${error.message}`,
      );

    const normalized = data.map((row) => {
      const org = firstOrSelf(row.organization);
      const role = firstOrSelf(row.role);
      const plan = firstOrSelf(org?.plan);

      return {
        ...row,
        organization: org ? { ...org, plan } : null,
        role,
      };
    });

    return normalized;
  }

  async findOne(user: AuthUser, organizationId: string) {
    const { data: membership, error: membershipError } =
      await this.supabaseService
        .getUserClient(user.access_token)
        .from('organization_memberships')
        .select('*')
        .eq('profile_id', user.sub)
        .eq('organization_id', organizationId);

    if (membershipError || membership.length === 0) {
      throw new NotFoundException(
        `Organization not found: ${membershipError?.message}`,
      );
    }

    const { data: organization, error: organizationError } =
      await this.supabaseService
        .getUserClient(user.access_token)
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

    if (organizationError) {
      throw new InternalServerErrorException(
        `Failed to fetch organization: ${organizationError.message}`,
      );
    }

    return organization;
  }

  async update(
    user: AuthUser,
    organizationId: string,
    dto: UpdateOrganizationDto,
    file?: Express.Multer.File,
  ) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organizations')
      .update({
        name: dto.name,
        locale: dto.locale,
        contact_email: dto.contact_email,
        contact_phone: dto.contact_phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId)
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to update organization: ${error.message}`,
      );
    }

    if (file) {
      const logoPath = this.storageService.uploadOrganizationLogo(
        data.id,
        file,
      );

      const { data: updatedOrg, error: updateError } =
        await this.supabaseService
          .getUserClient(user.access_token)
          .from('organizations')
          .update({
            logo_path: logoPath,
          })
          .eq('id', data.id)
          .select('*')
          .single();

      if (updateError) {
        throw new InternalServerErrorException(
          `Failed to update organization logo: ${updateError.message}`,
        );
      }

      return updatedOrg;
    }

    return data;
  }

  private async isOwner(user: AuthUser, organizationId: string) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organization_memberships')
      .select(
        `
        organization_id,
        profile_id,
        role:roles ( name )
      `,
      )
      .eq('profile_id', user.sub)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new NotFoundException('Organization not found');

    const role = firstOrSelf(data.role)?.name;

    const allowed = new Set(['Owner']);
    if (!role || !allowed.has(role)) {
      throw new ForbiddenException(
        'Only organization owner can do this action',
      );
    }
  }

  async requestDelete(user: AuthUser, organizationId: string) {
    const now = new Date();
    const scheduledFor = new Date();
    scheduledFor.setDate(now.getDate() + 30);

    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organizations')
      .update({
        deletion_requested_at: now.toISOString(),
        deletion_scheduled_for: scheduledFor.toISOString(),
        deleted_by: user.sub,
      })
      .eq('id', organizationId)
      .select('*')
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new NotFoundException('Organization not found');
  }

  async cancelDeleteRequest(user: AuthUser, organizationId: string) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organizations')
      .update({
        deletion_requested_at: null,
        deletion_scheduled_for: null,
        deleted_by: null,
      })
      .eq('id', organizationId)
      .select('*')
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new NotFoundException('Organization not found');
  }

  async transferOwnership(
    user: AuthUser,
    organizationId: string,
    newOwnerProfileId: string,
  ) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .rpc('transfer_organization_ownership', {
        p_organization_id: organizationId,
        p_current_owner_profile_id: user.sub,
        p_new_owner_profile_id: newOwnerProfileId,
        p_owner_role_id: this.configService.getOrThrow<string>('OWNER_ROLE_ID'),
      });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to transfer ownership: ${error.message}`,
      );
    }

    return data;
  }
}

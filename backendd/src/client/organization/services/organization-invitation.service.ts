import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '@app/common/services/supabase.service';
import { AuthUser } from '@app/common/types/types';
import { CreateOrganizationInvitationDto } from '../dto/create-organization-invitation.dto';
import * as crypto from 'crypto';
import { EmailService } from '@app/common/services/email.service';
import { OrganizationService } from './organization.service';
import { ConfigService } from '@nestjs/config';
import { RoleService } from '@app/client/role/role.service';

@Injectable()
export class OrganizationInvitationService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly emailService: EmailService,
    private readonly organizationService: OrganizationService,
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
  ) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  private sha256(input: string) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  async createInvitation(
    user: AuthUser,
    organizationId: string,
    dto: CreateOrganizationInvitationDto,
  ) {
    const role = await this.roleService.findOne(
      user,
      organizationId,
      dto.role_id,
    );

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const client = this.supabaseService.getUserClient(user.access_token);

    const email = this.normalizeEmail(dto.email);
    const token = this.generateToken();
    const tokenHash = this.sha256(token);

    // Expiry suggestion: 7 days
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Optional: prevent multiple pending invites for same email/org
    const { data: existing, error: existingErr } = await client
      .from('organization_invitations')
      .select('id,status,expires_at')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .maybeSingle();

    if (existingErr) {
      throw new InternalServerErrorException(existingErr.message);
    }

    if (existing) {
      throw new BadRequestException('Invitation already exists for this email');
    }

    const organization = await this.organizationService.findOne(
      user,
      organizationId,
    );
    const redirectUrl = this.configService.getOrThrow('FRONTEND_URL');

    await this.emailService.sendOrganizationInvite(
      email,
      user.user_metadata.first_name,
      organization.name,
      `${redirectUrl}/invite?token=${token}`,
    );

    const { data, error } = await client
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role_id: dto.role_id,
        token_hash: tokenHash,
        status: 'pending',
        expires_at: expiresAt,
        invited_by: user.sub,
      })
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // TODO: send email containing `${FRONTEND_URL}/invite?token=${token}`
    // You should NOT store raw token in DB. Only token_hash is stored.

    return { invitation: data, token };
  }

  async listInvitations(user: AuthUser, organizationId: string) {
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organization_invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data ?? [];
  }

  async revokeInvitation(
    user: AuthUser,
    organizationId: string,
    invitationId: string,
  ) {
    // Only revoke pending invitations
    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .from('organization_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('organization_id', organizationId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Invitation not found or not revokable');
    }

    return data;
  }
}

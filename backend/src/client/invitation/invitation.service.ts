import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '@app/common/services/supabase.service';
import { AuthUser } from '@app/common/types/types';
import * as crypto from 'crypto';

@Injectable()
export class InvitationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private sha256(input: string) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  async acceptInvitation(user: AuthUser, token: string) {
    if (!token || token.length < 20) {
      throw new BadRequestException('Invalid invitation token');
    }

    const tokenHash = this.sha256(token);

    const userEmail = user.email ?? user.user_metadata?.email ?? '';

    if (!userEmail) {
      throw new BadRequestException('User email not found');
    }

    const { data, error } = await this.supabaseService
      .getUserClient(user.access_token)
      .rpc('accept_organization_invitation', {
        p_token_hash: tokenHash,
        p_profile_id: user.sub,
        p_email: userEmail,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new InternalServerErrorException('No data returned');
    }

    return data;
  }
}

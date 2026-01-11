import { HttpException, Injectable } from '@nestjs/common';
import { SupabaseService } from '@app/common/services/supabase.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthResponse, AuthUser } from '@app/common/types/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  public async signIn(dto: SignInDto): Promise<any> {
    const { data, error } = await this.supabaseService
      .getAnonClient()
      .auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (error) throw new HttpException(error.message, 401);

    return data;
  }

  public async signUp(dto: SignUpDto) {
    const { data, error } = await this.supabaseService
      .getAnonClient()
      .auth.signUp({
        email: dto.email,
        password: dto.password,
        options: {
          data: {
            first_name: dto.first_name,
            last_name: dto.last_name,
          },
          emailRedirectTo: `${this.configService.get('FRONTEND_URL')}/auth/confirmed`,
        },
      });

    if (error) throw new HttpException(error.message, 500);

    return data;
  }

  // public async resetPassword(user: AuthUser, request: ResetPasswordDto) {
  //   const { error: signInError } = await this.supabaseService
  //     .getClient()
  //     .auth.signInWithPassword({
  //       email: user.email,
  //       password: request.password,
  //     });

  //   if (signInError)
  //     throw new HttpException('Current password is incorrect', 401);

  //   if (request.new_password !== request.new_password_confirmation) {
  //     throw new HttpException(
  //       'New password and confirmation do not match',
  //       400,
  //     );
  //   }

  //   const { error: updateError } = await this.supabaseService
  //     .getClient()
  //     .auth.updateUser({
  //       password: request.new_password,
  //     });

  //   if (updateError) throw new HttpException(updateError.message, 500);

  //   return { message: 'Password resetted successfully' };
  // }

  // public async updateProfile(user: AuthUser, request: UpdateProfileDto) {
  //   const { error } = await this.supabaseService
  //     .getClient()
  //     .from('users')
  //     .update({
  //       full_name: request.full_name,
  //     })
  //     .match({ id: user.sub });

  //   if (error) throw new HttpException('error: ' + error.message, 500);

  //   const { error: authError } = await this.supabaseService
  //     .getAdminClient()
  //     .auth.admin.updateUserById(user.sub, {
  //       user_metadata: {
  //         full_name: request.full_name,
  //       },
  //     });
  //   if (authError)
  //     throw new HttpException('authError: ' + authError.message, 500);

  //   const { error: userError } = await this.supabaseService
  //     .getClient()
  //     .from('users')
  //     .update({
  //       name: request.full_name,
  //     })
  //     .eq('id', user.sub);
  //   if (userError)
  //     throw new HttpException('userError: ' + userError.message, 500);

  //   return { message: 'Profile updated successfully' };
  // }
}

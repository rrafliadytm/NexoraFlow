import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from '@app/auth/decorator/auth.decorator';
import { AuthUser } from '@app/common/types/types';
import { AuthResponse } from '@app/common/types/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(@Body() dto: SignInDto): Promise<AuthResponse> {
    const result = await this.authService.signIn(dto);
    const message = 'Sign in successful';
    return {
      message: message,
      data: {
        access_token: result.session.access_token,
        token_type: result.session.token_type,
        expires_in: result.session.expires_in,
        expires_at: result.session.expires_at,
      },
    };
  }

  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    await this.authService.signUp(dto);

    return {
      message: 'Please check your email to verify your account',
      data: {
        email: dto.email,
      },
    };
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  // @Post('reset-password')
  // async resetPassword(
  //   @Auth() user: AuthUser,
  //   @Body() request: ResetPasswordDto,
  // ): Promise<any> {
  //   await this.authService.resetPassword(user, request);
  //   return {
  //     message: 'success',
  //     data: null,
  //   };
  // }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  // @Put('profile')
  // async updateProfile(
  //   @Auth() user: AuthUser,
  //   @Body() request: UpdateProfileDto,
  // ): Promise<any> {
  //   await this.authService.updateProfile(user, request);
  //   return {
  //     message: 'success',
  //     data: null,
  //   };
  // }
}

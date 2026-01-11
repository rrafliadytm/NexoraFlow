import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/guard/auth.guard';
import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { SupabaseService } from './common/services/supabase.service';
import { Auth } from './auth/decorator/auth.decorator';
import { AuthUser } from './common/types/types';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'Welcome to API!';
  }

  @ApiBearerAuth()
  @Get('/protected')
  @UseGuards(AuthGuard)
  async protected(@Auth() user: AuthUser) {
    return {
      message: 'Protected route',
      authenticated_user: user,
    };
  }
}

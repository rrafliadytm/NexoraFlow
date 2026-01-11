import { Module } from '@nestjs/common';
import { SupabaseService } from './services/supabase.service';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './services/storage.service';
import { AuthorizationService } from './services/authorization.service';
import { EmailService } from './services/email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    SupabaseService,
    StorageService,
    AuthorizationService,
    EmailService,
  ],
  exports: [
    SupabaseService,
    StorageService,
    AuthorizationService,
    EmailService,
  ],
})
export class CommonModule {}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabaseAnonClient: SupabaseClient;
  private readonly supabaseAdminClient: SupabaseClient;

  private readonly url: string;
  private readonly anonKey: string;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.getOrThrow<string>('SUPABASE_URL');
    this.anonKey = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');
    const serviceKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_KEY',
    );

    try {
      this.supabaseAnonClient = createClient(this.url, this.anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      });

      this.supabaseAdminClient = createClient(this.url, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      });
    } catch (err: any) {
      Logger.error(
        `Failed to create Supabase clients: ${err?.message ?? err}`,
        'SupabaseService',
      );
      throw new InternalServerErrorException(
        'Failed to initialize Supabase client',
      );
    }
  }

  getAnonClient(): SupabaseClient {
    return this.supabaseAnonClient;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdminClient;
  }

  getUserClient(accessToken: string): SupabaseClient {
    if (!accessToken) {
      throw new InternalServerErrorException('Missing access token');
    }

    return createClient(this.url, this.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }
}

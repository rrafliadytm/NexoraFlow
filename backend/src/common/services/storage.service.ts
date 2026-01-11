import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  private getExtFromMime(mime: string): string {
    switch (mime) {
      case 'image/png':
        return 'png';
      case 'image/jpeg':
        return 'jpg';
      case 'image/webp':
        return 'webp';
      default:
        throw new HttpException('Unsupported image type', 400);
    }
  }

  async uploadOrganizationLogo(
    organizationId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const bucket = this.configService.getOrThrow<string>(
      'SUPABASE_CLIENT_BUCKET',
    );
    const client = this.supabaseService.getAdminClient();

    const folder = `organizations/${organizationId}`;
    const newExt = this.getExtFromMime(file.mimetype);

    // 1) List existing files in the folder
    const { data: existing, error: existingError } = await client.storage
      .from(bucket)
      .list(folder, { limit: 100, search: 'logo' });

    if (existingError) throw new HttpException(existingError.message, 500);

    // 2) Remove any existing logo.* (logo.png/jpg/webp/etc)
    const toRemove = (existing ?? [])
      .filter((x) => x.name?.toLowerCase().startsWith('logo.'))
      .map((x) => `${folder}/${x.name}`);

    if (toRemove.length > 0) {
      const { error: removeError } = await client.storage
        .from(bucket)
        .remove(toRemove);
      if (removeError) throw new HttpException(removeError.message, 500);
    }

    // 3) Upload new logo
    const objectPath = `${folder}/logo.${newExt}`;

    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) throw new HttpException(uploadError.message, 500);

    return objectPath;
  }
}

import { SetMetadata } from '@nestjs/common';

export const REQUIRE_OWNER_KEY = 'require_owner';

export const RequireOwner = () => SetMetadata(REQUIRE_OWNER_KEY, true);

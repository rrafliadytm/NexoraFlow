export interface AuthUser {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email: string;
  phone: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  role: string;
  aal: string;
  amr: AuthMethod[];
  session_id: string;
  is_anonymous: boolean;
  access_token: string;
}

interface UserMetadata {
  tenant_id: string;
  avatar_url: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  name: string;
  phone_verified: boolean;
  sub: string;
}

interface AppMetadata {
  provider: string;
  providers: string[];
}

interface AuthMethod {
  method: string;
  timestamp: number;
}

export interface AuthResponse {
  message: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number | undefined;
  };
}

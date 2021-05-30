export type JWTToken = string;

export type RefreshToken = string;

export interface JWTTokenClaims {
  userId: string;
  isEmailVerified: boolean;
  email: string;
  adminUser: boolean;
  sessionId?: string;
}

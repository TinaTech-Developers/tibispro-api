// lib/types/auth.ts
export type AuthToken = {
  userId: string;
  orgId: string;
  email?: string;
  role?: string;
};

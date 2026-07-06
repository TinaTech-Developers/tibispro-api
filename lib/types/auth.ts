export type AuthRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";

export type AuthToken = {
  userId: string;
  role: AuthRole;
  orgId: string | null;
  email?: string;
};

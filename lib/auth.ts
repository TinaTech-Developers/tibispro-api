import { Role } from "@prisma/client";
import { verifyToken } from "@/lib/jwt";

export type AuthPayload = {
  userId: string;
  orgId?: string;
  role?: Role;
};

export function getAuth(req: Request): AuthPayload {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Missing token");
  }

  const decoded: any = verifyToken(token);

  return {
    userId: decoded.userId,
    orgId: decoded.orgId,
    role: decoded.role,
  };
}

export function requireOrg(req: Request): {
  userId: string;
  orgId: string;
  role?: Role;
} {
  const auth = getAuth(req);

  if (!auth.orgId) {
    throw new Error("NO_ORGANIZATION");
  }

  return {
    userId: auth.userId,
    orgId: auth.orgId,
    role: auth.role,
  };
}

export function verifyAdmin(req: Request) {
  const auth = requireOrg(req);

  if (auth.role !== Role.ADMIN && auth.role !== Role.SUPER_ADMIN) {
    throw new Error("FORBIDDEN");
  }

  return auth;
}

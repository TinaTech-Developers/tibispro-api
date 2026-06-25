import { verifyToken } from "@/lib/jwt";

export function getAuth(req: Request) {
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
  };
}

export function requireOrg(req: Request) {
  const auth = getAuth(req);

  if (!auth.orgId) {
    throw new Error("NO_ORGANIZATION");
  }

  return auth;
}

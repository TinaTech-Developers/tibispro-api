import jwt from "jsonwebtoken";

import { AuthToken } from "@/lib/types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthToken {
  return jwt.verify(token, JWT_SECRET!) as AuthToken;
}




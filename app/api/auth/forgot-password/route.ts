import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success (security best practice)
  if (!user) {
    return NextResponse.json({ message: "If email exists, link sent" });
  }

  // 1. Generate token
  const token = crypto.randomBytes(32).toString("hex");

  // 2. Save token (15 min expiry)
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  // 3. Create deep link for mobile app
  const resetLink = `tibizpro://reset-password?token=${token}`;

  // 4. Send email
  await sendResetEmail(user.email, resetLink);

  return NextResponse.json({ message: "If email exists, link sent" });
}

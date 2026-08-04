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

  // Always return success
  if (!user) {
    return NextResponse.json({
      message: "If email exists, link sent",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  console.log("================================");
  console.log("APP_URL:", process.env.APP_URL);
  console.log("TOKEN:", token);

  const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

  console.log("RESET LINK:", resetLink);
  console.log("================================");

  await sendResetEmail(user.email, resetLink);

  return NextResponse.json({
    message: "If email exists, link sent",
  });
}

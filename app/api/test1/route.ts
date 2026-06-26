import { NextResponse } from "next/server";
import { sendResetEmail } from "@/lib/mailer";

export async function GET() {
  await sendResetEmail(
    "tinashephiri0@gmail.com",
    "https://tibizpro.app/reset-password/token123",
  );

  return NextResponse.json({
    message: "Test email sent",
  });
}

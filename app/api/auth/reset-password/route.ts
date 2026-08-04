import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = body.token?.trim();
    const password = body.password?.trim();

    console.log("RESET REQUEST RECEIVED");
    console.log("TOKEN:", token);
    console.log("PASSWORD LENGTH:", password?.length);

    if (!token || !password) {
      return NextResponse.json(
        {
          error: "Token and password are required.",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must be at least 8 characters.",
        },
        {
          status: 400,
        },
      );
    }

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    if (!resetToken) {
      console.log("RESET TOKEN NOT FOUND");

      return NextResponse.json(
        {
          error: "Invalid reset link.",
        },
        {
          status: 400,
        },
      );
    }

    // Check expiration
    if (resetToken.expiresAt.getTime() < Date.now()) {
      await prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      });

      return NextResponse.json(
        {
          error: "Reset link has expired.",
        },
        {
          status: 400,
        },
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        id: resetToken.userId,
      },
    });

    if (!user) {
      console.log("USER NOT FOUND");

      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    console.log("RESETTING PASSWORD FOR:", user.email);

    // Generate bcrypt hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Verify generated hash before saving
    const passwordCheck = await bcrypt.compare(password, passwordHash);

    console.log("PASSWORD HASH CREATED:", passwordHash);
    console.log("HASH VERIFICATION:", passwordCheck);

    if (!passwordCheck) {
      return NextResponse.json(
        {
          error: "Password encryption failed.",
        },
        {
          status: 500,
        },
      );
    }

    // Update password and remove token together
    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash: passwordHash,
        },
      }),

      prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      }),
    ]);

    console.log("PASSWORD UPDATED SUCCESSFULLY FOR:", user.email);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const payments = await prisma.subscriptionPayment.findMany({
      where:
        status ?
          {
            status: status as any,
          }
        : undefined,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            plan: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(payments);
  } catch (err: any) {
    console.error("===== SUBSCRIPTION PAYMENTS ERROR =====");
    console.error(err);

    return NextResponse.json(
      {
        error: err?.message ?? "Unknown error",
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

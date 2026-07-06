import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 🔥 fetch actual user (because role is in DB, not auth)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const payments = await prisma.subscriptionPayment.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
      },
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
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}

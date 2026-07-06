import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: {}, // 👈 no status updates anymore
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Bulk update failed" },
      { status: 500 },
    );
  }
}

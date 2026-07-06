import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

// ================= PATCH USER =================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const admin = await verifyAdmin(req);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params; // 👈 FIX HERE
    const body = await req.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.role && { role: body.role }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update user" },
      { status: 500 },
    );
  }
}

// ================= DELETE USER =================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const admin = await verifyAdmin(req);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params; // 👈 FIX HERE

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete user" },
      { status: 500 },
    );
  }
}

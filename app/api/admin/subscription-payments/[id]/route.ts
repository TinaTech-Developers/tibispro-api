import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { Plan, PaymentStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { status, notes } = body;

    // ✅ validate enum properly
    if (!Object.values(PaymentStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 1. Update payment
    const payment = await prisma.subscriptionPayment.update({
      where: { id },
      data: {
        status,
        processedAt: new Date(),
        processedBy: userId,
        notes,
      },
    });

    // 2. Upgrade org ONLY when payment is PAID
    if (status === PaymentStatus.PAID) {
      await prisma.organization.update({
        where: { id: payment.organizationId },
        data: {
          plan: Plan.PRO,
        },
      });
    }

    return NextResponse.json({
      message: `Payment marked as ${status.toLowerCase()}`,
      payment,
    });
  } catch (err) {
    console.error("PATCH PAYMENT ERROR:", err);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

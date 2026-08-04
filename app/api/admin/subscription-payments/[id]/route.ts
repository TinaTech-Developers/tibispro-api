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
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        },
      );
    }

    const body = await req.json();

    const { status, notes } = body;

    // Validate payment status
    if (!Object.values(PaymentStatus).includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status",
        },
        {
          status: 400,
        },
      );
    }

    // Find payment first
    const existingPayment = await prisma.subscriptionPayment.findUnique({
      where: {
        id,
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        {
          error: "Payment not found",
        },
        {
          status: 404,
        },
      );
    }

    // Update payment
    const payment = await prisma.subscriptionPayment.update({
      where: {
        id,
      },

      data: {
        status,

        processedAt: new Date(),

        processedBy: userId,

        notes,
      },
    });

    // If approved, activate PRO for 30 days
    if (status === PaymentStatus.PAID) {
      const subscriptionEndsAt = new Date();

      subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);

      await prisma.organization.update({
        where: {
          id: payment.organizationId,
        },

        data: {
          plan: Plan.PRO,

          subscriptionEndsAt,
        },
      });

      console.log(
        `Organization ${payment.organizationId} activated PRO until ${subscriptionEndsAt}`,
      );
    }

    return NextResponse.json({
      message: `Payment marked as ${status.toLowerCase()}`,

      payment,
    });
  } catch (err) {
    console.error("PATCH PAYMENT ERROR:", err);

    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}

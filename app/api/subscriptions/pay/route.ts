import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { orgId } = getAuth(req);

    // Ensure orgId exists
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 401 },
      );
    }

    const { phoneNumber, reference, amount } = await req.json();

    if (!phoneNumber || !reference) {
      return NextResponse.json(
        {
          error: "Phone number and reference are required",
        },
        {
          status: 400,
        },
      );
    }

    const payment = await prisma.subscriptionPayment.create({
      data: {
        organizationId: orgId,
        phoneNumber,
        reference,
        amount: Number(amount ?? 5),
        status: PaymentStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment submitted successfully",
      payment,
    });
  } catch (err: any) {
    console.error("SUB PAY ERROR:", err);

    return NextResponse.json(
      {
        error: err.message || "Failed to submit payment",
      },
      {
        status: 500,
      },
    );
  }
}

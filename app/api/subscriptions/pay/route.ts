import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { orgId } = getAuth(req);

    const body = await req.json();
    const { phoneNumber, reference, amount } = body;

    if (!phoneNumber || !reference) {
      return NextResponse.json(
        { error: "Phone number and reference are required" },
        { status: 400 },
      );
    }

    const payment = await prisma.subscriptionPayment.create({
      data: {
        organizationId: orgId,
        phoneNumber,
        reference,
        amount: amount ?? 5,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Payment submitted successfully",
      payment,
    });
  } catch (err: any) {
    console.error("SUB PAY ERROR:", err);

    return NextResponse.json(
      { error: "Failed to submit payment" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { orgId } = getAuth(req);

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 },
      );
    }

    const { phoneNumber, reference, amount } = await req.json();

    const payment = await prisma.subscriptionPayment.create({
      data: {
        organizationId: orgId,
        phoneNumber,
        reference,
        amount,
      },
    });

    return NextResponse.json({
      message: "Payment submitted successfully",
      payment,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

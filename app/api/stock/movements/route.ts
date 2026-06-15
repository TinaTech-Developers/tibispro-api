import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const decoded: any = verifyToken(token!);

    const movements = await prisma.stockMovement.findMany({
      where: {
        organizationId: decoded.orgId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ movements });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch stock movements" },
      { status: 500 },
    );
  }
}

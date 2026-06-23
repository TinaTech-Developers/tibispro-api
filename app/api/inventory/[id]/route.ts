import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = verifyToken(token);

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        organizationId: decoded.orgId, // ✅ FIXED
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.log("PRODUCT GET ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
 

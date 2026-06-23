import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export function GET(req: Request, { params }: { params: { id: string } }) {
  return new Promise(async (resolve) => {
    try {
      const auth = req.headers.get("authorization");
      const token = auth?.split(" ")[1];

      if (!token) {
        return resolve(
          NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        );
      }

      const decoded = verifyToken(token) as any;

      const product = await prisma.product.findFirst({
        where: {
          id: params.id,
          organizationId: decoded.organizationId,
        },
      });

      return resolve(NextResponse.json({ product }));
    } catch (err) {
      console.log("GET PRODUCT ERROR:", err);

      return resolve(
        NextResponse.json(
          { error: "Failed to fetch product" },
          { status: 500 },
        ),
      );
    }
  });
}

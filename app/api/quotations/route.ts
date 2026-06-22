import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const { customerId, items, validUntil, quotationNumber } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer is required" },
        { status: 400 },
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 },
      );
    }

    let quotationTotal = 0;

    const formattedItems = items.map((item: any) => {
      const quantity = Number(item.qty || item.quantity || 0);
      const price = Number(item.price || 0);

      const itemTotal = quantity * price;

      quotationTotal += itemTotal;

      return {
        productId: item.productId ?? null,
        name: item.productId ? null : item.name,
        quantity,
        price,
        total: itemTotal,
      };
    });

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: quotationNumber || `QUO-${Date.now()}`,

        customerId,
        organizationId: decoded.orgId,

        status: "DRAFT",
        total: quotationTotal,

        validUntil: validUntil ? new Date(validUntil) : null,

        items: {
          create: formattedItems,
        },
      },

      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        quotation,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("QUOTATION ERROR FULL:", err);

    return NextResponse.json(
      {
        error: err.message || "Failed to create quotation",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = verifyToken(token);

    const quotations = await prisma.quotation.findMany({
      where: { organizationId: decoded.orgId },
      include: {
        customer: true,
        items: {
          include: {
            product: true, // ✅ FIX ADDED
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// export async function GET(req: Request) {
//   try {
//     const auth = req.headers.get("authorization");
//     const token = auth?.split(" ")[1];

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded: any = verifyToken(token);

//     const quotations = await prisma.quotation.findMany({
//       where: {
//         organizationId: decoded.orgId,
//       },
//       include: {
//         customer: true,
//         items: {
//           include: {
//             product: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json({
//       quotations,
//     });
//   } catch (err: any) {
//     console.error("FETCH QUOTATIONS ERROR:", err);

//     return NextResponse.json(
//       {
//         error: "Failed to fetch quotations",
//       },
//       { status: 500 },
//     );
//   }
// }

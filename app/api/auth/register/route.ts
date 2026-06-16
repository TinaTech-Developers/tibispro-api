import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return NextResponse.json({
      message: "Account created",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return NextResponse.json(
      {
        error: "Server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";

// export async function POST(req: Request) {
//   try {
//     const { name, email, password, organizationName, currency, country } =
//       await req.json();

//     if (!name || !email || !password || !organizationName) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 },
//       );
//     }

//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         { error: "User already exists" },
//         { status: 400 },
//       );
//     }

//     const passwordHash = await bcrypt.hash(password, 10);

//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         passwordHash,

//         organization: {
//           create: {
//             name: organizationName,
//             currency,
//             country,
//             isSetupComplete: true, // because onboarding is done immediately here
//           },
//         },
//       },
//       include: {
//         organization: true,
//       },
//     });

//     return NextResponse.json({
//       message: "Account created",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         organization: user.organization,
//       },
//     });
//   } catch (err) {
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

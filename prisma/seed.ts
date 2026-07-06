import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "tibizpro.app@gmail.com"; // change this if you want

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("✅ Super Admin already exists");
    return;
  }

  const passwordHash = await bcrypt.hash("Ti20011998#@!", 10);

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      organizationId: null,
    },
  });

  console.log("🚀 Super Admin created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

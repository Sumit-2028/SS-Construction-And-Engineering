import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Usage: set ADMIN_EMAIL and ADMIN_PASSWORD environment variables before running",
    );
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash: hash },
    });

    console.log(`Password updated for user: ${user.email}`);
  } catch (err) {
    console.error("Failed to update password:", err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith("reset-admin-password.mjs")
) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

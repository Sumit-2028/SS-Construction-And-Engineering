import { prisma } from "../src/lib/db/prisma.js";

async function main() {
  try {
    const count = await prisma.user.count();
    console.log("Users count:", count);
  } catch (err) {
    console.error("Prisma error:", err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const email = process.argv[2]?.trim().toLowerCase();

async function main() {
  if (!email) throw new Error("Usage: npm run make-admin -- you@example.com");
  const user = await db.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`${user.email} is now an admin`);
}

main().catch((e) => { console.error(e.message); process.exitCode = 1; }).finally(() => db.$disconnect());

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { name: "tech" },
    update: {},
    create: { name: "tech" },
  });

  await prisma.role.upsert({
    where: { name: "recruiter" },
    update: {},
    create: { name: "recruiter" },
  });

  await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  console.log("Seed complete: roles tech/recruiter/admin created or already present.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

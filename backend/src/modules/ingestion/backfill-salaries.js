import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { normalizeSalaryRange } from "./ingestion.utils.js";

const prisma = new PrismaClient();

async function main() {
  const offers = await prisma.offer.findMany({
    select: {
      id: true,
      salaryMin: true,
      salaryMax: true,
      rawPayload: true,
    },
  });

  let updated = 0;
  let unchanged = 0;

  for (const offer of offers) {
    const salary = normalizeSalaryRange(offer.rawPayload?.details?.salary);
    const nextMin = salary.min;
    const nextMax = salary.max;

    if (offer.salaryMin === nextMin && offer.salaryMax === nextMax) {
      unchanged += 1;
      continue;
    }

    await prisma.offer.update({
      where: { id: offer.id },
      data: {
        salaryMin: nextMin,
        salaryMax: nextMax,
      },
    });

    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        total: offers.length,
        updated,
        unchanged,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

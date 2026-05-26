import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { fetchAllWeloveDevsJobs } from "./welovedevs.client.js";
import { mapWeloveDevsJobToOffer } from "./welovedevs.mapper.js";

const prisma = new PrismaClient();

function createInitialStats() {
  return {
    offersFetched: 0,
    offersInserted: 0,
    offersUpdated: 0,
    offersSkipped: 0,
  };
}

function buildResult(run, stats) {
  return {
    runId: run.id,
    source: run.source,
    status: run.status,
    ...stats,
    finishedAt: run.finishedAt,
  };
}

async function upsertOffer(offer, stats) {
  if (!offer.externalId || !offer.title) {
    stats.offersSkipped += 1;
    return;
  }

  const existingBySourceId = await prisma.offer.findUnique({
    where: {
      source_externalId: {
        source: offer.source,
        externalId: offer.externalId,
      },
    },
  });

  if (existingBySourceId) {
    await prisma.offer.update({
      where: { id: existingBySourceId.id },
      data: offer,
    });
    stats.offersUpdated += 1;
    return;
  }

  const obviousDuplicate = await prisma.offer.findFirst({
    where: {
      title: offer.title,
      companyName: offer.companyName,
      location: offer.location,
      contractType: offer.contractType,
    },
  });

  if (obviousDuplicate) {
    stats.offersSkipped += 1;
    return;
  }

  await prisma.offer.create({
    data: offer,
  });
  stats.offersInserted += 1;
}

export async function syncWeloveDevsJobs() {
  const run = await prisma.ingestionRun.create({
    data: {
      source: "welovedevs",
      status: "running",
    },
  });

  const stats = createInitialStats();

  try {
    const jobs = await fetchAllWeloveDevsJobs();
    stats.offersFetched = jobs.length;

    for (const job of jobs) {
      const mappedOffer = mapWeloveDevsJobToOffer(job);
      await upsertOffer(mappedOffer, stats);
    }

    const completedRun = await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        ...stats,
      },
    });

    return buildResult(completedRun, stats);
  } catch (error) {
    const failedRun = await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        errorMessage: error.message,
        ...stats,
      },
    });

    error.run = buildResult(failedRun, stats);
    throw error;
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  syncWeloveDevsJobs()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

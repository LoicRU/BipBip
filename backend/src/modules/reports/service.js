import prisma from "../../lib/prisma.js";
import { AppError } from "../../utils/error.js";
import { serializeReport } from "../../utils/serializers.js";
import { ensureLocalOfferRecord } from "../offers/service.js";

async function includeReport(id) {
  return prisma.report.findUnique({
    where: { id },
    include: {
      reporterUser: true,
      reportedUser: true,
      offer: true,
    },
  });
}

export async function createReport(input, user) {
  let offerId = null;
  let reportedUserId = null;

  if (input.type === "job") {
    if (!input.jobId) {
      throw new AppError(400, "jobId is required for job reports");
    }
    const offer = await ensureLocalOfferRecord(input.jobId);
    offerId = offer.id;
  }

  if (input.type === "user") {
    if (!input.userId) {
      throw new AppError(400, "userId is required for user reports");
    }

    const reportedUser = await prisma.user.findUnique({
      where: { id: Number(input.userId) },
    });

    if (!reportedUser) {
      throw new AppError(404, "Reported user not found");
    }

    reportedUserId = reportedUser.id;
  }

  const created = await prisma.report.create({
    data: {
      type: input.type,
      title: input.title || "Signalement",
      company: input.company || "",
      description: input.description || "",
      reason: input.reason,
      status: "pending",
      reporterUserId: user.userId,
      reportedUserId,
      offerId,
    },
  });

  const result = await includeReport(created.id);
  return serializeReport(result);
}

export async function listReports() {
  const reports = await prisma.report.findMany({
    include: {
      reporterUser: true,
      reportedUser: true,
      offer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return reports.map(serializeReport);
}

export async function resolveReport(id) {
  const numericId = Number(id);
  const report = await includeReport(numericId);
  if (!report) {
    throw new AppError(404, "Report not found");
  }

  const updated = await prisma.report.update({
    where: { id: numericId },
    data: { status: "resolved" },
  });

  return serializeReport({
    ...report,
    ...updated,
  });
}

export async function deleteReport(id) {
  const numericId = Number(id);
  const report = await prisma.report.findUnique({
    where: { id: numericId },
  });

  if (!report) {
    throw new AppError(404, "Report not found");
  }

  await prisma.report.delete({ where: { id: numericId } });
  return { success: true };
}

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../utils/error.js";
import { serializeApplication } from "../../utils/serializers.js";
import { ensureLocalOfferRecord } from "../offers/service.js";

const CV_UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "applications");

function encodeCvMetadata(metadata) {
  return JSON.stringify(metadata);
}

function parseCvMetadata(value) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return {
      storedName: value,
      originalName: value,
    };
  }

  return null;
}

function sanitizeFilename(filename) {
  return String(filename || "cv")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-120);
}

async function storeCvFile(file) {
  if (!file) {
    return "";
  }

  await mkdir(CV_UPLOAD_DIR, { recursive: true });

  const extension = path.extname(file.originalname || "").slice(0, 10).toLowerCase();
  const storedName = `${Date.now()}-${randomUUID()}${extension}`;
  const destination = path.join(CV_UPLOAD_DIR, storedName);

  await writeFile(destination, file.buffer);

  return encodeCvMetadata({
    storedName,
    originalName: sanitizeFilename(file.originalname || `cv${extension || ".pdf"}`),
    mimeType: file.mimetype || "application/octet-stream",
    size: file.size || 0,
  });
}

async function includeApplication(id) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      offer: true,
      applicant: {
        include: { role: true },
      },
    },
  });
}

export async function createApplication(input, user, file) {
  const applicant = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { role: true },
  });

  if (!applicant) {
    throw new AppError(404, "User not found");
  }

  const offer = await ensureLocalOfferRecord(input.offerId);

  const existing = await prisma.application.findFirst({
    where: {
      offerId: offer.id,
      applicantId: applicant.id,
    },
  });

  if (existing) {
    throw new AppError(409, "Application already exists");
  }

  const storedCv = await storeCvFile(file);

  const created = await prisma.application.create({
    data: {
      offerId: offer.id,
      applicantId: applicant.id,
      candidateName: applicant.name || applicant.email,
      candidateEmail: applicant.email,
      candidatePhone: input.candidatePhone || "",
      coverLetter: input.coverLetter || "",
      cv: storedCv || input.cv || "",
      aiInterview: input.aiInterview ?? null,
      status: "pending",
    },
  });

  const result = await includeApplication(created.id);
  return serializeApplication(result);
}

export async function getApplicationCv(id, user) {
  const numericId = Number(id);
  const application = await prisma.application.findUnique({
    where: { id: numericId },
    include: {
      offer: true,
    },
  });

  if (!application) {
    throw new AppError(404, "Application not found");
  }

  const isApplicant = application.applicantId === user.userId;
  const ownsOffer = application.offer?.ownerId === user.userId;
  const isAdmin = user.role === "admin";

  if (!isApplicant && !ownsOffer && !isAdmin) {
    throw new AppError(403, "Forbidden");
  }

  const metadata = parseCvMetadata(application.cv);

  if (!metadata?.storedName) {
    throw new AppError(404, "CV not found");
  }

  return {
    path: path.join(CV_UPLOAD_DIR, metadata.storedName),
    filename: metadata.originalName || metadata.storedName,
  };
}

export async function listMyApplications(user) {
  const applications = await prisma.application.findMany({
    where: {
      applicantId: user.userId,
    },
    include: {
      offer: true,
      applicant: {
        include: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return applications.map(serializeApplication);
}

export async function removeMyApplication(id, user) {
  const numericId = Number(id);
  const application = await prisma.application.findUnique({
    where: { id: numericId },
  });

  if (!application) {
    throw new AppError(404, "Application not found");
  }

  if (application.applicantId !== user.userId && user.role !== "admin") {
    throw new AppError(403, "Forbidden");
  }

  await prisma.application.delete({ where: { id: numericId } });
  return { success: true };
}

export async function listRecruiterApplications(user) {
  const where =
    user.role === "admin"
      ? {}
      : {
          offer: {
            ownerId: user.userId,
          },
        };

  const applications = await prisma.application.findMany({
    where,
    include: {
      offer: true,
      applicant: {
        include: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return applications.map(serializeApplication);
}

export async function updateApplicationStatus(id, status, user) {
  const numericId = Number(id);
  const application = await prisma.application.findUnique({
    where: { id: numericId },
    include: {
      offer: true,
      applicant: {
        include: { role: true },
      },
    },
  });

  if (!application) {
    throw new AppError(404, "Application not found");
  }

  const ownsOffer = application.offer?.ownerId === user.userId;
  if (user.role !== "admin" && !ownsOffer) {
    throw new AppError(403, "Forbidden");
  }

  const updated = await prisma.application.update({
    where: { id: numericId },
    data: { status },
    include: {
      offer: true,
      applicant: {
        include: { role: true },
      },
    },
  });

  return serializeApplication(updated);
}

import { randomUUID } from "node:crypto";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../utils/error.js";
import { serializeOffer } from "../../utils/serializers.js";
import { normalizeSalaryRange } from "../ingestion/ingestion.utils.js";
import { getJobById, getJobsPage } from "../api/api_get.js";

function parseSalaryString(value) {
  if (!value) {
    return { min: null, max: null };
  }

  const matches = Array.from(String(value).matchAll(/(\d+(?:[.,]\d+)?)\s*k?/gi))
    .map((entry) => Math.round(Number(entry[1].replace(",", ".")) * 1000))
    .filter(Number.isFinite);

  if (matches.length === 0) {
    return { min: null, max: null };
  }

  if (matches.length === 1) {
    return { min: matches[0], max: matches[0] };
  }

  const [first, second] = matches;
  return {
    min: Math.min(first, second),
    max: Math.max(first, second),
  };
}

function normalizeCompanyName(value) {
  return String(value ?? "").trim();
}

function resolveOfferCompanyName(input, user) {
  const explicitCompany = normalizeCompanyName(input.companyName);

  if (explicitCompany) {
    return explicitCompany;
  }

  const recruiterName = normalizeCompanyName(user?.name);

  if (recruiterName) {
    return recruiterName;
  }

  const recruiterEmail = normalizeCompanyName(user?.email);

  if (recruiterEmail) {
    return recruiterEmail.split("@")[0];
  }

  return "Entreprise confidentielle";
}

async function getOfferOwner(userId) {
  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!owner) {
    throw new AppError(404, "User not found");
  }

  return owner;
}

function mapRemoteJobSummary(job) {
  const salary = normalizeSalaryRange(job.details?.salary);
  const remoteMode =
    job.details?.remotePolicy?.frequency ??
    job.details?.acceptRemote ??
    "unknown";

  return {
    id: String(job.id ?? job.objectID),
    source: "welovedevs",
    ownerId: null,
    status: "active",
    title: job.title ?? "Untitled offer",
    description:
      job.descriptionPreview ??
      job.rawDescription ??
      job.description ??
      "",
    company: job.smallCompany?.companyName ?? "Unknown company",
    companyName: job.smallCompany?.companyName ?? "Unknown company",
    location: job.formattedPlaces?.[0] ?? "Unknown location",
    type: job.contractTypes?.[0] ?? "unknown",
    contractType: job.contractTypes?.[0] ?? "unknown",
    remote:
      String(remoteMode).toLowerCase().includes("remote") ||
      String(remoteMode).toLowerCase().includes("hybrid"),
    remoteMode,
    postedDate: job.publishDate ?? null,
    publishedAt: job.publishDate ?? null,
    salary:
      salary.min || salary.max
        ? `${Math.round((salary.min ?? salary.max) / 1000)}k - ${Math.round((salary.max ?? salary.min) / 1000)}k EUR`
        : "",
    salaryRange: salary,
    skills: (job.skillsList ?? []).map((skill) => skill.name).filter(Boolean),
    requirements: (job.skillsList ?? []).map((skill) => skill.name).filter(Boolean),
    benefits: [],
    experience: null,
    hasAiTest: false,
    aiQuestions: [],
    raw: job,
  };
}

function buildStoredRemoteOffer(job) {
  const salary = normalizeSalaryRange(job.details?.salary);

  return {
    externalId: String(job.id ?? job.objectID),
    source: "welovedevs",
    title: job.title ?? "Untitled offer",
    description:
      job.description ??
      job.rawDescription ??
      job.descriptionPreview ??
      "",
    companyName: job.smallCompany?.companyName ?? "Unknown company",
    location: job.formattedPlaces?.[0] ?? "Unknown location",
    contractType: job.contractTypes?.[0] ?? "unknown",
    publishedAt: job.publishDate ? new Date(job.publishDate) : new Date(),
    salaryMin: salary.min,
    salaryMax: salary.max,
    remoteMode:
      job.details?.remotePolicy?.frequency ??
      job.details?.acceptRemote ??
      "unknown",
    status: "linked",
    rawPayload: {
      skills: (job.skillsList ?? []).map((skill) => skill.name).filter(Boolean),
      requirements: (job.skillsList ?? []).map((skill) => skill.name).filter(Boolean),
      benefits: [],
      experience: null,
      hasAiTest: false,
      aiQuestions: [],
      remoteJob: true,
    },
  };
}

function buildOfferWhere(filters, user) {
  const {
    q,
    type,
    location,
    remote,
    minSalary,
    maxSalary,
    mine,
  } = filters;

  const where = {};

  if (mine === "true") {
    if (!user) {
      throw new AppError(401, "Authentication required");
    }
    where.ownerId = user.userId;
  } else {
    where.status = "active";
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { contractType: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (type) {
    where.contractType = { contains: type, mode: "insensitive" };
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (remote) {
    const wantsRemote = remote === "true" || remote === "yes";
    if (wantsRemote) {
      where.remoteMode = { contains: "remote", mode: "insensitive" };
    } else {
      where.NOT = [
        ...(Array.isArray(where.NOT) ? where.NOT : []),
        { remoteMode: { contains: "remote", mode: "insensitive" } },
      ];
    }
  }

  if (minSalary !== undefined || maxSalary !== undefined) {
    where.AND = [];

    if (minSalary !== undefined) {
      where.AND.push({ salaryMax: { gte: Number(minSalary) } });
    }

    if (maxSalary !== undefined) {
      where.AND.push({ salaryMin: { lte: Number(maxSalary) } });
    }
  }

  return where;
}

async function listOffersFromDatabase(filters, user) {
  const { page, limit } = filters;
  const where = buildOfferWhere(filters, user);
  const skip = (page - 1) * limit;

  const [total, offers] = await Promise.all([
    prisma.offer.count({ where }),
    prisma.offer.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return {
    data: offers.map(serializeOffer),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      source: "database",
    },
  };
}

async function listOffersFromRemote({ page, limit, q }) {
  const remotePage = await getJobsPage({
    page: page - 1,
    size: limit,
    q,
  });

  return {
    data: remotePage.values.map(mapRemoteJobSummary),
    meta: {
      page,
      limit,
      total: remotePage.totalCount,
      totalPages: Math.max(1, Math.ceil(remotePage.totalCount / limit)),
      source: "welovedevs",
    },
  };
}

async function getOfferRecord(id) {
  const numericId = Number(id);

  if (Number.isInteger(numericId) && numericId > 0) {
    const offer = await prisma.offer.findUnique({
      where: { id: numericId },
    });
    if (offer) {
      return offer;
    }
  }

  if (typeof id === "string" && id.trim()) {
    return prisma.offer.findFirst({
      where: {
        externalId: id,
      },
    });
  }

  return null;
}

export async function ensureLocalOfferRecord(id) {
  const existing = await getOfferRecord(id);
  if (existing) {
    return existing;
  }

  const remoteOffer = await getJobById(id);
  if (!remoteOffer) {
    throw new AppError(404, "Offer not found");
  }

  const stored = await prisma.offer.upsert({
    where: {
      source_externalId: {
        source: "welovedevs",
        externalId: String(remoteOffer.id ?? remoteOffer.objectID),
      },
    },
    update: buildStoredRemoteOffer(remoteOffer),
    create: buildStoredRemoteOffer(remoteOffer),
  });

  return stored;
}

function ensureOfferAccess(offer, user) {
  if (offer.status === "active") {
    return;
  }

  if (!user) {
    throw new AppError(404, "Offer not found");
  }

  const isOwner = offer.ownerId && offer.ownerId === user.userId;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(403, "Forbidden");
  }
}

function buildOfferPayload(input) {
  const salary = parseSalaryString(input.salary);
  const companyName = resolveOfferCompanyName(input);

  return {
    title: input.title,
    description: input.description,
    companyName,
    location: input.location,
    contractType: input.type,
    remoteMode: input.remote ? "remote" : "on-site",
    salaryMin: salary.min,
    salaryMax: salary.max,
    status: input.status ?? "active",
    publishedAt: new Date(),
    rawPayload: {
      requirements: input.requirements ?? [],
      benefits: input.benefits ?? [],
      experience: input.experience ?? "",
      hasAiTest: Boolean(input.hasAiTest),
      aiQuestions: input.aiQuestions ?? [],
      skills: input.requirements ?? [],
      company: companyName,
    },
  };
}

export async function listOffers(filters, user) {
  const databaseResult = await listOffersFromDatabase(filters, user);

  if (databaseResult.meta.total > 0 || filters.mine === "true") {
    return databaseResult;
  }

  try {
    return await listOffersFromRemote(filters);
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Remote offers fallback:", error.message);
    }
  }

  return databaseResult;
}

export async function getOfferById(id, user) {
  const offer = await getOfferRecord(id);

  if (offer) {
    ensureOfferAccess(offer, user);
    return serializeOffer(offer);
  }

  try {
    const remoteOffer = await getJobById(id);
    if (remoteOffer) {
      return mapRemoteJobSummary(remoteOffer);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Remote offer lookup fallback:", error.message);
    }
  }

  throw new AppError(404, "Offer not found");
}

export async function createOffer(input, user) {
  const owner = await getOfferOwner(user.userId);
  const companyName = resolveOfferCompanyName(input, owner);
  const offer = await prisma.offer.create({
    data: {
      ...buildOfferPayload({ ...input, companyName }),
      externalId: randomUUID(),
      source: "platform",
      ownerId: owner.id,
    },
  });

  return serializeOffer(offer);
}

async function getOwnedOfferOrThrow(id, user) {
  const offer = await getOfferRecord(id);

  if (!offer) {
    throw new AppError(404, "Offer not found");
  }

  const isAdmin = user.role === "admin";
  const isOwner = offer.ownerId === user.userId;

  if (!isAdmin && !isOwner) {
    throw new AppError(403, "Forbidden");
  }

  return offer;
}

export async function updateOffer(id, input, user) {
  const existing = await getOwnedOfferOrThrow(id, user);
  const nextRaw = {
    ...(existing.rawPayload && typeof existing.rawPayload === "object" ? existing.rawPayload : {}),
  };

  if (input.requirements !== undefined) {
    nextRaw.requirements = input.requirements;
    nextRaw.skills = input.requirements;
  }

  if (input.benefits !== undefined) {
    nextRaw.benefits = input.benefits;
  }

  if (input.experience !== undefined) {
    nextRaw.experience = input.experience;
  }

  if (input.hasAiTest !== undefined) {
    nextRaw.hasAiTest = input.hasAiTest;
  }

  if (input.aiQuestions !== undefined) {
    nextRaw.aiQuestions = input.aiQuestions;
  }

  const payload = {
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    companyName: existing.companyName,
    location: input.location ?? existing.location,
    type: input.type ?? existing.contractType,
    remote: input.remote ?? String(existing.remoteMode).toLowerCase().includes("remote"),
    salary: input.salary ?? "",
    status: input.status ?? existing.status,
    requirements: nextRaw.requirements ?? [],
    benefits: nextRaw.benefits ?? [],
    experience: nextRaw.experience ?? "",
    hasAiTest: nextRaw.hasAiTest ?? false,
    aiQuestions: nextRaw.aiQuestions ?? [],
  };

  const salary = input.salary !== undefined
    ? parseSalaryString(input.salary)
    : { min: existing.salaryMin, max: existing.salaryMax };

  const updated = await prisma.offer.update({
    where: { id: existing.id },
    data: {
      title: payload.title,
      description: payload.description,
      location: payload.location,
      contractType: payload.type,
      remoteMode: payload.remote ? "remote" : "on-site",
      salaryMin: salary.min,
      salaryMax: salary.max,
      status: payload.status,
      rawPayload: nextRaw,
    },
  });

  return serializeOffer(updated);
}

export async function deleteOffer(id, user) {
  const offer = await getOwnedOfferOrThrow(id, user);
  await prisma.offer.delete({ where: { id: offer.id } });
  return { success: true };
}

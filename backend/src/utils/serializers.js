function readRawObject(rawPayload) {
  return rawPayload && typeof rawPayload === "object" ? rawPayload : {};
}

function readRawArray(rawPayload, key) {
  const value = readRawObject(rawPayload)[key];
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeQuestionCollection(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(normalizeQuestionCollection);
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .sort(([left], [right]) => {
        const leftMatch = left.match(/(\d+)$/);
        const rightMatch = right.match(/(\d+)$/);

        if (!leftMatch || !rightMatch) {
          return left.localeCompare(right);
        }

        return Number(leftMatch[1]) - Number(rightMatch[1]);
      })
      .flatMap(([, nestedValue]) => normalizeQuestionCollection(nestedValue));
  }

  return [];
}

function normalizeQuestionText(value) {
  return normalizeQuestionCollection(value).join("\n");
}

function normalizeAiInterview(aiInterview) {
  if (!aiInterview || typeof aiInterview !== "object") {
    return null;
  }

  const answers = Array.isArray(aiInterview.answers)
    ? aiInterview.answers.map((item) => ({
        ...item,
        question: normalizeQuestionText(item?.question),
        answer: typeof item?.answer === "string" ? item.answer : "",
      }))
    : [];

  return {
    ...aiInterview,
    answers,
    feedback: typeof aiInterview.feedback === "string" ? aiInterview.feedback : "",
    summary: typeof aiInterview.summary === "string" ? aiInterview.summary : "",
    strengths: Array.isArray(aiInterview.strengths) ? aiInterview.strengths.filter(Boolean) : [],
    weaknesses: Array.isArray(aiInterview.weaknesses) ? aiInterview.weaknesses.filter(Boolean) : [],
  };
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
      originalName: value,
    };
  }

  return null;
}

function isRemote(remoteMode) {
  const value = String(remoteMode ?? "").toLowerCase();
  return (
    value.includes("remote") ||
    value.includes("hybrid") ||
    value.includes("part") ||
    value === "true"
  );
}

function formatSalaryLabel(salaryMin, salaryMax) {
  if (!salaryMin && !salaryMax) {
    return "";
  }

  const min = salaryMin ? Math.round(salaryMin / 1000) : null;
  const max = salaryMax ? Math.round(salaryMax / 1000) : null;

  if (min && max) {
    return `${min}k - ${max}k EUR`;
  }

  if (min) {
    return `${min}k EUR+`;
  }

  return `${max}k EUR`;
}

export function serializeUser(user) {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email,
    role: user.role?.name ?? user.role ?? null,
    status: user.status ?? "active",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function serializeOffer(offer) {
  const raw = readRawObject(offer.rawPayload);
  const publishedAt = offer.publishedAt?.toISOString() ?? offer.createdAt?.toISOString() ?? null;
  const company = offer.companyName ?? raw.company ?? "Entreprise inconnue";
  const contractType = offer.contractType ?? raw.type ?? "unknown";
  const remoteMode = offer.remoteMode ?? raw.remoteMode ?? "unknown";
  const publicId =
    offer.source === "welovedevs" && offer.externalId
      ? String(offer.externalId)
      : String(offer.id);
  const requirements =
    readRawArray(raw, "requirements").length > 0
      ? readRawArray(raw, "requirements")
      : readRawArray(raw, "skills");
  const benefits = readRawArray(raw, "benefits");
  const aiQuestions = normalizeQuestionCollection(raw.aiQuestions);

  return {
    id: publicId,
    internalId: String(offer.id),
    source: offer.source,
    ownerId: offer.ownerId ?? null,
    status: offer.status ?? "active",
    title: offer.title,
    description: offer.description,
    company,
    companyName: company,
    location: offer.location,
    type: contractType,
    contractType,
    remote: isRemote(remoteMode),
    remoteMode,
    postedDate: publishedAt,
    publishedAt,
    salary: formatSalaryLabel(offer.salaryMin, offer.salaryMax),
    salaryRange: {
      min: offer.salaryMin ?? null,
      max: offer.salaryMax ?? null,
    },
    skills: readRawArray(raw, "skills"),
    requirements,
    benefits,
    experience: raw.experience ?? null,
    hasAiTest: Boolean(raw.hasAiTest),
    aiQuestions,
    raw,
  };
}

export function serializeApplication(application) {
  const offer = application.offer ? serializeOffer(application.offer) : null;
  const cvMetadata = parseCvMetadata(application.cv);
  const cvName = cvMetadata?.originalName || application.cv || "";

  return {
    id: String(application.id),
    jobId: offer?.id ?? String(application.offerId),
    offerId: String(application.offerId),
    jobTitle: offer?.title ?? application.offer?.title ?? "Offre indisponible",
    company: offer?.company ?? application.offer?.companyName ?? "Entreprise inconnue",
    candidateName: application.candidateName,
    candidateEmail: application.candidateEmail,
    candidatePhone: application.candidatePhone ?? "",
    coverLetter: application.coverLetter ?? "",
    cv: cvName,
    cvName,
    cvDownloadUrl: application.cv ? `/api/applications/${application.id}/cv` : "",
    aiInterview: normalizeAiInterview(application.aiInterview),
    status: application.status ?? "pending",
    date: application.createdAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    offer,
    applicant: application.applicant ? serializeUser(application.applicant) : null,
  };
}

export function serializeSupportTicket(ticket) {
  return {
    id: String(ticket.id),
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    resolvedAt: ticket.resolvedAt ?? null,
    userId: ticket.userId ? String(ticket.userId) : null,
    userType: ticket.user?.role?.name ?? null,
    userName: ticket.user?.name ?? "",
    email: ticket.user?.email ?? "",
  };
}

export function serializeReport(report) {
  return {
    id: String(report.id),
    type: report.type,
    title: report.title ?? "Signalement",
    company: report.company ?? "",
    description: report.description ?? "",
    reason: report.reason,
    status: report.status,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    jobId: report.offerId ? String(report.offerId) : null,
    userId: report.reportedUserId ? String(report.reportedUserId) : null,
    userName: report.reportedUser?.name ?? "",
    email: report.reportedUser?.email ?? "",
    reportedBy: report.reporterUser?.name || report.reporterUser?.email || "Utilisateur inconnu",
  };
}

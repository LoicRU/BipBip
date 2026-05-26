import {
  normalizeNullableString,
  normalizeSalaryRange,
  toDateFromWeloveDevsTimestamp,
} from "./ingestion.utils.js";

function normalizeRequiredString(value, fallback) {
  return normalizeNullableString(value) ?? fallback;
}

export function mapWeloveDevsJobToOffer(job) {
  const salary = normalizeSalaryRange(job.details?.salary);
  const externalId = normalizeRequiredString(job.id ?? job.objectID, "");
  const title = normalizeRequiredString(job.title, "Untitled offer");
  const description =
    normalizeNullableString(job.description) ??
    normalizeNullableString(job.rawDescription) ??
    normalizeNullableString(job.descriptionPreview) ??
    "No description provided.";

  return {
    externalId,
    source: "welovedevs",
    title,
    description,
    companyName: normalizeRequiredString(
      job.smallCompany?.companyName,
      "Unknown company"
    ),
    location: normalizeRequiredString(
      job.formattedPlaces?.[0],
      "Unknown location"
    ),
    contractType: normalizeRequiredString(
      job.contractTypes?.[0],
      "unknown"
    ),
    publishedAt: toDateFromWeloveDevsTimestamp(job.publishDate),
    salaryMin: salary.min,
    salaryMax: salary.max,
    remoteMode:
      normalizeNullableString(job.details?.remotePolicy?.frequency) ??
      normalizeNullableString(job.details?.acceptRemote),
    rawPayload: job,
  };
}

import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL ?? "https://epi-api.welovedevs.com";
const API_KEY = process.env.API_KEY ?? "";
const DEFAULT_PAGE_SIZE = 100;
const RATE_LIMIT_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildJobsUrl({ page = 0, size = DEFAULT_PAGE_SIZE, q } = {}) {
  const url = new URL("/v1", API_URL);

  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  if (q) {
    url.searchParams.set("q", q);
  }

  return url;
}

async function apiGetPage({ page = 0, size = DEFAULT_PAGE_SIZE, q } = {}) {
  if (!API_KEY) {
    throw new Error("Missing WeLoveDevs API key");
  }

  const response = await fetch(buildJobsUrl({ page, size, q }), {
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    }
  });

  if (response.status === 403) {
    throw new Error("WeLoveDevs API key invalid or missing");
  }

  if (response.status === 429) {
    throw new Error("WeLoveDevs rate limit reached");
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WeLoveDevs API error: ${response.status} - ${body}`);
  }

  const data = await response.json();

  return {
    totalCount: Number(data.totalCount ?? 0),
    values: Array.isArray(data.values) ? data.values : [],
    page,
    size,
  };
}

export async function getJobsPage({ page = 0, size = DEFAULT_PAGE_SIZE, q } = {}) {
  return apiGetPage({ page, size, q });
}

export async function searchJobs(query, { page = 0, size = DEFAULT_PAGE_SIZE } = {}) {
  return apiGetPage({ page, size, q: query });
}

export async function getAllJobs({ size = DEFAULT_PAGE_SIZE, q } = {}) {
  const firstPage = await apiGetPage({ page: 0, size, q });
  const jobs = [...firstPage.values];
  const totalPages = Math.max(1, Math.ceil(firstPage.totalCount / size));

  for (let page = 1; page < totalPages; page += 1) {
    await sleep(RATE_LIMIT_DELAY_MS);
    const nextPage = await apiGetPage({ page, size, q });
    jobs.push(...nextPage.values);
  }

  return jobs;
}

export async function getJobById(id, { size = DEFAULT_PAGE_SIZE } = {}) {
  const jobs = await getAllJobs({ size });
  const normalizedId = String(id);
  return (
    jobs.find(
      (job) => String(job.id) === normalizedId || String(job.objectID) === normalizedId
    ) ?? null
  );
}

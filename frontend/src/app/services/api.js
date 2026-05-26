const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const TOKEN_STORAGE_KEY = "authToken";

function buildUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function request(path, options = {}) {
  const {
    auth = true,
    params,
    body,
    headers,
    method = "GET",
    raw = false,
  } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const requestHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  if (auth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error?.message ||
      payload?.error ||
      payload?.message ||
      "Request failed";
    const error = new Error(message);

    error.status = response.status;
    error.details = payload?.details || payload?.error?.details || null;

    throw error;
  }

  if (raw) {
    return payload;
  }

  return payload?.data ?? payload;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function login(payload) {
  return request("/auth/login", {
    auth: false,
    method: "POST",
    body: payload,
  });
}

export async function register(payload) {
  return request("/auth/register", {
    auth: false,
    method: "POST",
    body: payload,
  });
}

export async function fetchCurrentUser() {
  return request("/auth/me");
}

export async function updateCurrentUser(payload) {
  return request("/auth/me", {
    method: "PATCH",
    body: payload,
  });
}

export async function fetchOffers(params = {}) {
  return request("/api/offers", { params, raw: true });
}

export async function fetchOfferById(id) {
  return request(`/api/offers/${id}`);
}

export async function createOffer(payload) {
  return request("/api/offers", {
    method: "POST",
    body: payload,
  });
}

export async function updateOffer(id, payload) {
  return request(`/api/offers/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteOffer(id) {
  return request(`/api/offers/${id}`, {
    method: "DELETE",
  });
}

export async function fetchFavorites() {
  return request("/api/favorites");
}

export async function addFavorite(offerId) {
  return request(`/api/favorites/${offerId}`, {
    method: "POST",
  });
}

export async function removeFavorite(offerId) {
  return request(`/api/favorites/${offerId}`, {
    method: "DELETE",
  });
}

export async function createApplication(payload) {
  const formData = new FormData();

  formData.set("offerId", payload.offerId);
  formData.set("coverLetter", payload.coverLetter || "");
  formData.set("candidatePhone", payload.candidatePhone || "");

  if (payload.aiInterview) {
    formData.set("aiInterview", JSON.stringify(payload.aiInterview));
  }

  if (payload.cvFile instanceof File) {
    formData.set("cvFile", payload.cvFile);
  } else if (payload.cv) {
    formData.set("cv", payload.cv);
  }

  return request("/api/applications", {
    method: "POST",
    body: formData,
  });
}

export async function fetchMyApplications() {
  return request("/api/applications/me");
}

export async function deleteApplication(id) {
  return request(`/api/applications/${id}`, {
    method: "DELETE",
  });
}

export async function fetchRecruiterApplications() {
  return request("/api/applications/recruiter");
}

export async function updateApplicationStatus(id, status) {
  return request(`/api/applications/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function downloadApplicationCv(id) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}/cv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload?.message ||
      payload?.error?.message ||
      payload?.error ||
      "Impossible de telecharger le CV";
    throw new Error(message);
  }

  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
  const filename = filenameMatch?.[1] || "cv";
  const blob = await response.blob();

  return { blob, filename };
}

export async function createSupportTicket(payload) {
  return request("/api/support/tickets", {
    method: "POST",
    body: payload,
  });
}

export async function fetchSupportTickets() {
  return request("/api/support/tickets");
}

export async function resolveSupportTicket(id) {
  return request(`/api/support/tickets/${id}/resolve`, {
    method: "PATCH",
  });
}

export async function createReport(payload) {
  return request("/api/reports", {
    method: "POST",
    body: payload,
  });
}

export async function fetchReports() {
  return request("/api/reports");
}

export async function resolveReport(id) {
  return request(`/api/reports/${id}/resolve`, {
    method: "PATCH",
  });
}

export async function deleteReport(id) {
  return request(`/api/reports/${id}`, {
    method: "DELETE",
  });
}

export async function fetchAdminUsers() {
  return request("/admin/users");
}

export async function updateAdminUserStatus(id, status) {
  return request(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function fetchAdminDashboard() {
  return request("/admin/summary");
}

export async function deleteAccount(payload) {
  return request("/auth/me", {
    method: "DELETE",
    body: payload,
  });
}

export async function generateAiCv(payload) {
  return request("/api/ai/cv", {
    method: "POST",
    body: payload,
  });
}

export async function generateAiCoverLetter(payload) {
  return request("/api/ai/cover-letter", {
    method: "POST",
    body: payload,
  });
}

export async function generateAiInterviewQuestions(payload) {
  return request("/api/ai/interview/questions", {
    method: "POST",
    body: payload,
  });
}

export async function evaluateAiInterview(payload) {
  return request("/api/ai/interview/evaluate", {
    method: "POST",
    body: payload,
  });
}

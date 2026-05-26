const STORAGE_KEY = "applications";

export const getApplications = () => {
  if (typeof window === "undefined") return [];

  const apps = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  return apps.map((app) => ({
    ...app,
    jobTitle: app.jobTitle || app.title || "Titre indisponible",
    company: app.company || "Entreprise inconnue",
    status: app.status || "pending",
    date: app.date || new Date().toISOString(),
  }));
};

export const saveApplications = (apps) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
};

export const addApplication = (application) => {
  const current = getApplications();

  const newApp = {
    id: application.id || crypto.randomUUID(),

    jobId: application.jobId,
    jobTitle: application.jobTitle,
    company: application.company,

    candidateName: application.candidateName,
    candidateEmail: application.candidateEmail,
    candidatePhone: application.candidatePhone,

    coverLetter: application.coverLetter || "",
    cv: application.cv || "",

    aiInterview: application.aiInterview || null,

    status: application.status || "pending",

    date:
      application.date || new Date().toISOString(),
  };

  const updated = [newApp, ...current];
  saveApplications(updated);
  return updated;
};

export const removeApplication = (id) => {
  const updated = getApplications().filter((a) => a.id !== id);
  saveApplications(updated);
  return updated;
};
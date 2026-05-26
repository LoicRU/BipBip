const STORAGE_KEY = "reports";

export const getReports = () => {
  if (typeof window === "undefined") return [];

  const reports = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  return reports.map((report) => ({
    id: report.id || crypto.randomUUID(),

    type: report.type || "job",

    jobId: report.jobId || null,

    title: report.title || "Signalement",
    company: report.company || "",

    reason: report.reason || "Non précisé",

    status: report.status || "pending",

    createdAt:
      report.createdAt || new Date().toISOString(),
  }));
};

export const saveReports = (reports) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(reports)
  );
};

export const addReport = (report) => {
  const current = getReports();

  const newReport = {
    id: report.id || crypto.randomUUID(),

    type: report.type || "job",

    jobId: report.jobId,

    title: report.title,
    company: report.company,

    reason:
      report.reason || "Signalement utilisateur",

    status: report.status || "pending",

    createdAt:
      report.createdAt || new Date().toISOString(),
  };

  const updated = [newReport, ...current];

  saveReports(updated);

  return updated;
};

export const resolveReport = (id) => {
  const updated = getReports().map((r) =>
    r.id === id
      ? { ...r, status: "resolved" }
      : r
  );

  saveReports(updated);

  return updated;
};

export const deleteReport = (id) => {
  const updated = getReports().filter(
    (r) => r.id !== id
  );

  saveReports(updated);

  return updated;
};
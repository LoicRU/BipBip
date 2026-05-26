const STORAGE_KEY = "userReports";

export const getUserReports = () => {
  if (typeof window === "undefined") return [];

  const reports = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  return reports.map((report) => ({
    id: report.id || crypto.randomUUID(),

    type: "user",

    userId: report.userId,

    userName:
      report.userName || "Utilisateur inconnu",

    email: report.email || "",

    reason:
      report.reason || "Signalement utilisateur",

    status: report.status || "pending",

    createdAt:
      report.createdAt || new Date().toISOString(),
  }));
};

export const saveUserReports = (reports) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(reports)
  );
};

export const addUserReport = (report) => {
  const current = getUserReports();

  const newReport = {
    id: report.id || crypto.randomUUID(),

    type: "user",

    userId: report.userId,

    userName: report.userName,
    email: report.email,

    reason:
      report.reason || "Signalement candidat",

    status: report.status || "pending",

    createdAt:
      report.createdAt || new Date().toISOString(),
  };

  const updated = [newReport, ...current];

  saveUserReports(updated);

  return updated;
};
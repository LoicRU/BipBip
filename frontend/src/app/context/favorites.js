const STORAGE_KEY = "saved_jobs";

export const getFavorites = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
};

export const saveFavorites = (jobs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
};

export const toggleFavorite = (job) => {
  const current = getFavorites();
  const exists = current.find((j) => j.id === job.id);

  let updated;

  if (exists) {
    updated = current.filter((j) => j.id !== job.id);
  } else {
    updated = [...current, job];
  }

  saveFavorites(updated);
  return updated;
};

export const isFavorite = (id) => {
  return getFavorites().some((j) => j.id === id);
};
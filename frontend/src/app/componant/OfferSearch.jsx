import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, RotateCcw, SlidersHorizontal, Sparkles, MapPin, ChevronRight } from "lucide-react";
import { fetchOffers } from "../services/api";

export function OfferSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    type: "all",
    role: "all",
    location: "all",
    remote: "all",
    experience: "all",
    minSalary: "",
    maxSalary: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  const queryValue = [
    searchQuery,
    filters.role !== "all" ? filters.role : null,
  ]
    .filter(Boolean)
    .join(" ");

  const loadOffers = useCallback(async (pageToLoad = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const response = await fetchOffers({
        page: pageToLoad,
        limit: 50,
        q: queryValue || undefined,
        type: filters.type === "all" ? undefined : filters.type,
        location: filters.location === "all" ? undefined : filters.location,
        remote:
          filters.remote === "all"
            ? undefined
            : filters.remote === "yes"
              ? "true"
              : "false",
        minSalary: filters.minSalary || undefined,
        maxSalary: filters.maxSalary || undefined,
      });

      setJobs((prevJobs) =>
        append ? [...prevJobs, ...(response.data || [])] : response.data || []
      );
      setMeta(response.meta || null);
      setHasMore(
        Boolean(response.meta) && pageToLoad < (response.meta.totalPages || 0)
      );
    } catch (err) {
      setError(err.message || "Impossible de charger les offres");
      if (!append) {
        setJobs([]);
        setMeta(null);
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [
    filters.location,
    filters.maxSalary,
    filters.minSalary,
    filters.remote,
    filters.type,
    queryValue,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadOffers(1, false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadOffers]);

  const handleLoadMore = () => {
    if (!hasMore) {
      return;
    }
    const nextPage = (meta?.page || 1) + 1;
    void loadOffers(nextPage, true);
  };

  const cities = useMemo(() => {
    const set = new Set();

    jobs.forEach((job) => {
      const city = job.location?.split(",")[0]?.trim();
      if (city) set.add(city);
    });

    return ["all", ...Array.from(set)];
  }, [jobs]);

  const parseSalary = (salaryStr) => {
    if (!salaryStr) return null;

    const match = salaryStr.match(/(\d+)k?\s*-\s*(\d+)k?/i);
    if (match) {
      return {
        min: +match[1],
        max: +match[2],
      };
    }

    const single = salaryStr.match(/(\d+)k?/i);
    if (single) {
      const v = +single[1];
      return { min: v, max: v };
    }

    return null;
  };

  const formatSalaryRange = (range) => {
    if (!range) return "";
    const min = range.min ? Math.round(range.min / 1000) : null;
    const max = range.max ? Math.round(range.max / 1000) : null;
    if (min && max) {
      return `${min}k - ${max}k EUR`;
    }
    if (min) {
      return `${min}k EUR+`;
    }
    if (max) {
      return `${max}k EUR`;
    }
    return "";
  };

  const getSalaryLabel = (job) => job.salary || formatSalaryRange(job.salaryRange);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (filters.experience !== "all" && job.experience && job.experience !== filters.experience) {
        return false;
      }

      if (!filters.minSalary && !filters.maxSalary) {
        return true;
      }

      if (!job.salary) {
        return false;
      }

      const s = parseSalary(job.salary);
      if (!s) {
        return false;
      }

      const min = filters.minSalary ? +filters.minSalary : 0;
      const max = filters.maxSalary ? +filters.maxSalary : Infinity;
      return s.max >= min && s.min <= max;
    });
  }, [jobs, filters]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      type: "all",
      role: "all",
      location: "all",
      remote: "all",
      experience: "all",
      minSalary: "",
      maxSalary: "",
    });
  };

  const hasFilters =
    searchQuery ||
    filters.type !== "all" ||
    filters.location !== "all" ||
    filters.remote !== "all" ||
    filters.experience !== "all" ||
    filters.minSalary ||
    filters.maxSalary;

  const gridBg = `absolute inset-0 opacity-65
  bg-[linear-gradient(to_right,rgba(59,130,246,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(59,130,246,0.16)_1.5px,transparent_1.5px)]
  dark:bg-[linear-gradient(to_right,rgba(96,165,250,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(96,165,250,0.16)_1.5px,transparent_1.5px)]
  bg-[size:36px_36px]`;

  return (
    <div className="relative space-y-10">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={gridBg} />

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/15 blur-3xl rounded-full" />

        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">

          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            Recherche intelligente
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Explorer les offres tech
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Filtre, compare et trouve ton prochain job rapidement.
          </p>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {meta?.source === "welovedevs"
              ? "Offres synchronisées via WeLoveDevs"
              : "Offres synchronisées en temps réel"}
          </p>
        </div>
      </div>

      <div id="search-section" className="sticky top-4 z-20">
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition" />

              <input value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un job, stack, entreprise..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  text-slate-900 dark:text-white
                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                  focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500
                  transition"/>
            </div>

            <div className="flex flex-wrap gap-3">
              <select value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white">
                <option value="all">Contrat</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </select>

              <select value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white">
                <option value="all">Type de poste</option>
                <option value="Développeur">Développeur</option>
                <option value="Architecte Réseau">Architecte Réseau</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Ingénieur Système">Ingénieur Système</option>
              </select>

              <select value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white">
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city === "all" ? "Ville" : city}
                  </option>
                ))}
              </select>

              <button onClick={() => setShowFilters(!showFilters)}
                className="h-14 px-5 rounded-2xl
                  border border-slate-200 dark:border-slate-700
                  hover:border-blue-400 hover:text-blue-600
                  transition flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Plus
              </button>

              {hasFilters && (
                <button onClick={resetFilters}
                  className="h-14 px-5 rounded-2xl
                    bg-blue-50 text-blue-600
                    border border-blue-100
                    hover:bg-blue-100
                    transition flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
              <select value={filters.remote}
                onChange={(e) => setFilters({...filters, remote: e.target.value})}
                className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white">

                <option value="all">Remote</option>
                <option value="yes">Oui</option>
                <option value="no">Non</option>
              </select>

              <select value={filters.experience}
                onChange={(e) => setFilters({...filters, experience: e.target.value})}
                className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white">

                <option value="all">Expérience</option>
                <option value="2-4 ans">2-4 ans</option>
                <option value="3-5 ans">3-5 ans</option>
                <option value="5+ ans">5+ ans</option>
              </select>

              <div className="flex gap-2">
                <input placeholder="Min k€"
                  value={filters.minSalary}
                  onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white"/>

                <input placeholder="Max k€"
                  value={filters.maxSalary}
                  onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white"/>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Résultats
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-medium
            bg-blue-50 dark:bg-blue-500/10
            text-blue-600 dark:text-blue-400
            border border-blue-100 dark:border-blue-500/20">
            {filteredJobs.length} offre{filteredJobs.length > 1 ? "s" : ""}
          </span>
        </div>

        {searchQuery && (
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-50">
            pour “{searchQuery}”
          </span>
        )}
      </div>

      <div className="space-y-5">
        {loading ? (
          <div className="text-center py-24 text-slate-500">
            Chargement des offres...
          </div>
        ) : error ? (
          <div className="text-center py-24 text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-24">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-blue-500 opacity-80" />
            </div>

            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              Aucun résultat
            </p>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Essaie d’élargir tes filtres ou modifier ta recherche.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Link key={job.id} to={`/offer/${job.id}`}
              className="group relative block overflow-hidden rounded-2xl
                border border-slate-200 dark:border-slate-800
                bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl
                hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5
                transition-all duration-300">

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500
                  bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)]
                  dark:bg-[linear-gradient(to_right,rgba(96,165,250,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(96,165,250,0.06)_1px,transparent_1px)]
                  bg-size-[34px_34px]"/>

              <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />

              <div className="relative z-10 p-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex gap-4">
                    <div
                      className="shrink-0 w-11 h-11 rounded-xl
                        bg-blue-50 dark:bg-blue-500/10
                        border border-blue-100 dark:border-blue-500/10
                        flex items-center justify-center group-hover:scale-105 transition duration-300">
                      <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className="text-lg font-semibold
                            text-slate-900 dark:text-white
                            group-hover:text-blue-600
                            dark:group-hover:text-blue-400
                            transition">
                          {job.title}
                        </h3>

                        {job.remote && (
                          <span className=" px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                            Remote
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {job.company}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl
                          bg-slate-100 dark:bg-slate-800
                          text-xs text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>

                        <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
                          {job.type}
                        </span>

                        {getSalaryLabel(job) && (
                          <span className="px-3 py-1 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs">
                            {getSalaryLabel(job)}
                          </span>
                        )}

                        {job.experience && (
                          <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
                            {job.experience}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl
                      bg-blue-50 dark:bg-blue-500/10
                      border border-blue-100 dark:border-blue-500/10
                      text-blue-600 dark:text-blue-400 text-sm font-medium
                      group-hover:bg-blue-600 group-hover:text-white
                      transition-all duration-300">
                      <span>Voir</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {(hasMore || loadingMore) && !loading && !error && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loadingMore ? "Chargement..." : "Voir plus d'offres"}
          </button>
        </div>
      )}
    </div>
  );
}

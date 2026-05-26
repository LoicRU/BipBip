import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, TrendingUp, MapPin, ArrowRight, Bot, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";
import { fetchFavorites, fetchMyApplications, fetchOffers } from "../services/api";

export function TechDashboard() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState("recommended");
  const [recentJobs, setRecentJobs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [applications, setApplications] = useState([]);
  const [offerTotal, setOfferTotal] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [offersResponse, favoriteOffers, myApplications] = await Promise.all([
          fetchOffers({ page: 1, limit: 5 }),
          fetchFavorites().catch(() => []),
          fetchMyApplications().catch(() => []),
        ]);

        setRecentJobs(offersResponse.data || []);
        setOfferTotal(offersResponse.meta?.total || offersResponse.data?.length || 0);
        setFavorites(favoriteOffers);
        setApplications(myApplications);
      } catch {
        setRecentJobs([]);
        setOfferTotal(0);
        setFavorites([]);
        setApplications([]);
      }
    };

    loadDashboard();
  }, []);

  const techStats = [
    { label: "Offres disponibles", value: offerTotal, icon: Briefcase },
    { label: "Nouvelles cette semaine", value: recentJobs.length, icon: TrendingUp },
    { label: "Remote", value: recentJobs.filter((job) => job.remote).length, icon: MapPin },
    { label: "Candidatures", value: applications.length, icon: FileText },
  ];

  const gridBg = `absolute inset-0 opacity-65
  bg-[linear-gradient(to_right,rgba(59,130,246,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(59,130,246,0.16)_1.5px,transparent_1.5px)]
  dark:bg-[linear-gradient(to_right,rgba(96,165,250,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(96,165,250,0.16)_1.5px,transparent_1.5px)]
  bg-[size:36px_36px]`;

  const hoverLift = "transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1";

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={gridBg} />

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/15 dark:bg-blue-600/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-sm text-blue-500 dark:text-blue-400 font-semibold tracking-wide">
            Espace candidat
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Bonjour {user?.name ?? "Utilisateur"}
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Explorez des opportunités tech adaptées à votre profil et vos compétences.
          </p>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Données synchronisées via WeLoveDevs
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/search"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl
            bg-blue-700 text-white text-sm font-medium
            hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-500/20 ${hoverLift}`}>
              Explorer les offres
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link to="/ai-assistant"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-800
                text-slate-900 dark:text-white text-sm font-medium
                hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300
                dark:hover:border-blue-500/40 hover:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] ${hoverLift}`}>
              <Bot className="w-4 h-4 text-blue-500" />
              Assistant IA
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {techStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label}
              className="group rounded-2xl
                border border-slate-200 dark:border-slate-800
                bg-white dark:bg-slate-900
                p-6 hover:scale-[1.02] hover:-translate-y-1
                hover:border-blue-400/50 dark:hover:border-blue-500/40 hover:bg-blue-50/30 dark:hover:bg-slate-800/60
                transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-base text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>

                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-300 group-hover:text-blue-600 transition" />
                </div>
              </div>

              <p className="mt-5 text-4xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`pb-3 text-base font-medium border-b-2 transition ${
              activeTab === "recommended" ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
            Recommandées
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`pb-3 text-base font-medium border-b-2 transition ${
              activeTab === "favorites" ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
            Favoris
          </button>
        </nav>
      </div>

      {activeTab === "recommended" && (
        <div className="space-y-4">
          {recentJobs.map((job) => (
            <Link key={job.id}
              to={`/offer/${job.id}`}
              className="group block
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-800
                rounded-2xl p-6
                hover:scale-[1.015] hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5
                hover:border-blue-300
                dark:hover:border-blue-500/30
                transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                      <Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>

                    <div>

                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                        {job.title}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {job.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>

                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                      {job.type}
                    </span>

                    {job.remote && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20">
                        Remote
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                  <span>Voir</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "favorites" && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <p className="text-slate-500 text-base">
              Aucun favori pour le moment
            </p>
          ) : (
            favorites.map((job) => (
              <Link key={job.id} to={`/offer/${job.id}`}
                className="group block
                  bg-white dark:bg-slate-900
                  border border-slate-200 dark:border-slate-800
                  rounded-2xl p-6
                  hover:scale-[1.015] hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5
                  hover:border-blue-300
                  dark:hover:border-blue-500/30
                  transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                        <Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                          {job.title}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>

                      <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                        {job.type}
                      </span>

                      {job.remote && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                    <span>Voir</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

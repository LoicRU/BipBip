import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Briefcase, TrendingUp, BarChart3, Target, ArrowRight, FileText, Activity } from "lucide-react";
import { fetchOffers, fetchRecruiterApplications } from "../services/api";

export function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    offers: [],
    applications: [],
  });
  const hoverLift = "transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [offersResponse, applications] = await Promise.all([
          fetchOffers({ mine: true, page: 1, limit: 100 }),
          fetchRecruiterApplications(),
        ]);

        setStatsData({
          offers: offersResponse.data || [],
          applications,
        });
      } catch {
        setStatsData({
          offers: [],
          applications: [],
        });
      }
    };

    loadDashboard();
  }, []);

  const gridBg = `absolute inset-0 opacity-65
  bg-[linear-gradient(to_right,rgba(168,85,247,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(168,85,247,0.16)_1.5px,transparent_1.5px)]
  dark:bg-[linear-gradient(to_right,rgba(192,132,252,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(192,132,252,0.16)_1.5px,transparent_1.5px)]
  bg-[size:36px_36px]`;

  const stats = [
    { label: "Offres actives", value: statsData.offers.length, icon: Briefcase },
    { label: "Candidatures reçues", value: statsData.applications.length, icon: Users },
    { label: "Vues totales", value: statsData.offers.length * 10, icon: TrendingUp },
    { label: "Taux de conversion", value: statsData.offers.length ? `${Math.round((statsData.applications.length / Math.max(statsData.offers.length, 1)) * 10)}%` : "0%", icon: Target },
  ];

  const recentApplications = statsData.applications.slice(0, 3).map((application) => ({
    name: application.candidateName,
    role: application.jobTitle,
    status: application.status,
  }));

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={gridBg} />

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-400/15 dark:bg-purple-600/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-sm text-purple-500 dark:text-purple-400 font-semibold tracking-wide">
            Espace recruteur
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Pilotage des recrutements
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Suivez vos offres, candidatures et performances en temps réel.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <button onClick={() => navigate("/jobs", { state: { openModal: true } })}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl
              bg-purple-700 text-white text-sm font-medium
              hover:bg-purple-800 hover:shadow-lg hover:shadow-purple-500/20 ${hoverLift}`}>
              Créer une offre
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link to="/candidatures"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800
              text-slate-900 dark:text-white text-sm font-medium
              hover:bg-purple-50 dark:hover:bg-slate-700 hover:border-purple-300
              dark:hover:border-purple-500/40 hover:shadow-[0_0_0_3px_rgba(168,85,247,0.08)] ${hoverLift}`}>
              <FileText className="w-4 h-4 text-purple-500" />
              Voir les candidatures
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:scale-[1.02] hover:-translate-y-1 hover:border-purple-400/50 dark:hover:border-purple-500/40 hover:bg-purple-50/30 dark:hover:bg-slate-800/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-base text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>

                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
              </div>

              <p className="mt-5 text-4xl font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-8">
          {["overview", "analytics"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-base font-medium border-b-2 transition ${
                activeTab === tab ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
              {tab === "overview" ? "Vue d'ensemble" : "Analytics"}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Performance des offres
            </h2>

            <div className="space-y-3 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Frontend Dev</span>
                <span className="text-green-500">+32%</span>
              </div>
              <div className="flex justify-between">
                <span>Backend Dev</span>
                <span className="text-blue-500">+18%</span>
              </div>
              <div className="flex justify-between">
                <span>DevOps</span>
                <span className="text-orange-500">+9%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Activité récente
            </h2>

            <div className="space-y-3">
              {recentApplications.map((a) => (
                <div key={a.name}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 transition">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {a.name}
                  </p>
                  <p className="text-sm text-slate-500">{a.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Analytics recruteur
          </h2>

          <p className="text-slate-500 mt-2">
            Graphiques et performances détaillées à venir
          </p>
        </div>
      )}
    </div>
  );
}

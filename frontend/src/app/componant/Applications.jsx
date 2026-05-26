import { useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, Trash2, Briefcase, CalendarDays } from "lucide-react";
import { deleteApplication, fetchMyApplications } from "../services/api";

export function Applications() {
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await fetchMyApplications();
        setApplications(data);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const pending = applications.filter((a) => a.status === "pending");
  const results = applications.filter((a) => a.status === "accepted" || a.status === "rejected");

  const cancelApplication = async (id) => {
    await deleteApplication(id);
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const getStatusUI = (status) => {
    if (status === "accepted") {
      return {
        icon: CheckCircle,
        label: "Acceptée",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        border: "border-emerald-200 dark:border-emerald-500/20",
      };
    }

    if (status === "rejected") {
      return {
        icon: XCircle,
        label: "Refusée",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-500/10",
        border: "border-red-200 dark:border-red-500/20",
      };
    }

    return {
      icon: Clock,
      label: "En attente",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/20",
    };
  };

  const gridBg = `absolute inset-0 opacity-65
  bg-[linear-gradient(to_right,rgba(59,130,246,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(59,130,246,0.16)_1.5px,transparent_1.5px)]
  dark:bg-[linear-gradient(to_right,rgba(96,165,250,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(96,165,250,0.16)_1.5px,transparent_1.5px)]
  bg-[size:36px_36px]`;

  return (
    <div className="space-y-10 relative">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={gridBg} />

        <div className="absolute -top-24 -right-24 w-120 h-120 bg-blue-500/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-120 h-120 bg-blue-600/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 text-sm font-semibold">
            <Briefcase className="w-4 h-4" />
            Suivi des candidatures
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Mes candidatures
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
            Gérez vos candidatures et suivez leur évolution en temps réel.
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-5 py-3 font-medium border-b-2 transition ${
            activeTab === "pending" ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
          En cours
        </button>

        <button onClick={() => setActiveTab("results")}
          className={`px-5 py-3 font-medium border-b-2 transition ${
            activeTab === "results" ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
          Résultats
        </button>
      </div>

      <div className="space-y-5">
        {activeTab === "pending" && (
          <>
            {loading ? (
              <div className="text-center py-20 text-slate-500">
                Chargement...
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                Aucune candidature en cours
              </div>
            ) : (
              pending.map((app) => {
                const status = getStatusUI(app.status);

                return (
                  <div key={app.id}
                    className="group relative overflow-hidden rounded-3xl
                    border border-slate-200 dark:border-slate-800
                    bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-6
                    hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-500/10
                    transition">

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition
                    bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)]
                    bg-size-[34px_34px]" />

                    <div className="relative flex flex-col lg:flex-row justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                              {app.jobTitle}
                            </h3>
                            <p className="text-sm text-slate-500">{app.company}</p>
                          </div>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium
                          ${status.bg} ${status.border} ${status.color}`}>
                          <status.icon className="w-4 h-4" />
                          {status.label}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays className="w-4 h-4" />
                          {new Date(app.date).toLocaleDateString("fr-FR")}
                        </div>
                      </div>

                      <button onClick={() => cancelApplication(app.id)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
                          border border-red-200 dark:border-red-500/20
                          text-red-600 dark:text-red-400
                          hover:bg-red-50 dark:hover:bg-red-500/10
                          text-sm font-medium transition">
                        <Trash2 className="w-4 h-4" />
                        Annuler
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === "results" && (
          <>
            {results.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                Aucun résultat pour le moment
              </div>
            ) : (
              results.map((app) => {
                const status = getStatusUI(app.status);

                return (
                  <div key={app.id}
                    className="group relative overflow-hidden rounded-3xl
                    border border-slate-200 dark:border-slate-800
                    bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-6
                    hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-500/10
                    transition">

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-size-[34px_34px]" />

                    <div className="relative flex flex-col lg:flex-row justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                              {app.jobTitle}
                            </h3>
                            <p className="text-sm text-slate-500">{app.company}</p>
                          </div>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${status.bg} ${status.border} ${status.color}`}>
                          <status.icon className="w-4 h-4" />
                          {status.label}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays className="w-4 h-4" />
                          {new Date(app.date).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}

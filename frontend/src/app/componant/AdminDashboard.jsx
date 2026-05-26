import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, TrendingUp, ShieldAlert, MessageSquare, Activity, BarChart3, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { fetchAdminDashboard, fetchReports } from "../services/api";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { supportTickets } = useApp();
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [adminDashboard, moderationReports] = await Promise.all([
          fetchAdminDashboard(),
          fetchReports(),
        ]);

        setDashboard(adminDashboard);
        setReports(moderationReports);
      } catch {
        setDashboard(null);
        setReports([]);
      }
    };

    loadDashboard();
  }, []);

  const hoverLift = "transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1";

  const gridBg = `absolute inset-0 opacity-65
    bg-[linear-gradient(to_right,rgba(34,197,94,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(34,197,94,0.16)_1.5px,transparent_1.5px)]
    dark:bg-[linear-gradient(to_right,rgba(74,222,128,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(74,222,128,0.16)_1.5px,transparent_1.5px)]
    bg-[size:36px_36px]`;

  const stats = [
    { label: "Utilisateurs", value: dashboard?.users?.total ?? 0, icon: Users },
    { label: "Offres publiées", value: dashboard?.offers?.total ?? 0, icon: Briefcase },
    { label: "Modération", value: dashboard?.reports?.pending ?? 0, icon: ShieldAlert },
    { label: "Tickets support", value: supportTickets.length, icon: MessageSquare },
  ];

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: TrendingUp },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "activity", label: "Activité", icon: Activity },
  ];

  const dynamicActions = [
    ...supportTickets.slice(0, 3).map((ticket) => ({
      icon: MessageSquare,
      color: "text-emerald-600",
      title: `Ticket: ${ticket.subject}`,
      description: ticket.status === "open" ? "Support en attente" : "Support resolu",
      time: new Date(ticket.createdAt).toLocaleString("fr-FR"),
    })),
    ...reports.slice(0, 3).map((report) => ({
      icon: ShieldAlert,
      color: "text-lime-600",
      title: report.title,
      description: report.reason,
      time: new Date(report.createdAt).toLocaleString("fr-FR"),
    })),
  ];

  const moderationStats = [
    { label: "Signalements en attente", value: dashboard?.reports?.pending ?? 0, color: "text-green-600" },
    { label: "Tickets ouverts", value: dashboard?.supportTickets?.open ?? 0, color: "text-emerald-600" },
    { label: "Utilisateurs bloqués", value: dashboard?.users?.blocked ?? 0, color: "text-lime-600" },
  ];

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={gridBg} />

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-300/20 dark:bg-green-500/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-600/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-sm text-green-500 dark:text-green-400 font-semibold tracking-wide">
            Administration plateforme
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Dashboard administrateur
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Supervisez, modérez et analysez toute l’activité de la plateforme.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/support"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl
              bg-green-700 text-white text-sm font-medium
              hover:bg-green-800 hover:shadow-lg hover:shadow-green-500/20 ${hoverLift}`}>
              Accéder au support
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link to="/moderation"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800
              text-slate-900 dark:text-white text-sm font-medium
              hover:bg-green-50 dark:hover:bg-slate-700 hover:border-green-300
              dark:hover:border-green-500/40 hover:shadow-[0_0_0_3px_rgba(34,197,94,0.08)] ${hoverLift}`}>
              <ShieldAlert className="w-4 h-4 text-green-500" />
              Centre de modération
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label}
              className="group rounded-2xl
              border border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900 p-6
              hover:scale-[1.02] hover:-translate-y-1 hover:border-green-400/50 hover:bg-green-50/30 dark:hover:bg-slate-800/60
              transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-base text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>

                <div className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10 group-hover:bg-green-100 dark:group-hover:bg-green-500/20 transition">
                  <Icon className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
              </div>

              <p className="mt-5 text-4xl font-semibold text-slate-900 dark:text-white group-hover:text-green-600 transition">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-base font-medium border-b-2 transition flex items-center gap-2 ${
                  activeTab === tab.id ? "border-green-600 text-green-600"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-green-500" />
              État de la modération
            </h2>

            <div className="space-y-3">
              {moderationStats.map((item, index) => (
                <div key={index}
                  className="flex justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 transition">
                  <span className="text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span className={`font-semibold ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Activité récente
            </h2>

            <div className="space-y-3">
              {dynamicActions.length ===
              0 ? (
                <p className="text-slate-500 text-sm">
                  Aucun événement
                  pour le moment
                </p>
              ) : (
                dynamicActions.slice(0, 5).map((action, index) => {
                      const Icon = action.icon;

                      return (
                        <div key={index}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 transition flex items-center gap-3">
                          <div className={`p-2 ${action.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {action.title}
                            </p>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {action.description}
                            </p>
                          </div>

                          <span className="text-xs text-slate-400">
                            {action.time}
                          </span>
                        </div>
                      );
                    }
                  )
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            Analytics admin
          </h2>

          <p className="text-slate-500 mt-2">
            Statistiques détaillées de la plateforme.
          </p>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Journal d'activité
            </h2>
            <p className="text-slate-500 mt-2">
              Historique des actions système
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {dynamicActions.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucun log disponible
              </div>
            ) : (
              dynamicActions.map((action, index) => {
                const Icon = action.icon;

                return (
                  <div key={index} className="p-6 flex items-center justify-between hover:bg-green-50/40 dark:hover:bg-slate-800 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 ${action.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {action.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm text-slate-400">
                      {action.time}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

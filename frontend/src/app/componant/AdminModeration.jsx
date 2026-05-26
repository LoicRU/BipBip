import { useEffect, useMemo, useState } from "react";
import {Eye, Search, X, CheckCircle, Flag, MessageSquare, AlertTriangle, User, Ban } from "lucide-react";
import { deleteReport, fetchReports, resolveReport } from "../services/api";

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
    case "resolved":
      return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
    default:
      return "bg-gray-500/10 text-gray-600";
  }
};

export function AdminModeration() {
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);

  const filteredReports = useMemo(() => {
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase()) ||
        r.reportedBy.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  const handleResolve = async (id) => {
    const updated = await resolveReport(id);
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const handleDelete = async (id) => {
    await deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const stats = {
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    total: reports.length,
  };

  useEffect(() => {
    const loadReports = async () => {
      const data = await fetchReports();
      setReports(data);
    };

    loadReports();
  }, []);

const gridBg = "absolute inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(34,197,94,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.12)_1px,transparent_1px)] bg-[size:36px_36px]";

  return (
    <div className="relative space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={gridBg} />
        
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full" />

        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
            Centre de modération
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Gestion des signalements
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
            Analyse et traitement des comportements signalés sur la plateforme.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "En attente", value: stats.pending, icon: AlertTriangle },
          { label: "Résolus", value: stats.resolved, icon: CheckCircle },
          { label: "Total", value: stats.total, icon: MessageSquare },
        ].map((s) => {
          const Icon = s.icon;

          return (
            <div key={s.label}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6
              hover:shadow-xl hover:-translate-y-1 transition">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">{s.label}</p>

                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <p className="mt-5 text-3xl font-semibold group-hover:text-emerald-600 transition">
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

          <input value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un signalement..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700
            bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
        </div>
      </div>

      <div className="space-y-5">
        {filteredReports.map((report) => (
          <div key={report.id}
            className="group relative overflow-hidden rounded-2xl
            border border-slate-200 dark:border-slate-800
            bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl
            hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5
            transition-all duration-300">

            <div className="relative z-10 p-5">
              <div className="flex items-start justify-between gap-6">

                <div className="flex gap-4">

                  <div className="shrink-0 w-11 h-11 rounded-xl
                    bg-emerald-50 dark:bg-emerald-500/10
                    border border-emerald-100 dark:border-emerald-500/10
                    flex items-center justify-center group-hover:scale-105 transition duration-300">
                    <Flag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                        {report.title}
                      </h3>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusStyle(report.status)}`}>
                        {report.status === "pending" ? "En attente" : "Résolu"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {report.reason}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <User className="w-3.5 h-3.5" />
                      {report.reportedBy}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedReport(report)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl
                    bg-emerald-50 dark:bg-emerald-500/10
                    border border-emerald-100 dark:border-emerald-500/10
                    text-emerald-600 dark:text-emerald-400 text-sm font-medium
                    hover:bg-emerald-600 hover:text-white
                    transition-all duration-300">
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>

                  {report.status === "pending" && (
                    <>
                      <button onClick={() => handleResolve(report.id)}
                        className="inline-flex items-center gap-2 rounded-2xl
                        bg-emerald-600 text-white px-4 py-2
                        hover:bg-emerald-500 transition">
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>

                      <button onClick={() => handleDelete(report.id)}
                        className="inline-flex items-center gap-2 rounded-2xl
                        bg-red-600 text-white px-4 py-2
                        hover:bg-red-500 transition">
                        <Ban className="w-4 h-4" />
                        Bloquer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-4" />

          <h2 className="text-2xl font-semibold">Aucun signalement</h2>

          <p className="text-slate-500 mt-2">Aucun résultat trouvé.</p>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl p-6 relative">
            <button onClick={() => setSelectedReport(null)} className="absolute top-4 right-4">
              <X />
            </button>

            <h2 className="text-xl font-bold">{selectedReport.title}</h2>

            <p className="text-slate-500 mt-2">{selectedReport.reason}</p>

            <div className="mt-6 text-slate-700 dark:text-slate-300">
              {selectedReport.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

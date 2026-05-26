import { useEffect, useMemo, useState } from "react";
import { Search, Filter, CheckCircle, XCircle, Clock, Mail, Phone, Download, X, Bot, ClipboardPen, AlertCircle, Briefcase, ChevronRight, Flag } from "lucide-react";
import { Toast } from "./ui/Toast";
import {
  createReport,
  downloadApplicationCv,
  fetchRecruiterApplications,
  updateApplicationStatus as updateApplicationStatusRequest,
} from "../services/api";

function normalizeQuestionCollection(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(normalizeQuestionCollection);
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .sort(([left], [right]) => {
        const leftMatch = left.match(/(\d+)$/);
        const rightMatch = right.match(/(\d+)$/);

        if (!leftMatch || !rightMatch) {
          return left.localeCompare(right);
        }

        return Number(leftMatch[1]) - Number(rightMatch[1]);
      })
      .flatMap(([, nestedValue]) => normalizeQuestionCollection(nestedValue));
  }

  return [];
}

function normalizeQuestionText(value) {
  return normalizeQuestionCollection(value).join("\n");
}

function normalizeAiInterview(aiInterview) {
  if (!aiInterview || typeof aiInterview !== "object") {
    return null;
  }

  const answers = Array.isArray(aiInterview.answers)
    ? aiInterview.answers.map((item) => ({
        ...item,
        question: normalizeQuestionText(item?.question),
        answer: typeof item?.answer === "string" ? item.answer : "",
      }))
    : [];

  return {
    ...aiInterview,
    answers,
    feedback: typeof aiInterview.feedback === "string" ? aiInterview.feedback : "",
  };
}

export function Candidatures() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await fetchRecruiterApplications();
        setApplications(
          data.map((application) => ({
            ...application,
            aiInterview: normalizeAiInterview(application.aiInterview),
          }))
        );
      } catch (err) {
        setToast({
          type: "error",
          message: err.message || "Impossible de charger les candidatures",
        });
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const handleDownloadCv = async (application) => {
    try {
      const { blob, filename } = await downloadApplicationCv(application.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename || application.cvName || "cv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Impossible de telecharger le CV",
      });
    }
  };

  const updateStatus = async (id, status) => {
    const updatedApplication = await updateApplicationStatusRequest(id, status);
    const normalizedApplication = {
      ...updatedApplication,
      aiInterview: normalizeAiInterview(updatedApplication.aiInterview),
    };

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? normalizedApplication : app))
    );
    setSelectedApplication((prev) => (prev?.id === id ? normalizedApplication : prev));
  };

  const filteredApplications =
    useMemo(() => {
      return applications.filter(
        (app) => {
          const matchesSearch =
            !searchQuery || app.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.company?.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesStatus =
            filterStatus === "all" ||
            app.status === filterStatus;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      applications,
      searchQuery,
      filterStatus,
    ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20";
      case "accepted":
        return "bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20";
      case "rejected":
        return "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border border-slate-500/20";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Refusée";
      default:
        return status;
    }
  };

  const stats = [
    { label: "Total candidatures", value: applications.length, icon: ClipboardPen },
    { label: "En attente", value: applications.filter((a) => a.status === "pending").length, icon: AlertCircle },
    { label: "Acceptées", value: applications.filter((a) => a.status === "accepted").length, icon: CheckCircle },
    { label: "Refusées", value: applications.filter((a) => a.status === "rejected").length, icon: XCircle }
  ];

  const gridBg = `absolute inset-0 opacity-60
    bg-[linear-gradient(to_right,rgba(168,85,247,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.12)_1px,transparent_1px)]
    dark:bg-[linear-gradient(to_right,rgba(192,132,252,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(192,132,252,0.12)_1px,transparent_1px)]
    bg-[size:34px_34px]`;

  return (
    <div className="relative space-y-10">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-purple-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={gridBg} />

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-400/20 blur-3xl rounded-full" />

        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-sm text-purple-500 dark:text-purple-400 font-semibold tracking-wide">
            Gestion recruteur
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Pilotage des candidatures
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Analyse, filtre et gère
            les candidatures reçues
            avec une interface moderne
            orientée recrutement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label}
              className="group rounded-2xl
                border border-slate-200 dark:border-slate-800
                bg-white dark:bg-slate-900
                p-6
                hover:-translate-y-1 hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-500/10
                transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-base text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>

                <div className="p-3 rounded-2xl
                    bg-purple-50 dark:bg-purple-500/10
                    border border-purple-100 dark:border-purple-500/10">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
              </div>

              <p className="mt-6 text-4xl font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="sticky top-4 z-20">
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition" />

              <input type="text"
                placeholder="Rechercher un candidat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  text-slate-900 dark:text-white
                  placeholder:text-slate-400
                  focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500
                  outline-none transition"/>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-400" />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className=" h-14 px-4 rounded-2xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  text-slate-900 dark:text-white
                  focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500
                  outline-none transition">

                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="accepted">Acceptées</option>
                <option value="rejected">Refusées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Résultats
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-medium
              bg-purple-50 dark:bg-purple-500/10
              text-purple-600 dark:text-purple-400
              border border-purple-100 dark:border-purple-500/20">
            {filteredApplications.length}{" "} candidature {filteredApplications.length > 1 ? "s": ""}
          </span>
        </div>

        {searchQuery && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            pour “{searchQuery}”
          </span>
        )}
      </div>

      {filteredApplications.length ===
      0 && !loading ? (
        <div className="text-center py-24">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-6">
            <Briefcase className="w-10 h-10 text-purple-500 opacity-80" />
          </div>

          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            Aucune candidature
          </p>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Essaie une autre
            recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {(loading ? [] : filteredApplications).map(
            (app) => (
              <div key={app.id}
                className="
                  group relative overflow-hidden rounded-2xl
                  border border-slate-200 dark:border-slate-800
                  bg-white/95 dark:bg-slate-900/90
                  backdrop-blur-xl
                  hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1
                  transition-all duration-300">
                <div
                  className="
                    absolute inset-0 opacity-0
                    group-hover:opacity-100
                    transition duration-500
                    bg-[linear-gradient(to_right,rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.05)_1px,transparent_1px)]
                    dark:bg-[linear-gradient(to_right,rgba(192,132,252,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(192,132,252,0.06)_1px,transparent_1px)]
                    bg-size-[34px_34px]"/>

                <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />

                <div className="relative z-10 p-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-2xl
                            bg-purple-50 dark:bg-purple-500/10
                            border border-purple-100 dark:border-purple-500/10
                            flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                            {app.candidateName ||"Candidat"}
                          </h2>

                          <p className="text-sm text-slate-500 mt-1">
                            {app.jobTitle}
                          </p>

                          <p className="text-sm text-slate-400">
                            {app.company}
                          </p>
                        </div>
                      </div>

                      <span className={`px-4 py-2 rounded-full text-xs font-medium ${getStatusBadge(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm">
                      {app.candidateEmail && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <Mail className="w-4 h-4" />
                          {
                            app.candidateEmail
                          }
                        </span>
                      )}

                      {app.candidatePhone && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <Phone className="w-4 h-4" />
                          {app.candidatePhone}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4" />
                        {new Date(app.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {app.coverLetter && (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-5">
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-4">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      {app.cv && (
                        <button
                          onClick={() => void handleDownloadCv(app)}
                          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl
                            border border-slate-200 dark:border-slate-700
                            bg-white dark:bg-slate-800
                            text-slate-700 dark:text-white
                            hover:border-purple-400 hover:text-purple-600
                            transition">
                          <Download className="w-4 h-4" />
                          Télécharger CV
                        </button>
                      )}

                      {app.status ===
                        "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(app.id, "accepted")}
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl
                              bg-purple-600 hover:bg-purple-700
                              text-white font-medium
                              transition">
                            <CheckCircle className="w-4 h-4" />
                            Accepter
                          </button>

                          <button
                            onClick={() => updateStatus(app.id, "rejected")}
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl
                              bg-fuchsia-600 hover:bg-fuchsia-700
                              text-white font-medium
                              transition">
                            <XCircle className="w-4 h-4" />
                            Refuser
                          </button>
                        </>
                      )}

                      <button
                        onClick={() =>
                          setSelectedApplication({
                            ...app,
                            aiInterview: normalizeAiInterview(app.aiInterview),
                          })
                        }
                        className="ml-auto inline-flex items-center gap-2
                          text-purple-600 dark:text-purple-400
                          font-medium hover:gap-3 transition-all">
                        Voir détails
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await createReport({
                              type: "user",
                              userId: app.applicant?.id || app.userId,
                              reason: "Signalement depuis candidature",
                              description: app.coverLetter || "",
                            });

                            setToast({
                              type: "error",
                              message: "Utilisateur signale",
                            });
                          } catch (err) {
                            setToast({
                              type: "error",
                              message: err.message || "Impossible de signaler cet utilisateur",
                            });
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl
                        border border-red-200 text-red-600 hover:bg-red-50 transition">
                        <Flag className="w-4 h-4" />
                        Signaler
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-20 text-slate-500">
          Chargement des candidatures...
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-4xl
              bg-white/95 dark:bg-[#0F172A]/95
              backdrop-blur-xl
              border border-purple-100 dark:border-purple-900
              shadow-[0_20px_80px_rgba(0,0,0,0.15)]">
            <div className="relative p-8 bg-linear-to-r from-purple-700 via-purple-500 to-fuchsia-700 text-white">
              <button
                onClick={() => setSelectedApplication(null)}
                className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-4xl font-bold">
                {selectedApplication.candidateName}
              </h2>

              <p className="text-white/80 mt-2">
                {selectedApplication.jobTitle}
              </p>
            </div>

            <div className="relative p-8 space-y-10">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none
                  bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)]
                  bg-size-[40px_40px]"/>

              <div className="relative z-10 space-y-10">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-2">
                      Email
                    </p>

                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedApplication.candidateEmail}
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-2">
                      Téléphone
                    </p>

                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedApplication.candidatePhone}
                    </p>
                  </div>
                </div>

                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                      Lettre de motivation
                    </h3>

                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                        {selectedApplication.coverLetter}
                      </p>
                    </div>
                  </div>
                )}

                {selectedApplication.aiInterview && (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-2xl bg-purple-600 text-white">
                        <Bot className="w-5 h-5" />
                      </div>

                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Entretien IA
                      </h3>
                    </div>

                    <div className="space-y-5">
                      {selectedApplication.aiInterview.answers.map(
                        (item, index) => (
                          <div key={index}
                            className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3">
                              Question{" "}
                              {index + 1}
                            </p>

                            <p className="font-semibold text-slate-900 dark:text-white mb-4">
                              {item.question}
                            </p>

                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-6 rounded-3xl p-6 bg-purple-500/10 border border-purple-300 dark:border-purple-800">
                      <div className="flex items-center justify-between gap-6">
                        <div>
                          <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            Score IA :{" "}
                            {selectedApplication.aiInterview.score}/100
                          </p>

                          <p className="text-slate-600 dark:text-slate-400 mt-3">
                            {selectedApplication.aiInterview.feedback}
                          </p>
                        </div>
                        <div className="text-6xl">
                          🤖
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

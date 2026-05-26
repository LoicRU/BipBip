import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Briefcase, Calendar, Building2, CheckCircle, Gift, Star, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Toast } from "./ui/Toast";
import { AiInterview } from "./AiInterview";
import {
  addFavorite,
  createApplication,
  createReport,
  fetchFavorites,
  fetchOfferById,
  removeFavorite,
} from "../services/api";

export function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAiInterview, setShowAiInterview] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Contenu inapproprié");
  const [reportDescription, setReportDescription] = useState("");
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    candidatePhone: "",
    cvFile: null,
  });
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [pendingApplication, setPendingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const getOfferSourceUrl = (offer) => {
    if (!offer?.raw) return null;

    const raw = offer.raw;
    return (
      raw.url ||
      raw.applyUrl ||
      raw.jobUrl ||
      raw.externalUrl ||
      raw.website ||
      raw.link ||
      raw.href ||
      null
    );
  };

  const salaryLabel = job ? job.salary || formatSalaryRange(job.salaryRange) : "";

  useEffect(() => {
    const loadOffer = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [offer, favorites] = await Promise.all([
          fetchOfferById(id),
          fetchFavorites().catch(() => []),
        ]);

        setJob(offer);
        setSaved(favorites.some((favorite) => String(favorite.id) === String(offer.id)));
        setError("");
      } catch (err) {
        setError(err.message || "Offre non trouvée");
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadOffer();
  }, [id]);

  const handleSave = async () => {
    if (!job) return;

    try {
      if (saved) {
        await removeFavorite(job.id);
        setSaved(false);
      } else {
        await addFavorite(job.id);
        setSaved(true);
      }

      setAnimating(true);
      setTimeout(() => setAnimating(false), 180);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Impossible de mettre a jour les favoris",
      });
    }
  };

  const getExternalJobUrl = () => {
    if (!job) return null;
    const url = getOfferSourceUrl(job);
    return job.source !== "platform" ? url : null;
  };

  const handleApply = async () => {
    if (!job) return;

    const externalUrl = getExternalJobUrl();

    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setShowApplyModal(true);
  };

  const handleReport = async () => {
    if (!job) return;

    try {
      await createReport({
        type: "job",
        jobId: job.id,
        title: job.title,
        company: job.company,
        reason: reportReason,
        description: reportDescription,
      });

      setToast({
        type: "success",
        message: "Signalement envoyé avec détails",
      });
      setShowReportModal(false);
      setReportDescription("");
      setReportReason("Contenu inapproprié");
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Impossible de signaler l'offre",
      });
    }
  };

  const handleInterviewComplete = async (result) => {
    setShowAiInterview(false);
    if (!pendingApplication) {
      return;
    }

    setSubmittingApplication(true);

    try {
      await createApplication({
        offerId: job.id,
        coverLetter: pendingApplication.coverLetter,
        candidatePhone: pendingApplication.candidatePhone,
        cvFile: pendingApplication.cvFile,
        aiInterview: result,
      });
      setToast({
        type: "success",
        message: "Entretien termine et candidature envoyee",
      });
      setPendingApplication(null);
      setApplicationForm({
        coverLetter: "",
        candidatePhone: "",
        cvFile: null,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Impossible d'envoyer la candidature",
      });
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!job) {
      return;
    }

    setSubmittingApplication(true);

    try {
      const payload = {
        offerId: job.id,
        coverLetter: applicationForm.coverLetter,
        candidatePhone: applicationForm.candidatePhone,
        cvFile: applicationForm.cvFile,
      };

      if (job.hasAiTest) {
        setPendingApplication(payload);
        setShowApplyModal(false);
        setShowAiInterview(true);
        return;
      }

      await createApplication(payload);
      setShowApplyModal(false);
      setApplicationForm({
        coverLetter: "",
        candidatePhone: "",
        cvFile: null,
      });
      setToast({
        type: "success",
        message: "Candidature envoyee avec succes",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Impossible d'envoyer la candidature",
      });
    } finally {
      setSubmittingApplication(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]">
        <div className="text-center text-slate-500 dark:text-slate-300">
          Chargement de l'offre...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-4">
            {error || "Offre non trouvee"}
          </h2>
          <Link to="/search" className="text-blue-600 hover:underline">
            Retour à la recherche
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white transition">
        <ArrowLeft className="w-5 h-5" />
        Retour
      </button>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>
      )}

      <AiInterview isOpen={showAiInterview} onClose={() => setShowAiInterview(false)} job={job} onComplete={handleInterviewComplete}/>

      <div className="rounded-4xl overflow-hidden bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl
      border border-blue-100 dark:border-blue-900 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
        <div className="relative p-8 bg-linear-to-r from-blue-600 via-sky-600 to-blue-700 text-white">
          <button onClick={handleSave} className={`absolute top-6 right-6 p-3 rounded-2xl bg-white/10 transition ${animating ? "scale-125 rotate-12" : ""}`}>
            <Star className={`w-6 h-6 ${saved ? "fill-yellow-300 text-yellow-300" : "text-white"}`}/>
          </button>

          <h1 className="text-3xl font-bold">{job.title}</h1>

          <div className="flex flex-wrap gap-4 mt-4 text-blue-100">
            <span className="flex items-center gap-2">
              <Building2 /> {job.company}
            </span>
            <span className="flex items-center gap-2">
              <MapPin /> {job.location}
            </span>
            <span className="flex items-center gap-2">
              <Briefcase /> {job.type}
            </span>
            <span className="flex items-center gap-2">
              <Calendar />
              {new Date(job.postedDate).toLocaleDateString("fr-FR")}
            </span>
          </div>

          {salaryLabel && (
            <div className="mt-5 text-2xl font-semibold">
              {salaryLabel}
            </div>
          )}
        </div>

        <div className="relative p-8 space-y-10 text-gray-700 dark:text-blue-100">
          <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.06] pointer-events-none
            bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)]
            bg-size-[40px_40px]" />

          <div className="relative z-10 space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-blue-900 dark:text-white mb-2">
                Description
              </h2>
              <div className="space-y-4 leading-relaxed text-slate-700 dark:text-blue-100">
                <ReactMarkdown>{job.description || ""}</ReactMarkdown>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-blue-900 dark:text-white mb-2">
                Profil recherché
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="text-blue-500" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-blue-900 dark:text-white mb-2">
                Avantages
              </h2>
              <ul className="space-y-3">
                {job.benefits.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <Gift className="text-sky-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-blue-100 dark:border-blue-900">
              <button onClick={handleApply}
                className="w-full py-4 rounded-2xl font-semibold text-white
                bg-linear-to-r from-blue-600 via-sky-600 to-blue-700 hover:scale-[1.02] transition">
                {getExternalJobUrl() ? "Voir l'annonce source" : "Postuler maintenant"}
              </button>

              <button type="button" onClick={() => setShowReportModal(true)}
                className="w-full mt-3 py-3 rounded-2xl border border-red-200 text-red-600 hover:bg-red-100 hover:scale-[1.02] transition flex items-center justify-center gap-2">
                <Flag className="w-4 h-4" />
                Signaler l'offre
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Signaler cette offre</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choisis une raison et explique pourquoi ce signalement est important.</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">Fermer</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Raison</label>
                <select value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white">
                  <option>Contenu inapproprié</option>
                  <option>Annonce fausse</option>
                  <option>Spam / publicité</option>
                  <option>Informations manquantes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Détails</label>
                <textarea value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Explique pourquoi tu signales cette annonce..."
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white resize-none"/>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowReportModal(false)}
                  className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition">
                  Annuler
                </button>
                <button type="button" onClick={handleReport}
                  className="px-5 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition">
                  Envoyer le signalement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Finaliser la candidature</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ajoute ta lettre de motivation et ton CV avant l'envoi.
                </p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">Fermer</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Téléphone</label>
                <input
                  value={applicationForm.candidatePhone}
                  onChange={(e) => setApplicationForm((prev) => ({ ...prev, candidatePhone: e.target.value }))}
                  placeholder="06 12 34 56 78"
                  className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lettre de motivation</label>
                <textarea
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm((prev) => ({ ...prev, coverLetter: e.target.value }))}
                  placeholder="Explique pourquoi cette offre t'interesse et ce que tu peux apporter."
                  rows={6}
                  className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">CV</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) =>
                    setApplicationForm((prev) => ({
                      ...prev,
                      cvFile: e.target.files?.[0] || null,
                    }))
                  }
                  className="mt-2 block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white"
                />
                {applicationForm.cvFile && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {applicationForm.cvFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmitApplication()}
                  disabled={submittingApplication}
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {submittingApplication
                    ? "Envoi..."
                    : job.hasAiTest
                      ? "Continuer vers l'entretien IA"
                      : "Envoyer la candidature"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  </div>
  );
}

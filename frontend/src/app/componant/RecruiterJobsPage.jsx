import { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, Search, X, MapPin, Building2, Briefcase, CheckCircle, Gift } from "lucide-react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { NewJobOffer } from "./NewJobOffer";
import { createOffer, deleteOffer, fetchOffers, updateOffer } from "../services/api";

export function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchOffers({ mine: true, limit: 100, page: 1 });
        setJobs(response.data || []);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => job.title.toLowerCase().includes(search.toLowerCase()) || job.company.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id) => {
    await deleteOffer(id);
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
    setSelectedJob((prev) => (prev?.id === id ? null : prev));
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleView = (job) => {
    setSelectedJob(job);
  };

  const handleSaveJob = async (jobData) => {
    if (editingJob?.id) {
      const updatedJob = await updateOffer(editingJob.id, jobData);
      const updatedJobs = jobs.map((job) =>
        job.id === editingJob.id ? updatedJob : job
      );

      setJobs(updatedJobs);
      setSelectedJob((prev) =>
        prev?.id === editingJob.id ? updatedJob : prev
      );
    } else {
      const nextJob = await createOffer(jobData);
      setJobs([nextJob, ...jobs]);
    }

    setShowModal(false);
    setEditingJob(null);
  };

  useEffect(() => {
    if (!location.state?.openModal) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setEditingJob(null);
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.state]);

  return (
    <div className="relative space-y-10">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-purple-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div
          className={`absolute inset-0 opacity-65
          bg-[linear-gradient(to_right,rgba(168,85,247,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(168,85,247,0.16)_1.5px,transparent_1.5px)]
          dark:bg-[linear-gradient(to_right,rgba(192,132,252,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(192,132,252,0.16)_1.5px,transparent_1.5px)]
          bg-size-[36px_36px]`}/>

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/15 blur-3xl rounded-full" />

        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-400/15 dark:bg-purple-600/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm text-purple-500 dark:text-purple-400 font-semibold tracking-wide">
              Gestion recruteur
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
              Pilotage des offres
            </h1>

            <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Crée, modifie et gère tes offres d’emploi avec une interface
              moderne.
            </p>
          </div>

          <button onClick={() => { setEditingJob(null); setShowModal(true);}}
            className="group inline-flex items-center justify-center gap-2
            px-6 py-4 rounded-2xl
            bg-purple-700 hover:bg-purple-800 text-white font-medium
            shadow-lg shadow-purple-500/20
            hover:shadow-purple-500/40 hover:scale-[1.02] hover:-translate-y-0.5
            transition-all duration-300">
            <Plus className="w-5 h-5" />
            Nouvelle offre
          </button>
        </div>
      </div>

      <div className="sticky top-4 z-20">
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition" />

            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une offre..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-slate-900 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500
              transition"/>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Résultats
          </span>

          <span
            className="px-3 py-1 rounded-full text-xs font-medium
            bg-purple-50 dark:bg-purple-500/10
            text-purple-600 dark:text-purple-400
            border border-purple-100 dark:border-purple-500/20">
            {filteredJobs.length} offre
            {filteredJobs.length > 1 ? "s" : ""}
          </span>
        </div>

        {search && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            pour “{search}”
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-500">
          Chargement des offres...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-24">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-6">
            <Briefcase className="w-10 h-10 text-purple-500 opacity-80" />
          </div>

          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            Aucune offre trouvée
          </p>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Essaie une autre recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id}
              className="group relative overflow-hidden rounded-2xl
              border border-slate-200 dark:border-slate-800
              bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl
              hover:border-purple-400/40
              hover:shadow-2xl hover:shadow-purple-500/10
              hover:-translate-y-1
              transition-all duration-300">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500
                bg-[linear-gradient(to_right,rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.05)_1px,transparent_1px)]
                dark:bg-[linear-gradient(to_right,rgba(192,132,252,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(192,132,252,0.06)_1px,transparent_1px)]
                bg-size-[34px_34px]"/>

              <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />

              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-2xl
                      bg-purple-50 dark:bg-purple-500/10
                      border border-purple-100 dark:border-purple-500/10
                      flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold
                          text-slate-900 dark:text-white
                          group-hover:text-purple-600
                          dark:group-hover:text-purple-400
                          transition">
                          {job.title}
                        </h2>

                        {job.remote && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                            Remote
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
                        <Building2 className="w-4 h-4" />
                        <span>{job.company}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl
                          bg-slate-100 dark:bg-slate-800
                          text-xs text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>

                        <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs">
                          {job.type}
                        </span>

                        {getSalaryLabel(job) && (
                          <span className="px-3 py-1 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 text-xs">
                            {getSalaryLabel(job)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleView(job)}
                      className="group/btn p-3 rounded-2xl
                      bg-blue-50 dark:bg-blue-500/10
                      border border-blue-100 dark:border-blue-500/10
                      hover:bg-blue-600 hover:border-blue-600
                      transition-all duration-300">
                      <Eye className="w-5 h-5 text-blue-600 group-hover/btn:text-white transition" />
                    </button>

                    <button onClick={() => handleEdit(job)}
                      className="group/btn p-3 rounded-2xl
                      bg-amber-50 dark:bg-amber-500/10
                      border border-amber-100 dark:border-amber-500/10
                      hover:bg-amber-500 hover:border-amber-500
                      transition-all duration-300">
                      <Edit className="w-5 h-5 text-amber-600 group-hover/btn:text-white transition" />
                    </button>

                    <button onClick={() => handleDelete(job.id)}
                      className="group/btn p-3 rounded-2xl
                      bg-red-50 dark:bg-red-500/10
                      border border-red-100 dark:border-red-500/10
                      hover:bg-red-500 hover:border-red-500
                      transition-all duration-300">
                      <Trash2 className="w-5 h-5 text-red-600 group-hover/btn:text-white transition" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">
                  <ReactMarkdown>
                    {job.description || "Aucune description disponible pour cette offre."}
                  </ReactMarkdown>
                </div>

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {job.postedDate ? new Date(job.postedDate).toLocaleDateString("fr-FR") : "Aujourd’hui"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-4xl rounded-4xl overflow-hidden
            bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl
            border border-purple-100 dark:border-purple-900
            shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
            <div className="relative p-8 bg-linear-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white">
              <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition">
                <X className="w-6 h-6" />
              </button>

              <h1 className="text-3xl font-bold">
                {selectedJob.title}
              </h1>

              <div className="flex flex-wrap gap-4 mt-4 text-purple-100">
                <span className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedJob.company}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {selectedJob.location}
                </span>

                <span className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  {selectedJob.type}
                </span>
              </div>

              {getSalaryLabel(selectedJob) && (
                <div className="mt-5 text-2xl font-semibold">
                  {getSalaryLabel(selectedJob)}
                </div>
              )}
            </div>

            <div className="relative p-8 space-y-10 text-slate-700 dark:text-purple-100">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none
                bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)]
                bg-size-[40px_40px]"/>

              <div className="relative z-10 space-y-10">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    Description du poste
                  </h2>

                  <div className="leading-relaxed space-y-4 text-slate-700 dark:text-purple-100">
                    <ReactMarkdown>
                      {selectedJob.description || "Aucune description disponible."}
                    </ReactMarkdown>
                  </div>
                </div>

                {selectedJob.requirements && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      Profil recherché
                    </h2>

                    <ul className="space-y-3">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedJob.benefits && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      Avantages
                    </h2>

                    <ul className="space-y-3">
                      {selectedJob.benefits.map((benefit, index) => (
                        <li key={index} className="flex gap-3">
                          <Gift className="w-5 h-5 text-fuchsia-500 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <NewJobOffer isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingJob(null);
        }}
        initialData={editingJob}
        onSave={handleSaveJob}/>
    </div>
  );
}

import { useEffect, useState } from "react";
import { X, Bot, Sparkles, CheckCircle, Plus, Trash2, Briefcase, MapPin, Wallet, Award } from "lucide-react";
import { generateAiInterviewQuestions } from "../services/api";
import { Toast } from "./ui/Toast";

function normalizeQuestions(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(normalizeQuestions);
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
      .flatMap(([, nestedValue]) => normalizeQuestions(nestedValue));
  }

  return [];
}

const emptyForm = {
  title: "",
  type: "CDI",
  location: "",
  remote: false,
  salary: "",
  experience: "",
  description: "",
  requirements: [""],
  benefits: [""],
  hasAiTest: false,
  aiQuestions: [],
};

export function NewJobOffer({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(emptyForm);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [toast, setToast] = useState(null);
  const canGenerateQuestions =
    formData.title.trim().length >= 2 && formData.description.trim().length >= 10;

  useEffect(() => {
    const nextFormData = initialData
      ? {
          ...emptyForm,
          ...initialData,
          aiQuestions: normalizeQuestions(initialData.aiQuestions),
        }
      : emptyForm;
    const timeoutId = setTimeout(() => {
      setFormData(nextFormData);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      [field]: updated,
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({...prev, [field]: [...prev[field], ""]}));
  };

  const removeArrayItem = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData((prev) => ({...prev, [field]: updated.length ? updated : [""]}));
  };

  const generateAiQuestions = async () => {
    setIsGeneratingQuestions(true);

    try {
      const result = await generateAiInterviewQuestions({
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.filter(Boolean),
        experience: formData.experience,
        company: initialData?.company || "",
        type: formData.type,
      });

      setFormData((prev) => ({
        ...prev,
        hasAiTest: true,
        aiQuestions: normalizeQuestions(result.questions).slice(0, 5),
      }));

      setToast({
        type: "success",
        message: "Questions d'entretien générées via le backend IA",
      });
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Impossible de générer les questions d'entretien",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = ` w-full h-13 px-4 rounded-2xl
    border border-slate-200 dark:border-slate-700
    bg-white dark:bg-slate-800/80
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:ring-4 focus:ring-purple-500/10
    focus:border-purple-500
    outline-none transition`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto no-scrollbar rounded-4xl
        border border-slate-200 dark:border-slate-800
        bg-white/95 dark:bg-slate-900/95
        backdrop-blur-2xl
        shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
        <div className="absolute inset-0 opacity-[0.075] pointer-events-none
          bg-[linear-gradient(to_right,rgba(168,85,247,0.9)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.9)_1px,transparent_1px)]
          bg-size-[34px_34px]"/>

        <div className="absolute -top-20 right-0 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full" />

        <div className="absolute bottom-0 left-0 w-72 h-72 bg-fuchsia-500/5 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center justify-between px-8 py-7 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold tracking-wide text-purple-600 dark:text-purple-400">
                Espace recruteur
              </p>

              <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                {initialData
                  ? "Modifier l'offre"
                  : "Créer une nouvelle offre"}
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Gérez les informations du poste et configurez l’entretien IA.
              </p>
            </div>

            <button onClick={onClose}
              className="group p-3 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800
              hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-slate-700
              transition">
              <X className="w-5 h-5 text-slate-500 group-hover:text-purple-600 transition" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Titre du poste
              </label>

              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Frontend Developer React..."
                  className={`${inputClass} pl-12`}
                  required/>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type de contrat
                </label>

                <select value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className={inputClass}>

                  <option>CDI</option>
                  <option>CDD</option>
                  <option>Stage</option>
                  <option>Freelance</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Localisation
                </label>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Paris, France"
                    className={`${inputClass} pl-12`}
                    required/>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Salaire
                </label>

                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input value={formData.salary}
                    onChange={(e) => handleChange("salary", e.target.value)}
                    placeholder="45k - 60k"
                    className={`${inputClass} pl-12`}/>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Expérience
                </label>

                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    placeholder="3-5 ans"
                    className={`${inputClass} pl-12`}/>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Description du poste
              </label>

              <textarea value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Décris le poste, les missions et les technologies..."
                rows={6}
                className="w-full px-4 py-4 rounded-2xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-800/80
                text-slate-900 dark:text-white
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500
                outline-none transition resize-none"/>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Profil recherché
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ajoute les compétences et critères recherchés.
                  </p>
                </div>

                <button type="button"
                  onClick={() => addArrayItem("requirements")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                  bg-purple-600 text-white text-sm font-medium
                  hover:bg-purple-700 hover:scale-[1.02]
                  transition">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {formData.requirements.map((req, i) => (
                  <div key={i} className="flex gap-3">
                    <input
                      value={req}
                      onChange={(e) => handleArrayChange("requirements", i, e.target.value)}
                      placeholder={`Compétence #${i + 1}`}
                      className={inputClass}/>

                    <button type="button"
                      onClick={() => removeArrayItem("requirements", i)}
                      className="h-13 w-13 shrink-0 rounded-2xl
                      border border-red-200 dark:border-red-500/20
                      bg-red-50 dark:bg-red-500/10
                      text-red-500
                      hover:bg-red-100 dark:hover:bg-red-500/20
                      transition flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Avantages
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ajoute les bénéfices proposés aux candidats.
                  </p>
                </div>

                <button type="button"
                  onClick={() => addArrayItem("benefits")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                  bg-purple-600 text-white text-sm font-medium
                  hover:bg-purple-700 hover:scale-[1.02]
                  transition">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {formData.benefits.map((b, i) => (
                  <div key={i} className="flex gap-3">
                    <input value={b}
                      onChange={(e) => handleArrayChange("benefits", i, e.target.value)}
                      placeholder={`Avantage #${i + 1}`}
                      className={inputClass}/>

                    <button type="button"
                      onClick={() => removeArrayItem("benefits", i)}
                      className="h-13 w-13 shrink-0 rounded-2xl
                      border border-red-200 dark:border-red-500/20
                      bg-red-50 dark:bg-red-500/10
                      text-red-500
                      hover:bg-red-100 dark:hover:bg-red-500/20
                      transition flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/70 dark:bg-purple-500/5 p-5">
              <div className="flex items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-2xl
                    bg-purple-100 dark:bg-purple-500/10
                    flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Entretien IA
                      </h3>

                      {formData.hasAiTest && (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Activé
                        </div>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                      Génère automatiquement des questions pour
                      pré-évaluer les candidats.
                    </p>
                  </div>
                </div>

                {!formData.hasAiTest && (
                  <button type="button"
                    onClick={generateAiQuestions}
                    disabled={isGeneratingQuestions || !canGenerateQuestions}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                    bg-purple-600 text-white text-sm font-medium
                    hover:bg-purple-700 hover:scale-[1.02]
                    transition shrink-0 disabled:opacity-60 disabled:hover:scale-100">
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingQuestions ? "Génération..." : "Générer"}
                  </button>
                )}
              </div>

              {formData.hasAiTest &&
                formData.aiQuestions.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-purple-200 dark:border-purple-500/10 bg-white/70 dark:bg-slate-900/60 p-4">
                    <div className="space-y-3">
                      {formData.aiQuestions.map(
                        (question, index) => (
                          <div key={index} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <span className="text-purple-600 font-semibold">
                              {index + 1}.
                            </span>

                            <span>{question}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-800
                text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-700
                transition">
                Annuler
              </button>

              <button type="submit"
                className="px-7 py-3 rounded-2xl
                bg-purple-700 text-white font-medium
                hover:bg-purple-800
                hover:shadow-lg hover:shadow-purple-500/20
                hover:scale-[1.02]
                transition-all duration-300">
                {initialData ? "Modifier l'offre" : "Publier l'offre"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

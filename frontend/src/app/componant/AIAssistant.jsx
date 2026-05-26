import React, { useState } from "react";
import {
  Bot,
  FileText,
  Mail,
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { generateAiCoverLetter, generateAiCv } from "../services/api";
import { Toast } from "./ui/Toast";

const FIELD_LABELS = {
  name: "Nom complet",
  email: "Email",
  phone: "Telephone",
  city: "Ville",
  mobility: "Mobilite",
  linkedin: "LinkedIn",
  github: "GitHub",
  title: "Titre professionnel",
  summary: "Presentation",
  experience: "Experience professionnelle",
  projects: "Projets informatiques",
  skills: "Competences",
  education: "Formation",
  languages: "Langues",
  softSkills: "Atouts",
  interests: "Centres d'interet",
  company: "Nom de l'entreprise",
  position: "Poste vise",
  motivation: "Motivation",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildMinLengthMessage(label, min) {
  return `${label} doit contenir au moins ${min} caracteres.`;
}

function buildMaxLengthMessage(label, max) {
  return `${label} doit contenir au maximum ${max} caracteres.`;
}

function validateCvData(data) {
  const errors = {};
  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const phone = String(data.phone || '').trim();
  const title = String(data.title || '').trim();
  const summary = String(data.summary || '').trim();
  const experience = String(data.experience || '').trim();
  const projects = String(data.projects || '').trim();
  const skills = String(data.skills || '').trim();
  const education = String(data.education || '').trim();
  const languages = String(data.languages || '').trim();

  if (name.length < 2) {
    errors.name = buildMinLengthMessage(FIELD_LABELS.name, 2);
  } else if (name.length > 120) {
    errors.name = buildMaxLengthMessage(FIELD_LABELS.name, 120);
  }

  if (!email) {
    errors.email = `${FIELD_LABELS.email} est requis.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Veuillez saisir une adresse e-mail valide.";
  }

  if (phone.length > 40) {
    errors.phone = buildMaxLengthMessage(FIELD_LABELS.phone, 40);
  }

  if (title.length < 2) {
    errors.title = buildMinLengthMessage(FIELD_LABELS.title, 2);
  } else if (title.length > 120) {
    errors.title = buildMaxLengthMessage(FIELD_LABELS.title, 120);
  }

  if (experience.length < 10) {
    errors.experience = buildMinLengthMessage(FIELD_LABELS.experience, 10);
  } else if (experience.length > 4000) {
    errors.experience = buildMaxLengthMessage(FIELD_LABELS.experience, 4000);
  }

  if (skills.length < 2) {
    errors.skills = buildMinLengthMessage(FIELD_LABELS.skills, 2);
  } else if (skills.length > 1000) {
    errors.skills = buildMaxLengthMessage(FIELD_LABELS.skills, 1000);
  }

  if (education.length < 2) {
    errors.education = buildMinLengthMessage(FIELD_LABELS.education, 2);
  } else if (education.length > 2000) {
    errors.education = buildMaxLengthMessage(FIELD_LABELS.education, 2000);
  }


  if (summary && summary.length < 10) {
    errors.summary = buildMinLengthMessage(FIELD_LABELS.summary, 10);
  }

  if (projects && projects.length < 10) {
    errors.projects = buildMinLengthMessage(FIELD_LABELS.projects, 10);
  }

  if (languages && languages.length < 2) {
    errors.languages = buildMinLengthMessage(FIELD_LABELS.languages, 2);
  }

  return errors;
}

function validateLetterData(data) {
  const errors = {};
  const company = String(data.company || '').trim();
  const position = String(data.position || '').trim();
  const motivation = String(data.motivation || '').trim();

  if (company.length < 2) {
    errors.company = buildMinLengthMessage(FIELD_LABELS.company, 2);
  } else if (company.length > 120) {
    errors.company = buildMaxLengthMessage(FIELD_LABELS.company, 120);
  }

  if (position.length < 2) {
    errors.position = buildMinLengthMessage(FIELD_LABELS.position, 2);
  } else if (position.length > 120) {
    errors.position = buildMaxLengthMessage(FIELD_LABELS.position, 120);
  }

  if (motivation.length < 10) {
    errors.motivation = buildMinLengthMessage(FIELD_LABELS.motivation, 10);
  } else if (motivation.length > 3000) {
    errors.motivation = buildMaxLengthMessage(FIELD_LABELS.motivation, 3000);
  }

  return errors;
}

function formatApiIssue(field, issue) {
  const label = FIELD_LABELS[field] || field;
  const message = issue?.message || "";
  const minMatch = message.match(/at least (\d+)/i);
  const maxMatch = message.match(/at most (\d+)/i);

  if (/invalid email/i.test(message)) {
    return "Veuillez saisir une adresse e-mail valide.";
  }

  if (minMatch) {
    return buildMinLengthMessage(label, Number(minMatch[1]));
  }

  if (maxMatch) {
    return buildMaxLengthMessage(label, Number(maxMatch[1]));
  }

  if (/required/i.test(message)) {
    return `${label} est requis.`;
  }

  return message || `Veuillez corriger le champ ${label.toLowerCase()}.`;
}

function mapApiFieldErrors(details) {
  if (!Array.isArray(details)) {
    return {};
  }

  return details.reduce((errors, issue) => {
    const field = issue?.path?.[0];

    if (!field || errors[field]) {
      return errors;
    }

    errors[field] = formatApiIssue(field, issue);
    return errors;
  }, {});
}

export function parseCvContent(content) {
  if (!content || typeof content !== "string") return null;

  const lines = content.split(/\r?\n/).map((l) => l.trim());
  const sections = {};
  let current = null;

  const sectionHeaderRe = /^([A-Za-zÀ-ÖØ-öø-ÿ \-']{2,50})\s*[:\-]$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const headerMatch = line.match(sectionHeaderRe);
    if (headerMatch) {
      current = headerMatch[1];
      sections[current] = [];
      continue;
    }

    const inlineMatch = line.match(/^([A-Za-zÀ-ÖØ-öø-ÿ \-']{2,50})[:\-]\s*(.*)$/);
    if (inlineMatch) {
      const title = inlineMatch[1];
      const rest = inlineMatch[2];
      sections[title] = sections[title] || [];
      if (rest) sections[title].push(rest);
      current = title;
      continue;
    }

    if (current) {
      sections[current].push(line);
    } else {
      sections._misc = sections._misc || [];
      sections._misc.push(line);
    }
  }

  const misc = (sections._misc || []).filter(Boolean);
  const header = { name: misc[0] || "", title: misc[1] || "" };

  const emailRe = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  const phoneRe = /\+?[0-9][0-9 .\-]{6,}/;

  for (const line of lines) {
    const e = line.match(emailRe);
    if (e && !header.email) header.email = e[0];
    const p = line.match(phoneRe);
    if (p && !header.phone) header.phone = p[0];
  }

  return { header, sections };
}


function splitCvLines(value) {
  return String(value || "")
    .split(/\r?\n|•|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitSkillTags(value) {
  return String(value || "")
    .split(/,|\r?\n|•|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "CV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function CvSidebarBlock({ title, children }) {
  if (!children) return null;

  return (
    <section className="mt-7 first:mt-0">
      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

function CvBulletList({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className="space-y-2 text-sm leading-snug">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="font-medium text-slate-100">
          {item}
        </li>
      ))}
    </ul>
  );
}

function CvMainSection({ title, children }) {
  if (!children) return null;

  return (
    <section className="mb-7 last:mb-0">
      <h3 className="text-xl font-extrabold text-sky-500 mb-3">{title}</h3>
      {children}
    </section>
  );
}

function CvTimelineText({ value }) {
  const lines = splitCvLines(value);

  if (lines.length === 0) return null;

  return (
    <div className="relative border-l-2 border-slate-900/80 pl-6 space-y-4">
      {lines.map((line, index) => {
        const [strongPart, ...rest] = line.split(" - ");
        const detail = rest.join(" - ");

        return (
          <article key={`${line}-${index}`} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-slate-900" />
            <p className="text-sm font-bold text-slate-900">{strongPart}</p>
            {detail ? (
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{detail}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export function AIAssistant() {
  const [activeTab, setActiveTab] = useState("cv");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatedContent, setGeneratedContent] = useState({
    cv: "",
    letter: "",
  });

  const [cvData, setCvData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    mobility: "",
    linkedin: "",
    github: "",
    title: "",
    summary: "",
    experience: "",
    projects: "",
    skills: "",
    education: "",
    languages: "",
    softSkills: "",
    interests: "",
  });

  const [letterData, setLetterData] = useState({
    company: "",
    position: "",
    motivation: "",
  });

  const previewContent = activeTab === "cv" ? generatedContent.cv : generatedContent.letter;
  const hasGenerated = Boolean(previewContent);

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 ${
      fieldErrors[field]
        ? "border-red-400 bg-red-50 text-slate-900 focus:ring-red-500"
        : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
    }`;

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateCvField = (field, value) => {
    setCvData((prev) => ({ ...prev, [field]: value }));
    setGeneratedContent((prev) => ({ ...prev, cv: "" }));
    clearFieldError(field);
  };

  const updateLetterField = (field, value) => {
    setLetterData((prev) => ({ ...prev, [field]: value }));
    setGeneratedContent((prev) => ({ ...prev, letter: "" }));
    clearFieldError(field);
  };

  const handleGenerate = async () => {
    const nextFieldErrors =
      activeTab === "cv" ? validateCvData(cvData) : validateLetterData(letterData);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setToast({
        type: "error",
        message: "Certains champs doivent etre corriges avant la generation.",
      });
      return;
    }

    setFieldErrors({});
    setGenerating(true);

    try {
      if (activeTab === "cv") {
        const result = await generateAiCv(cvData);
        setGeneratedContent((prev) => ({
          ...prev,
          cv: result.content,
        }));
      } else {
        const result = await generateAiCoverLetter({
          ...letterData,
          name: cvData.name || "Candidat",
          title: cvData.title,
          skills: cvData.skills,
          experience: cvData.experience,
          education: cvData.education,
        });
        setGeneratedContent((prev) => ({
          ...prev,
          letter: result.content,
        }));
      }

      setToast({
        type: "success",
        message:
          activeTab === "cv"
            ? "CV généré depuis le backend IA"
            : "Lettre générée depuis le backend IA",
      });
    } catch (error) {
      const apiFieldErrors = mapApiFieldErrors(error.details);

      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
      }

      setToast({
        type: "error",
        message:
          Object.keys(apiFieldErrors).length > 0
            ? "Le formulaire contient encore des champs invalides."
            : error.message || "Impossible de generer le document",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewContent);
      setToast({
        type: "success",
        message: "Contenu copié dans le presse-papiers",
      });
    } catch {
      setToast({
        type: "error",
        message: "Impossible de copier le contenu",
      });
    }
  };

  const handleDownload = () => {
    const extension = "txt";
    const fileName = activeTab === "cv" ? "cv-ia.txt" : "lettre-motivation-ia.txt";
    const blob = new Blob([previewContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName.replace(/\.txt$/, `.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gridBg = `absolute inset-0 opacity-65
  bg-[linear-gradient(to_right,rgba(59,130,246,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(59,130,246,0.16)_1.5px,transparent_1.5px)]
  dark:bg-[linear-gradient(to_right,rgba(96,165,250,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(96,165,250,0.16)_1.5px,transparent_1.5px)]
  bg-[size:36px_36px]`;

  return (
    <div className="space-y-10">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={gridBg} />

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Assistant IA
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            CV & lettres de motivation
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Génère des documents professionnels optimisés via le backend IA du projet.
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("cv")}
          className={`flex items-center gap-2 px-5 py-3 font-medium border-b-2 transition ${
            activeTab === "cv"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          Générateur de CV
        </button>

        <button
          onClick={() => setActiveTab("letter")}
          className={`flex items-center gap-2 px-5 py-3 font-medium border-b-2 transition ${
            activeTab === "letter"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Mail className="w-4 h-4" />
          Lettre de motivation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-blue-600" />
            {activeTab === "cv" ? "Informations CV" : "Informations Lettre"}
          </h2>

          {activeTab === "cv" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet
                </label>

                <input
                  type="text"
                  value={cvData.name}
                  onChange={(e) => updateCvField("name", e.target.value)}
                  placeholder="Jean Dupont"
                  className={inputClass("name")}
                />
                {fieldErrors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    value={cvData.email}
                    onChange={(e) => updateCvField("email", e.target.value)}
                    placeholder="jean@email.com"
                    className={inputClass("email")}
                  />
                  {fieldErrors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>

                  <input
                    type="tel"
                    value={cvData.phone}
                    onChange={(e) => updateCvField("phone", e.target.value)}
                    placeholder="06 12 34 56 78"
                    className={inputClass("phone")}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ville
                  </label>

                  <input
                    type="text"
                    value={cvData.city}
                    onChange={(e) => updateCvField("city", e.target.value)}
                    placeholder="Marseille"
                    className={inputClass("city")}
                  />
                  {fieldErrors.city && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobilité
                  </label>

                  <input
                    type="text"
                    value={cvData.mobility}
                    onChange={(e) => updateCvField("mobility", e.target.value)}
                    placeholder="Marseille, Aix, télétravail..."
                    className={inputClass("mobility")}
                  />
                  {fieldErrors.mobility && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.mobility}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub
                  </label>

                  <input
                    type="text"
                    value={cvData.github}
                    onChange={(e) => updateCvField("github", e.target.value)}
                    placeholder="@BipBip-Epi"
                    className={inputClass("github")}
                  />
                  {fieldErrors.github && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.github}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn
                  </label>

                  <input
                    type="text"
                    value={cvData.linkedin}
                    onChange={(e) => updateCvField("linkedin", e.target.value)}
                    placeholder="@Lorenzo Philippon"
                    className={inputClass("linkedin")}
                  />
                  {fieldErrors.linkedin && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.linkedin}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre professionnel
                </label>

                <input
                  type="text"
                  value={cvData.title}
                  onChange={(e) => updateCvField("title", e.target.value)}
                  placeholder="Développeur Full Stack Senior"
                  className={inputClass("title")}
                />
                {fieldErrors.title && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Présentation
                </label>

                <textarea
                  rows={4}
                  value={cvData.summary}
                  onChange={(e) => updateCvField("summary", e.target.value)}
                  placeholder="Étudiant en 1re année d'informatique, passionné par la cybersécurité..."
                  className={inputClass("summary")}
                />
                {fieldErrors.summary && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.summary}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expérience professionnelle
                </label>

                <textarea
                  rows={5}
                  value={cvData.experience}
                  onChange={(e) => updateCvField("experience", e.target.value)}
                  placeholder="Décrivez votre expérience..."
                  className={inputClass("experience")}
                />
                {fieldErrors.experience && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.experience}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Projets informatiques
                </label>

                <textarea
                  rows={5}
                  value={cvData.projects}
                  onChange={(e) => updateCvField("projects", e.target.value)}
                  placeholder="Hack & Juice, E-Todo..."
                  className={inputClass("projects")}
                />
                {fieldErrors.projects && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.projects}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Compétences
                </label>

                <input
                  type="text"
                  value={cvData.skills}
                  onChange={(e) => updateCvField("skills", e.target.value)}
                  placeholder="React, Node.js, TypeScript..."
                  className={inputClass("skills")}
                />
                {fieldErrors.skills && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.skills}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formation
                </label>

                <textarea
                  rows={4}
                  value={cvData.education}
                  onChange={(e) => updateCvField("education", e.target.value)}
                  placeholder="Votre parcours académique..."
                  className={inputClass("education")}
                />
                {fieldErrors.education && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.education}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Langues
                </label>

                <textarea
                  rows={3}
                  value={cvData.languages}
                  onChange={(e) => updateCvField("languages", e.target.value)}
                  placeholder="Français : maternel, Anglais : B1..."
                  className={inputClass("languages")}
                />
                {fieldErrors.languages && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.languages}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Atouts
                </label>

                <textarea
                  rows={3}
                  value={cvData.softSkills}
                  onChange={(e) => updateCvField("softSkills", e.target.value)}
                  placeholder="Travail d'équipe, apprentissage rapide, autonomie, organisation..."
                  className={inputClass("softSkills")}
                />
                {fieldErrors.softSkills && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.softSkills}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Centres d'intérêt
                </label>

                <textarea
                  rows={3}
                  value={cvData.interests}
                  onChange={(e) => updateCvField("interests", e.target.value)}
                  placeholder="Sport, informatique, jeux vidéo, animaux..."
                  className={inputClass("interests")}
                />
                {fieldErrors.interests && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.interests}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de l'entreprise
                </label>

                <input
                  type="text"
                  value={letterData.company}
                  onChange={(e) => updateLetterField("company", e.target.value)}
                  placeholder="TechCorp"
                  className={inputClass("company")}
                />
                {fieldErrors.company && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.company}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Poste visé
                </label>

                <input
                  type="text"
                  value={letterData.position}
                  onChange={(e) => updateLetterField("position", e.target.value)}
                  placeholder="Lead Developer"
                  className={inputClass("position")}
                />
                {fieldErrors.position && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.position}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivation
                </label>

                <textarea
                  rows={8}
                  value={letterData.motivation}
                  onChange={(e) => updateLetterField("motivation", e.target.value)}
                  placeholder="Expliquez pourquoi ce poste vous intéresse..."
                  className={inputClass("motivation")}
                />
                {fieldErrors.motivation && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.motivation}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-sky-600 text-white px-6 py-4 rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Générer avec l'IA
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aperçu</h2>

            {hasGenerated && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-sky-600 text-white rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            )}
          </div>

          {activeTab === "cv" && hasGenerated ? (
            <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-4 border border-gray-200 dark:border-gray-700 max-h-175 overflow-y-auto">
              <div className="mx-auto w-full max-w-[760px] min-h-[980px] bg-white shadow-2xl text-slate-900 overflow-hidden grid grid-cols-[230px_1fr]">
                <aside className="bg-[#303030] text-slate-100 px-6 py-7">
                  <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-[#303030] text-3xl font-black ring-4 ring-white/10">
                    {getInitials(cvData.name)}
                  </div>

                  <div className="space-y-3 text-sm text-slate-200">
                    {cvData.email && <p>✉ {cvData.email}</p>}
                    {cvData.city && <p>⌂ {cvData.city}</p>}
                    {cvData.mobility && <p>⚑ {cvData.mobility}</p>}
                    {cvData.phone && <p>☎ {cvData.phone}</p>}
                    {cvData.linkedin && <p>in {cvData.linkedin}</p>}
                    {cvData.github && <p>GitHub {cvData.github}</p>}
                  </div>

                  <CvSidebarBlock title="Langues">
                    <CvBulletList items={splitCvLines(cvData.languages)} />
                  </CvSidebarBlock>

                  <CvSidebarBlock title="Atouts">
                    <CvBulletList items={splitCvLines(cvData.softSkills)} />
                  </CvSidebarBlock>

                  <CvSidebarBlock title="Centres d'intérêt">
                    <CvBulletList items={splitCvLines(cvData.interests)} />
                  </CvSidebarBlock>
                </aside>

                <main className="px-8 py-8">
                  <header className="mb-7">
                    <h1 className="text-3xl font-black tracking-tight text-slate-950">
                      {cvData.name || "Nom complet"}
                    </h1>

                    {cvData.title && (
                      <p className="mt-2 text-base font-semibold text-slate-700">
                        {cvData.title}
                      </p>
                    )}

                    {cvData.summary && (
                      <p className="mt-5 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                        {cvData.summary}
                      </p>
                    )}
                  </header>

                  <CvMainSection title="Diplômes et Formations">
                    <CvTimelineText value={cvData.education} />
                  </CvMainSection>

                  <CvMainSection title="Expériences professionnelles">
                    <CvTimelineText value={cvData.experience} />
                  </CvMainSection>

                  <CvMainSection title="Projet Informatique">
                    <CvTimelineText value={cvData.projects} />
                  </CvMainSection>

                  {cvData.skills && (
                    <CvMainSection title="Compétences Informatique">
                      <div className="flex flex-wrap gap-2">
                        {splitSkillTags(cvData.skills).map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CvMainSection>
                  )}

                  {!cvData.name &&
                    !cvData.title &&
                    !cvData.summary &&
                    !cvData.experience &&
                    !cvData.projects &&
                    !cvData.skills &&
                    !cvData.education && (
                      <div className="flex flex-col items-center justify-center h-175 text-center">
                        <div className="p-6 bg-blue-100 rounded-full mb-6">
                          <Bot className="w-16 h-16 text-blue-600" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Prêt à créer votre CV ?
                        </h3>

                        <p className="text-gray-600 max-w-md">
                          Remplissez le formulaire pour voir un aperçu proche du modèle fourni.
                        </p>
                      </div>
                    )}
                </main>
              </div>
            </div>
          ) : hasGenerated ? (
            (() => {
              const parsed = activeTab === "cv" ? parseCvContent(previewContent) : null;

              if (parsed && Object.keys(parsed.sections).length > 0) {
                return (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 max-h-175 overflow-y-auto">
                    <div className="max-w-full mx-auto text-slate-900 dark:text-slate-100">
                      <header className="mb-4">
                        <h1 className="text-2xl font-bold">{parsed.header.name}</h1>
                        {parsed.header.title && (
                          <p className="text-sm text-slate-600 dark:text-slate-300">{parsed.header.title}</p>
                        )}
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1">
                          {parsed.header.email && <span>{parsed.header.email}</span>}
                          {parsed.header.phone && <span>{parsed.header.phone}</span>}
                        </div>
                      </header>

                      <main className="space-y-4">
                        {Object.entries(parsed.sections).map(([title, lines]) => {
                          if (title === "_misc") return null;

                          return (
                            <section key={title} className="">
                              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                                {title}
                              </h3>
                              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                {lines.map((l, idx) => (
                                  <p key={idx} className="mb-1">
                                    {l}
                                  </p>
                                ))}
                              </div>
                            </section>
                          );
                        })}
                      </main>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 max-h-175 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {previewContent}
                  </pre>
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center h-175 text-center">
              <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                <Bot className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Prêt à créer votre {activeTab === "cv" ? "CV" : "lettre de motivation"} ?
              </h3>

              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Remplissez le formulaire puis cliquez sur "Générer avec l'IA" pour obtenir un
                document personnalisé depuis le backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { validateCvData, validateLetterData };

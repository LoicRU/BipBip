import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { USER_TYPES } from "../constants/userTypes";
import { User, Lock, Bell, Save, Trash2 } from "lucide-react";
import { Toast } from "./ui/Toast";
import { deleteAccount } from "../services/api";

export function Settings() {
  const { userType, user, updateCurrentUser, logout } = useApp();
  const isTech = userType === USER_TYPES.TECH;

  const theme = isTech
    ? {
        primary: "blue",
        gradient:
          "from-sky-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950",
        accent: "text-blue-600",
        button: "from-blue-600 to-sky-600",
        ring: "focus:ring-blue-500 focus:border-blue-500",
        gridBg: `absolute inset-0 opacity-60
          bg-[linear-gradient(to_right,rgba(59,130,246,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(59,130,246,0.16)_1.5px,transparent_1.5px)]
          dark:bg-[linear-gradient(to_right,rgba(96,165,250,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(96,165,250,0.16)_1.5px,transparent_1.5px)]
          bg-[size:36px_36px]`,
      }
    : {
        primary: "purple",
        gradient:
          "from-purple-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950",
        accent: "text-purple-600",
        button: "from-purple-600 to-fuchsia-600",
        ring: "focus:ring-purple-500 focus:border-purple-500",
        gridBg: `absolute inset-0 opacity-60
          bg-[linear-gradient(to_right,rgba(168,85,247,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(168,85,247,0.16)_1.5px,transparent_1.5px)]
          dark:bg-[linear-gradient(to_right,rgba(192,132,252,0.16)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(192,132,252,0.16)_1.5px,transparent_1.5px)]
          bg-[size:36px_36px]`,
      };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "06 12 34 56 78",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    website: "",
    description: "",
    emailNotifications: true,
    jobAlerts: true,
    newsletter: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        name:
          user?.name ||
          (userType === USER_TYPES.RECRUITER ? "Entreprise" : "Utilisateur"),
        email: user?.email || "",
        website:
          userType === USER_TYPES.RECRUITER ? prev.website || "https://" : "",
        description:
          userType === USER_TYPES.RECRUITER
            ? prev.description || "Presentation entreprise a completer."
            : "",
      }));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [user, userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      const updatedUser = await updateCurrentUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      setFormData((prev) => ({
        ...prev,
        name: updatedUser.name || "",
        email: updatedUser.email || "",
      }));

      setToast({
        type: "success",
        message:
          userType === USER_TYPES.RECRUITER
            ? "Profil enregistre. Le nom d'entreprise sera reutilise pour les nouvelles offres."
            : "Profil enregistre avec succes.",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Impossible de mettre a jour le profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setToast({ type: "error", message: "Veuillez saisir votre mot de passe." });
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAccount({ password: deletePassword });
      setToast({ type: "success", message: "Compte supprimé avec succès." });
      logout();
      navigate("/search");
    } catch (err) {
      setToast({ type: "error", message: err.message || "Impossible de supprimer le compte." });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword("");
    }
  };

  const inputClass =
    `w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900
     border border-slate-200 dark:border-slate-800
     text-slate-900 dark:text-white
     focus:ring-4 focus:ring-opacity-10 outline-none transition
     ${theme.ring}`;

  const cardClass =
    "relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 " +
    "bg-white dark:bg-slate-900 p-6 hover:scale-[1.01] transition-all duration-300";

  const toggleActive = isTech ? "bg-blue-600" : "bg-purple-600";

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className={theme.gridBg} />

        <div className={`absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl ${isTech ? "bg-blue-300/20" : "bg-purple-300/20"}`}/>

        <div className="relative z-10">
          <p className={`text-sm font-semibold ${theme.accent}`}>
            Paramètres
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Configuration du compte
          </h1>

          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Gérez vos informations et préférences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className={cardClass}>
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            <User className={`w-5 h-5 ${theme.accent}`} />
            Informations
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <input className={inputClass} value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={userType === USER_TYPES.RECRUITER ? "Entreprise" : "Nom complet"}/>

            <input className={inputClass} value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email"/>

            <input className={inputClass} value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Téléphone"/>

            {userType === USER_TYPES.RECRUITER && (
              <input className={inputClass} value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="Site web"/>
            )}
          </div>

          {userType === USER_TYPES.RECRUITER && (
            <textarea className={`${inputClass} mt-5`}
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description entreprise"/>
          )}
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            <Lock className={`w-5 h-5 ${theme.accent}`} />
            Sécurité
          </h2>

          <input className={`${inputClass} mb-4`}
            type="password"
            value={formData.currentPassword}
            onChange={(e) => handleChange("currentPassword", e.target.value)}
            placeholder="Mot de passe actuel"/>

          <div className="grid md:grid-cols-2 gap-5">
            <input className={inputClass}
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              placeholder="Nouveau mot de passe"/>

            <input className={inputClass}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Confirmer"/>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            <Bell className={`w-5 h-5 ${theme.accent}`} />
            Notifications
          </h2>

          <div className="space-y-5">
            {[
              { label: "Email", key: "emailNotifications" },
              { label: userType === USER_TYPES.RECRUITER ? "Alertes candidatures" : "Alertes emploi", key: "jobAlerts" },
              { label: "Newsletter", key: "newsletter" },
            ].map((item) => {
              const active = formData[item.key];

              return (
                <div key={item.key} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>{item.label}</span>

                  <button type="button"
                    onClick={() => handleChange(item.key, !active)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${active ? toggleActive : "bg-slate-300 dark:bg-slate-700"}`}>
                    <div className={`h-4 w-4 bg-white rounded-full shadow transform transition ${active ? "translate-x-5" : "translate-x-0"}`}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Supprimer mon compte</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cette action est irréversible. Tu devras confirmer avec ton mot de passe.</p>
            </div>
            <button type="button" onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition">
              <Trash2 className="w-4 h-4" />
              Supprimer mon compte
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-semibold text-white
            bg-linear-to-r ${theme.button}
            hover:scale-[1.03] transition disabled:opacity-60 disabled:hover:scale-100`}
            disabled={isSaving}>
            <Save className="w-5 h-5" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
            <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Confirmer la suppression</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Rentre ton mot de passe pour supprimer définitivement ton compte.</p>
                </div>
                <button type="button" onClick={() => setShowDeleteModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">Annuler</button>
              </div>

              {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Mot de passe actuel"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={inputClass}
                />

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowDeleteModal(false)}
                    className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition">
                    Annuler
                  </button>
                  <button type="button" onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-5 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60">
                    {isDeleting ? "Suppression..." : "Supprimer le compte"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}

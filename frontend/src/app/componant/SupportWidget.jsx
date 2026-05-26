import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { USER_TYPES } from "../constants/userTypes";

export function SupportWidget() {
  const { userType, createSupportTicket } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState("");

  if (![USER_TYPES.TECH, USER_TYPES.RECRUITER].includes(userType)) {
    return null;
  }

  const isTech = userType === USER_TYPES.TECH;

  const theme = isTech
    ? {
        primary: "blue",
        accent: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-500",
        ring: "focus:ring-blue-500",
        floating: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
      }
    : {
        primary: "purple",
        accent: "text-purple-600",
        button: "bg-purple-600 hover:bg-purple-500",
        ring: "focus:ring-purple-500",
        floating: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20",
      };

  const resetForm = () => {
    setSubject("");
    setDescription("");
    setFeedback("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!subject.trim() || !description.trim()) {
      setFeedback("Veuillez décrire votre problème ou question.");
      return;
    }

    try {
      await createSupportTicket({
        subject: subject.trim(),
        description: description.trim(),
      });

      setFeedback("Message envoyé avec succès. L'équipe admin sera alertée.");
      resetForm();
      setTimeout(() => setIsOpen(false), 1200);
    } catch (err) {
      setFeedback(err.message || "Impossible d'envoyer le message.");
    }
  };

  return (
    <>
      <button type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 bottom-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl transition ${theme.floating}`}
        title="Contacter le support">
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className={`text-sm uppercase tracking-[0.3em] font-semibold ${theme.accent}`}>
                  Support admin
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Envoyer un message au support
                </h2>
              </div>

              <button type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sujet
                </label>

                <input value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Titre du problème"
                  className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 ${theme.ring}`}
                  required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>

                <textarea value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expliquez votre problème ou question en détail"
                  rows={5}
                  className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 ${theme.ring}`}
                  required/>
              </div>

              {feedback && (
                <p className={`text-sm ${isTech ? "text-blue-600" : "text-purple-600"}`}>
                  {feedback}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  Annuler
                </button>

                <button type="submit" className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white transition ${theme.button}`}>
                  <Send className="w-4 h-4" />
                  Envoyer au support
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

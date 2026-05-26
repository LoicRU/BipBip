import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] relative overflow-hidden flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-30 left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-slate-300/30 dark:bg-slate-700/20 blur-3xl"/>

        <div className="absolute -bottom-50 -right-25 w-100 h-100 rounded-full bg-slate-200/40 dark:bg-slate-800/30 blur-3xl"/>

        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[48px_48px]"/>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mx-auto rounded-3xl bg-slate-100/80 dark:bg-white/5 px-4 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold tracking-tight text-[#111827] dark:text-white">
                BipBip
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                BipBip, le site qui te trouve vite un job.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-4xl shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-8">
          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Mot de passe oublié
                </h2>

                <p className="mt-3 leading-relaxed text-gray-500 dark:text-gray-400">
                  Entrez votre adresse email afin de recevoir
                  un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse email
                  </label>

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition" />

                    <input type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none transition text-gray-900 dark:text-white"/>
                  </div>
                </div>

                <button type="submit"
                  className="group w-full h-14 rounded-2xl bg-[#111827] hover:bg-[#1E293B] text-white font-medium flex items-center justify-center gap-2 transition-all">
                  Envoyer le lien
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Email envoyé
              </h2>

              <p className="mt-4 leading-relaxed text-gray-500 dark:text-gray-400">
                Si un compte existe avec cette adresse email,
                vous recevrez un lien de réinitialisation dans
                quelques minutes.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
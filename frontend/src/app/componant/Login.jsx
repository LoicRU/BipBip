import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err.message || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col lg:flex-row">
      <div className="relative w-full lg:w-1/2 h-60 lg:h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]" />
        <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1974&auto=format&fit=crop"
          alt="workspace"
          className="absolute inset-0 w-full h-full object-cover opacity-55"/>

        <div className="absolute inset-0 bg-black/35"/>
        <div className="absolute inset-0 bg-linear-to-t from-[#0F172A] via-transparent to-transparent"/>

        <div className="absolute bottom-8 left-8 z-10">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                BipBip
              </h1>
              <p className="mt-1 text-sm lg:text-base text-gray-300 max-w-sm">
                BipBip, le site qui te trouve vite un job.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC] dark:bg-[#020617]">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Connexion
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Accédez à votre espace professionnel
            </p>
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition" />

                  <input type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none transition text-gray-900 dark:text-white"
                    required/>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe
                  </label>

                  <Link to="/forgot-password" className="text-sm text-slate-600 dark:text-slate-400 hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition" />

                  <input type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none transition text-gray-900 dark:text-white"
                    required/>
                </div>
              </div>

              <button type="submit"
                disabled={loading}
                className="group w-full h-14 rounded-2xl bg-[#111827] hover:bg-[#1E293B] text-white font-medium flex items-center justify-center gap-2 transition-all">
                {loading ? "Connexion..." : "Se connecter"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </form>

            <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
              Pas encore de compte ?{" "}
              <Link to="/register" className="font-semibold text-slate-800 dark:text-white hover:underline">
                Créer un compte
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
            En vous connectant, vous acceptez nos{" "}
            <Link to="/terms" className="underline">
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link to="/privacy" className="underline">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

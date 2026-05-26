import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Code, Building2, ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";
import { USER_TYPES } from "../constants/userTypes";

export function Register() {
  const navigate = useNavigate();
  const { register } = useApp();

  const [selectedType, setSelectedType] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedType) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedType,
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] relative overflow-hidden flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-37.5 left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-slate-300/30 dark:bg-slate-700/20 blur-3xl" />
          
          <div className="absolute -bottom-50 -right-25 w-100 h-100 rounded-full bg-slate-200/40 dark:bg-slate-800/30 blur-3xl" />

          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[48px_48px]"/>
        </div>

        <div className="relative z-10 w-full max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center gap-3 mx-auto mb-4 rounded-3xl bg-slate-100/80 dark:bg-white/5 px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#111827] dark:text-white">
                  BipBip
                </h1>
                <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">
                  BipBip, le site qui te trouve vite un job.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-4xl shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-6">
              <button onClick={() => setSelectedType(USER_TYPES.TECH)}
                className="group relative overflow-hidden rounded-[28px] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 p-8 md:p-10 text-left hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-linear-to-br from-slate-100 to-transparent dark:from-white/3" />

                <div className="relative">

                  <div className="w-16 h-16 rounded-2xl bg-[#111827] dark:bg-white flex items-center justify-center mb-8">
                    <Code className="w-7 h-7 text-white dark:text-[#111827]" />
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Compte Tech
                  </h3>

                  <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed">
                    Pour les développeurs, freelances et candidats tech.
                  </p>

                  <div className="mt-10 flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>

              <button onClick={() => setSelectedType(USER_TYPES.RECRUITER)}
                className="group relative overflow-hidden rounded-[28px] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 p-8 md:p-10 text-left hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-linear-to-br from-slate-100 to-transparent dark:from-white/3" />

                <div className="relative">

                  <div className="w-16 h-16 rounded-2xl bg-[#111827] dark:bg-white flex items-center justify-center mb-8">
                    <Building2 className="w-7 h-7 text-white dark:text-[#111827]" />
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Compte Entreprise
                  </h3>

                  <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed">
                    Pour les recruteurs, startups et entreprises.
                  </p>

                  <div className="mt-10 flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
            Déjà un compte ?{" "}
            <Link to="/login" className="font-semibold text-slate-800 dark:text-white hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const isTech = selectedType === USER_TYPES.TECH;

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col lg:flex-row">
      <div className="relative w-full lg:w-1/2 h-60 lg:h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]" />
        
        <img src="https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=2070&auto=format&fit=crop"
          alt="workspace"
          className="absolute inset-0 w-full h-full object-cover opacity-55"/>

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 bg-linear-to-t from-[#0F172A] via-transparent to-transparent" />

        <div className="absolute bottom-8 left-8 z-10">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
            BipBip
          </h1>

          <p className="mt-3 text-sm lg:text-base text-gray-300 max-w-sm">
            BipBip, le site qui te trouve vite un job.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC] dark:bg-[#020617]">
        <div className="w-full max-w-md">
          <button onClick={() => setSelectedType(null)}
            className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:opacity-80 transition">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isTech ? "Compte Tech" : "Compte Entreprise"}
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Créez votre espace professionnel
            </p>
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isTech ? "Nom complet" : "Nom de l'entreprise"}
                </label>

                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition" />

                  <input type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder={isTech ? "Jean Dupont" : "TechCorp France"}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none transition text-gray-900 dark:text-white"
                    required/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition" />

                  <input type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none transition text-gray-900 dark:text-white"
                    required/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe
                </label>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition" />

                  <input type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none transition text-gray-900 dark:text-white"
                    required/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition" />

                  <input type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none transition text-gray-900 dark:text-white"
                    required/>
                </div>
              </div>

              <button type="submit"
                disabled={loading}
                className="group w-full h-14 rounded-2xl bg-[#111827] hover:bg-[#1E293B] text-white font-medium flex items-center justify-center gap-2 transition-all">
                {loading ? "Inscription..." : "S'inscrire"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </form>
          </div>

          <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
            Déjà un compte ?{" "}
            <Link to="/login" className="font-semibold text-slate-800 dark:text-white hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

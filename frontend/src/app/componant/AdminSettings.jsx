import { useState } from "react";
import { Save, User, Lock, Bell, Database } from "lucide-react";

export function AdminSettings() {
  const [formData, setFormData] = useState({
    name: "Admin System",
    email: "admin@bipbip.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    systemAlerts: true,
    securityAlerts: true,
    logRetentionDays: 30,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 " +
    "border border-slate-200 dark:border-slate-800 " +
    "text-slate-900 dark:text-white " +
    "focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition";

  const cardClass =
    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 " +
    "rounded-3xl p-6 hover:shadow-xl transition";

  const toggleActive = "bg-emerald-600";

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className="absolute inset-0 opacity-80"
          style={{backgroundImage: `
              linear-gradient(to right, rgba(16,185,129,0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16,185,129,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "36px 36px"}}/>

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="relative z-10">
          <p className="text-sm text-emerald-600 font-semibold">
            Administration
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Paramètres système
          </h1>

          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Configuration globale et sécurité de la plateforme
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className={cardClass}>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white mb-6">
            <User className="w-5 h-5 text-emerald-600" />
            Compte administrateur
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <input className={inputClass}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nom admin"/>

            <input className={inputClass}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email admin"
            />
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white mb-6">
            <Lock className="w-5 h-5 text-emerald-600" />
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
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white mb-6">
            <Database className="w-5 h-5 text-emerald-600" />
            Système
          </h2>

          <div className="space-y-5">

            {[
              { label: "Mode maintenance", key: "maintenanceMode" },
              { label: "Inscription utilisateurs", key: "userRegistration" },
            ].map((item) => {
              const active = formData[item.key];

              return (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>

                  <button type="button"
                    onClick={() => handleChange(item.key, !active)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                      active ? toggleActive : "bg-slate-300 dark:bg-slate-700"}`}>
                    <div className={`h-4 w-4 bg-white rounded-full shadow transition ${
                      active ? "translate-x-5" : ""
                    }`} />
                  </button>
                </div>
              );
            })}

            <div className="mt-6">
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Rétention des logs (jours)
              </label>

              <input
                type="number"
                className={`${inputClass} mt-2`}
                value={formData.logRetentionDays}
                onChange={(e) => handleChange("logRetentionDays", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white mb-6">
            <Bell className="w-5 h-5 text-emerald-600" />
            Notifications
          </h2>

          <div className="space-y-5">

            {[
              { label: "Email notifications", key: "emailNotifications" },
              { label: "Alertes système", key: "systemAlerts" },
              { label: "Alertes sécurité", key: "securityAlerts" },
            ].map((item) => {
              const active = formData[item.key];

              return (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>

                  <button type="button"
                    onClick={() => handleChange(item.key, !active)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                      active ? toggleActive : "bg-slate-300 dark:bg-slate-700"}`}>
                    <div className={`h-4 w-4 bg-white rounded-full shadow transition ${
                      active ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-semibold
            bg-linear-to-r from-emerald-600 to-green-600
            hover:scale-[1.03] transition">
            <Save className="w-5 h-5" />
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}

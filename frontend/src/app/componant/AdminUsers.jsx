import { useMemo, useState, useEffect } from "react";
import { Users, UserCheck, UserX, Shield, Search, Eye, Ban, CheckCircle2, Clock3, Building2, User, Flag } from "lucide-react";
import { USER_TYPES } from "../constants/userTypes";
import { fetchAdminUsers, fetchReports, updateAdminUserStatus } from "../services/api";

export function AdminUsers() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);

  const tabs = [
    { id: "all", label: "Tous", icon: Users },
    { id: "active", label: "Actifs", icon: UserCheck },
    { id: "pending", label: "En attente", icon: Clock3 },
    { id: "blocked", label: "Bloqués", icon: UserX },
  ];

  const stats = [
    { label: "Total utilisateurs", value: users.length, icon: Users },
    { label: "Utilisateurs actifs", value: users.filter((u) => u.status === "active").length, icon: UserCheck },
    { label: "En attente", value: users.filter((u) => u.status === "pending").length, icon: Clock3 },
    { label: "Bloqués", value: users.filter((u) => u.status === "blocked").length, icon: Shield },
  ];

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (activeTab !== "all") {
      filtered = filtered.filter((u) => u.status === activeTab);
    }

    if (search.trim()) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, search, users]);

  useEffect(() => {
    const loadAdminData = async () => {
      const [fetchedUsers, fetchedReports] = await Promise.all([
        fetchAdminUsers(),
        fetchReports(),
      ]);

      setUsers(fetchedUsers);
      setReports(fetchedReports.filter((report) => report.type === "user"));
    };

    loadAdminData();
  }, []);

  const handleStatusChange = async (userId, status) => {
    const updatedUser = await updateAdminUserStatus(userId, status);
    setUsers((prev) => prev.map((user) => (String(user.id) === String(userId) ? updatedUser : user)));
  };

  return (
    <div className="relative space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className="absolute inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(34,197,94,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.12)_1px,transparent_1px)] bg-size-[36px_36px]" />

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full" />

        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
            Administration utilisateurs
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Gestion des comptes
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
            Gérez les utilisateurs, validations et restrictions de la plateforme.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <div key={i}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6
              hover:shadow-xl hover:-translate-y-1 transition">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">{stat.label}</p>

                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <p className="mt-5 text-3xl font-semibold group-hover:text-emerald-600 transition">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 whitespace-nowrap transition ${
                  activeTab === tab.id ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {filteredUsers.map((user) => (
          <div key={user.id}
            className="group relative overflow-hidden rounded-2xl
            border border-slate-200 dark:border-slate-800
            bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl
            hover:border-emerald-400/40
            hover:shadow-xl hover:shadow-emerald-500/10
            hover:-translate-y-0.5
            transition-all duration-300">
            <div className="relative z-10 p-5">
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-4">
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border
                    ${user.type === USER_TYPES.RECRUITER
                      ? "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/10"
                      : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/10"}`}>
                    {user.type === USER_TYPES.RECRUITER ? (
                      <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                        {user.name}
                      </h3>

                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        user.type === USER_TYPES.RECRUITER ? "bg-purple-500/10 text-purple-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                        {user.type === USER_TYPES.RECRUITER ? "Entreprise" : "Tech"}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        user.status === "active" ? "bg-emerald-500/10 text-emerald-600"
                          : user.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
                        {user.status === "active" ? "Actif" : user.status === "pending" ? "En attente" : "Bloqué"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500">{user.email}</p>

                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock3 className="w-3.5 h-3.5" />
                      Inscrit le {new Date(user.joinDate).toLocaleDateString("fr-FR")}
                    </p>

                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl
                    bg-emerald-50 dark:bg-emerald-500/10
                    border border-emerald-100 dark:border-emerald-500/10
                    text-emerald-600 dark:text-emerald-400 text-sm font-medium
                    hover:bg-emerald-600 hover:text-white transition-all duration-300">
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>

                  {user.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(user.id, "active")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-500 transition">
                        <CheckCircle2 className="w-4 h-4" />
                        Approuver
                      </button>

                      <button
                        onClick={() => handleStatusChange(user.id, "blocked")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 text-white px-4 py-2 hover:bg-red-500 transition">
                        <Ban className="w-4 h-4" />
                        Rejeter
                      </button>
                    </>
                  )}

                  {user.status === "active" && (
                    <button
                      onClick={() => handleStatusChange(user.id, "blocked")}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-600 text-white px-4 py-2 hover:bg-red-500 transition">
                      <Ban className="w-4 h-4" />
                      Bloquer le compte
                    </button>
                  )}

                  {user.status === "blocked" && (
                    <button
                      onClick={() => handleStatusChange(user.id, "active")}
                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-500 transition">
                      <UserCheck className="w-4 h-4" />
                      Débloquer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-semibold">Aucun utilisateur trouvé</h2>
          <p className="text-slate-500 mt-2">Essayez une autre recherche ou un filtre.</p>
        </div>
      )}

      {reports.length > 0 && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
      <Flag className="w-5 h-5 text-red-500" />
      Signalements utilisateurs
    </h2>

    {reports.map((r) => (
        <div key={r.id} className="p-4 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-500/10">

          <p className="font-semibold">{r.userName}</p>

          <p className="text-sm text-slate-500">{r.email}</p>

          <p className="text-xs text-slate-400 mt-1">
            {new Date(r.createdAt).toLocaleString("fr-FR")}
          </p>
          
          <p className="mt-2 text-sm">{r.reason}</p>
        </div>
      ))}
    </div>
  )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Ticket, AlertTriangle, Search, Eye, Check } from "lucide-react";
import { useApp } from "../context/AppContext";

export function AdminSupport() {
  const { supportTickets, resolveSupportTicket } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const tabs = [
    { id: "all", label: "Tous" },
    { id: "open", label: "Ouverts" },
    { id: "resolved", label: "Résolus" }
  ];

  const filteredTickets = useMemo(() => {
    return [...supportTickets]
      .filter((ticket) => {
        if (activeTab === "all") return true;
        return ticket.status === activeTab;
      })
      .filter((ticket) => {
        const query = search.toLowerCase();
        return (
          ticket.subject.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          ticket.userType.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [supportTickets, activeTab, search]);

  const stats = [
    { label: "Tickets ouverts", value: supportTickets.filter((t) => t.status === "open").length, icon: AlertTriangle },
    { label: "Tickets résolus", value: supportTickets.filter((t) => t.status === "resolved").length, icon: CheckCircle2 },
    { label: "Total tickets", value: supportTickets.length, icon: Ticket },
    { label: "Temps moyen", value: "2h", icon: Clock }
  ];

  return (
    <div className="relative space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 md:p-14">
        <div className="absolute inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(34,197,94,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.12)_1px,transparent_1px)] bg-size-[36px_36px]" />

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full" />
        
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
            Centre de support
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mt-3">
            Tickets & assistance
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
            Gestion des demandes utilisateurs et résolution des problèmes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === tab.id ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

          <input value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un ticket..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700
            bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
        </div>
      </div>

      <div className="space-y-5">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id}
            className="group relative overflow-hidden rounded-2xl
            border border-slate-200 dark:border-slate-800
            bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl
            hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5
            transition-all duration-300">
            <div className="relative z-10 p-5">
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl
                    bg-emerald-50 dark:bg-emerald-500/10
                    border border-emerald-100 dark:border-emerald-500/10
                    flex items-center justify-center
                    group-hover:scale-105 transition duration-300">
                    <Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                        {ticket.subject}
                      </h3>

                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${ticket.status === "open" ? "bg-orange-500/10 text-orange-600"
                            : "bg-emerald-500/10 text-emerald-600"}`}>
                        {ticket.status === "open" ? "Ouvert" : "Résolu"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {ticket.description}
                    </p>

                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
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

                  {ticket.status === "open" && (
                    <button onClick={() => resolveSupportTicket(ticket.id)}
                      className="inline-flex items-center gap-2 rounded-2xl
                      bg-emerald-600 text-white px-4 py-2
                      hover:bg-emerald-500 transition">
                      <Check className="w-4 h-4" />
                      Résoudre
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-4" />

          <h2 className="text-2xl font-semibold">Aucun ticket</h2>
          
          <p className="text-slate-500 mt-2">Aucun résultat trouvé.</p>
        </div>
      )}
    </div>
  );
}
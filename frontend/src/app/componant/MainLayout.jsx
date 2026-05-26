import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Briefcase, Zap, LayoutDashboard, Settings, LogOut, Menu, X, Sun, Moon, FileText, Users, TrendingUp, Bot, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { NewJobOffer } from "./NewJobOffer";
import { SupportWidget } from "./SupportWidget";
import { USER_TYPES } from "../constants/userTypes";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, logout, theme, toggleTheme, isAuthenticated, authReady } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      navigate("/login");
    }
  }, [authReady, isAuthenticated, navigate]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        Chargement...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

const themeMap =
  userType === USER_TYPES.ADMIN
    ? {
        accent: "green",
        active: "bg-green-500/10 text-green-600 dark:text-green-400",
        icon: "text-green-500",
        hover: "hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400",
        border: "border-green-500/30",
        text: "text-green-600 dark:text-green-400",
        gradient: "from-green-500 to-emerald-600"
      }
    : userType === USER_TYPES.RECRUITER
    ? {
        accent: "purple",
        active: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        icon: "text-purple-500",
        hover: "hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400",
        border: "border-purple-500/30",

        text: "text-purple-600 dark:text-purple-400",
        gradient: "from-purple-500 to-fuchsia-600"
      }
    : {
        accent: "blue",
        active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        icon: "text-blue-500",
        hover: "hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
        border: "border-blue-500/30",
        text: "text-blue-600 dark:text-blue-400",
        gradient: "from-blue-400 to-sky-600"
      };

  const navItems =
    userType === USER_TYPES.ADMIN
      ? [
          { path: "/", label: "Dashboard", icon: LayoutDashboard },
          { path: "/moderation", label: "Modération", icon: Settings },
          { path: "/users", label: "Utilisateurs", icon: Users },
          { path: "/support", label: "Support", icon: MessageCircle },
          { path: "/admin-settings", label: "Settings", icon: Settings },
        ]
      : userType === USER_TYPES.RECRUITER
      ? [
          { path: "/", label: "Vue d’ensemble", icon: TrendingUp },
          { path: "/jobs", label: "Offres", icon: Briefcase },
          { path: "/candidatures", label: "Candidatures", icon: Users },
          { path: "/settings", label: "Paramètres", icon: Settings },
        ]
      : [
          { path: "/", label: "Dashboard", icon: LayoutDashboard },
          { path: "/search", label: "Rechercher", icon: Search },
          { path: "/applications", label: "Candidatures", icon: FileText },
          { path: "/ai-assistant", label: "Assistant IA", icon: Bot },
          { path: "/settings", label: "Paramètres", icon: Settings },
        ];

  const linkBase =
    "relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-300";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center
                shadow-lg transition-all duration-300 group-hover:scale-105
                bg-linear-to-br ${themeMap.gradient}`}>
                <Zap className="w-5 h-5 text-white" />
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-[17px] font-semibold text-slate-900 dark:text-white">
                  BipBip
                </span>

                <span className={`text-xs font-medium ${themeMap.text}`}>
                  {userType === USER_TYPES.ADMIN ? "Admin" : userType === USER_TYPES.RECRUITER ? "Entreprise" : "Candidat"}
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.path} to={item.path}
                    className={`${linkBase} ${
                      isActive(item.path) ? `${themeMap.active} scale-[1.03]` : `text-slate-600 dark:text-slate-300 ${themeMap.hover}`}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-[15px]">{item.label}</span>

                    <span
                      className={`absolute bottom-1 left-4 right-4 h-0.5 scale-x-0 origin-left transition-transform duration-300 ${
                        isActive(item.path) ? `scale-x-100 bg-${themeMap.accent}-500` : "bg-transparent"}`}/>
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                {theme === "light" ? (<Moon className="w-5 h-5" />) : (<Sun className="w-5 h-5" />)}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-900 dark:text-white">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.path} to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base ${
                      isActive(item.path) ? themeMap.active : "text-slate-600 dark:text-slate-300"}`}>
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300">
                {theme === "light" ? <Moon /> : <Sun />}
                Theme
              </button>

              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300">
                <LogOut />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <NewJobOffer isOpen={showNewJobModal} onClose={() => setShowNewJobModal(false)} />

      <SupportWidget />
    </div>
  );
}

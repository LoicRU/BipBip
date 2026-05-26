import { Link } from "react-router";
import { Home, Search, ArrowRight } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 md:p-16">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-sm font-medium text-purple-700 dark:text-purple-300 mb-8">
              Erreur 404
            </span>

            <h1 className="text-7xl md:text-8xl font-black tracking-tight mb-6 text-purple-600 dark:text-purple-400">
                Page introuvable
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed mb-10">
              La page que vous recherchez n'existe pas, a été déplacée
              ou vous n'avez peut-être pas les permissions nécessaires.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/"
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl text-white font-semibold bg-linear-to-r from-blue-600 via-purple-600 to-fuchsia-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <Home className="w-5 h-5" />
                Retour à l'accueil

                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link to="/search"
                className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <Search className="w-5 h-5 text-purple-500" />
                Explorer les offres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
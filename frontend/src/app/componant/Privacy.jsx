import { ArrowLeft, Shield, Database, Lock, Eye, Cookie, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] relative overflow-hidden px-6 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-37.5 left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-slate-300/30 dark:bg-slate-700/20 blur-3xl" />

        <div className="absolute -bottom-50 -right-25 w-100 h-100 rounded-full bg-slate-200/40 dark:bg-slate-800/30 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[48px_48px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-[#111827] dark:text-white">
            Protection de vos données
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Cette politique explique comment JobAggregator collecte,
            utilise, protège et traite vos données personnelles
            conformément aux réglementations applicables, notamment
            le RGPD.
          </p>
        </div>

        <div className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-4xl shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-8 md:p-12">
          <div className="space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <p>
                JobAggregator accorde une importance particulière à
                la protection des données personnelles de ses utilisateurs.
                Cette politique décrit les informations collectées,
                les raisons de cette collecte ainsi que les mesures
                mises en place afin d’assurer leur sécurité.
              </p>

              <p className="mt-4">
                En utilisant la plateforme, vous acceptez les pratiques
                décrites dans cette politique de confidentialité.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 1
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Données collectées
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  Nous collectons certaines données nécessaires au
                  fonctionnement et à l’amélioration de la plateforme.
                </p>

                <p>
                  Les informations susceptibles d’être collectées incluent :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>nom et prénom ;</li>
                  <li>adresse email ;</li>
                  <li>numéro de téléphone ;</li>
                  <li>CV et documents transmis ;</li>
                  <li>historique des candidatures ;</li>
                  <li>préférences utilisateur et favoris ;</li>
                  <li>données techniques de connexion et navigation.</li>
                </ul>

              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 2
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Utilisation des données
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  Les données collectées sont utilisées uniquement
                  dans le cadre du fonctionnement de la plateforme.
                </p>

                <p>
                  Elles permettent notamment :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>de fournir les fonctionnalités du service ;</li>
                  <li>d’améliorer l’expérience utilisateur ;</li>
                  <li>d’afficher des recommandations pertinentes ;</li>
                  <li>de permettre la gestion des candidatures ;</li>
                  <li>de sécuriser les comptes et prévenir les abus ;</li>
                  <li>d’analyser les performances de la plateforme.</li>
                </ul>

              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 3
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Partage des données
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  Vos données personnelles ne sont jamais revendues
                  à des tiers.
                </p>

                <p>
                  Certaines informations peuvent être partagées
                  uniquement dans les cas suivants :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>lorsque vous postulez à une offre ;</li>
                  <li>pour répondre à une obligation légale ;</li>
                  <li>avec des prestataires techniques nécessaires au service ;</li>
                  <li>pour assurer la sécurité et la maintenance de la plateforme.</li>
                </ul>

              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 4
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Stockage et sécurité
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  JobAggregator met en œuvre des mesures de sécurité
                  raisonnables afin de protéger les données contre :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>les accès non autorisés ;</li>
                  <li>les pertes de données ;</li>
                  <li>les usages frauduleux ;</li>
                  <li>les modifications ou suppressions malveillantes.</li>
                </ul>

                <p>
                  Les accès sensibles sont protégés via des mécanismes
                  d’authentification, de contrôle d’accès et de validation
                  des requêtes.
                </p>

              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 5
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Vos droits (RGPD)
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  Conformément au RGPD, vous disposez de plusieurs droits
                  concernant vos données personnelles.
                </p>

                <p>
                  Vous pouvez notamment :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>accéder à vos données ;</li>
                  <li>corriger des informations inexactes ;</li>
                  <li>demander la suppression de vos données ;</li>
                  <li>vous opposer à certains traitements ;</li>
                  <li>demander l’export de vos données.</li>
                </ul>

                <p>
                  Toute demande relative à vos données peut être effectuée
                  via les moyens de contact mis à disposition sur la plateforme.
                </p>

              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 6
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Cookies et tracking
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  La plateforme peut utiliser des cookies ou technologies
                  similaires afin :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>de maintenir la session utilisateur ;</li>
                  <li>d’améliorer l’expérience de navigation ;</li>
                  <li>d’analyser les performances du service ;</li>
                  <li>de mesurer l’utilisation des fonctionnalités.</li>
                </ul>

                <p>
                  Certains cookies peuvent être désactivés depuis les
                  paramètres du navigateur, bien que cela puisse limiter
                  certaines fonctionnalités du service.
                </p>

              </div>
            </section>

            <div className="pt-8 border-t border-gray-200 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dernière mise à jour : Mai 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

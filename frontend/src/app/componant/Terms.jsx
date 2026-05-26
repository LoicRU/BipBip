import { ArrowLeft, ShieldCheck, Lock, Database, Users, Scale, Settings, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export function Terms() {
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
            Conditions générales d’utilisation
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Les présentes conditions définissent les règles d’accès et
            d’utilisation de la plateforme JobAggregator. En utilisant
            le service, vous acceptez l’ensemble des dispositions décrites
            ci-dessous.
          </p>
        </div>

        <div className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-4xl shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-8 md:p-12">
          <div className="space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <p>
                JobAggregator est une plateforme de centralisation
                d’offres d’emploi et de stages permettant aux utilisateurs
                de consulter, rechercher, filtrer et analyser des offres
                issues de plusieurs sources externes, notamment l’API
                WeLoveDevs mise à disposition dans le cadre du projet.
              </p>

              <p className="mt-4">
                L’utilisation de la plateforme implique l’acceptation
                pleine et entière des présentes conditions d’utilisation.
                Si vous n’acceptez pas ces conditions, vous ne devez pas
                accéder ou utiliser le service.
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
                    Objet du service
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  JobAggregator a pour objectif de simplifier la recherche
                  d’opportunités professionnelles en agrégeant des données
                  provenant de plateformes partenaires et de sources publiques.
                </p>

                <p>
                  La plateforme propose notamment :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>la consultation d’offres d’emploi et de stages ;</li>
                  <li>des fonctionnalités de recherche et de filtrage avancées ;</li>
                  <li>des tableaux de bord et outils d’analyse ;</li>
                  <li>des fonctionnalités d’assistance et de recommandation ;</li>
                  <li>des espaces dédiés aux recruteurs et administrateurs.</li>
                </ul>

                <p>
                  Certaines fonctionnalités peuvent évoluer, être modifiées
                  ou supprimées à tout moment afin d’améliorer le service.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 2
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Comptes utilisateurs
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  Certaines fonctionnalités nécessitent la création
                  d’un compte utilisateur. Lors de l’inscription,
                  vous vous engagez à fournir des informations exactes,
                  complètes et à jour.
                </p>

                <p>
                  Vous êtes responsable de la confidentialité de vos
                  identifiants de connexion ainsi que de toutes les
                  activités effectuées depuis votre compte.
                </p>

                <p>
                  Toute tentative d’usurpation d’identité, de création
                  de faux comptes ou d’utilisation frauduleuse du service
                  pourra entraîner la suspension ou la suppression immédiate
                  du compte concerné.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 3
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Utilisation acceptable
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  Les utilisateurs s’engagent à utiliser la plateforme
                  dans le respect des lois applicables et des bonnes pratiques.
                </p>

                <p>
                  Il est notamment interdit de :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>perturber le fonctionnement du service ;</li>
                  <li>tenter d’accéder à des données non autorisées ;</li>
                  <li>effectuer du scraping massif ou automatisé ;</li>
                  <li>injecter du contenu malveillant ;</li>
                  <li>utiliser la plateforme à des fins frauduleuses ;</li>
                  <li>contourner les mécanismes de sécurité ou de limitation.</li>
                </ul>

                <p>
                  JobAggregator se réserve le droit de suspendre tout accès
                  considéré comme abusif ou dangereux pour la plateforme.
                </p>
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
                    Données et confidentialité
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  JobAggregator applique des mesures techniques raisonnables
                  afin de protéger les données des utilisateurs contre les
                  accès non autorisés, les pertes ou les usages abusifs.
                </p>

                <p>
                  Les informations collectées sont utilisées uniquement
                  dans le cadre du fonctionnement de la plateforme et de
                  l’amélioration de l’expérience utilisateur.
                </p>

                <p>
                  Certaines données affichées proviennent de services tiers.
                  JobAggregator ne peut garantir l’exactitude, l’exhaustivité
                  ou la disponibilité permanente des données externes.
                </p>

                <p>
                  Pour plus d’informations concernant le traitement des données,
                  veuillez consulter notre politique de confidentialité.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 5
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Propriété intellectuelle
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  Les éléments composant la plateforme, notamment le design,
                  l’interface, les composants logiciels, les logos, les contenus
                  et la structure générale, sont protégés par les règles de
                  propriété intellectuelle applicables.
                </p>

                <p>
                  Toute reproduction, modification, redistribution ou exploitation
                  non autorisée du contenu de la plateforme est interdite.
                </p>

                <p>
                  Les offres d’emploi et contenus provenant de plateformes tierces
                  restent la propriété de leurs auteurs ou diffuseurs respectifs.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 6
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Limitation de responsabilité
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  JobAggregator agit comme intermédiaire technique et ne peut
                  être tenu responsable :
                </p>

                <ul className="space-y-2 list-disc pl-6">
                  <li>des décisions d’embauche prises par les recruteurs ;</li>
                  <li>des échanges entre candidats et entreprises ;</li>
                  <li>des erreurs ou indisponibilités provenant des sources externes ;</li>
                  <li>des interruptions temporaires du service ;</li>
                  <li>de pertes indirectes liées à l’utilisation du service.</li>
                </ul>

                <p>
                  Le service est fourni “tel quel”, sans garantie de disponibilité
                  continue ou d’absence totale d’erreurs.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Section 7
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Modification des conditions
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  Les présentes conditions peuvent être mises à jour afin
                  de refléter les évolutions techniques, fonctionnelles
                  ou réglementaires de la plateforme.
                </p>

                <p>
                  Les utilisateurs seront invités à consulter régulièrement
                  les conditions en vigueur.
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

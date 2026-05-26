export const mockJobs = [
  {
    id: "1",
    title: "Développeur Full Stack Senior",
    company: "TechCorp France",
    location: "Paris, France",
    type: "CDI",
    salary: "55k - 70k €",
    description:
      "Nous recherchons un développeur Full Stack passionné pour rejoindre notre équipe en pleine croissance. Vous travaillerez sur des projets innovants avec les dernières technologies.",
    requirements: [
      "5+ années d'expérience en développement web",
      "Maîtrise de React et Node.js",
      "Expérience avec TypeScript",
      "Connaissance des architectures cloud (AWS/Azure)",
    ],
    benefits: [
      "Télétravail flexible",
      "Tickets restaurant",
      "Mutuelle premium",
      "Budget formation 3000€/an",
    ],
    postedDate: "2026-04-25",
    source: "LinkedIn",
    remote: true,
    experience: "5+ ans",
  },

  {
    id: "2",
    title: "Data Scientist",
    company: "AI Solutions",
    location: "Lyon, France",
    type: "CDI",
    salary: "50k - 65k €",
    description:
      "Rejoignez notre équipe data pour développer des solutions d'intelligence artificielle innovantes.",
    requirements: [
      "Master en Data Science ou équivalent",
      "Expérience avec Python, TensorFlow, PyTorch",
      "Connaissance en Machine Learning",
      "Capacité à travailler en équipe",
    ],
    benefits: [
      "RTT",
      "Participation",
      "Stock options",
      "Équipement de pointe",
    ],
    postedDate: "2026-04-24",
    source: "Indeed",
    remote: false,
    experience: "3-5 ans",
  },

  {
    id: "3",
    title: "Designer UX/UI",
    company: "Creative Studio",
    location: "Bordeaux, France",
    type: "CDI",
    salary: "40k - 50k €",
    description:
      "Nous cherchons un designer créatif pour concevoir des expériences utilisateur exceptionnelles.",
    requirements: [
      "Portfolio démontrant votre expertise",
      "Maîtrise de Figma et Adobe Creative Suite",
      "3+ années d'expérience en UX/UI",
      "Excellent sens du design",
    ],
    benefits: [
      "Horaires flexibles",
      "MacBook Pro fourni",
      "Abonnement fitness",
      "Team building réguliers",
    ],
    postedDate: "2026-04-23",
    source: "Welcome to the Jungle",
    remote: true,
    experience: "3+ ans",
  },

  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Toulouse, France",
    type: "CDI",
    salary: "52k - 68k €",
    description:
      "Participez à la mise en place et à l'amélioration de notre infrastructure cloud.",
    requirements: [
      "Expérience avec Kubernetes et Docker",
      "Maîtrise de CI/CD (GitLab CI, Jenkins)",
      "Scripting (Bash, Python)",
      "Connaissance AWS ou GCP",
    ],
    benefits: [
      "Télétravail 3j/semaine",
      "Prime annuelle",
      "Congés illimités",
      "Matériel au choix",
    ],
    postedDate: "2026-04-22",
    source: "Stack Overflow Jobs",
    remote: true,
    experience: "4+ ans",
  },

  {
    id: "5",
    title: "Product Manager",
    company: "StartupX",
    location: "Nantes, France",
    type: "CDI",
    salary: "48k - 60k €",
    description:
      "Pilotez le développement de nos produits et définissez la roadmap stratégique.",
    requirements: [
      "Expérience en gestion de produit digital",
      "Capacité à définir une vision produit",
      "Excellentes compétences en communication",
      "Connaissance des méthodologies Agile",
    ],
    benefits: [
      "Stock options",
      "Environnement startup dynamique",
      "Formation continue",
      "Événements d'équipe",
    ],
    postedDate: "2026-04-21",
    source: "AngelList",
    remote: false,
    experience: "3-5 ans",
  },

  {
    id: "6",
    title: "Développeur React Native",
    company: "MobileFirst",
    location: "Marseille, France",
    type: "CDD",
    salary: "45k - 55k €",
    description:
      "Développez des applications mobiles performantes pour iOS et Android.",
    requirements: [
      "Solide expérience en React Native",
      "Connaissance d'iOS et Android",
      "Expérience avec les API REST",
      "Tests unitaires et intégration",
    ],
    benefits: [
      "Équipe jeune et dynamique",
      "Bureaux modernes",
      "Possibilité de CDI",
      "Projets variés",
    ],
    postedDate: "2026-04-20",
    source: "Glassdoor",
    remote: true,
    experience: "2-4 ans",
  },

  {
    id: "7",
    title: "Cybersecurity Analyst",
    company: "SecureIT",
    location: "Lille, France",
    type: "CDI",
    salary: "50k - 62k €",
    description:
      "Protégez nos systèmes contre les menaces et assurez la sécurité de nos infrastructures.",
    requirements: [
      "Certification en cybersécurité (CISSP, CEH)",
      "Expérience en analyse de vulnérabilités",
      "Connaissance des standards de sécurité",
      "Compétences en pentesting",
    ],
    benefits: [
      "Certifications payées",
      "Conférences internationales",
      "Salaire compétitif",
      "Challenges techniques",
    ],
    postedDate: "2026-04-19",
    source: "CyberSec Jobs",
    remote: false,
    experience: "3+ ans",
  },

  {
    id: "8",
    title: "Backend Developer Python",
    company: "DataFlow",
    location: "Montpellier, France",
    type: "CDI",
    salary: "46k - 58k €",
    description:
      "Rejoignez notre équipe backend pour construire des APIs scalables et performantes.",
    requirements: [
      "Expert Python (Django/FastAPI)",
      "Bases de données (PostgreSQL, MongoDB)",
      "Architecture microservices",
      "Docker et orchestration",
    ],
    benefits: [
      "Flex office",
      "Budget hardware",
      "Déjeuners d'équipe",
      "Projets open source",
    ],
    postedDate: "2026-04-18",
    source: "Python Jobs",
    remote: true,
    experience: "3-5 ans",
  },
];

export function getAllJobs() {
  if (typeof window === "undefined") {
    return mockJobs;
  }

  const savedJobs = JSON.parse(
    localStorage.getItem("recruiterJobs") || "[]"
  );

  const merged = [
    ...mockJobs,
    ...savedJobs.filter(
      (saved) =>
        !mockJobs.some((mock) => mock.id === saved.id)
    ),
  ];

  return merged.sort(
    (a, b) =>
      new Date(b.postedDate) - new Date(a.postedDate)
  );
}

export function getJobById(id) {
  return getAllJobs().find(
    (job) => String(job.id) === String(id)
  );
}

export function searchJobs(query = "", filters = {}) {
  const allJobs = getAllJobs();

  return allJobs.filter((job) => {
    const matchesQuery =
      !query ||
      job.title
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      job.company
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      job.description
        .toLowerCase()
        .includes(query.toLowerCase());

    const matchesType =
      !filters.type ||
      filters.type === "all" ||
      job.type === filters.type;

    const matchesLocation =
      !filters.location ||
      filters.location === "all" ||
      job.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());

    const matchesRemote =
      filters.remote === undefined ||
      job.remote === filters.remote;

    return (
      matchesQuery &&
      matchesType &&
      matchesLocation &&
      matchesRemote
    );
  });
}
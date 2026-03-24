export const defaultContent = {
  profile: {
    name: "Adarsh Malayath",
    role: "Full Stack Developer",
    headline: "Building secure, scalable products from backend to frontend.",
    summary:
      "Full stack developer with 2 years 10 months of banking technology experience, delivering backend services, frontend interfaces, and production support using Java, PL/SQL, and ReactJS.",
    location: "Leicester, United Kingdom",
    email: "adarshmalayath@gmail.com",
    phone: "+44 7721 445027",
    linkedin: "https://linkedin.com/in/adarshmalayath",
    github: "https://github.com/adarshmalayath",
    cvUrl: "/assets/documents/CV%20IT.pdf"
  },
  stats: [
    { label: "Professional full stack development experience", value: "2+ Years" },
    { label: "SQL and backend modules delivered", value: "15+" },
    { label: "Response time improvement in production", value: "30%" },
    { label: "Production incidents resolved within SLA", value: "98%" }
  ],
  experience: {
    role: "Full Stack Developer (Channels Applications)",
    meta: "CSB Bank Ltd., Chennai, India | Mar 2023 – Dec 2025",
    bullets: [
      "Built and optimized backend SQL modules for fraud detection and transaction processing.",
      "Supported mobile and net banking migration to OBDX with 95%+ data accuracy.",
      "Improved database and query performance, reducing response time by 30%.",
      "Handled 98% of L2/L3 production issues within SLA and supported Oracle General Ledger integrations.",
      "Delivered features under RBI audit and governance standards."
    ]
  },
  skills: [
    { title: "Languages", items: ["Java", "Python"] },
    { title: "Web & UI", items: ["JavaScript", "HTML5", "CSS3", "Bootstrap"] },
    { title: "Frameworks", items: ["ReactJS", "Spring"] },
    { title: "Databases", items: ["Oracle", "SQL Server", "MySQL"] },
    {
      title: "Tools",
      items: ["Git", "IntelliJ IDEA", "VS Code", "ServiceNow", "JIRA", "OBDX", "Power BI", "MS Excel"]
    },
    { title: "Domain Focus", items: ["Banking Platforms", "Fraud Risk Management", "API Integration", "Compliance"] }
  ],
  projects: [
    {
      title: "Core Banking Migration Platform",
      tech: "PL/SQL, Data Engineering",
      description: "Migrated user data to OBDX with 95%+ accuracy and built control reporting with 6+ bug fixes.",
      url: ""
    },
    {
      title: "Banking Services Web App",
      tech: "Java, ReactJS, PL/SQL",
      description: "Built a secure full stack banking portal with REST API integration and improved performance by 40%.",
      url: "https://github.com/adarshmalayath/Bank-Website-Project"
    },
    {
      title: "E-Governance System",
      tech: "Python, ReactJS, MySQL",
      description: "Automated 80% of operational tasks and implemented secure role-based access control.",
      url: "https://github.com/simatlms5/egovernance"
    },
    {
      title: "Online Job Portal",
      tech: "Full Stack Web Application",
      description: "Developed a job portal that supports job posting, search, and application workflows for candidates.",
      url: "https://github.com/adarshmalayath/Online-Job-Portal"
    }
  ],
  education: [
    {
      title: "MSc Cloud Computing with Industry",
      meta: "University of Leicester | Jan 2026 – Present",
      detail: ""
    },
    {
      title: "B.Tech in Computer Science & Engineering",
      meta: "Sreepathy Institute of Management and Technology | Aug 2018 – Aug 2022",
      detail: "CGPA: 8.19 / 10"
    },
    {
      title: "Higher Secondary Education (Plus Two)",
      meta: "Government Higher Secondary School Kuttippuram, India | Jul 2016 – Mar 2018",
      detail: "Percentage: 85.25%"
    },
    {
      title: "Secondary Education (10th)",
      meta: "Technical Higher Secondary School Vattamkulam, India | Jun 2015 – Mar 2016",
      detail: "Percentage: 95%"
    }
  ],
  certifications: [
    "Discrete Mathematics — NPTEL, IIT Madras",
    "Java Full Stack Developer — NIIT, Chennai",
    "Introduction to Analytics & Excel — Coding Ninjas",
    "Data Visualization with Power BI — Coding Ninjas",
    "SQL for Data Analysis — Coding Ninjas"
  ],
  profileDetails: [
    "Languages: Malayalam (Native), English (Advanced), Hindi (Intermediate), Tamil (Upper Intermediate)",
    "Leadership: IEEE & IEDC Core Member (2018 – 2022)",
    "Work Preference: Open to relocation and remote work",
    "Eligible to work in the UK"
  ],
  sectionTitles: {
    experience: "Professional Experience",
    skills: "Technical Skills",
    projects: "Selected Projects",
    education: "Education",
    certifications: "Certification Highlights",
    profile: "Additional Details"
  },
  customSections: []
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toStringList(value) {
  return toArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        const candidate = item.value || item.title || item.name || item.label || "";
        return String(candidate).trim();
      }

      return "";
    })
    .filter(Boolean);
}

export function normalizeContent(input) {
  const merged = {
    ...clone(defaultContent),
    ...(input || {}),
    profile: {
      ...clone(defaultContent.profile),
      ...(input?.profile || {})
    },
    experience: {
      ...clone(defaultContent.experience),
      ...(input?.experience || {}),
      bullets: toStringList(input?.experience?.bullets).length
        ? toStringList(input.experience.bullets)
        : clone(defaultContent.experience.bullets)
    },
    sectionTitles: {
      ...clone(defaultContent.sectionTitles),
      ...(input?.sectionTitles || {})
    }
  };

  merged.stats = toArray(input?.stats).length ? toArray(input.stats) : clone(defaultContent.stats);
  merged.skills = toArray(input?.skills).length
    ? toArray(input.skills).map((item) => ({
        title: item?.title || "",
        items: Array.isArray(item?.items)
          ? item.items.filter(Boolean)
          : String(item?.description || "")
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
      }))
    : clone(defaultContent.skills);
  merged.projects = toArray(input?.projects).length ? toArray(input.projects) : clone(defaultContent.projects);
  merged.education = toArray(input?.education).length ? toArray(input.education) : clone(defaultContent.education);
  merged.certifications = toStringList(input?.certifications).length
    ? toStringList(input.certifications)
    : clone(defaultContent.certifications);
  merged.profileDetails = toStringList(input?.profileDetails).length
    ? toStringList(input.profileDetails)
    : clone(defaultContent.profileDetails);
  merged.customSections = toArray(input?.customSections);

  return merged;
}

export function cloneContent(value = defaultContent) {
  return clone(value);
}

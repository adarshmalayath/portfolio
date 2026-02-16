export const defaultPortfolioContent = {
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
    cvUrl: "https://adarshmalayath.github.io/portfolio/CV%20IT.pdf"
  },
  stats: [
    { value: "2+ Years", label: "Professional full stack development experience" },
    { value: "15+", label: "SQL and backend modules delivered" },
    { value: "30%", label: "Response time improvement in production" },
    { value: "98%", label: "Production incidents resolved within SLA" }
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
    { title: "Languages", description: "Java, JavaScript, Python, PL/SQL" },
    { title: "Web & UI", description: "ReactJS, HTML5, CSS3, Bootstrap" },
    { title: "Frameworks", description: "Spring, Spring Boot" },
    { title: "Databases", description: "Oracle, SQL Server, MySQL" },
    { title: "Tools", description: "Git, IntelliJ IDEA, VS Code, ServiceNow, JIRA, OBDX" },
    { title: "Domain Focus", description: "Banking Platforms, Fraud Risk, API Integration, Compliance" }
  ],
  projects: [
    {
      title: "Core Banking Migration Platform",
      tech: "PL/SQL, Data Engineering",
      description: "Migrated user data to OBDX with 95%+ accuracy and built control reporting with 6+ bug fixes."
    },
    {
      title: "Banking Services Web App",
      tech: "Java, ReactJS, PL/SQL",
      description: "Built a secure full stack banking portal with REST API integration and improved performance by 40%."
    },
    {
      title: "Fall Detection for Epileptic Children",
      tech: "Python, Machine Learning",
      description: "Developed an EMG-based model with 70% accuracy and real-time alerts."
    },
    {
      title: "E-Governance System",
      tech: "Python, ReactJS, MySQL",
      description: "Automated 80% of operational tasks and implemented secure role-based access control."
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

function coerceString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function coerceNonEmptyString(value, fallback = "") {
  const normalized = coerceString(value, "").trim();
  return normalized || fallback;
}

function coerceArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

export function normalizePortfolioContent(input) {
  const source = input && typeof input === "object" ? input : {};
  const sectionTitleSource =
    source.sectionTitles && typeof source.sectionTitles === "object"
      ? source.sectionTitles
      : {};

  return {
    profile: {
      name: coerceString(source.profile?.name, defaultPortfolioContent.profile.name),
      role: coerceString(source.profile?.role, defaultPortfolioContent.profile.role),
      headline: coerceString(source.profile?.headline, defaultPortfolioContent.profile.headline),
      summary: coerceString(source.profile?.summary, defaultPortfolioContent.profile.summary),
      location: coerceString(source.profile?.location, defaultPortfolioContent.profile.location),
      email: coerceString(source.profile?.email, defaultPortfolioContent.profile.email),
      phone: coerceString(source.profile?.phone, defaultPortfolioContent.profile.phone),
      linkedin: coerceString(source.profile?.linkedin, defaultPortfolioContent.profile.linkedin),
      github: coerceString(source.profile?.github, defaultPortfolioContent.profile.github),
      cvUrl: coerceString(source.profile?.cvUrl, defaultPortfolioContent.profile.cvUrl)
    },
    stats: coerceArray(source.stats, defaultPortfolioContent.stats)
      .map((item) => ({
        value: coerceString(item?.value),
        label: coerceString(item?.label)
      }))
      .filter((item) => item.value && item.label),
    experience: {
      role: coerceString(source.experience?.role, defaultPortfolioContent.experience.role),
      meta: coerceString(source.experience?.meta, defaultPortfolioContent.experience.meta),
      bullets: coerceArray(source.experience?.bullets, defaultPortfolioContent.experience.bullets)
        .map((item) => coerceString(item))
        .filter(Boolean)
    },
    skills: coerceArray(source.skills, defaultPortfolioContent.skills)
      .map((item) => ({
        title: coerceString(item?.title),
        description: coerceString(item?.description)
      }))
      .filter((item) => item.title && item.description),
    projects: coerceArray(source.projects, defaultPortfolioContent.projects)
      .map((item) => ({
        title: coerceString(item?.title),
        tech: coerceString(item?.tech),
        description: coerceString(item?.description)
      }))
      .filter((item) => item.title && item.description),
    education: coerceArray(source.education, defaultPortfolioContent.education)
      .map((item) => ({
        title: coerceString(item?.title),
        meta: coerceString(item?.meta),
        detail: coerceString(item?.detail)
      }))
      .filter((item) => item.title && item.meta),
    certifications: coerceArray(source.certifications, defaultPortfolioContent.certifications)
      .map((item) => coerceString(item))
      .filter(Boolean),
    profileDetails: coerceArray(source.profileDetails, defaultPortfolioContent.profileDetails)
      .map((item) => coerceString(item))
      .filter(Boolean),
    sectionTitles: {
      experience: coerceNonEmptyString(
        sectionTitleSource.experience,
        defaultPortfolioContent.sectionTitles.experience
      ),
      skills: coerceNonEmptyString(
        sectionTitleSource.skills,
        defaultPortfolioContent.sectionTitles.skills
      ),
      projects: coerceNonEmptyString(
        sectionTitleSource.projects,
        defaultPortfolioContent.sectionTitles.projects
      ),
      education: coerceNonEmptyString(
        sectionTitleSource.education,
        defaultPortfolioContent.sectionTitles.education
      ),
      certifications: coerceNonEmptyString(
        sectionTitleSource.certifications,
        defaultPortfolioContent.sectionTitles.certifications
      ),
      profile: coerceNonEmptyString(
        sectionTitleSource.profile,
        defaultPortfolioContent.sectionTitles.profile
      )
    },
    customSections: coerceArray(source.customSections, defaultPortfolioContent.customSections)
      .map((item) => ({
        title: coerceString(item?.title).trim(),
        lines: coerceArray(item?.lines, [])
          .map((line) => coerceString(line).trim())
          .filter(Boolean)
      }))
      .filter((item) => item.title && item.lines.length > 0)
  };
}

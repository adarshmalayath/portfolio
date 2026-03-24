import { useEffect, useMemo, useState } from "react";
import { fetchPublicContent } from "../api";
import { defaultContent, normalizeContent } from "../defaultContent";

const CERTIFICATE_FILES = [
  {
    test: (value) => /discrete mathematics|nptel|iit madras/i.test(value),
    file: "DescreteMath.pdf"
  },
  {
    test: (value) => /java full stack developer|niit/i.test(value),
    file: "JavaFullStackDev.pdf"
  },
  {
    test: (value) => /analytics|excel|coding ninjas/i.test(value),
    file: "Certificate_Excel.pdf"
  },
  {
    test: (value) => /power bi|data visualization/i.test(value),
    file: "PowerBI.pdf"
  },
  {
    test: (value) => /sql for data analysis|sql/i.test(value),
    file: "SQL.pdf"
  }
];

function resolveCertificatePath(certificateName) {
  const text = String(certificateName || "");
  const match = CERTIFICATE_FILES.find((item) => item.test(text));
  return match ? `/legacy/documents/${encodeURIComponent(match.file)}` : "";
}

function SkillIcon({ name }) {
  const normalized = String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]/g, "");
  const map = {
    java: "java.svg",
    javascript: "javascript.svg",
    python: "python.svg",
    plsql: "plsql.svg",
    react: "react.svg",
    reactjs: "react.svg",
    html5: "html5.svg",
    css3: "css3.svg",
    bootstrap: "bootstrap.svg",
    spring: "spring.svg",
    springboot: "springboot.svg",
    oracle: "oracle.svg",
    sqlserver: "sqlserver.svg",
    mysql: "mysql.svg",
    git: "git.svg",
    intellijidea: "intellijidea.svg",
    vscode: "vscode.svg",
    servicenow: "servicenow.svg",
    jira: "jira.svg",
    obdx: "obdx.svg",
    powerbi: "powerbi.svg",
    msexcel: "msexcel.svg",
    bankingplatforms: "banking.svg",
    fraudriskmanagement: "fraud.svg",
    apiintegration: "api.svg",
    compliance: "compliance.svg"
  };

  const src = `/assets/icons/skills/${map[normalized] || "generic.svg"}`;
  return <img src={src} alt="" className="skill-icon" loading="lazy" />;
}

export default function PortfolioPage() {
  const [content, setContent] = useState(() => normalizeContent(defaultContent));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPublicContent();
        if (active) {
          setContent(data);
        }
      } catch (err) {
        if (active) {
          setError(String(err?.message || "Unable to load from API. Showing local fallback."));
          setContent(normalizeContent(defaultContent));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const sectionTitles = content.sectionTitles;
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="portfolio-page">
      <section className="hero">
        <h1>{content.profile.name}</h1>
        <h3>{content.profile.role}</h3>
        <h2>{content.profile.headline}</h2>
        <p>{content.profile.summary}</p>
        <div className="hero-actions">
          <a href={`mailto:${content.profile.email}`} className="btn btn-primary">
            Contact Me
          </a>
          <a href={content.profile.cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            View CV
          </a>
        </div>
        <p className="muted">{content.profile.location}</p>
        {loading && <p className="status">Loading latest content...</p>}
        {error && <p className="status status-warn">{error}</p>}
      </section>

      <section id="stats" className="section-block">
        <h2>Impact Highlights</h2>
        <div className="grid two-col">
          {content.stats.map((stat, index) => (
            <article className="card" key={`stat-${index}`}>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="section-block">
        <h2>{sectionTitles.experience}</h2>
        <article className="card">
          <h3>{content.experience.role}</h3>
          <p className="meta">{content.experience.meta}</p>
          <ul>
            {content.experience.bullets.map((item, index) => (
              <li key={`exp-${index}`}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section id="skills" className="section-block">
        <h2>{sectionTitles.skills}</h2>
        <div className="grid two-col">
          {content.skills.map((group, index) => (
            <article className="card" key={`skill-${index}`}>
              <h3>{group.title}</h3>
              <ul className="skill-list">
                {group.items.map((item, itemIndex) => (
                  <li key={`skill-item-${index}-${itemIndex}`}>
                    <SkillIcon name={item} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="section-block">
        <h2>{sectionTitles.projects}</h2>
        <div className="grid two-col">
          {content.projects.map((project, index) => (
            <article className="card" key={`project-${index}`}>
              <h3>{project.title}</h3>
              <p className="meta">{project.tech}</p>
              <p>{project.description}</p>
              {project.url ? (
                <a className="project-link" href={project.url} target="_blank" rel="noopener noreferrer">
                  View Repository
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section id="education" className="section-block">
        <h2>{sectionTitles.education}</h2>
        <div className="grid two-col">
          {content.education.map((item, index) => (
            <article className="card" key={`edu-${index}`}>
              <h3>{item.title}</h3>
              <p className="meta">{item.meta}</p>
              {item.detail ? <p>{item.detail}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="section-block split-grid">
        <div>
          <h2>{sectionTitles.certifications}</h2>
          <div className="grid">
            {content.certifications.map((item, index) => (
              <article className="card cert-card" key={`cert-${index}`}>
                <p>{item}</p>
                {resolveCertificatePath(item) ? (
                  <a
                    className="project-link cert-link"
                    href={resolveCertificatePath(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Certificate
                  </a>
                ) : (
                  <span className="meta">Certificate file not mapped.</span>
                )}
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2>{sectionTitles.profile}</h2>
          <article className="card">
            {content.profileDetails.map((item, index) => (
              <p key={`detail-${index}`}>{item}</p>
            ))}
          </article>
        </div>
      </section>

      {content.customSections?.map((section, index) => (
        <section className="section-block" key={`custom-${index}`}>
          <h2>{section.title}</h2>
          <article className="card">
            {section.lines.map((line, lineIndex) => (
              <p key={`custom-line-${lineIndex}`}>{line}</p>
            ))}
          </article>
        </section>
      ))}

      <footer className="footer">© {year} {content.profile.name}</footer>
    </div>
  );
}

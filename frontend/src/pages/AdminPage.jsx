import { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { fetchAdminContent, googleSignIn, saveAdminContent } from "../api";
import { cloneContent, defaultContent, normalizeContent } from "../defaultContent";

const TOKEN_KEY = "portfolio_admin_token";
const EMAIL_KEY = "portfolio_admin_email";

function SectionCard({ title, children }) {
  return (
    <section className="admin-card">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ListEditor({ items, onChange, placeholder }) {
  return (
    <div className="list-editor">
      {items.map((item, index) => (
        <div className="row" key={index}>
          <input
            value={item}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...items];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => {
              const next = items.filter((_, itemIndex) => itemIndex !== index);
              onChange(next);
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])}>
        Add
      </button>
    </div>
  );
}

function SkillsEditor({ skills, onChange }) {
  return (
    <div className="list-editor">
      {skills.map((skill, index) => (
        <div className="admin-subcard" key={index}>
          <div className="row">
            <input
              value={skill.title}
              placeholder="Category"
              onChange={(event) => {
                const next = [...skills];
                next[index] = { ...next[index], title: event.target.value };
                onChange(next);
              }}
            />
            <button
              type="button"
              onClick={() => {
                const next = skills.filter((_, itemIndex) => itemIndex !== index);
                onChange(next);
              }}
            >
              Remove
            </button>
          </div>
          <textarea
            rows={3}
            value={(skill.items || []).join(", ")}
            placeholder="Comma separated skills"
            onChange={(event) => {
              const next = [...skills];
              next[index] = {
                ...next[index],
                items: event.target.value
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean)
              };
              onChange(next);
            }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...skills, { title: "", items: [] }])}
      >
        Add Category
      </button>
    </div>
  );
}

function ObjectListEditor({ rows, fields, onChange, addTemplate }) {
  return (
    <div className="list-editor">
      {rows.map((row, index) => (
        <div className="admin-subcard" key={index}>
          {fields.map((field) => (
            <input
              key={field.key}
              value={row[field.key] || ""}
              placeholder={field.label}
              onChange={(event) => {
                const next = [...rows];
                next[index] = {
                  ...next[index],
                  [field.key]: event.target.value
                };
                onChange(next);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, { ...addTemplate }])}>
        Add Row
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || "");
  const [content, setContent] = useState(() => cloneContent(defaultContent));
  const [status, setStatus] = useState("Sign in with Google to edit content.");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAuthenticated = Boolean(token);

  async function loadAdminData(activeToken) {
    setLoading(true);
    try {
      const data = await fetchAdminContent(activeToken);
      setContent(normalizeContent(data));
      setStatus("Loaded content from database.");
    } catch (error) {
      if (String(error?.message || "").toLowerCase().includes("unauthorized")) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        setToken("");
        setEmail("");
        setStatus("Session expired. Please sign in again.");
        return;
      }
      setStatus(`Load failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }
    loadAdminData(token);
  }, [token]);

  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const previewJson = useMemo(() => JSON.stringify(content, null, 2), [content]);

  return (
    <div className="admin-page">
      <h1>Portfolio Admin</h1>
      <p className="muted">
        Google sign-in is handled by Auth Service. Admin updates are saved through API Gateway into JDBC services.
      </p>

      {!isAuthenticated ? (
        <section className="admin-card">
          <h3>Sign In</h3>
          {!googleEnabled ? (
            <p className="status status-warn">
              Missing `VITE_GOOGLE_CLIENT_ID`. Add it in `frontend/.env`.
            </p>
          ) : (
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (!credentialResponse.credential) {
                  setStatus("Google did not return an ID token.");
                  return;
                }

                try {
                  const auth = await googleSignIn(credentialResponse.credential);
                  localStorage.setItem(TOKEN_KEY, auth.token);
                  localStorage.setItem(EMAIL_KEY, auth.email || "");
                  setToken(auth.token);
                  setEmail(auth.email || "");
                  setStatus("Sign-in successful.");
                } catch (error) {
                  setStatus(`Sign-in failed: ${error.message}`);
                }
              }}
              onError={() =>
                setStatus(
                  "Google sign-in failed. Check Google OAuth Web Client origin settings and frontend VITE_GOOGLE_CLIENT_ID."
                )
              }
            />
          )}
        </section>
      ) : (
        <>
          <section className="admin-card">
            <div className="row between">
              <h3>Signed in as {email || "admin"}</h3>
              <div className="actions">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(EMAIL_KEY);
                    setToken("");
                    setEmail("");
                    setStatus("Signed out.");
                  }}
                >
                  Sign Out
                </button>
                <button type="button" onClick={() => loadAdminData(token)} disabled={loading}>
                  {loading ? "Reloading..." : "Reload"}
                </button>
              </div>
            </div>
          </section>

          <SectionCard title="Profile">
            <div className="grid two-col">
              {Object.entries(content.profile).map(([key, value]) => (
                <label key={key}>
                  <span>{key}</span>
                  <input
                    value={value || ""}
                    onChange={(event) =>
                      setContent((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          [key]: event.target.value
                        }
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Section Titles">
            <div className="grid two-col">
              {Object.entries(content.sectionTitles).map(([key, value]) => (
                <label key={key}>
                  <span>{key}</span>
                  <input
                    value={value || ""}
                    onChange={(event) =>
                      setContent((prev) => ({
                        ...prev,
                        sectionTitles: {
                          ...prev.sectionTitles,
                          [key]: event.target.value
                        }
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Stats">
            <ObjectListEditor
              rows={content.stats}
              fields={[
                { key: "label", label: "Label" },
                { key: "value", label: "Value" }
              ]}
              addTemplate={{ label: "", value: "" }}
              onChange={(stats) => setContent((prev) => ({ ...prev, stats }))}
            />
          </SectionCard>

          <SectionCard title="Experience">
            <div className="grid two-col">
              <label>
                <span>role</span>
                <input
                  value={content.experience.role}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      experience: { ...prev.experience, role: event.target.value }
                    }))
                  }
                />
              </label>
              <label>
                <span>meta</span>
                <input
                  value={content.experience.meta}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      experience: { ...prev.experience, meta: event.target.value }
                    }))
                  }
                />
              </label>
            </div>
            <h4>Bullets</h4>
            <ListEditor
              items={content.experience.bullets}
              placeholder="Experience bullet"
              onChange={(bullets) =>
                setContent((prev) => ({
                  ...prev,
                  experience: { ...prev.experience, bullets }
                }))
              }
            />
          </SectionCard>

          <SectionCard title="Skills & Tools">
            <SkillsEditor
              skills={content.skills}
              onChange={(skills) => setContent((prev) => ({ ...prev, skills }))}
            />
          </SectionCard>

          <SectionCard title="Projects">
            <ObjectListEditor
              rows={content.projects}
              fields={[
                { key: "title", label: "Title" },
                { key: "tech", label: "Tech" },
                { key: "description", label: "Description" },
                { key: "url", label: "Repository URL" }
              ]}
              addTemplate={{ title: "", tech: "", description: "", url: "" }}
              onChange={(projects) => setContent((prev) => ({ ...prev, projects }))}
            />
          </SectionCard>

          <SectionCard title="Education">
            <ObjectListEditor
              rows={content.education}
              fields={[
                { key: "title", label: "Title" },
                { key: "meta", label: "Meta" },
                { key: "detail", label: "Detail" }
              ]}
              addTemplate={{ title: "", meta: "", detail: "" }}
              onChange={(education) => setContent((prev) => ({ ...prev, education }))}
            />
          </SectionCard>

          <SectionCard title="Certifications">
            <ListEditor
              items={content.certifications}
              placeholder="Certification"
              onChange={(certifications) => setContent((prev) => ({ ...prev, certifications }))}
            />
          </SectionCard>

          <SectionCard title="Profile Details">
            <ListEditor
              items={content.profileDetails}
              placeholder="Detail line"
              onChange={(profileDetails) => setContent((prev) => ({ ...prev, profileDetails }))}
            />
          </SectionCard>

          <SectionCard title="Save">
            <div className="actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const saved = await saveAdminContent(token, content);
                    setContent(saved);
                    setStatus("Saved successfully.");
                  } catch (error) {
                    if (String(error?.message || "").toLowerCase().includes("unauthorized")) {
                      localStorage.removeItem(TOKEN_KEY);
                      localStorage.removeItem(EMAIL_KEY);
                      setToken("");
                      setEmail("");
                      setStatus("Session expired. Please sign in again.");
                      return;
                    }
                    setStatus(`Save failed: ${error.message}`);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving..." : "Save to Database"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const cloned = cloneContent(defaultContent);
                  setContent(cloned);
                  setStatus("Loaded local defaults in editor (not saved).\n");
                }}
              >
                Load Defaults
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Preview JSON">
            <textarea className="json-preview" readOnly value={previewJson} rows={16} />
          </SectionCard>
        </>
      )}

      <p className="status">{status}</p>
    </div>
  );
}

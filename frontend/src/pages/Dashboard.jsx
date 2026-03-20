import { useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { RESUME_PRESETS, JD_PRESETS } from "../hooks/presets";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from "recharts";

const API = "http://localhost:8000/api";

const TABS = [
  { id: "analyze", label: "📄 Analyze" },
  { id: "gaps", label: "⚠️ Skill Gaps" },
  { id: "roadmap", label: "🗺️ Roadmap" },
  { id: "trace", label: "🧠 AI Reasoning" },
  { id: "interview", label: "🎯 Interview Prep" },
  { id: "career", label: "🚀 Career Sim" },
  { id: "resume", label: "📝 Resume Tips" },
  { id: "mentor", label: "💬 AI Mentor" },
];

const LOADING_STEPS = [
  "Extracting skills from resume...",
  "Parsing job description...",
  "Running gap analysis...",
  "Building adaptive roadmap...",
  "Generating reasoning trace...",
  "Simulating career path...",
  "Preparing interview questions...",
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedJD, setSelectedJD] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("analyze");
  const [completed, setCompleted] = useState({});
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: "Hi! I'm your AI mentor. Ask me anything about your learning path." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleResumePreset = (preset, idx) => {
    setResumeText(preset.text);
    setSelectedResume(idx);
  };

  const handleJDPreset = (preset, idx) => {
    setJdText(preset.text);
    setSelectedJD(idx);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jdText.trim()) { setErr("Please fill both resume and job description."); return; }
    setLoading(true); setErr(""); setResult(null); setLoadStep(0);
    const interval = setInterval(() => setLoadStep(s => Math.min(s + 1, LOADING_STEPS.length - 1)), 1200);
    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText, jd_text: jdText })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setCompleted({});
      setActiveTab("gaps");
    } catch (e) { setErr("Analysis failed. Ensure backend is running with ANTHROPIC_API_KEY set."); }
    clearInterval(interval); setLoading(false);
  };

  const toggleComplete = (idx) => {
    setCompleted(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalModules = result?.learning_roadmap?.length || 0;
  const progressPct = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  const handleMentor = async () => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatMessages(m => [...m, { role: "user", text: q }]);
    setChatInput(""); setChatLoading(true);
    try {
      const res = await fetch(`${API}/mentor`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          user_profile: {
            job_title: result?.job_title || "Software Engineer",
            learner_level: result?.learner_level || "Beginner",
            skill_gaps: (result?.skill_gaps || []).map(g => g.skill).slice(0, 5)
          }
        })
      });
      const data = await res.json();
      setChatMessages(m => [...m, { role: "bot", text: data.reply }]);
    } catch {
      setChatMessages(m => [...m, { role: "bot", text: "Sorry, couldn't connect to mentor service." }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const radarData = result ? (() => {
    const reqMap = Object.fromEntries((result.required_skills || []).map(s => [s.name, s.level]));
    const cndMap = Object.fromEntries((result.candidate_skills || []).map(s => [s.name, s.level]));
    const lvl = l => ({ beginner: 1, intermediate: 2, advanced: 3 }[l] || 0);
    return (result.required_skills || []).slice(0, 8).map(s => ({
      skill: s.name.length > 8 ? s.name.slice(0, 8) : s.name,
      Required: lvl(reqMap[s.name]) * 33,
      Current: lvl(cndMap[s.name]) * 33
    }));
  })() : [];

  const barData = (result?.skill_gaps || []).slice(0, 8).map(g => ({
    name: g.skill.length > 10 ? g.skill.slice(0, 10) : g.skill,
    gap: g.gap_score
  }));

  return (
    <div>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-logo"><span>⚡</span> AI Onboarding Engine</div>
        <div className="topbar-right">
          <div className="topbar-user">Welcome, <strong>{user?.name}</strong></div>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="page">
        {/* TABS */}
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ── TAB: ANALYZE ── */}
        {activeTab === "analyze" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div className="section-label">Select Resume Template or Paste Your Own</div>
            <div className="preset-row">
              {RESUME_PRESETS.map((p, i) => (
                <span key={i} className={`preset-chip ${selectedResume === i ? "active" : ""}`}
                  onClick={() => handleResumePreset(p, i)}>{p.label}</span>
              ))}
            </div>

            <div className="upload-grid">
              <div className="upload-card">
                <label>📄 Resume Text</label>
                <textarea value={resumeText} onChange={e => { setResumeText(e.target.value); setSelectedResume(null); }}
                  placeholder="Paste your resume here, or select a template above..." />
              </div>
              <div className="upload-card">
                <label>💼 Job Description</label>
                <div className="preset-row" style={{ marginBottom: 8 }}>
                  {JD_PRESETS.map((p, i) => (
                    <span key={i} className={`preset-chip ${selectedJD === i ? "active" : ""}`}
                      onClick={() => handleJDPreset(p, i)}>{p.label}</span>
                  ))}
                </div>
                <textarea value={jdText} onChange={e => { setJdText(e.target.value); setSelectedJD(null); }}
                  placeholder="Paste job description here, or select a preset above..." />
              </div>
            </div>

            {err && <div className="err" style={{ marginTop: 12 }}>⚠️ {err}</div>}

            <div className="analyze-row">
              <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                {loading ? "Analyzing..." : "⚡ Analyze & Generate Full Roadmap"}
              </button>
            </div>

            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <p>AI is processing your profile...</p>
                <div className="loading-steps">
                  {LOADING_STEPS.map((s, i) => (
                    <div key={i} className={`loading-step ${i === loadStep ? "active" : i < loadStep ? "done" : ""}`}>
                      {i < loadStep ? "✓" : i === loadStep ? "▶" : "○"} {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESULT TABS ── */}
        {result && activeTab !== "analyze" && (
          <>
            {/* SCORE BANNER */}
            <div className="score-banner">
              <div className="score-title">
                <h2>{result.candidate_name || "Candidate"}</h2>
                <div className="sub">Target: {result.job_title}</div>
              </div>
              <div className="score-stats">
                <div className="score-circle">
                  <span className="num">{result.overall_gap_score}%</span>
                  <span className="lbl">Gap</span>
                </div>
                <span className={`level-pill ${result.learner_level}`}>{result.learner_level}</span>
              </div>
            </div>

            {/* TIME ESTIMATE */}
            {result.time_estimate && (
              <div className="time-bar" style={{ marginBottom: 24 }}>
                {[
                  { v: result.time_estimate.total_days, k: "Total Days" },
                  { v: result.time_estimate.total_weeks, k: "Weeks" },
                  { v: result.time_estimate.daily_hours + "h", k: "Daily Hours" },
                  { v: totalModules, k: "Modules" },
                ].map(({ v, k }) => (
                  <div className="time-stat" key={k}><div className="tv">{v}</div><div className="tk">{k}</div></div>
                ))}
              </div>
            )}

            {/* PROGRESS */}
            {totalModules > 0 && (
              <div className="progress-wrap">
                <div className="progress-label">
                  <span>Learning Progress — {completedCount}/{totalModules} modules</span>
                  <strong>{progressPct}%</strong>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TAB: GAPS ── */}
        {activeTab === "gaps" && result && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Skills Radar — Required vs Current</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a2b45" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "#9898b8", fontSize: 11 }} />
                    <Radar name="Required" dataKey="Required" stroke="#ff6b9d" fill="#ff6b9d" fillOpacity={0.25} />
                    <Radar name="Current" dataKey="Current" stroke="#7c6eff" fill="#7c6eff" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>Gap Heatmap by Skill</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9898b8", fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#9898b8", fontSize: 11 }} width={80} />
                    <Tooltip contentStyle={{ background: "#161728", border: "1px solid #2a2b45", borderRadius: 8 }} />
                    <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
                      {barData.map((_, i) => <Cell key={i} fill={`hsl(${260 - i * 20}, 80%, 65%)`} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-label">✅ Your Skills</div>
            <div className="skills-flex">
              {(result.candidate_skills || []).map((s, i) => (
                <div className="skill-chip" key={i}>
                  <span className={`dot ${s.level}`} />
                  {s.name}
                  {s.confidence && <span className="conf-badge">{s.confidence}%</span>}
                </div>
              ))}
            </div>

            <div className="section-label">📋 Required Skills</div>
            <div className="skills-flex">
              {(result.required_skills || []).map((s, i) => (
                <div className="skill-chip" key={i}>
                  <span className={`dot ${s.level}`} />
                  {s.name}
                  {s.mention_count > 1 && <span className="mention-badge">×{s.mention_count}</span>}
                </div>
              ))}
            </div>

            <div className="section-label">⚠️ Skill Gaps (sorted by priority)</div>
            <div className="gap-list">
              {(result.skill_gaps || []).map((g, i) => (
                <div className="gap-item" key={i}>
                  <div className="gap-header">
                    <span className="gap-name">
                      {g.skill}
                      {g.mention_count > 1 && <span className="mention-badge">mentioned {g.mention_count}× in JD</span>}
                    </span>
                    <span className="gap-score-lbl">{g.gap_score}% gap</span>
                  </div>
                  <div className="gap-bar-bg">
                    <div className="gap-bar-fill" style={{ width: `${g.gap_score}%` }} />
                  </div>
                  <div className="gap-meta">
                    <span>Required: {g.required_level}</span>
                    <span>Yours: {g.candidate_level || "Not found"}</span>
                    <span>{g.category}</span>
                    {g.estimated_days && <span>~{g.estimated_days} days to close</span>}
                  </div>
                  {g.missing_prerequisites?.length > 0 && (
                    <div className="prereq-list">
                      ⚠️ Missing prerequisites: {g.missing_prerequisites.map(p => <span className="prereq-tag" key={p}>{p}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: ROADMAP ── */}
        {activeTab === "roadmap" && result && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div className="section-label">🗺️ Adaptive Learning Roadmap — {result.learner_level} Track</div>
            <div className="roadmap-list">
              {(result.learning_roadmap || []).map((m, i) => (
                <div className="roadmap-item" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className={`roadmap-dot ${completed[i] ? "done" : ""}`}>
                    {completed[i] ? "✓" : i + 1}
                  </div>
                  <div className={`roadmap-card ${completed[i] ? "done" : ""}`}>
                    <div className="roadmap-card-head">
                      <h3>{m.title}</h3>
                      <div className="tags">
                        <span className="tag">{m.resource_type}</span>
                        <span className="tag">{m.duration}</span>
                        <span className="tag">P{m.priority}</span>
                      </div>
                    </div>
                    <p className="roadmap-desc">{m.description}</p>
                    {m.reason && <div className="roadmap-reason">💡 {m.reason}</div>}
                    {m.week_plan && (
                      <div className="week-plan">
                        {Object.entries(m.week_plan).map(([wk, task]) => (
                          <div className="week-chip" key={wk}><strong>{wk}:</strong> {task}</div>
                        ))}
                      </div>
                    )}
                    {m.resource_url && (
                      <a className="roadmap-link" href={m.resource_url} target="_blank" rel="noreferrer">
                        → Start Learning ↗
                      </a>
                    )}
                    <br />
                    <button className={`complete-btn ${completed[i] ? "done" : ""}`} onClick={() => toggleComplete(i)}>
                      {completed[i] ? "✓ Completed" : "Mark Complete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: REASONING TRACE ── */}
        {activeTab === "trace" && result && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div className="section-label">🧠 Explainable AI — Reasoning Trace</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>
              Every skill gap recommendation is explained below. No black-box AI.
            </p>
            <div className="trace-list">
              {(result.reasoning_trace || []).map((t, i) => (
                <div className="trace-item" key={i}>
                  <div className="trace-header">
                    <span className="trace-skill">{t.skill}</span>
                    <span className="trace-conf">Confidence: {t.confidence}%</span>
                  </div>
                  <div className="trace-badges">
                    <span className={`badge ${t.found_in_resume ? "found" : "missing"}`}>
                      {t.found_in_resume ? "✓ Found in resume" : "✗ Not in resume"}
                    </span>
                    <span className="badge neutral">JD mentions: {t.jd_mentions}×</span>
                  </div>
                  <p className="trace-reasoning">"{t.reasoning}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: INTERVIEW ── */}
        {activeTab === "interview" && result && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div className="section-label">🎯 Interview Readiness — Practice Questions</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>
              Questions generated based on your skill gaps for: <strong>{result.job_title}</strong>
            </p>
            <div className="iq-list">
              {(result.interview_questions || []).map((q, i) => (
                <div className="iq-item" key={i}>
                  <div className="iq-head">
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", minWidth: 28 }}>Q{i + 1}</span>
                    <span className={`difficulty-badge ${q.difficulty}`}>{q.difficulty}</span>
                    <span className="tag" style={{ marginLeft: 4 }}>{q.skill}</span>
                  </div>
                  <p className="iq-q">{q.question}</p>
                  {q.tip && <div className="iq-tip">💡 Tip: {q.tip}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: CAREER SIM ── */}
        {activeTab === "career" && result?.career_simulation && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div className="section-label">🚀 AI Career Simulation</div>
            <div className="career-grid">
              {[
                { label: "Predicted Role", value: result.career_simulation.predicted_role },
                { label: "Time to Achieve", value: result.career_simulation.time_to_achieve },
                { label: "Salary Range", value: result.career_simulation.salary_range },
                { label: "Success Probability", value: `${result.career_simulation.success_probability}%` },
              ].map(({ label, value }) => (
                <div className="career-stat" key={label}>
                  <div className="cs-label">{label}</div>
                  <div className="cs-value">{value}</div>
                </div>
              ))}
            </div>

            {result.career_simulation.milestones?.length > 0 && (
              <>
                <div className="section-label">📅 Milestones</div>
                <div className="milestones">
                  {result.career_simulation.milestones.map((m, i) => (
                    <div className="milestone" key={i}>
                      <div className="milestone-week">Week {m.week}</div>
                      <div className="milestone-text">
                        <strong>{m.achievement}</strong>
                        <span>{m.unlock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.career_simulation.next_roles?.length > 0 && (
              <>
                <div className="section-label">📈 Career Progression</div>
                <div className="next-roles">
                  {result.career_simulation.next_roles.map((r, i) => (
                    <span className="next-role" key={i}>{i + 1}. {r}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB: RESUME TIPS ── */}
        {activeTab === "resume" && result?.resume_suggestions && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div className="section-label">📝 Resume Improvement Suggestions</div>

            {result.resume_suggestions.missing_keywords?.length > 0 && (
              <div className="sugg-section">
                <h4>❌ Missing Keywords (add these to your resume)</h4>
                <div className="keyword-list">
                  {result.resume_suggestions.missing_keywords.map((k, i) => (
                    <span className="keyword-tag" key={i}>{k}</span>
                  ))}
                </div>
              </div>
            )}

            {result.resume_suggestions.phrasing_improvements?.length > 0 && (
              <div className="sugg-section">
                <h4>✏️ Better Phrasing</h4>
                {result.resume_suggestions.phrasing_improvements.map((p, i) => (
                  <div className="phrase-item" key={i}>
                    <div className="phrase-orig">❌ {p.original}</div>
                    <div className="phrase-arrow">↓</div>
                    <div className="phrase-new">✅ {p.improved}</div>
                  </div>
                ))}
              </div>
            )}

            {result.resume_suggestions.structure_tips?.length > 0 && (
              <div className="sugg-section">
                <h4>📋 Structure Tips</h4>
                <ul className="tip-list">
                  {result.resume_suggestions.structure_tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MENTOR ── */}
        {activeTab === "mentor" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div className="section-label">💬 AI Mentor Chatbot</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>
              Ask your AI mentor anything about your learning journey, skills, or roadmap.
            </p>
            <div className="chat-box">
              <div className="chat-messages">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>{m.text}</div>
                ))}
                {chatLoading && <div className="msg bot">Thinking...</div>}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-row">
                <input className="chat-input" placeholder="Ask something... e.g. 'Why should I learn Docker?'"
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleMentor()} />
                <button className="chat-send" onClick={handleMentor} disabled={chatLoading}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* No result prompt */}
        {!result && activeTab !== "analyze" && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <p>Run an analysis first from the <strong style={{ color: "var(--accent)" }}>Analyze</strong> tab.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:8000/api/auth";

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      login(data.user, data.token);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-brand">⚡ AI Onboarding Engine</div>
        <h1>Your <span>Personalized</span><br />Learning Starts Here</h1>
        <p>Upload your resume, paste a job description, and get an AI-powered adaptive learning roadmap in seconds.</p>
        <div className="auth-features">
          {[
            ["🧠", "Explainable AI with reasoning trace"],
            ["📊", "Skill gap heatmap & radar chart"],
            ["🗺️", "Graph-based adaptive roadmap"],
            ["🤖", "AI mentor chatbot"],
            ["🎯", "Interview readiness mode"],
            ["🚀", "Career simulation & salary prediction"],
          ].map(([icon, text]) => (
            <div className="auth-feature" key={text}>
              <div className="auth-feature-icon">{icon}</div>
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2>Welcome back</h2>
          <p className="sub">Don't have an account? <a onClick={onSwitch}>Sign up free</a></p>

          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {err && <div className="err">⚠️ {err}</div>}
          <br />
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="auth-switch">
            <span>New here? </span><a onClick={onSwitch}>Create an account</a>
          </div>
        </div>
      </div>
    </div>
  );
}

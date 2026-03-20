import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:8000/api/auth";

export default function RegisterPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      login(data.user, data.token);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-brand">⚡ AI Onboarding Engine</div>
        <h1>Build Your <span>Dream Career</span><br />With AI</h1>
        <p>Join thousands using AI to identify skill gaps, get personalized learning paths, and land their dream jobs faster.</p>
        <div className="auth-features">
          {[
            ["🎯", "14 advanced AI-powered features"],
            ["📈", "Real-time adaptive learning engine"],
            ["🔍", "Cross-domain: Tech, Data, Management"],
            ["💬", "AI mentor available 24/7"],
            ["📄", "Resume improvement suggestions"],
            ["⏱️", "Time-optimized learning schedule"],
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
          <h2>Create account</h2>
          <p className="sub">Already registered? <a onClick={onSwitch}>Sign in</a></p>

          <div className="field">
            <label>Full Name</label>
            <input placeholder="Arjun Sharma" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Min. 8 characters" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {err && <div className="err">⚠️ {err}</div>}
          <br />
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating account..." : "Get Started Free →"}
          </button>

          <div className="auth-switch">
            <span>Already have an account? </span><a onClick={onSwitch}>Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}

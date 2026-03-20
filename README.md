# ⚡ AI Adaptive Onboarding Engine v2

> **Hackathon Project** — AI-powered personalized learning roadmap generator

---

## 🎯 Problem Statement

Corporate onboarding is broken. Every employee — fresher or senior — gets the **same training**.

This leads to:
- ❌ Beginners overwhelmed with advanced content
- ❌ Experienced employees wasting time on basics
- ❌ No personalization based on actual skill gaps

**There is no intelligent system that understands WHO you are and WHAT you need to learn.**

---

## 💡 Our Solution — AI Adaptive Onboarding Engine

Upload your **Resume** + **Job Description** → AI analyzes → generates your **personalized learning roadmap** in seconds.
```
Resume + JD  →  Skill Extraction  →  Gap Analysis  →  Adaptive Roadmap
```

---

## 🏗️ System Architecture
```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  Login → Dashboard → 8 Tabs → All 14 Features       │
└─────────────────┬───────────────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────────────┐
│                  FastAPI Backend                     │
│                                                      │
│  /api/auth/register   →  User Registration           │
│  /api/auth/login      →  User Login                  │
│  /api/analyze         →  Full AI Analysis Pipeline   │
│  /api/mentor          →  AI Mentor Chat              │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              AI Layer (Dual Engine)                  │
│                                                      │
│  PRIMARY  →  Groq API  (llama-3.3-70b) ⚡ FAST      │
│  FALLBACK →  Anthropic Claude (claude-sonnet-4)      │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 14 Advanced Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔐 Authentication | Register / Login with secure token |
| 2 | 🧠 Explainable AI | Every recommendation shows WHY — no black box |
| 3 | 📊 Skill Gap Radar Chart | Visual: Required vs Current skills |
| 4 | 🔥 Gap Heatmap | Bar chart showing gap intensity per skill |
| 5 | 🗺️ Graph-Based Roadmap | Skill dependency graph — prereqs auto-handled |
| 6 | 🎓 Multi-Level Detection | Beginner / Intermediate / Advanced with confidence % |
| 7 | ✅ Progress Tracker | Mark modules complete — live progress bar |
| 8 | 📚 Grounded Courses | Real courses from Coursera, fast.ai, MDN — no hallucination |
| 9 | 🚀 Career Simulation | Predicts future role, salary range, milestones |
| 10 | 🎯 Interview Prep | Auto-generated questions based on your skill gaps |
| 11 | 📝 Resume Tips | Missing keywords, better phrasing, structure advice |
| 12 | ⏱️ Time Optimizer | Total days, weekly plan, daily hours estimate |
| 13 | 💬 AI Mentor Chatbot | Ask anything — personalized answers based on your profile |
| 14 | 🌐 Cross-Domain | Works for Tech, Data Science, Management, and more |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, CSS Variables |
| Backend | FastAPI (Python 3.11+) |
| Auth | Token-based auth + file store |
| AI Primary | Groq API — `llama-3.3-70b-versatile` ⚡ |
| AI Fallback | Anthropic — `claude-sonnet-4-20250514` |
| Charts | Recharts (Radar + Bar) |
| Parsing | PyMuPDF, python-docx |

---

## 📁 Folder Structure
```
ai-onboarding-v2/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth.py              # Register + Login endpoints
│   │   └── analyze.py           # /analyze + /mentor endpoints
│   └── services/
│       ├── ai_client.py         # Groq (primary) + Anthropic (fallback)
│       ├── extractor.py         # Resume + JD skill extraction
│       ├── gap_analyzer.py      # Graph-based gap analysis engine
│       ├── roadmap.py           # Adaptive roadmap generator
│       └── advanced.py          # Reasoning, interview, career, mentor
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx              # Auth routing
        ├── index.js
        ├── hooks/
        │   ├── useAuth.jsx      # Auth context + localStorage
        │   └── presets.js       # Resume + JD sample templates
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── Dashboard.jsx    # All 8 tabs + 14 features
        └── styles/
            └── main.css         # Full design system
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key → [console.groq.com](https://console.groq.com) (Free)
- Anthropic API Key → [console.anthropic.com](https://console.anthropic.com) (Fallback)

---

### Step 1 — Backend
```bash
cd backend
pip install -r requirements.txt
```

Set environment variables:
```bash
# Required
export GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# Optional (fallback if Groq fails)
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

Start the server:
```bash
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

### Step 2 — Frontend
```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🤖 AI Pipeline — How It Works
```
1. User uploads Resume + JD text
          ↓
2. extractor.py  →  Groq extracts skills + confidence scores
          ↓
3. gap_analyzer.py  →  Graph-based gap scoring
          │
          ├── Skill dependency graph (Python → ML → Deep Learning)
          ├── Missing prerequisite detection
          └── Learner level: Beginner / Intermediate / Advanced
          ↓
4. roadmap.py  →  Adaptive learning path generated
          │
          ├── Beginner  → Fundamentals first
          ├── Intermediate  → Skip basics, project-based
          └── Advanced  → Architecture + best practices
          ↓
5. advanced.py  →  4 parallel AI calls
          ├── Reasoning Trace (Explainable AI)
          ├── Interview Questions
          ├── Resume Suggestions
          └── Career Simulation
```

---

## 🧠 Adaptive Learning Algorithm

Skills are represented as a **dependency graph**:
```
Python → Data Structures → Machine Learning → Deep Learning
React → Next.js
Docker → Kubernetes
Linux Basics → AWS
```

**Logic:**
- If candidate already knows Python → skip Python basics
- If Machine Learning is required but Python is missing → add Python first (prerequisite)
- Roadmap is ordered by: gap score + dependency order + JD mention count

---

## 📊 Skill Gap Scoring
```
gap_score = (required_level - candidate_level) / required_level × 100

Beginner   → gap > 60%  → Start from fundamentals
Intermediate → gap 30–60% → Focus on missing mid-level skills
Advanced   → gap < 30%  → Architecture + best practices only
```

Confidence scoring uses:
- Keyword frequency in resume
- Context (project description, experience years)
- Skill mention count in JD

---

## 🏆 Hackathon Differentiators

### 1. Explainable AI ✅
Not just "you lack Python" — shows:
> *"Python is mentioned 5× in JD as core requirement. Not found anywhere in resume. Confidence: 95%"*

### 2. Graph-Based Skill Dependencies ✅
Original adaptive logic — not a flat list. Skills have prerequisites, roadmap respects the dependency order.

### 3. Dual AI Engine ✅
Groq (llama-3.3-70b) for speed. Anthropic Claude as fallback. Best of both worlds.

### 4. Zero Hallucination Courses ✅
All course URLs are from a verified database (Coursera, fast.ai, MDN, official docs). AI only generates descriptions.

### 5. Full Product — Not Just a Demo ✅
Authentication, persistent progress tracking, mentor chatbot, career simulation — production-ready.

---

## 🎤 Elevator Pitch (30 seconds)

*"Corporate onboarding gives everyone the same training — whether you're a fresher or a 5-year veteran. Our AI Adaptive Onboarding Engine reads your resume, compares it to the job requirements, finds your exact skill gaps, and builds a personalized learning roadmap — in under 30 seconds. With explainable AI, graph-based skill dependencies, and a built-in career simulator, it's not just a tool — it's your personal career coach."*

---

## 📬 Demo Flow (for judges)

1. Open app → Register/Login
2. Select **"Fresher (CS Graduate)"** preset resume
3. Select **"Full-Stack Engineer"** JD preset
4. Click **Analyze**
5. Show tabs one by one:
   - ⚠️ Gaps → radar chart + heatmap
   - 🗺️ Roadmap → week plan + reasoning
   - 🧠 AI Reasoning → explain WHY each skill flagged
   - 🚀 Career Sim → salary + milestones
   - 💬 Mentor → ask "Can I skip Docker?"

---

## 🔮 Future Roadmap

- [ ] PDF resume upload (PyMuPDF ready)
- [ ] LMS integration (Udemy, Coursera APIs)
- [ ] Team onboarding dashboard
- [ ] Skill assessment quiz
- [ ] LinkedIn profile import
- [ ] Multi-language support
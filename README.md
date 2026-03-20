# AI Adaptive Onboarding Engine v3
### Production-Grade AI Platform — Full Architecture Guide

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React v18)                        │
│  TanStack Query · Axios Interceptors · React Router v6          │
│  DM Sans font · Tailwind CSS · Recharts · Lucide Icons          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / JWT Bearer
┌──────────────────────────────▼──────────────────────────────────┐
│                    FASTAPI BACKEND (Python 3.11)                 │
│  Async · Pydantic v2 · Motor (MongoDB) · JWT Auth               │
│                                                                   │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│  │  /auth  │  │ /analyze │  │  /chat   │  │  /progress   │     │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘     │
│       │            │              │                │             │
│  ┌────▼────────────▼──────────────▼────────────────▼──────────┐  │
│  │                    SERVICE LAYER                            │  │
│  │  analysis.py · roadmap.py · ai_client.py                   │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────▼──────────────────────────────────┐  │
│  │                    ML PIPELINE                              │  │
│  │  1. spaCy NER + Vocab Matching → Skill Extraction          │  │
│  │  2. SentenceTransformers (MiniLM) → Embeddings             │  │
│  │  3. Cosine Similarity → Resume↔JD Match Score              │  │
│  │  4. Feature Engineering → Gap Scoring                      │  │
│  │  5. Topological Sort → Dependency-Aware Path               │  │
│  │  6. LLM (Groq/Claude) → Roadmap + Explanations            │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
┌──────▼──────┐    ┌──────────▼──────────┐  ┌───────▼───────┐
│  MongoDB    │    │   Groq API          │  │ Anthropic API │
│  Atlas      │    │   (Primary LLM)     │  │  (Fallback)   │
│  Motor async│    │   llama3-70b        │  │  claude-haiku │
└─────────────┘    └─────────────────────┘  └───────────────┘
```

---

## 📁 Directory Structure

```
skillgap-v3/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # Register, Login endpoints
│   │   │   ├── analyze.py       # POST /analyze, GET /analyze/history
│   │   │   ├── chat.py          # AI Mentor chat endpoint
│   │   │   ├── progress.py      # Module completion tracking
│   │   │   └── export.py        # PDF roadmap export
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic Settings (env vars)
│   │   │   ├── security.py      # JWT + bcrypt
│   │   │   └── logging.py       # Structured logging
│   │   ├── db/
│   │   │   └── mongodb.py       # Motor async connection + indexes
│   │   ├── ml/
│   │   │   └── pipeline.py      # Full ML pipeline (NER, embeddings, scoring)
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── ai_client.py     # Groq → Claude fallback client
│   │   │   ├── analysis.py      # Main orchestration service
│   │   │   └── roadmap.py       # Roadmap generation + curated resources
│   │   └── main.py              # FastAPI app, middleware, lifespan
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/index.jsx     # Button, Card, Badge, Skeleton, Input...
│   │   │   └── layout/
│   │   │       └── AppLayout.jsx  # Sidebar + Header layout
│   │   ├── data/
│   │   │   └── presets.js       # Resume + JD sample presets
│   │   ├── hooks/
│   │   │   └── useAuth.jsx      # Auth context + hook
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx  # Stats + recent history
│   │   │   ├── AnalyzePage.jsx    # Resume + JD input + loading
│   │   │   ├── RoadmapPage.jsx    # Full results: gaps, roadmap, charts
│   │   │   ├── MentorPage.jsx     # AI chat interface
│   │   │   ├── HistoryPage.jsx    # Past analyses list
│   │   │   └── AuthPages.jsx      # Login + Register
│   │   ├── services/
│   │   │   └── api.js           # Axios instance + all API methods
│   │   ├── styles/
│   │   │   └── globals.css      # Design tokens + reset
│   │   └── App.jsx              # Router + QueryClient + Toaster
│   ├── package.json
│   └── vercel.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # Test → Build → Deploy pipeline
├── docker-compose.yml
└── README.md
```

---

## 🧠 ML Pipeline — Detailed

### 1. Skill Extraction (Two-Pass)

```python
# Pass 1: spaCy Named Entity Recognition
nlp = spacy.load("en_core_web_sm")
doc = nlp(resume_text)
# Entities recognized as tech skills via TECH_SKILLS_VOCAB lookup

# Pass 2: Vocabulary Matching (5,000+ tech skills)
for skill in TECH_SKILLS_VOCAB:
    matches = re.findall(r'\b' + skill + r'\b', text_lower)
    confidence = min(50 + len(matches) * 10, 95)

# Merged output:
# { name, level, category, confidence, frequency }
```

### 2. Embedding Similarity

```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")

# Encode both documents
embeddings = model.encode([resume_text, jd_text], normalize_embeddings=True)

# Cosine similarity (dot product on normalized vectors)
similarity = float(np.dot(embeddings[0], embeddings[1]))
# Returns 0.0–1.0
```

### 3. Gap Scoring Features

```
gap_score = f(level_gap, frequency_weight, embedding_credit)

level_gap         = (required_level - candidate_level) / required_level
frequency_weight  = log(1 + mention_count) / log(11)  # 0–1 normalized
embedding_credit  = cosine_similarity × 0.30            # max 30% partial credit

final_gap = max(0, level_gap - embedding_credit) × 100
```

### 4. Learning Path Ordering (Topological Sort)

```
Skill graph with prerequisites:
  Machine Learning → [Python, Statistics]
  Deep Learning    → [Machine Learning, Python]
  React            → [JavaScript, HTML/CSS]
  Kubernetes       → [Docker]
  ...

Kahn's algorithm ensures prerequisites always come first.
Tie-breaking by: gap_score × mention_count (highest priority first)
```

---

## 🍃 MongoDB Schema

### users
```json
{
  "_id": "ObjectId",
  "email": "string (unique index)",
  "name": "string",
  "password_hash": "string (bcrypt)",
  "created_at": "datetime",
  "streak_days": "int",
  "total_analyses": "int"
}
```

### analyses
```json
{
  "_id": "ObjectId",
  "user_id": "string (index)",
  "resume_text": "string (truncated 5000 chars)",
  "jd_text": "string (truncated 3000 chars)",
  "result": {
    "candidate_name": "string",
    "job_title": "string",
    "learner_level": "Beginner|Intermediate|Advanced",
    "resume_score": { "score": 72.5, "breakdown": {...} },
    "overall_similarity": 0.73,
    "skill_gaps": [...],
    "learning_roadmap": [...],
    "ai_summary": "string",
    "created_at": "ISO string"
  },
  "created_at": "datetime (index)"
}
```

### progress
```json
{
  "_id": "ObjectId",
  "user_id": "string (unique compound with analysis_id)",
  "analysis_id": "string",
  "completed_modules": [0, 2, 4],
  "last_updated": "datetime"
}
```

### chat_history
```json
{
  "_id": "ObjectId",
  "user_id": "string (compound index with analysis_id)",
  "analysis_id": "string",
  "question": "string",
  "answer": "string",
  "timestamp": "datetime"
}
```

---

## 🚀 Deployment Guide

### Step 1 — MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Create database user + password
3. Whitelist IP `0.0.0.0/0` (or specific IPs)
4. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/`

### Step 2 — Backend on Render
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect repo, set root directory to `backend/`
4. Build command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   ```
   MONGO_URI=mongodb+srv://...
   MONGO_DB_NAME=skillgap_v3
   GROQ_API_KEY=gsk_...
   ANTHROPIC_API_KEY=sk-ant-...
   JWT_SECRET=your-random-32-char-secret
   ENVIRONMENT=production
   ALLOWED_ORIGINS=["https://your-app.vercel.app"]
   ```

### Step 3 — Frontend on Vercel
1. Go to vercel.com → New Project
2. Import GitHub repo, set root to `frontend/`
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy — Vercel auto-deploys on every push to main

### Step 4 — CI/CD (GitHub Actions)
Add these secrets to your GitHub repo:
```
GROQ_API_KEY
ANTHROPIC_API_KEY
JWT_SECRET
REACT_APP_API_URL
RENDER_DEPLOY_HOOK    (from Render dashboard)
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

---

## 🔐 Security Checklist

- [x] bcrypt password hashing (cost factor 12)
- [x] JWT with expiry (7 days, configurable)
- [x] HTTPBearer token extraction
- [x] Pydantic input validation on all endpoints
- [x] Request size limits via field max_length
- [x] CORS whitelist (not wildcard in production)
- [x] GZip compression middleware
- [x] Global exception handler (no stack traces in prod)
- [ ] Rate limiting (add slowapi for production)
- [ ] MongoDB field encryption (add for PII)

---

## ⚡ Performance Optimization

### Backend
- **Motor async driver**: non-blocking MongoDB I/O
- **Parallel LLM calls**: asyncio.gather() for resume + JD extraction
- **Model caching**: @lru_cache on spaCy and SentenceTransformer load
- **Connection pooling**: Motor maxPoolSize=20

### Frontend
- **TanStack Query**: 5min staleTime, automatic background refresh
- **Skeleton loaders**: prevents layout shift during loading
- **React Router**: code splitting per route (lazy load optional)
- **Axios**: interceptors handle auth + errors globally

### Optional Redis Cache
```python
# Cache analysis results for 1 hour
import aioredis
redis = await aioredis.from_url(settings.REDIS_URL)

cache_key = f"analysis:{hash(resume_text + jd_text)}"
cached = await redis.get(cache_key)
if cached:
    return json.loads(cached)

result = await run_full_analysis(...)
await redis.setex(cache_key, 3600, json.dumps(result))
```

---

## 📦 Installing & Running Locally

```bash
# 1. Clone and setup
git clone https://github.com/you/skillgap-v3
cd skillgap-v3

# 2. Start MongoDB (Docker)
docker run -d -p 27017:27017 --name mongo mongo:7

# 3. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Create .env
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017
GROQ_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
JWT_SECRET=dev-secret-change-in-prod
EOF

uvicorn app.main:app --reload

# 4. Frontend (new terminal)
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
npm start
```

Or with Docker Compose:
```bash
cp .env.example .env  # fill in API keys
docker-compose up --build
```

---

## 🧪 Testing

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm test
```

---

## 📊 New Features in v3

| Feature | v2 | v3 |
|---|---|---|
| Skill extraction | LLM prompt only | spaCy NER + vocab + LLM |
| Matching | String comparison | Sentence embeddings cosine sim |
| Gap scoring | Hardcoded thresholds | Feature-engineered (level + freq + embedding) |
| Learning path order | LLM decides | Topological sort + priority scoring |
| Resume score | None | 0–100 with 4-dimension breakdown |
| Database | users.json flat file | MongoDB Atlas (Motor async) |
| Auth | Basic JWT | bcrypt + JWT + interceptors |
| AI reliability | Single provider | Groq → Claude fallback + retry |
| UI | Emoji-heavy tabs | Professional sidebar + cards |
| State | useState | TanStack Query + Axios |
| PDF export | None | WeasyPrint via /export endpoint |
| CI/CD | None | GitHub Actions → Vercel + Render |
| Docker | None | docker-compose.yml included |
# Skill-Gap

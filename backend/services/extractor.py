import json, re
from services.ai_client import chat

def extract_skills_from_resume(resume_text: str) -> dict:
    prompt = f"""You are an expert HR analyst. Extract skills from this resume and return ONLY valid JSON (no markdown).

Resume:
{resume_text}

Return:
{{
  "candidate_name": "...",
  "skills": [
    {{"name": "Python", "level": "intermediate", "category": "Programming", "confidence": 78, "evidence": "2 years of Python projects"}}
  ],
  "overall_experience_years": 2
}}

Levels: beginner/intermediate/advanced
Confidence: 0-100 based on keyword frequency, context, experience duration
Categories: Programming, Frontend, Backend, Cloud, Database, DevOps, AI/ML, Soft Skills, Domain Knowledge"""

    raw = re.sub(r"```json|```", "", chat(prompt)).strip()
    return json.loads(raw)


def extract_skills_from_jd(jd_text: str) -> dict:
    prompt = f"""You are an expert HR analyst. Extract required skills from this job description and return ONLY valid JSON (no markdown).

JD:
{jd_text}

Return:
{{
  "job_title": "...",
  "required_skills": [
    {{"name": "Python", "level": "advanced", "category": "Programming", "mention_count": 3}}
  ],
  "experience_required_years": 3
}}

mention_count = how many times that skill appears in JD"""

    raw = re.sub(r"```json|```", "", chat(prompt)).strip()
    return json.loads(raw)
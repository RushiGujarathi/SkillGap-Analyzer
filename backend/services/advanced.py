import json, re
from services.ai_client import chat

def generate_reasoning_trace(candidate_skills, required_skills, skill_gaps, jd_text):
    prompt = f"""Explainable AI: generate reasoning trace for each skill gap.
Skill gaps: {json.dumps(skill_gaps[:6])}
JD snippet: {jd_text[:600]}
Return ONLY valid JSON array:
[{{"skill":"Python","found_in_resume":false,"jd_mentions":5,"confidence":95,
"reasoning":"Python is mentioned 5 times in JD as core requirement. Not found in resume. Critical gap."}}]"""
    try:
        return json.loads(re.sub(r"```json|```", "", chat(prompt)).strip())
    except:
        return []

def generate_interview_questions(skill_gaps, job_title):
    if not skill_gaps:
        return []
    top = [g["skill"] for g in skill_gaps[:5]]
    prompt = f"""Generate 8 mock interview questions for {job_title} focusing on: {top}
Return ONLY valid JSON array:
[{{"skill":"Python","question":"Explain list comprehensions vs for loops.",
"difficulty":"intermediate","tip":"Focus on performance and readability."}}]"""
    try:
        return json.loads(re.sub(r"```json|```", "", chat(prompt)).strip())
    except:
        return []

def generate_resume_suggestions(resume_text, required_skills):
    req = [s["name"] for s in required_skills[:10]]
    prompt = f"""Resume expert: analyze and suggest improvements.
Required skills: {req}
Resume: {resume_text[:800]}
Return ONLY valid JSON:
{{"missing_keywords":["Docker"],"phrasing_improvements":[{{"original":"Worked with Python","improved":"Built Python microservices handling 10k+ requests/day"}}],"structure_tips":["Add Skills section at top"]}}"""
    try:
        return json.loads(re.sub(r"```json|```", "", chat(prompt)).strip())
    except:
        return {"missing_keywords": [], "phrasing_improvements": [], "structure_tips": []}

def simulate_career_path(learner_level, job_title, roadmap):
    weeks = sum(int(m.get("duration", "2 weeks").split()[0]) for m in roadmap) if roadmap else 12
    prompt = f"""Career simulation: Level={learner_level}, Target={job_title}, Time={weeks} weeks.
Return ONLY valid JSON:
{{"predicted_role":"Junior Developer","time_to_achieve":"{weeks} weeks","salary_range":"$60k-$80k/yr",
"next_roles":["Mid-level","Senior","Tech Lead"],
"milestones":[{{"week":4,"achievement":"Complete basics","unlock":"Intern-ready"}}],
"success_probability":82}}"""
    try:
        return json.loads(re.sub(r"```json|```", "", chat(prompt)).strip())
    except:
        return {}

def generate_mentor_response(question: str, user_profile: dict) -> str:
    prompt = f"""AI career mentor. User is learning to become {user_profile.get('job_title', 'developer')}.
Level: {user_profile.get('learner_level', 'Beginner')}. Gaps: {user_profile.get('skill_gaps', [])}
Question: "{question}"
Give concise, personalized, encouraging answer in max 150 words."""
    try:
        return chat(prompt, max_tokens=300)
    except Exception as e:
        return f"Sorry, I couldn't process that. ({str(e)})"
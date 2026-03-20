from __future__ import annotations
import json, re
from services.ai_client import chat

COURSE_DB = {
    "Python": [
        {"title": "Python for Everybody", "url": "https://www.coursera.org/specializations/python", "type": "course", "level": "beginner"},
        {"title": "Real Python Tutorials", "url": "https://realpython.com", "type": "article", "level": "intermediate"},
    ],
    "Machine Learning": [
        {"title": "ML by Andrew Ng", "url": "https://www.coursera.org/learn/machine-learning", "type": "course", "level": "beginner"},
        {"title": "fast.ai Practical Deep Learning", "url": "https://course.fast.ai", "type": "course", "level": "intermediate"},
    ],
    "React": [
        {"title": "React Official Docs", "url": "https://react.dev/learn", "type": "article", "level": "beginner"},
        {"title": "Full Stack Open", "url": "https://fullstackopen.com", "type": "course", "level": "intermediate"},
    ],
    "Docker": [
        {"title": "Docker Getting Started", "url": "https://docs.docker.com/get-started/", "type": "article", "level": "beginner"},
    ],
    "AWS": [
        {"title": "AWS Cloud Practitioner Essentials", "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", "type": "course", "level": "beginner"},
    ],
    "SQL": [
        {"title": "SQLZoo", "url": "https://sqlzoo.net", "type": "article", "level": "beginner"},
    ],
    "JavaScript": [
        {"title": "javascript.info", "url": "https://javascript.info", "type": "article", "level": "beginner"},
    ],
    "FastAPI": [
        {"title": "FastAPI Official Docs", "url": "https://fastapi.tiangolo.com", "type": "article", "level": "beginner"},
    ],
    "Kubernetes": [
        {"title": "Kubernetes Official Tutorial", "url": "https://kubernetes.io/docs/tutorials/", "type": "article", "level": "intermediate"},
    ],
}


def get_course_for_skill(skill_name: str, learner_level: str):
    courses = COURSE_DB.get(skill_name, [])
    target = "beginner" if learner_level == "Beginner" else "intermediate"
    for c in courses:
        if c["level"] == target:
            return c
    return courses[0] if courses else None


def generate_roadmap(skill_gaps: list, learner_level: str, job_title: str) -> list:
    if not skill_gaps:
        return []

    gaps_summary = json.dumps(skill_gaps[:8], indent=2)
    prompt = f"""You are an expert learning path designer.
Candidate level: {learner_level}. Job: {job_title}.
Skill gaps: {gaps_summary}

Generate adaptive weekly learning roadmap. Return ONLY valid JSON array (no markdown).
Rules: Beginner=fundamentals first; Intermediate=skip basics, project-based; Advanced=architecture+best practices.
Max 8 modules. Each must have a "reason" (Explainable AI - why this skill was prioritized).

JSON format:
[{{"title":"...","description":"...","duration":"2 weeks","priority":1,"skill_addressed":"Python",
"resource_type":"course","resource_url":"https://...","reason":"Python has 100% gap, mentioned 5x in JD.",
"week_plan":{{"week1":"Theory","week2":"Practice","week3":"Project"}},"completed":false}}]"""

    raw = re.sub(r"```json|```", "", chat(prompt, max_tokens=3000)).strip()
    modules = json.loads(raw)

    for m in modules:
        skill = m.get("skill_addressed", "")
        course = get_course_for_skill(skill, learner_level)
        if course:
            m["resource_url"] = course["url"]
            m["resource_type"] = course["type"]
        m["completed"] = False

    return modules
from __future__ import annotations

LEVEL_MAP = {"beginner": 1, "intermediate": 2, "advanced": 3}

SKILL_GRAPH = {
    "Machine Learning": ["Python", "Statistics", "Linear Algebra"],
    "Deep Learning": ["Machine Learning", "Python", "TensorFlow"],
    "TensorFlow": ["Python"],
    "React": ["JavaScript", "HTML/CSS"],
    "Next.js": ["React", "JavaScript"],
    "FastAPI": ["Python"],
    "Docker": ["Linux Basics"],
    "Kubernetes": ["Docker"],
    "AWS": ["Linux Basics", "Networking Basics"],
    "Data Structures": ["Python"],
    "Algorithms": ["Data Structures"],
    "System Design": ["Databases", "Networking Basics"],
    "GraphQL": ["REST APIs", "JavaScript"],
    "PostgreSQL": ["SQL Basics"],
    "MongoDB": ["NoSQL Concepts"],
}


def get_prerequisites(skill_name: str) -> list:
    return SKILL_GRAPH.get(skill_name, [])


def compute_gap_score(required_level: str, candidate_level) -> float:
    req = LEVEL_MAP.get(required_level.lower(), 2)
    if candidate_level is None:
        return 100.0
    cand = LEVEL_MAP.get(candidate_level.lower(), 0)
    diff = req - cand
    return round(max(0.0, (diff / req) * 100), 1)


def analyze_gaps(candidate_skills: list, required_skills: list) -> dict:
    candidate_map = {s["name"].lower(): s for s in candidate_skills}
    gaps = []
    total_time_days = 0

    for req_skill in required_skills:
        name_lower = req_skill["name"].lower()
        match = candidate_map.get(name_lower)
        candidate_level = match["level"] if match else None
        gap_score = compute_gap_score(req_skill["level"], candidate_level)

        if gap_score > 0:
            prereqs = get_prerequisites(req_skill["name"])
            missing_prereqs = [p for p in prereqs if p.lower() not in candidate_map]

            if gap_score == 100:
                days = 14
            elif gap_score > 60:
                days = 10
            elif gap_score > 30:
                days = 5
            else:
                days = 2

            total_time_days += days

            gaps.append({
                "skill": req_skill["name"],
                "category": req_skill.get("category", "General"),
                "required_level": req_skill["level"],
                "candidate_level": candidate_level,
                "gap_score": gap_score,
                "mention_count": req_skill.get("mention_count", 1),
                "prerequisites": prereqs,
                "missing_prerequisites": missing_prereqs,
                "estimated_days": days,
            })

    gaps.sort(key=lambda x: x["gap_score"], reverse=True)

    total = len(required_skills)
    overall = round(sum(g["gap_score"] for g in gaps) / total, 1) if total else 0.0

    if overall > 60:
        learner_level = "Beginner"
    elif overall > 30:
        learner_level = "Intermediate"
    else:
        learner_level = "Advanced"

    return {
        "skill_gaps": gaps,
        "overall_gap_score": overall,
        "learner_level": learner_level,
        "time_estimate": {
            "total_days": total_time_days,
            "daily_hours": 2,
            "total_weeks": round(total_time_days / 7, 1),
        }
    }
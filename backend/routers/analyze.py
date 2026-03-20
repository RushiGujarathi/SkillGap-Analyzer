from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.extractor import extract_skills_from_resume, extract_skills_from_jd
from services.gap_analyzer import analyze_gaps
from services.roadmap import generate_roadmap
from services.advanced import (
    generate_reasoning_trace,
    generate_interview_questions,
    generate_resume_suggestions,
    simulate_career_path,
    generate_mentor_response,
)

router = APIRouter()


class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str


class MentorRequest(BaseModel):
    question: str
    user_profile: dict


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    try:
        resume_data = extract_skills_from_resume(req.resume_text)
        jd_data = extract_skills_from_jd(req.jd_text)

        candidate_skills = resume_data.get("skills", [])
        required_skills = jd_data.get("required_skills", [])
        job_title = jd_data.get("job_title", "Software Engineer")

        gap_result = analyze_gaps(candidate_skills, required_skills)
        roadmap = generate_roadmap(gap_result["skill_gaps"], gap_result["learner_level"], job_title)

        reasoning_trace = generate_reasoning_trace(
            candidate_skills, required_skills, gap_result["skill_gaps"], req.jd_text
        )
        interview_qs = generate_interview_questions(gap_result["skill_gaps"], job_title)
        resume_suggestions = generate_resume_suggestions(req.resume_text, required_skills)
        career_sim = simulate_career_path(gap_result["learner_level"], job_title, roadmap)

        return {
            "candidate_name": resume_data.get("candidate_name", "Candidate"),
            "job_title": job_title,
            "overall_gap_score": gap_result["overall_gap_score"],
            "learner_level": gap_result["learner_level"],
            "candidate_skills": candidate_skills,
            "required_skills": required_skills,
            "skill_gaps": gap_result["skill_gaps"],
            "learning_roadmap": roadmap,
            "reasoning_trace": reasoning_trace,
            "interview_questions": interview_qs,
            "resume_suggestions": resume_suggestions,
            "career_simulation": career_sim,
            "time_estimate": gap_result.get("time_estimate"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mentor")
async def mentor(req: MentorRequest):
    try:
        reply = generate_mentor_response(req.question, req.user_profile)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

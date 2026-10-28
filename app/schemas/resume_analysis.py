
from pydantic import BaseModel, Field


class ResumeAnalysisRequest(BaseModel):
    job_description: str = Field(
        min_length=50,
        max_length=20000,
        description="Full job description pasted by the user.",
    )


class SkillGap(BaseModel):
    skill: str
    importance: str
    status: str
    explanation: str





class ResumeRecommendation(BaseModel):
    category: str
    title: str
    issue: str
    explanation: str
    suggested_change: str
    proposed_text: str | None = None
    priority: str
    supporting_evidence: list[str] = Field(default_factory=list)


class ResumeAnalysisResponse(BaseModel):
    resume_id: int

    # Job-specific fit
    match_score: float = Field(ge=0, le=100)
    matched_skills: list[str]
    missing_skills: list[str]
    skill_gaps: list[SkillGap]

    # General resume quality
    overall_resume_score: float = Field(ge=0, le=100)

    # ATS assessment
    ats_score: float = Field(ge=0, le=100)
    ats_friendly: bool
    ats_issues: list[str]

    # Actionable improvements
    jd_recommendations: list[ResumeRecommendation]
    ats_recommendations: list[ResumeRecommendation]

    analysis_summary: str

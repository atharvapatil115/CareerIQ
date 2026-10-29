
from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.models.resume_chunk import ResumeChunk
from app.models.job_analysis import JobAnalysis

from app.services.ai.semantic_search import search_resume_chunks
from app.services.ai.resume_analyzer import analyze_resume_against_job
from app.services.ai.resume_scoring import build_resume_scores


def analyze_resume(
    db: Session,
    resume_id: int,
    job_description: str,
) -> dict:
    """Analyze a resume against a pasted job description and save results."""

    if not job_description or not job_description.strip():
        raise ValueError("Job description cannot be empty.")

    job_description = job_description.strip()

    # 1. Find the resume.
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id)
        .first()
    )

    if resume is None:
        raise ValueError("Resume not found.")

    # 2. Confirm that the resume has stored embeddings.
    embedded_chunk_count = (
        db.query(ResumeChunk)
        .filter(
            ResumeChunk.resume_id == resume_id,
            ResumeChunk.embedding.is_not(None),
        )
        .count()
    )

    if embedded_chunk_count == 0:
        raise ValueError(
            "No embedded resume chunks found. Upload and process the resume first."
        )

    # 3. Retrieve relevant resume evidence.
    results = search_resume_chunks(
        db=db,
        resume_id=resume_id,
        query=job_description,
        limit=10,
    )

    if not results:
        raise ValueError("No relevant resume content was found.")

    resume_chunks = [result["text"] for result in results]

    # 4. Generate AI analysis and calculate scores.
    analysis = analyze_resume_against_job(
        job_description=job_description,
        resume_chunks=resume_chunks,
    )

    scores = build_resume_scores(analysis)

    # 5. Save the assessment WITHOUT creating a Job record.
    try:
        recommendations = [
            {"recommendation_type": "job_description", **item}
            for item in analysis.get("jd_recommendations", [])
        ] + [
            {"recommendation_type": "ats", **item}
            for item in analysis.get("ats_recommendations", [])
        ]

        saved_analysis = JobAnalysis(
            resume_id=resume.id,
            job_id=None,
            job_description=job_description,
            match_score=scores["match_score"],
            overall_resume_score=scores["overall_resume_score"],
            ats_score=scores["ats_score"],
            ats_friendly=scores["ats_friendly"],
            matched_skills=analysis.get("matched_skills", []),
            missing_skills=analysis.get("missing_skills", []),
            skill_gaps=analysis.get("skill_gaps", []),
            recommendations=recommendations,
            ats_issues=analysis.get("ats_issues", []),
            analysis_summary=analysis.get("analysis_summary"),
        )

        db.add(saved_analysis)
        db.commit()
        db.refresh(saved_analysis)

    except Exception:
        db.rollback()
        raise

    # 6. Return the saved assessment.
    return {
        "analysis_id": saved_analysis.id,
        "job_id": None,
        "resume_id": resume.id,
        "job_description": job_description,
        **scores,
        **analysis,
    }

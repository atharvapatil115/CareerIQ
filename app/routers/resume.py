
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.users import Users
from app.models.resume import Resume
from app.models.resume_chunk import ResumeChunk

from app.services.ai.pdf_extractor import extract_text_from_pdf
from app.services.ai.text_cleaner import clean_resume_text
from app.services.ai.chunker import chunk_resume_text
from app.services.ai.embeddings import generate_embeddings
from app.schemas.job_description import JobDescriptionRequest
from app.services.ai.resume_analysis_service import analyze_resume
from mistralai.client.errors import SDKError
from app.models.job_analysis import JobAnalysis
from app.models.job import Job
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resumes", tags=["Resumes"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    try:
        pdf_bytes = await file.read(MAX_FILE_SIZE + 1)

        if len(pdf_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Resume PDF must not exceed 10 MB.",
            )

        if not pdf_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid PDF.",
            )

        # 1. Extract, clean, and chunk the resume.
        extracted_text = extract_text_from_pdf(pdf_bytes)
        cleaned_text = clean_resume_text(extracted_text)
        chunks = chunk_resume_text(cleaned_text)

        if not chunks:
            raise HTTPException(
                status_code=422,
                detail="No usable text could be extracted from this PDF.",
            )

        # 2. Generate an embedding for every chunk.
        embeddings = generate_embeddings(chunks)

        # 3. Create the resume record.
        resume = Resume(
            user_id=current_user.user_id,
            original_filename=file.filename,
            status="embedded",
        )

        db.add(resume)
        db.flush()

        # 4. Save each chunk with its corresponding embedding.
        chunk_records = [
            ResumeChunk(
                resume_id=resume.id,
                chunk_index=index,
                chunk_text=chunk,
                embedding=embedding,
            )
            for index, (chunk, embedding)
            in enumerate(zip(chunks, embeddings))
        ]

        db.add_all(chunk_records)
        db.commit()
        db.refresh(resume)

        return {
            "message": "Resume uploaded and embedded successfully.",
            "resume_id": resume.id,
            "filename": resume.original_filename,
            "status": resume.status,
            "chunk_count": len(chunks),
            "embedding_dimensions": len(embeddings[0]),
        }

    except HTTPException:
        db.rollback()
        raise

    except ValueError as exc:
        db.rollback()
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception:
        db.rollback()
        logger.exception("Resume processing failed")
        raise HTTPException(
            status_code=500,
            detail="Resume processing failed. Check backend logs.",
        )

    finally:
        await file.close()


@router.post("/{resume_id}/analyze")
def analyze_resume_endpoint(
    resume_id: int,
    request: JobDescriptionRequest,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    # Only allow users to analyze their own resumes.
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.user_id,
        )
        .first()
    )

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )

    try:
        return analyze_resume(
            db=db,
            resume_id=resume.id,
            job_description=request.job_description,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    
    except SDKError as exc:
        logger.exception("Mistral API request failed")

        status_code = getattr(exc, "status_code", None)

        if status_code == 429:
            raise HTTPException(
                status_code=429,
                detail=(
                    "Mistral API rate limit reached. "
                    "Please wait before retrying."
                ),
                headers={"Retry-After": "30"},
            ) from exc

        raise HTTPException(
            status_code=502,
            detail="The AI provider request failed.",
        ) from exc

    except Exception as exc:
        logger.exception("Resume job analysis failed")
        raise HTTPException(
            status_code=500,
            detail="Resume analysis failed. Check backend logs.",
        ) from exc

@router.get("/analyses/{analysis_id}")
def get_saved_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    """Retrieve a saved analysis belonging to the logged-in user."""

    saved_analysis = (
        db.query(JobAnalysis)
        .join(
            Resume,
            JobAnalysis.resume_id == Resume.id,
        )
        .filter(
            JobAnalysis.id == analysis_id,
            Resume.user_id == current_user.user_id,
        )
        .first()
    )

    if saved_analysis is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found.",
        )

    return {
        "analysis_id": saved_analysis.id,
        "job_id": saved_analysis.job_id,
        "resume_id": saved_analysis.resume_id,
        "job_description": saved_analysis.job_description,
        "match_score": saved_analysis.match_score,
        "overall_resume_score": saved_analysis.overall_resume_score,
        "ats_score": saved_analysis.ats_score,
        "ats_friendly": saved_analysis.ats_friendly,
        "matched_skills": saved_analysis.matched_skills,
        "missing_skills": saved_analysis.missing_skills,
        "skill_gaps": saved_analysis.skill_gaps,
        "recommendations": saved_analysis.recommendations,
        "ats_issues": saved_analysis.ats_issues,
        "analysis_summary": saved_analysis.analysis_summary,
        "created_at": saved_analysis.created_at,
        "updated_at": saved_analysis.updated_at,
    }

@router.get("/analyses")
def get_analysis_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    """List the logged-in user's saved resume analyses."""

    # Prevent invalid pagination values.
    if skip < 0:
        raise HTTPException(
            status_code=400,
            detail="skip cannot be negative.",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="limit must be between 1 and 100.",
        )

    results = (
        db.query(JobAnalysis, Job)
        .join(
            Resume,
            JobAnalysis.resume_id == Resume.id,
        )
        .join(
            Job,
            JobAnalysis.job_id == Job.id,
        )
        .filter(Resume.user_id == current_user.user_id)
        .order_by(JobAnalysis.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    total = (
        db.query(JobAnalysis)
        .join(
            Resume,
            JobAnalysis.resume_id == Resume.id,
        )
        .filter(Resume.user_id == current_user.user_id)
        .count()
    )

    items = []

    for saved_analysis, job in results:
        items.append({
            "analysis_id": saved_analysis.id,
            "resume_id": saved_analysis.resume_id,
            "job_id": saved_analysis.job_id,
            "job_role": job.job_role,
            "company": job.company,
            "match_score": saved_analysis.match_score,
            "overall_resume_score": saved_analysis.overall_resume_score,
            "ats_score": saved_analysis.ats_score,
            "ats_friendly": saved_analysis.ats_friendly,
            "created_at": saved_analysis.created_at,
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items,
    }

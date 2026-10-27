
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
        # Read at most 10 MB + 1 byte to enforce the limit.
        pdf_bytes = await file.read(MAX_FILE_SIZE + 1)

        if len(pdf_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Resume PDF must not exceed 10 MB.",
            )

        # Basic PDF signature validation.
        if not pdf_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid PDF.",
            )

        # Extract, clean, and chunk the resume.
        extracted_text = extract_text_from_pdf(pdf_bytes)
        cleaned_text = clean_resume_text(extracted_text)
        chunks = chunk_resume_text(cleaned_text)

        if not chunks:
            raise HTTPException(
                status_code=422,
                detail="No usable text could be extracted from this PDF.",
            )

        # Create the resume record first to obtain its ID.
        resume = Resume(
            user_id=current_user.user_id,
            original_filename=file.filename,
            status="text_extracted",
        )

        db.add(resume)
        db.flush()

        # Save the chunks. Embeddings will be generated in the next step.
        chunk_records = [
            ResumeChunk(
                resume_id=resume.id,
                chunk_index=index,
                chunk_text=chunk,
                embedding=None,
            )
            for index, chunk in enumerate(chunks)
        ]

        db.add_all(chunk_records)
        db.commit()
        db.refresh(resume)

        return {
            "message": "Resume uploaded and processed successfully.",
            "resume_id": resume.id,
            "filename": resume.original_filename,
            "status": resume.status,
            "chunk_count": len(chunks),
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

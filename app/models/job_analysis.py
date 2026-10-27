
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Integer,
    Text,
    DateTime,
    Numeric,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    Index,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class JobAnalysis(Base):
    __tablename__ = "job_analyses"

    __table_args__ = (
        UniqueConstraint(
            "resume_id",
            "job_id",
            name="uq_job_analysis_resume_job",
        ),
        CheckConstraint(
            "match_score IS NULL OR "
            "(match_score >= 0 AND match_score <= 100)",
            name="chk_job_analysis_match_score",
        ),
        Index("idx_job_analyses_resume_id", "resume_id"),
        Index("idx_job_analyses_job_id", "job_id"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
    )

    match_score: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    matched_skills: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="[]",
    )

    missing_skills: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="[]",
    )

    skill_gaps: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="[]",
    )

    recommendations: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="[]",
    )

    analysis_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

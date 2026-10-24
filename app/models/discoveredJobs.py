from datetime import datetime,date
from sqlalchemy import Date,DateTime,Integer,String,Text,UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class Discoveredjobs(Base):
    __tablename__ = "discovered_jobs"

    __table_args__ = (
        UniqueConstraint("source",
            "external_id",
            name="uq_discovered_jobs_source_external_id",),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    company: Mapped[str] = mapped_column(String(150), nullable=False)
    location: Mapped[str | None] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    employment_type: Mapped[str | None] = mapped_column(String(50))
    experience_level: Mapped[str | None] = mapped_column(String(100))

    # Source information
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    external_id: Mapped[str] = mapped_column(String(200), nullable=False)
    application_url: Mapped[str] = mapped_column(Text, nullable=False)

    # Dates
    posted_at: Mapped[date | None] = mapped_column(Date)
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now().astimezone(),
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now().astimezone(),
        onupdate=lambda: datetime.now().astimezone(),
    )

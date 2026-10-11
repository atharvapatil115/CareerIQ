# This represents the database
from sqlalchemy.orm import Mapped,relationship, mapped_column
from sqlalchemy import Date, String, Integer,ForeignKey
from app.models.base import Base


class Job(Base):
    __tablename__ = "jobs"  

    id           : Mapped[int]         = mapped_column(primary_key=True)
    company      : Mapped[str]         = mapped_column(String(100),nullable=False)
    job_role     : Mapped[str]         = mapped_column(String(100),nullable=False)
    location     : Mapped[str]         = mapped_column(String(100),nullable=False)
    salary       : Mapped[int | None]  = mapped_column(Integer)
    status       : Mapped[str]         = mapped_column(String(50),nullable=False)
    date_applied : Mapped[Date | None] = mapped_column(Date)
    notes        : Mapped[str | None]  = mapped_column()
    user_id      : Mapped[int]         = mapped_column(ForeignKey("users.user_id",ondelete="CASCADE"),nullable=False)
    user         : Mapped["Users"]         = relationship("Users",back_populates="jobs")


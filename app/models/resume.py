from sqlalchemy.orm import Mapped,mapped_column,relationship
from sqlalchemy import String,Integer,ForeignKey,DateTime,func
from app.models.base import Base

class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(primary_key = True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id",ondelete = "CASCADE"),
        nullable = False,
        index = True
    )
    original_filename : Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    storage_key: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="uploaded"
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user: Mapped["Users"] = relationship("Users")
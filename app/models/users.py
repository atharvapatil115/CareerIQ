from sqlalchemy.orm import DeclarativeBase,Mapped,relationship, mapped_column
from sqlalchemy import Date,String,Integer
from app.models.base import Base



class Users(Base):
    __tablename__ = "users"

    user_id        : Mapped[int]     = mapped_column(primary_key=True)
    name           : Mapped[str]     = mapped_column(String(100),nullable=False)
    email          : Mapped[str]     = mapped_column(String(150),nullable=False,unique=True,index=True)
    password_hash  : Mapped[str]     = mapped_column(String(255),nullable=False)
    jobs           : Mapped[list["Job"]]  = relationship("Job",back_populates="user",cascade="all, delete-orphan")
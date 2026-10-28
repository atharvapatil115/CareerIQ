
from pydantic import BaseModel, Field


class JobDescriptionRequest(BaseModel):
    job_description: str = Field(
        min_length=50,
        max_length=20000,
    )

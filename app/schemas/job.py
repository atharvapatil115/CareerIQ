from datetime import date
from pydantic import BaseModel
from app.enums.job import JobStatus


class JobCreate(BaseModel):
    company       : str 
    job_role      : str
    location      : str
    salary        : int  | None = None
    status        : JobStatus 
    date_applied  : date | None = None
    notes         : str  | None = None
    

class JobResponse(BaseModel):
    id            : int
    company       : str 
    job_role      : str
    location      : str
    salary        : int  | None = None
    status        : str 
    date_applied  : date | None = None
    notes         : str  | None = None
    user_id       : int 

    model_config =  {
        "from_attributes" : True
    }

class JobUpdate(BaseModel):
    #Here everything is optional because we wont update everything at once
    company      : str        |    None = None
    job_role     : str        |    None = None
    location     : str        |    None = None
    salary       : int        |    None = None 
    status       : JobStatus  |    None = None
    date_applied : date       |    None = None
    notes        : str        |    None = None
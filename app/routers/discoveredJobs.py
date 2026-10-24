
from fastapi import APIRouter,Depends
from app.models.discoveredJobs import Discoveredjobs
from app.database import get_db 
from sqlalchemy.orm import Session


router = APIRouter(
    prefix="/discovered-jobs",
    tags=["Discovered Jobs"]
)


@router.get("/",)
def get_discovered_jobs(db:Session = Depends(get_db)):
    jobs = db.query(Discoveredjobs).all()
    return jobs


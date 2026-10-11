from fastapi import FastAPI,Depends,APIRouter,HTTPException,status
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.job import Job   # Imported the ORM Model from models
from app.schemas.job import JobCreate,JobResponse,JobUpdate
from app.models.users import Users
from app.schemas.users import UsersResponse
from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix= "/jobs",
    tags=["Jobs"]
)



@router.get("/", response_model=list[JobResponse])
def get_jobs(db:Session = Depends(get_db),
             status : str  |  None = None,
             company : str  | None = None,
             location : str  | None = None,
             sort : str | None = None,
             order: str | None = None,
             limit: int   | None = None,
             offset :  int | None = None,
             current_user : Users = Depends(get_current_user)
            ):     #Function to retrive the job from the database (Connection and performing operation on the database)
    sort_columns = {"salary" : Job.salary,
                    "company": Job.company,
                    "date_applied": Job.date_applied
                    }
    column  = sort_columns.get(sort)
    query = db.query(Job).filter(Job.user_id == current_user.user_id)

    if status: 
        query = query.filter(Job.status == status)
    if company: 
        query = query.filter(Job.company == company)
    if location: 
        query = query.filter(Job.location == location)

    
    if column:
        if order == "asc":
            query = query.order_by(column.asc())
        else:
            query = query.order_by(column.desc())

    if limit:
        query = query.limit(limit)
    if offset:
        query= query.offset(offset)

    return query.all() 



@router.post("/",response_model=JobResponse)
def create_jobs(job : JobCreate, db : Session = Depends(get_db),
                current_user : Users = Depends(get_current_user)):
   
    new_job = Job(
        company        = job.company,
        job_role       = job.job_role,
        location       = job.location,
        salary         = job.salary,
        status         = job.status,
        date_applied   = job.date_applied,
        notes          = job.notes,
        user_id        = current_user.user_id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job

@router.put("/{job_id}",response_model=JobResponse)
def update_job(
    job_id : int,
    job: JobUpdate,
    current_user : Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_job = db.query(Job).filter(Job.id == job_id).first()


    if existing_job is None:
        raise HTTPException(
            status_code= 404,
            detail="Job Not Found!"
        )
    if existing_job.user_id   != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You Cannot Edit this Job"
        )
    update_data = job.model_dump(exclude_unset=True)


    for field,value in update_data.items():
        setattr(existing_job,field,value)

    db.commit()
    db.refresh(existing_job)
    return existing_job

@router.delete("/{job_id}")
def delete_job(
        job_id : int,
        current_user : Users = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    existing_job = db.query(Job).filter(Job.id == job_id).first()

    if existing_job is None:
        raise HTTPException(
            status_code =404,
            detail = "Job Not Found"
        )
    if existing_job.user_id   != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You Cannot Delete this Job"
            )
    db.delete(existing_job)
    db.commit()
    return {"Message":"Job deleted successfully"}

@router.get("/{job_id}/user",response_model=UsersResponse)
def get_job_owner(job_id : int, db:Session = Depends(get_db)):
    existing_job = db.query(Job).filter(job_id == Job.id).first()
    if existing_job is None:
        raise HTTPException(
            status_code=404,
            detail=f"Job with job id {job_id} does not exist!"
        )
    return existing_job.user
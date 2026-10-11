from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.users import Users
from sqlalchemy import func,case
from app.models.job import Job
from app.enums.job import JobStatus
from app.schemas.dashboard import DashboardStats,TopCompany,ApplicationTrend    
router = APIRouter(
    prefix="/dashboard",
    tags = ["Dashboard"]
)

@router.get("/stats",response_model=DashboardStats)
def  get_dashboard_stats(
    db : Session = Depends(get_db),
    current_user : Users=Depends(get_current_user)
):
    total_appplications = (db.query(func.count(Job.id)).filter(Job.user_id == current_user.user_id).scalar())

    funnel = (
        db.query
        (
            func.count(Job.id).label("total_applications"),

            func.count
            (
                case((Job.status.in_([JobStatus.INTERVIEW,
                                      JobStatus.OFFER,
                                      JobStatus.ACCEPTED]),1))
            ).label("interviews"),

            func.count
            (
                case((Job.status.in_([JobStatus.OFFER,
                                      JobStatus.ACCEPTED]),1))
            ).label("offers"),

            func.count
            (
                case((Job.status.in_([JobStatus.ACCEPTED]),1))
            ).label("accepted")
        )
        .filter(Job.user_id == current_user.user_id)
        .first()
    )

    return {
        "total_applications": funnel.total_applications,
        "interviews": funnel.interviews,
        "offers": funnel.offers,
        "accepted": funnel.accepted    
        }

@router.get("/applications-over-time",response_model=list[ApplicationTrend])
def get_applications_over_time(
    current_user: Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    month = func.date_trunc("month", Job.date_applied)

    applications = (
        db.query(
            month.label("month"),
            func.count(Job.id).label("applications")
        )
        .filter(
            Job.user_id == current_user.user_id,
            Job.date_applied.isnot(None)
        )
        .group_by(month)
        .order_by(month)
        .all()
    )

    return [
        {
            "month": row.month.strftime("%Y-%m"),
            "applications": row.applications
        }
        for row in applications
    ]

@router.get("/top-companies",response_model=list[TopCompany])
def get_top_companies(
    current_user : Users = Depends(get_current_user),
    db : Session = Depends(get_db)
):
    companies = (
        db.query(
            Job.company.label("companies"),
            func.count(Job.id).label("applications")
        )
        .filter(Job.user_id == current_user.user_id)
        .group_by(Job.company)
        .order_by(func.count(Job.id).desc())
        .limit(5)
        .all()
    )
    return [{
        "company" : row.companies,
        "applications" : row.applications
    }
    for row in companies
    ]
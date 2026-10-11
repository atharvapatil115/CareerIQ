from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_applications: int
    interviews: int
    offers: int
    accepted: int


class FunnelResponse(BaseModel):
    applied: int
    interview: int
    offer: int
    accepted: int


class ApplicationTrend(BaseModel):
    month: str
    applications: int


class TopCompany(BaseModel):
    company: str
    applications: int
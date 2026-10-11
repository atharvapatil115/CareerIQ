from fastapi import FastAPI,Depends
from app.routers.job import router as jobs_router
from app.routers.users import router as users_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message" : "THis is job intillegance app"}

@app.get("/about")
def about():
    return {"Project" : "Job intellegence ",
            "Version" :  "0.1"}

app.include_router(jobs_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
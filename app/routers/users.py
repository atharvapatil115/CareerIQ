from fastapi import FastAPI,Depends,APIRouter,HTTPException,status
from app.database import get_db
from sqlalchemy.orm import Session 
from app.models.users import Users
from app.schemas.users import UsersCreate,UsersResponse,UserUpdate,UpdatePassword
from app.schemas.job import JobResponse
from app.auth.security import hash_password,verify_password
from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix= "/users",
    tags = ["Users"]
)

# @router.get("/",response_model=list[UsersResponse])
# def get_users(db:Session = Depends(get_db)):
#     users = db.query(Users).all()
#     return users 

@router.get("/me",response_model=UsersResponse)
def get_user(db : Session = Depends(get_db),
             current_user : Users  = Depends(get_current_user)):
    return current_user

@router.post("/",response_model=UsersResponse)
def add_users(users : UsersCreate,db: Session =  Depends(get_db)):
   
    duplicate_email = db.query(Users).filter(users.email == Users.email).first()
    if duplicate_email is not None:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail = "User already exists"
        )
    hashed_password = hash_password(users.password)
    new_user = Users(
            name          =    users.name,
            email         =    users.email,
            password_hash =    hashed_password
        )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/me",response_model=UsersResponse)
def update_users(
    user:UserUpdate,
    db:Session = Depends(get_db),
    existing_user :  Users = Depends(get_current_user)

):
    update_user = user.model_dump(exclude_unset=True)

    for field, value in update_user.items():
        setattr(existing_user,field,value)

    db.commit()
    db.refresh(existing_user)
    return existing_user

@router.delete("/me")
def delete_user(
    db :Session =  Depends(get_db),
    existing_user : Users = Depends(get_current_user)
):
    

    db.delete(existing_user)
    db.commit()
    return {"Messsage": f"Account Deleted Successfully"}

@router.get("/me/jobs",response_model=list[JobResponse])
def get_userJobs(db:Session = Depends(get_db),
                 current_user :  Users = Depends(get_current_user)):
    
    return current_user.jobs

@router.put("/me/update_password")
def Update_password(password_data: UpdatePassword,
                    current_user : Users = Depends(get_current_user),
                    db : Session= Depends(get_db)
                    ):
    password_matched = verify_password(password_data.old_password,current_user.password_hash)

    if not password_matched:
        raise HTTPException(
            status = status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Old Password"
        )
    
    current_user.password_hash = hash_password(password_data.new_password)        
    db.commit()
    db.refresh(current_user )
    return {"Message" : "Password Reset Successfull"}
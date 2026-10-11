from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import Users
from app.schemas.auth import LoginRequest, TokenResponse
from app.auth.security import verify_password,create_access_token
from fastapi.security import OAuth2PasswordRequestForm

# JWT Token  --- > Secret_key | Algorithm | Expriry date 

router = APIRouter(
    prefix="/auth",
    tags = ["Authentication"]
)   

@router.post("/login", response_model=TokenResponse)
def login(
    login_info : OAuth2PasswordRequestForm = Depends(),
    db : Session  = Depends(get_db)
):
    existing_user = db.query(Users).filter(Users.email == login_info.username).first()
    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password! "
        )
    matched_password = verify_password(
                                        login_info.password,
                                        existing_user.password_hash
                                       )
    if not matched_password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect Password entered"
        )
    access_token = create_access_token(
        existing_user.user_id
    )
    return {
        "access_token":access_token,
        "token_type":"bearer"
    }

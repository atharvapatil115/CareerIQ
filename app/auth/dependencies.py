from fastapi import Depends, HTTPException, status 
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError,jwt
from sqlalchemy.orm import session 

from app.config import settings
from app.database import get_db
from app.models.users import Users


oauth2_scheme  = OAuth2PasswordBearer(tokenUrl= "/auth/login")

def get_current_user(
        token =  Depends(oauth2_scheme),
        db : session = Depends(get_db)
):
    try:
        payload  = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")

        if user_id is None: 
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = int(user_id)
    except(JWTError,ValueError):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) 
    user  = db.query(Users).filter(Users.user_id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail = "User Not Found",
            headers={"WWW-Authenticate": "Bearer"},

        )
    return user 
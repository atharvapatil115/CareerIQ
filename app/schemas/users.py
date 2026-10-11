from pydantic import BaseModel,EmailStr,Field 

class UsersCreate(BaseModel):
    name           :    str 
    email          :    EmailStr  
    password       :    str = Field(min_length=8)

class UsersResponse(BaseModel):
     user_id       :    int 
     name          :    str
     email         :    str
     

     model_config = {

          "from_attributes" : True
     }
    
    
class UserUpdate(BaseModel):
     name          :    str     |    None = None
     email         :    str     |    None = None
     password      :    str     |    None = None

class UpdatePassword(BaseModel):
     old_password  :    str      
     new_password  :    str  = Field(min_length=8)      

     
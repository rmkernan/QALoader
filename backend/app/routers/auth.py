from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    token: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Placeholder implementation
    raise HTTPException(status_code=501, detail="Authentication not yet implemented")
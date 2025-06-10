"""
@file backend/app/routers/auth.py
@description Authentication endpoints for Q&A Loader. Handles login and JWT token management for secure API access.
@created 2025.06.09 3:26 PM ET
@updated 2025.06.09 5:35 PM ET - Resolved merge conflicts and restored Phase 3 implementation

@architectural-context
Layer: API Router (FastAPI endpoints)
Dependencies: FastAPI (routing), app.models.auth (request/response models), app.services.auth_service (JWT logic)
Pattern: RESTful API with JWT authentication and standardized error responses

@workflow-context
User Journey: User authentication and secure API access
Sequence Position: First endpoint called after application load for admin login
Inputs: Login credentials from frontend
Outputs: JWT tokens for authenticated API requests

@authentication-context
Auth Requirements: This router handles authentication - login endpoint is public, others may be protected
Security: Password validation, JWT token generation, rate limiting considerations for login attempts

@database-context
Tables: No direct database access - delegates to auth service
Operations: Authentication only, no database CRUD operations
Transactions: N/A - stateless authentication
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.auth import LoginRequest, LoginResponse
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    get_current_user_from_token,
)

router = APIRouter()
security = HTTPBearer()


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    @function login
    @description Authenticates user with username/password and returns JWT token for API access
    @param login_data: LoginRequest containing username and password
    @returns: LoginResponse with JWT token and user info
    @raises HTTPException: 401 if credentials are invalid
    @example:
        # POST /api/login
        # Body: {"username": "admin", "password": "password123"}
        # Response: {"access_token": "eyJ...", "token_type": "bearer", "username": "admin"}
    """
    user = authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user})
    
    # Log successful login
    try:
        from app.database import supabase
        from app.services.question_service import QuestionService
        from datetime import datetime
        
        question_service = QuestionService(supabase)
        await question_service.log_system_event('User Session', {
            'description': f'User login successful',
            'username': user,
            'timestamp': datetime.now().isoformat(),
            'ip_address': 'localhost'  # In production, get from request
        })
    except Exception as e:
        print(f"Failed to log login event: {e}")
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        username=user,
        expires_in=28800  # 8 hours in seconds
    )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    @function get_current_user
    @description FastAPI dependency to extract and validate current user from JWT token
    @param credentials: HTTP Bearer token from Authorization header
    @returns: Username of authenticated user
    @raises HTTPException: 401 if token is invalid or missing
    @example:
        # Use as FastAPI dependency
        @router.get("/protected")
        async def protected_route(current_user: str = Depends(get_current_user)):
            return {"message": f"Hello {current_user}"}
    """
    user = get_current_user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.get("/auth/verify")
async def verify_token(current_user: str = Depends(get_current_user)):
    """
    @function verify_token
    @description Verifies JWT token validity and returns current user information
    @param current_user: Username extracted from valid JWT token
    @returns: User information for valid tokens
    @example:
        # GET /api/auth/verify
        # Headers: Authorization: Bearer eyJ...
        # Response: {"username": "admin", "valid": true}
    """
    return {"username": current_user, "valid": True}
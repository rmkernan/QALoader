"""
@file backend/app/routers/auth.py
@description Authentication endpoints for Q&A Loader. Handles login and JWT token management for secure API access.
@created June 9, 2025 at unknown time
@updated June 16, 2025. 8:35 PM Eastern Time - Updated to support database authentication with username/email login

@architectural-context
Layer: API Router (FastAPI endpoints)
Dependencies: FastAPI (routing), app.models.auth (request/response models), app.services.auth_service (JWT logic)
Pattern: RESTful API with JWT authentication and standardized error responses

@workflow-context
User Journey: User authentication, secure API access, and password reset flow
Sequence Position: Auth endpoints called for login, token verification, and password reset operations
Inputs: Login credentials (username or email), reset requests, reset tokens from frontend
Outputs: JWT tokens with user info for authenticated API requests, password reset confirmations

@authentication-context
Auth Requirements: Mixed public/protected endpoints - login and reset are public, verify requires JWT
Security: Password validation against database, JWT token generation with user data, reset token validation
API Security: Reset endpoints designed to prevent email enumeration attacks, always return success responses

@database-context
Tables: No direct database access - delegates to auth service which queries users table
Operations: Authentication only, no direct database CRUD operations
Transactions: N/A - stateless authentication
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.auth import (
    LoginRequest, 
    LoginResponse, 
    PasswordResetRequest, 
    PasswordResetToken, 
    PasswordResetResponse
)
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    get_current_user_from_token,
    initiate_password_reset,
    reset_password,
    verify_reset_token,
)

router = APIRouter()
security = HTTPBearer()


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    @function login
    @description Authenticates user with username/email and password, returns JWT token for API access
    @param login_data: LoginRequest containing username (or email) and password
    @returns: LoginResponse with JWT token and user info
    @raises HTTPException: 401 if credentials are invalid
    @example:
        # POST /api/login with username
        # Body: {"username": "testuser1", "password": "12345678aA1"}
        # 
        # POST /api/login with email
        # Body: {"username": "testuser1@dev.com", "password": "12345678aA1"}
        # 
        # Response: {"access_token": "eyJ...", "token_type": "bearer", "username": "testuser1"}
    """
    # Authenticate user (accepts username or email)
    user = await authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create token with username and email
    access_token = create_access_token(data={
        "sub": user["username"],
        "email": user["email"],
        "user_id": str(user["id"]),
        "full_name": user.get("full_name", "")
    })
    
    # Log successful login
    try:
        from app.database import supabase
        from app.services.question_service import QuestionService
        from datetime import datetime
        
        if supabase:
            question_service = QuestionService(supabase)
            await question_service.log_system_event('User Session', {
                'description': f'User login successful',
                'username': user["username"],
                'email': user["email"],
                'is_test_user': user.get("is_test_user", False),
                'timestamp': datetime.now().isoformat(),
                'ip_address': 'localhost'  # In production, get from request
            })
    except Exception as e:
        print(f"Failed to log login event: {e}")
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        username=user["username"],
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


@router.post("/password-reset-request", response_model=PasswordResetResponse)
async def request_password_reset(request: PasswordResetRequest):
    """
    @function request_password_reset
    @description Initiates password reset process by sending reset email with secure token
    @param request: PasswordResetRequest containing email address
    @returns: PasswordResetResponse indicating success/failure
    @authentication: Public endpoint - no JWT required
    @example:
        # POST /api/password-reset-request
        # Body: {"email": "admin@qaloader.com"}
        # Response: {"message": "Password reset email sent", "success": true}
    
    @security-note:
    Always returns success message to prevent email enumeration attacks.
    Actual email sending and token storage handled in service layer.
    """
    try:
        success = await initiate_password_reset(request.email)
        
        # Always return success message for security (prevent email enumeration)
        return PasswordResetResponse(
            message="If the email address exists in our system, a password reset link has been sent.",
            success=True
        )
    except Exception as e:
        # Log error but don't expose to user
        print(f"Password reset request error: {e}")
        return PasswordResetResponse(
            message="If the email address exists in our system, a password reset link has been sent.",
            success=True
        )


@router.post("/password-reset-verify")
async def verify_password_reset_token(token: str):
    """
    @function verify_password_reset_token
    @description Verifies if password reset token is valid without consuming it
    @param token: Password reset token to verify
    @returns: Token validity status
    @authentication: Public endpoint - no JWT required
    @example:
        # POST /api/password-reset-verify
        # Body: {"token": "abc123def456"}
        # Response: {"valid": true, "email": "admin@qaloader.com"}
    """
    email = await verify_reset_token(token)
    
    if email:
        return {"valid": True, "email": email}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )


@router.post("/password-reset-complete", response_model=PasswordResetResponse)
async def complete_password_reset(reset_data: PasswordResetToken):
    """
    @function complete_password_reset
    @description Completes password reset process by updating password with valid token
    @param reset_data: PasswordResetToken containing token and new password
    @returns: PasswordResetResponse indicating success/failure
    @authentication: Public endpoint - no JWT required (uses reset token instead)
    @example:
        # POST /api/password-reset-complete
        # Body: {"token": "abc123def456", "new_password": "new_secure_password"}
        # Response: {"message": "Password updated successfully", "success": true}
    
    @security-note:
    Token is consumed (deleted) after successful password reset.
    All existing sessions should be invalidated for security.
    """
    try:
        success = await reset_password(reset_data.token, reset_data.new_password)
        
        if success:
            return PasswordResetResponse(
                message="Password has been updated successfully. Please log in with your new password.",
                success=True
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
    except Exception as e:
        print(f"Password reset completion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password. Please try again."
        )
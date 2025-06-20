"""
@file backend/app/models/auth.py
@description Pydantic models for authentication endpoints. Defines request/response schemas for login operations and JWT token handling.
@created June 13, 2025. 12:03 p.m. Eastern Time
@updated June 20, 2025. 10:08 AM Eastern Time - Added UserInDB model for internal user representation

@architectural-context
Layer: Data Models (Pydantic schemas)
Dependencies: pydantic (validation), typing (type hints)
Pattern: Request/Response validation for authentication endpoints

@workflow-context
User Journey: User login, authentication, and password reset workflows
Sequence Position: Used by auth router for request validation and response formatting
Inputs: Login credentials, password reset requests, reset tokens from frontend
Outputs: JWT tokens, user information, password reset confirmations for authenticated sessions

@authentication-context
Auth Requirements: These models handle authentication data - credentials and tokens
Security: Password field should be handled securely, never logged or exposed in responses

@database-context
Tables: No direct database interaction - used for API request/response only
Operations: Validation only, no database operations
Transactions: N/A - data transfer objects only
"""

from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class LoginRequest(BaseModel):
    """
    @class LoginRequest
    @description Request model for user login containing username and password
    @example:
        # Login request from frontend
        login_data = LoginRequest(
            username="admin",
            password="secure_password"
        )
    """

    username: str = Field(..., min_length=1, max_length=50, description="Username for authentication")
    password: str = Field(..., min_length=1, description="Password for authentication")


class LoginResponse(BaseModel):
    """
    @class LoginResponse
    @description Response model for successful login containing JWT token and user info
    @example:
        # Successful login response
        response = LoginResponse(
            access_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
            token_type="bearer",
            username="admin"
        )
    """

    access_token: str = Field(..., description="JWT access token for authenticated requests")
    token_type: str = Field(default="bearer", description="Token type, always 'bearer'")
    username: str = Field(..., description="Username of the authenticated user")
    expires_in: Optional[int] = Field(default=28800, description="Token expiration time in seconds (8 hours)")


class TokenData(BaseModel):
    """
    @class TokenData
    @description Internal model for JWT token payload data
    @example:
        # Token payload
        token_data = TokenData(username="admin")
    """

    username: Optional[str] = Field(None, description="Username extracted from JWT token")


class ErrorResponse(BaseModel):
    """
    @class ErrorResponse
    @description Standard error response model for authentication failures
    @example:
        # Authentication error
        error = ErrorResponse(
            detail="Invalid username or password",
            error_code="AUTH_FAILED"
        )
    """

    detail: str = Field(..., description="Human-readable error message")
    error_code: Optional[str] = Field(None, description="Machine-readable error code")


class PasswordResetRequest(BaseModel):
    """
    @class PasswordResetRequest
    @description Request model for initiating password reset flow
    @example:
        # Password reset request
        reset_request = PasswordResetRequest(
            email="admin@qaloader.com"
        )
    """

    email: EmailStr = Field(..., description="Email address for password reset")


class PasswordResetToken(BaseModel):
    """
    @class PasswordResetToken
    @description Request model for completing password reset with token
    @example:
        # Password reset completion
        reset_data = PasswordResetToken(
            token="abc123def456",
            new_password="new_secure_password"
        )
    """

    token: str = Field(..., min_length=1, description="Reset token from email")
    new_password: str = Field(..., min_length=6, description="New password (minimum 6 characters)")


class PasswordResetResponse(BaseModel):
    """
    @class PasswordResetResponse
    @description Response model for password reset operations
    @example:
        # Reset initiated response
        response = PasswordResetResponse(
            message="Password reset email sent successfully",
            success=True
        )
    """

    message: str = Field(..., description="Human-readable status message")
    success: bool = Field(..., description="Whether operation was successful")


class UserInDB(BaseModel):
    """
    @class UserInDB
    @description Internal model for user database representation
    @example:
        # User from database
        user = UserInDB(
            username="admin",
            email="admin@qaloader.com",
            hashed_password="$2b$12$..."
        )
    """
    
    username: str = Field(..., description="Username")
    email: Optional[str] = Field(None, description="User email address")
    hashed_password: str = Field(..., description="Hashed password")

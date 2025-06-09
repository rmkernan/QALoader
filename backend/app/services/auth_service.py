"""
@file backend/app/services/auth_service.py
@description JWT authentication service for Q&A Loader. Handles token creation, validation, and password verification with secure hashing.
@created 2025.06.09 5:15 PM ET
@updated 2025.06.09 5:15 PM ET - Initial creation with comprehensive JWT authentication

@architectural-context
Layer: Service Layer (Business Logic)
Dependencies: jose (JWT), passlib (password hashing), app.config (settings), datetime (expiration)
Pattern: Service pattern with stateless authentication using JWT tokens

@workflow-context
User Journey: Login authentication and protected route access
Sequence Position: Called by auth router for login, and by middleware for token validation
Inputs: Username/password for login, JWT tokens for validation
Outputs: JWT tokens for successful login, user context for protected routes

@authentication-context
Auth Requirements: This IS the authentication service - handles password verification and token generation
Security: Uses bcrypt for password hashing, HS256 for JWT signing, configurable token expiration
Critical Security: JWT_SECRET_KEY must be kept secure and rotated regularly

@database-context
Tables: No direct database access - uses hardcoded admin credentials (temporary implementation)
Operations: Password verification only, no database CRUD operations
Transactions: N/A - stateless authentication service
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    @function create_access_token
    @description Creates a JWT access token with specified payload and expiration time
    @param data: Dictionary containing claims to encode in the token (e.g., {"sub": "admin"})
    @param expires_delta: Optional custom expiration time, defaults to ACCESS_TOKEN_EXPIRE_MINUTES
    @returns: Encoded JWT token string
    @example:
        # Create token for admin user
        token = create_access_token({"sub": "admin"})
        
        # Create token with custom expiration
        custom_expire = timedelta(hours=12)
        token = create_access_token({"sub": "admin"}, expires_delta=custom_expire)
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """
    @function verify_token
    @description Verifies and decodes a JWT token, returning the username if valid
    @param token: JWT token string to verify
    @returns: Username from token if valid, None if invalid or expired
    @example:
        # Verify a token
        username = verify_token("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...")
        if username:
            print(f"Valid token for user: {username}")
        else:
            print("Invalid or expired token")
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    @function verify_password
    @description Verifies a plain text password against a bcrypt hashed password
    @param plain_password: The plain text password to verify
    @param hashed_password: The bcrypt hashed password to check against
    @returns: True if password matches, False otherwise
    @example:
        # Verify password
        is_valid = verify_password("user_input", "$2b$12$hash...")
        if is_valid:
            print("Password correct")
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    @function get_password_hash
    @description Generates a bcrypt hash of a plain text password
    @param password: Plain text password to hash
    @returns: Bcrypt hashed password string
    @example:
        # Hash a password
        hashed = get_password_hash("secure_password")
        print(f"Hashed password: {hashed}")
    """
    return pwd_context.hash(password)

def authenticate_user(username: str, password: str) -> Optional[str]:
    """
    @function authenticate_user
    @description Authenticates a user with username and password, returning username if valid
    @param username: Username to authenticate
    @param password: Plain text password to verify
    @returns: Username if authentication successful, None if failed
    @example:
        # Authenticate admin user
        user = authenticate_user("admin", "password123")
        if user:
            token = create_access_token({"sub": user})
            return {"access_token": token, "token_type": "bearer"}
    
    @security-note
    Currently uses hardcoded admin credentials from environment variables.
    In production, this should query a user database with proper password hashing.
    The admin password should be stored as a bcrypt hash in the database.
    """
    # Temporary implementation: hardcoded admin user
    # In production, this would query a user database
    if username == "admin" and password == settings.ADMIN_PASSWORD:
        return username
    return None

def get_current_user_from_token(token: str) -> Optional[str]:
    """
    @function get_current_user_from_token
    @description Extracts and validates the current user from a JWT token
    @param token: JWT token string (without "Bearer " prefix)
    @returns: Username if token is valid, None if invalid
    @example:
        # Used by authentication middleware
        user = get_current_user_from_token(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
    """
    return verify_token(token)
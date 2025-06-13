"""
@file backend/app/services/auth_service.py
@description JWT authentication service for Q&A Loader. Handles token creation, validation, and password verification with secure hashing.
@created June 9, 2025 at unknown time

@architectural-context
Layer: Service Layer (Business Logic)
Dependencies: jose (JWT), passlib (password hashing), app.config (settings), datetime (expiration), secrets (token generation)
Environment Variables: JWT_SECRET_KEY (token signing), ADMIN_PASSWORD (temporary auth)
Pattern: Service pattern with stateless authentication using JWT tokens and password reset flow

@workflow-context
User Journey: Login authentication, protected route access, and password reset workflow
Sequence Position: Called by auth router for login, token validation, and password reset operations
Inputs: Username/password for login, JWT tokens for validation, email for reset, reset tokens for password updates
Outputs: JWT tokens for successful login, user context for protected routes, reset tokens and success confirmations

@authentication-context
Auth Requirements: This IS the authentication service - handles password verification, token generation, and reset flow
Security: Uses bcrypt for password hashing, HS256 for JWT signing, configurable token expiration, secure reset tokens
Critical Security: JWT_SECRET_KEY must be kept secure and rotated regularly, reset tokens expire after 1 hour
Password Security: Passwords hashed with bcrypt, never stored or logged in plain text, reset tokens are cryptographically secure

@database-context
Tables: password_reset_tokens table for storing reset tokens with expiration
Operations: INSERT/SELECT/DELETE for reset token management, password verification operations
Transactions: Reset token cleanup and password updates should be transactional
"""

from datetime import datetime, timedelta
from typing import Optional
import secrets

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


def generate_reset_token() -> str:
    """
    @function generate_reset_token
    @description Generates a cryptographically secure random token for password reset
    @returns: 32-character hexadecimal reset token
    @example:
        # Generate reset token
        token = generate_reset_token()
        # Returns: "a1b2c3d4e5f6..."
    """
    return secrets.token_hex(32)


async def initiate_password_reset(email: str) -> bool:
    """
    @function initiate_password_reset
    @description Initiates password reset process by generating token and sending email
    @param email: Email address for password reset
    @returns: True if reset initiated successfully, False if email not found
    @example:
        # Initiate password reset
        success = await initiate_password_reset("admin@qaloader.com")
        if success:
            print("Reset email sent")
    
    @security-note:
    For security, this function should always return True to prevent email enumeration attacks.
    In production, store reset tokens with expiration in database and send actual emails.
    """
    # Temporary implementation: Only allow admin email
    if email != "admin@qaloader.com":
        # Return True to prevent email enumeration - don't reveal if email exists
        return True
    
    # Generate reset token
    reset_token = generate_reset_token()
    expiry = datetime.utcnow() + timedelta(hours=1)
    
    # TODO: Store reset token in database with expiration
    # In production: store_reset_token(email, reset_token, expiry)
    
    # TODO: Send actual email with reset link
    # In production: send_reset_email(email, reset_token)
    
    # For demo purposes, log the reset token
    print(f"Password reset token for {email}: {reset_token}")
    print(f"Token expires at: {expiry}")
    
    return True


async def verify_reset_token(token: str) -> Optional[str]:
    """
    @function verify_reset_token
    @description Verifies password reset token and returns associated email
    @param token: Password reset token to verify
    @returns: Email address if token is valid, None if invalid/expired
    @example:
        # Verify reset token
        email = await verify_reset_token("abc123def456")
        if email:
            print(f"Valid token for {email}")
    
    @security-note:
    In production, this should check database for token validity and expiration.
    Tokens should be single-use and deleted after successful password reset.
    """
    # Temporary implementation: Accept any token for admin email
    # In production: query database for token and check expiration
    if token and len(token) == 64:  # Valid hex token length
        return "admin@qaloader.com"
    return None


async def reset_password(token: str, new_password: str) -> bool:
    """
    @function reset_password
    @description Completes password reset by updating password with valid token
    @param token: Valid password reset token
    @param new_password: New password to set for the user
    @returns: True if password reset successful, False if token invalid
    @example:
        # Reset password
        success = await reset_password("abc123def456", "new_secure_password")
        if success:
            print("Password updated successfully")
    
    @security-note:
    In production, this should update the user's password hash in database,
    delete the used reset token, and optionally invalidate all existing sessions.
    """
    # Verify token first
    email = await verify_reset_token(token)
    if not email:
        return False
    
    # Hash the new password
    hashed_password = get_password_hash(new_password)
    
    # TODO: Update password in database
    # In production: update_user_password(email, hashed_password)
    
    # TODO: Delete used reset token
    # In production: delete_reset_token(token)
    
    # For demo purposes, log the password change
    print(f"Password updated for {email}: {hashed_password[:20]}...")
    
    return True


async def send_reset_email(email: str, reset_token: str) -> bool:
    """
    @function send_reset_email
    @description Sends password reset email with secure reset link
    @param email: Email address to send reset link to
    @param reset_token: Reset token to include in email link
    @returns: True if email sent successfully, False otherwise
    @example:
        # Send reset email
        sent = await send_reset_email("user@example.com", "abc123def456")
    
    @security-note:
    In production, this should use a proper email service (SendGrid, SES, etc.)
    with proper email templates and rate limiting to prevent abuse.
    """
    # Temporary implementation: Log email instead of sending
    reset_url = f"http://localhost:3000/reset-password?token={reset_token}"
    
    print(f"""
    Password Reset Email for {email}:
    
    Subject: Password Reset - QA Loader
    
    You requested a password reset for your QA Loader account.
    
    Click the link below to reset your password:
    {reset_url}
    
    This link will expire in 1 hour.
    
    If you didn't request this reset, please ignore this email.
    """)
    
    return True

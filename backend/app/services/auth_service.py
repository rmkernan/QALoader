"""
@file backend/app/services/auth_service.py
@description JWT authentication service for Q&A Loader. Handles token creation, validation, and password verification with secure hashing.
@created June 9, 2025 at unknown time
@updated June 16, 2025. 8:32 PM Eastern Time - Refactored to use database for user authentication instead of hardcoded admin

@architectural-context
Layer: Service Layer (Business Logic)
Dependencies: jose (JWT), passlib (password hashing), app.config (settings), datetime (expiration), secrets (token generation), app.database (Supabase client)
Environment Variables: JWT_SECRET_KEY (token signing), removed ADMIN_PASSWORD dependency
Pattern: Service pattern with stateless authentication using JWT tokens and password reset flow

@workflow-context
User Journey: Login authentication, protected route access, and password reset workflow
Sequence Position: Called by auth router for login, token validation, and password reset operations
Inputs: Username/email/password for login, JWT tokens for validation, email for reset, reset tokens for password updates
Outputs: JWT tokens for successful login, user context for protected routes, reset tokens and success confirmations

@authentication-context
Auth Requirements: This IS the authentication service - handles password verification, token generation, and reset flow
Security: Uses bcrypt for password hashing, HS256 for JWT signing, configurable token expiration, secure reset tokens
Critical Security: JWT_SECRET_KEY must be kept secure and rotated regularly, reset tokens expire after 1 hour
Password Security: Passwords hashed with bcrypt, never stored or logged in plain text, reset tokens are cryptographically secure

@database-context
Tables: users (user credentials), password_reset_tokens (reset tokens with expiration)
Operations: SELECT for user lookup, INSERT/SELECT/DELETE for reset token management, UPDATE for password changes
Transactions: Reset token cleanup and password updates should be transactional
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.database import supabase

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours


async def get_user_by_username_or_email(username_or_email: str) -> Optional[Dict[str, Any]]:
    """
    @function get_user_by_username_or_email
    @description Retrieves user from database by username or email
    @param username_or_email: Username or email to search for
    @returns: User dictionary if found, None otherwise
    @example:
        # Find user by username
        user = await get_user_by_username_or_email("testuser1")
        # Find user by email
        user = await get_user_by_username_or_email("testuser1@dev.com")
    """
    if not supabase:
        return None
    
    try:
        # Check if input is email (contains @)
        if "@" in username_or_email:
            result = supabase.table("users").select("*").eq("email", username_or_email).execute()
        else:
            result = supabase.table("users").select("*").eq("username", username_or_email).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None


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


async def authenticate_user(username_or_email: str, password: str) -> Optional[Dict[str, Any]]:
    """
    @function authenticate_user
    @description Authenticates a user with username/email and password, returning user info if valid
    @param username_or_email: Username or email to authenticate
    @param password: Plain text password to verify
    @returns: User dictionary if authentication successful, None if failed
    @example:
        # Authenticate by username
        user = await authenticate_user("testuser1", "12345678aA1")
        # Authenticate by email
        user = await authenticate_user("testuser1@dev.com", "12345678aA1")
        if user:
            token = create_access_token({"sub": user["username"], "email": user["email"]})
            return {"access_token": token, "token_type": "bearer"}
    """
    # Fetch user from database
    user = await get_user_by_username_or_email(username_or_email)
    if not user:
        return None
    
    # Verify password against stored hash
    if verify_password(password, user["password_hash"]):
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "full_name": user["full_name"],
            "is_test_user": user.get("is_test_user", False)
        }
    
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
    @description Initiates password reset process by generating token and storing in database
    @param email: Email address for password reset
    @returns: True if reset initiated successfully (always returns True for security)
    @example:
        # Initiate password reset
        success = await initiate_password_reset("testuser1@dev.com")
        if success:
            print("Reset email sent")
    
    @security-note:
    For security, this function always returns True to prevent email enumeration attacks.
    Stores reset tokens with expiration in database.
    """
    if not supabase:
        return True
    
    try:
        # Check if user exists (but don't reveal this to caller)
        user_result = supabase.table("users").select("id, email").eq("email", email).execute()
        
        if user_result.data and len(user_result.data) > 0:
            user = user_result.data[0]
            
            # Generate reset token
            reset_token = generate_reset_token()
            expiry = datetime.utcnow() + timedelta(hours=1)
            
            # Store reset token in database
            token_data = {
                "user_id": user["id"],
                "token": reset_token,
                "expires_at": expiry.isoformat(),
                "used": False
            }
            supabase.table("password_reset_tokens").insert(token_data).execute()
            
            # TODO: Send actual email with reset link
            # For now, log the reset token
            print(f"Password reset token for {email}: {reset_token}")
            print(f"Token expires at: {expiry}")
            print(f"Reset URL: http://localhost:5173/reset-password?token={reset_token}")
            
    except Exception as e:
        print(f"Error in password reset: {e}")
    
    # Always return True for security
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
    Checks database for token validity and expiration.
    Tokens are single-use and marked as used after successful password reset.
    """
    if not supabase or not token:
        return None
    
    try:
        # Query token with user info
        result = supabase.table("password_reset_tokens").select(
            "*, users!inner(email)"
        ).eq("token", token).eq("used", False).execute()
        
        if result.data and len(result.data) > 0:
            token_data = result.data[0]
            
            # Check if token is expired
            expires_at = datetime.fromisoformat(token_data["expires_at"].replace("Z", "+00:00"))
            if expires_at > datetime.utcnow():
                return token_data["users"]["email"]
        
        return None
    except Exception as e:
        print(f"Error verifying reset token: {e}")
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
    Updates the user's password hash in database and marks token as used.
    In production, should also invalidate all existing sessions.
    """
    if not supabase:
        return False
    
    # Verify token and get email
    email = await verify_reset_token(token)
    if not email:
        return False
    
    try:
        # Hash the new password
        hashed_password = get_password_hash(new_password)
        
        # Update user's password
        user_result = supabase.table("users").update({
            "password_hash": hashed_password,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("email", email).execute()
        
        if user_result.data:
            # Mark token as used
            supabase.table("password_reset_tokens").update({
                "used": True
            }).eq("token", token).execute()
            
            print(f"Password updated successfully for {email}")
            return True
        
        return False
    except Exception as e:
        print(f"Error resetting password: {e}")
        return False


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


# Create service instance for export
class AuthService:
    """Service class for authentication operations"""
    pass

auth_service = AuthService()

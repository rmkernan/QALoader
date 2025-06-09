"""
@file backend/app/config.py
@description Application configuration management using Pydantic settings. Loads environment variables from .env file and provides typed configuration access.
@created 2025.06.09 3:26 PM ET
@updated 2025.06.09 4:09 PM ET - Added documentation headers and security documentation for environment variables

@architectural-context
Layer: Configuration Management
Dependencies: pydantic-settings (validation), python-dotenv (env file loading), os (environment access)
Pattern: Centralized configuration with environment variable validation and type safety

@workflow-context
User Journey: Configuration loaded once at application startup
Sequence Position: Initialized before database connections and API routes
Inputs: Environment variables from .env file and system environment
Outputs: Typed configuration object accessible throughout application

@authentication-context
Auth Requirements: N/A - Configuration layer
Security: Contains sensitive credentials (JWT secrets, database keys) - NEVER log or expose these values
"""

import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
# SECURITY: .env file contains sensitive credentials and must be in .gitignore
load_dotenv()


class Settings(BaseSettings):
    """
    @class Settings
    @description Pydantic settings class that validates and provides typed access to environment variables
    @example:
        # Access configuration
        from app.config import settings
        url = settings.SUPABASE_URL
    """

    # Supabase Database Configuration
    # SUPABASE_URL: Base URL for Supabase project API (e.g., https://project.supabase.co)
    # SUPABASE_KEY: Anonymous/service role key for database operations (sensitive)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Authentication Configuration
    # ADMIN_PASSWORD: Plain text password for admin login (temporary implementation - should use hashing)
    # JWT_SECRET_KEY: Secret key for signing JWT tokens (CRITICAL - keep secure, rotate regularly)
    # JWT_ALGORITHM: Algorithm for JWT token signing (HS256 recommended)
    # JWT_ACCESS_TOKEN_EXPIRE_MINUTES: Token expiration time in minutes
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "password123")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    class Config:
        env_file = ".env"
        # SECURITY: Prevent case sensitivity issues that could lead to configuration errors
        case_sensitive = True


# Global settings instance
# SECURITY: This instance contains sensitive credentials - handle with care
settings = Settings()

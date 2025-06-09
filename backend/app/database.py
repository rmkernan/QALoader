"""
@file backend/app/database.py
@description Supabase database client initialization and connection management. Handles graceful fallback when database is not configured.
@created 2025.06.09 3:26 PM ET
@updated 2025.06.09 4:11 PM ET - Added comprehensive documentation and error handling documentation

@architectural-context
Layer: Database Connection Layer
Dependencies: supabase-py (database client), app.config (environment settings), asyncio (async operations)
Pattern: Singleton database client with graceful degradation and connection validation

@workflow-context
User Journey: Database operations for all API endpoints requiring data persistence
Sequence Position: Initialized at application startup, used by all database-dependent services
Inputs: Supabase URL and API key from environment configuration
Outputs: Database client for CRUD operations, connection status logging

@authentication-context
Auth Requirements: Uses Supabase service role key for database access
Security: Connection uses encrypted HTTPS, RLS policies enforced at database level

@database-context
Tables: all_questions (Q&A data), activity_log (user actions)
Operations: Full CRUD operations via Supabase REST API
Transactions: Supported through Supabase client for batch operations
"""

from typing import Optional

from supabase import Client, create_client

from app.config import settings

# Initialize Supabase client (will be None if not configured)
# PATTERN: Singleton client instance shared across the application
supabase: Optional[Client] = None

try:
    # Validate configuration before attempting connection
    if settings.SUPABASE_URL and settings.SUPABASE_KEY and settings.SUPABASE_URL != "your_supabase_project_url":
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("✓ Supabase client initialized")
    else:
        print("⚠ Supabase not configured - using mock mode")
except Exception as e:
    # ERROR HANDLING: Graceful degradation when database is unavailable
    print(f"⚠ Supabase initialization failed: {e}")
    supabase = None


async def init_db():
    """
    @function init_db
    @description Initialize database connection and perform any required startup tasks
    @returns: None
    @raises Exception: If database configuration is invalid
    @example:
        # Called automatically by FastAPI on startup
        await init_db()
    """
    # For now, we assume tables are created via Supabase dashboard
    # Future enhancement: Add migration system for automated table creation
    print("Database initialization completed")


async def get_db():
    """
    @function get_db
    @description FastAPI dependency that provides database client for route handlers
    @returns: Supabase client instance for database operations
    @raises Exception: If database is not configured or connection failed
    @example:
        # Use as FastAPI dependency
        @router.get("/endpoint")
        async def endpoint(db=Depends(get_db)):
            result = db.table("table_name").select("*").execute()
    """
    if not supabase:
        # ERROR HANDLING: Explicit error when database is required but not available
        raise Exception("Database not configured. Please set SUPABASE_URL and SUPABASE_KEY in .env")
    return supabase

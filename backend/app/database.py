from supabase import create_client, Client
from app.config import settings
import asyncio
from typing import Optional

# Initialize Supabase client (will be None if not configured)
supabase: Optional[Client] = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_KEY and settings.SUPABASE_URL != "your_supabase_project_url":
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("✓ Supabase client initialized")
    else:
        print("⚠ Supabase not configured - using mock mode")
except Exception as e:
    print(f"⚠ Supabase initialization failed: {e}")
    supabase = None

async def init_db():
    """Initialize database tables if they don't exist"""
    # For now, we assume tables are created via Supabase dashboard
    # Future enhancement: Add migration system
    print("Database initialization completed")

async def get_db():
    """Dependency for database operations"""
    if not supabase:
        raise Exception("Database not configured. Please set SUPABASE_URL and SUPABASE_KEY in .env")
    return supabase
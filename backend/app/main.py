"""
@file backend/app/main.py
@description FastAPI application entry point for Q&A Loader backend API. Configures CORS, includes routers, and initializes database connection.
@created 2025.06.09 3:26 PM ET
@updated 2025.06.09 4:07 PM ET - Added comprehensive documentation headers and function documentation
@updated June 13, 2025. 6:34 p.m. Eastern Time - Added additional CORS origins for WSL development environment compatibility
@updated June 19, 2025. 3:56 PM Eastern Time - Added detailed startup timing logs to identify performance bottlenecks
@updated June 19, 2025. 6:01 PM Eastern Time - Added duplicates router for duplicate question management
@updated June 20, 2025. 10:06 AM Eastern Time - Added staging router for question review workflow

@architectural-context
Layer: API Application Entry Point
Dependencies: FastAPI (web framework), CORSMiddleware (cross-origin requests), custom routers (auth, questions, upload), database initialization
Pattern: REST API with modular router structure and CORS-enabled frontend integration

@workflow-context
User Journey: All API requests flow through this main application
Sequence Position: Entry point for all backend API operations
Inputs: HTTP requests from frontend on ports 3000/5173, authentication headers
Outputs: JSON responses, database operations, file processing results

@authentication-context
Auth Requirements: Mixed - some endpoints public, others require JWT
Security: CORS restricted to localhost frontend ports, JWT validation in protected routes
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import os

from app.database import init_db
from app.routers import auth, questions, upload, duplicates, staging

# Track startup time
startup_start = time.time()

print(f"[STARTUP] Initializing FastAPI application...")
app = FastAPI(title="Q&A Loader API", version="1.0.0")
print(f"[STARTUP] FastAPI app created (+{time.time() - startup_start:.2f}s)")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://0.0.0.0:3000"],  # Including Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(questions.router, prefix="/api", tags=["questions"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(duplicates.router, tags=["duplicates"])
app.include_router(staging.router, prefix="/api", tags=["staging"])


@app.on_event("startup")
async def startup_event():
    """
    @function startup_event
    @description FastAPI startup event handler that initializes the database connection and performs any required setup
    @returns: None
    @example:
        # Called automatically by FastAPI on application startup
        # No manual invocation required
    """
    event_start = time.time()
    print(f"[STARTUP] Running startup event handler...")
    
    # Database initialization
    print(f"[STARTUP] Initializing database connection...")
    await init_db()
    print(f"[STARTUP] Database initialized (+{time.time() - event_start:.2f}s)")
    
    # Log system startup event
    try:
        print(f"[STARTUP] Logging system startup event...")
        log_start = time.time()
        from app.database import supabase
        from app.services.question_service import QuestionService
        
        question_service = QuestionService(supabase)
        await question_service.log_system_event('System Startup', {
            'description': 'Backend server started on port 8000',
            'server': 'FastAPI Backend',
            'port': 8000,
            'version': '1.0.0',
            'environment': os.getenv('ENVIRONMENT', 'development'),
            'startup_time': f"{time.time() - startup_start:.2f}s"
        })
        print(f"[STARTUP] System event logged (+{time.time() - log_start:.2f}s)")
    except Exception as e:
        print(f"[STARTUP] Failed to log startup event: {e}")
    
    total_time = time.time() - startup_start
    print(f"[STARTUP] ✅ Backend startup complete! Total time: {total_time:.2f}s")


@app.get("/")
def read_root():
    """
    @api GET /
    @description Health check endpoint that confirms the API is running and accessible
    @returns: JSON object with status message
    @authentication: Public endpoint, no authentication required
    @example:
        # Request
        GET /
        # Response: {"message": "Q&A Loader API is running"}
    """
    return {"message": "Q&A Loader API is running"}


@app.get("/health")
def health_check():
    """
    @api GET /health
    @description Detailed health check endpoint for monitoring and load balancer health checks
    @returns: JSON object with service status and name
    @authentication: Public endpoint, no authentication required
    @example:
        # Request
        GET /health
        # Response: {"status": "healthy", "service": "Q&A Loader Backend"}
    """
    return {"status": "healthy", "service": "Q&A Loader Backend"}

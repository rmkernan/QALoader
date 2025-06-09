"""
@file backend/app/main.py
@description FastAPI application entry point for Q&A Loader backend API. Configures CORS, includes routers, and initializes database connection.
@created 2025.06.09 3:26 PM ET
@updated 2025.06.09 4:07 PM ET - Added comprehensive documentation headers and function documentation

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

from app.database import init_db
from app.routers import auth, questions, upload

app = FastAPI(title="Q&A Loader API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Including Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(questions.router, prefix="/api", tags=["questions"])
app.include_router(upload.router, prefix="/api", tags=["upload"])


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
    await init_db()


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

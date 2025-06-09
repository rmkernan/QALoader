# Claude Development Guidelines for Q&A Loader Backend

**Purpose:** Backend-specific development guidelines and documentation standards for AI assistants working on the Q&A Loader FastAPI backend.

**Created on:** June 9, 2025. 4:05 p.m. Eastern Time
**Updated:** June 9, 2025. 4:05 p.m. Eastern Time - Initial creation with comprehensive backend documentation standards

## Documentation Standards (CRITICAL - APPLY FIRST)

### Required File-Level Documentation for Python Files
**All .py files must include:**

```python
"""
@file backend/path/to/file.py
@description Brief description of the file's purpose and main functionality
@created YYYY.MM.DD H:MM PM ET
@updated YYYY.MM.DD H:MM PM ET - Description of what changed and why

@architectural-context
Layer: [API Route/Service/Model/Utility/Database/etc.]
Dependencies: List key dependencies (FastAPI, Supabase, Pydantic, etc.)
Pattern: [REST API/Database ORM/Authentication/File Processing/etc.]

@workflow-context
User Journey: [Which API workflow this supports]
Sequence Position: [Where this fits in the request/response flow]
Inputs: [Request data, query parameters, file uploads, etc.]
Outputs: [Response format, database changes, side effects, etc.]

@authentication-context
Auth Requirements: [Public/JWT Required/Admin Only/etc.]
Security: [Data validation, SQL injection prevention, etc.]

@database-context (if applicable)
Tables: [Which Supabase tables are accessed]
Operations: [SELECT/INSERT/UPDATE/DELETE patterns]
Transactions: [Whether transactional operations are used]
"""
```

### Function Documentation for Python
**Required for all functions:**

```python
def function_name(param: Type) -> ReturnType:
    """
    @function function_name
    @description Clear description of what the function does and why it exists
    @param param: Description of the parameter and its purpose
    @returns: Description of what is returned
    @raises HTTPException: When specific error conditions occur (if applicable)
    @example:
        # Usage example
        result = function_name(param_value)
    """
```

### FastAPI Route Documentation
**Required for all API endpoints:**

```python
@router.get("/endpoint/{param}")
async def endpoint_function(param: str) -> ResponseModel:
    """
    @api GET /api/endpoint/{param}
    @description What this endpoint does and its purpose in the application
    @param param: Description of path parameter
    @returns: Description of response format and status codes
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 404: Resource not found
        - 500: Internal server error
    @example:
        # Request example
        GET /api/questions?topic=DCF&difficulty=Basic
        Authorization: Bearer <jwt_token>
    """
```

## Backend-Specific Standards

### Database Integration Documentation
**Always document:**
- Supabase table interactions and RLS policies
- SQL query patterns and performance considerations
- Error handling for database connection failures
- Transaction patterns for data consistency

### Environment Variable Dependencies
**Document all environment variables:**
```python
# SUPABASE_URL: Base URL for Supabase project API access
# SUPABASE_KEY: Anonymous/service role key for database operations
# JWT_SECRET_KEY: Secret for signing authentication tokens (KEEP SECURE)
# ADMIN_PASSWORD: Plain text password for admin login (temporary implementation)
```

### Authentication and Security
**Required documentation for auth code:**
- JWT token validation patterns
- Password handling and security implications
- CORS configuration and allowed origins
- Input validation and SQL injection prevention

### Error Handling Patterns
**Document error responses:**
```python
# Standard error response format:
# {"detail": "Human-readable error message"}
# Status codes: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
```

## Development Context

### Current Project State
- **Phase:** 1 Complete (Foundation), 2 In Progress (Database Setup)
- **Working Directory:** `/mnt/c/PythonProjects/QALoader/backend`
- **Python Environment:** `source venv/bin/activate` required for all operations
- **Database:** Supabase project xxgrrgmrzhayboraohin connected and working

### File Structure Documentation Requirements
```
backend/
├── app/
│   ├── main.py           # FastAPI app entry point - CORS, routers, startup
│   ├── config.py         # Environment settings - Supabase, JWT, admin password
│   ├── database.py       # Supabase client initialization and connection handling
│   ├── models/           # Pydantic models for request/response validation
│   ├── routers/          # API route handlers organized by feature
│   ├── services/         # Business logic layer - database operations, auth
│   └── utils/            # Pure utility functions - ID generation, validation
├── requirements.txt      # Python dependencies with version locks
├── .env                 # Environment variables (gitignored, contains secrets)
└── .gitignore           # Excludes venv, __pycache__, .env
```

### Mandatory Documentation Updates
**Apply to ALL existing files before proceeding:**
1. Add file headers with architectural context
2. Document all functions with JSDoc-style comments
3. Include authentication and security notes
4. Document environment variable dependencies
5. Add error handling documentation

## Code Quality Standards

### Database Operations
- Use type hints for all Supabase operations
- Handle connection failures gracefully
- Document transaction patterns for data consistency
- Include SQL injection prevention notes

### API Design
- Follow RESTful conventions strictly
- Use appropriate HTTP status codes
- Validate all input data with Pydantic models
- Document CORS policies and security implications

### Testing Requirements
- Document test patterns for database operations
- Include error condition testing
- Mock external dependencies (Supabase) in tests
- Verify authentication flows

## Development Workflow

### Before Any Code Changes
1. **Read and apply documentation standards**
2. **Check existing code for documentation completeness**
3. **Update file headers with current timestamps**
4. **Document new functions immediately**

### Pre-Commit Checklist
- [ ] All files have complete headers with timestamps
- [ ] All functions documented with examples
- [ ] Authentication patterns documented
- [ ] Environment dependencies listed
- [ ] Error handling documented
- [ ] Security implications noted

## Backend Development Commands

### Essential Commands
```bash
# Activate environment (ALWAYS required)
cd backend && source venv/bin/activate

# Run development server
uvicorn app.main:app --reload --port 8000

# Test database connection
python -c "from app.database import supabase; print('✓' if supabase else '✗')"

# Install new dependencies
pip install package_name && pip freeze > requirements.txt

# Run table creation script
python create_tables.py
```

### Testing and Validation
```bash
# Test app loading
python -c "from app.main import app; print('✓ App loads')"

# Test all imports
python -c "from app.routers import auth, questions, upload; print('✓ Routers OK')"

# Check configuration
python -c "from app.config import settings; print(f'URL: {settings.SUPABASE_URL[:30]}...')"
```

## Integration Patterns

### Supabase Integration
- Document table schemas and relationships
- Include RLS policy requirements
- Handle connection errors with fallback responses
- Document query optimization patterns

### FastAPI Patterns
- Use dependency injection for database connections
- Implement proper request/response models
- Handle async operations correctly
- Document middleware and CORS configuration

---

*This file must be read and applied before any backend development work.*
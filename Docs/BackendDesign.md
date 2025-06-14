Backend Design & API Contract: Q&A Loader
Version: 1.0
Date: June 8, 2025
Updated: June 14, 2025. 2:24 p.m. Eastern Time - Phase 3 completion update with validation workflow, semantic ID generation, and upload metadata tracking
Status: Phase 3 Complete - Production Ready

1. Architecture Overview
1.1. Core Responsibility
The backend will serve as a secure RESTful API that connects the React frontend prototype to a Supabase PostgreSQL database. It is responsible for all business logic, data processing, and database interactions, including user authentication, Markdown parsing, and all CRUD (Create, Read, Update, Delete) operations for the Q&A data.

1.2. Technical Stack
Language: Python 3.10+

Web Framework: FastAPI

Database: Supabase (PostgreSQL)

Database Library: supabase-py

2. Database Schema
The application will use a single primary table within the Supabase database.

Table Name: all_questions

2.1. SQL Schema Definition
CREATE TABLE all_questions (
    question_id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Basic', 'Advanced')),
    type TEXT NOT NULL CHECK (type IN ('Definition', 'Problem', 'GenConcept', 'Calculation', 'Analysis')),
    question TEXT NOT NULL CHECK (LENGTH(TRIM(question)) > 0),
    answer TEXT NOT NULL CHECK (LENGTH(TRIM(answer)) > 0),
    notes_for_tutor TEXT,
    uploaded_on TEXT,
    uploaded_by TEXT,
    upload_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- It is highly recommended to create an index for efficient filtering.
CREATE INDEX idx_questions_filters ON all_questions (topic, subtopic, difficulty, type);

2.2. question_id Generation
The backend generates semantic question IDs using the format: {TOPIC}-{SUBTOPIC}-{DIFFICULTY}-{TYPE}-{SEQUENCE}

Examples:
- DCF-WACC-B-D-001 (DCF, WACC, Basic, Definition, sequence 001)
- VALUATION-COMPS-A-P-015 (Valuation, Comparable Companies, Advanced, Problem, sequence 015)

Generation Process:
1. Topic normalization: Extract abbreviations, remove spaces/special chars
2. Subtopic normalization: Intelligent abbreviation and truncation
3. Type mapping: Definition→D, Problem→P, GenConcept→G, Calculation→C, Analysis→A
4. Difficulty mapping: Basic→B, Advanced→A
5. Sequence generation: Query database for existing patterns, increment appropriately
6. Uniqueness verification: Retry with collision detection if needed

3. Core Backend Logic Requirements
3.1. Validation-First Upload Workflow
Implemented as a two-step process:

1. **Validation Endpoint** (`/api/validate-markdown`):
   - Validates file constraints (type, size, encoding)
   - Parses markdown structure and validates hierarchy
   - Validates question content and required fields
   - Returns detailed ValidationResult without database operations
   - Provides line-by-line error reporting for user feedback

2. **Upload Endpoint** (`/api/upload-markdown`):
   - Re-validates file (ensures consistency)
   - Generates unique semantic IDs for each question
   - Processes questions individually with error tracking
   - Supports partial success (continues if some questions fail)
   - Returns BatchUploadResult with detailed status per question

Markdown Parser Features:
- Stateful hierarchy tracking (Topic → Subtopic → Difficulty → Type)
- Regex pattern matching for required markdown structure
- Content validation (difficulty/type constraints, non-empty fields)
- Comprehensive error reporting with line numbers
- Support for optional tutor notes and upload metadata

3.2. Individual Question Processing (Non-Transactional)
The upload workflow processes questions individually to support partial success scenarios:

- **No bulk transactions**: Each question is inserted separately
- **Partial success support**: If some questions fail, successful ones remain in database
- **Individual error tracking**: Each failure is mapped to specific question with user-friendly error message
- **Database error translation**: Technical errors converted to actionable user guidance
- **Comprehensive result tracking**: BatchUploadResult includes success/failure counts, question IDs, and detailed errors

This approach provides better user experience as users can see which specific questions succeeded or failed, and partial uploads don't lose all work due to single question issues.

4. API Endpoint Specifications (The Contract)
The backend must implement the following RESTful API endpoints. All endpoints should be prefixed with /api.

Endpoint: GET /api/bootstrap-data
Description: Fetches all initial data required to hydrate the React frontend on application load.

Method: GET
Authentication: JWT required
Query Parameters:
- enhanced (boolean, optional): If true, returns enhanced analytics data

Basic Response (200 OK):
{
  "questions": [/* Array of full Question objects from the DB */],
  "topics": [/* Array of unique topic strings from the DB */],
  "lastUploadTimestamp": "2025-06-09T18:30:00Z",
  "activityLog": [/* Array of the 5 most recent ActivityLogItem objects */]
}

Enhanced Response (?enhanced=true):
{
  "questions": [/* same as basic */],
  "topics": [/* same as basic */],
  "statistics": {/* question metrics by difficulty, type, topic */},
  "systemHealth": {/* database status, performance metrics */},
  "activityTrends": [/* daily activity breakdown with trends */],
  "lastUploadTimestamp": "2025-06-09T18:30:00Z",
  "activityLog": [/* same as basic */]
}

Endpoint: POST /api/validate-markdown
Description: Validates markdown file structure and content without saving to database

Method: POST
Request Body: multipart/form-data containing:
- topic: The name of the topic (string)
- file: The .md file (max 10MB, .md/.txt extensions only)

Response (200 OK): ValidationResult
{
  "is_valid": true,
  "errors": [],
  "warnings": ["Long content in question DCF-WACC-B-001"],
  "parsed_count": 25,
  "line_numbers": {"topic": 1, "first_subtopic": 3, "first_question": 8}
}

Endpoint: POST /api/upload-markdown
Description: Validates and uploads questions from markdown file to database with metadata tracking

Method: POST
Request Body: multipart/form-data containing:
- topic: The name of the topic (string)
- file: The .md file
- uploaded_on: American timestamp when questions were uploaded (optional)
- uploaded_by: Free text field for who uploaded the questions (optional, max 25 chars)
- upload_notes: Free text notes about this upload (optional, max 100 chars)

Response (200 OK): BatchUploadResult
{
  "total_attempted": 25,
  "successful_uploads": ["DCF-WACC-B-D-001", "DCF-WACC-B-D-002"],
  "failed_uploads": ["DCF-WACC-B-P-001"],
  "errors": {"DCF-WACC-B-P-001": "Question ID already exists in database"},
  "warnings": [],
  "processing_time_ms": 2340
}

Response (400 Bad Request): If validation fails
{
  "detail": {
    "message": "File validation failed",
    "errors": ["Missing required '# Topic: [name]' header"],
    "warnings": []
  }
}

Endpoint: GET /questions
Description: Used by the "Manage Content" view to search and filter questions.

Method: GET

Query Parameters (all optional): topic, subtopic, difficulty, type, searchText.

Response (200 OK): An array of Question objects that match the filter criteria. Returns an empty array if no matches are found.

Endpoint: POST /questions
Description: Adds a single new question to the database (for the "Add New Question" feature).

Method: POST

Request Body (JSON): An object representing the new question, excluding the id.

{
  "topic": "...", "subtopic": "...", "difficulty": "...", "type": "...",
  "questionText": "...", "answerText": "...", "notes_for_tutor": "..."
}

Response (201 Created): The newly created Question object, including its backend-generated question_id.

Endpoint: PUT /questions/{id}
Description: Updates an existing question identified by its ID.

Method: PUT

Path Parameter: {id} - The unique ID of the question to update.

Request Body (JSON): A full Question object containing the updated data.

Response (200 OK): The updated Question object.

Endpoint: DELETE /questions/{id}
Description: Deletes a single question identified by its ID.

Method: DELETE

Path Parameter: {id} - The unique ID of the question to delete.

Response (204 No Content): An empty response indicating successful deletion.

Endpoint: POST /api/login
Description: Authenticates the user and returns JWT token

Method: POST
Request Body (JSON):
{
  "username": "admin",
  "password": "user_entered_password"
}

Logic: Compares credentials against ADMIN_PASSWORD environment variable

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "admin",
  "expires_in": 28800
}

Response (401 Unauthorized): If credentials are incorrect
{ "detail": "Invalid username or password" }

Endpoint: GET /api/auth/verify
Description: Verify JWT token validity
Method: GET
Authentication: JWT required
Response (200 OK): {"username": "admin", "valid": true}
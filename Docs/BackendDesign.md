Backend Design & API Contract: Q&A Loader
Version: 1.0
Date: June 8, 2025
Status: Ready for Implementation

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
    difficulty TEXT NOT NULL,
    type TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    notes_for_tutor TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- It is highly recommended to create an index for efficient filtering.
CREATE INDEX idx_questions_filters ON all_questions (topic, subtopic, difficulty, type);

2.2. question_id Generation
The backend is responsible for generating a unique question_id for every new question. The ID should be human-readable and follow a consistent format, such as TOPIC_ABBR-SUBTOPIC_ABBR-TYPE_ABBR-SEQ (e.g., DCF-WACC-P-001). The sequence number should be calculated based on the existing questions for that combination.

3. Core Backend Logic Requirements
3.1. Markdown Parsing Engine
The backend must contain a robust parser for the hierarchical Markdown format specified in the project's README.md.

The parser must be stateful, correctly tracking the current topic, subtopic, difficulty, and type as it iterates through the file.

It must handle changes at any level of the hierarchy and correctly attribute the context to subsequent Q&A pairs.

The output of the parser should be a list of Python objects/dictionaries matching the ParsedQuestionFromAI structure, ready for database insertion.

3.2. Transactional Upload Process
The "delete and reload" operation initiated by the /api/upload-markdown endpoint must be transactional. The backend should use a single database transaction to perform the DELETE of all old questions for a topic, followed by the INSERT of all new questions. If any part of the INSERT process fails, the entire transaction must be rolled back, leaving the original data for that topic intact.

4. API Endpoint Specifications (The Contract)
The backend must implement the following RESTful API endpoints. All endpoints should be prefixed with /api.

Endpoint: GET /bootstrap-data
Description: Fetches all initial data required to hydrate the React frontend on application load.

Method: GET

Response (200 OK): A JSON object containing all necessary initial state.

{
  "questions": [/* Array of full Question objects from the DB */],
  "topics": [/* Array of unique topic strings from the DB */],
  "lastUploadTimestamp": 1678886400000, // Unix timestamp (or null)
  "activityLog": [/* Array of the 5 most recent ActivityLogItem objects */]
}

Endpoint: POST /upload-markdown
Description: The primary endpoint for the ETL process. It receives a Markdown file, parses it, and executes the transactional "delete and reload" operation for the specified topic.

Method: POST

Request Body: multipart/form-data containing:

topic: The name of the topic (string).

file: The .md file.

Response (200 OK): A JSON object summarizing the successful operation.

{
  "success": true,
  "message": "Successfully replaced 150 questions for topic 'DCF'."
}

Response (400 Bad Request): If parsing fails or the file is malformed.

{
  "success": false,
  "message": "Markdown validation failed.",
  "errors": ["Missing 'Answer' for question on line 47."]
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

Endpoint: POST /login
Description: Authenticates the user.

Method: POST

Request Body (JSON):

{ "password": "user_entered_password" }

Logic: Compares the provided password against a ADMIN_PASSWORD environment variable on the server.

Response (200 OK): A JSON object containing a session token (e.g., a JWT) if the password is correct.

{ "token": "a_secure_session_token" }

Response (401 Unauthorized): If the password is incorrect.
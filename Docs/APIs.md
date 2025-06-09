
**Purpose:** Detailed specification of the application's backend API contract, intended for comprehensive understanding by developers and LLMs. This document outlines each endpoint, its parameters, request/response formats, and expected behavior.

**Created on:** June 9, 2025. 1:30 p.m. Eastern Time
**Updated:** June 9, 2025. 1:30 p.m. Eastern Time - Initial creation of detailed API specification.

---

# Backend API Contract Specification

This document details the backend API endpoints that the Q&A Loader frontend prototype expects to interact with.

## General Considerations

*   **Authentication**: All API endpoints are assumed to be protected and require a valid session token (e.g., JWT) sent in the `Authorization` header (e.g., `Authorization: Bearer <token>`). The `LoginView` component handles obtaining this token.
*   **Content Type**: Unless otherwise specified (e.g., for file uploads), requests and responses should use `Content-Type: application/json`.
*   **Error Handling**: Backend should return appropriate HTTP status codes for errors (e.g., 400 for bad request, 401 for unauthorized, 404 for not found, 500 for server error). Error responses should ideally include a JSON body with a `message` field, and potentially an `errors` array for validation issues.
    ```json
    // Example Error Response
    {
      "message": "Validation failed",
      "errors": ["Field 'subtopic' is required."]
    }
    ```

---

## 1. Bootstrap Data

### `GET /api/bootstrap-data`

*   **Purpose**: Fetches all initial data required by the frontend application after successful login to hydrate its state.
*   **Method**: `GET`
*   **Path**: `/api/bootstrap-data`
*   **Path Parameters**: None.
*   **Request Body**: None.
*   **Response Body (Success - 200 OK)**:
    *   **Structure**: JSON object.
    *   **Fields**:
        *   `questions` (array of `Question` objects): The full list of all Q&A items.
            *   `Question` object structure: `{ id: string, topic: string, subtopic: string, difficulty: string, type: string, questionText: string, answerText: string }`
        *   `topics` (array of strings): A list of unique topic names derived from the questions or maintained separately.
        *   `lastUploadTimestamp` (number | null): Unix timestamp (milliseconds) of the last successful content upload, or `null` if no uploads.
        *   `activityLog` (array of `ActivityLogItem` objects): A list of recent activity log entries.
            *   `ActivityLogItem` object structure: `{ id: string, action: string, details?: string, timestamp: number }`
    *   **Example**:
        ```json
        {
          "questions": [
            { "id": "q1", "topic": "DCF", "subtopic": "WACC", "difficulty": "Basic", "type": "Definition", "questionText": "What is WACC?", "answerText": "Weighted Average Cost of Capital." }
          ],
          "topics": ["DCF", "Valuation"],
          "lastUploadTimestamp": 1678886400000,
          "activityLog": [
            { "id": "log1", "action": "User Logged In", "timestamp": 1678886500000 }
          ]
        }
        ```
*   **Key Operations**: Retrieves comprehensive application state.
*   **LLM Notes**: This is the primary data source for the application upon initialization post-authentication.

---

## 2. Question Management (CRUD)

### `POST /api/questions`

*   **Purpose**: Adds a new question to the database.
*   **Method**: `POST`
*   **Path**: `/api/questions`
*   **Request Body**: JSON object representing the new question (backend generates `id`).
    *   **Structure**: `{ topic: string, subtopic: string, difficulty: string, type: string, questionText: string, answerText: string }`
    *   **Required Fields**: `topic`, `subtopic`, `questionText`, `answerText`. `difficulty` and `type` should default if not provided.
    *   **Example**:
        ```json
        {
          "topic": "M&A",
          "subtopic": "Synergies",
          "difficulty": "Advanced",
          "type": "GenConcept",
          "questionText": "Explain revenue synergies.",
          "answerText": "Revenue synergies are increases in revenue..."
        }
        ```
*   **Response Body (Success - 201 Created)**: JSON object of the newly created `Question` (including its generated `id`).
    *   **Example**:
        ```json
        {
          "id": "qGenerated123",
          "topic": "M&A",
          "subtopic": "Synergies",
          "difficulty": "Advanced",
          "type": "GenConcept",
          "questionText": "Explain revenue synergies.",
          "answerText": "Revenue synergies are increases in revenue..."
        }
        ```
*   **Key Operations**: Creates a new question record. If the `topic` is new, the backend might also implicitly create the topic or ensure it's recognized.
*   **LLM Notes**: Backend is responsible for `id` generation.

### `PUT /api/questions/{id}`

*   **Purpose**: Updates an existing question.
*   **Method**: `PUT`
*   **Path**: `/api/questions/{id}`
*   **Path Parameters**:
    *   `id` (string, required): The unique ID of the question to update.
*   **Request Body**: JSON object representing the `Question` with updated fields. `id` in body should match path parameter.
    *   **Structure**: `{ id: string, topic: string, subtopic: string, difficulty: string, type: string, questionText: string, answerText: string }`
    *   **Example**:
        ```json
        {
          "id": "qExisting456",
          "topic": "DCF",
          "subtopic": "WACC Calculation",
          "difficulty": "Basic",
          "type": "Problem",
          "questionText": "How is WACC calculated?",
          "answerText": "WACC = (E/V * Re) + ((D/V * Rd) * (1 - T))."
        }
        ```
*   **Response Body (Success - 200 OK)**: JSON object of the updated `Question`.
    *   **Example**: (Same as request body, but reflecting persisted state)
*   **Key Operations**: Modifies an existing question record.
*   **LLM Notes**: Ensures `id` consistency between path and body.

### `DELETE /api/questions/{id}`

*   **Purpose**: Deletes a specific question.
*   **Method**: `DELETE`
*   **Path**: `/api/questions/{id}`
*   **Path Parameters**:
    *   `id` (string, required): The unique ID of the question to delete.
*   **Request Body**: None.
*   **Response Body (Success - 200 OK or 204 No Content)**:
    *   `200 OK`: Optionally, a confirmation message (e.g., `{ "message": "Question deleted successfully." }`).
    *   `204 No Content`: No response body.
*   **Key Operations**: Removes a question record from the database.
*   **LLM Notes**: Handles deletion of individual Q&A items.

---

## 3. Bulk Question Operations

### `POST /api/topics/{topicName}/questions/batch-replace`

*   **Purpose**: Deletes all existing questions for a specified topic and replaces them with a new set of questions. This is typically used after a Markdown file upload and successful parsing.
*   **Method**: `POST`
*   **Path**: `/api/topics/{topicName}/questions/batch-replace`
*   **Path Parameters**:
    *   `topicName` (string, required): The name of the topic for which questions are being replaced.
*   **Request Body**: JSON array of `ParsedQuestionFromAI` objects. Backend generates `id`s and uses `topicName` from path.
    *   **Structure**: `[ { subtopic: string, difficulty: string, type: string, question: string, answer: string }, ... ]`
    *   **Example**:
        ```json
        [
          { "subtopic": "Free Cash Flow", "difficulty": "Basic", "type": "Definition", "question": "Define FCF.", "answer": "Free Cash Flow is..." },
          { "subtopic": "Discount Rate", "difficulty": "Advanced", "type": "Problem", "question": "How to choose a discount rate?", "answer": "Consider CAPM..." }
        ]
        ```
*   **Response Body (Success - 200 OK or 201 Created)**:
    *   JSON object, possibly with a summary of the operation.
    *   **Example**:
        ```json
        {
          "message": "Successfully replaced 2 questions for topic 'DCF'.",
          "topic": "DCF",
          "questionsAdded": 2
        }
        ```
*   **Key Operations**: Performs a destructive "delete all by topic" then "insert many" operation. This is atomic from the user's perspective.
*   **LLM Notes**: Critical for the "Load to Database" step in `LoaderView`. The `topicName` in the path dictates the scope of deletion.

---

## 4. File Upload and Processing

### `POST /api/upload-markdown`

*   **Purpose**: Handles the server-side processing of an uploaded Markdown file for a specific topic. This endpoint is for the *actual load* operation (not the dry run). The backend is responsible for parsing the file, validating content, and then performing a batch replacement of questions for the given topic.
*   **Method**: `POST`
*   **Path**: `/api/upload-markdown`
*   **Request Body**: `FormData`.
    *   **Fields**:
        *   `topic` (string): The name of the topic associated with the file.
        *   `file` (File object): The Markdown file (`.md`, `.markdown`).
*   **Response Body (Success - 200 OK)**:
    *   JSON object with a report of the operation.
    *   **Example**:
        ```json
        {
          "success": true,
          "message": "Successfully processed 'dcf_update.md' and loaded 15 questions for topic 'DCF'.",
          "topic": "DCF",
          "parsedCount": 15,
          "errors": []
        }
        ```
*   **Response Body (Error - e.g., 400 Bad Request, 500 Internal Server Error)**:
    *   JSON object with error details.
    *   **Example**:
        ```json
        {
          "success": false,
          "message": "Failed to process file due to parsing errors.",
          "topic": "DCF",
          "parsedCount": 0,
          "errors": ["Invalid Markdown structure at line 10.", "Missing answer for question at line 15."]
        }
        ```
*   **Key Operations**:
    1.  Receives topic and file.
    2.  Parses Markdown content (similar to `geminiService.ts` but on the backend).
    3.  Validates parsed questions.
    4.  If valid, performs a batch-replace operation for the specified topic in the database (similar to `/api/topics/{topicName}/questions/batch-replace`).
    5.  Logs the activity.
*   **LLM Notes**: This endpoint encapsulates the entire server-side logic for a non-dry-run file upload. The frontend uses this for the "Load to Database" functionality after a successful dry run preview. It's crucial that this endpoint performs the same type of parsing and validation as the client-side dry run to ensure consistency.

---
This API contract provides a foundation for the backend services required by the Q&A Loader frontend prototype.
Further details like pagination for `GET /api/bootstrap-data` (if `questions` array becomes very large) or more granular error codes can be added as the application evolves.

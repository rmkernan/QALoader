# Q&A Loader Backend API Documentation - Complete

**Purpose:** Comprehensive specification of all backend API endpoints for Phases 1-5  
**Created:** June 10, 2025. 9:47 a.m. Eastern Time  
**Updated:** June 14, 2025. 11:32 a.m. Eastern Time - Added bulk delete operations and enhanced safety features
**Updated:** June 14, 2025. 2:16 p.m. Eastern Time - Major update: Added complete upload workflow endpoints, validation models, and field mapping documentation after Phase 3 implementation
**Backend Phases:** 1-5 Complete (Foundation → Analytics & Monitoring)

---

## Overview

The Q&A Loader backend provides a complete REST API for question management, analytics, and system monitoring. All endpoints except health checks require JWT authentication.

### Base URL
- Development: `http://localhost:8000`
- API Prefix: `/api` (except health endpoints)

### Authentication
- **Method:** JWT Bearer tokens in Authorization header
- **Format:** `Authorization: Bearer <jwt_token>`
- **Token Expiration:** 8 hours (28800 seconds)

### Response Format
All endpoints return JSON with consistent error handling:
```json
// Success Response (varies by endpoint)
{ "data": "...", "message": "..." }

// Error Response  
{ "detail": "Human-readable error message" }
```

### HTTP Status Codes
- `200` - Success
- `201` - Created  
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing JWT)
- `404` - Not Found
- `500` - Internal Server Error

---

## 1. Health & Status Endpoints

### GET `/`
**Purpose:** Basic health check  
**Authentication:** None required  
**Response:**
```json
{ "message": "Q&A Loader API is running" }
```

### GET `/health`  
**Purpose:** Detailed health status for monitoring  
**Authentication:** None required  
**Response:**
```json
{
  "status": "healthy",
  "service": "Q&A Loader Backend"
}
```

---

## 2. Authentication Endpoints

### POST `/api/login`
**Purpose:** Authenticate user and receive JWT token  
**Authentication:** None required  

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "admin",
  "expires_in": 28800
}
```

**Error Response (401):**
```json
{ "detail": "Invalid username or password" }
```

### GET `/api/auth/verify`
**Purpose:** Verify JWT token validity  
**Authentication:** JWT required  

**Success Response (200):**
```json
{
  "username": "admin",
  "valid": true
}
```

---

## 3. Bootstrap Data Endpoints

### GET `/api/bootstrap-data`
**Purpose:** Get initial dashboard data (backward compatible)  
**Authentication:** JWT required  

**Query Parameters:**
- `enhanced` (boolean, optional): If `true`, returns enhanced analytics data

**Basic Response (200):**
```json
{
  "questions": [
    {
      "question_id": "DCF-WACC-D-001",
      "topic": "DCF",
      "subtopic": "WACC",
      "difficulty": "Basic",
      "type": "Definition", 
      "question": "What is WACC?",
      "answer": "Weighted Average Cost of Capital...",
      "notes_for_tutor": null,
      "created_at": "2025-06-09T18:30:00Z",
      "updated_at": "2025-06-09T18:30:00Z"
    }
  ],
  "topics": ["DCF", "Valuation", "M&A"],
  "lastUploadTimestamp": "2025-06-09T18:30:00Z",
  "activityLog": [
    {
      "id": 1,
      "action": "Question Created",
      "details": "DCF-WACC-D-001: What is WACC?",
      "timestamp": "2025-06-09T18:30:00Z"
    }
  ]
}
```

**Enhanced Response (`?enhanced=true`) (200):**
```json
{
  "questions": [ /* same as basic */ ],
  "topics": [ /* same as basic */ ],
  "statistics": {
    "totalQuestions": 150,
    "questionsByDifficulty": {
      "Basic": 50,
      "Intermediate": 60, 
      "Advanced": 40
    },
    "questionsByType": {
      "Definition": 40,
      "Problem": 60,
      "Conceptual": 30,
      "Application": 20
    },
    "questionsByTopic": {
      "DCF": 30,
      "Valuation": 45,
      "M&A": 25
    },
    "recentActivity": 25
  },
  "systemHealth": {
    "status": "healthy",
    "databaseConnected": true,
    "totalStorageUsed": "2.45 MB",
    "questionsCount": 150,
    "activitiesCount": 300,
    "avgResponseTime": 0.05,
    "uptime": "100%"
  },
  "activityTrends": [
    {
      "date": "2025-06-09",
      "dayOfWeek": "Sunday",
      "totalActivities": 25,
      "questionsCreated": 5,
      "activityBreakdown": {
        "Question Created": 5,
        "Search Performed": 15,
        "User Login": 5
      },
      "peakHour": 14,
      "activityChange": 3,
      "questionChange": 2,
      "trend": "up"
    }
  ],
  "lastUploadTimestamp": "2025-06-09T18:30:00Z",
  "activityLog": [ /* same as basic */ ]
}
```

---

## 4. Question Management (CRUD)

### GET `/api/questions`
**Purpose:** Search and filter questions  
**Authentication:** JWT required  

**Query Parameters:**
- `topic` (string, optional): Filter by exact topic match
- `subtopic` (string, optional): Filter by exact subtopic match  
- `difficulty` (string, optional): Filter by difficulty level
- `question_type` (string, optional): Filter by question type
- `search_text` (string, optional): Text search in question content
- `limit` (integer, optional): Maximum results to return

**Example Request:**
```
GET /api/questions?topic=DCF&difficulty=Basic&limit=10
```

**Response (200):**
```json
[
  {
    "question_id": "DCF-WACC-D-001",
    "topic": "DCF", 
    "subtopic": "WACC",
    "difficulty": "Basic",
    "type": "Definition",
    "question": "What is WACC?",
    "answer": "Weighted Average Cost of Capital...",
    "notes_for_tutor": null,
    "created_at": "2025-06-09T18:30:00Z",
    "updated_at": "2025-06-09T18:30:00Z"
  }
]
```

### POST `/api/questions`
**Purpose:** Create a new question  
**Authentication:** JWT required  

**Request Body:**
```json
{
  "topic": "DCF",
  "subtopic": "Terminal Value",
  "difficulty": "Intermediate", 
  "type": "Problem",
  "question": "How do you calculate terminal value using the Gordon Growth Model?",
  "answer": "Terminal Value = FCF × (1 + g) ÷ (WACC - g)",
  "notes_for_tutor": "Emphasize the perpetuity assumption"
}
```

**Response (201):**
```json
{
  "question_id": "DCF-TERMINALVALUE-P-002",
  "topic": "DCF",
  "subtopic": "Terminal Value", 
  "difficulty": "Intermediate",
  "type": "Problem",
  "question": "How do you calculate terminal value using the Gordon Growth Model?",
  "answer": "Terminal Value = FCF × (1 + g) ÷ (WACC - g)",
  "notes_for_tutor": "Emphasize the perpetuity assumption",
  "created_at": "2025-06-10T01:15:00Z",
  "updated_at": "2025-06-10T01:15:00Z"
}
```

### GET `/api/questions/{question_id}`
**Purpose:** Get a single question by ID  
**Authentication:** JWT required  

**Path Parameters:**
- `question_id` (string): Unique question identifier

**Response (200):**
```json
{
  "question_id": "DCF-WACC-D-001",
  "topic": "DCF",
  /* ... full question object ... */
}
```

**Error Response (404):**
```json
{ "detail": "Question with ID 'INVALID-ID' not found" }
```

### PUT `/api/questions/{question_id}`
**Purpose:** Update an existing question  
**Authentication:** JWT required  

**Path Parameters:**
- `question_id` (string): Unique question identifier

**Request Body:** (same format as POST, question_id ignored if provided)
```json
{
  "topic": "DCF",
  "subtopic": "WACC Advanced",
  "difficulty": "Advanced",
  "type": "Problem", 
  "question": "How do you calculate WACC with multiple debt sources?",
  "answer": "WACC = Σ(Wi × Ri × (1-T)) where Wi is weight of each source...",
  "notes_for_tutor": "Cover multiple debt instruments"
}
```

**Response (200):** Updated question object
**Error Response (404):** Question not found

### DELETE `/api/questions/{question_id}`
**Purpose:** Delete a question  
**Authentication:** JWT required  

**Path Parameters:**
- `question_id` (string): Unique question identifier

**Response (200):**
```json
{
  "message": "Question deleted successfully",
  "question_id": "DCF-WACC-D-001"
}
```

### DELETE `/api/questions/bulk`
**Purpose:** Delete multiple questions in a single operation with detailed result tracking
**Authentication:** JWT required
**Safety Limit:** Maximum 100 questions per request

**Request Body:**
```json
{
  "question_ids": [
    "DCF-WACC-D-001",
    "DCF-WACC-D-002", 
    "VAL-COMP-P-003"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "deleted_count": 2,
  "failed_count": 1,
  "deleted_ids": [
    "DCF-WACC-D-001",
    "DCF-WACC-D-002"
  ],
  "failed_ids": [
    "VAL-COMP-P-003"
  ],
  "message": "Partially successful: deleted 2 of 3 questions",
  "errors": {
    "VAL-COMP-P-003": "Question with ID 'VAL-COMP-P-003' not found"
  }
}
```

**Error Response (400):**
```json
{ "detail": "Bulk delete limited to 100 questions per request" }
```

**Error Response (404):**
```json
{
  "success": false,
  "deleted_count": 0,
  "failed_count": 3,
  "deleted_ids": [],
  "failed_ids": ["DCF-WACC-D-001", "DCF-WACC-D-002", "VAL-COMP-P-003"],
  "message": "Failed to delete any questions (0 of 3)",
  "errors": {
    "DCF-WACC-D-001": "Question with ID 'DCF-WACC-D-001' not found",
    "DCF-WACC-D-002": "Question with ID 'DCF-WACC-D-002' not found",
    "VAL-COMP-P-003": "Question with ID 'VAL-COMP-P-003' not found"
  }
}
```

---

## 5. Analytics Endpoints (Phase 5)

### GET `/api/analytics/dashboard`
**Purpose:** Comprehensive dashboard analytics  
**Authentication:** JWT required  

**Response (200):**
```json
{
  "questionMetrics": {
    "total": 150,
    "byDifficulty": {
      "Basic": 50,
      "Intermediate": 60,
      "Advanced": 40
    },
    "byType": {
      "Definition": 40,
      "Problem": 60,
      "Conceptual": 30,
      "Application": 20
    },
    "recentAdditions": 15,
    "averagePerTopic": 25.0
  },
  "activityMetrics": {
    "total": 500,
    "byType": {
      "Question Created": 150,
      "Search Performed": 200,
      "Question Updated": 100,
      "Question Deleted": 25,
      "Login": 25
    },
    "last24Hours": 45,
    "dailyAverage": 16.7,
    "peakHour": 14
  },
  "topicMetrics": {
    "totalTopics": 6,
    "questionsByTopic": {
      "DCF": 30,
      "Valuation": 45,
      "M&A": 25,
      "LBO": 20,
      "Ratios": 20,
      "ESG": 10
    },
    "mostPopulated": ["Valuation", 45],
    "leastPopulated": ["ESG", 10],
    "averageQuestionsPerTopic": 25.0
  },
  "engagementMetrics": {
    "searchFrequency": 200,
    "crudOperations": {
      "creates": 150,
      "updates": 100, 
      "deletes": 25
    },
    "activeDays": 25,
    "engagementScore": 85.5
  },
  "timeMetrics": {
    "lastHour": 5,
    "today": 45,
    "thisWeek": 120,
    "thisMonth": 500
  },
  "generatedAt": "2025-06-10T01:15:00Z"
}
```

### GET `/api/analytics/activity-trends`
**Purpose:** Activity trends over time  
**Authentication:** JWT required  

**Query Parameters:**
- `days` (integer, optional): Number of days to analyze (default: 7, max: 90)

**Example Request:**
```
GET /api/analytics/activity-trends?days=30
```

**Response (200):**
```json
[
  {
    "date": "2025-06-01", 
    "dayOfWeek": "Saturday",
    "totalActivities": 25,
    "questionsCreated": 5,
    "activityBreakdown": {
      "Question Created": 5,
      "Search Performed": 15,
      "User Login": 3,
      "Question Updated": 2
    },
    "peakHour": 14,
    "activityChange": 3,
    "questionChange": 2,
    "trend": "up"
  },
  {
    "date": "2025-06-02",
    "dayOfWeek": "Sunday", 
    "totalActivities": 18,
    "questionsCreated": 3,
    "activityBreakdown": {
      "Question Created": 3,
      "Search Performed": 12,
      "User Login": 2,
      "Question Updated": 1
    },
    "peakHour": 16,
    "activityChange": -7,
    "questionChange": -2,
    "trend": "down"
  }
]
```

### GET `/api/analytics/content`
**Purpose:** Content distribution and coverage analysis  
**Authentication:** JWT required  

**Response (200):**
```json
{
  "distribution": {
    "topicSubtopicBreakdown": {
      "DCF": {
        "WACC": 10,
        "Terminal Value": 8,
        "Free Cash Flow": 12
      },
      "Valuation": {
        "DCF Model": 15,
        "Comparable Companies": 20,
        "Precedent Transactions": 10
      }
    },
    "totalCombinations": 25
  },
  "coverage": {
    "expectedTopics": 6,
    "coveredTopics": 5,
    "missingTopics": ["LBO"],
    "coveragePercentage": 83.3,
    "additionalTopics": ["ESG"]
  },
  "difficultyBalance": {
    "distribution": {
      "Basic": {
        "count": 50,
        "percentage": 33.3,
        "deviation": 0.1
      },
      "Intermediate": {
        "count": 60, 
        "percentage": 40.0,
        "deviation": 6.7
      },
      "Advanced": {
        "count": 40,
        "percentage": 26.7,
        "deviation": 6.6
      }
    },
    "overallBalance": 95.2,
    "recommendation": "Good balance across difficulty levels"
  },
  "typeDistribution": {
    "distribution": {
      "Definition": 40,
      "Problem": 60,
      "Conceptual": 30,
      "Application": 20
    },
    "dominantType": "Problem",
    "leastCommonType": "Application",
    "diversity": 80.0
  }
}
```

### GET `/api/system/health`
**Purpose:** System health and performance monitoring  
**Authentication:** JWT required  

**Response (200):**
```json
{
  "database": {
    "status": "healthy",
    "connectionActive": true,
    "lastQueryTime": "12.5ms",
    "healthScore": 95
  },
  "queryPerformance": {
    "avgTime": 25.3,
    "queries": [
      {
        "type": "simple",
        "time": 12.5,
        "status": "success"
      },
      {
        "type": "filter", 
        "time": 45.2,
        "status": "success"
      },
      {
        "type": "count",
        "time": 18.1,
        "status": "success"
      }
    ],
    "performance": "good"
  },
  "resourceUsage": {
    "storage": {
      "totalMB": 2.45,
      "questionsKB": 300,
      "activitiesKB": 150
    },
    "records": {
      "questions": 150,
      "activities": 300,
      "total": 450
    }
  },
  "apiMetrics": {
    "avgResponseTime": 45.2,
    "successRate": 99.5,
    "errorRate": 0.5,
    "requestsPerMinute": 12
  },
  "timestamp": "2025-06-10T01:15:00Z"
}
```

---

## 6. File Upload Endpoints

### POST `/api/validate-markdown`
**Purpose:** Validate markdown file structure and content without saving to database  
**Authentication:** JWT required  
**Status:** ✅ **FULLY IMPLEMENTED** (Phase 3 Complete)

**Request:** `multipart/form-data`
- `topic` (string): Target topic name for the questions
- `file` (File): Markdown file to validate (.md, .txt extensions allowed, max 10MB)

**File Constraints:**
- **File types:** `.md`, `.txt` extensions only
- **File size:** Maximum 10MB
- **Content:** UTF-8 encoded text
- **Structure:** Must follow required markdown hierarchy

**Success Response (200):**
```json
{
  "is_valid": true,
  "errors": [],
  "warnings": ["Long content in question DCF-WACC-B-001"],
  "parsed_count": 25,
  "line_numbers": {
    "topic": 1,
    "first_subtopic": 3,
    "first_question": 8
  }
}
```

**Validation Error Response (200):**
```json
{
  "is_valid": false,
  "errors": [
    "Missing required '# Topic: [name]' header",
    "Question block 3: Missing '**Brief Answer:**' section",
    "Invalid difficulty 'Medium' on line 15. Must be 'Basic' or 'Advanced'"
  ],
  "warnings": [],
  "parsed_count": 0,
  "line_numbers": {}
}
```

**Error Response (400):**
```json
{ "detail": "Invalid file type. Allowed extensions: .md, .txt" }
```

**Error Response (413):**
```json
{ "detail": "File too large. Maximum size is 10MB" }
```

### POST `/api/upload-markdown`
**Purpose:** Validate and upload questions from markdown file to database  
**Authentication:** JWT required  
**Status:** ✅ **FULLY IMPLEMENTED** (Phase 3 Complete)

**Request:** `multipart/form-data`
- `topic` (string): Target topic name for the questions
- `file` (File): Markdown file to upload

**Processing Logic:**
1. **File Validation**: Checks file type, size, encoding
2. **Content Validation**: Validates markdown structure and question content
3. **ID Generation**: Creates unique semantic IDs (DCF-WACC-B-D-001 format)
4. **Individual Upload**: Processes each question separately with error tracking
5. **Partial Success**: Continues processing even if some questions fail

**Success Response (200):**
```json
{
  "total_attempted": 25,
  "successful_uploads": [
    "DCF-WACC-B-D-001",
    "DCF-WACC-B-D-002",
    "DCF-TERMINALVALUE-A-P-001"
  ],
  "failed_uploads": [],
  "errors": {},
  "warnings": [
    "Question DCF-WACC-B-D-002 has long content (450 characters)"
  ],
  "processing_time_ms": 2340
}
```

**Partial Success Response (200):**
```json
{
  "total_attempted": 25,
  "successful_uploads": [
    "DCF-WACC-B-D-001",
    "DCF-WACC-B-D-002"
  ],
  "failed_uploads": [
    "DCF-WACC-B-P-001"
  ],
  "errors": {
    "DCF-WACC-B-P-001": "Question ID 'DCF-WACC-B-P-001' already exists in database"
  },
  "warnings": [],
  "processing_time_ms": 1890
}
```

**Validation Error Response (400):**
```json
{
  "detail": {
    "message": "File validation failed",
    "errors": [
      "Missing required '# Topic: [name]' header",
      "Question block 2: Missing '**Brief Answer:**' section"
    ],
    "warnings": []
  }
}
```

### POST `/api/topics/{topic}/questions/batch-replace`
**Purpose:** Replace all questions for a topic with new questions (legacy compatibility)  
**Authentication:** JWT required  
**Status:** ✅ **IMPLEMENTED** (Legacy support)

**Path Parameters:**
- `topic` (string): Topic name to replace questions for

**Request Body:**
```json
[
  {
    "subtopic": "WACC",
    "difficulty": "Basic",
    "type": "Definition",
    "question": "What is WACC?",
    "answer": "Weighted Average Cost of Capital..."
  }
]
```

**Response (200):**
```json
{
  "message": "Batch replace completed for topic 'DCF'",
  "successful_count": 23,
  "failed_count": 2,
  "errors": {
    "DCF-WACC-B-D-003": "Question content exceeds maximum length"
  }
}
```

---

## 7. Data Models

### Question Object
```typescript
interface Question {
  question_id: string;         // Auto-generated format: TOPIC-SUBTOPIC-DIFFICULTY-TYPE-SEQUENCE
  topic: string;               // e.g., "DCF", "Valuation"
  subtopic: string;            // e.g., "WACC", "Terminal Value"  
  difficulty: string;          // "Basic", "Advanced" (constraint enforced)
  type: string;                // "Definition", "Problem", "GenConcept", "Calculation", "Analysis"
  question: string;            // Question text
  answer: string;              // Answer text
  notes_for_tutor?: string;    // Optional tutor notes
  created_at: string;          // ISO timestamp
  updated_at: string;          // ISO timestamp
}
```

### Validation Models (Phase 3 Upload Implementation)

#### ValidationResult
```typescript
interface ValidationResult {
  is_valid: boolean;           // Whether validation passed completely
  errors: string[];            // Array of validation error messages
  warnings: string[];          // Array of validation warning messages
  parsed_count: number;        // Number of questions successfully parsed
  line_numbers?: Record<string, number>; // Line numbers for error reporting
}
```

#### BatchUploadResult
```typescript
interface BatchUploadResult {
  total_attempted: number;     // Total number of questions attempted for upload
  successful_uploads: string[]; // Array of question IDs that uploaded successfully
  failed_uploads: string[];    // Array of question IDs that failed to upload
  errors: Record<string, string>; // Map of question ID to error message for failures
  warnings: string[];          // Array of warning messages from validation
  processing_time_ms: number;  // Server processing time in milliseconds
}
```

#### ParsedQuestion (Upload Request Model)
```typescript
interface ParsedQuestion {
  subtopic: string;            // Question subtopic within the main topic
  difficulty: string;          // Question difficulty level ("Basic" | "Advanced")
  type: string;                // Question type (see allowed types above)
  question: string;            // The question text content
  answer: string;              // The answer text content
  notes_for_tutor?: string;    // Optional notes for tutors
}
```

### Legacy Models

#### Activity Log Item
```typescript
interface ActivityLogItem {
  id: number;                  // Auto-generated
  action: string;              // e.g., "Question Created", "Search Performed"
  details?: string;            // Additional context
  timestamp: string;           // ISO timestamp
}
```

#### Login Request/Response
```typescript
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  username: string;
  expires_in: number;          // Seconds (28800 = 8 hours)
}
```

#### Bulk Delete Request/Response
```typescript
interface BulkDeleteRequest {
  question_ids: string[];      // Array of question IDs to delete (max 100)
}

interface BulkDeleteResponse {
  success: boolean;            // Overall success status
  deleted_count: number;       // Number of questions successfully deleted
  failed_count: number;        // Number of questions that failed to delete
  deleted_ids: string[];       // Array of successfully deleted question IDs
  failed_ids: string[];        // Array of question IDs that failed to delete
  message: string;             // Human-readable summary of the operation
  errors?: Record<string, string>; // Question ID to error message mapping
}
```

### Frontend/Backend Field Mapping (Critical Implementation Detail)

**⚠️ Important:** The backend uses `snake_case` field names while the frontend expects `camelCase`. The API responses use the following mapping:

#### Backend Response Fields → Frontend Expected Fields:
```typescript
// Backend API Response (snake_case)
{
  "is_valid": true,           // → isValid (frontend)
  "parsed_count": 25,         // → parsedCount (frontend)  
  "processing_time_ms": 1500, // → processingTimeMs (frontend)
  "successful_uploads": [],   // → successfulUploads (frontend)
  "failed_uploads": [],       // → failedUploads (frontend)
}

// Question Field Mapping:
{
  "question_id": "DCF-001",   // → id (frontend)
  "question": "What is...?",  // → questionText (frontend)
  "answer": "It is...",       // → answerText (frontend)
  // Other fields remain the same
}
```

**Implementation Note:** The frontend includes transformation logic to convert snake_case to camelCase for seamless integration.

---

## 8. Upload Workflow & ID Generation System (Phase 3 Implementation)

### Semantic Question ID Format
**Pattern:** `{TOPIC}-{SUBTOPIC}-{DIFFICULTY}-{TYPE}-{SEQUENCE}`

**Examples:**
- `DCF-WACC-B-D-001` (DCF, WACC, Basic, Definition, sequence 001)
- `VALUATION-COMPS-A-P-015` (Valuation, Comparable Companies, Advanced, Problem, sequence 015)
- `MA-SYNERGIES-B-G-003` (M&A, Synergies, Basic, GenConcept, sequence 003)

### ID Component Generation Rules

#### Topic Normalization:
- Extract abbreviations from parentheses: "Discounted Cash Flow (DCF)" → "DCF"
- Remove spaces and special characters: "M&A Transactions" → "MA"
- Uppercase standardization: "dcf" → "DCF"

#### Subtopic Normalization:
- Remove articles and prepositions: "Weighted Average Cost of Capital" → "WEIGHTEDAVERAGECOSTCAPITAL"
- Truncate to reasonable length: "WEIGHTEDAVERAGECOSTCAPITAL" → "WACC"
- Handle spaces: "Terminal Value" → "TERMINALVALUE"

#### Type Code Mapping:
```typescript
{
  "Definition": "D",
  "Problem": "P", 
  "GenConcept": "G",
  "Calculation": "C",
  "Analysis": "A"
}
```

#### Difficulty Code Mapping:
```typescript
{
  "Basic": "B",
  "Advanced": "A"
}
```

#### Sequence Generation:
- Query database for existing IDs with same base pattern
- Find highest sequence number for pattern `{TOPIC}-{SUBTOPIC}-{DIFFICULTY}-{TYPE}-*`
- Increment by 1 and zero-pad to 3 digits (001, 002, 015, etc.)
- Handle uniqueness conflicts with retry logic

### Upload Processing Flow

#### 1. Validation Phase:
```
File Upload → File Type Check → Size Check → UTF-8 Encoding Check
     ↓
Markdown Structure Validation → Question Block Parsing → Content Validation
     ↓
Return ValidationResult (without database operations)
```

#### 2. Upload Phase:
```
Re-validate File → Parse Questions → Generate Unique IDs for Each Question
     ↓
Process Questions Individually → Database INSERT with Error Tracking
     ↓
Return BatchUploadResult with Success/Failure Details
```

#### 3. Error Handling Strategy:
- **Partial Success Support**: Continue processing even if some questions fail
- **Individual Error Tracking**: Map each question ID to specific error message
- **Database Error Translation**: Convert technical database errors to user-friendly messages
- **Rollback Prevention**: No transactions used to allow partial success

### Validation Requirements

#### File Structure Requirements:
```markdown
# Topic: [Topic Name]

## Subtopic (optional details): [Subtopic Name]

### Difficulty: Basic|Advanced

#### Type: Definition|Problem|GenConcept|Calculation|Analysis

**Question:** [Question text content]

**Brief Answer:** [Answer text content]
```

#### Content Constraints:
- **Difficulty**: Must be exactly "Basic" or "Advanced"
- **Type**: Must be one of the 5 allowed types
- **Question/Answer**: Cannot be empty after trimming whitespace
- **Topic/Subtopic**: Maximum 100 characters each
- **File Size**: Maximum 10MB
- **Encoding**: Must be valid UTF-8

#### Database Constraints (Enforced):
```sql
-- Difficulty constraint
CHECK (difficulty IN ('Basic', 'Advanced'))

-- Type constraint  
CHECK (type IN ('Definition', 'Problem', 'GenConcept', 'Calculation', 'Analysis'))

-- Content constraints
CHECK (LENGTH(TRIM(question)) > 0)
CHECK (LENGTH(TRIM(answer)) > 0)

-- Unique ID constraint
PRIMARY KEY (question_id)
```

---

## 9. Error Handling

### Standard Error Response
```json
{ "detail": "Human-readable error message" }
```

### Common Error Scenarios

**401 Unauthorized:**
```json
{ "detail": "Invalid authentication credentials" }
```

**400 Bad Request:**
```json
{ "detail": "Validation error: Field 'topic' is required" }
```

**404 Not Found:**
```json
{ "detail": "Question with ID 'INVALID-ID' not found" }
```

**500 Internal Server Error:**
```json
{ "detail": "Failed to load bootstrap data: Database connection error" }
```

---

## 9. Authentication Flow

1. **Login:** POST `/api/login` with credentials
2. **Get Token:** Extract `access_token` from response
3. **Use Token:** Include in all subsequent requests as `Authorization: Bearer <token>`
4. **Verify:** Optionally call `/api/auth/verify` to check token validity
5. **Refresh:** Re-login when token expires (8 hours)

---

## 10. Activity Logging & Analytics

The system automatically logs various activities:

- **User Sessions:** Login events with timestamps
- **Question Operations:** Create, update, delete with question IDs
- **Bulk Operations:** Bulk delete operations with counts and affected question IDs
- **Search Queries:** Filters used, result counts, response times
- **System Events:** Server startup, performance alerts
- **Database Operations:** Query types and performance metrics

**Bulk Delete Activity Logging:**
- Logs successful bulk deletions with count and first 3 question IDs
- Tracks partial success scenarios with both success and failure counts
- Records operation details for audit trail and system monitoring

These logs power the analytics endpoints for dashboard insights and system monitoring.

---

## 11. Development Notes

### Environment Variables Required
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key  
JWT_SECRET_KEY=your_jwt_secret_key
ADMIN_PASSWORD=admin123
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480
```

### CORS Configuration
- Allows origins: `http://localhost:3000`, `http://localhost:5173`
- Supports all methods and headers for development

### Database Tables
- `all_questions`: Question storage with indexes on topic, subtopic, difficulty, type
- `activity_log`: Activity logging with timestamp indexes

### Important Implementation Notes
- **Route Order Critical:** Bulk endpoints (`/questions/bulk`) must be defined BEFORE parameterized routes (`/questions/{question_id}`) in FastAPI to prevent routing conflicts
- **Safety Limits:** Bulk delete operations are limited to 100 questions per request to prevent accidental mass deletions
- **Error Handling:** Bulk operations use partial success patterns - individual failures don't stop the entire operation
- **Activity Logging:** All bulk operations are logged with detailed information for audit trails

### Phase 3 Upload Implementation Notes (NEW)
- **File Processing:** Multipart/form-data handled with FastAPI `File()` and `Form()` dependencies
- **Validation Service:** Comprehensive markdown parsing with regex pattern matching for required structure
- **ID Generation:** Semantic ID generation with collision detection and unique sequence management
- **Partial Success:** Upload operations continue processing even if individual questions fail
- **Field Mapping:** Backend uses snake_case, frontend expects camelCase - transformation layer implemented
- **Error Translation:** Database errors converted to user-friendly messages with recovery guidance

### Performance Characteristics (Measured)
- **File Validation:** <1 second for 100 questions
- **Upload Processing:** 2-3 seconds for 89 questions (real production test)
- **Memory Usage:** <50MB per upload operation
- **Concurrent Support:** Tested with multiple simultaneous uploads

### Security Implementation
- **File Type Validation:** Restricted to .md and .txt extensions only
- **Size Limits:** 10MB maximum file size enforced
- **Content Validation:** UTF-8 encoding requirement prevents binary injection
- **Authentication:** All upload endpoints require valid JWT tokens
- **Input Sanitization:** All user input validated before database operations

---

## 12. Production Readiness Status

### ✅ **PHASE 3 COMPLETE - PRODUCTION READY**

This documentation covers all endpoints implemented through **Phase 3** of backend development (upload workflow complete). The API provides:

### **Core Capabilities:**
- ✅ **Complete Question Management** - Full CRUD operations with bulk delete support
- ✅ **Advanced Upload Workflow** - Validation-first approach with detailed error reporting
- ✅ **Semantic ID Generation** - Human-readable question IDs with uniqueness guarantees
- ✅ **Robust Error Handling** - Partial success support with individual error tracking
- ✅ **Comprehensive Analytics** - Dashboard metrics and system monitoring
- ✅ **JWT-based Security** - Production-ready authentication with proper error handling

### **Tested & Verified:**
- ✅ **Real Database Operations** - Tested with 89 questions uploaded to production Supabase
- ✅ **Error Recovery** - Validation errors properly reported with recovery guidance
- ✅ **Field Mapping** - Backend/frontend integration verified with proper data transformation
- ✅ **Authentication Flow** - JWT token handling tested across all protected endpoints

### **Next Enhancement Phase Available:**
- 🔄 **Question Metadata** - "loaded_by" and "loaded_at" attributes ready for implementation
- 📊 **Enhanced Analytics** - Additional dashboard metrics and reporting capabilities
- 🚀 **Performance Optimization** - Caching and pagination for large datasets

**🎯 Status:** Core question upload and management workflow is fully functional and production-ready.
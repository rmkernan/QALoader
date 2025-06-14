# Q&A Loader Backend API Documentation - Complete

**Purpose:** Comprehensive specification of all backend API endpoints for Phases 1-5  
**Created:** June 10, 2025. 9:47 a.m. Eastern Time  
**Updated:** June 14, 2025. 11:32 a.m. Eastern Time - Added bulk delete operations and enhanced safety features
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

### POST `/api/upload-markdown`
**Purpose:** Upload and process Markdown files  
**Authentication:** JWT required  
**Status:** Partially implemented (placeholder in Phase 1)

**Request:** `multipart/form-data`
- `file`: Markdown file
- `topic`: Target topic name

**Response (501):**
```json
{ "detail": "Markdown upload not yet implemented" }
```

---

## 7. Data Models

### Question Object
```typescript
interface Question {
  question_id: string;         // Auto-generated format: TOPIC-SUBTOPIC-TYPE-001
  topic: string;               // e.g., "DCF", "Valuation"
  subtopic: string;            // e.g., "WACC", "Terminal Value"  
  difficulty: string;          // "Basic", "Intermediate", "Advanced"
  type: string;                // "Definition", "Problem", "Conceptual", etc.
  question: string;            // Question text
  answer: string;              // Answer text
  notes_for_tutor?: string;    // Optional tutor notes
  created_at: string;          // ISO timestamp
  updated_at: string;          // ISO timestamp
}
```

### Activity Log Item
```typescript
interface ActivityLogItem {
  id: number;                  // Auto-generated
  action: string;              // e.g., "Question Created", "Search Performed"
  details?: string;            // Additional context
  timestamp: string;           // ISO timestamp
}
```

### Login Request/Response
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

### Bulk Delete Request/Response
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

---

## 8. Error Handling

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

---

This documentation covers all endpoints implemented through Phase 5 of backend development. The API provides comprehensive question management, analytics, and system monitoring capabilities with JWT-based security.
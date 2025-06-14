# QALoader Architecture Map

**Purpose:** Comprehensive technical reference for the QALoader project structure, patterns, and development workflows  
**Created:** June 13, 2025. 10:03 a.m. Eastern Time  
**Updated:** June 14, 2025. 11:53 a.m. Eastern Time - Simplified and streamlined for practical use
**Updated:** June 14, 2025. 12:04 p.m. Eastern Time - Added Question Upload validation workflow patterns and frontend service integration

---

## 🏗️ System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │ Supabase Database│
│   (TypeScript)   │◄──►│    (Python)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ Port: 5173/3000 │    │  Port: 8000     │    │  Cloud Hosted   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Communication:** REST API with JWT authentication  
**Data Flow:** Frontend → API Routes → Services → Database → Response Chain

---

## 📁 Backend Architecture (FastAPI)

```
backend/app/
├── main.py                 # 🚪 ENTRY POINT - CORS, routing, startup
│   ├── Dependencies: FastAPI, CORSMiddleware, routers, database
│   └── Impact Radius: ALL API operations
│
├── config.py               # ⚙️ CONFIGURATION - Environment settings
│   ├── Dependencies: pydantic-settings, python-dotenv
│   └── Impact Radius: Database connection, JWT auth, admin access
│
├── database.py             # 🗄️ DATABASE LAYER - Supabase client
│   ├── Dependencies: supabase-py, config.py
│   └── Impact Radius: ALL data operations
│
├── models/                 # 📝 DATA MODELS - Request/Response schemas
│   ├── auth.py            # JWT, login/logout models
│   ├── question.py        # Question CRUD models
│   ├── question_bulk.py   # Bulk operations models
│   └── __init__.py        # Model exports
│   Impact Radius: API validation, type safety
│
├── routers/               # 🛣️ API ROUTES - Endpoint handlers
│   ├── auth.py           # Authentication endpoints
│   ├── questions.py      # Question CRUD endpoints  
│   ├── upload.py         # File upload processing
│   └── __init__.py       # Router exports
│   Impact Radius: Frontend API calls, business logic entry
│
├── services/             # 🔧 BUSINESS LOGIC - Core operations
│   ├── auth_service.py   # JWT validation, admin login
│   ├── question_service.py # Question management, filtering
│   ├── analytics_service.py # Data analysis, metrics
│   ├── validation_service.py # ✅ Markdown validation and parsing
│   └── __init__.py       # Service exports
│   Impact Radius: Data processing, business rules
│
└── utils/                # 🛠️ UTILITIES - Helper functions
    ├── id_generator.py   # ✅ Semantic question ID generation
    └── __init__.py       # Utility exports
    Impact Radius: Code reuse, common operations
```

---

## 📁 Frontend Architecture (React + TypeScript)

```
src/
├── App.tsx                 # 🏠 ROOT COMPONENT - App shell, routing
│   ├── Dependencies: React Context, Components, Toast
│   └── Impact Radius: ALL UI rendering
│
├── components/             # 🧩 UI COMPONENTS - User interface
│   ├── DashboardView.tsx  # Analytics dashboard
│   ├── LoaderView.tsx     # File upload interface
│   ├── CurationView.tsx   # Question management
│   ├── LoginView.tsx      # Authentication UI
│   ├── QuestionModal.tsx  # Question edit/view modal
│   ├── Sidebar.tsx        # Navigation menu
│   └── icons/             # Icon components
│   Impact Radius: User experience, interface consistency
│
├── contexts/              # 🌐 STATE MANAGEMENT - Global state
│   └── AppContext.tsx     # Authentication, app state
│   Impact Radius: Component communication, state consistency
│
├── services/              # 🔌 API INTEGRATION - Backend communication
│   ├── api.ts            # HTTP client, API calls
│   ├── auth.ts           # Authentication service
│   └── validation.ts     # ✅ Client-side markdown validation
│   Impact Radius: Data fetching, error handling
│
├── types.ts               # 📋 TYPE DEFINITIONS - TypeScript interfaces
│   Impact Radius: Type safety, development experience
│
├── constants.ts           # 📌 CONSTANTS - Configuration values
│   Impact Radius: App configuration, magic numbers
│
└── main.tsx              # 🎯 ENTRY POINT - React app initialization
    Impact Radius: App bootstrapping, global setup
```

---

## 🔗 Key Dependencies

### Backend Dependencies
```python
# Core Framework
fastapi==0.104.1          # Web framework, API routing
uvicorn[standard]==0.24.0 # ASGI server, development

# Database & Auth
supabase==2.0.0           # Database client, real-time subscriptions
python-jose[cryptography]==3.3.0  # JWT token handling
python-multipart==0.0.6   # File upload support

# Data Validation
pydantic==2.5.0           # Request/response validation
pydantic-settings==2.1.0  # Configuration management

# Development & Testing
python-dotenv==1.0.0      # Environment variable loading
pytest==7.4.3            # Testing framework
httpx==0.24.1             # HTTP client for testing
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "@google/genai": "^1.4.0",     // AI integration (future)
    "react": "^19.1.0",           // UI framework
    "react-dom": "^19.1.0",       // DOM rendering
    "react-hot-toast": "^2.4.1"   // User notifications
  },
  "devDependencies": {
    "@types/node": "^22.14.0",              // Node.js types
    "@types/react": "^19.1.6",              // React types
    "@types/react-dom": "^19.1.6",          // React DOM types
    "@typescript-eslint/eslint-plugin": "^8.34.0", // Linting
    "@typescript-eslint/parser": "^8.34.0", // TypeScript parsing
    "eslint": "^9.28.0",                    // Code linting
    "typescript": "~5.7.2",                // TypeScript compiler
    "vite": "^6.2.0"                       // Build tool, dev server
  }
}
```

---

## 🔄 Development Workflow Patterns

### Adding New API Endpoint
```
Flow: Route → Service → Model → Database → Test
Files: routers/{feature}.py → services/{feature}_service.py → models/{feature}.py
Impact: Frontend API calls, data validation, business logic
Context Files: main.py (router registration), database.py (queries)
```

### Adding New UI Component  
```
Flow: Component → Types → Context → Service → Integration
Files: components/{Feature}.tsx → types.ts → AppContext.tsx → services/api.ts
Impact: User interface, state management, backend communication
Context Files: App.tsx (routing), Sidebar.tsx (navigation)
```

### Modifying Data Model
```
Flow: Model → Service → Route → Frontend Types → UI
Files: models/{feature}.py → services/{feature}_service.py → types.ts → components/
Impact: Database schema, API contracts, frontend rendering
Context Files: database.py (queries), migration scripts
```

### Authentication Changes
```
Flow: Auth Service → Route Guards → Frontend Context → UI Updates
Files: auth_service.py → routers/auth.py → AppContext.tsx → LoginView.tsx
Impact: Security, user access, session management
Context Files: config.py (JWT settings), middleware configuration
```

### Password Reset Flow
```
Flow: Email Request → Token Generation → Email Delivery → Token Validation → Password Update → Login
Files: auth_service.py → routers/auth.py → api.ts → PasswordResetView.tsx → AppContext.tsx
Impact: User account recovery, enhanced security, email integration
Context Files: config.py (email settings), models/auth.py (token schema)
```

### Bulk Delete Operations
```
Flow: UI Selection → Confirmation Modal → Bulk API Call → Batch Deletion → State Update → Activity Log
Files: CurationView.tsx → api.ts → routers/questions.py → question_service.py → models/question_bulk.py
Impact: Mass data management, UI state management, database operations, audit logging
Context Files: AppContext.tsx (state management), types.ts (interface definitions)
Features: Safety confirmation for >10 items, preview of items to delete, partial success handling
```

### ✅ Question Upload Validation Workflow
```
Flow: File Selection → Client Validation → Server Validation → ID Generation → Individual Upload → Result Processing
Files: LoaderView.tsx → validation.ts → AppContext.tsx → api.ts → upload.py → validation_service.py → id_generator.py
Impact: File upload workflow, validation-first approach, individual question tracking, error handling
Context Files: types.ts (ValidationResult, BatchUploadResult), constants.ts (file constraints)
Features: Two-step validation, partial success handling, semantic ID generation, detailed error feedback
```

---

## 📋 Task-Specific File Reference

### API Development Tasks
**Primary Files:**
- `backend/app/routers/{feature}.py` - Route handlers
- `backend/app/services/{feature}_service.py` - Business logic
- `backend/app/models/{feature}.py` - Data models

**Supporting Files:**
- `backend/app/main.py` - Router registration
- `backend/app/database.py` - Database operations
- `backend/app/config.py` - Environment settings

### Frontend Component Development
**Primary Files:**
- `src/components/{Feature}View.tsx` - Main component
- `src/contexts/AppContext.tsx` - State management
- `src/types.ts` - Type definitions

**Supporting Files:**
- `src/services/api.ts` - Backend integration
- `src/constants.ts` - Configuration
- `src/App.tsx` - Routing integration

### Authentication/Security Tasks
**Primary Files:**
- `backend/app/routers/auth.py` - Auth endpoints
- `backend/app/services/auth_service.py` - Auth business logic
- `backend/app/models/auth.py` - Auth data models

**Supporting Files:**
- `src/contexts/AppContext.tsx` - Frontend auth state
- `src/components/LoginView.tsx` - Login UI
- `backend/app/config.py` - JWT configuration

### Database Schema Changes
**Primary Files:**
- `backend/app/models/` - Data models
- `backend/app/services/` - Business logic updates
- `backend/create_tables.py` - Schema migration

**Supporting Files:**
- `backend/app/database.py` - Connection handling
- Database documentation in `Docs/`

### ✅ File Upload & Validation Tasks
**Primary Files:**
- `backend/app/routers/upload.py` - Upload endpoints (/validate-markdown, /upload-markdown)
- `backend/app/services/validation_service.py` - Markdown parsing and validation
- `backend/app/utils/id_generator.py` - Semantic question ID generation
- `src/services/validation.ts` - Client-side format validation

**Supporting Files:**
- `backend/app/models/question.py` - ValidationResult, BatchUploadResult models
- `src/types.ts` - TypeScript interface definitions
- `src/contexts/AppContext.tsx` - Upload workflow integration
- `src/services/api.ts` - API endpoint functions

### Deployment Tasks
**Primary Files:**
- `Docs/DEPLOYMENT.md` - Deployment guide
- `package.json` - Scripts and dependencies
- `backend/requirements.txt` - Python dependencies

**Supporting Files:**
- `backend/app/config.py` - Environment configuration
- `README.md` - Setup instructions
- `.env` files - Environment variables

---

## 📊 Change Impact Analysis

### High Impact Changes (Affects Multiple Systems)
- **Database Schema**: Models → Services → Routes → Frontend Types → UI
- **Authentication Logic**: Auth Service → All Protected Routes → Frontend Context → All Views
- **API Structure**: Route Changes → Service Layer → Frontend Services → Components

### Medium Impact Changes (Affects One System)
- **UI Components**: Single View → Related Components → Context Integration
- **Business Logic**: Service Layer → Related Routes → Frontend Integration
- **Configuration**: Settings → Affected Services → Environment Setup

### Low Impact Changes (Localized)
- **Styling**: Single Component → CSS/Tailwind Updates
- **Utility Functions**: Helper Methods → Direct Consumers
- **Documentation**: Specific Docs → Related Guidance

### Dependency Chain Examples
```
Configuration Change → Environment Settings → Service Initialization → Route Availability → Frontend Functionality

Data Model Change → Database Schema → Service Logic → API Response → Frontend Types → UI Rendering

Authentication Change → Token Validation → Route Protection → Context State → Component Access → User Experience
```

---

## 🔍 Established Code Patterns

### Backend Patterns
1. **Service Layer Pattern**: Business logic separated from routes
2. **Dependency Injection**: Database client injected via FastAPI dependencies  
3. **Pydantic Validation**: Request/response models for type safety
4. **JWT Authentication**: Token-based auth with admin fallback
5. **CORS Configuration**: Frontend integration with specific origins
6. **✅ Validation-First Pattern**: File validation before database operations
7. **✅ Individual Processing Pattern**: Process items individually for partial success

### Frontend Patterns
1. **Context Provider Pattern**: Global state management via React Context
2. **Component Composition**: Reusable UI components with TypeScript props
3. **Service Layer**: API calls abstracted into service functions
4. **Error Boundary Pattern**: Graceful error handling with user feedback
5. **Responsive Design**: Mobile-first approach with Tailwind CSS
6. **✅ Two-Step Validation Pattern**: Client format validation → Server content validation
7. **✅ Detailed Error Feedback Pattern**: User-friendly error categorization and guidance

### Integration Patterns
1. **RESTful API**: Standard HTTP methods with JSON payloads
2. **JWT Token Flow**: Login → Token → Protected Route → Response
3. **Error Handling**: Consistent error format across API and UI
4. **Loading States**: UI feedback during async operations
5. **Type Safety**: Shared data contracts between frontend and backend
6. **✅ File Upload Pattern**: FormData → Validation → Processing → Detailed Results
7. **✅ Semantic ID Pattern**: Human-readable question IDs with uniqueness guarantee

---

## 🎯 Documentation-Driven Context Discovery

### **Leveraging Rich File Headers**

Every code file contains comprehensive documentation headers that provide instant context understanding:

#### **File Header Information Available:**
```
@file - Exact file path and purpose
@description - What the file does and why it exists
@architectural-context - Layer, Dependencies, Pattern
@workflow-context - User Journey, Sequence Position, Inputs/Outputs
@authentication-context - Security requirements and implications
@database-context - Tables accessed, operations performed (if applicable)
```

#### **Smart Discovery Workflow:**
1. **Start with file headers** - They contain the architectural context you need
2. **Use @workflow-context** - Understand how files connect to user journeys  
3. **Check @authentication-context** - Understand security scope and requirements
4. **Review dependencies** - See what other files/services are involved
5. **Reference this map** only for cross-component relationship details

#### **Example Discovery Scenarios:**

**Authentication Issues:**
```
Read: backend/app/services/auth_service.py header
@authentication-context: "This IS the authentication service - handles password verification, token generation, and reset flow"
@workflow-context: "Called by auth router for login, token validation, and password reset operations"
Result: You immediately know this is the core auth file and what it handles
```

**API Integration Problems:**
```
Read: src/services/api.ts header  
@architectural-context: "Service layer abstraction with consistent error handling and response formatting"
@authentication-context: "Some endpoints require JWT token in Authorization header"
Result: You understand this handles all backend communication and auth token attachment
```

**Database Schema Questions:**
```
Read: backend/app/models/question.py header
@database-context: "Tables: Questions table for storing Q&A data with metadata"
@architectural-context: "Data Models (Pydantic schemas)"
Result: You know this defines the database structure and validation rules
```

### **Documentation Standards Advantage**

The comprehensive documentation standards mean:
- **No guessing** about file purpose or relationships
- **Instant context** about security implications and auth requirements
- **Clear workflow understanding** of how files fit into user journeys
- **Dependency awareness** of what other files/services are involved
- **Impact assessment** through documented architectural context

This documentation-first approach makes Project Radar dramatically more effective than algorithmic file discovery.

---

## 📚 Documentation References

### Backend Development
- **Context Guide**: `backend/BACKEND_CONTEXT.md`
- **API Documentation**: `Docs/APIs_COMPLETE.md`
- **Development Guidelines**: `backend/CLAUDE.md`

### Frontend Development
- **Component Guidelines**: `src/CLAUDE.md`
- **Project Overview**: `PROJECT_OVERVIEW.md`
- **Type Definitions**: `src/types.ts`

### Deployment & Configuration
- **Deployment Guide**: `Docs/DEPLOYMENT.md`
- **Project Status**: `Docs/ProjectStatus.md`
- **Setup Instructions**: `README.md`

---

*This architecture map provides comprehensive technical reference for understanding QALoader's structure, patterns, and development workflows. Use PROJECT_INDEX.md for quick orientation, then reference specific sections here for detailed technical context.*
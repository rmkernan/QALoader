# QALoader Project Index

**Created:** June 14, 2025. 11:53 a.m. Eastern Time  
**Updated:** June 14, 2025. 2:37 p.m. Eastern Time - Phase 3 completion update with production-ready upload workflow, validation services, and enhanced API endpoints
**Purpose:** Quick orientation guide for new Claude instances working on the QALoader project  
**Type:** Lightweight reference and navigation guide  

---

## 🎯 Project Overview

**QALoader** is a Q&A management system for creating, organizing, and analyzing question sets.

**Architecture:** React Frontend (TypeScript) → FastAPI Backend (Python) → Supabase Database (PostgreSQL)  
**Ports:** Frontend: 5173/3000, Backend: 8000, Database: Cloud hosted  
**Status:** Phase 3 Complete - Production Ready (95% Core Application Functional)  

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │ Supabase Database│
│   (TypeScript)   │◄──►│    (Python)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ Port: 5173/3000 │    │  Port: 8000     │    │  Cloud Hosted   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📁 Key Directories

### Frontend (`src/`)
- **components/** - UI components (LoginView, CurationView, DashboardView, LoaderView)
- **contexts/AppContext.tsx** - Global state management, upload workflow integration
- **services/** - Backend communication (api.ts), client-side validation (validation.ts)
- **types.ts** - TypeScript definitions, upload workflow types (ValidationResult, BatchUploadResult)

### Backend (`backend/app/`)
- **routers/** - API endpoints (auth.py, questions.py, upload.py)
- **services/** - Business logic (auth_service.py, question_service.py, analytics_service.py, validation_service.py)
- **models/** - Data validation (auth.py, question.py, question_bulk.py)
- **utils/** - Helper functions (id_generator.py for semantic question IDs)
- **main.py** - Application entry point
- **config.py** - Environment settings
- **database.py** - Supabase client

---

## 🔍 Quick File Lookup

### Working on Authentication?
**Start with:** ARCHITECTURE_MAP.md → "Authentication/Security Tasks" section  
**Key files:** `backend/app/services/auth_service.py`, `backend/app/routers/auth.py`, `src/components/LoginView.tsx`

### Working on File Upload/Validation?
**Start with:** ARCHITECTURE_MAP.md → "Question Upload Validation Workflow" section  
**Key files:** `backend/app/routers/upload.py`, `backend/app/services/validation_service.py`, `backend/app/utils/id_generator.py`, `src/components/LoaderView.tsx`, `src/services/validation.ts`

### Adding API Endpoints?
**Start with:** ARCHITECTURE_MAP.md → "Adding New API Endpoint" pattern  
**Key files:** `backend/app/routers/`, `backend/app/services/`, `backend/app/models/`

### Frontend Component Work?
**Start with:** ARCHITECTURE_MAP.md → "Frontend Component Development" section  
**Key files:** `src/components/`, `src/contexts/AppContext.tsx`, `src/types.ts`

### Database Changes?
**Start with:** ARCHITECTURE_MAP.md → "Database Operations" section  
**Key files:** `backend/app/models/`, `backend/app/services/`, `backend/app/database.py`

### Deployment Issues?
**Start with:** ARCHITECTURE_MAP.md → "Deployment Tasks" section  
**Key files:** `Docs/DEPLOYMENT.md`, `backend/app/config.py`, `package.json`

---

## 🛠️ Common Development Patterns

### Adding New Feature
1. **Backend:** Router → Service → Model → Database
2. **Frontend:** Component → Types → Context → API Integration
3. **See:** ARCHITECTURE_MAP.md → "Development Workflow Patterns" section

### File Upload Workflow (Production-Ready)
1. **Client Validation:** Format checking → Error feedback
2. **Server Validation:** Content parsing → Structure validation → Error reporting
3. **Upload Processing:** ID generation → Individual question processing → Batch results
4. **Status:** ✅ Complete - Tested with 89-question production upload

### Fixing Bugs
1. **Identify area:** Auth, API, Frontend, Database
2. **Read relevant section** in ARCHITECTURE_MAP.md
3. **Check impact radius** before making changes

---

## 📚 Deep Dive References

### Comprehensive Technical Details
- **ARCHITECTURE_MAP.md** - Complete system architecture, dependencies, and patterns
- **../CLAUDE.md** - Development guidelines and coding standards
- **Docs/APIs_COMPLETE.md** - Backend API documentation
- **README.md** - Setup and installation instructions

### Specific Feature Documentation
- **Backend Context:** `backend/BACKEND_CONTEXT.md`
- **Upload Implementation:** `Docs/Workflows/QuestionUpload_ImplementationPlan.md` (Phase 3 Complete)
- **Backend Design:** `Docs/BackendDesign.md` (Updated with Phase 3 validation workflow)
- **Deployment Guide:** `Docs/DEPLOYMENT.md` (Updated with upload configuration)
- **Project Status:** `Docs/ProjectStatus.md`

---

## 🚀 Getting Started Workflow

1. **Read this index** (you're here!)
2. **Ask clarifying questions** to efficiently target the right context:
   - "What specific behavior are you seeing?"
   - "What were you trying to do when this happened?"
   - "Is this a UI issue, data loading problem, or error message?"
3. **Use answers to identify task area** via Quick File Lookup above
4. **Read relevant file headers** for instant architectural context
5. **Load targeted files** based on the specific problem scope

### Smart Questioning Examples:
```
User: "Problem with Manage Content page"
→ Ask: What specific issue? UI not working? Data not loading? Error message?

User: "Authentication isn't working"  
→ Ask: Can't log in? Logged in but API calls fail? Session timing out?

User: "File upload not working"
→ Ask: Format validation failing? Server validation errors? Upload process hanging?

User: "Want to add new feature"
→ Ask: Frontend UI? Backend API? Database changes? All of the above?
```

---

## 💡 Leveraging Rich Documentation

**Every code file has detailed headers** with:
- **@architectural-context** - Layer, Dependencies, Pattern
- **@workflow-context** - User Journey, Sequence Position, Inputs/Outputs  
- **@authentication-context** - Security requirements and implications
- **@database-context** - Tables accessed, operations performed

**Smart Context Discovery:**
1. **Read file headers first** - They contain architectural context that explains purpose and relationships
2. **Check @workflow-context** - Understand how files fit into user journeys
3. **Review @authentication-context** - Understand security implications
4. **Use @database-context** - See what data operations are involved

### Example Header-Based Discovery:
```
User: "Why is login working but data loading fails?"
→ Read src/contexts/AppContext.tsx header
→ @authentication-context shows: "JWT token-based API authentication"  
→ @workflow-context shows: "fetchInitialData attempts real API call with fallbacks"
→ You immediately understand: Need to check JWT token handling in API calls
```

## 💡 When to Use Full Project Radar

**Use simple tools + file headers** for:
- Finding specific files and understanding their purpose
- Reading configuration with architectural context
- Single-component issues with clear scope
- Clear error messages with known file locations
- Basic upload workflow troubleshooting

**Load ARCHITECTURE_MAP.md sections** for:
- Understanding cross-component relationships
- Complex integration workflows (like validation-first upload)
- Major architectural decisions
- System-wide pattern analysis
- Upload workflow implementation details
- Production deployment considerations

## 🎯 Production-Ready Status Overview

**✅ Core Application (95% Complete):**
- Backend: Authentication, CRUD APIs, upload processing, validation services
- Frontend: All views functional, upload workflow, error handling, state management
- Database: Schema complete, constraints enforced, semantic ID generation
- Integration: End-to-end workflows tested, 89-question production upload verified

**🔄 Next Phase Ready:**
- Upload metadata tracking (uploaded_on, uploaded_by, upload_notes)
- Enhanced analytics and reporting
- Performance optimization for large datasets

---

*This index provides quick orientation for a production-ready QALoader system. The rich file header documentation gives you immediate context about purpose, dependencies, and relationships. For detailed implementation status, see ARCHITECTURE_MAP.md → "Current Implementation Status" section.*
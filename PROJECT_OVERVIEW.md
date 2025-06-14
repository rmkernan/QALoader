# QALoader Project Overview

**Purpose:** Central project documentation providing comprehensive overview of the Q&A database management system for financial education content.

**Created on:** June 12, 2025. 12:26 p.m. Eastern Time
**Updated:** June 12, 2025. 12:26 p.m. Eastern Time - Initial implementation of comprehensive project overview
**Updated:** June 14, 2025. 11:32 a.m. Eastern Time - Added bulk delete functionality and mass content management features
**Updated:** June 14, 2025. 12:27 p.m. Eastern Time - Updated with ProjectRadar references, Question Upload feature, and removed outdated AgentCoord references

## 🎯 Project Purpose

### What This Project Does
QALoader is a comprehensive web application for managing financial education Q&A content. It enables content administrators to:
- Upload and parse financial question banks from Markdown files
- Curate and organize questions by topic, difficulty, and type
- Analyze content distribution and learning effectiveness
- Provide secure access to educational content for learning platforms

### Business Context
- **Target Users:** Financial education content administrators and instructors
- **Domain:** Financial education (DCF, Valuation, M&A, LBO, etc.)
- **Use Case:** Internal tool for managing question banks that feed learning applications
- **Scale:** Hundreds to thousands of questions across multiple financial topics

### Key Value Propositions
1. **Streamlined Content Management:** Replace manual Q&A curation with automated parsing and validation
2. **Quality Assurance:** Built-in validation and preview capabilities prevent content errors
3. **Analytics-Driven Insights:** Dashboard analytics help optimize content balance and coverage
4. **Scalable Architecture:** Designed to handle growth in content volume and user base

## 🏗️ System Architecture

### Technology Stack
**Frontend (React/TypeScript):**
- React 18 with TypeScript for type-safe component development
- TailwindCSS for responsive, utility-first styling
- Context API for global state management
- Vite for development and build tooling

**Backend (Python/FastAPI):**
- FastAPI for high-performance async API development
- Supabase (PostgreSQL) for database and authentication
- Pydantic for data validation and serialization
- JWT-based authentication with development bypass modes

### Architecture Patterns
- **Frontend:** Component-based architecture with context providers
- **Backend:** Service layer pattern with dependency injection
- **Database:** Relational design with activity logging
- **Authentication:** JWT tokens with development flexibility
- **API Design:** RESTful endpoints with comprehensive OpenAPI documentation

### Directory Structure
```
QALoader/
├── src/                    # React frontend application
│   ├── components/         # React components (Dashboard, Loader, Curation)
│   ├── contexts/          # Global state management
│   ├── services/          # API integration and validation services
│   └── types.ts           # TypeScript type definitions
├── backend/               # FastAPI backend application
│   ├── app/
│   │   ├── routers/       # API endpoint definitions
│   │   ├── services/      # Business logic layer
│   │   ├── models/        # Pydantic data models
│   │   └── utils/         # Helper functions (ID generation, validation)
│   └── requirements.txt   # Python dependencies
├── ProjectRadar/          # LLM project orientation system
├── Docs/                  # Project documentation and workflows
└── STARTUP_scripts/       # Development environment setup
```

## 🚀 Core Features & Workflows

### 1. Dashboard Analytics
**Purpose:** Provide at-a-glance insights into question bank health and usage patterns

**Key Features:**
- Total questions and content distribution metrics
- Topic and difficulty balance analysis
- Recent activity feed with change tracking
- Content gaps and recommendations
- System health and performance monitoring

**User Workflow:**
1. User logs in and lands on dashboard
2. Reviews key metrics and content distribution
3. Identifies gaps or imbalances in content
4. Uses insights to guide curation decisions

### 2. Question Upload & Validation
**Purpose:** Enable safe, validated upload of question banks from Markdown files with comprehensive validation

**Key Features:**
- **Two-step validation workflow:** Client-side format validation → Server-side content validation
- **Real-time format checking:** Immediate feedback on markdown structure and formatting
- **Individual question processing:** Detailed tracking with partial success handling
- **Comprehensive error reporting:** Line-by-line validation with actionable guidance
- **Semantic ID generation:** Human-readable question IDs with uniqueness guarantees
- **File constraints:** 10MB max, .md/.txt extensions, format validation

**User Workflow:**
1. Select markdown file with questions
2. **Client validation:** Immediate format and structure checking
3. **Server validation:** Content validation with detailed error reporting
4. **Upload processing:** Individual question upload with partial success tracking
5. **Result summary:** Complete success/partial success/failure with detailed feedback

**Technical Implementation:**
- Client-side validation service (`src/services/validation.ts`)
- Backend validation service with markdown parsing
- Enhanced API endpoints for validation and upload
- TypeScript interfaces for validation results and batch operations

### 3. Content Curation (Question Management)
**Purpose:** Provide detailed question-level management capabilities

**Key Features:**
- Advanced search and filtering (topic, difficulty, type, text)
- Individual question editing with validation
- New question creation with auto-generated IDs
- Question duplication for template reuse
- **Bulk operations with safety controls (delete, move, export)**
- **Mass selection with checkbox controls and header select-all**
- **Safety confirmations for bulk deletion (>10 items require typing "DELETE")**
- Markdown export for backup and portability
- **Change detection preventing unnecessary saves and duplicate questions**

**User Workflow:**
1. Apply filters to find target questions
2. Edit existing questions or create new ones
3. **Select multiple questions using checkboxes for bulk operations**
4. **Use bulk delete with safety confirmation modal and preview**
5. Export filtered results for backup or sharing

### 4. Authentication & Security
**Purpose:** Secure access control with development flexibility

**Key Features:**
- JWT-based authentication with secure token handling
- Development bypass modes for testing
- Session management with automatic logout
- Role-based access control ready for expansion

## 🔧 Development Workflows

### Getting Started for New LLMs
1. **Quick Project Orientation:**
   - **Start here:** `ProjectRadar/PROJECT_INDEX.md` - Immediate project understanding with file lookup
   - **Deep technical context:** `ProjectRadar/ARCHITECTURE_MAP.md` - Comprehensive technical reference
   - **Development standards:** `CLAUDE.md` - Coding guidelines and documentation requirements

2. **Leverage Rich Documentation:**
   - **Every code file has detailed headers** with architectural context, workflow context, and dependencies
   - **Use @workflow-context** to understand how files fit into user journeys
   - **Check @authentication-context** for security implications
   - **Review file headers first** before loading heavy documentation

3. **Set Up Development Environment:**
   - Backend: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
   - Frontend: Use static file server or Vite development server
   - Database: Supabase connection via environment variables

### Common Development Tasks

#### API Development Tasks
**Documentation Path:** `backend/CLAUDE.md` → API route files → Service layer → Database models
- Route handlers in `backend/app/routers/`
- Business logic in `backend/app/services/`
- Data models in `backend/app/models/`
- Database operations through Supabase client

#### Frontend Component Tasks
**Documentation Path:** `src/CLAUDE.md` → Component files → Styling guidelines → Context integration
- React components in `src/components/`
- Global state in `src/contexts/AppContext.tsx`
- Styling with TailwindCSS utility classes
- API integration through `src/services/`

#### Database Tasks
**Documentation Path:** `backend/CLAUDE.md` → Service files → Database documentation
- Table schemas documented in service files
- Supabase client patterns in `backend/app/database.py`
- Query patterns in service layer methods

## 📋 Quick Reference


### Key Files for LLM Tasks
- **API Changes:** `backend/app/routers/` + `backend/app/services/`
- **UI Changes:** `src/components/` + `src/contexts/AppContext.tsx`
- **Database Schema:** Service files contain table documentation
- **Configuration:** `backend/app/config.py` + environment variables

### Documentation Standards
- **ALWAYS** follow `Docs/DocumentationStandards.md`
- **NEVER** overwrite existing timestamps
- **ALWAYS** use `date` command for accurate timestamps
- **INCLUDE** architectural context in file headers

## 🚨 Known Limitations & Gaps

Based on comprehensive documentation audit:

### Critical Gaps Requiring Attention
1. **Deployment Documentation (CRITICAL):**
   - No production deployment procedures
   - Missing infrastructure and scaling guidance
   - No containerization or CI/CD documentation

2. **Mobile Responsiveness (HIGH):**
   - Frontend lacks mobile navigation patterns
   - No responsive design implementation guidance
   - Missing mobile-specific component documentation

## 🔗 Related Documentation

### Primary Documentation
- `CLAUDE.md` - Main development guidelines
- `Docs/DocumentationStandards.md` - Required documentation patterns
- `backend/CLAUDE.md` - Backend-specific development guidelines
- `src/CLAUDE.md` - Frontend-specific development guidelines

### Technical Documentation
- `Docs/APIs_COMPLETE.md` - Complete backend API specification
- `Docs/BackendDesign.md` - Database and service architecture
- `Docs/ProjectStatus.md` - Current development phase status
- `Docs/Workflows/` - Feature implementation workflows and guides

### LLM Orientation System
- `ProjectRadar/PROJECT_INDEX.md` - Quick project orientation for new LLM instances
- `ProjectRadar/ARCHITECTURE_MAP.md` - Comprehensive technical reference and patterns

---

**For New LLMs:** Start with `ProjectRadar/PROJECT_INDEX.md` for immediate orientation, then reference this PROJECT_OVERVIEW.md for business context. Leverage rich file header documentation (@architectural-context, @workflow-context) for instant understanding.

**For Development Tasks:** Use ProjectRadar's documentation-driven discovery approach rather than complex algorithmic file searching.

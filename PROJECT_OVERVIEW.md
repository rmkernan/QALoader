# QALoader Project Overview

**Purpose:** Central project documentation providing comprehensive overview of the Q&A database management system for financial education content.

**Created on:** June 12, 2025. 12:26 p.m. Eastern Time
**Updated:** June 12, 2025. 12:26 p.m. Eastern Time - Initial implementation of comprehensive project overview
**Updated:** June 14, 2025. 11:32 a.m. Eastern Time - Added bulk delete functionality and mass content management features

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

**External Integrations:**
- Google Gemini API for Markdown parsing and content analysis
- Toast notifications for user feedback
- File upload with drag-and-drop support

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
│   ├── services/          # API integration and external services
│   └── types.ts           # TypeScript type definitions
├── backend/               # FastAPI backend application
│   ├── app/
│   │   ├── routers/       # API endpoint definitions
│   │   ├── services/      # Business logic layer
│   │   ├── models/        # Pydantic data models
│   │   └── utils/         # Helper functions
│   └── requirements.txt   # Python dependencies
├── Docs/                  # Project documentation
└── AgentCoord/           # LLM coordination and handoff documentation
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

### 2. Content Loading (Bulk Upload)
**Purpose:** Enable safe, validated upload of question banks from Markdown files

**Key Features:**
- Topic selection with new topic creation
- Drag-and-drop file upload interface
- Gemini API-powered Markdown parsing
- Dry run validation with preview capabilities
- Bulk replacement with rollback safety

**User Workflow:**
1. Select target topic or create new topic
2. Upload Markdown file with questions
3. Trigger dry run analysis for validation
4. Review parsed questions and fix any issues
5. Confirm and execute bulk load operation

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
1. **Read Core Documentation:**
   - `CLAUDE.md` - Development guidelines and standards
   - `Docs/DocumentationStandards.md` - Required documentation patterns
   - `backend/CLAUDE.md` or `src/CLAUDE.md` - Technology-specific guidelines

2. **Understand Project Structure:**
   - Review this PROJECT_OVERVIEW.md for context
   - Check `Docs/APIs.md` for backend API contracts
   - Examine component architecture in `src/components/`

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

### Essential Commands
```bash
# Backend Development
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend Development
# Use static file server or development server of choice
python -m http.server 8080

# Database Testing
python -c "from app.database import supabase; print('✓' if supabase else '✗')"
```

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

3. **Data Integrity Procedures (MEDIUM):**
   - No database maintenance or cleanup procedures
   - Missing data validation and integrity checking
   - No backup and recovery documentation

### Development Task Success Rates
- **API Development Tasks:** 95% success rate (excellent documentation)
- **Desktop UI Tasks:** 90% success rate (strong component documentation)
- **Mobile UI Tasks:** 40% success rate (missing responsive patterns)
- **Deployment Tasks:** 15% success rate (critical documentation gaps)

## 🔗 Related Documentation

### Primary Documentation
- `CLAUDE.md` - Main development guidelines
- `Docs/DocumentationStandards.md` - Required documentation patterns
- `backend/CLAUDE.md` - Backend-specific development guidelines
- `src/CLAUDE.md` - Frontend-specific development guidelines

### Technical Documentation
- `Docs/APIs.md` - Complete backend API specification
- `Docs/BackendDesign.md` - Database and service architecture
- `Docs/ProjectStatus.md` - Current development phase status

### Coordination Documentation
- `AgentCoord/AgentInstructions.md` - Multi-agent coordination protocols
- `AgentCoord/HandoffProtocol.md` - LLM session handoff procedures

---

**For New LLMs:** Start with this PROJECT_OVERVIEW.md, then read the relevant CLAUDE.md file for your task area (root, backend/, or src/). Follow documentation standards religiously and check memory for previous related work.

**For Complex Tasks:** Use the agent coordination system documented in `AgentCoord/` for multi-step projects requiring strategic planning.
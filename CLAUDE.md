# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Created on:** December 16, 2024. 2:00 PM Eastern Time  
**Updated:** June 16, 2025. 2:23 PM Eastern Time - Added critical timestamp requirements section and documentation standards reminder
**Updated:** June 16, 2025. 2:24 PM Eastern Time - Added mandatory code edit workflow with memory integration

## 🚨 CRITICAL: Timestamp Requirements (DO NOT SKIP)

### EVERY code file update requires:
1. Run: `date +'%B %-d, %Y. %-I:%M %p Eastern Time'`
2. Copy output EXACTLY (never guess time)
3. ADD new "Updated:" line - NEVER overwrite existing timestamps
4. Include one-sentence description of change

### Example:
```bash
# Step 1: Get timestamp
date +'%B %-d, %Y. %-I:%M %p Eastern Time'
# Output: December 16, 2024. 3:47 PM Eastern Time

# Step 2: Add to file header (DO NOT replace existing):
Updated: December 16, 2024. 3:47 PM Eastern Time - Added error handling to upload function
```

### When to Add Timestamps:
- Any functional change to code
- Bug fixes (even small ones)
- New features or components
- Refactoring that changes behavior
- API or interface changes

### When to Skip:
- Pure formatting (prettier/eslint auto-fixes)
- Comment-only changes
- Import reordering only

## Commands

### Development
- `npm run dev` - Start frontend development server (port 5173)
- `npm run start` - Start both frontend and backend concurrently
- `npm run start:backend` - Start FastAPI backend only (port 8000)
- `npm run start:frontend` - Start Vite frontend only

### Code Quality
- `npm run lint` - Run ESLint on TypeScript files
- `npm run typecheck` - TypeScript type checking
- `npm run build` - Production build

### Quick Start (Windows/Mac/Linux)
- Use `STARTUP_scripts/start.bat` (Windows) or `./STARTUP_scripts/start.sh` (Mac/Linux)
- First-time setup: `dev-setup.bat` or `dev-setup.sh`

## Architecture

Three-tier application:
```
React Frontend → FastAPI Backend → Supabase Database
(Port 5173)      (Port 8000)       (Cloud PostgreSQL)
```

### Frontend Structure
- **Views**: LoginView, DashboardView, LoaderView, CurationView
- **State Management**: React Context (AppContext.tsx)
- **API Integration**: All API calls through `src/services/`
- **Type Definitions**: Centralized in `src/types.ts`

### Backend Structure
- **Routers**: Authentication, Questions CRUD, Upload processing
- **Services**: Business logic with validation and error handling
- **Models**: Pydantic schemas for request/response validation
- **Database**: Supabase with Row Level Security

### Key Patterns
- JWT token-based authentication
- File upload with multi-stage validation
- Bulk operations with transaction support
- Comprehensive error handling with user-friendly messages

## Documentation References

When working on specific areas:
- **Quick Navigation**: Read `ProjectRadar/PROJECT_INDEX.md`
- **Architecture Details**: See `ProjectRadar/ARCHITECTURE_MAP.md`
- **API Documentation**: Reference `Docs/APIs_COMPLETE.md`
- **Backend Context**: Check `backend/BACKEND_CONTEXT.md`
- **Documentation Standards**: Apply standards from `Docs/DocumentationStandards.md`

## Documentation Standards

After any code modifications:
1. Get timestamp: `date +'%B %-d, %Y. %-I:%M %p Eastern Time'`
2. Add new "Updated:" line to file header (never overwrite)
3. Apply JSDoc to all exported functions
4. Include architectural context in file headers

For complete documentation requirements, see `Docs/DocumentationStandards.md`

## Development Guidelines

1. **File Size Limit**: Refactor files exceeding ~450 lines
2. **TypeScript**: No `any` types - use proper type definitions
3. **Documentation**: JSDoc required for all exported functions
4. **Error Handling**: Always provide user-friendly error messages via react-hot-toast
5. **Git Commits**: Apply documentation standards before committing significant changes

## Current Implementation Status

- Authentication system (JWT) - Complete
- Question management (CRUD) - Complete
- File upload with validation - Complete
- Bulk content operations - Complete
- Dashboard analytics - Complete
- Production deployment - 95% complete (89 questions uploaded)

## Working with the Codebase

1. Start by understanding the specific task area
2. Use simple search tools (Glob/Grep) before loading complex context
3. Check file headers for architectural context
4. Reference PROJECT_INDEX.md for navigation
5. Update documentation after code changes
6. Run lint and typecheck before considering work complete

## 📝 MANDATORY Code Edit Workflow

When editing ANY code file, you MUST:

1. **Make your code changes**
2. **Before closing the file:**
   ```bash
   date +'%B %-d, %Y. %-I:%M %p Eastern Time'
   ```
3. **In the SAME edit operation**, add:
   - Updated: timestamp line to file header
   - JSDoc/docstring updates for changed functions
4. **Save once with both code and documentation**

### Memory Integration
- After completing edits, update Neo4j memory with:
  - Files modified
  - Documentation status
  - Any pending documentation needs
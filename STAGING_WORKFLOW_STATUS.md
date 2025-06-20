# Staging Workflow - Current Status & Known Issues

**Created:** June 20, 2025. 2:47 PM Eastern Time  
**Context:** Post-implementation debugging phase

## ✅ What's Working

### Core Functionality
- **Batch Upload**: Questions upload to staging tables correctly
- **Batch Review**: List view shows all batches with correct counts and timestamps
- **Question Review**: Individual approve/reject works properly
- **Bulk Actions**: Select all pending and bulk approve/reject functions
- **Import Prevention**: 'imported' status prevents duplicate imports
- **Duplicate Detection**: Duplicates are detected and stored correctly
- **Database Integrity**: All table relationships and constraints are working

### UI/UX Improvements Completed
- ✅ Workflow instructions panel added to batch detail view
- ✅ Full timestamp display instead of date-only in batch list
- ✅ Duplicate resolution interface shows actual question content
- ✅ Button order improved (Replace with New, Keep Existing, Keep Both)

### Technical Fixes Completed
- ✅ Fixed Pydantic model validation errors
- ✅ Made StagingDuplicate.resolution optional for NULL values
- ✅ Fixed current_user parameter types (string vs dict)
- ✅ Fixed database column references (staged_id → question_id)
- ✅ Added 'imported' status to prevent re-import bugs
- ✅ Fixed duplicate filtering logic (resolution vs resolution_status)
- ✅ Enhanced duplicate display with actual question content

## 🐛 Known Issues

### Critical Bug - Duplicate Resolution Actions
**Issue**: When clicking "Replace with New" (or other resolution buttons), action fails  
**Status**: Newly discovered, needs investigation  
**Location**: Duplicate resolution interface  
**Impact**: Cannot complete duplicate resolution workflow  

### Backend Logging Noise
**Issue**: bcrypt version warnings and duplicate detection function errors  
**Status**: Non-blocking but clutters logs  
**Impact**: Minor - doesn't affect functionality  

## 🧪 Test Data & Environment

### Test Scenarios Available
1. **clean_batch.md** (3 pending questions, no duplicates)
2. **mixed_review.md** (mixed status: 2 approved, 1 rejected, 1 pending)
3. **duplicate_batch.md** (1 pending + 2 duplicates needing resolution)
4. **ready_import.md** (2 approved questions ready for import)

### Test Data Reset Script
Location: SQL commands in conversation history (comprehensive reset script)
- Clears all staging tables
- Removes imported test questions from production
- Re-creates 4 test scenarios with proper relationships

### Database Schema
- **upload_batches**: Batch metadata and counts
- **staged_questions**: Individual questions pending review
- **staging_duplicates**: Detected duplicates with similarity scores
- **all_questions**: Production table for imported questions

## 🔧 Technical Context

### Backend Architecture
- **FastAPI** with Supabase PostgreSQL
- **Service Layer**: `staging_service.py` handles business logic
- **Router Layer**: `staging.py` handles API endpoints
- **Models**: Pydantic schemas in `staging.py`

### Frontend Architecture
- **React/TypeScript** with TailwindCSS
- **Main Component**: `StagingReviewView.tsx` (single large component)
- **API Layer**: `services/api.ts` handles backend communication
- **Types**: Centralized in `types.ts`

### Key Files Modified
- `backend/app/models/staging.py` - Fixed validation issues
- `backend/app/routers/staging.py` - Fixed authentication and column references
- `backend/app/services/staging_service.py` - Enhanced error handling and import logic
- `src/components/StagingReviewView.tsx` - UI improvements and bug fixes
- `src/services/api.ts` - Fixed duplicate data extraction

## 🚀 Next Steps

1. **Debug duplicate resolution actions** - primary focus
2. **Test complete end-to-end workflow** with all scenarios
3. **Clean up logging noise** (optional)
4. **Performance testing** with larger datasets
5. **Documentation updates** for production deployment

## 📋 Development Commands

### Backend
```bash
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend  
```bash
npm run dev  # Port 5173
```

### Database Constraints
```sql
-- Allow 'imported' status
ALTER TABLE staged_questions DROP CONSTRAINT staged_questions_status_check;
ALTER TABLE staged_questions ADD CONSTRAINT staged_questions_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate', 'imported'));
```
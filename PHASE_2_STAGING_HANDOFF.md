# Phase 2 Staging Workflow Handoff

**Created:** June 20, 2025. 9:53 AM Eastern Time - Phase 2 handoff after Phase 1 completion

## Current Status

### ✅ Phase 1 Complete (Committed)
- Database tables created in Supabase:
  - `upload_batches` - Tracks upload sessions  
  - `staged_questions` - Staging area for questions
  - `staging_duplicates` - Tracks duplicate relationships
- All tables have proper indexes, constraints, and RLS policies
- Migration files created in `backend/migrations/`

### 📋 Phase 2 Tasks (Backend Core)

1. **Create Pydantic models** for staging entities:
   - `StagedQuestion` model
   - `UploadBatch` model  
   - `StagingDuplicate` model
   - Response models for API endpoints

2. **Implement StagingService** (`backend/services/staging_service.py`):
   - `create_batch()` - Create new upload batch
   - `stage_questions()` - Add questions to staging
   - `detect_duplicates()` - Run duplicate detection
   - `update_batch_counts()` - Update batch statistics
   - `get_batch_questions()` - Retrieve questions for review
   - `approve_questions()` - Mark questions as approved
   - `reject_questions()` - Mark questions as rejected
   - `import_approved()` - Move approved to production

3. **Modify upload endpoint** (`/api/upload-markdown`):
   - Change to use staging workflow
   - Create batch first
   - Stage questions instead of direct insert
   - Run duplicate detection
   - Return batch_id and review URL

4. **Create staging API endpoints**:
   - `GET /api/staging/batches` - List upload batches
   - `GET /api/staging/batches/{batch_id}` - Get batch details
   - `GET /api/staging/batches/{batch_id}/questions` - Get questions in batch
   - `POST /api/staging/batches/{batch_id}/review` - Bulk approve/reject
   - `POST /api/staging/batches/{batch_id}/import` - Import approved questions
   - `GET /api/staging/duplicates/{batch_id}` - Get duplicates for batch
   - `POST /api/staging/duplicates/{duplicate_id}/resolve` - Resolve duplicate

## Key Implementation Details

### Database Schema Reference
```sql
-- upload_batches columns:
batch_id, uploaded_by, uploaded_at, file_name, total_questions,
questions_pending, questions_approved, questions_rejected, questions_duplicate,
status, review_started_at, review_completed_at, reviewed_by,
import_started_at, import_completed_at, notes

-- staged_questions columns:
All columns from all_questions PLUS:
upload_batch_id, status, duplicate_of, similarity_score, 
review_notes, reviewed_by, reviewed_at

-- staging_duplicates columns:
duplicate_id, staged_question_id, existing_question_id,
similarity_score, resolution, resolution_notes, resolved_by, resolved_at
```

### Important Context
- Working branch: `feature/staging-workflow`
- Duplicate detection threshold: 65-70% similarity
- Using pg_trgm extension (already enabled)
- JWT authentication required for all endpoints
- Maintain backward compatibility

### Files to Reference
- `backend/routers/questions.py` - Current upload endpoint
- `backend/services/duplicate_detection_service.py` - Duplicate detection logic
- `backend/models/` - Existing Pydantic models
- `STAGING_WORKFLOW_TECHNICAL_SPEC.md` - Detailed specifications

## Post-Clear Instructions

After clearing, use this prompt:

```
I'm implementing Phase 2 of the staging workflow. Phase 1 (database tables) is complete and committed. 

Current task: Implement backend core functionality including:
1. Pydantic models for staging entities
2. StagingService with all operations
3. Modified upload endpoint to use staging
4. New staging management API endpoints

Key context:
- Working on branch: feature/staging-workflow
- Database tables already created: upload_batches, staged_questions, staging_duplicates
- Need to maintain compatibility with existing all_questions table
- Duplicate detection uses pg_trgm with 65-70% threshold

Please read PHASE_2_STAGING_HANDOFF.md for full context and begin implementation.
```

## Success Criteria for Phase 2
- All Pydantic models created with proper validation
- StagingService fully implemented with error handling
- Upload endpoint successfully stages questions
- All staging API endpoints functional
- Duplicate detection integrated with staging workflow
- Proper error messages and logging throughout
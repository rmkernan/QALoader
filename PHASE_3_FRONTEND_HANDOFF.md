# Phase 3 Frontend Staging Workflow Handoff

**Created:** June 20, 2025. 10:13 AM Eastern Time - Phase 3 handoff after Phase 2 backend completion

## Current Status

### ✅ Phase 1 & 2 Complete (Committed)
- Database tables created with RLS policies
- Backend staging service fully implemented
- All API endpoints functional and tested
- Duplicate detection using pg_trgm working

### 📋 Phase 3 Tasks (Frontend Implementation)

#### 1. Create Staging Review Interface (`src/views/StagingView.tsx`)
- List view of upload batches with status indicators
- Batch detail view showing staged questions
- Bulk approve/reject functionality
- Duplicate resolution interface

#### 2. Update Upload Component (`src/components/UploadSection.tsx`)
- Show staging result after upload (batch ID, review link)
- Add option to bypass staging (use_staging=false)
- Display duplicate count if any found

#### 3. Create Staging Components
- `BatchList.tsx` - Display batches with filters
- `BatchDetail.tsx` - Show questions in batch
- `DuplicateResolver.tsx` - UI for resolving duplicates
- `StagingStats.tsx` - Visual statistics for batch

#### 4. Add Routing
- `/staging` - List all batches
- `/staging/:batchId` - Batch detail/review
- `/staging/:batchId/duplicates` - Duplicate resolution

#### 5. Update Navigation
- Add "Staging" to main navigation
- Add badge showing pending review count

## Technical Context

### API Endpoints Available
```typescript
// List batches
GET /api/staging/batches?status=pending&limit=50&offset=0

// Batch details with questions
GET /api/staging/batches/{batch_id}

// Review questions
POST /api/staging/batches/{batch_id}/review
Body: { question_ids: string[], action: "approve" | "reject", review_notes?: string }

// Import to production
POST /api/staging/batches/{batch_id}/import

// Get duplicates
GET /api/staging/duplicates/{batch_id}

// Resolve duplicate
POST /api/staging/duplicates/{duplicate_id}/resolve
Body: { resolution: "keep_existing" | "replace" | "keep_both", resolution_notes?: string }
```

### Key Types (from backend)
```typescript
interface UploadBatch {
  batch_id: string;
  uploaded_by: string;
  uploaded_at: string;
  file_name: string;
  total_questions: number;
  questions_pending: number;
  questions_approved: number;
  questions_rejected: number;
  questions_duplicate: number;
  status: "pending" | "reviewing" | "completed" | "cancelled";
}

interface StagedQuestion {
  question_id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  type: string;
  question: string;
  answer: string;
  status: "pending" | "approved" | "rejected" | "duplicate";
  duplicate_of?: string;
  similarity_score?: number;
}
```

### Files to Reference
- `src/services/api.ts` - Add staging API calls here
- `src/types.ts` - Add staging types
- `src/context/AppContext.tsx` - May need staging state
- `src/components/common/` - Reusable UI components

## Post-Clear Instructions

After clearing, use this prompt:

```
I'm implementing Phase 3 of the staging workflow (frontend). Phases 1 & 2 (database and backend) are complete.

Current task: Implement frontend components for the staging workflow including:
1. Staging review interface for batch management
2. Updated upload component to show staging results
3. Duplicate resolution UI
4. Routing and navigation updates

Key context:
- Backend API endpoints are ready at /api/staging/*
- Need to create views for reviewing staged questions before production
- Must handle duplicate resolution workflow
- Should integrate with existing React/TypeScript/TailwindCSS stack

Please read PHASE_3_FRONTEND_HANDOFF.md for full context and begin implementation.
```

## Model Recommendation

**Recommended: Claude** for Phase 3
- Frontend work is less complex than backend architecture
- Claude handles React/TypeScript/UI work well
- More token-efficient for component creation
- Opus would be overkill for straightforward frontend implementation

## Success Criteria for Phase 3
- Users can view and filter upload batches
- Batch review interface allows bulk approve/reject
- Duplicate resolution UI is intuitive
- Upload flow seamlessly transitions to staging
- All components follow existing design patterns
- Proper loading states and error handling
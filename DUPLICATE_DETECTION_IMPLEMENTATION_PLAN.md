# PostgreSQL Native Duplicate Detection Implementation Plan

**Created:** December 19, 2024. 12:16 PM Eastern Time  
**Purpose:** Complete implementation guide for adding duplicate detection to QALoader using PostgreSQL's native pg_trgm extension

## Overview

This plan implements a non-blocking, user-friendly duplicate detection system using PostgreSQL's native text similarity features. The system allows smooth uploads with post-upload duplicate management.

## Key Design Principles

1. **Non-blocking Workflow**: Uploads always succeed; duplicates are flagged for optional cleanup
2. **Native PostgreSQL**: Uses pg_trgm extension for efficient similarity matching
3. **Minimal Code**: ~50 lines of new code vs 755+ lines of custom logic
4. **Progressive Enhancement**: System works even if users ignore duplicates

## User Experience Flow

### Upload Process
1. User uploads markdown file with questions
2. File is validated and questions are saved to database
3. Background duplicate check runs (non-blocking)
4. Upload completes with success message
5. If duplicates found: "✅ Uploaded 25 questions. 3 potential duplicates found - [Review Now] [Continue]"

### Duplicate Management
1. Dedicated page at `/duplicates` for reviewing duplicates
2. Shows duplicates grouped by similarity
3. Batch operations: Delete all, Keep all, Review individually
4. Accessible from dashboard: "Duplicate Scanner" card

## Implementation Steps

### Phase 1: Database Setup

#### 1.1 Enable pg_trgm Extension
**File:** Create new file `backend/database_migrations/enable_pg_trgm.sql`
```sql
-- Enable PostgreSQL trigram extension for text similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create performance index on question text
CREATE INDEX IF NOT EXISTS idx_all_questions_trgm 
ON all_questions USING gin (question gin_trgm_ops);

-- Verify extension is enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_trgm';
```

**Action:** Run this SQL in Supabase SQL editor

### Phase 2: Backend Implementation

#### 2.1 Create Duplicate Service
**File:** `backend/app/services/duplicate_service.py`
```python
"""
@file backend/app/services/duplicate_service.py
@description Service for detecting duplicate questions using PostgreSQL pg_trgm
@created December 19, 2024. 12:16 PM Eastern Time

@architectural-context
Layer: Service (Business Logic)
Dependencies: Supabase client, PostgreSQL pg_trgm
Pattern: Database service for similarity matching
"""

from typing import List, Dict, Optional
from uuid import UUID
from app.database import supabase

class DuplicateService:
    SIMILARITY_THRESHOLD = 0.8  # 80% similarity
    
    async def detect_duplicates(
        self, 
        question_ids: List[str], 
        threshold: float = SIMILARITY_THRESHOLD
    ) -> Dict[str, any]:
        """
        Detect potential duplicates for given question IDs
        Returns grouped duplicates with similarity scores
        """
        if not question_ids:
            return {"count": 0, "groups": []}
        
        # Build query to find similar questions
        query = f"""
        SELECT 
            a.question_id as id1,
            a.question as text1,
            b.question_id as id2,
            b.question as text2,
            similarity(a.question, b.question) as score
        FROM all_questions a
        JOIN all_questions b ON a.question_id != b.question_id
        WHERE a.question_id = ANY($1)
        AND similarity(a.question, b.question) > $2
        ORDER BY score DESC
        """
        
        # Execute query
        result = await supabase.rpc(
            'exec_sql',
            {'query': query, 'params': [question_ids, threshold]}
        ).execute()
        
        # Group duplicates
        return self._group_duplicates(result.data)
    
    def _group_duplicates(self, duplicate_pairs: List[Dict]) -> Dict[str, any]:
        """Group duplicate pairs into clusters"""
        # Implementation details for grouping logic
        groups = []
        processed = set()
        
        for pair in duplicate_pairs:
            if pair['id1'] in processed:
                continue
                
            group = {
                'primary_id': pair['id1'],
                'duplicates': [pair['id2']],
                'similarity_scores': {pair['id2']: pair['score']}
            }
            groups.append(group)
            processed.add(pair['id1'])
        
        return {
            'count': len(duplicate_pairs),
            'groups': groups
        }

duplicate_service = DuplicateService()
```

#### 2.2 Update Upload Router
**File:** `backend/app/routers/upload.py`
**Changes:** Add duplicate detection after successful upload
```python
# Add import at top
from app.services.duplicate_service import duplicate_service

# In process_upload function, after batch_create_questions:
# Check for duplicates (non-blocking)
duplicate_info = await duplicate_service.detect_duplicates(
    [q.question_id for q in result.successful_uploads]
)

# Add to response
return BatchUploadResult(
    total_attempted=result.total_attempted,
    successful_uploads=result.successful_uploads,
    failed_uploads=result.failed_uploads,
    errors=result.errors,
    duplicate_count=duplicate_info.get('count', 0),
    duplicate_groups=duplicate_info.get('groups', [])
)
```

#### 2.3 Update Models
**File:** `backend/app/models/question.py`
**Changes:** Add duplicate fields to BatchUploadResult
```python
class BatchUploadResult(BaseModel):
    # ... existing fields ...
    duplicate_count: Optional[int] = Field(0, description="Number of potential duplicates found")
    duplicate_groups: Optional[List[Dict]] = Field(default_factory=list, description="Grouped duplicate information")
```

#### 2.4 Create Duplicates Router
**File:** `backend/app/routers/duplicates.py`
```python
"""
@file backend/app/routers/duplicates.py
@description API endpoints for duplicate question management
@created December 19, 2024. 12:16 PM Eastern Time

@architectural-context
Layer: API Route Handler
Dependencies: FastAPI, duplicate_service
Pattern: RESTful API for duplicate operations
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.services.auth_service import get_current_user
from app.services.duplicate_service import duplicate_service

router = APIRouter(prefix="/api/duplicates", tags=["duplicates"])

@router.get("/")
async def get_all_duplicates(
    threshold: float = 0.8,
    current_user: dict = Depends(get_current_user)
):
    """Get all potential duplicates in the database"""
    # Implementation

@router.get("/scan")
async def scan_for_duplicates(
    question_ids: Optional[List[str]] = None,
    threshold: float = 0.8,
    current_user: dict = Depends(get_current_user)
):
    """Scan for duplicates, optionally limited to specific question IDs"""
    # Implementation

@router.delete("/batch")
async def batch_delete_duplicates(
    question_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Delete multiple duplicate questions"""
    # Implementation
```

### Phase 3: Frontend Implementation

#### 3.1 Update Types
**File:** `src/types.ts`
**Changes:** Add duplicate-related interfaces
```typescript
export interface DuplicateGroup {
  primaryId: string;
  primaryQuestion: Question;
  duplicates: Array<{
    id: string;
    question: Question;
    similarityScore: number;
  }>;
}

export interface BatchUploadResult {
  // ... existing fields ...
  duplicateCount?: number;
  duplicateGroups?: DuplicateGroup[];
}
```

#### 3.2 Update LoaderView
**File:** `src/components/LoaderView.tsx`
**Changes:** Add post-upload duplicate notification
```typescript
// After successful upload
if (uploadResult.duplicateCount > 0) {
  return (
    <div className="upload-success">
      <h3>✅ Upload Complete</h3>
      <p>Successfully uploaded {uploadResult.successfulUploads.length} questions.</p>
      {uploadResult.duplicateCount > 0 && (
        <div className="duplicate-alert">
          <p>⚠️ {uploadResult.duplicateCount} potential duplicates found</p>
          <div className="button-group">
            <button onClick={() => navigate('/duplicates')} className="btn-primary">
              Review Duplicates Now
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 3.3 Create DuplicateManagementView
**File:** `src/components/DuplicateManagementView.tsx`
```typescript
/**
 * @file src/components/DuplicateManagementView.tsx
 * @description Component for reviewing and managing duplicate questions
 * @created December 19, 2024. 12:16 PM Eastern Time
 */

import React, { useState, useEffect } from 'react';
import { getDuplicates, batchDeleteQuestions } from '../services/api';

export const DuplicateManagementView: React.FC = () => {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Component implementation
  // - Fetch duplicates on mount
  // - Show grouped duplicates with similarity scores
  // - Batch selection and deletion
  // - Individual review with side-by-side comparison
};
```

#### 3.4 Update API Service
**File:** `src/services/api.ts`
**Changes:** Add duplicate management endpoints
```typescript
export const getDuplicates = async (threshold: number = 0.8): Promise<DuplicateGroup[]> => {
  const response = await authenticatedFetch(`/api/duplicates?threshold=${threshold}`);
  return response.json();
};

export const scanForDuplicates = async (questionIds?: string[]): Promise<DuplicateGroup[]> => {
  const params = questionIds ? `?question_ids=${questionIds.join(',')}` : '';
  const response = await authenticatedFetch(`/api/duplicates/scan${params}`);
  return response.json();
};

export const batchDeleteDuplicates = async (questionIds: string[]): Promise<void> => {
  await authenticatedFetch('/api/duplicates/batch', {
    method: 'DELETE',
    body: JSON.stringify({ question_ids: questionIds })
  });
};
```

#### 3.5 Update App Router
**File:** `src/App.tsx`
**Changes:** Add route for duplicate management
```typescript
import { DuplicateManagementView } from './components/DuplicateManagementView';

// In router configuration
<Route path="/duplicates" element={
  <ProtectedRoute>
    <DuplicateManagementView />
  </ProtectedRoute>
} />
```

#### 3.6 Update Dashboard
**File:** `src/components/DashboardView.tsx`
**Changes:** Add duplicate scanner card
```typescript
// Add to dashboard cards
<div className="dashboard-card">
  <h3>📋 Duplicate Scanner</h3>
  <p>{duplicateCount} potential duplicates</p>
  <p className="text-sm text-gray-600">Last scan: {lastScanDate}</p>
  <div className="button-group">
    <button onClick={handleScanNow}>Scan Now</button>
    <button onClick={() => navigate('/duplicates')}>Review</button>
  </div>
</div>
```

### Phase 4: Testing Checklist

- [ ] pg_trgm extension enabled in Supabase
- [ ] Index created on all_questions.question column
- [ ] Upload process completes without blocking
- [ ] Duplicate count appears in upload response
- [ ] Post-upload prompt shows when duplicates found
- [ ] Navigate to /duplicates shows duplicate groups
- [ ] Batch delete removes selected duplicates
- [ ] Dashboard shows duplicate scanner card
- [ ] Manual scan finds all duplicates above threshold

### Deployment Steps

1. **Database Migration**
   - Run `enable_pg_trgm.sql` in Supabase SQL editor
   - Verify extension enabled: `SELECT extname FROM pg_extension`

2. **Backend Deployment**
   - Deploy new service files
   - Update existing routers
   - Register duplicates router in main.py
   - Restart backend service

3. **Frontend Deployment**
   - Deploy updated components
   - Test duplicate detection flow
   - Verify navigation and UI updates

### Rollback Plan

If issues arise:
1. Remove duplicate detection call from upload.py
2. Hide duplicate management UI elements
3. Extension can remain enabled (no harm)
4. Index can remain (improves query performance)

## Success Criteria

- Uploads complete in same time as before (non-blocking)
- 80%+ similar questions are detected as duplicates
- Users can manage duplicates without leaving app
- Batch operations handle 50+ duplicates efficiently
- No impact on existing functionality

## Future Enhancements (Phase 2)

1. **Duplicate Resolution History**
   - Track who resolved duplicates and when
   - Audit trail for compliance

2. **Smart Merge**
   - Combine best parts of duplicate answers
   - AI-assisted answer improvement

3. **Scheduled Scans**
   - Weekly automated duplicate detection
   - Email reports to administrators

4. **Advanced Similarity**
   - Semantic similarity using embeddings
   - Cross-topic duplicate detection

---

This plan provides everything needed to implement duplicate detection from scratch. Follow the phases in order for best results.
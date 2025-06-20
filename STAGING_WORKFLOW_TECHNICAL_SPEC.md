# Staging Workflow Technical Specification

**Created:** June 20, 2025. 9:26 AM Eastern Time  
**Purpose:** Detailed technical specifications for staging workflow implementation

## Current System State

### Database Schema (Current)
```sql
-- Main questions table
CREATE TABLE all_questions (
    question_id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT,
    topic TEXT,
    subtopic TEXT,
    difficulty TEXT,
    type TEXT,
    notes_for_tutor TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_all_questions_trgm ON all_questions USING gin (question gin_trgm_ops);
```

### Current Upload API
**Endpoint:** `POST /api/upload-markdown`  
**Location:** `backend/app/routers/upload.py`  
**Current Flow:**
1. Parse markdown file
2. Validate question format
3. Generate question IDs
4. Insert directly to `all_questions` table
5. Run duplicate detection against same table
6. Return results with duplicate groups

### Current Duplicate Detection
**Service:** `backend/app/services/duplicate_service.py`  
**Method:** Uses pg_trgm similarity against `all_questions` table  
**Current Query Pattern:**
```sql
SELECT a.question_id, b.question_id, similarity(a.question, b.question) as score
FROM all_questions a, all_questions b  
WHERE a.question_id != b.question_id
AND similarity(a.question, b.question) > threshold
```

## Required Database Changes

### 1. New Tables

#### staged_questions
```sql
CREATE TABLE staged_questions (
    question_id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT,
    topic TEXT,
    subtopic TEXT,
    difficulty TEXT,
    type TEXT,
    notes_for_tutor TEXT,
    
    -- Staging-specific fields
    upload_batch_id UUID NOT NULL,
    uploaded_by TEXT NOT NULL, 
    upload_timestamp TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    
    -- Duplicate detection fields
    duplicate_of TEXT REFERENCES all_questions(question_id),
    similarity_score FLOAT,
    
    -- Review fields
    review_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_staged_questions_trgm ON staged_questions USING gin (question gin_trgm_ops);
CREATE INDEX idx_staged_questions_batch ON staged_questions (upload_batch_id);
CREATE INDEX idx_staged_questions_status ON staged_questions (status);
CREATE INDEX idx_staged_questions_uploader ON staged_questions (uploaded_by);
CREATE INDEX idx_staged_questions_timestamp ON staged_questions (upload_timestamp DESC);
```

#### upload_batches
```sql
CREATE TABLE upload_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    upload_timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Question counts
    total_questions INTEGER DEFAULT 0,
    pending_questions INTEGER DEFAULT 0,
    approved_questions INTEGER DEFAULT 0,
    rejected_questions INTEGER DEFAULT 0,
    duplicate_questions INTEGER DEFAULT 0,
    
    -- Batch status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed')),
    notes TEXT,
    
    -- Review tracking
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    imported_at TIMESTAMP
);

CREATE INDEX idx_upload_batches_status ON upload_batches (status);
CREATE INDEX idx_upload_batches_uploader ON upload_batches (uploaded_by);
CREATE INDEX idx_upload_batches_timestamp ON upload_batches (upload_timestamp DESC);
```

#### staging_duplicates
```sql
CREATE TABLE staging_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staged_question_id TEXT NOT NULL REFERENCES staged_questions(question_id) ON DELETE CASCADE,
    existing_question_id TEXT NOT NULL REFERENCES all_questions(question_id),
    similarity_score FLOAT NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
    detection_timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Resolution tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'keep_staged', 'keep_existing', 'merge', 'reject_both')),
    resolution_notes TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_staging_duplicates_staged ON staging_duplicates (staged_question_id);
CREATE INDEX idx_staging_duplicates_existing ON staging_duplicates (existing_question_id);
CREATE INDEX idx_staging_duplicates_score ON staging_duplicates (similarity_score DESC);
CREATE INDEX idx_staging_duplicates_status ON staging_duplicates (status);
```

## API Changes Required

### 1. Modified Upload Endpoint

**File:** `backend/app/routers/upload.py`

#### Current Function Signature:
```python
@router.post("/upload-markdown", response_model=BatchUploadResult)
async def upload_markdown_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
) -> BatchUploadResult:
```

#### New Function Logic:
```python
async def upload_markdown_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
) -> StagingUploadResult:
    """
    Upload questions to staging table and detect duplicates against main table
    """
    # 1. Parse markdown (same as current)
    # 2. Generate batch_id
    # 3. Insert to staged_questions instead of all_questions
    # 4. Run duplicate detection: staged_questions vs all_questions  
    # 5. Insert duplicate pairs to staging_duplicates table
    # 6. Return staging-specific response
```

#### New Response Model:
```python
class StagingUploadResult(BaseModel):
    batch_id: str
    total_attempted: int
    successful_uploads: List[str]
    failed_uploads: List[str]
    errors: Dict[str, str]
    processing_time_ms: int
    
    # Staging-specific fields
    duplicates_detected: int
    duplicate_groups: List[DuplicateGroup]
    next_action: str = "review_staging"
    review_url: str  # Frontend URL for review interface
```

### 2. New Staging Management Endpoints

**File:** `backend/app/routers/staging.py` (new file)

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.models.staging import *
from app.services.staging_service import StagingService

router = APIRouter(prefix="/staging", tags=["staging"])

@router.get("/batches", response_model=List[UploadBatch])
async def get_upload_batches(
    status: Optional[str] = None,
    uploaded_by: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get list of upload batches with filtering"""

@router.get("/batches/{batch_id}", response_model=UploadBatchDetail) 
async def get_batch_detail(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed view of specific batch including all questions"""

@router.get("/questions", response_model=List[StagedQuestion])
async def get_staged_questions(
    batch_id: Optional[str] = None,
    status: Optional[str] = None,
    has_duplicates: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get staged questions with filtering"""

@router.get("/duplicates/{batch_id}", response_model=List[DuplicateGroup])
async def get_batch_duplicates(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all duplicate conflicts for a batch"""

@router.post("/review", response_model=ReviewResult)
async def review_staging_questions(
    review_data: StagingReviewRequest,
    current_user: dict = Depends(get_current_user)
):
    """Bulk review (approve/reject) staging questions"""

@router.post("/import/{batch_id}", response_model=ImportResult)
async def import_approved_questions(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Import approved questions from staging to main table"""

@router.delete("/batches/{batch_id}")
async def delete_staging_batch(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete entire staging batch (cleanup)"""
```

### 3. New Pydantic Models

**File:** `backend/app/models/staging.py` (new file)

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class StagedQuestion(BaseModel):
    question_id: str
    question: str
    answer: Optional[str]
    topic: Optional[str]
    subtopic: Optional[str] 
    difficulty: Optional[str]
    type: Optional[str]
    notes_for_tutor: Optional[str]
    
    # Staging fields
    upload_batch_id: UUID
    uploaded_by: str
    upload_timestamp: datetime
    status: str
    duplicate_of: Optional[str]
    similarity_score: Optional[float]
    review_notes: Optional[str]
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]

class UploadBatch(BaseModel):
    batch_id: UUID
    filename: str
    uploaded_by: str
    upload_timestamp: datetime
    total_questions: int
    pending_questions: int
    approved_questions: int
    rejected_questions: int
    duplicate_questions: int
    status: str
    notes: Optional[str]

class StagingDuplicate(BaseModel):
    id: UUID
    staged_question: StagedQuestion
    existing_question: dict  # From all_questions
    similarity_score: float
    status: str
    resolution_notes: Optional[str]

class StagingReviewRequest(BaseModel):
    decisions: List[StagingDecision]

class StagingDecision(BaseModel):
    question_id: str
    action: str = Field(..., regex="^(approve|reject|mark_duplicate)$")
    notes: Optional[str]
    duplicate_of: Optional[str]

class ReviewResult(BaseModel):
    batch_id: UUID
    processed_count: int
    approved_count: int  
    rejected_count: int
    duplicate_count: int
    errors: List[str]

class ImportResult(BaseModel):
    batch_id: UUID
    imported_count: int
    skipped_count: int
    error_count: int
    imported_question_ids: List[str]
    errors: List[str]
```

## Service Layer Changes

### 1. New StagingService

**File:** `backend/app/services/staging_service.py` (new file)

```python
from typing import List, Dict, Any, Optional
from uuid import UUID
from app.database import supabase
from app.services.duplicate_service import DuplicateService

class StagingService:
    def __init__(self):
        self.duplicate_service = DuplicateService()
    
    async def create_staging_batch(
        self, 
        filename: str, 
        uploaded_by: str
    ) -> UUID:
        """Create new upload batch"""
    
    async def add_questions_to_staging(
        self,
        batch_id: UUID,
        questions: List[Dict],
        uploaded_by: str
    ) -> Dict[str, Any]:
        """Add questions to staging table"""
    
    async def detect_staging_duplicates(
        self,
        batch_id: UUID,
        threshold: float = 0.7
    ) -> List[Dict]:
        """Detect duplicates between staging and main tables"""
        # Modified duplicate detection query:
        # Compare staged_questions vs all_questions
    
    async def review_staging_questions(
        self,
        decisions: List[StagingDecision]
    ) -> ReviewResult:
        """Process bulk review decisions"""
    
    async def import_approved_questions(
        self,
        batch_id: UUID
    ) -> ImportResult:
        """Move approved questions to main table"""
        # 1. Get approved questions from staging
        # 2. Insert to all_questions
        # 3. Update staging status to imported
        # 4. Update batch completion status
```

### 2. Modified DuplicateService

**File:** `backend/app/services/duplicate_service.py`

#### New Method:
```python
async def detect_staging_vs_main_duplicates(
    self,
    staged_question_ids: List[str],
    threshold: float = 0.7
) -> Dict[str, Any]:
    """
    Detect duplicates between staged questions and main table
    
    Modified SQL query:
    SELECT 
        s.question_id as staged_id,
        s.question as staged_text,
        m.question_id as main_id,
        m.question as main_text,
        similarity(s.question, m.question) as score
    FROM staged_questions s
    CROSS JOIN all_questions m
    WHERE s.question_id = ANY(%s)
    AND similarity(s.question, m.question) > %s
    ORDER BY score DESC
    """
```

## Frontend Changes Required

### 1. New Routes
**File:** `src/App.tsx`

```typescript
// Add new routes for staging workflow
<Route path="/staging" element={<StagingDashboard />} />
<Route path="/staging/batch/:batchId" element={<BatchReview />} />
<Route path="/staging/review/:batchId" element={<DuplicateReview />} />
```

### 2. New Components

#### StagingDashboard Component
**File:** `src/components/StagingDashboard.tsx`

```typescript
interface StagingDashboardProps {}

export const StagingDashboard: React.FC<StagingDashboardProps> = () => {
  // List all pending batches
  // Show counts and status
  // Filter and search functionality
  // Navigation to batch review
};
```

#### BatchReview Component  
**File:** `src/components/BatchReview.tsx`

```typescript
interface BatchReviewProps {
  batchId: string;
}

export const BatchReview: React.FC<BatchReviewProps> = ({ batchId }) => {
  // Show all questions in batch
  // Highlight duplicates
  // Bulk approve/reject actions
  // Individual question review
};
```

#### DuplicateReview Component
**File:** `src/components/DuplicateReview.tsx`

```typescript
interface DuplicateReviewProps {
  batchId: string;
}

export const DuplicateReview: React.FC<DuplicateReviewProps> = ({ batchId }) => {
  // Side-by-side comparison
  // Similarity scores
  // Resolution options
  // Notes and decision tracking
};
```

### 3. API Service Updates
**File:** `src/services/api.ts`

```typescript
// New staging-related API functions
export const stagingApi = {
  getBatches: (filters?: StagingFilters) => Promise<UploadBatch[]>,
  getBatchDetail: (batchId: string) => Promise<UploadBatchDetail>,
  getStagedQuestions: (filters?: QuestionFilters) => Promise<StagedQuestion[]>,
  getBatchDuplicates: (batchId: string) => Promise<DuplicateGroup[]>,
  reviewQuestions: (review: StagingReviewRequest) => Promise<ReviewResult>,
  importBatch: (batchId: string) => Promise<ImportResult>,
  deleteBatch: (batchId: string) => Promise<void>
};
```

## Implementation Order

### Phase 1: Database Foundation
1. Create database migration files
2. Run migrations to create new tables
3. Test table structure and relationships

### Phase 2: Backend Core
1. Create new Pydantic models  
2. Implement StagingService
3. Modify upload endpoint to use staging
4. Add basic staging API endpoints

### Phase 3: Duplicate Detection Integration
1. Modify duplicate detection for staging vs main
2. Implement staging duplicate tracking
3. Test duplicate detection accuracy

### Phase 4: Frontend Implementation  
1. Create new staging components
2. Update navigation and routing
3. Implement review interfaces
4. Add bulk operations

### Phase 5: Integration and Testing
1. End-to-end workflow testing
2. Performance optimization
3. User experience refinement
4. Documentation updates

This technical specification provides the detailed implementation roadmap for the staging workflow system.
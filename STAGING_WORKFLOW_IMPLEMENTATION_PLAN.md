# Staging Workflow Implementation Plan

**Created:** June 20, 2025. 9:25 AM Eastern Time  
**Purpose:** Comprehensive plan for implementing staged question uploads with duplicate detection

## Executive Summary

Transform the Q&A Loader upload workflow from direct-to-production to a staging-based system where:
1. All uploads go to `staged_questions` table
2. Staged questions are checked for duplicates against main `all_questions` table
3. Users review and manage duplicates before importing to production
4. Only clean, approved questions reach the main table

## Current System Architecture

### Upload Flow (Current)
```
Upload Markdown → Validate → Insert to all_questions → Detect duplicates → Show duplicates in management UI
```

### Problems with Current Approach
- Duplicates contaminate main table immediately
- Cleanup requires manual deletion from production data
- Users see incomplete/duplicate questions during review process
- Risk of accidentally keeping wrong version of duplicate

## Proposed Staging Workflow

### New Upload Flow
```
Upload Markdown → Validate → Insert to staged_questions → Detect duplicates vs all_questions → Review Interface → Approve/Reject → Import to all_questions
```

### Benefits
- **Data Integrity**: Main table never contains unreviewed duplicates
- **User Experience**: Clear workflow with manual oversight
- **Safer Operations**: Mistakes happen in staging, not production
- **Batch Processing**: Review multiple uploads before importing
- **Audit Trail**: Track what was approved/rejected and why

## Database Schema Changes

### New Tables Required

#### 1. staged_questions
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
    upload_batch_id UUID NOT NULL, -- Group questions from same upload
    uploaded_by TEXT NOT NULL, -- User who uploaded
    upload_timestamp TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'duplicate'
    duplicate_of TEXT, -- Reference to question_id in all_questions if duplicate
    similarity_score FLOAT, -- Similarity score if duplicate detected
    review_notes TEXT, -- Manual notes from reviewer
    reviewed_by TEXT, -- User who reviewed
    reviewed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_staged_questions_trgm ON staged_questions USING gin (question gin_trgm_ops);
CREATE INDEX idx_staged_questions_batch ON staged_questions (upload_batch_id);
CREATE INDEX idx_staged_questions_status ON staged_questions (status);
CREATE INDEX idx_staged_questions_uploaded_by ON staged_questions (uploaded_by);
```

#### 2. upload_batches  
```sql
CREATE TABLE upload_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    upload_timestamp TIMESTAMP DEFAULT NOW(),
    total_questions INTEGER,
    pending_questions INTEGER,
    approved_questions INTEGER,
    rejected_questions INTEGER,
    duplicate_questions INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'imported'
    notes TEXT
);
```

#### 3. staging_duplicates
```sql
CREATE TABLE staging_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staged_question_id TEXT REFERENCES staged_questions(question_id),
    existing_question_id TEXT REFERENCES all_questions(question_id),
    similarity_score FLOAT NOT NULL,
    detection_timestamp TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- 'pending', 'keep_staged', 'keep_existing', 'merge'
    resolution_notes TEXT
);
```

## API Changes Required

### 1. Upload Endpoint Changes
**Current:** `POST /api/upload-markdown` → inserts to all_questions  
**New:** `POST /api/upload-markdown` → inserts to staged_questions

```python
# Modified response format
{
    "batch_id": "uuid",
    "total_attempted": 10,
    "successful_uploads": ["STAGED-001", "STAGED-002"],
    "failed_uploads": [],
    "duplicates_detected": 3,
    "duplicate_groups": [...],
    "next_action": "review_staging" # Guide user to review interface
}
```

### 2. New Staging Management Endpoints

#### Get Staging Batches
```python
@router.get("/staging/batches")
async def get_staging_batches(status: str = None) -> List[UploadBatch]:
    """List all upload batches with filtering by status"""
```

#### Get Staging Questions
```python
@router.get("/staging/questions")
async def get_staging_questions(
    batch_id: str = None,
    status: str = None,
    has_duplicates: bool = None
) -> List[StagedQuestion]:
    """Get staged questions with filtering options"""
```

#### Get Duplicates for Review
```python
@router.get("/staging/duplicates/{batch_id}")
async def get_batch_duplicates(batch_id: str) -> List[DuplicateGroup]:
    """Get all duplicates detected for a specific batch"""
```

#### Approve/Reject Staging Questions
```python
@router.post("/staging/review")
async def review_staging_questions(
    decisions: List[StagingDecision]
) -> ReviewResult:
    """Bulk approve/reject staging questions"""

# StagingDecision model
class StagingDecision(BaseModel):
    question_id: str
    action: str  # 'approve', 'reject', 'mark_duplicate'
    notes: str = None
    duplicate_of: str = None  # If marking as duplicate
```

#### Import Approved Questions
```python
@router.post("/staging/import/{batch_id}")
async def import_approved_questions(batch_id: str) -> ImportResult:
    """Move approved questions from staging to main table"""
```

## Frontend UI Changes

### 1. Modified Upload Experience
- Upload success shows "Questions staged for review" 
- Immediate redirect to staging review interface
- Clear indication that questions are not yet live

### 2. New Staging Review Interface
**Route:** `/staging` or `/review`

#### Components Needed:
1. **BatchList Component**
   - List pending upload batches
   - Show counts (total, duplicates, pending review)
   - Filter by status, uploader, date

2. **StagingReview Component**  
   - Side-by-side comparison of staged vs existing questions
   - Similarity scores displayed
   - Action buttons: Approve, Reject, Mark as Duplicate
   - Bulk actions for non-duplicates

3. **DuplicateResolution Component**
   - Detailed comparison interface
   - Options: Keep Staged, Keep Existing, Merge, Reject Both
   - Notes field for decisions

4. **ImportConfirmation Component**
   - Final review before importing to production
   - Summary of decisions made
   - Confirmation step with audit trail

### 3. Navigation Updates
- Add "Review Staging" to main navigation
- Badge with pending review count
- Notification system for new uploads requiring review

## Implementation Phases

### Phase 1: Database and Backend (Week 1)
1. Create database migrations for new tables
2. Update upload endpoint to target staging table  
3. Implement duplicate detection between staging and main tables
4. Create basic staging management API endpoints
5. Update existing duplicate detection service

### Phase 2: Review Interface (Week 2)  
1. Create staging review UI components
2. Implement batch listing and filtering
3. Build duplicate comparison interface
4. Add approve/reject functionality
5. Create import confirmation workflow

### Phase 3: Enhanced Features (Week 3)
1. Add bulk operations and advanced filtering
2. Implement merge functionality for duplicates
3. Add audit trail and reporting
4. Create notification system
5. Performance optimization

### Phase 4: Testing and Documentation (Week 4)
1. Comprehensive testing with test_questions table
2. Update user documentation
3. Create admin guides for staging management
4. Performance testing with large uploads
5. Security review and deployment

## Migration Strategy

### For Existing System
1. **No Data Loss**: Current all_questions table remains unchanged
2. **Gradual Rollout**: Feature flag to enable staging workflow
3. **Fallback Option**: Ability to revert to direct upload if needed
4. **User Training**: Documentation and walkthrough for new workflow

### Data Migration
- No migration needed for existing questions
- New uploads automatically use staging workflow
- Current duplicate management tools remain functional during transition

## Technical Considerations

### Performance
- Similarity queries against main table (potentially large)
- Batch processing for large uploads
- Efficient indexing strategy for staging tables

### Security
- User permissions for staging review (admin-only vs user-specific)
- Audit trail for all staging decisions
- Prevention of unauthorized imports

### User Experience  
- Clear workflow guidance
- Intuitive duplicate resolution interface
- Minimal learning curve from current system

## Success Metrics

### Quality Improvements
- Reduction in main table duplicates to near-zero
- Faster identification and resolution of duplicate issues
- Improved data quality through manual review

### User Experience
- Reduced confusion from seeing duplicate questions
- Clear workflow for managing uploads
- Faster resolution of duplicate issues

### System Performance
- Maintained upload performance despite additional staging step
- Efficient duplicate detection across staging vs main tables
- Scalable workflow for large batch uploads

## Risks and Mitigation

### User Adoption
- **Risk**: Users confused by new multi-step workflow
- **Mitigation**: Clear documentation, guided tours, fallback option

### Performance Impact
- **Risk**: Duplicate detection slow with large main table
- **Mitigation**: Optimized indexes, batch processing, caching

### Workflow Bottlenecks
- **Risk**: Staging review becomes bottleneck
- **Mitigation**: Bulk operations, smart defaults, delegation features

This comprehensive plan provides the foundation for implementing a robust staging workflow that prevents duplicate contamination while maintaining system usability and performance.
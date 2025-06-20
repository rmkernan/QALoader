# Staging Workflow Implementation - Handoff Context

**Created:** June 20, 2025. 9:27 AM Eastern Time  
**Purpose:** Complete context for implementing staging workflow with duplicate detection

## Project Status Summary

### What Was Accomplished
✅ **Duplicate Detection System**: Fully functional with PostgreSQL pg_trgm extension  
✅ **Test Suite**: Comprehensive automated testing framework with 37 test questions  
✅ **Database Setup**: pg_trgm extension enabled and optimized with GIN indexes  
✅ **API Integration**: Upload and duplicate detection endpoints working  
✅ **Fallback System**: Application-level duplicate detection when database features unavailable  

### Current Working System
- **Upload Flow**: Markdown files → Parse → Validate → Insert to `all_questions` → Detect duplicates → Show in UI
- **Duplicate Detection**: Uses pg_trgm similarity with optimal threshold of 65-70%
- **Management Interface**: UI for reviewing and deleting duplicates
- **Performance**: <2 seconds detection time for typical uploads

### Why Change Is Needed
**Problem**: Duplicates contaminate main table immediately during upload  
**Impact**: Users see duplicate questions, cleanup requires manual deletion from production  
**Solution**: Staging workflow to catch duplicates before they reach main table

## Proposed Staging Workflow

### New Upload Flow
```
Upload → staged_questions table → Detect duplicates vs all_questions → Manual review → Import approved questions → all_questions table
```

### Key Benefits
- **Clean Production Data**: Main table never contains unreviewed duplicates
- **Better UX**: Clear review workflow with manual oversight  
- **Safer Operations**: Mistakes happen in staging, not production
- **Batch Processing**: Review multiple uploads efficiently

## Technical Architecture

### Database Changes Required
1. **staged_questions** table - holds uploaded questions pending review
2. **upload_batches** table - tracks upload sessions and review status
3. **staging_duplicates** table - stores detected duplicate relationships

### API Changes Required
1. **Modify upload endpoint** - target staging table instead of main table
2. **New staging endpoints** - batch management, review, import operations
3. **Updated duplicate detection** - compare staging vs main instead of main vs main

### Frontend Changes Required
1. **Staging dashboard** - list pending batches needing review
2. **Review interface** - side-by-side duplicate comparison with resolution options
3. **Batch management** - approve/reject questions, import to production

## Current Codebase Context

### Key Files and Structure
```
backend/
├── app/
│   ├── routers/
│   │   ├── upload.py              # Current upload endpoint (needs modification)
│   │   ├── duplicates.py          # Duplicate management endpoints (working)
│   │   └── [new] staging.py       # New staging management endpoints
│   ├── services/
│   │   ├── duplicate_service.py   # Core duplicate detection (needs staging method)
│   │   └── [new] staging_service.py # New staging workflow logic
│   └── models/
│       ├── question.py           # Current question models
│       └── [new] staging.py      # New staging-specific models
├── database_migrations/
│   ├── enable_pg_trgm.sql        # Already applied successfully
│   └── [new] create_staging_tables.sql # New tables for staging workflow

frontend/
├── src/
│   ├── components/
│   │   ├── LoaderView.tsx        # Current upload interface (needs updates)
│   │   ├── DuplicateManagementView.tsx # Current duplicate management (reference)
│   │   ├── [new] StagingDashboard.tsx # New staging overview
│   │   ├── [new] BatchReview.tsx     # New batch review interface
│   │   └── [new] DuplicateReview.tsx # New duplicate resolution interface
│   ├── services/
│   │   └── api.ts                # API integration (needs staging endpoints)
│   └── types.ts                  # Type definitions (needs staging types)
```

### Working Systems (Don't Break)
- **Authentication**: JWT-based auth working correctly
- **Current Upload**: Functional but needs to target staging
- **Duplicate Detection**: pg_trgm working with proper thresholds
- **Question Management**: CRUD operations on all_questions table
- **UI Components**: Existing patterns for question display and management

## Implementation Strategy

### Phase 1: Database Foundation (Day 1-2)
1. Create staging table migrations
2. Test table relationships and constraints
3. Verify pg_trgm works with new schema

### Phase 2: Backend Core (Day 3-4)
1. Create staging service and models
2. Modify upload endpoint for staging
3. Implement duplicate detection between staging and main
4. Add basic staging management endpoints

### Phase 3: Frontend Interface (Day 5-6)
1. Create staging dashboard and navigation
2. Build batch review interface
3. Implement duplicate resolution UI
4. Add import/approval workflow

### Phase 4: Integration Testing (Day 7)
1. End-to-end workflow testing
2. Performance validation
3. User experience testing
4. Documentation updates

## Critical Technical Decisions

### Duplicate Detection Query Change
**Current:**
```sql
-- Compares within same table
SELECT similarity(a.question, b.question) 
FROM all_questions a, all_questions b
WHERE a.question_id != b.question_id
```

**New:**
```sql  
-- Compares across tables
SELECT similarity(s.question, m.question)
FROM staged_questions s, all_questions m
WHERE s.status = 'pending'
```

### Threshold Recommendations
- **Production threshold**: 65-70% (validated through testing)
- **Review threshold**: 60% (catch more potential duplicates for human review)
- **Auto-reject threshold**: 95% (obvious duplicates)

### User Experience Flow
1. **Upload**: Same interface, different destination (staged_questions)
2. **Notification**: "Questions staged for review" with link to review interface
3. **Review**: Clear side-by-side comparison with similarity scores
4. **Resolution**: Options: Approve, Reject, Mark as Duplicate, Merge
5. **Import**: Bulk operation to move approved questions to production

## Test Data Available

### Test Questions Table (Optional)
- 26 test questions with known duplicate relationships
- Categories: high_similarity, medium_similarity, low_similarity, unique, cross_topic, edge_cases
- Can be used for regression testing of staging workflow

### Test Scripts Available
- Automated upload and validation scripts
- Duplicate detection accuracy testing
- Database cleanup utilities
- All in `test_scripts/` directory with comprehensive documentation

## Dependencies and Prerequisites

### Database Requirements
- ✅ PostgreSQL with pg_trgm extension (already enabled)
- ✅ GIN indexes for performance (already created)
- 🔲 New staging tables (migrations ready to apply)

### Authentication
- ✅ JWT token system working
- ✅ User identification for upload tracking
- 🔲 Permission levels for staging review (admin vs user)

### Performance Considerations
- **Staging table size**: Monitor growth, implement cleanup policies
- **Duplicate detection**: Optimize queries for staging vs main comparison
- **UI responsiveness**: Implement pagination for large batch reviews

## Known Issues and Considerations

### Data Volume
- Current system: ~200 questions in production
- Expected staging volume: 10-50 questions per upload session
- Duplicate detection scales linearly with main table size

### User Workflow
- **Training needed**: New multi-step process vs direct upload
- **Batch size**: Balance between review efficiency and upload convenience
- **Rollback plan**: Ability to revert to direct upload if needed

### Security
- **Access control**: Who can review and approve staged questions
- **Audit trail**: Track all review decisions for accountability
- **Data cleanup**: Automated removal of old staging data

## Success Metrics

### Quality Improvements
- **Target**: Zero duplicates in main table from new uploads
- **Measure**: Duplicate count in all_questions table over time
- **Baseline**: Current duplicate count from existing data

### User Experience
- **Upload time**: Should remain under 5 seconds
- **Review time**: Target 30 seconds per duplicate resolution
- **Workflow completion**: 95% of uploads should progress through staging successfully

### System Performance  
- **Database performance**: Staging queries complete in <2 seconds
- **UI responsiveness**: Review interface loads in <1 second
- **Scalability**: System handles 100+ questions per staging batch

## Next Steps for Implementation

1. **Review documentation**: Understand current system through provided specs
2. **Plan database changes**: Apply staging table migrations
3. **Implement backend**: Start with staging service and modified upload endpoint
4. **Build frontend**: Create review interfaces with duplicate comparison
5. **Test end-to-end**: Validate complete workflow from upload to import
6. **User testing**: Validate workflow with actual users and content

All detailed specifications are available in:
- `STAGING_WORKFLOW_IMPLEMENTATION_PLAN.md` - High-level architecture and planning
- `STAGING_WORKFLOW_TECHNICAL_SPEC.md` - Detailed technical implementation guide
- `test_scripts/` - Complete test suite for validation
# Phase 2 & 3 Implementation Plan - Duplicate Detection System

**Created:** June 19, 2025. 4:20 PM Eastern Time  
**Status:** Phase 1 Complete - Ready for Phase 2 & 3

## Current Status Summary

✅ **Phase 1 COMPLETED:**
- Removed topic selection from upload workflow
- Fixed topic extraction from markdown files 
- Implemented question ID abbreviation system (ACC-UND-B-Q-001)
- Fixed critical validation logic for self-contained question blocks
- Updated both frontend and backend validation services

## Phase 2: Pre-Upload Duplicate Detection

### Objective
Add duplicate detection that runs BEFORE uploading to warn users about exact matches in the database.

### Implementation Steps

1. **Create Duplicate Detection Service** (`backend/app/services/duplicate_service.py`):
   ```python
   class DuplicateService:
       async def check_exact_duplicates(self, questions: List[ParsedQuestion]) -> Dict[str, str]
       async def check_similar_questions(self, questions: List[ParsedQuestion]) -> Dict[str, List[str]]
   ```

2. **Update Upload Router** (`backend/app/routers/upload.py`):
   - Add new endpoint: `POST /api/check-duplicates`
   - Integrate duplicate checking into existing upload workflow
   - Return duplicate warnings before actual upload

3. **Update Frontend LoaderView** (`src/components/LoaderView.tsx`):
   - Add "Check for Duplicates" button after validation
   - Display duplicate warnings in confirmation modal
   - Allow user to proceed with upload despite duplicates

4. **Frontend API Integration** (`src/services/api.ts`):
   - Add `checkForDuplicates(questions)` function
   - Update upload flow to include duplicate checking step

### Technical Details

**Exact Match Logic:**
- Compare question text (normalized: lowercase, trimmed, punctuation removed)
- Compare topic + subtopic + difficulty + type combination
- Flag as "exact duplicate" if both match

**Database Queries:**
- Use Supabase text search for efficient question matching
- Batch queries for multiple questions at once

## Phase 3: Post-Upload Duplicate Finder

### Objective
Add a management tool to find and resolve existing duplicates in the database.

### Implementation Steps

1. **Backend Duplicate Analysis** (`backend/app/routers/duplicates.py`):
   ```python
   @router.get("/api/duplicates/exact")
   @router.get("/api/duplicates/similar") 
   @router.post("/api/duplicates/resolve")
   ```

2. **Frontend Duplicate Management View**:
   - New view accessible from Dashboard
   - Display grouped duplicates with side-by-side comparison
   - Allow merge/delete actions for duplicate resolution

3. **Fuzzy Matching Algorithm**:
   - Use Levenshtein distance or similar algorithm
   - Configurable similarity threshold (default 85%)
   - Group questions by similarity scores

4. **Bulk Resolution Tools**:
   - Keep newer question (by upload date)
   - Keep question with more metadata
   - Manual selection interface

### Technical Details

**Similarity Algorithm:**
```python
def calculate_similarity(q1: str, q2: str) -> float:
    # Normalize text (remove punctuation, lowercase, trim)
    # Calculate Levenshtein distance
    # Return percentage similarity
```

**Resolution Actions:**
- Delete duplicate questions
- Merge metadata from duplicates
- Update question IDs if needed
- Maintain audit trail

## File Structure Changes

### New Files to Create:
```
backend/app/services/duplicate_service.py
backend/app/routers/duplicates.py  
src/components/DuplicateManagementView.tsx
src/components/DuplicateComparisonCard.tsx
src/services/duplicateApi.ts
```

### Files to Modify:
```
backend/app/routers/upload.py (add duplicate checking)
src/components/LoaderView.tsx (add duplicate check step)
src/components/DashboardView.tsx (add duplicate management link)
src/services/api.ts (add duplicate check functions)
src/types.ts (add duplicate-related interfaces)
```

## Database Considerations

**No schema changes needed** - all duplicate detection works with existing `all_questions` table.

**Indexing recommendations:**
```sql
-- Improve search performance for duplicate detection
CREATE INDEX IF NOT EXISTS idx_questions_text_search ON all_questions USING gin(to_tsvector('english', question));
CREATE INDEX IF NOT EXISTS idx_questions_topic_subtopic ON all_questions(topic, subtopic, difficulty, type);
```

## Testing Strategy

1. **Create test datasets** with known duplicates
2. **Test exact matching** with various text formatting
3. **Test similarity thresholds** for fuzzy matching
4. **Test resolution workflows** (merge, delete, keep)
5. **Test performance** with large question sets

## Priority Notes

- **Phase 2 is higher priority** - prevents duplicates from entering
- **Phase 3 can be implemented later** - cleans up existing data
- **Focus on exact matching first** - fuzzy matching is enhancement
- **User experience is critical** - clear warnings and easy resolution

## Current Todo Status

- [x] Phase 1: Remove topic selection and fix validation
- [ ] Phase 2: Implement pre-upload duplicate detection  
- [ ] Phase 3: Implement post-upload duplicate finder
- [ ] Test end-to-end workflow and fix any issues

## Key Implementation Files

**Most Critical Files to Modify:**
1. `backend/app/routers/upload.py` - Add duplicate checking endpoint
2. `src/components/LoaderView.tsx` - Add duplicate check step
3. `backend/app/services/duplicate_service.py` - Core duplicate logic (NEW)
4. `src/services/api.ts` - Add duplicate check API calls

Start with Phase 2 as it provides immediate value by preventing new duplicates.
# Supabase Duplicate Detection Research Summary

**Created:** June 19, 2025. 5:30 PM Eastern Time  
**Purpose:** Preserve research findings on native PostgreSQL/Supabase capabilities for duplicate detection

## Key Findings

### PostgreSQL Native Extensions Available in Supabase

1. **pg_trgm Extension** (Recommended for our use case)
   - `similarity(text1, text2)` - returns 0-1 similarity score
   - `%` operator - checks if strings are similar above threshold
   - Configurable similarity thresholds (default 0.3)
   - Efficient with GIN/GiST trigram indexes

2. **fuzzystrmatch Extension**
   - Levenshtein distance for edit operations
   - Soundex for phonetic matching
   - Metaphone for improved phonetic hashing

3. **Full-Text Search (FTS)**
   - `to_tsvector()` and `to_tsquery()` for lexical matching
   - Built-in stemming and stop word filtering
   - Can be combined with trigram matching

4. **pgvector Extension**
   - Vector embeddings for semantic similarity
   - Cosine distance operations
   - HNSW and IVFFlat indexing

## Recommended Implementation Strategy

### Phase 1: Simple pg_trgm Implementation
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Find exact duplicates
SELECT question, COUNT(*) 
FROM all_questions 
GROUP BY question 
HAVING COUNT(*) > 1;

-- Find near-duplicates (80%+ similarity)
SELECT a.id, a.question, b.id, b.question, 
       similarity(a.question, b.question) as sim
FROM all_questions a
JOIN all_questions b ON a.id < b.id
WHERE similarity(a.question, b.question) > 0.8
ORDER BY sim DESC;

-- Add performance index
CREATE INDEX idx_questions_trgm ON all_questions USING gin (question gin_trgm_ops);
```

### Why This Approach is Superior

1. **Simplicity**: ~10 lines of SQL vs 755+ lines of custom code
2. **Performance**: Native PostgreSQL optimization vs application-level processing
3. **Reliability**: Battle-tested algorithms vs custom implementation
4. **Maintainability**: Standard SQL vs complex service layer
5. **Flexibility**: Easy threshold tuning vs hardcoded logic

## Refined User Experience Workflow

### Pre-Upload: Informational (Non-Blocking)
- Duplicate check runs automatically after file validation
- Shows warning: "⚠️ Found 3 potential duplicates - you can clean these up after upload"
- **User proceeds with upload** - no workflow interruption
- Upload button may change to "Upload & Review Duplicates"

### Post-Upload: Immediate Resolution Prompt
- Upload completes successfully with duplicate count in response
- If duplicates detected: "✅ Uploaded 25 questions. **3 potential duplicates found**"
- Show action buttons: "[Review Duplicates Now]" or "[Continue to Dashboard]"
- Direct link to duplicate management filtered to newly uploaded questions

### Benefits
- No forced workflow interruption - smooth upload experience
- Context preserved - immediate cleanup while upload is fresh
- Better UX - compare live database records vs editing source files
- Progressive enhancement - upload works even if duplicates ignored

## Implementation Plan

1. **Enable pg_trgm extension** in Supabase
2. **Add background duplicate detection** during upload process
3. **Modify upload response** to include duplicate count and IDs
4. **Update LoaderView** with post-upload duplicate management prompt
5. **Create duplicate management page** with "recently uploaded" filter
6. **Add performance index** for large datasets

## Decision Rationale

- **Previous approach**: Custom duplicate detection service with complex fuzzy matching
- **New approach**: Native PostgreSQL pg_trgm extension
- **Benefit**: 90% less code, better performance, more reliable
- **Trade-off**: Less customization, but PostgreSQL algorithms are proven

## Files to Modify

### Backend Changes
1. `backend/database_setup.sql` - Enable pg_trgm extension
2. `backend/app/routers/upload.py` - Add background duplicate detection to upload process
3. `backend/app/models/question.py` - Add duplicate_count to BatchUploadResult
4. `backend/app/routers/duplicates.py` - New router for duplicate management endpoints

### Frontend Changes
1. `src/components/LoaderView.tsx` - Add post-upload duplicate management prompt
2. `src/components/DuplicateManagementView.tsx` - New component for duplicate resolution
3. `src/services/api.ts` - Add duplicate management API calls
4. `src/types.ts` - Add duplicate-related interfaces

### Key Implementation Notes
- **Non-blocking workflow**: Upload succeeds regardless of duplicates found
- **Contextual prompts**: Show duplicate management option immediately after upload
- **Progressive enhancement**: System works fine even if duplicates are ignored
- **Filtered views**: Duplicate management can focus on recently uploaded questions

## Next Steps

1. Clear conversation context to focus on implementation
2. Start with enabling pg_trgm extension
3. Create simple duplicate detection function
4. Test with existing question data
5. Integrate into upload workflow

---

*This research preserves the investigation findings for the new implementation approach.*
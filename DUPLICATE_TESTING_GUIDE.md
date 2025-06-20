# Duplicate Detection Testing Guide

**Created:** June 19, 2025. 6:01 PM Eastern Time  
**Purpose:** Complete testing framework for PostgreSQL pg_trgm duplicate detection system

## Overview

This guide provides everything needed to create and execute automated tests for the duplicate detection system that was just implemented. The system uses PostgreSQL's pg_trgm extension to find similar questions at configurable thresholds (60%-90%).

## System Architecture

### Backend Endpoints
- `POST /api/upload-markdown` - Uploads questions and returns duplicate info
- `GET /api/duplicates?threshold=0.8` - Returns all duplicates at given threshold  
- `GET /api/duplicates/scan?question_ids=id1,id2&threshold=0.8` - Scans specific questions
- `DELETE /api/duplicates/batch` - Deletes selected duplicates

### Frontend Features
- Post-upload duplicate notifications with management links
- Dedicated duplicate management view at `/duplicates` 
- Similarity threshold adjustment (60%-90%)
- Batch selection and deletion interface

## Testing Strategy

### Test Data Design
Create markdown files with **known similarity relationships**:

1. **High Similarity (90%+)**: Near-identical questions with minor wording changes
2. **Medium Similarity (80-89%)**: Similar concepts, different phrasing
3. **Low Similarity (60-79%)**: Related topics, different questions
4. **No Similarity (<60%)**: Completely different questions

### Sample Question Sources
Use questions from: `Docs/Supabase/BIW_400-ib-interview-questions_p6-18_markdown_gemini-2_5-flash-preview-04-17.md`

### Testing Approach
Simple bash scripts using curl to:
1. Upload test markdown files via API
2. Call duplicate detection endpoints
3. Parse JSON responses 
4. Validate expected vs actual duplicate pairs
5. Generate pass/fail reports

## Test File Structure

### Expected Directory Layout
```
test_data/
├── high_similarity_pairs.md      # 90%+ similar questions
├── medium_similarity_pairs.md    # 80-89% similar questions  
├── low_similarity_pairs.md       # 60-79% similar questions
├── clean_unique_questions.md     # No duplicates expected
├── cross_topic_duplicates.md     # Similar questions across topics
└── edge_cases.md                 # Formatting variations, special characters
```

### Test Script Structure
```
test_scripts/
├── run_duplicate_tests.sh        # Main test runner
├── upload_test_data.sh           # Upload all test files
├── validate_duplicates.sh        # Check detection results
└── cleanup_test_data.sh          # Remove test data after testing
```

## Implementation Requirements

### Prerequisites
1. PostgreSQL pg_trgm extension enabled in Supabase
2. Backend server running on localhost:8000
3. Valid JWT authentication token

### Test Data Requirements
Each test file should include:
- **Expected duplicate pairs** documented in comments
- **Similarity scores** estimated for validation
- **Topics and subtopics** for cross-topic testing
- **Edge cases** like formatting variations

### Validation Criteria
Tests should verify:
- **Correct duplicate pair identification** at each threshold
- **No false positives** (unique questions flagged as duplicates)
- **No false negatives** (known duplicates not detected)
- **Threshold sensitivity** (80% threshold finds 80%+ similar questions)
- **Cross-topic detection** (similar questions in different topics)

## Sample Test Cases

### High Similarity Test
```markdown
# Topic: Accounting
## Subtopic: Financial Statements
### Difficulty: Basic
#### Type: Question
    **Question:** Walk me through the 3 financial statements.
    **Answer:** [standard answer]

# Topic: Accounting  
## Subtopic: Financial Statements
### Difficulty: Basic
#### Type: Question
    **Question:** Can you walk me through the three financial statements?
    **Answer:** [same/similar answer]
```
**Expected:** 95% similarity, should be detected at 80%+ thresholds

### Medium Similarity Test  
```markdown
# Topic: Accounting
## Subtopic: Financial Statements
### Difficulty: Basic
#### Type: Question
    **Question:** What are the main financial statements?
    **Answer:** [answer about 3 statements]

# Topic: Accounting
## Subtopic: Financial Statements  
### Difficulty: Basic
#### Type: Question
    **Question:** How do the financial statements connect?
    **Answer:** [answer about linkages]
```
**Expected:** 85% similarity, should be detected at 80%+ thresholds

### Low Similarity Test
```markdown
# Topic: Accounting
## Subtopic: Financial Statements
### Difficulty: Basic  
#### Type: Question
    **Question:** What is depreciation?
    **Answer:** [depreciation explanation]

# Topic: Accounting
## Subtopic: Financial Statements
### Difficulty: Basic
#### Type: Question  
    **Question:** How does depreciation affect cash flow?
    **Answer:** [cash flow impact explanation]
```
**Expected:** 70% similarity, should only be detected at 60-70% thresholds

## Testing Workflow

### Manual Steps (One-time Setup)
1. Run pg_trgm migration: Execute `backend/database_migrations/enable_pg_trgm.sql` in Supabase
2. Start backend: `cd backend && npm run start:backend`
3. Get auth token: Use login endpoint or extract from browser session

### Automated Testing Steps
1. **Create test data**: Generate markdown files with known duplicate relationships
2. **Upload test files**: Use curl to POST files to `/api/upload-markdown`
3. **Extract question IDs**: Parse upload responses to get question IDs
4. **Test duplicate detection**: Call `/api/duplicates` at various thresholds
5. **Validate results**: Compare detected pairs against expected pairs
6. **Generate report**: Output pass/fail for each test case
7. **Cleanup**: Remove test data from database

### Success Criteria
- **Precision**: >90% of detected duplicates are actual duplicates
- **Recall**: >90% of actual duplicates are detected at appropriate thresholds
- **Threshold accuracy**: 80% threshold finds 80%+ similar questions
- **Performance**: Detection completes within 5 seconds for 100 questions
- **No false negatives**: Known duplicate pairs are always detected
- **Clean data handling**: Unique questions are never flagged as duplicates

## Troubleshooting

### Common Issues
- **pg_trgm not enabled**: Run migration SQL in Supabase first
- **Authentication errors**: Ensure valid JWT token in Authorization header
- **Threshold too high**: Lower threshold if expected duplicates not found
- **Backend not running**: Start with `npm run start:backend`

### Debug Commands
```bash
# Test backend connectivity
curl http://localhost:8000/health

# Test duplicate endpoint directly  
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:8000/api/duplicates?threshold=0.8"

# Check uploaded questions
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:8000/api/questions"
```

This framework provides complete test automation while remaining simple and maintainable.
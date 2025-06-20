# Duplicate Detection Test Suite

**Created:** June 19, 2025. 6:30 PM Eastern Time  
**Purpose:** Automated testing framework for PostgreSQL pg_trgm duplicate detection system

## Overview

This test suite provides comprehensive automated testing for the duplicate detection system that was implemented in the Q&A application. The system uses PostgreSQL's pg_trgm extension to find similar questions at configurable similarity thresholds (60%-90%).

## Test Structure

### Test Data Files
- `test_data/high_similarity_pairs.md` - Questions with 90%+ expected similarity
- `test_data/medium_similarity_pairs.md` - Questions with 80-89% expected similarity  
- `test_data/low_similarity_pairs.md` - Questions with 60-79% expected similarity
- `test_data/clean_unique_questions.md` - Unique questions (no duplicates expected)
- `test_data/cross_topic_duplicates.md` - Similar questions across different topics
- `test_data/edge_cases.md` - Formatting variations and special characters

### Test Scripts
- `run_duplicate_tests.sh` - Main test runner (executes full test suite)
- `upload_test_data.sh` - Uploads test markdown files via API
- `validate_duplicates.sh` - Tests duplicate detection at various thresholds
- `cleanup_test_data.sh` - Removes test data from database
- `config.sh` - Configuration and shared functions

## Prerequisites

### System Requirements
1. **PostgreSQL pg_trgm extension** - Run `backend/database_migrations/enable_pg_trgm.sql` in Supabase
2. **Backend server** - Start with `npm run start:backend` (port 8000)
3. **Required tools** - `curl`, `jq`, `bc` (usually pre-installed)

### Authentication
Set JWT authentication token:
```bash
export JWT_TOKEN="your_jwt_token_here"
```

## Usage

### Quick Start (Full Test Suite)
```bash
cd test_scripts
export JWT_TOKEN="your_token"
./run_duplicate_tests.sh
```

### Individual Components
```bash
# Upload test data only
./run_duplicate_tests.sh --upload-only

# Run validation tests only (requires data already uploaded)
./run_duplicate_tests.sh --validate-only

# Cleanup test data only
./run_duplicate_tests.sh --cleanup-only

# Run tests but keep data for manual inspection
./run_duplicate_tests.sh --keep-data
```

### Manual Step-by-Step
```bash
# 1. Upload test data
./upload_test_data.sh

# 2. Run validation tests
./validate_duplicates.sh

# 3. Clean up test data
./cleanup_test_data.sh
```

## Test Validation

### Expected Results by Threshold

| Test File | 90% | 85% | 80% | 70% | 60% |
|-----------|-----|-----|-----|-----|-----|
| High Similarity | 3 | 3 | 3 | 3 | 3 |
| Medium Similarity | 0 | 3 | 3 | 3 | 3 |
| Low Similarity | 0 | 0 | 0 | 3 | 3 |
| Clean Unique | 0 | 0 | 0 | 0 | 0 |
| Cross Topic | 0 | 3 | 3 | 3 | 3 |
| Edge Cases | 2 | 2 | 2 | 2 | 2 |

### Success Criteria
- **Precision**: >90% of detected duplicates are actual duplicates
- **Recall**: >90% of actual duplicates are detected at appropriate thresholds  
- **Threshold Accuracy**: 80% threshold finds 80%+ similar questions
- **No False Positives**: Unique questions never flagged as duplicates
- **Performance**: Detection completes within 5 seconds

## Output and Results

### Results Directory Structure
```
test_results/
├── test_log.txt                          # Execution log
├── test_config.txt                       # Test configuration
├── final_test_report.txt                 # Summary report
├── [filename]_question_ids.txt           # Question IDs for each test file
├── [filename]_upload_response.json       # Upload API responses
├── [filename]_duplicates_[threshold].json # Detection results by threshold
└── archive_[timestamp]/                  # Archived results
```

### Sample Output
```
=== Duplicate Detection Test Suite ===
Starting comprehensive test execution...

✓ All prerequisites met
✓ Test environment ready

=== Phase 1: Upload Test Data ===
✓ Successfully uploaded high_similarity_pairs.md (6 questions)
✓ Successfully uploaded medium_similarity_pairs.md (6 questions)
...

=== Phase 2: Validate Duplicate Detection ===
✓ high_similarity_pairs.md @ 0.9: Found 3 pairs (expected 3)
✓ high_similarity_pairs.md @ 0.85: Found 3 pairs (expected 3)
...

Total tests: 30
Passed: 28
Failed: 2
Success rate: 93.3%
```

## Troubleshooting

### Common Issues

**Authentication Error**
```bash
# Check token is set
echo $JWT_TOKEN

# Test authentication
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8000/api/questions
```

**Backend Not Running**
```bash
# Check backend status
curl http://localhost:8000/health

# Start backend
cd backend && npm run start:backend
```

**pg_trgm Not Enabled**
```sql
-- Run in Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_questions_text_trgm ON questions USING gin (question_text gin_trgm_ops);
```

**Missing Dependencies**
```bash
# Install on Ubuntu/Debian
sudo apt-get install curl jq bc

# Install on macOS
brew install curl jq bc
```

### Debug Mode
Set debug environment variable for verbose output:
```bash
export DEBUG=1
./run_duplicate_tests.sh
```

## Test Data Details

### High Similarity Pairs (90%+ Expected)
- Near-identical questions with minor word changes
- Same concepts, slightly different phrasing
- Should be detected at 80%+ thresholds

### Medium Similarity Pairs (80-89% Expected)  
- Similar concepts, different wording
- Related but distinct aspects of same topic
- Should be detected at 80%+ thresholds

### Low Similarity Pairs (60-79% Expected)
- Related topics, different questions
- Same domain, different specific concepts
- Should only be detected at 60-70% thresholds

### Clean Unique Questions
- Completely different topics and concepts
- Should never be flagged as duplicates
- Tests false positive prevention

### Cross-Topic Duplicates
- Similar questions across different topic categories
- Tests topic-independent duplicate detection
- Should behave like medium similarity

### Edge Cases
- Same content with different punctuation/capitalization
- Tests robustness of text similarity matching
- Should behave like high similarity

## Performance Benchmarks

Expected performance for typical test execution:
- Upload Phase: ~5-10 seconds (36 questions)
- Validation Phase: ~15-30 seconds (30 test cases)
- Cleanup Phase: ~3-5 seconds
- Total Runtime: ~30-60 seconds

## Extending Tests

### Adding New Test Cases
1. Create new markdown file in `test_data/`
2. Document expected duplicate pairs in comments
3. Add file to `TEST_FILES` array in `config.sh`
4. Define expected results in validation script
5. Update this README with new test descriptions

### Modifying Thresholds
Update `THRESHOLDS` array in `config.sh`:
```bash
THRESHOLDS=(0.50 0.60 0.70 0.80 0.85 0.90 0.95)
```

## Integration with CI/CD

This test suite can be integrated into continuous integration pipelines:

```yaml
# Example GitHub Actions step
- name: Run Duplicate Detection Tests
  run: |
    export JWT_TOKEN="${{ secrets.TEST_JWT_TOKEN }}"
    cd test_scripts
    ./run_duplicate_tests.sh
```

The test suite returns appropriate exit codes for automation:
- `0` - All tests passed
- `1` - Some tests failed (check detailed report)
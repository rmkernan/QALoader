# Duplicate Detection Setup Guide

**Created:** June 20, 2025. 9:03 AM Eastern Time  
**Purpose:** Step-by-step guide to enable duplicate detection in Supabase

## Quick Setup (Recommended)

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_trgm extension for text similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create performance index
CREATE INDEX IF NOT EXISTS idx_all_questions_trgm 
ON all_questions USING gin (question gin_trgm_ops);

-- Verify it worked
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_trgm';
```

## Full Setup Options

### Option 1: Basic pg_trgm (Minimum Required)
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from "Quick Setup" above
3. The system will use fallback application-level detection

### Option 2: With Database Functions (Better Performance)
1. Go to Supabase Dashboard → SQL Editor
2. Run: `backend/database_migrations/complete_pg_trgm_setup.sql`
3. This includes the `execute_sql` function for better performance

### Option 3: With Views (Alternative Approach)
1. Go to Supabase Dashboard → SQL Editor
2. Run: `backend/database_migrations/duplicate_detection_views.sql`
3. This creates views and functions that don't require execute_sql

## Testing the Setup

### Test 1: Check Extension
```sql
SELECT similarity('test', 'test') as should_be_one;
-- Expected: 1
```

### Test 2: Check Similarity Function
```sql
SELECT similarity(
    'Walk me through the 3 financial statements', 
    'Can you walk me through the three financial statements'
) as similarity_score;
-- Expected: 0.7-0.8
```

### Test 3: Find Existing Duplicates
```sql
SELECT 
    a.question_id,
    b.question_id,
    similarity(a.question, b.question) as score
FROM all_questions a, all_questions b
WHERE a.question_id < b.question_id
  AND similarity(a.question, b.question) > 0.8
LIMIT 5;
```

## Troubleshooting

### "pg_trgm extension not found"
- Your Supabase plan might not support extensions
- Contact Supabase support to enable pg_trgm

### "execute_sql function not found"
- The system will automatically fall back to application-level detection
- Or run Option 2 or 3 setup above

### Performance Issues
- Ensure the GIN index is created
- Consider lowering the similarity threshold
- Check if you have too many questions (>10,000)

## How It Works

1. **pg_trgm**: PostgreSQL extension for trigram-based text similarity
2. **Similarity Score**: 0.0 (completely different) to 1.0 (identical)
3. **Default Threshold**: 0.8 (80% similar)
4. **Fallback**: Uses Python's difflib if database methods fail

## Next Steps

After setup:
1. Re-run the test suite: `cd test_scripts && ./run_duplicate_tests.sh`
2. Check the Duplicate Management page in the UI
3. Adjust similarity thresholds based on results

## Support

If you need help:
1. Check backend logs for specific errors
2. Try the fallback method (automatically enabled)
3. Run test queries in SQL Editor to verify setup
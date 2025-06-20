-- Complete pg_trgm Setup for Duplicate Detection
-- Created: June 20, 2025. 9:00 AM Eastern Time
-- Purpose: Enable text similarity matching for duplicate question detection

-- Step 1: Enable the pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Create GIN index for performance
CREATE INDEX IF NOT EXISTS idx_all_questions_trgm 
ON all_questions USING gin (question gin_trgm_ops);

-- Step 3: Create the execute_sql function that the duplicate service expects
-- This function allows controlled execution of parameterized queries
CREATE OR REPLACE FUNCTION public.execute_sql(query text, params text[])
RETURNS TABLE(
    id1 text,
    text1 text,
    topic1 text,
    id2 text,
    text2 text,
    topic2 text,
    score float
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Security check: Only allow specific query patterns for duplicate detection
    IF query NOT LIKE '%similarity(a.question, b.question)%' THEN
        RAISE EXCEPTION 'Unauthorized query pattern';
    END IF;
    
    -- Execute the parameterized query
    RETURN QUERY EXECUTE query USING params[1], params[2];
END;
$$;

-- Step 4: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql(text, text[]) TO authenticated;

-- Step 5: Test the setup
-- This query should return the pg_trgm version if installed correctly
SELECT extname, extversion 
FROM pg_extension 
WHERE extname = 'pg_trgm';

-- Step 6: Test similarity function
-- This should return a similarity score between 0 and 1
SELECT similarity('Walk me through the 3 financial statements', 
                  'Can you walk me through the three financial statements') as similarity_score;

-- Expected output: ~0.7-0.8 similarity score
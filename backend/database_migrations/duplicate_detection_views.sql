-- Alternative Approach: Create Views for Duplicate Detection
-- Created: June 20, 2025. 9:01 AM Eastern Time
-- Purpose: Create database views that can be queried directly without execute_sql

-- First ensure pg_trgm is enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_all_questions_trgm 
ON all_questions USING gin (question gin_trgm_ops);

-- Create a view for finding duplicates of specific questions
CREATE OR REPLACE VIEW question_similarities AS
SELECT 
    a.question_id as question_id_1,
    a.question as question_text_1,
    a.topic as topic_1,
    b.question_id as question_id_2,
    b.question as question_text_2,
    b.topic as topic_2,
    similarity(a.question, b.question) as similarity_score
FROM all_questions a
CROSS JOIN all_questions b
WHERE a.question_id != b.question_id
  AND similarity(a.question, b.question) > 0.5; -- Minimum 50% similarity to reduce result set

-- Create a function to find duplicates for specific question IDs
CREATE OR REPLACE FUNCTION find_duplicates_for_questions(
    question_ids text[],
    threshold float DEFAULT 0.8
)
RETURNS TABLE(
    id1 text,
    text1 text,
    topic1 text,
    id2 text,
    text2 text,
    topic2 text,
    score float
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        question_id_1 as id1,
        question_text_1 as text1,
        topic_1 as topic1,
        question_id_2 as id2,
        question_text_2 as text2,
        topic_2 as topic2,
        similarity_score as score
    FROM question_similarities
    WHERE question_id_1 = ANY(question_ids)
      AND similarity_score >= threshold
    ORDER BY similarity_score DESC;
$$;

-- Grant permissions
GRANT SELECT ON question_similarities TO authenticated;
GRANT EXECUTE ON FUNCTION find_duplicates_for_questions(text[], float) TO authenticated;

-- Test queries
-- 1. Check if extension is working
SELECT similarity('test', 'test') as should_be_1;

-- 2. Find high similarity pairs in existing data
SELECT * FROM question_similarities 
WHERE similarity_score > 0.9 
LIMIT 5;

-- 3. Test the function with sample IDs
-- SELECT * FROM find_duplicates_for_questions(ARRAY['ACC-FSI-B-Q-001', 'ACC-FSI-B-Q-002'], 0.8);
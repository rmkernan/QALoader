-- Migration: Create RPC functions for staging workflow
-- Created: June 20, 2025. 10:02 AM Eastern Time
-- Purpose: Add RPC functions for duplicate detection in staging workflow

-- Function to find similar questions using pg_trgm
CREATE OR REPLACE FUNCTION find_similar_questions(
    search_text TEXT,
    threshold FLOAT DEFAULT 0.65,
    limit_count INT DEFAULT 5
)
RETURNS TABLE (
    question_id TEXT,
    topic TEXT,
    subtopic TEXT,
    question TEXT,
    similarity_score DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.question_id,
        q.topic,
        q.subtopic,
        q.question,
        similarity(
            q.topic || ' ' || q.subtopic || ' ' || q.question,
            search_text
        ) as similarity_score
    FROM all_questions q
    WHERE similarity(
        q.topic || ' ' || q.subtopic || ' ' || q.question,
        search_text
    ) > threshold
    ORDER BY similarity_score DESC
    LIMIT limit_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION find_similar_questions(TEXT, FLOAT, INT) TO authenticated;

-- Function to get batch statistics
CREATE OR REPLACE FUNCTION get_batch_statistics(batch_id_param TEXT)
RETURNS TABLE (
    status TEXT,
    count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sq.status::TEXT,
        COUNT(*)::BIGINT
    FROM staged_questions sq
    WHERE sq.upload_batch_id = batch_id_param
    GROUP BY sq.status;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_batch_statistics(TEXT) TO authenticated;

-- Function to update batch counts based on current staged questions
CREATE OR REPLACE FUNCTION update_batch_counts(batch_id_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    pending_count INT;
    approved_count INT;
    rejected_count INT;
    duplicate_count INT;
BEGIN
    -- Count questions by status
    SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END),
        COUNT(CASE WHEN status = 'approved' THEN 1 END),
        COUNT(CASE WHEN status = 'rejected' THEN 1 END),
        COUNT(CASE WHEN status = 'duplicate' THEN 1 END)
    INTO pending_count, approved_count, rejected_count, duplicate_count
    FROM staged_questions
    WHERE upload_batch_id = batch_id_param;
    
    -- Update batch counts
    UPDATE upload_batches
    SET 
        questions_pending = pending_count,
        questions_approved = approved_count,
        questions_rejected = rejected_count,
        questions_duplicate = duplicate_count
    WHERE batch_id = batch_id_param;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_batch_counts(TEXT) TO authenticated;
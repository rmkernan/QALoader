-- Enable PostgreSQL trigram extension for text similarity
-- Created: June 19, 2025. 6:01 PM Eastern Time
-- Purpose: Enable pg_trgm extension for duplicate detection using text similarity

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create performance index on question text
CREATE INDEX IF NOT EXISTS idx_all_questions_trgm 
ON all_questions USING gin (question gin_trgm_ops);

-- Verify extension is enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_trgm';
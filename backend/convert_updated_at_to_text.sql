-- Convert updated_at column from timestamptz to text format
-- Run this in Supabase SQL Editor to match both timestamp fields
-- Date: June 14, 2025. 4:27 p.m. Eastern Time

-- 1. Change updated_at column from timestamptz to text
-- This will ensure both uploaded_on and updated_at use the same string format
ALTER TABLE all_questions 
ALTER COLUMN updated_at TYPE TEXT;

-- 2. Remove the automatic update trigger since we'll handle timestamps in the API
DROP TRIGGER IF EXISTS update_questions_updated_at ON all_questions;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. Verify the column types
SELECT 
    column_name, 
    data_type, 
    character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'all_questions' 
AND column_name IN ('uploaded_on', 'updated_at')
ORDER BY column_name;
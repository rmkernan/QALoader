-- SQL updates to implement new abbreviation system
-- Run these queries in your Supabase SQL editor

-- 1. Update topic 'Accounting' to 'ACC'
UPDATE all_questions 
SET topic = 'ACC' 
WHERE topic = 'Accounting';

-- 2. Update undefined subtopics to 'UND'
UPDATE all_questions 
SET subtopic = 'UND' 
WHERE subtopic IN ('Undefined', 'undefined', 'Unknown', 'unknown', 'General', 'general', 'Misc', 'misc');

-- 3. Update question IDs to use new abbreviation system
-- This is more complex as it involves regenerating the entire question_id

-- First, let's see what we have (run this to check current data):
-- SELECT topic, subtopic, difficulty, type, question_id, COUNT(*) 
-- FROM all_questions 
-- GROUP BY topic, subtopic, difficulty, type, question_id 
-- ORDER BY topic, subtopic, difficulty, type;

-- Update question types in existing IDs - change 'G' to 'Q' for GenConcept questions
UPDATE all_questions 
SET question_id = REGEXP_REPLACE(question_id, '-G-(\d+)$', '-Q-\1')
WHERE question_id LIKE '%-G-%' AND type IN ('GenConcept', 'Definition', 'Analysis');

-- Update question types in existing IDs - change other types to appropriate codes
UPDATE all_questions 
SET question_id = REGEXP_REPLACE(question_id, '-D-(\d+)$', '-Q-\1')
WHERE question_id LIKE '%-D-%' AND type = 'Definition';

UPDATE all_questions 
SET question_id = REGEXP_REPLACE(question_id, '-C-(\d+)$', '-P-\1')
WHERE question_id LIKE '%-C-%' AND type = 'Calculation';

UPDATE all_questions 
SET question_id = REGEXP_REPLACE(question_id, '-A-(\d+)$', '-Q-\1')
WHERE question_id LIKE '%-A-%' AND type = 'Analysis';

-- If you have topic 'Accounting' in question IDs, update those too
UPDATE all_questions 
SET question_id = REGEXP_REPLACE(question_id, '^Accounting-', 'ACC-')
WHERE question_id LIKE 'Accounting-%';

-- Update any 'ACCOUNTING' variations
UPDATE all_questions 
SET question_id = REGEXP_REPLACE(question_id, '^ACCOUNTING-', 'ACC-')
WHERE question_id LIKE 'ACCOUNTING-%';

-- Verify the updates (run this after the updates):
-- SELECT topic, subtopic, difficulty, type, question_id 
-- FROM all_questions 
-- ORDER BY question_id;

-- If you need to completely regenerate question IDs based on new system:
-- WARNING: This will change all question IDs - only run if you're sure!
-- 
-- UPDATE all_questions 
-- SET question_id = (
--     CASE 
--         WHEN topic = 'Accounting' THEN 'ACC'
--         ELSE UPPER(LEFT(topic, 3))
--     END
--     || '-' ||
--     CASE 
--         WHEN subtopic IN ('Undefined', 'undefined', 'Unknown', 'unknown') THEN 'UND'
--         ELSE UPPER(LEFT(REGEXP_REPLACE(subtopic, '[^A-Za-z0-9]', ''), 3))
--     END
--     || '-' ||
--     LEFT(difficulty, 1)
--     || '-' ||
--     CASE 
--         WHEN type IN ('Problem', 'Calculation') THEN 'P'
--         ELSE 'Q'
--     END
--     || '-' ||
--     LPAD(ROW_NUMBER() OVER (
--         PARTITION BY topic, subtopic, difficulty, type 
--         ORDER BY question_id
--     )::text, 3, '0')
-- );
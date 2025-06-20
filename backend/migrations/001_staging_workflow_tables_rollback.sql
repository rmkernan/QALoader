-- Rollback Migration: 001_staging_workflow_tables_rollback.sql
-- Created: June 20, 2025. 9:50 AM Eastern Time - Rollback staging workflow tables
-- Description: Removes staging workflow tables if needed

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view their own batches" ON upload_batches;
DROP POLICY IF EXISTS "Users can create batches" ON upload_batches;
DROP POLICY IF EXISTS "Users can update their own batches" ON upload_batches;
DROP POLICY IF EXISTS "Users can view staging questions" ON staged_questions;
DROP POLICY IF EXISTS "Users can manage staging duplicates" ON staging_duplicates;

-- Drop tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS staging_duplicates CASCADE;
DROP TABLE IF EXISTS staged_questions CASCADE;
DROP TABLE IF EXISTS upload_batches CASCADE;

-- Note: The update_updated_at_column() function is kept as it may be used elsewhere
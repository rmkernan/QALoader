-- Migration: 001_staging_workflow_tables.sql
-- Created: June 20, 2025. 9:50 AM Eastern Time - Initial staging workflow tables
-- Description: Creates staging tables for the Q&A Loader staging workflow to prevent duplicates from reaching production

-- 1. Create upload_batches table to track upload sessions
CREATE TABLE upload_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    file_name TEXT NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 0,
    questions_pending INTEGER NOT NULL DEFAULT 0,
    questions_approved INTEGER NOT NULL DEFAULT 0,
    questions_rejected INTEGER NOT NULL DEFAULT 0,
    questions_duplicate INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'completed', 'cancelled')),
    review_started_at TIMESTAMPTZ,
    review_completed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    import_started_at TIMESTAMPTZ,
    import_completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for upload_batches
CREATE INDEX idx_upload_batches_uploaded_by ON upload_batches(uploaded_by);
CREATE INDEX idx_upload_batches_status ON upload_batches(status);
CREATE INDEX idx_upload_batches_created_at ON upload_batches(created_at DESC);

-- 2. Create staged_questions table (mirrors all_questions with staging fields)
CREATE TABLE staged_questions (
    -- Core fields matching all_questions
    question_id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Basic', 'Advanced')),
    type TEXT NOT NULL CHECK (type IN ('Definition', 'Problem', 'GenConcept', 'Calculation', 'Analysis', 'Question')),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    notes_for_tutor TEXT,
    
    -- Upload metadata (matching all_questions format)
    uploaded_on VARCHAR(50),
    uploaded_by VARCHAR(25),
    upload_notes VARCHAR(100),
    
    -- Staging-specific fields
    upload_batch_id UUID NOT NULL REFERENCES upload_batches(batch_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    duplicate_of TEXT, -- References question_id in all_questions if duplicate
    similarity_score FLOAT, -- Similarity score if duplicate (0-100)
    review_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for staged_questions
CREATE INDEX idx_staged_questions_batch_id ON staged_questions(upload_batch_id);
CREATE INDEX idx_staged_questions_status ON staged_questions(status);
CREATE INDEX idx_staged_questions_duplicate_of ON staged_questions(duplicate_of);
CREATE INDEX idx_staged_questions_created_at ON staged_questions(created_at DESC);

-- Create trigram index for similarity matching
CREATE INDEX idx_staged_questions_question_trgm ON staged_questions USING gin (question gin_trgm_ops);

-- 3. Create staging_duplicates table to track all detected duplicates
CREATE TABLE staging_duplicates (
    duplicate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staged_question_id TEXT NOT NULL REFERENCES staged_questions(question_id) ON DELETE CASCADE,
    existing_question_id TEXT NOT NULL, -- References question_id in all_questions
    similarity_score FLOAT NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 100),
    resolution TEXT CHECK (resolution IN ('pending', 'keep_both', 'use_existing', 'use_new', 'merge')),
    resolution_notes TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for staging_duplicates
CREATE INDEX idx_staging_duplicates_staged_question ON staging_duplicates(staged_question_id);
CREATE INDEX idx_staging_duplicates_existing_question ON staging_duplicates(existing_question_id);
CREATE INDEX idx_staging_duplicates_resolution ON staging_duplicates(resolution);
CREATE INDEX idx_staging_duplicates_similarity ON staging_duplicates(similarity_score DESC);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all staging tables
CREATE TRIGGER update_upload_batches_updated_at BEFORE UPDATE ON upload_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staged_questions_updated_at BEFORE UPDATE ON staged_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staging_duplicates_updated_at BEFORE UPDATE ON staging_duplicates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE staged_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_duplicates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own batches" ON upload_batches
    FOR SELECT USING (auth.uid()::text = uploaded_by);

CREATE POLICY "Users can create batches" ON upload_batches
    FOR INSERT WITH CHECK (auth.uid()::text = uploaded_by);

CREATE POLICY "Users can update their own batches" ON upload_batches
    FOR UPDATE USING (auth.uid()::text = uploaded_by);

CREATE POLICY "Users can view staging questions" ON staged_questions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM upload_batches 
        WHERE upload_batches.batch_id = staged_questions.upload_batch_id 
        AND upload_batches.uploaded_by = auth.uid()::text
    ));

CREATE POLICY "Users can manage staging duplicates" ON staging_duplicates
    FOR ALL USING (EXISTS (
        SELECT 1 FROM staged_questions sq
        JOIN upload_batches ub ON sq.upload_batch_id = ub.batch_id
        WHERE sq.question_id = staging_duplicates.staged_question_id
        AND ub.uploaded_by = auth.uid()::text
    ));
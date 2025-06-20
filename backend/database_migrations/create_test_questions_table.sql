-- Create Test Questions Table for Duplicate Detection Testing
-- Created: June 20, 2025. 9:20 AM Eastern Time
-- Purpose: Isolated table for testing duplicate detection without contaminating production data

-- Create test questions table with same structure as all_questions
CREATE TABLE IF NOT EXISTS test_questions (
    question_id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT,
    topic TEXT,
    subtopic TEXT,
    difficulty TEXT,
    type TEXT,
    notes_for_tutor TEXT,
    test_category TEXT NOT NULL, -- 'high_similarity', 'medium_similarity', 'low_similarity', 'unique', 'cross_topic', 'edge_cases'
    expected_duplicates TEXT[], -- Array of question IDs that should be duplicates with this question
    similarity_threshold FLOAT DEFAULT 0.8, -- Expected threshold for detection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigram index for similarity testing
CREATE INDEX IF NOT EXISTS idx_test_questions_trgm 
ON test_questions USING gin (question gin_trgm_ops);

-- Create index on test_category for filtering
CREATE INDEX IF NOT EXISTS idx_test_questions_category 
ON test_questions (test_category);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON test_questions TO authenticated;

-- Insert our test data with expected duplicate relationships
INSERT INTO test_questions (question_id, question, answer, topic, subtopic, difficulty, type, test_category, expected_duplicates, similarity_threshold) VALUES

-- High Similarity Pairs (90%+ expected similarity)
('TEST-HSP-001', 'Walk me through the 3 financial statements.', 'The 3 major financial statements are the Income Statement, Balance Sheet and Cash Flow Statement...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'high_similarity', ARRAY['TEST-HSP-002'], 0.9),
('TEST-HSP-002', 'Can you walk me through the three financial statements?', 'The three main financial statements are the Income Statement, Balance Sheet and Cash Flow Statement...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'high_similarity', ARRAY['TEST-HSP-001'], 0.9),

('TEST-HSP-003', 'Walk me through how Depreciation going up by $10 would affect the statements.', 'Income Statement: Operating Income would decline by $10...', 'Accounting', 'Financial Analysis', 'Basic', 'Problem', 'high_similarity', ARRAY['TEST-HSP-004'], 0.9),
('TEST-HSP-004', 'Show me how increasing Depreciation by $10 would impact the financial statements.', 'Income Statement: Operating Income decreases by $10...', 'Accounting', 'Financial Analysis', 'Basic', 'Problem', 'high_similarity', ARRAY['TEST-HSP-003'], 0.9),

('TEST-HSP-005', 'What happens when Inventory goes up by $10, assuming you pay for it with cash?', 'No changes to the Income Statement. On the Cash Flow Statement...', 'Accounting', 'Working Capital', 'Basic', 'Problem', 'high_similarity', ARRAY['TEST-HSP-006'], 0.9),
('TEST-HSP-006', 'What happens when Inventory increases by $10, paid with cash?', 'Income Statement is not affected. Cash Flow Statement...', 'Accounting', 'Working Capital', 'Basic', 'Problem', 'high_similarity', ARRAY['TEST-HSP-005'], 0.9),

-- Medium Similarity Pairs (80-89% expected similarity)
('TEST-MSP-001', 'Walk me through the 3 financial statements.', 'The 3 major financial statements are the Income Statement, Balance Sheet and Cash Flow Statement...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'medium_similarity', ARRAY['TEST-MSP-002'], 0.85),
('TEST-MSP-002', 'Can you give examples of major line items on each of the financial statements?', 'Income Statement: Revenue; Cost of Goods Sold; SG&A...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'medium_similarity', ARRAY['TEST-MSP-001'], 0.85),

('TEST-MSP-003', 'How do the 3 statements link together?', 'To tie the statements together, Net Income from the Income Statement flows...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'medium_similarity', ARRAY['TEST-MSP-004'], 0.85),
('TEST-MSP-004', 'If I were stranded on a desert island, only had 1 statement and I wanted to review the overall health of a company – which statement would I use and why?', 'You would use the Cash Flow Statement because it gives a true picture...', 'Accounting', 'Financial Analysis', 'Basic', 'Question', 'medium_similarity', ARRAY['TEST-MSP-003'], 0.85),

('TEST-MSP-005', 'What is Working Capital? How is it used?', 'Working Capital = Current Assets – Current Liabilities...', 'Accounting', 'Working Capital', 'Basic', 'Question', 'medium_similarity', ARRAY['TEST-MSP-006'], 0.85),
('TEST-MSP-006', 'How do you calculate Working Capital and what does it indicate?', 'Working Capital is calculated as Current Assets minus Current Liabilities...', 'Accounting', 'Working Capital', 'Basic', 'Question', 'medium_similarity', ARRAY['TEST-MSP-005'], 0.85),

-- Low Similarity Pairs (60-79% expected similarity)
('TEST-LSP-001', 'If Depreciation is a non-cash expense, why does it affect the cash balance?', 'Although Depreciation is a non-cash expense, it is tax-deductible...', 'Accounting', 'Depreciation', 'Basic', 'Question', 'low_similarity', ARRAY['TEST-LSP-002'], 0.7),
('TEST-LSP-002', 'Where does Depreciation usually show up on the Income Statement?', 'It could be in a separate line item, or it could be embedded...', 'Accounting', 'Depreciation', 'Basic', 'Question', 'low_similarity', ARRAY['TEST-LSP-001'], 0.7),

('TEST-LSP-003', 'Could you ever end up with negative shareholders equity? What does it mean?', 'Yes. It is common to see this in 2 scenarios...', 'Accounting', 'Equity Analysis', 'Basic', 'Question', 'low_similarity', ARRAY['TEST-LSP-004'], 0.7),
('TEST-LSP-004', 'What are the warning signs of a company in financial distress?', 'Key warning signs include declining cash flows, increasing debt levels...', 'Accounting', 'Financial Health', 'Basic', 'Question', 'low_similarity', ARRAY['TEST-LSP-003'], 0.7),

('TEST-LSP-005', 'Why is the Income Statement not affected by changes in Inventory?', 'This is a common interview mistake – incorrectly stating that Working Capital changes...', 'Accounting', 'Inventory Management', 'Basic', 'Question', 'low_similarity', ARRAY['TEST-LSP-006'], 0.7),
('TEST-LSP-006', 'When does inventory become an expense on the Income Statement?', 'Inventory becomes an expense (Cost of Goods Sold) on the Income Statement...', 'Accounting', 'Revenue Recognition', 'Basic', 'Question', 'low_similarity', ARRAY['TEST-LSP-005'], 0.7),

-- Clean Unique Questions (No duplicates expected)
('TEST-UNQ-001', 'Lets say I could only look at 2 statements to assess a companys prospects – which 2 would I use and why?', 'You would pick the Income Statement and Balance Sheet...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'unique', ARRAY[]::TEXT[], 0.0),
('TEST-UNQ-002', 'What is the difference between Enterprise Value and Equity Value?', 'Enterprise Value represents the total value of a companys operations...', 'Finance', 'Valuation', 'Intermediate', 'Question', 'unique', ARRAY[]::TEXT[], 0.0),
('TEST-UNQ-003', 'What are the key steps in executing a merger or acquisition?', 'Key steps include initial target identification, preliminary due diligence...', 'Investment Banking', 'M&A', 'Advanced', 'Question', 'unique', ARRAY[]::TEXT[], 0.0),
('TEST-UNQ-004', 'How do you determine optimal capital structure for a company?', 'Optimal capital structure balances the tax benefits of debt...', 'Corporate Finance', 'Capital Structure', 'Intermediate', 'Question', 'unique', ARRAY[]::TEXT[], 0.0),
('TEST-UNQ-005', 'What is the difference between systematic and unsystematic risk?', 'Systematic risk affects the entire market and cannot be diversified away...', 'Economics', 'Market Analysis', 'Basic', 'Question', 'unique', ARRAY[]::TEXT[], 0.0),
('TEST-UNQ-006', 'How does duration measure bond price sensitivity to interest rate changes?', 'Duration measures the percentage change in bond price for a 1% change...', 'Financial Markets', 'Fixed Income', 'Intermediate', 'Question', 'unique', ARRAY[]::TEXT[], 0.0),

-- Cross-Topic Duplicates (Similar questions across different topics)
('TEST-CTP-001', 'Walk me through the 3 financial statements.', 'The 3 major financial statements are the Income Statement, Balance Sheet and Cash Flow Statement...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'cross_topic', ARRAY['TEST-CTP-002'], 0.85),
('TEST-CTP-002', 'Can you walk me through the three main financial statements?', 'The three primary financial statements are the Income Statement, Balance Sheet and Cash Flow Statement...', 'Finance', 'Financial Analysis', 'Basic', 'Question', 'cross_topic', ARRAY['TEST-CTP-001'], 0.85),

('TEST-CTP-003', 'If I were stranded on a desert island, only had 1 statement and I wanted to review the overall health of a company – which statement would I use and why?', 'You would use the Cash Flow Statement because it gives a true picture...', 'Accounting', 'Cash Flow Analysis', 'Basic', 'Question', 'cross_topic', ARRAY['TEST-CTP-004'], 0.85),
('TEST-CTP-004', 'If you could only analyze one financial statement to assess a companys health, which would you choose and why?', 'I would choose the Cash Flow Statement because it provides the most accurate picture...', 'Corporate Finance', 'Financial Health', 'Basic', 'Question', 'cross_topic', ARRAY['TEST-CTP-003'], 0.85),

-- Edge Cases (Formatting variations, punctuation, capitalization)
('TEST-EDG-001', 'Walk me through the 3 financial statements.', 'The 3 major financial statements are the Income Statement, Balance Sheet and Cash Flow Statement...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'edge_cases', ARRAY['TEST-EDG-002'], 0.95),
('TEST-EDG-002', 'Walk me through the 3 financial statements?', 'The 3 major financial statements are the Income Statement; Balance Sheet; and Cash Flow Statement!...', 'Accounting', 'Financial Statements', 'Basic', 'Question', 'edge_cases', ARRAY['TEST-EDG-001'], 0.95),

('TEST-EDG-003', 'What is Working Capital? How is it used?', 'Working Capital = Current Assets – Current Liabilities...', 'Accounting', 'Working Capital', 'Basic', 'Question', 'edge_cases', ARRAY['TEST-EDG-004'], 0.95),
('TEST-EDG-004', 'what is WORKING CAPITAL? how is it USED?', 'working capital = current assets – current liabilities...', 'Accounting', 'Working Capital', 'Basic', 'Question', 'edge_cases', ARRAY['TEST-EDG-003'], 0.95);

-- Verify the data was inserted
SELECT 
    test_category,
    COUNT(*) as question_count,
    COUNT(CASE WHEN array_length(expected_duplicates, 1) > 0 THEN 1 END) as questions_with_expected_duplicates
FROM test_questions 
GROUP BY test_category 
ORDER BY test_category;
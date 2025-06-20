-- STAGING WORKFLOW TEST DATA RESET SCRIPT
  -- Run this to get back to a clean testing state

   -- 1. Clear all staging data
  DELETE FROM staging_duplicates;
  DELETE FROM staged_questions;
  DELETE FROM upload_batches;

  -- 2. Clear ALL test production questions (both TEST- and SQ- patterns)
  DELETE FROM all_questions WHERE question_id LIKE 'TEST-%';
  DELETE FROM all_questions WHERE question_id LIKE 'SQ-%';

  -- 3. Re-insert fresh test data
  -- Production questions for duplicate testing
  INSERT INTO all_questions (question_id, topic, subtopic, difficulty, type, question, answer, notes_for_tutor, uploaded_on,
  uploaded_by, upload_notes, updated_at) VALUES
  ('TEST-DCF-001', 'DCF', 'WACC', 'Basic', 'Problem', 'What is the weighted average cost of capital (WACC)?', 'WACC is the
  average rate of return a company expects to pay its security holders to finance its assets.', 'Basic WACC definition',
  '2025-06-20', 'test@example.com', 'Test production question for duplicate detection', '2025-06-20'),
  ('TEST-DCF-002', 'DCF', 'Terminal Value', 'Advanced', 'Problem', 'How do you calculate terminal value in a DCF model?',
  'Terminal value = FCF * (1 + g) / (WACC - g), where g is the perpetual growth rate.', 'Terminal value formula', '2025-06-20',       
  'test@example.com', 'Test production question for duplicate detection', '2025-06-20');

  -- Scenario 1: Clean batch (ready for review)
  INSERT INTO upload_batches (batch_id, uploaded_by, uploaded_at, file_name, total_questions, questions_pending,
  questions_approved, questions_rejected, questions_duplicate, status, notes, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'test@example.com', '2025-06-20 17:00:00+00', 'clean_batch.md', 3, 3, 0, 0, 0,
  'pending', 'Clean batch for testing workflow', NOW(), NOW());

  INSERT INTO staged_questions (question_id, topic, subtopic, difficulty, type, question, answer, upload_batch_id, status,
  uploaded_by, created_at, updated_at) VALUES
  ('SQ-001', 'M&A', 'Synergies', 'Basic', 'Question', 'What are the main types of synergies in M&A?', 'Revenue synergies
  (cross-selling, market access) and cost synergies (economies of scale, elimination of duplicates).',
  '11111111-1111-1111-1111-111111111111', 'pending', 'test@example.com', NOW(), NOW()),
  ('SQ-002', 'M&A', 'Valuation', 'Advanced', 'Problem', 'How do you value synergies in an M&A transaction?', 'Synergies are
  valued by calculating the NPV of incremental cash flows, discounted at the appropriate cost of capital.',
  '11111111-1111-1111-1111-111111111111', 'pending', 'test@example.com', NOW(), NOW()),
  ('SQ-003', 'M&A', 'Due Diligence', 'Basic', 'Question', 'What are the key areas of due diligence in M&A?', 'Financial, legal,       
  commercial, operational, tax, environmental, and IT due diligence.', '11111111-1111-1111-1111-111111111111', 'pending',
  'test@example.com', NOW(), NOW());

  -- Scenario 2: Mixed status batch (partially reviewed)
  INSERT INTO upload_batches (batch_id, uploaded_by, uploaded_at, file_name, total_questions, questions_pending,
  questions_approved, questions_rejected, questions_duplicate, status, notes, created_at, updated_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'reviewer@example.com', '2025-06-20 16:30:00+00', 'mixed_review.md', 4, 1, 2, 1, 0,        
  'reviewing', 'Partially reviewed batch', NOW(), NOW());

  INSERT INTO staged_questions (question_id, topic, subtopic, difficulty, type, question, answer, upload_batch_id, status,
  reviewed_by, reviewed_at, uploaded_by, created_at, updated_at) VALUES
  ('SQ-004', 'LBO', 'Leverage', 'Basic', 'Problem', 'What is the typical debt-to-equity ratio in an LBO?', 'LBOs typically use        
  60-80% debt financing, resulting in debt-to-equity ratios of 3:1 to 4:1.', '22222222-2222-2222-2222-222222222222', 'approved',      
  'reviewer@example.com', NOW(), 'test@example.com', NOW(), NOW()),
  ('SQ-005', 'LBO', 'Returns', 'Advanced', 'Problem', 'How do you calculate IRR in an LBO?', 'IRR = ((Exit Value / Initial
  Investment)^(1/years)) - 1', '22222222-2222-2222-2222-222222222222', 'approved', 'reviewer@example.com', NOW(),
  'test@example.com', NOW(), NOW()),
  ('SQ-006', 'LBO', 'Bad Question', 'Basic', 'Problem', 'What is money?', 'Money is used to buy things.',
  '22222222-2222-2222-2222-222222222222', 'rejected', 'reviewer@example.com', NOW(), 'test@example.com', NOW(), NOW()),
  ('SQ-007', 'LBO', 'Structure', 'Advanced', 'Question', 'What are the key components of LBO capital structure?', 'Senior debt,       
  subordinated debt, mezzanine financing, and equity contribution from the sponsor.', '22222222-2222-2222-2222-222222222222',
  'pending', NULL, NULL, 'test@example.com', NOW(), NOW());

  -- Scenario 3: Batch with duplicates
  INSERT INTO upload_batches (batch_id, uploaded_by, uploaded_at, file_name, total_questions, questions_pending,
  questions_approved, questions_rejected, questions_duplicate, status, notes, created_at, updated_at) VALUES
  ('33333333-3333-3333-3333-333333333333', 'test@example.com', '2025-06-20 16:00:00+00', 'duplicate_batch.md', 3, 1, 0, 0, 2,
  'pending', 'Batch with detected duplicates', NOW(), NOW());

  INSERT INTO staged_questions (question_id, topic, subtopic, difficulty, type, question, answer, upload_batch_id, status,
  duplicate_of, similarity_score, uploaded_by, created_at, updated_at) VALUES
  ('SQ-008', 'DCF', 'WACC', 'Basic', 'Problem', 'What is WACC and how is it calculated?', 'WACC (Weighted Average Cost of
  Capital) is the average rate of return a company expects to pay to finance its assets. It is calculated as: WACC = (E/V × Re) +     
   (D/V × Rd × (1-T))', '33333333-3333-3333-3333-333333333333', 'duplicate', 'TEST-DCF-001', 0.92, 'test@example.com', NOW(),
  NOW()),
  ('SQ-009', 'DCF', 'Terminal Value', 'Advanced', 'Problem', 'How do you calculate the terminal value in DCF analysis?',
  'Terminal value in DCF is calculated using the perpetuity growth method: TV = FCF × (1 + g) ÷ (WACC - g), where g is the
  perpetual growth rate.', '33333333-3333-3333-3333-333333333333', 'duplicate', 'TEST-DCF-002', 0.89, 'test@example.com', NOW(),      
  NOW()),
  ('SQ-010', 'Valuation', 'Multiples', 'Basic', 'Question', 'What are trading multiples in valuation?', 'Trading multiples
  compare a company to similar publicly traded companies using ratios like P/E, EV/EBITDA, EV/Revenue.',
  '33333333-3333-3333-3333-333333333333', 'pending', NULL, NULL, 'test@example.com', NOW(), NOW());

  -- Duplicate records
  INSERT INTO staging_duplicates (duplicate_id, staged_question_id, existing_question_id, similarity_score, created_at,
  updated_at) VALUES
  ('aaaaaaaa-bbbb-cccc-dddd-111111111111', 'SQ-008', 'TEST-DCF-001', 0.92, NOW(), NOW()),
  ('aaaaaaaa-bbbb-cccc-dddd-222222222222', 'SQ-009', 'TEST-DCF-002', 0.89, NOW(), NOW());

  -- Scenario 4: Ready for import
  INSERT INTO upload_batches (batch_id, uploaded_by, uploaded_at, file_name, total_questions, questions_pending,
  questions_approved, questions_rejected, questions_duplicate, status, notes, created_at, updated_at) VALUES
  ('44444444-4444-4444-4444-444444444444', 'test@example.com', '2025-06-20 15:30:00+00', 'ready_import.md', 2, 0, 2, 0, 0,
  'completed', 'Batch ready for production import', NOW(), NOW());

  INSERT INTO staged_questions (question_id, topic, subtopic, difficulty, type, question, answer, upload_batch_id, status,
  reviewed_by, reviewed_at, uploaded_by, created_at, updated_at) VALUES
  ('SQ-011', 'Bonds', 'Pricing', 'Advanced', 'Problem', 'How do you calculate bond duration?', 'Duration = Σ[(PV of Cash Flow ×       
  Time Period) / Bond Price]', '44444444-4444-4444-4444-444444444444', 'approved', 'test@example.com', NOW(), 'test@example.com',     
   NOW(), NOW()),
  ('SQ-012', 'Bonds', 'Yield', 'Basic', 'Question', 'What is yield to maturity?', 'YTM is the total return anticipated on a bond      
  if held until maturity, expressed as an annual rate.', '44444444-4444-4444-4444-444444444444', 'approved', 'test@example.com',      
  NOW(), 'test@example.com', NOW(), NOW());


-- Get constraints, indexes, and security policies for complete schema documentation
-- Run each section separately in Supabase SQL Editor
-- Date: June 14, 2025. 2:22 p.m. Eastern Time

-- 1. TABLE CONSTRAINTS (Primary keys, foreign keys, check constraints, unique constraints)
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.table_name IN ('all_questions', 'activity_log')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type, cc.check_clause
ORDER BY tc.table_name, tc.constraint_type;

-- 2. INDEXES
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('all_questions', 'activity_log')
ORDER BY tablename, indexname;

-- 3. ROW LEVEL SECURITY POLICIES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('all_questions', 'activity_log')
ORDER BY tablename, policyname;

-- 4. TABLE PERMISSIONS
SELECT 
    table_schema,
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name IN ('all_questions', 'activity_log')
ORDER BY table_name, grantee, privilege_type;

-- 5. TABLE STATISTICS (row counts, size info)
SELECT 
    schemaname,
    tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname = 'public' 
  AND relname IN ('all_questions', 'activity_log')
ORDER BY tablename;
Constraints. 
| table_name    | constraint_name        | constraint_type | columns     | check_clause            |
| ------------- | ---------------------- | --------------- | ----------- | ----------------------- |
| activity_log  | 2200_31913_1_not_null  | CHECK           | null        | id IS NOT NULL          |
| activity_log  | 2200_31913_2_not_null  | CHECK           | null        | action IS NOT NULL      |
| activity_log  | 2200_31913_4_not_null  | CHECK           | null        | timestamp IS NOT NULL   |
| activity_log  | activity_log_pkey      | PRIMARY KEY     | id          | null                    |
| all_questions | 2200_31904_10_not_null | CHECK           | null        | updated_at IS NOT NULL  |
| all_questions | 2200_31904_1_not_null  | CHECK           | null        | question_id IS NOT NULL |
| all_questions | 2200_31904_2_not_null  | CHECK           | null        | topic IS NOT NULL       |
| all_questions | 2200_31904_3_not_null  | CHECK           | null        | subtopic IS NOT NULL    |
| all_questions | 2200_31904_4_not_null  | CHECK           | null        | difficulty IS NOT NULL  |
| all_questions | 2200_31904_5_not_null  | CHECK           | null        | type IS NOT NULL        |
| all_questions | 2200_31904_6_not_null  | CHECK           | null        | question IS NOT NULL    |
| all_questions | 2200_31904_7_not_null  | CHECK           | null        | answer IS NOT NULL      |
| all_questions | 2200_31904_9_not_null  | CHECK           | null        | created_at IS NOT NULL  |
| all_questions | all_questions_pkey     | PRIMARY KEY     | question_id | null                    |

Indexes 
| schemaname | tablename     | indexname                  | indexdef                                                                                                   |
| ---------- | ------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| public     | activity_log  | activity_log_pkey          | CREATE UNIQUE INDEX activity_log_pkey ON public.activity_log USING btree (id)                              |
| public     | activity_log  | idx_activity_log_timestamp | CREATE INDEX idx_activity_log_timestamp ON public.activity_log USING btree ("timestamp" DESC)              |
| public     | all_questions | all_questions_pkey         | CREATE UNIQUE INDEX all_questions_pkey ON public.all_questions USING btree (question_id)                   |
| public     | all_questions | idx_questions_filters      | CREATE INDEX idx_questions_filters ON public.all_questions USING btree (topic, subtopic, difficulty, type) |

Row-Level Security 
No rules returned
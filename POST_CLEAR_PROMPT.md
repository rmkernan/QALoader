# Post-Clear Conversation Prompt

**Use this prompt to re-engage after conversation clear:**

---
**This work should be done on a new branch. 

I need to implement a staging workflow for the Q&A Loader application. This will change the upload process so that all new questions go to a staging table first, get checked for duplicates against the main table, and then require manual review before being imported to production.

**Context:**
- I have a working duplicate detection system using PostgreSQL pg_trgm extension
- Current workflow uploads directly to main `all_questions` table
- Problem: Duplicates contaminate production data immediately
- Solution: Staging workflow to catch duplicates before they reach main table

**Key Implementation Documents Available:**
1. `STAGING_WORKFLOW_HANDOFF_CONTEXT.md` - Complete project context and current state
2. `STAGING_WORKFLOW_IMPLEMENTATION_PLAN.md` - High-level architecture and planning  
3. `STAGING_WORKFLOW_TECHNICAL_SPEC.md` - Detailed technical specifications

**What I Need:**
- Database migrations for staging tables (staged_questions, upload_batches, staging_duplicates)
- Modified upload endpoint to target staging instead of main table
- New staging management API endpoints for review workflow
- Frontend interfaces for batch review and duplicate resolution
- Integration that compares staged_questions vs all_questions for duplicate detection

**Current Working System (Don't Break):**
- PostgreSQL with pg_trgm extension enabled and optimized
- JWT authentication working
- Upload endpoint at `POST /api/upload-markdown` 
- Duplicate detection service using 65-70% similarity threshold
- Test suite with 37 test questions for validation

**Implementation Phases:**
1. Database foundation (staging tables)
2. Backend core (staging service, modified upload)
3. Frontend interfaces (review UI)
4. Integration testing

**Success Criteria:**
- Zero duplicates reach main table from new uploads
- Clear review workflow for manual oversight
- Maintains current upload performance
- Seamless user experience with minimal learning curve

Please start by reading the context documents and then begin implementation with the database migrations for the staging tables.

---

**Files to read first:**
- `STAGING_WORKFLOW_HANDOFF_CONTEXT.md`
- `STAGING_WORKFLOW_TECHNICAL_SPEC.md`
- `STAGING_WORKFLOW_IMPLEMENTATION_PLAN.md`

Review this entire prompt and then formulate an action plan. Then present this plan to the user for approval before altering any code. Make sure you're doing all this work on a new git branch. 
# 🚀 PHASE 5 DEVELOPMENT PROMPT

**Use this prompt to start Phase 5 development with any Claude model**

---

## CONTEXT SETUP PROMPT

```
You are Claude Code working on the Q&A Loader project. I need you to implement Phase 5 - Bootstrap & Activity System Enhancement.

CRITICAL: Execute these MANDATORY setup steps FIRST:

## 1. SAFETY VERIFICATION
cd /mnt/c/PythonProjects/QALoader
pwd && git branch && git status

VERIFY outputs show:
- Directory: /mnt/c/PythonProjects/QALoader  
- Branch: feature/frontend-backend-integration (or main)
- Status: Clean working directory

## 2. READ COMPLETE PROJECT CONTEXT
Read these files in this EXACT order to understand the current state:

1. /mnt/c/PythonProjects/QALoader/FINAL_INTEGRATION_SUMMARY.md
2. /mnt/c/PythonProjects/QALoader/HANDOFF_PACKAGE.md  
3. /mnt/c/PythonProjects/QALoader/backend/PHASE5_CONTEXT.md
4. /mnt/c/PythonProjects/QALoader/backend/BACKEND_CONTEXT.md
5. /mnt/c/PythonProjects/QALoader/INTEGRATION_STATUS.md

## 3. VERIFY CURRENT APPLICATION STATE
The frontend-backend integration is COMPLETE and working. Current status:
- Frontend: React TypeScript app at /frontend/
- Backend: FastAPI with Phase 4 complete at /backend/
- Integration: Fully functional with JWT auth, CRUD operations, real data
- Branch: feature/frontend-backend-integration with commit e82ca99

## 4. CONFIRM PHASE 5 READINESS
Check that these Phase 4 files exist and are the correct size:
- /backend/app/services/question_service.py (~16KB)
- /backend/app/routers/questions.py (~14KB)

## 5. PHASE 5 OBJECTIVES
After reading the context files, implement Phase 5 which includes:
- Enhanced bootstrap data with dashboard statistics
- New analytics service for dashboard metrics  
- Activity trend analysis endpoints
- System health monitoring endpoints

BRANCH STRATEGY: Create feature/phase5-analytics from current state

REPORT: "Phase 5 developer ready - read all context files and verified current state"

THEN: Begin Phase 5 implementation following the roadmap in PHASE5_CONTEXT.md

The integration is complete and working - Phase 4 provides the foundation, Phase 5 adds enhanced analytics on top.
```

---

## ALTERNATIVE QUICK START PROMPT

If you want to jump straight to Phase 5 without reading all context:

```
You are Claude Code implementing Phase 5 of the Q&A Loader backend.

SETUP:
cd /mnt/c/PythonProjects/QALoader/backend
git checkout -b feature/phase5-analytics  
source venv/bin/activate

CONTEXT: 
- Phase 4 is COMPLETE - working FastAPI backend with 6 endpoints
- Frontend integration is COMPLETE - fully functional application
- Phase 5 goal: Enhanced analytics and dashboard improvements

READ: /mnt/c/PythonProjects/QALoader/backend/PHASE5_CONTEXT.md

IMPLEMENT: Enhanced bootstrap data, analytics service, dashboard endpoints

START: Extend app/services/question_service.py get_bootstrap_data() method with statistics and system health metrics per the Phase 5 context document.
```

---

## DEBUG PROMPT (If Issues Arise)

```
I'm having issues with the Q&A Loader project. Please help debug.

FIRST: Read /mnt/c/PythonProjects/QALoader/HANDOFF_PACKAGE.md troubleshooting section

CURRENT STATE:
- Directory: /mnt/c/PythonProjects/QALoader
- What I'm trying to do: [describe your goal]
- Error I'm seeing: [paste error message]

VERIFY:
1. Are both servers running? (backend port 8000, frontend port 3000)
2. Can you access http://localhost:3000 and login with admin123?
3. Check /mnt/c/PythonProjects/QALoader/BUG_TRACKER.md for known issues

RUN: ./run_quality_checks.sh to verify code state

Please diagnose the issue and provide step-by-step fix.
```

---

## TESTING PROMPT

```
I want to test the Q&A Loader application to verify everything works.

SETUP: 
cd /mnt/c/PythonProjects/QALoader
git status  # verify on correct branch

FOLLOW: The structured testing procedures in USER_TESTING_SCRIPTS.md

This includes:
- Starting both servers
- Testing authentication 
- Verifying CRUD operations
- Checking search/filtering
- Testing error scenarios

ESTIMATED TIME: 30-45 minutes total

Document any issues found in BUG_TRACKER.md format.

GOAL: Verify the frontend-backend integration is working correctly before proceeding with Phase 5 development.
```

---

## PRODUCTION DEPLOYMENT PROMPT

```
I want to deploy the Q&A Loader application to production.

CURRENT STATE: Complete full-stack application with frontend-backend integration

READ: /mnt/c/PythonProjects/QALoader/HANDOFF_PACKAGE.md section "For Production Deployment"

REQUIREMENTS:
- Frontend hosting (Vercel/Netlify recommended)
- Backend hosting (Railway/Heroku recommended)  
- Production Supabase database
- Environment variable configuration

STEPS:
1. Review security settings and environment variables
2. Set up production Supabase database
3. Configure hosting platforms
4. Test production build locally first
5. Deploy and verify functionality

Provide step-by-step deployment guide for chosen hosting platforms.
```

---

## FILE OVERVIEW FOR CONTEXT

**Essential files created during integration:**
- `HANDOFF_PACKAGE.md` - Complete project overview and setup guide
- `FINAL_INTEGRATION_SUMMARY.md` - What was accomplished  
- `USER_TESTING_SCRIPTS.md` - Structured testing procedures
- `BUG_TRACKER.md` - Issue tracking
- `INTEGRATION_STATUS.md` - Technical implementation details
- `run_quality_checks.sh` - Automated code validation
- `backend/PHASE5_CONTEXT.md` - Phase 5 implementation plan

**Current application state:**
- Fully functional frontend-backend integration
- JWT authentication working
- All CRUD operations with real database  
- Dashboard with real-time data
- Production-ready code quality

**Ready for:** Phase 5 development, production deployment, or continued testing.

---

**Copy the appropriate prompt above based on your next goal!**
# LLM Start Here - QALoader Project

**Created:** June 12, 2025. 3:15 p.m. Eastern Time  
**Purpose:** Quick orientation and navigation guide for new LLM instances

---

## 🎯 What This Project Is

**QALoader** is a financial education Q&A management system with:
- **React/TypeScript frontend** for content administrators
- **Python/FastAPI backend** with comprehensive APIs
- **Supabase database** for question storage
- **Google Gemini integration** for Markdown parsing

**Business Purpose:** Streamline financial education content curation and provide analytics-driven insights.

---

## 📚 Essential Reading Order

### **1. First - Understand the Project (Required)**
- **`PROJECT_OVERVIEW.md`** ← Complete project understanding
- **`DOCUMENTATION_CATALOG.md`** ← Navigation guide for all docs

### **2. Then - Choose Your Path Based on Task**

#### **🔧 Working on Backend/APIs:**
- **`backend/CLAUDE.md`** ← Backend development guidelines
- **`Docs/APIs_COMPLETE.md`** ← All 16 API endpoints documented
- **`Docs/BackendDesign.md`** ← Architecture and database design

#### **🎨 Working on Frontend/UI:**
- **`src/CLAUDE.md`** ← Frontend development guidelines
- **`Docs/LLM_README.md`** ← Detailed frontend architecture (192 lines)
- **Component files in `src/components/`**

#### **📋 Working on Documentation:**
- **`Docs/DocumentationStandards.md`** ← Required formatting standards
- **`CLAUDE.md`** ← General development guidelines

#### **🚀 Deployment Tasks:**
- **`Docs/DEPLOYMENT.md`** ← Complete deployment guide
- **`STARTUP_scripts/README_STARTUP.md`** ← Local development setup

#### **🤝 Multi-Agent Coordination:**
- **`MultiAgentFramework/Docs/SETUP_GUIDE.md`** ← Complete setup instructions

---

## 🚀 Quick Start Commands

### **Start the Application:**
```bash
# Windows: Double-click
STARTUP_scripts/start.bat

# Mac/Linux: Run in terminal
./STARTUP_scripts/start.sh
```

### **Access Points:**
- **Frontend:** http://localhost:5173 (Username: `admin`, Password: `admin123`)
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🎯 Common Task Quick References

### **"Fix a bug in the dashboard"**
→ `PROJECT_OVERVIEW.md` → `src/CLAUDE.md` → `src/components/DashboardView.tsx`

### **"Add a new API endpoint"**
→ `PROJECT_OVERVIEW.md` → `backend/CLAUDE.md` → `backend/app/routers/`

### **"Update documentation"**
→ `PROJECT_OVERVIEW.md` → `Docs/DocumentationStandards.md` → target file

### **"Deploy to production"**
→ `PROJECT_OVERVIEW.md` → `Docs/DEPLOYMENT.md`

### **"Understand the architecture"**
→ `PROJECT_OVERVIEW.md` → `Docs/BackendDesign.md` → `Docs/LLM_README.md`

---

## 🔧 Development Standards (Critical)

**Always follow these requirements:**
1. **Read `Docs/DocumentationStandards.md`** before any code changes
2. **Use `date` command** for timestamps (never guess)
3. **Follow existing patterns** in the codebase
4. **Test locally** using startup scripts
5. **Update documentation** for significant changes

---

## 🧠 Memory Protocol

**Before starting work:**
1. **Search project memory:** `mcp__neo4j-memory-global__search_nodes` with relevant terms
2. **Check for previous work:** Look for related entities and observations
3. **Update memory:** Add key findings as you work

**Common search terms:** "QALoader project", "Documentation", "Agent coordination", your specific task area

---

## 📁 Project Structure Overview

```
QALoader/
├── PROJECT_OVERVIEW.md      # 👈 START HERE - Complete project guide
├── DOCUMENTATION_CATALOG.md # 👈 Navigation hub for all docs
├── LLM_START_HERE.md        # 👈 This file - quick orientation
├── STARTUP_scripts/         # One-click application startup
├── src/                     # React frontend (Vite + TypeScript)
├── backend/                 # Python FastAPI backend
├── Docs/                    # Technical documentation
└── AgentCoord/             # Multi-agent coordination
```

---

## ✅ Orientation Checklist

After reading the essential documents, you should be able to answer:

- [ ] **What does QALoader do?** (Purpose and users)
- [ ] **What technologies are used?** (Frontend/backend stack)
- [ ] **How do I start the application?** (Startup process)
- [ ] **Where do I find task-specific documentation?** (Navigation paths)
- [ ] **What are the development standards?** (Code quality requirements)

**If you can't answer these, re-read `PROJECT_OVERVIEW.md`**

---

## 🆘 When You're Stuck

1. **Check `DOCUMENTATION_CATALOG.md`** for navigation paths
2. **Search project memory** for similar previous work
3. **Read the relevant CLAUDE.md file** for your area (root, backend/, src/)
4. **Look for examples** in existing code
5. **Ask for clarification** on the specific task requirements

---

**Next Step:** Read `PROJECT_OVERVIEW.md` to understand the complete project context, then return here to choose your task-specific documentation path.

*This file gets you oriented quickly so you can be productive immediately.*
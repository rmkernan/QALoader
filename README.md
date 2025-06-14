# QALoader - Financial Education Q&A Management System

**🤖 For LLMs:** See [ProjectRadar/PROJECT_INDEX.md](ProjectRadar/PROJECT_INDEX.md) - Quick project orientation  
**📋 For comprehensive overview:** See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)  
**🗺️ For documentation navigation:** See [DOCUMENTATION_CATALOG.md](DOCUMENTATION_CATALOG.md)  
**⚙️ For development guidelines:** See [CLAUDE.md](CLAUDE.md)  

## Quick Start

**🚀 Easy Startup:**
- **Windows:** Double-click `STARTUP_scripts/start.bat`
- **Mac/Linux:** Run `./STARTUP_scripts/start.sh` in Terminal

**📋 First-Time Setup:**
- **Windows:** Run `STARTUP_scripts\dev-setup.bat`  
- **Mac/Linux:** Run `./STARTUP_scripts/dev-setup.sh`

**📖 Complete Instructions:** See `STARTUP_scripts/README_STARTUP.md`

**Prerequisites:** Python 3.8+, Node.js, Supabase account

## 🆕 Latest Features

### Bulk Content Management (June 2025)
- **Mass Question Selection:** Checkbox controls with header select-all functionality
- **Bulk Delete Operations:** Delete multiple questions with safety confirmations
- **Enhanced Safety:** Large deletions (>10 items) require typing "DELETE" to confirm
- **Preview Capability:** See exactly which questions will be deleted before confirming
- **Change Detection:** Prevents unnecessary saves and accidental duplicate questions

### UI Improvements
- **Fixed Selection Bug:** Individual checkboxes now work correctly without selecting all items
- **Better Error Handling:** Improved API error messages and user feedback
- **Authentication Fixes:** Resolved token mismatches causing 403 errors

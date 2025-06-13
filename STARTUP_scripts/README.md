# QALoader Scripts Directory

**Created:** June 12, 2025. 2:50 p.m. Eastern Time  
**Purpose:** Development and startup automation scripts

---

## 📁 Directory Contents

### **🚀 Startup Scripts**
| Script | Platform | Purpose |
|--------|----------|---------|
| **`start.sh`** | Linux/Mac/WSL | One-click application startup |
| **`start.bat`** | Windows | One-click application startup |

### **🔧 Setup Scripts**
| Script | Platform | Purpose |
|--------|----------|---------|
| **`dev-setup.sh`** | Linux/Mac/WSL | First-time development environment setup |
| **`dev-setup.bat`** | Windows | First-time development environment setup |

### **📚 Documentation**
| File | Purpose |
|------|---------|
| **`README_STARTUP.md`** | Comprehensive startup guide with troubleshooting |
| **`README.md`** | This file - scripts directory overview |

---

## 🎯 Quick Start Workflow

### **First Time Setup:**
```bash
# Linux/Mac/WSL
./scripts/dev-setup.sh

# Windows
scripts\dev-setup.bat
```

### **Daily Development:**
```bash
# Linux/Mac/WSL
./scripts/start.sh

# Windows
scripts\start.bat
```

---

## 🏗️ Script Architecture

### **Startup Flow:**
1. **Environment Check** - Verify virtual environment and dependencies
2. **Port Validation** - Ensure ports 8000 and 5173 are available
3. **Backend Launch** - Start FastAPI server with auto-reload
4. **Frontend Launch** - Start Vite development server
5. **Health Verification** - Confirm both services are responding
6. **User Information** - Display access URLs and credentials

### **Setup Flow:**
1. **Prerequisites Check** - Verify Python 3.8+, Node.js, npm
2. **Virtual Environment** - Create and activate Python venv
3. **Backend Dependencies** - Install requirements.txt packages
4. **Frontend Dependencies** - Run npm install
5. **Configuration Validation** - Verify setup completed successfully

---

## 🔗 Integration with Project

### **Updated package.json:**
- `npm run start` - Concurrent frontend + backend
- `npm run start:backend` - Backend only
- `npm run start:frontend` - Frontend only

### **Project Structure Integration:**
```
QALoader/
├── scripts/              # 👈 All automation scripts here
│   ├── start.sh
│   ├── start.bat
│   ├── dev-setup.sh
│   ├── dev-setup.bat
│   ├── README_STARTUP.md
│   └── README.md
├── backend/              # Python FastAPI application
├── src/                  # React frontend application
└── package.json          # Updated with script commands
```

---

## 🚨 Platform Notes

### **Linux/Mac/WSL:**
- Scripts use `#!/bin/bash` shebang
- Require execute permissions: `chmod +x scripts/*.sh`
- Use `source venv/bin/activate` for Python environment

### **Windows:**
- Batch files for native Windows CMD
- Use `venv\Scripts\activate` for Python environment
- Double-click executable or run from command prompt

---

## 🛠️ Maintenance

### **Adding New Scripts:**
1. Place in `/scripts/` directory
2. Use consistent naming: `purpose.sh` / `purpose.bat`
3. Include header with creation date and purpose
4. Update this README.md with new script documentation

### **Script Standards:**
- Include error checking and user feedback
- Provide clear success/failure messages
- Handle common failure scenarios gracefully
- Include help text and usage examples

---

*This scripts directory provides a centralized, intuitive location for all QALoader development automation tools.*
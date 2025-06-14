# Pre-Built Context Packages Library

**Purpose:** Ready-to-use context packages for common development scenarios  
**Created:** June 13, 2025. 11:06 a.m. Eastern Time  
**Type:** Multi-Agent Resource - Pre-configured packages for immediate deployment  

---

## 📦 Package Library Overview

This library contains pre-built context packages for common QALoader development tasks. Orchestrators can use these directly or customize them for specific needs.

### Package Categories
1. **Feature Development** - Adding new functionality
2. **Bug Fixes** - Investigating and resolving issues
3. **Performance** - Optimization and scaling
4. **Security** - Authentication and authorization
5. **Integration** - Third-party services and APIs

---

## 🚀 Feature Development Packages

### Package: Add Question Categories
```yaml
Agent1_Backend_Package:
  task: "Implement question categories with database schema and API"
  deliverables:
    - Database migration for categories table
    - CRUD API endpoints for categories
    - Update question model with category relationship
  
  primary_files:
    - backend/app/models/question.py: "Add category_id field"
    - backend/app/services/question_service.py: "Add category filtering"
    - backend/app/routers/questions.py: "Add category endpoints"
  
  supporting_files:
    - backend/app/database.py: "Database client for migrations"
    - backend/create_tables.py: "Schema creation reference"
    - backend/app/models/auth.py: "Model pattern example"
  
  patterns:
    - "Pydantic Model: See QuestionCreate class"
    - "Service Layer: See get_questions() pattern"
    - "Router Pattern: See existing CRUD endpoints"
  
  implementation_order:
    1. Create category model in models/question.py
    2. Add migration in create_tables.py
    3. Implement service methods
    4. Add router endpoints
    5. Test with example requests

Agent2_Frontend_Package:
  task: "Add category UI components and filtering"
  deliverables:
    - Category selector component
    - Update question forms with category
    - Add category filter to dashboard
  
  primary_files:
    - src/components/CurationView.tsx: "Add category management"
    - src/types.ts: "Add Category interface"
    - src/services/api.ts: "Add category API calls"
  
  supporting_files:
    - src/components/QuestionModal.tsx: "Modal pattern reference"
    - src/contexts/AppContext.tsx: "State management"
    - src/constants.ts: "Add category constants"
  
  patterns:
    - "Component Pattern: See QuestionModal structure"
    - "API Integration: See existing service methods"
    - "Type Safety: Define interfaces first"
  
  ui_requirements:
    - Dropdown selector for categories
    - Category badge display
    - Filter chips on dashboard
    - Admin-only category management
```

### Package: File Upload Progress
```yaml
Agent1_Backend_Package:
  task: "Add real-time upload progress tracking"
  deliverables:
    - WebSocket endpoint for progress updates
    - Chunked file upload support
    - Progress calculation in upload service
  
  primary_files:
    - backend/app/routers/upload.py: "Current upload logic"
    - backend/app/services/question_service.py: "Processing logic"
    - backend/app/main.py: "Add WebSocket support"
  
  supporting_files:
    - backend/app/config.py: "Upload size limits"
    - backend/requirements.txt: "Add websockets dependency"
  
  patterns:
    - "FastAPI WebSocket: Research pattern"
    - "Chunked Upload: Implement streaming"
    - "Progress Events: Calculate and emit"

Agent2_Frontend_Package:
  task: "Show real-time upload progress UI"
  deliverables:
    - Progress bar component
    - WebSocket connection handling
    - Cancel upload functionality
  
  primary_files:
    - src/components/LoaderView.tsx: "Upload interface"
    - src/services/api.ts: "Add WebSocket client"
    - src/types.ts: "Progress event types"
  
  patterns:
    - "Progress Bar: Use existing loading patterns"
    - "WebSocket: Implement reconnection logic"
    - "State Updates: Handle progress events"
```

---

## 🐛 Bug Fix Packages

### Package: Login Session Timeout
```yaml
Agent1_Diagnosis_Package:
  task: "Investigate why users are logged out unexpectedly"
  investigation_areas:
    - JWT token expiration settings
    - Token refresh mechanism
    - Session validation logic
  
  primary_files:
    - backend/app/services/auth_service.py: "Check token validation"
    - backend/app/config.py: "Review JWT_EXPIRATION"
    - backend/app/routers/auth.py: "Trace auth flow"
  
  debug_steps:
    1. Check JWT expiration time in config
    2. Verify token refresh endpoint exists
    3. Test token validation edge cases
    4. Review error responses

Agent2_Fix_Package:
  task: "Implement proper session handling"
  fixes_needed:
    - Add token refresh mechanism
    - Handle 401 errors gracefully
    - Implement auto-logout on expiry
  
  primary_files:
    - src/contexts/AppContext.tsx: "Session management"
    - src/services/auth.ts: "Token refresh logic"
    - src/components/LoginView.tsx: "Error handling"
  
  implementation:
    - Add token refresh before expiry
    - Implement retry with new token
    - Show session timeout warning
```

### Package: Slow Dashboard Loading
```yaml
Agent1_Analysis_Package:
  task: "Profile backend performance bottlenecks"
  analysis_targets:
    - Database query performance
    - Data aggregation efficiency
    - API response times
  
  primary_files:
    - backend/app/services/analytics_service.py: "Check queries"
    - backend/app/database.py: "Database performance"
    - backend/app/routers/questions.py: "Response times"
  
  profiling_tools:
    - Add query timing logs
    - Check database indexes
    - Measure service method duration

Agent2_Optimization_Package:
  task: "Optimize frontend rendering performance"
  optimization_targets:
    - Reduce unnecessary re-renders
    - Implement data caching
    - Add loading states
  
  primary_files:
    - src/components/DashboardView.tsx: "Optimize renders"
    - src/contexts/AppContext.tsx: "Cache strategy"
    - src/services/api.ts: "Request caching"
  
  techniques:
    - React.memo for components
    - useMemo for calculations
    - Implement request caching
    - Progressive data loading
```

---

## 🔒 Security Packages

### Package: Add Role-Based Access
```yaml
Agent1_RBAC_Package:
  task: "Implement role-based permissions system"
  deliverables:
    - User roles (admin, editor, viewer)
    - Permission decorators for endpoints
    - Role validation in services
  
  primary_files:
    - backend/app/models/auth.py: "Add role field"
    - backend/app/services/auth_service.py: "Role validation"
    - backend/app/routers/: "Apply permissions"
  
  implementation_guide:
    1. Add role enum to user model
    2. Create permission decorator
    3. Apply to sensitive endpoints
    4. Test role restrictions

Agent2_UI_Package:
  task: "Add role-based UI elements"
  deliverables:
    - Show/hide features by role
    - Role indicator in UI
    - Permission error handling
  
  primary_files:
    - src/contexts/AppContext.tsx: "Store user role"
    - src/components/: "Conditional rendering"
    - src/types.ts: "Role type definitions"
  
  ui_patterns:
    - Permission wrapper component
    - Role-based navigation
    - Disabled state for restricted actions
```

### Package: API Rate Limiting
```yaml
Agent1_RateLimit_Package:
  task: "Implement API rate limiting"
  requirements:
    - Per-user rate limits
    - Rate limit headers
    - Graceful limit handling
  
  primary_files:
    - backend/app/main.py: "Add middleware"
    - backend/app/config.py: "Rate limit settings"
    - backend/requirements.txt: "Add slowapi"
  
  implementation:
    - Use slowapi for FastAPI
    - Configure limits per endpoint
    - Add custom error responses

Agent2_ErrorHandling_Package:
  task: "Handle rate limit errors in UI"
  requirements:
    - Show rate limit messages
    - Retry logic with backoff
    - User-friendly notifications
  
  primary_files:
    - src/services/api.ts: "Handle 429 errors"
    - src/App.tsx: "Global error handling"
    - src/constants.ts: "Error messages"
```

---

## 🔧 Performance Packages

### Package: Database Query Optimization
```yaml
Agent1_QueryOpt_Package:
  task: "Optimize slow database queries"
  analysis_required:
    - Identify slow queries
    - Add missing indexes
    - Optimize query patterns
  
  primary_files:
    - backend/app/services/: "All service queries"
    - backend/app/database.py: "Query helpers"
    - backend/create_tables.py: "Index definitions"
  
  optimization_steps:
    1. Log query execution times
    2. Identify N+1 queries
    3. Add strategic indexes
    4. Batch similar queries

Agent2_Caching_Package:
  task: "Implement frontend caching"
  caching_strategy:
    - API response caching
    - Computed value memoization
    - Static data persistence
  
  primary_files:
    - src/services/api.ts: "Response caching"
    - src/hooks/: "Create cache hooks"
    - src/contexts/AppContext.tsx: "Cache management"
```

### Package: Bundle Size Reduction
```yaml
Agent1_Analysis_Package:
  task: "Analyze JavaScript bundle size"
  tools:
    - Run bundle analyzer
    - Identify large dependencies
    - Find duplicate code
  
  primary_files:
    - package.json: "Check dependencies"
    - vite.config.ts: "Build configuration"
    - tsconfig.json: "Compilation settings"

Agent2_Optimization_Package:
  task: "Reduce bundle size"
  techniques:
    - Code splitting
    - Lazy loading
    - Tree shaking
    - Dependency optimization
  
  primary_files:
    - src/App.tsx: "Implement lazy routes"
    - src/components/: "Split large components"
    - package.json: "Optimize dependencies"
```

---

## 🔌 Integration Packages

### Package: Add Gemini AI Integration
```yaml
Agent1_API_Package:
  task: "Create Gemini AI service endpoints"
  integration_points:
    - Question generation endpoint
    - Content analysis endpoint
    - Response formatting
  
  primary_files:
    - backend/app/services/gemini_service.py: "Create service"
    - backend/app/routers/ai.py: "Create endpoints"
    - backend/app/config.py: "Add API keys"
  
  patterns:
    - External service pattern
    - Error handling for API calls
    - Response transformation

Agent2_UI_Package:
  task: "Add AI features to UI"
  features:
    - AI question generation button
    - Loading states for AI calls
    - Results display
  
  primary_files:
    - src/services/geminiService.ts: "Existing integration"
    - src/components/CurationView.tsx: "Add AI features"
    - src/types.ts: "AI response types"
```

### Package: Email Notifications
```yaml
Agent1_Email_Package:
  task: "Implement email notification system"
  requirements:
    - Email service integration
    - Template system
    - Queue for reliability
  
  primary_files:
    - backend/app/services/email_service.py: "Create service"
    - backend/app/config.py: "Email settings"
    - backend/requirements.txt: "Add email library"

Agent2_Settings_Package:
  task: "Add notification preferences UI"
  features:
    - Notification settings page
    - Email preference toggles
    - Test email button
  
  primary_files:
    - src/components/SettingsView.tsx: "Create component"
    - src/types.ts: "Settings types"
    - src/services/api.ts: "Settings API"
```

---

## 📊 Package Selection Guide

### Quick Reference Matrix

| Task Type | Package | Agent1 Focus | Agent2 Focus | Complexity |
|-----------|---------|--------------|--------------|------------|
| **New Feature** | Feature Dev | Backend implementation | Frontend UI | Medium |
| **Bug Fix** | Bug Investigation | Root cause analysis | User-facing fixes | Low-Medium |
| **Performance** | Optimization | Backend profiling | Frontend optimization | High |
| **Security** | Access Control | Permission system | UI restrictions | Medium |
| **Integration** | External Service | API integration | UI features | Medium-High |

### Package Customization
```python
def customize_package(base_package: dict, specific_requirements: dict) -> dict:
    """Customize a pre-built package for specific needs"""
    
    customized = base_package.copy()
    
    # Add specific files
    if 'additional_files' in specific_requirements:
        customized['primary_files'].extend(specific_requirements['additional_files'])
    
    # Modify task description
    if 'task_modification' in specific_requirements:
        customized['task'] = f"{base_package['task']} - {specific_requirements['task_modification']}"
    
    # Add constraints
    if 'constraints' in specific_requirements:
        customized['constraints'] = specific_requirements['constraints']
    
    return customized
```

---

## 🔄 Package Maintenance

### Updating Packages
- Review package effectiveness after each use
- Update file paths when project structure changes
- Add new patterns as they emerge
- Remove deprecated approaches

### Creating New Packages
1. Identify common task pattern
2. Analyze typical file requirements
3. Document implementation order
4. Test with real scenarios
5. Add to library with examples

---

*This Context Package Library provides orchestrators with ready-to-deploy packages that eliminate agent discovery time and ensure consistent, high-quality development outcomes.*
# Project Radar Context Loader

**Purpose:** Main entry point for loading project context with Augment Code-style awareness  
**Created:** June 13, 2025. 11:06 a.m. Eastern Time  
**Type:** Core Integration Protocol - Enables semi-automatic contextual understanding  

---

## 🚀 Quick Start

### Basic Usage
**ONLY use after simple tools fail and user confirms complexity**

```markdown
User: "I tried Glob and Read but still need help with multi-component auth feature"
Assistant: "radar: load context for authentication system"
Assistant: *Loads relevant auth-related files and patterns*
```

### What Happens (When Actually Needed)
1. **Load Relevant Files** - Only files directly related to confirmed complex task
2. **Apply Known Patterns** - Use established project patterns
3. **Provide Context** - Give focused understanding for the specific task
4. **No Automatic Loading** - User must confirm complexity first

---

## 📋 Context Loading Protocol

### Step 1: Confirm Task Complexity
Before any context loading:
1. Try simple tools first (Glob, Grep, Read)
2. If they don't work, ask user for more details
3. Only proceed if user confirms genuine complexity

### Step 2: Initial Memory Search
```python
def load_project_context():
    """
    Load comprehensive project understanding from memory
    """
    # Search for architectural knowledge
    architecture = search_memory([
        "QALoader Architecture",
        "File Dependency Graph",
        "Backend Code Patterns",
        "Frontend Code Patterns"
    ])
    
    # Load recent development patterns
    patterns = search_memory([
        "Successful Development Patterns",
        "Common Bug Solutions",
        "Performance Optimizations"
    ])
    
    # MANDATORY: Load documentation standards
    documentation_standards = search_memory([
        "Documentation Standards",
        "Timestamp Requirements",
        "File Header Standards",
        "JSDoc Requirements"
    ])
    
    # Retrieve project-specific context
    project_context = search_memory([
        "Project Radar Session Context",
        "Recent Development Sessions",
        "Integration Patterns"
    ])
    
    return integrate_context(architecture, patterns, documentation_standards, project_context)
```

### Step 2: Architecture Analysis
```python
def analyze_current_architecture():
    """
    Load and analyze ARCHITECTURE_MAP.md for current system state
    """
    # Load dynamic architecture map
    architecture_map = load_file("ProjectRadar/ARCHITECTURE_MAP.md")
    
    # Extract key relationships
    components = extract_components(architecture_map)
    dependencies = extract_dependencies(architecture_map)
    patterns = extract_patterns(architecture_map)
    
    # Build understanding model
    return {
        'components': components,
        'dependencies': dependencies,
        'patterns': patterns,
        'impact_map': build_impact_map(dependencies)
    }
```

### Step 3: Task-Specific Context with Adaptive Intelligence
```python
def load_task_context(task_description: str):
    """
    Load context specific to the described task with complexity analysis
    """
    # Classify task intent
    task_intent = classify_intent(task_description)
    
    # Use context discovery algorithms
    relevant_files = discover_relevant_files(
        task_intent, 
        confidence_threshold=7.0
    )
    
    # Load applicable patterns
    patterns = find_applicable_patterns(task_intent)
    
    # Generate focused context
    context = {
        'intent': task_intent,
        'primary_files': filter_files(relevant_files, score=8.0),
        'supporting_files': filter_files(relevant_files, score=6.0-7.9),
        'patterns': patterns,
        'documentation': find_relevant_docs(task_intent)
    }
    
    # NEW: Analyze complexity and recommend approach
    from adaptive_intelligence import TaskComplexityAnalyzer
    analyzer = TaskComplexityAnalyzer()
    complexity_analysis = analyzer.calculate_complexity_score(
        task_description, 
        context
    )
    
    # Add recommendation to context
    context['complexity_analysis'] = complexity_analysis
    context['coordination_recommendation'] = complexity_analysis['recommendation']
    
    return context
```

---

## 🎯 Context Loading Commands

### General Context Load
```markdown
## Command: "radar: load project context"

### Loads:
1. Complete architecture understanding
2. All major component relationships  
3. Common development patterns
4. Recent project history

### Use When:
- Starting new development session
- Need comprehensive project overview
- Unsure where to begin
- Want to understand system holistically
```

### Task-Specific Context Load
```markdown
## Command: "radar: load context for [task description]"

### Examples:
- "radar: load context for fixing login bug"
- "radar: load context for adding new API endpoint"
- "radar: load context for optimizing dashboard performance"

### Loads:
1. Files specific to task (8.0+ relevance)
2. Applicable code patterns
3. Related documentation
4. Historical solutions to similar tasks
```

### Component-Specific Context Load
```markdown
## Command: "radar: load [component] context"

### Examples:
- "radar: load authentication context"
- "radar: load frontend context"
- "radar: load database context"

### Loads:
1. All files related to component
2. Component-specific patterns
3. Integration points
4. Common issues and solutions
```

### Adaptive Intelligence Context Load
```markdown
## Command: "radar: analyze [task description]"

### Examples:
- "radar: analyze implementing user notifications"
- "radar: analyze fixing database performance issues"
- "radar: analyze building admin dashboard"

### Provides:
1. Full context loading PLUS complexity analysis
2. Single vs multi-agent recommendation
3. Confidence score for recommendation
4. Reasoning behind the recommendation

### Response Format:
## Task Analysis Complete

**Complexity Assessment:** [Low/Medium/High] (Score: X/100)
**Recommendation:** [Single-agent/Multi-agent] approach
**Confidence:** X%

**Reasoning:**
[Detailed explanation of factors]

[Specific recommendation with next steps]
```

---

## 📊 Context Loading Strategies

### Progressive Loading Strategy
```python
class ProgressiveContextLoader:
    """
    Loads context progressively based on relevance scores
    """
    def load_context(self, task: str):
        # Phase 1: Core context (Score 9.0+)
        core_context = self.load_essential_files(task)
        yield core_context
        
        # Phase 2: Supporting context (Score 7.0-8.9)
        if needs_more_context(task):
            supporting = self.load_supporting_files(task)
            yield supporting
        
        # Phase 3: Extended context (Score 5.0-6.9)
        if complex_task(task):
            extended = self.load_extended_context(task)
            yield extended
```

### Smart Loading Strategy
```python
class SmartContextLoader:
    """
    Intelligently loads context based on task patterns
    """
    def load_by_pattern(self, task: str):
        task_pattern = identify_pattern(task)
        
        pattern_contexts = {
            'api_development': self.load_api_context,
            'bug_fix': self.load_debug_context,
            'ui_component': self.load_frontend_context,
            'performance': self.load_performance_context,
            'security': self.load_security_context
        }
        
        loader = pattern_contexts.get(task_pattern)
        return loader() if loader else self.load_general_context()
```

---

## 🔄 Multi-Agent Integration

### Orchestrator Context Loading
```markdown
## For Orchestrators: Creating Agent Packages

When orchestrator uses: "radar: load context for [task]"

1. **Load comprehensive context**
   - All relevant files and patterns
   - Dependencies and relationships
   - Historical solutions

2. **Create focused packages**
   - Agent1: Backend-specific files
   - Agent2: Frontend-specific files
   - Clear deliverables for each

3. **Distribute efficiently**
   - Minimal overlap between agents
   - Complete context for each role
   - No discovery needed
```

### Context Package Creation
```python
def create_agent_packages(full_context: dict, task: str):
    """
    Transform full context into focused agent packages
    """
    # Analyze task for agent responsibilities
    agent_roles = determine_agent_roles(task)
    
    # Create Agent1 package (typically backend)
    agent1_package = {
        'files': filter_backend_files(full_context['files']),
        'patterns': filter_backend_patterns(full_context['patterns']),
        'deliverables': extract_backend_deliverables(task),
        'context': backend_specific_context(full_context)
    }
    
    # Create Agent2 package (typically frontend)  
    agent2_package = {
        'files': filter_frontend_files(full_context['files']),
        'patterns': filter_frontend_patterns(full_context['patterns']),
        'deliverables': extract_frontend_deliverables(task),
        'context': frontend_specific_context(full_context)
    }
    
    return {
        'Agent1': agent1_package,
        'Agent2': agent2_package
    }
```

---

## 📈 Context Loading Examples

### Example 1: Authentication Feature
```markdown
User: "radar: load context for adding password reset"

System Response:
## Context Loaded for Password Reset Feature

### Architecture Understanding
- Authentication system uses JWT tokens
- Email service not yet implemented
- Current auth flow: Login → Token → Protected routes

### Primary Files (9.0+ relevance)
- backend/app/services/auth_service.py - Core auth logic
- backend/app/routers/auth.py - Auth endpoints
- backend/app/models/auth.py - User model
- src/components/LoginView.tsx - Login UI
- src/contexts/AppContext.tsx - Auth state

### Applicable Patterns
- JWT token generation (see create_access_token)
- Email service pattern (new implementation needed)
- Password hashing with bcrypt
- Frontend form validation

### Suggested Implementation
1. Add password reset token to user model
2. Create email service for sending reset links
3. Add reset endpoints to auth router
4. Create reset UI component
5. Update auth context for reset flow
```

### Example 2: Performance Issue
```markdown
User: "radar: load context for slow dashboard"

System Response:
## Context Loaded for Dashboard Performance

### Performance Analysis Points
- Dashboard makes 5 API calls on load
- No caching implemented
- Large data aggregations in analytics service

### Primary Files (9.0+ relevance)
- src/components/DashboardView.tsx - Main dashboard
- backend/app/services/analytics_service.py - Data processing
- src/services/api.ts - API call patterns
- src/contexts/AppContext.tsx - State management

### Optimization Patterns
- React.memo for component optimization
- API response caching pattern
- Progressive data loading
- Query optimization techniques

### Performance History
- Similar issue resolved in questions list
- Caching reduced load time by 60%
- Consider pagination for large datasets
```

---

## 🛠️ Advanced Context Commands

### Memory-Enhanced Loading
```markdown
## Command: "radar: load context with memory for [task]"

Includes:
- Historical solutions to similar problems
- Previously successful patterns
- Lessons learned from past attempts
- Evolution of the codebase
```

### Pattern-Focused Loading
```markdown
## Command: "radar: load patterns for [task type]"

Examples:
- "radar: load patterns for API development"
- "radar: load patterns for state management"
- "radar: load patterns for error handling"
```

### Integration Context Loading
```markdown
## Command: "radar: load integration context for [components]"

Examples:
- "radar: load integration context for auth and frontend"
- "radar: load integration context for database and API"
```

---

## 📊 Context Quality Metrics

### Measuring Context Effectiveness
```python
class ContextQualityMetrics:
    def __init__(self):
        self.metrics = {
            'relevance_accuracy': 0,    # Were loaded files actually used?
            'completeness': 0,          # Was anything missing?
            'load_time': 0,            # How fast was context ready?
            'task_success': 0,         # Did context enable task completion?
            'pattern_applicability': 0  # Were patterns useful?
        }
    
    def calculate_context_quality(self):
        weights = {
            'relevance_accuracy': 0.30,
            'completeness': 0.25,
            'load_time': 0.15,
            'task_success': 0.20,
            'pattern_applicability': 0.10
        }
        
        quality_score = sum(
            self.metrics[metric] * weight 
            for metric, weight in weights.items()
        )
        
        return quality_score * 100
```

### Continuous Improvement
```python
def improve_context_loading():
    """
    Learn from context usage to improve future loads
    """
    # Track which files were actually used
    used_files = track_file_usage()
    
    # Update relevance scoring
    update_relevance_scores(used_files)
    
    # Learn new patterns
    identify_new_patterns(development_session)
    
    # Store improvements
    save_to_memory({
        'successful_context_loads': used_files,
        'new_patterns_discovered': patterns,
        'relevance_adjustments': score_updates
    })
```

---

## 🛡️ Investigation-First Protocol

### For Vague or Unclear Requests

When users provide non-specific tasks like "fix the login bug" or "optimize performance":

#### Step 1: Load Context with Project Radar
```python
def handle_vague_request(user_request: str):
    """
    Handle unclear requests with investigation-first approach
    """
    # Load relevant context first
    context = load_task_context(user_request)
    
    # Begin smart investigation
    investigation_results = smart_investigate(context, user_request)
    
    # Report findings and seek clarification
    return report_and_clarify(investigation_results, user_request)
```

#### Step 2: Smart Investigation Protocol
```markdown
## Investigation Checklist (Execute in Order)

1. **Error Log Analysis**
   - Check browser console for JavaScript errors
   - Review backend logs for API failures
   - Scan for recent error patterns

2. **Code Quality Scan**
   - Run lint checks (ESLint, pylint, etc.)
   - Check TypeScript compilation errors
   - Review recent code changes

3. **Documentation Review**
   - Search for known issues in README/docs
   - Check bug tracking or issue lists
   - Review recent commits for related fixes

4. **Pattern Analysis**
   - Identify common failure points for this component
   - Check integration points and dependencies
   - Review similar issues in codebase history
```

#### Step 3: Report and Clarify
```markdown
## Reporting Template

"Loaded [component] context via Project Radar. Investigation findings:

**Potential Issues Found:**
- [Specific error/warning 1 with location]
- [Specific error/warning 2 with location]
- [Pattern/dependency issue if applicable]

**Quick Wins Identified:**
- [Low-hanging fruit fixes]
- [Obvious improvements]

**Questions for Clarification:**
- Is this the specific issue: [most likely candidate]?
- Or are you experiencing: [alternative scenarios]?
- Need more details about: [unclear aspects]?

Please confirm which issue to address, or provide more specific symptoms."
```

### Example: Handling "Fix Login Bug"

#### User Request:
```
"radar: fix the login bug"
```

#### Smart Response:
```markdown
## Context Loaded: Authentication System

Project Radar loaded complete authentication context including:
- Frontend: LoginView.tsx, AppContext.tsx  
- Backend: auth_service.py, auth.py routes
- Integration: JWT tokens, CORS, error handling

## Investigation Results:

**Errors Found:**
1. Browser console shows "JWT validation failed" on login attempts
2. ESLint warning in LoginView.tsx line 45: unused variable 'error'
3. Backend logs show 401 responses for valid credentials

**Code Quality Issues:**
- No TypeScript errors detected
- Auth service follows established patterns
- Recent commit 3 days ago modified JWT secret handling

**Most Likely Issue:** JWT validation logic in auth_service.py may have issue with token expiry checking

**Clarification Needed:**
- Is the issue that users can't log in at all?
- Or are users getting logged out unexpectedly?
- Or is it a specific error message users are seeing?

Please confirm the specific behavior you're experiencing so I can target the exact fix needed.
```

---

## 🚨 Troubleshooting

### Context Not Loading
```markdown
If context fails to load:
1. Check if memory search is working
2. Verify file paths are correct
3. Ensure architecture map is up to date
4. Try more specific task description
```

### Irrelevant Files Loaded
```markdown
If getting wrong files:
1. Be more specific in task description
2. Use component-specific loading
3. Check relevance scoring thresholds
4. Update pattern recognition
```

### Missing Critical Files
```markdown
If files are missing:
1. Manually add to context
2. Update relevance scoring
3. Check file naming patterns
4. Update architecture map
```

---

## 🚨 Critical Safeguards

### NEVER Proceed Without Investigation and Approval

```markdown
## Mandatory Sequence for All Code Changes

1. ✅ **INVESTIGATE FIRST**
   - Load context with Project Radar
   - Run smart investigation protocol
   - Identify specific issues and root causes

2. ✅ **REPORT FINDINGS**  
   - Present investigation results clearly
   - Explain potential solutions and their impact
   - Identify any dependencies or risks

3. ✅ **SEEK APPROVAL**
   - Wait for user confirmation of approach
   - Address any questions or concerns
   - Clarify scope and expectations

4. ✅ **ENFORCE DOCUMENTATION STANDARDS**
   - MANDATORY: Run `date` command for current timestamp
   - MANDATORY: Convert to American format (Month Day, Year. H:MM a.m./p.m. Eastern Time)
   - MANDATORY: Apply all project documentation standards
   - MANDATORY: Use actual current timestamp, never guess

5. ✅ **IMPLEMENT WITH AWARENESS**
   - Proceed with confidence and clear direction
   - Follow approved approach exactly
   - Track which patterns and files were actually useful
   - Note any missing context or incorrect predictions

6. ✅ **UPDATE PROJECT RADAR** (CRITICAL - NEVER SKIP)
   - MANDATORY: Update ARCHITECTURE_MAP.md with new components/flows
   - MANDATORY: Add validated patterns to CONTEXT_DISCOVERY.md
   - MANDATORY: Document actual vs predicted complexity in ADAPTIVE_INTELLIGENCE.md
   - MANDATORY: Update effectiveness metrics with real results
   - MANDATORY: Fix any inaccurate claims or outdated information
```

### 🚨 DOCUMENTATION STANDARDS ENFORCEMENT

```markdown
## MANDATORY Before Any File Creation/Modification

### Step 1: Get Current Timestamp
ALWAYS run this command first:
```bash
date
```
Example output: Fri Jun 13 11:55:04 EDT 2025

### Step 2: Convert to Project Format
Transform bash output to American format:
- Input: "Fri Jun 13 11:55:04 EDT 2025"
- Output: "June 13, 2025. 11:55 a.m. Eastern Time"

### Step 3: Apply Standards Memory
Search memory for: "Documentation Standards"
Load current project documentation requirements
Apply ALL mandatory formatting rules

### Step 4: File Header Rules
- NEW files: Use ONLY @created with current timestamp
- EXISTING files: ADD new @updated line (never overwrite)
- NEVER guess timestamps - always use actual current time

🚨 FAILURE TO FOLLOW = CRITICAL PROJECT VIOLATION
```

### Code Change Red Flags
```markdown
🚨 STOP if you find yourself:
- Making code changes without understanding the full problem
- Modifying files before investigating error logs
- Implementing solutions without user approval
- Changing multiple components without impact analysis
- Creating files without running `date` command first
- Guessing at timestamps instead of using actual current time
- Overwriting existing @updated lines in file headers

✅ INSTEAD:
- Use Investigation-First Protocol above
- Report findings and seek clarification
- Get explicit approval before any code changes
- Run `date` command and convert to American format
- Search memory for "Documentation Standards"
- Apply all mandatory documentation requirements
- Maintain clear communication throughout
```

---

## 📝 Project Radar Feedback Protocol

### CRITICAL: Update Project Radar After Every Use

```markdown
## Why This Matters
- Project Radar improves through real usage feedback
- Future context loading becomes more accurate
- Claims stay validated with actual data
- Patterns evolve with your codebase

## What to Update After Task Completion

### 1. ARCHITECTURE_MAP.md
- Add new component relationships discovered
- Update data flow diagrams with actual implementations
- Document integration patterns that worked
- Fix any outdated architectural information

### 2. CONTEXT_DISCOVERY.md
- Add validated file relevance scores (actual vs predicted)
- Update task-to-file mappings with real results
- Document which patterns were most useful
- Note any files that should have been included

### 3. ADAPTIVE_INTELLIGENCE.md (if used)
- Record actual complexity vs predicted score
- Document if recommendation was accepted
- Note actual time/efficiency gains
- Update pattern recognition rules

### 4. README.md
- Update effectiveness metrics with measured results
- Correct any claims that proved inaccurate
- Add new proven capabilities discovered
- Keep success metrics current

## Update Example
```
After implementing password reset:
- ARCHITECTURE_MAP.md: Added password reset flow (Email → Token → Update → Login)
- CONTEXT_DISCOVERY.md: Validated auth files scored 9.0/10 relevance (accurate)
- README.md: Updated "77% token savings validated in production use"
```
```

---

*The Context Loader provides contextual understanding that improves through systematic feedback and updates.*
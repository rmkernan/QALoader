# Project Radar Quick Start (for Claude)

**Created:** June 13, 2025. 11:06 a.m. Eastern Time  
**Updated:** June 13, 2025. 4:15 p.m. Eastern Time - Streamlined for Claude workflow efficiency
**Updated:** June 13, 2025. 5:45 p.m. Eastern Time - Fixed critical process gaps after authentication failure analysis

## What Project Radar Is:
Contextual understanding system that auto-discovers relevant files for specific tasks instead of manual codebase searching.

## Your Role:
1. User says "I want to use Project Radar, read the quick start"
2. You read this file (done!)
3. You ask: "I'm ready to use Project Radar. What specific task can I help you with?"

## Critical Gate: Try Simple First
**ALWAYS follow this sequence:**
1. **Quick Assessment**: Parse request for simple indicators (file types, specific errors, single files)
2. **Try Simple Tools**: Use 1-2 direct tool calls (Glob/Grep/Read) for 30 seconds max
3. **Reality Check**: If simple tools don't solve it, STOP and ask user for more context
4. **User-Guided Escalation**: Only use full Project Radar if user confirms complexity

### Simple Task Indicators:
- File extensions mentioned (*.bat, *.py, *.json)
- "Find", "read", "check", "startup script", "config file"  
- Error messages mentioning specific files
- Single file/component issues

### When to Stop and Ask:

**🚨 CRITICAL: Success = Understanding, Not Just Finding Files**

**Simple Tool Success:** You can answer the user's specific question
**Simple Tool Failure:** You found files but can't explain the behavior/issue

**Signs You Should STOP and Ask:**
- ✗ "I found auth files but don't understand why no registration"
- ✗ "I see the code but not why it works this way"  
- ✗ "Files exist but behavior seems incomplete"
- ✗ "I found components but don't understand the architecture"

If your simple tools don't **solve and explain** the problem:
- **DON'T assume complexity or missing features**
- **ASK**: "I found [specific files] but need to understand [specific architectural question]. Should I read the architecture documentation?"
- **LET USER decide** if full Project Radar is needed

## How Project Radar Works (When Actually Needed):
1. User confirms task is genuinely complex after simple approach fails
2. Analyze task intent using algorithms in CONTEXT_DISCOVERY.md
3. Score files for relevance (8.0+ priority gets loaded)
4. Load only high-priority files using standard tools
5. Provide focused context for the task

## Available Resources:
- **CONTEXT_DISCOVERY.md** - Core algorithms for task analysis and file scoring
- **ARCHITECTURE_MAP.md** - System component relationships and design patterns
- **README.md** - Complete Project Radar documentation

### 🏗️ When to Read ARCHITECTURE_MAP.md Automatically:
- Authentication/security questions (login, registration, permissions)
- "Why doesn't X exist?" questions (missing features, design decisions)
- System behavior questions (not just file locations)
- Cross-component integration issues
- Questions about design patterns or architectural intent

## Token Efficiency:
Project Radar saves 70-78% tokens by loading only relevant files vs. comprehensive analysis.

---

**Workflow:** 
1. Ask user what specific task they need help with
2. Read CONTEXT_DISCOVERY.md to learn the analysis algorithms
3. Apply algorithms to identify relevant files for their task
4. Load targeted context and begin work
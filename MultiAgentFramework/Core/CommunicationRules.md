# Multi-Agent Communication Rules

**Version:** 1.1  
**Updated:** June 13, 2025. 2:54 p.m. Eastern Time - Added End-of-Mission Protocol based on real-world testing  
**Critical:** These rules enable asynchronous coordination between Orchestrator and Agents

---

## Core Communication Protocol

### 1. File-Based Message Passing
- **Channel Files:** Agent1.md and Agent2.md in Core/
- **Direction:** Bidirectional (Orchestrator ↔ Agent)
- **Persistence:** Messages remain for full session history

### 2. Token-Efficient Hybrid Sections
Communication uses **three-section structure** to balance rich communication with token efficiency:

**CURRENT ASSIGNMENT:** Active task (agents read only this section)
**RECENT RESPONSES:** Last 2-3 exchanges for context  
**ARCHIVED EXCHANGES:** Historical record for human reference

**Format:**
```markdown
## CURRENT ASSIGNMENT
---[SENDER-YYYY.MM.DD-HH:MM]---
Status: [CURRENT STATUS]
Task: [DESCRIPTION - no arbitrary length limits]
Priority: [HIGH/MEDIUM/LOW]

[Detailed instructions as needed for clarity]
[Include all necessary context and requirements]
[Reference specific files, tools, success criteria]

Deliverable: [Expected output format]
Next: [What happens after completion]
---

## RECENT RESPONSES
[Last 2-3 completed exchanges for context]

## ARCHIVED EXCHANGES  
[Older exchanges moved here for full audit trail]
```

### 3. Auxiliary File Protocol
For complex instructions exceeding 15 lines:
```markdown
DETAILED INSTRUCTIONS: Read /MultiAgentFramework/Core/[SpecificInstructions].md
```

### 4. Flexible Trigger System

**Orchestrator to Agent (Task Assignment):**
- Orchestrator announces: "Agent [N]'s task is ready to go" + startup prompt
- User copies startup prompt to new Claude instance

**Agent to Orchestrator (Task Completion):**
- Flexible completion signals from user:
  - "Agent 1 ready for Orchestrator" 
  - "A1 ready for O"
  - "Agent 1 is done and ready for your review"
  - Or any natural variation

**Critical Rules:**
- Agents CANNOT trigger each other
- ONLY the human operator provides triggers  
- NO autonomous checking of files
- Process is fully asynchronous
- Natural language triggers preferred over formal codes

### 5. Message Reading Protocol

**Reality Check:** Agents naturally read entire Agent[N].md files when instructed to "read Agent2.md for your assignment." The framework achieves token efficiency through **mission lifecycle management** rather than reading restrictions.

**Agents:**
1. Read Agent[N].md file (will include full content)
2. Focus on CURRENT ASSIGNMENT section for active task
3. Execute the current assignment with full context
4. Write response in CURRENT ASSIGNMENT section (no length limits)

**Orchestrator:**
1. Writes assignments to CURRENT ASSIGNMENT section
2. Waits for user trigger to check responses  
3. Reads agent responses from CURRENT ASSIGNMENT section
4. Moves completed exchanges to RECENT RESPONSES
5. **Resets agent files after mission completion** (see End-of-Mission Protocol)
6. Synthesizes findings across all agent work

### 6. Status Indicators

**Standard Status Values:**
- `INITIAL STARTUP` - First assignment
- `IN PROGRESS` - Task execution ongoing  
- `COMPLETED` - Task finished, deliverable ready
- `BLOCKED` - Waiting for dependencies
- `HANDOFF` - Context management needed
- `ERROR` - Issue requires orchestrator attention

### 7. Communication Efficiency Tips

**DO:**
- Front-load critical information in CURRENT ASSIGNMENT
- Use bullet points and clear structure
- Reference specific file paths and tools
- Include comprehensive success criteria
- Specify deliverable format and location
- Provide full context needed for task execution

**DON'T:**
- Include unnecessary historical context
- Repeat instructions from RECENT RESPONSES
- Use vague language or assumptions
- Split complex tasks artificially
- Assume agents remember previous context

### 8. Example Exchange

**Orchestrator → Agent1 (CURRENT ASSIGNMENT section):**
```markdown
---[ORCHESTRATOR-2025.12.06-18:30]---
Status: NEW TASK
Task: Comprehensive documentation structure analysis
Priority: HIGH

Use Glob tool to find all .md files in project directories
Categorize files by purpose: guides, references, standards, templates
Identify main entry points and navigation paths for new LLMs
Analyze file organization and potential redundancy issues
Assess documentation quality and completeness gaps

Focus areas:
- File discovery and categorization
- Entry point effectiveness 
- Navigation path validation
- Gap identification for common developer tasks

Deliverable: Create comprehensive analysis summary in this section
Success criteria: Clear categorization with specific recommendations
Next: Will assign quality assessment based on structural findings
---
```

**Agent1 Response (Same CURRENT ASSIGNMENT section):**
```markdown
---[AGENT1-2025.12.06-18:45]---
Status: COMPLETED
Task: Documentation structure analysis complete
Result: Comprehensive analysis of 73 .md files across 6 main directories

STRUCTURAL FINDINGS:
• AgentCoord/: 27 files (21 archived, 6 active coordination)
• MultiAgentFramework/: 18 files (complete framework documentation)
• Docs/: 11 files (technical specifications and guides)
• backend/: 6 files (development context and setup)
• STARTUP_scripts/: 2 files (automation helpers)
• Root level: 9 files (entry points and overview)

ENTRY POINT ANALYSIS:
Primary path: README.md → PROJECT_OVERVIEW.md → DOCUMENTATION_CATALOG.md
Alternative path: LLM_START_HERE.md (quick orientation)
Navigation effectiveness: 95% - clear hierarchy with task-specific paths

ORGANIZATION ASSESSMENT:
Strengths: Logical directory structure, clear file naming, comprehensive coverage
Opportunities: Some archived content could be better organized
Quality: Professional documentation standards throughout

RECOMMENDATIONS:
1. Current structure is highly effective for LLM navigation
2. Archive management could be streamlined
3. No major reorganization needed - system working well

Deliverable: Analysis complete with specific findings above
Next: Ready for quality assessment assignment or strategic synthesis
---
```

### 9. Section Management

**Orchestrator Maintenance:**
1. After agent completion, move exchange from CURRENT to RECENT RESPONSES
2. When RECENT RESPONSES has 3+ exchanges, move oldest to ARCHIVED
3. Keep CURRENT ASSIGNMENT clear for next task
4. Maintain full audit trail while optimizing token usage

**When agent needs clarification:**
1. Agent completes what's possible
2. Documents blockers in response
3. Orchestrator provides clarification

**When task is too complex:**
1. Orchestrator breaks into subtasks
2. Assigns incrementally
3. Maintains context across assignments

### 10. System Constraints

**Technical Limitations:**
- No direct agent-to-agent communication
- No real-time synchronization
- No automatic triggers
- No shared memory between agents

**Design Benefits:**
- **Token efficiency:** Fresh agent workspaces prevent context bloat (31 lines vs 429+ lines)
- **Rich communication:** No artificial limits when task complexity requires detail
- **Parallel work:** Multiple agents work independently without blocking
- **Clear audit trail:** Mission history preserved in dedicated archives
- **Mission-focused:** Each new mission starts with clean workspace

### 11. End-of-Mission Protocol

**When Mission Completes:**
1. **Archive Communication:** Move Agent[N].md content to `Missions/[MissionName]/Communication_Archive.md`
2. **Reset Agent Files:** Replace with fresh templates (instructions + empty sections)
3. **Preserve Deliverables:** Mission outputs remain in project structure
4. **Update Memory:** Store key insights in Neo4j for future sessions

**Benefits:**
- **Next mission startup:** Agents read ~30 lines instead of 400+
- **Context cleanliness:** No irrelevant historical communication
- **Mission focus:** Each workspace dedicated to current objectives
- **Audit preservation:** Full communication history maintained in archives

---

*These communication rules enable efficient multi-agent coordination through mission lifecycle management rather than reading restrictions.*
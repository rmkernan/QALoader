# Agent & Orchestrator Handoff Protocol

**Purpose:** Ensure seamless continuity across context clearing/compacting and agent transitions

**Created:** June 12, 2025. 10:35 a.m. Eastern Time

## Context Management Strategy

### **Recommended Approach: COMPACTING**
- **Preserves critical context** while reducing token usage
- **Maintains project understanding** and decision history
- **Keeps coordination awareness** intact
- **Reduces re-onboarding time** significantly

### **When to Compact/Clear**
- **Agent Context**: When approaching 80% of context limit
- **Orchestrator Context**: When coordination becomes difficult due to context size
- **Proactive**: Before starting major new phases or initiatives

## Pre-Handoff Preparation Protocol

### **🚨 MANDATORY: Execute Before Context Management**

#### **1. Complete Memory Update**
```bash
# Update current work status
mcp__neo4j-memory-global__add_observations: 
- Current task progress and findings
- Key decisions made during session
- Important discoveries about project state
- Next steps and recommendations

# Create handoff entity if needed
mcp__neo4j-memory-global__create_entities:
- Session summary with critical context
- Handoff instructions for next agent/orchestrator
```

#### **2. Create Handoff Document**
**File naming**: `Handoff_[Agent/Orchestrator]_[Date]_[Time].md`

**Required sections:**
```markdown
# [Agent/Orchestrator] Session Handoff

**Session Period:** [Start] to [End]
**Context Status:** [Full/Near-Full/Clearing/Compacting]
**Next Agent/Orchestrator:** [Instructions]

## Critical Context Preservation
- Key decisions made and rationale
- Important project discoveries
- Current task status and progress
- Coordination state with other agents

## Immediate Next Steps
- [ ] Specific actions for next session
- [ ] Priority tasks and deadlines
- [ ] Dependencies on other agents
- [ ] Critical information to remember

## Memory References
- Entity names and IDs for quick lookup
- Key search terms for memory retrieval
- Important observations added this session

## Files Created/Modified
- List of all files created or significantly modified
- Purpose and current state of each file
- Integration requirements or dependencies
```

#### **3. Update Coordination Files**
```markdown
---[CURRENT-AGENT-FINAL-2025.06.12-10:35]---
Status: HANDOFF - CONTEXT MANAGEMENT REQUIRED
Session Summary: [Brief description of work completed]
Critical Handoff Notes: [What next agent MUST know]
Memory Updated: [Entity names and key observations added]
Files Modified: [List key files changed]
Next Priority: [Most important next step]
Context Status: [Approaching limit - recommend compacting]
```

## Post-Context-Management Startup Protocol

### **🚨 MANDATORY: First Actions After Context Clear/Compact**

#### **1. Identity and Role Confirmation**
- Read AgentInstructions.md to understand role
- Confirm agent identity (Agent1, Agent2, or Orchestrator)
- Understand current project phase and coordination state

#### **1.5 Model Confirmation Protocol (Orchestrator Only)**
**🚨 CRITICAL: Must complete BEFORE any strategic decisions or agent launches**

**Step 1: Ask and WAIT for Response**
- Ask user: "Am I currently running on Opus or Sonnet?"
- **STOP ALL ACTIVITY** until user responds
- **DO NOT proceed** with any major decisions or actions

**Step 2: Model Appropriateness Assessment**
- If Sonnet and task requires strategic synthesis: "This strategic work requires Opus reasoning - should we switch models?"
- If Opus and task is routine coordination: "This routine task is better suited for Sonnet - recommend switching to save Opus budget"
- **WAIT** for user decision before proceeding

**Step 3: Confirmation Before Action**
- Only proceed with major decisions/launches after model confirmation
- Document model used for session in all deliverables and coordination files

#### **2. Memory Retrieval Sequence**
```bash
# Core project context
mcp__neo4j-memory-global__search_nodes: "QALoader project"
mcp__neo4j-memory-global__search_nodes: "Documentation Reorganization"

# Your specific role context
mcp__neo4j-memory-global__search_nodes: "[Your Identity]"
mcp__neo4j-memory-global__search_nodes: "Agent coordination"

# Recent handoff context
mcp__neo4j-memory-global__search_nodes: "Handoff"
mcp__neo4j-memory-global__search_nodes: "[Current Date]"
```

#### **3. Handoff Document Review**
- Read most recent `Handoff_[Role]_[Date]_[Time].md`
- Review critical context and next steps
- Confirm understanding of current coordination state

#### **4. Coordination File Update**
```markdown
---[AGENT-POST-CONTEXT-MGMT-2025.06.12-10:40]---
Status: RESUMED - Context [Cleared/Compacted]
Memory Retrieved: [Key entities and observations found]
Handoff Reviewed: [Handoff document filename]
Understanding Confirmed: [Brief summary of current state]
Ready for: [Next specific task or coordination]
Context Status: Fresh and ready for productive work
```

## Multi-Agent Communication Protocol

### **🚨 CRITICAL: Asynchronous Communication System**
**All communication happens through Agent[N].md files with user-mediated triggers**

**Communication Flow:**
1. **Orchestrator** writes task instructions to Agent1.md/Agent2.md (max 15 lines)
2. **User triggers** agents: "A1 ready for O" → Agent1 checks file and executes
3. **Agent** completes work, writes response back to Agent[N].md (max 15 lines)
4. **User triggers** orchestrator: "O ready for A1" → Orchestrator checks response

**Communication Efficiency:**
- **Turn-by-turn limit**: 15 lines per communication in Agent[N].md files
- **Complex instructions**: Write to separate file, reference in 15-line slot
- **Format**: "DETAILED INSTRUCTIONS: Read /AgentCoord/[filename]"
- **Always include**: Status, task summary, deliverable within 15 lines
- **NO TIME CONSTRAINTS**: Process is fully asynchronous, no deadlines or time estimates

**Key Constraints:**
- **NO direct triggering** - only user can ping others to check files
- **Agents cannot communicate with each other** - only through Orchestrator mediation
- **All communication** flows through designated Agent[N].md files
- **Process is fully asynchronous** - everyone waits for user triggers

**Communication Capabilities:**
- ✅ Orchestrator writes instructions to Agent[N].md files
- ✅ Agents read instructions from their Agent[N].md file
- ✅ Agents write responses back to their Agent[N].md file  
- ✅ Orchestrator reads agent responses from Agent[N].md files
- ❌ No one can trigger others to check for updates (user-only)

**Updated:** June 12, 2025. 11:12 a.m. Eastern Time - Corrected to reflect actual asynchronous workflow

## Orchestrator-Specific Handoff Procedures

### **Pre-Context Management**
- **Synthesize all agent progress** into comprehensive project status
- **Update OrchestrationPlan.md** with current state
- **Create master handoff document** with full project context
- **Ensure all agent coordination states** are documented

### **Post-Context Management**
- **Re-establish coordination awareness** with all active agents
- **Confirm project phase and priorities** from memory and handoff docs
- **Verify agent status and readiness** for continued coordination
- **Resume coordination using established protocols**

## Agent-Specific Handoff Procedures

### **Pre-Context Management**
- **Complete current task deliverable** or create progress checkpoint
- **Update agent-specific coordination file** with handoff status
- **Document any blocking issues** or dependencies on other agents
- **Prepare task state for next agent instance**

### **Post-Context Management**
- **Search for agent-specific memories** and recent handoffs
- **Review current assignment** from coordination file
- **Confirm understanding** of task state and priorities
- **Resume work** with full context restoration

## Quality Assurance Checklist

### **Before Context Management:**
- [ ] Memory updated with all critical information
- [ ] Handoff document created with complete context
- [ ] Coordination files updated with handoff status
- [ ] All important files and changes documented
- [ ] Next steps clearly defined for resumption

### **After Context Management:**
- [ ] Identity and role confirmed
- [ ] Memory retrieval completed successfully
- [ ] Handoff document reviewed and understood
- [ ] Coordination state confirmed with other agents
- [ ] Ready to resume productive work

## Emergency Procedures

### **If Handoff Information is Missing:**
1. **Search memory extensively** for any relevant context
2. **Review all coordination files** for recent activity
3. **Check project documentation** for current phase information
4. **Contact human coordinator** for clarification if needed
5. **Document gaps** and proceed with available information

### **If Memory Retrieval Fails:**
1. **Check AgentInstructions.md** for role and basic context
2. **Review coordination files** for recent activity patterns
3. **Start with basic project orientation** from documentation
4. **Rebuild context gradually** through file exploration
5. **Document rebuilt understanding** in memory for future use

---

*This protocol ensures zero context loss across agent transitions and context management operations.*
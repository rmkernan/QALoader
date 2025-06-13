# Memory-Based Coordination Protocol

**Version:** 2.0  
**Created:** December 6, 2025  
**Purpose:** Enhanced multi-agent coordination using Neo4j memory instead of file-based communication

---

## Overview

This protocol replaces the 15-line file communication system with memory-based coordination, enabling:
- Richer context sharing between orchestrator and agents
- Searchable coordination history
- Strategic memory preservation vs tactical cleanup
- Seamless session handoffs

---

## Memory Taxonomy

### Tactical Memory (DELETE after session)
**Purpose:** Coordination convenience during active work
**Lifespan:** Session only
**Examples:**
- Task assignments and status updates
- "Agent1 assigned to analyze documentation structure"
- "Agent2 status: IN PROGRESS on quality assessment"
- "Waiting for user trigger A1 ready for O"

### Strategic Memory (PRESERVE forever)
**Purpose:** Institutional knowledge and insights
**Lifespan:** Permanent
**Examples:**
- Key discoveries: "40% documentation redundancy identified"
- Strategic decisions: "Focus on gap-filling vs massive reorganization"
- Success metrics: "LLM effectiveness improved 20% to 95%"
- Process improvements: "Question placement at end of messages"

---

## Communication Protocol

### 1. Session Initialization

**Orchestrator Creates Session Entity:**
```python
mcp__neo4j-memory__create_entities([{
    "name": "Multi-Agent Session [Date-Time]",
    "entityType": "coordination_session",
    "observations": [
        "Mission: [Brief description]",
        "Agents: Agent1 (task A), Agent2 (task B)",
        "Status: ACTIVE"
    ]
}])
```

### 2. Task Assignment (Tactical Memory)

**Instead of writing to Agent1.md:**
```python
mcp__neo4j-memory__add_observations([{
    "entityName": "Multi-Agent Session [Date-Time]",
    "contents": [
        "TASK_ASSIGN_A1: Analyze documentation structure using Glob tool",
        "A1_DELIVERABLE: DocInventory_Agent1_[date].md", 
        "A1_STATUS: ASSIGNED",
        "A1_PRIORITY: HIGH"
    ]
}])
```

### 3. Agent Status Updates (Tactical Memory)

**Agent1 reports completion:**
```python
mcp__neo4j-memory__add_observations([{
    "entityName": "Multi-Agent Session [Date-Time]",
    "contents": [
        "A1_STATUS: COMPLETED",
        "A1_FINDING: Found 73 .md files across 6 directories",
        "A1_DELIVERABLE: DocInventory_Agent1_20251206.md created"
    ]
}])
```

### 4. Strategic Insights (Preserve Memory)

**Orchestrator synthesis:**
```python
mcp__neo4j-memory__create_entities([{
    "name": "Documentation Analysis Insights",
    "entityType": "strategic_finding",
    "observations": [
        "Discovery: 73 documentation files with clear hierarchy",
        "Quality assessment: 95% professional standards",
        "Strategic decision: Focus on deployment gap, not reorganization",
        "Success metric: Framework coordination validated"
    ]
}])
```

---

## Memory Categories

### Session Management (TACTICAL - DELETE)
- Task assignments
- Status tracking
- Coordination triggers
- Temporary blockers

### Agent Findings (HYBRID - FILTER)
- **Keep:** Key discoveries, success metrics, critical insights
- **Delete:** Detailed execution logs, step-by-step processes

### Strategic Decisions (STRATEGIC - PRESERVE)
- Mission pivots and rationale
- Success/failure patterns
- Process improvements
- Institutional knowledge

### Project Context (STRATEGIC - PRESERVE)
- Mission outcomes
- Effectiveness measurements
- Framework enhancements
- Lessons learned

---

## Trigger System (Enhanced)

### Memory-Based Status Checking

**Orchestrator checks agent status:**
```python
# Instead of reading Agent1.md file
mcp__neo4j-memory__search_nodes("A1_STATUS session")
```

**User triggers remain the same:**
- `"O ready for A1"` = Orchestrator assigned task to Agent1
- `"A1 ready for O"` = Agent1 completed work
- `"Check status"` = Orchestrator queries all agent statuses

### Trigger Implementation

**Orchestrator task assignment:**
1. Write task assignment to memory (tactical)
2. Tell user: "O ready for A1"
3. User relays to Agent1

**Agent completion:**
1. Agent writes completion status to memory (tactical)
2. Agent writes key findings to memory (strategic if significant)
3. Agent tells user: "A1 ready for O"
4. User relays to Orchestrator

---

## Session Cleanup Protocol

### 1. End-of-Session Triage

**Orchestrator reviews all session memory:**
```python
mcp__neo4j-memory__search_nodes("Multi-Agent Session [Date-Time]")
```

**Decision matrix:**
- Task assignments → DELETE
- Status updates → DELETE
- Key discoveries → PRESERVE in strategic entity
- Process insights → PRESERVE in framework entity

### 2. Strategic Preservation

**Extract and preserve insights:**
```python
mcp__neo4j-memory__create_entities([{
    "name": "[Project] Key Insights [Date]",
    "entityType": "strategic_outcome",
    "observations": [
        "Mission completed: [Brief description]",
        "Key discovery: [Significant finding]",
        "Success metric: [Quantifiable result]",
        "Process improvement: [Enhancement identified]"
    ]
}])
```

### 3. Tactical Cleanup

**Delete coordination chatter:**
```python
mcp__neo4j-memory__delete_entities(["Multi-Agent Session [Date-Time]"])
```

---

## Implementation Guidelines

### For Orchestrators

**Session Start:**
1. Create session coordination entity
2. Search for relevant strategic context
3. Use memory for all task assignments

**During Session:**
1. Store task assignments as tactical memory
2. Track agent status in session entity
3. Capture strategic insights immediately

**Session End:**
1. Extract strategic insights to permanent entities
2. Delete tactical coordination memory
3. Update project context with outcomes

### For Agents

**Task Execution:**
1. Search session memory for assignment
2. Update status in session entity
3. Store significant findings in session entity

**Completion:**
1. Mark status as COMPLETED
2. Summarize key discoveries
3. Create separate strategic entities for major insights

---

## Testing Protocol

### Test Scenario Design

**Phase 1: Memory Coordination Test**
- Orchestrator assigns documentation analysis
- Agent1 analyzes structure via memory communication
- Agent2 assesses quality via memory communication
- Validate memory-based trigger system

**Phase 2: Cleanup Validation**
- Complete mock mission using memory coordination
- Identify tactical vs strategic memory
- Execute cleanup protocol
- Verify strategic insights preserved, tactical deleted

### Success Criteria

**Coordination Effectiveness:**
- [ ] Task assignments transmitted via memory
- [ ] Agent status updates captured in memory
- [ ] Cross-agent synthesis through memory queries
- [ ] User trigger system functional

**Memory Management:**
- [ ] Strategic insights preserved permanently
- [ ] Tactical coordination deleted successfully
- [ ] No valuable information lost in cleanup
- [ ] Clean memory state for next session

---

## Benefits Over File Communication

### Enhanced Capabilities
- **Searchable coordination:** Query across all agent activities
- **Rich context:** No 15-line limit constraints
- **Strategic continuity:** Preserve insights across sessions
- **Efficient synthesis:** Combine findings from multiple agents

### Maintained Strengths
- **User-mediated triggers:** Human remains in control
- **Asynchronous operation:** No real-time dependencies
- **Clear audit trail:** All coordination logged
- **Session isolation:** Clean boundaries between missions

---

*This protocol enables richer coordination while maintaining the proven asynchronous, user-controlled framework.*
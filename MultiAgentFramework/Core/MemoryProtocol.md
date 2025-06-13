# Memory Management Protocol

**Version:** 1.0  
**Tool:** Neo4j Memory via MCP  
**Purpose:** Persistent knowledge across sessions and agents

---

## Startup Memory Retrieval (MANDATORY)

### Every Session Must Begin With:

```python
# 1. Search for project context
mcp__neo4j-memory-global__search_nodes("project name")
mcp__neo4j-memory-global__search_nodes("[Current Mission Type]")

# 2. Search for role-specific memories  
mcp__neo4j-memory-global__search_nodes("Orchestrator")  # or Agent1/Agent2
mcp__neo4j-memory-global__search_nodes("handoff")

# 3. Search for recent work
mcp__neo4j-memory-global__search_nodes("[today's date]")
```

### Common Search Patterns:

**For Orchestrator:**
- "multi-agent coordination"
- "orchestrator decisions"  
- "synthesis findings"
- "mission status"

**For Agents:**
- "Agent1 discoveries"
- "Agent2 analysis"
- "deliverables created"
- "blockers encountered"

## Memory Entity Structure

### Project Entity (Created Once)
```python
mcp__neo4j-memory-global__create_entities([{
    "name": "[Project Name] Multi-Agent Mission",
    "entityType": "Project Initiative",
    "observations": [
        "Mission type: [Documentation Audit/Security Scan/etc]",
        "Start date: [date]",
        "Orchestrator model: [Opus/Sonnet]",
        "Target outcome: [specific goals]"
    ]
}])
```

### Progress Updates (Continuous)
```python
mcp__neo4j-memory-global__add_observations([{
    "entityName": "[Project Name] Multi-Agent Mission",
    "contents": [
        "Phase 1 complete: [key findings] ([date])",
        "Agent1 discovered: [critical insight] ([date])",
        "Agent2 validated: [important result] ([date])",
        "Synthesis revealed: [strategic conclusion] ([date])"
    ]
}])
```

## What to Store in Memory

### Always Store:
1. **Mission Initialization**
   - Mission type and objectives
   - Success criteria
   - Project-specific context

2. **Key Discoveries**
   - Critical findings that affect strategy
   - Unexpected insights
   - Pattern recognitions

3. **Strategic Decisions**
   - Why certain approaches were chosen
   - Trade-offs considered
   - Pivots in direction

4. **Deliverables Created**
   - File names and purposes
   - Key content summaries
   - Integration points

5. **Handoff Information**
   - Current phase status
   - Next priority actions
   - Blocking issues

### Never Store:
- Routine status updates
- Temporary calculations
- File contents verbatim
- Sensitive credentials

## Memory Update Patterns

### 1. After Major Discoveries
```python
# When finding something significant
mcp__neo4j-memory-global__add_observations([{
    "entityName": "[Project Name] Multi-Agent Mission",
    "contents": [
        "CRITICAL FINDING: Documentation has 40% redundancy across modules ([date])",
        "Root cause identified: No central catalog or entry point ([date])"
    ]
}])
```

### 2. At Phase Transitions
```python
# When completing a mission phase
mcp__neo4j-memory-global__add_observations([{
    "entityName": "[Project Name] Multi-Agent Mission", 
    "contents": [
        "Phase 1 Discovery COMPLETE: Found 47 docs, 12 duplicates, no entry point ([date])",
        "Phase 2 Design STARTED: Creating unified hierarchy with PROJECT_OVERVIEW.md ([date])"
    ]
}])
```

### 3. Before Handoffs
```python
# When approaching context limits
mcp__neo4j-memory-global__add_observations([{
    "entityName": "[Project Name] Multi-Agent Mission",
    "contents": [
        "HANDOFF REQUIRED: Orchestrator at 15% context ([date])",
        "Current status: Testing phase with Agent1 and Agent2 deployed ([date])",
        "Next orchestrator must: Review test results and close mission ([date])",
        "Key context: 96% success rate achieved, deployment docs created ([date])"
    ]
}])
```

## Memory Search Strategies

### 1. Broad to Specific
```python
# Start broad
results = search_nodes("documentation")
# Then narrow
results = search_nodes("documentation audit findings")
# Then precise
results = search_nodes("PROJECT_OVERVIEW.md created")
```

### 2. Temporal Search
```python
# Recent work
results = search_nodes("December 6")
# Specific session
results = search_nodes("handoff 14:30")
```

### 3. Entity-Based
```python
# Get full entity
results = open_nodes(["QALoader Documentation Audit"])
# Review all observations chronologically
```

## Integration with Handoffs

### Pre-Handoff Checklist:
- [ ] Update memory with session summary
- [ ] Store critical decisions and rationale
- [ ] Document deliverables created
- [ ] Record next priority actions
- [ ] Note any blockers or dependencies

### Post-Handoff Recovery:
1. Search memory for project entity
2. Review recent observations
3. Check for handoff-specific notes
4. Correlate with handoff documents
5. Rebuild context efficiently

## Memory Best Practices

### 1. Timestamp Everything
```python
"Discovered missing deployment docs ([timestamp])"
# NOT: "Discovered missing deployment docs"
```

### 2. Include Context
```python
"Agent1 validation showed 83% success rate - deployment path broken ([timestamp])"
# NOT: "83% success rate"
```

### 3. Link Entities
```python
mcp__neo4j-memory-global__create_relations([{
    "from": "QALoader Project",
    "to": "Documentation Audit Mission",
    "relationType": "requires"
}])
```

### 4. Regular Cleanup
- Archive completed mission memories
- Remove redundant observations
- Consolidate related findings

## Common Memory Patterns

### Mission Success Pattern:
```
1. "Mission initialized: [type] for [project] ([date])"
2. "Phase 1 findings: [discovery] ([date])"
3. "Strategic pivot: [decision] based on [finding] ([date])"
4. "Deliverables created: [list] ([date])"
5. "Mission complete: [success metrics] ([date])"
```

### Problem Resolution Pattern:
```
1. "Blocker identified: [issue] ([date])"
2. "Root cause analysis: [finding] ([date])"
3. "Solution approach: [strategy] ([date])"
4. "Resolution confirmed: [result] ([date])"
```

---

*Effective memory management enables seamless multi-session, multi-agent coordination.*
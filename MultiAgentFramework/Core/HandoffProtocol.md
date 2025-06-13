# Handoff Protocol - Multi-Agent Framework

**Version:** 1.0  
**Purpose:** Ensure seamless continuity across context management and role transitions  
**Critical:** This protocol prevents work loss and maintains mission momentum

---

## Context Management Strategy

### STRONGLY RECOMMENDED: Context Compacting
- **Preserves critical context** while reducing token usage
- **Maintains mission understanding** and decision history
- **Keeps coordination awareness** intact
- **Reduces re-onboarding time** significantly

### When to Compact/Clear
- **Agent Context**: When approaching 80% of context limit
- **Orchestrator Context**: When coordination becomes difficult
- **Proactive**: Before starting major new phases

## Pre-Handoff Protocol (MANDATORY)

### 1. Complete Memory Update
```python
# Update work status
mcp__neo4j-memory-global__add_observations([{
    "entityName": "[Project] Multi-Agent Mission",
    "contents": [
        "Current task progress: [details] ([timestamp])",
        "Key findings: [discoveries] ([timestamp])",
        "Strategic decisions: [choices made] ([timestamp])",
        "Next steps: [priorities] ([timestamp])"
    ]
}])

# Create handoff entity if needed
mcp__neo4j-memory-global__create_entities([{
    "name": "[Project] Mission Handoff [timestamp]",
    "entityType": "Handoff Record",
    "observations": [
        "Role: [Orchestrator/Agent1/Agent2]",
        "Context percentage at handoff: [%]",
        "Critical context: [what next person must know]",
        "Current phase: [mission status]"
    ]
}])
```

### 2. Create Handoff Document

**Filename**: `Handoff_[Role]_[YYYYMMDD]_[HHMM].md`  
**Location**: `/MultiAgentFramework/` or current working directory

**Required Sections:**
```markdown
# [Role] Session Handoff

**Session Period:** [Start] to [End]
**Context Status:** [Percentage remaining]
**Mission Type:** [Documentation Audit/etc]
**Next Role:** [Instructions for successor]

## Critical Context Preservation
- Key decisions made and rationale
- Important discoveries about project
- Current task status and progress
- Coordination state with other roles

## Immediate Next Steps
- [ ] Specific actions for next session
- [ ] Priority tasks to complete
- [ ] Dependencies on other agents
- [ ] Critical information to verify

## Memory References
- Entity names for quick lookup
- Key search terms for retrieval
- Important observations added

## Files Created/Modified
- List of deliverables created
- Purpose and state of each
- Integration requirements
```

### 3. Update Coordination Files

**For Agents:**
```markdown
---[AGENT#-FINAL-YYYY.MM.DD-HH:MM]---
Status: HANDOFF - CONTEXT MANAGEMENT REQUIRED
Session Summary: [Brief work description]
Critical Handoff: [What successor MUST know]
Memory Updated: YES - [Key entity names]
Files Created: [List key deliverables]
Next Priority: [Most important next step]
Context Status: [Approaching limit - compact recommended]
```

**For Orchestrator:**
- Update `OrchestrationPlan.md` with current status
- Note phase completion and next priorities
- Document any pending agent responses

## Post-Context-Management Startup

### 1. Identity Confirmation
```python
# Determine role from context
"I am [Orchestrator/Agent1/Agent2] for the multi-agent mission"
```

### 2. Memory Retrieval Sequence
```python
# Core searches
mcp__neo4j-memory-global__search_nodes("[Project name]")
mcp__neo4j-memory-global__search_nodes("[Your role]")
mcp__neo4j-memory-global__search_nodes("handoff")
mcp__neo4j-memory-global__search_nodes("current mission")
```

### 3. Document Review Priority
1. Most recent `Handoff_[Role]_*.md`
2. `Agent[N].md` for current status
3. `OrchestrationPlan.md` for mission state
4. Mission-specific instructions

### 4. Startup Confirmation
```markdown
---[ROLE-POST-CONTEXT-MGMT-YYYY.MM.DD-HH:MM]---
Status: RESUMED - Context [Cleared/Compacted]
Memory Retrieved: [Key findings]
Handoff Reviewed: [Document name]
Understanding: [Current mission state]
Ready for: [Next specific action]
```

## Special Protocols by Role

### Orchestrator Handoff
**Pre-Handoff:**
- Synthesize all agent progress
- Create mission status summary
- Document strategic decisions
- Update phase progression

**Post-Handoff:**
- Verify agent readiness
- Review pending responses
- Confirm mission phase
- Plan next assignments

### Agent Handoff
**Pre-Handoff:**
- Complete current deliverable
- Document methodology briefly
- Note any blockers
- Update task progress

**Post-Handoff:**
- Check latest assignment
- Review previous deliverables
- Understand current phase
- Resume assigned work

## Quality Assurance Checklist

### Before Context Management:
- [ ] Memory comprehensively updated
- [ ] Handoff document created
- [ ] Coordination files show handoff status
- [ ] All deliverables documented
- [ ] Next steps clearly defined

### After Context Management:
- [ ] Identity and role confirmed
- [ ] Memory successfully retrieved
- [ ] Handoff document understood
- [ ] Current status verified
- [ ] Ready for productive work

## Emergency Recovery

### If Handoff Information Missing:
1. Search memory extensively
2. Review all .md files in framework
3. Check git history if available
4. Reconstruct from deliverables
5. Document gaps found

### If Memory Retrieval Fails:
1. Check role-specific instructions
2. Review coordination files
3. Examine existing deliverables
4. Start with basic orientation
5. Rebuild context gradually

## Handoff Best Practices

### DO:
- Update memory BEFORE creating handoff
- Include specific file paths
- Document "why" not just "what"
- Mention unexpected discoveries
- Keep handoff under 500 lines

### DON'T:
- Leave work half-complete
- Assume context is obvious
- Skip memory updates
- Create overly long handoffs
- Forget next steps

## Sample Handoff Document

```markdown
# Orchestrator Session Handoff

**Session Period:** Dec 6, 2025 2:00 PM to 4:30 PM ET
**Context Status:** 18% remaining
**Mission Type:** Documentation Audit
**Next Orchestrator:** Continue Phase 3 validation

## Critical Context Preservation
- Discovered 40% redundancy claim was false (16.8% actual)
- Created deployment docs to fill critical gap
- Both agents completed validation tests
- 96% success rate achieved (exceeded goal)

## Immediate Next Steps
- [ ] Review Agent1's ProjectAnalysis report
- [ ] Review Agent2's TechnicalAssessment report  
- [ ] Synthesize findings
- [ ] Close mission if validated

## Memory References
- Entity: "QALoader Documentation Audit"
- Search: "validation results December 6"
- Key observation: "96% success rate"

## Files Created/Modified
- DEPLOYMENT.md (filled critical gap)
- DOCUMENTATION_CATALOG.md (updated)
- ProjectAnalysis_Agent1_20251206.md
- TechnicalAssessment_Agent2_20251206.md

Context ready for compacting. Mission nearly complete.
```

---

*This protocol ensures zero context loss across all transitions in multi-agent missions.*
# Model Selection Strategy

**Version:** 1.0  
**Purpose:** Optimize model usage for cost and capability  
**Key Principle:** Right model for right task

---

## Model Capabilities Overview

### Claude Opus
**Strengths:**
- Complex reasoning and synthesis
- Strategic planning and design
- Nuanced decision making
- Pattern recognition across large contexts
- Creative problem solving

**Best For:**
- Initial mission planning
- Multi-agent synthesis
- Strategic pivots
- Complex troubleshooting
- Architecture design

### Claude Sonnet  
**Strengths:**
- Efficient task execution
- Code implementation
- Routine coordination
- File operations
- Status reporting

**Best For:**
- Agent task assignment
- File management
- Status checking
- Routine updates
- Implementation tasks

## Orchestrator Model Selection

### MANDATORY: Initial Confirmation
```markdown
First message to user:
"I'm ready to orchestrate the multi-agent mission. Am I currently running on Opus or Sonnet?"

[STOP and WAIT for response]
[DO NOT proceed with strategic decisions until confirmed]
```

### When to Recommend Model Switch

**Switch TO Opus:**
```markdown
"This phase requires complex synthesis of agent findings. Should we switch to Opus for strategic reasoning?"
```
- When synthesizing multiple agent reports
- When making architectural decisions
- When agent findings conflict
- When pivoting mission strategy

**Switch TO Sonnet:**
```markdown
"The next phase is routine implementation. Recommend switching to Sonnet to preserve Opus budget."
```
- When assigning straightforward tasks
- When organizing files
- When updating documentation
- When following established patterns

## Decision Framework

### Use Opus When:

**1. Mission Initialization**
- Understanding project complexity
- Designing agent task division
- Setting strategic objectives
- Creating mission plan

**2. Complex Synthesis**
- Integrating findings from both agents
- Resolving conflicting information
- Identifying subtle patterns
- Making non-obvious connections

**3. Strategic Pivots**
- When discoveries change approach
- When blockers require creativity
- When success criteria need revision
- When unexpected complexity emerges

**4. Final Mission Synthesis**
- Creating comprehensive summaries
- Extracting key insights
- Formulating recommendations
- Documenting lessons learned

### Use Sonnet When:

**1. Routine Coordination**
- Writing task assignments
- Checking agent responses  
- Updating status files
- Managing handoffs

**2. Implementation Tasks**
- Creating template files
- Organizing deliverables
- Running git operations
- Following established patterns

**3. Status Management**
- Reading coordination files
- Updating progress tracking
- Writing routine reports
- Managing file structure

**4. Mechanical Operations**
- File movement/deletion
- Format conversions
- Checklist completion
- Standard validations

## Agent Model Selection

### Agents Should Generally Use Sonnet
- Agents perform execution tasks
- Discovery and analysis are mechanical
- Creativity happens at orchestrator level
- Cost efficiency for parallel operations

### Exception: Complex Analysis Agents
Some missions may benefit from Opus agents:
- Security vulnerability analysis
- Architecture assessment
- Complex code understanding
- Nuanced content analysis

## Cost Optimization Strategies

### 1. Frontload Opus Usage
- Use Opus early for strategy
- Switch to Sonnet for execution
- Return to Opus only for synthesis

### 2. Batch Strategic Thinking
- Accumulate questions for Opus
- Make multiple decisions at once
- Document rationale thoroughly

### 3. Clear Task Boundaries
- Opus: "What should we do and why?"
- Sonnet: "Execute this specific plan"
- Clear handoff between thinking/doing

### 4. Reuse Strategic Decisions
- Document Opus reasoning in memory
- Reference previous decisions
- Avoid re-analyzing solved problems

## Model Switch Protocol

### For Orchestrator:
1. Complete current phase
2. Update memory with findings
3. Create handoff if needed
4. Recommend model switch
5. Wait for user confirmation

### Sample Switch Request:
```markdown
## Model Switch Recommendation

**Current Model:** Opus
**Recommended:** Sonnet
**Reason:** Moving from strategic planning to routine implementation

**Current Phase Complete:**
- ✅ Agent findings synthesized
- ✅ Strategic direction set
- ✅ Implementation plan created

**Next Phase Tasks:**
- Assign specific file creation tasks
- Monitor agent progress
- Update documentation

Ready to switch to Sonnet for efficiency.
```

## Mission-Specific Guidance

### Documentation Audit Mission:
- **Opus:** Initial assessment, synthesis, final recommendations
- **Sonnet:** File operations, catalog creation, status updates

### Security Audit Mission:
- **Opus:** Vulnerability analysis, risk assessment, remediation strategy
- **Sonnet:** File scanning, report generation, checklist completion

### Performance Optimization:
- **Opus:** Bottleneck analysis, architecture decisions, optimization strategy
- **Sonnet:** Metric collection, code modification, testing

### Code Refactoring:
- **Opus:** Pattern identification, design decisions, priority setting
- **Sonnet:** File modifications, test running, documentation updates

## Monitoring Model Effectiveness

### Signs Opus is Needed:
- Sonnet struggling with synthesis
- Missing subtle connections
- Mechanical responses to complex issues
- Lack of strategic insight

### Signs Sonnet is Sufficient:
- Clear task definition exists
- Precedent/pattern available
- Mechanical execution required
- No synthesis needed

## Best Practices

### 1. Document Model Decisions
```python
mcp__neo4j-memory-global__add_observations([{
    "entityName": "[Project] Multi-Agent Mission",
    "contents": [
        "Switched to Opus for Phase 2 synthesis - complex pattern emergence ([date])",
        "Returned to Sonnet for implementation phase - routine tasks ([date])"
    ]
}])
```

### 2. Preserve Opus Context
- Before switching away from Opus
- Document all strategic decisions
- Create comprehensive handoff
- Ensure Sonnet has clear direction

### 3. Batch Opus Work
- Accumulate strategic questions
- Handle multiple decisions together
- Maximize value per Opus session

### 4. Trust Sonnet for Execution
- Don't over-specify routine tasks
- Let Sonnet handle implementation
- Reserve Opus for true complexity

---

*Effective model selection maximizes both capability and cost efficiency in multi-agent missions.*
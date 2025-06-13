# Guide to Creating New Missions

**Version:** 1.0  
**Purpose:** Enable framework extension with custom mission types

---

## Understanding Mission Architecture

### What Makes a Good Multi-Agent Mission?

**Ideal Characteristics:**
- **Parallelizable:** Tasks can be split between agents
- **Complementary:** Agent findings enhance each other
- **Phased:** Clear progression from discovery to delivery
- **Measurable:** Success can be quantified

**Good Mission Examples:**
- **Security Audit:** Code scanning + dependency checking
- **Performance Analysis:** Profiling + optimization identification  
- **Test Coverage:** Gap analysis + test generation
- **Migration Planning:** Current state + future design
- **Code Review:** Pattern analysis + best practice checking

**Poor Mission Examples:**
- Linear tasks (each depends on previous)
- Single-perspective analysis
- Pure execution without analysis
- Unmeasurable outcomes

## Creating Your Mission

### Step 1: Create Mission Directory

```bash
mkdir MultiAgentFramework/Missions/YourMissionName
cd MultiAgentFramework/Missions/YourMissionName
```

Required files:
- `MissionBrief.md` - Overview and objectives
- `Instructions.md` - Detailed procedures
- `Validation.md` - Success criteria
- `Templates/` - Any mission-specific templates (optional)

### Step 2: Write MissionBrief.md

**Template Structure:**

```markdown
# Mission Brief: [Your Mission Name]

**Mission Type:** [Category]  
**Estimated Duration:** [X-Y hours]  
**Recommended Orchestrator Model:** [Opus/Sonnet]

## Mission Objectives

### Primary Goal
[One sentence describing the main outcome]

### Specific Objectives
1. [Measurable objective 1]
2. [Measurable objective 2]
3. [Measurable objective 3]

## Success Criteria

### Quantitative Metrics
- [Metric 1]: From X to Y
- [Metric 2]: Achieve Z%

### Qualitative Outcomes
- [Outcome 1]
- [Outcome 2]

## Phase Breakdown

### Phase 1: [Discovery/Analysis]
**Agent1 Focus:** [Specific area]
- [Task 1]
- [Task 2]

**Agent2 Focus:** [Complementary area]
- [Task 1]
- [Task 2]

**Orchestrator Synthesis:** [What to combine]

### Phase 2: [Design/Planning]
[Repeat structure]

### Phase 3: [Implementation/Execution]
[Repeat structure]

### Phase 4: [Validation/Testing]
[Repeat structure]

## Known Challenges

### Common Issues:
1. [Predictable problem]
2. [Another challenge]

### Mitigation Strategies:
- [How to handle]
- [Backup approach]

## Deliverables

### Core Deliverables:
1. [Filename] - [Purpose]
2. [Filename] - [Purpose]

### Optional Deliverables:
- [Additional outputs]

## Resource Requirements

### Tools Needed:
- [Which framework tools]
- [Any special requirements]

### Typical Scope:
- [Size indicators]
- [Complexity factors]
```

### Step 3: Create Instructions.md

**Key Sections to Include:**

```markdown
# [Mission Name] Instructions

## Orchestrator Instructions

### Mission Initialization
[Specific startup steps]
[How to assess the project]
[Key decisions to make early]

### Phase 1: [Name]
**Agent1 Assignment Template:**
```markdown
[15-line assignment template]
```

**Agent2 Assignment Template:**
```markdown
[15-line assignment template]
```

**Synthesis Guidance:**
[What to look for]
[How to combine findings]
[Decision points]

### Phase 2-N: [Repeat for each phase]

## Agent-Specific Instructions

### For Agent1
[Patterns to follow]
[Tools to emphasize]
[Specific techniques]

### For Agent2  
[Complementary approach]
[Different perspective]
[Validation methods]

## Common Patterns

### [Pattern Name]
[When to use]
[How to implement]
[Expected outcomes]

## Troubleshooting

### [Common Issue]
[How to recognize]
[How to resolve]
[Prevention tips]
```

### Step 4: Define Validation.md

**Essential Components:**

```markdown
# [Mission Name] Validation Criteria

## Success Metrics

### Primary Metric: [Name]
**Measurement Method:**
[How to measure]

**Success Thresholds:**
- Minimum: [X]
- Target: [Y]  
- Excellent: [Z]

### Secondary Metrics
[Additional measurements]

## Validation Methods

### Method 1: [Name]
**Process:**
[Step-by-step validation]

**Scoring:**
[How to score results]

### Method 2: [Name]
[Repeat structure]

## Test Scenarios

### Scenario 1: [Name]
**Setup:** [Initial conditions]
**Action:** [What to test]
**Expected:** [Success criteria]
**Scoring:** [Points/percentage]

## Validation Report Template
[Template for results]

## Edge Cases
[Special situations]
[How to handle]
```

## Mission Design Patterns

### Pattern 1: Analysis + Synthesis
```
Phase 1: Both agents analyze different aspects
Phase 2: Orchestrator synthesizes findings
Phase 3: Agents implement based on synthesis
Phase 4: Validate results
```

**Good for:** Code quality, architecture review, optimization

### Pattern 2: Creation + Validation
```
Phase 1: Agent1 creates/designs solution
Phase 2: Agent2 validates/tests creation
Phase 3: Agent1 refines based on feedback
Phase 4: Final validation
```

**Good for:** Test generation, documentation, refactoring

### Pattern 3: Current + Future State
```
Phase 1: Agent1 maps current state
Phase 2: Agent2 designs future state
Phase 3: Both create migration plan
Phase 4: Validate feasibility
```

**Good for:** Migrations, upgrades, redesigns

### Pattern 4: Broad + Deep
```
Phase 1: Both agents survey broadly
Phase 2: Each agent deep-dives on findings
Phase 3: Combine for comprehensive view
Phase 4: Prioritize and recommend
```

**Good for:** Security audits, performance analysis, technical debt

## Testing Your Mission

### 1. Dry Run
- Create mock project
- Run through all phases
- Time each phase
- Note pain points

### 2. Refinement
- Adjust phase boundaries
- Clarify instructions
- Add troubleshooting
- Improve templates

### 3. Documentation
- Update time estimates
- Add learned patterns
- Document edge cases
- Share examples

## Mission Quality Checklist

### Good Mission Design:
- [ ] Clear, measurable objectives
- [ ] Agents have complementary roles
- [ ] Phases build on each other
- [ ] Success can be validated
- [ ] Instructions are specific
- [ ] Templates guide outputs
- [ ] Troubleshooting included

### Warning Signs:
- ❌ Agents doing duplicate work
- ❌ Sequential dependencies
- ❌ Vague success criteria
- ❌ No synthesis opportunities
- ❌ Single perspective only

## Example: Security Audit Mission

### How it Divides Work:
- **Agent1:** Static code analysis, pattern detection
- **Agent2:** Dependency scanning, configuration review
- **Synthesis:** Combined vulnerability assessment
- **Validation:** Test exploit paths

### Why it Works:
- Parallel execution possible
- Different tools/techniques
- Findings complement each other
- Clear success metrics

## Contributing Your Mission

### To Share with Community:
1. Ensure all files complete
2. Include example outputs
3. Document lessons learned
4. Add to mission registry

### Quality Standards:
- Minimum 90% success rate in testing
- Clear documentation
- Reasonable time estimates
- Broad applicability

---

## Mission Template Directory

Create these files for quick start:

### MissionBrief.md Skeleton:
[Minimal template provided]

### Instructions.md Skeleton:
[Minimal template provided]

### Validation.md Skeleton:
[Minimal template provided]

---

*Creating new missions extends the framework's power. Design thoughtfully for maximum impact.*
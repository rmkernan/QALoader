# Documentation Audit Mission Instructions

**For:** Orchestrators and Agents executing documentation audit missions  
**Version:** 1.0

---

## Orchestrator Instructions

### Mission Initialization
1. **Assess current documentation state** through preliminary scan
2. **Identify project type** (web app, library, tool, etc.)
3. **Set baseline metrics** if possible (current LLM success rate)
4. **Customize phase plan** based on project size

### Phase 1: Discovery & Analysis

**Agent1 Assignment Template:**
```markdown
Status: INITIAL STARTUP
Task: Documentation Discovery & Inventory
Priority: HIGH

Find all .md files throughout project using Glob
Categorize by purpose (readme, guide, reference, etc)
Create inventory with file counts by category
Identify potential entry points (README, INDEX, etc)
Note files with similar names/purposes

Deliverable: DocInventory_Agent1_[date].md with:
- Total file count and locations
- Categorization by purpose
- Potential redundancies flagged
- Missing standard files noted
```

**Agent2 Assignment Template:**
```markdown
Status: INITIAL STARTUP  
Task: Documentation Quality Assessment
Priority: HIGH

Review key documentation files for completeness
Test: Can you understand project purpose/features?
Check: Are setup instructions present and clear?
Evaluate: Code comment quality in core files
Identify: Critical gaps blocking common tasks

Deliverable: QualityAssessment_Agent2_[date].md with:
- Overall quality rating (A-F)
- Critical gaps identified
- Task success predictions
- Code documentation assessment
```

### Phase 2: Design & Architecture

**Synthesis First:** Review both agent reports before assignments

**Agent1 Assignment - Architecture:**
```markdown
Status: DESIGN PHASE
Task: Documentation Architecture Design
Priority: HIGH

Design optimal documentation hierarchy
Primary entry: PROJECT_OVERVIEW.md structure
Navigation hub: DOCUMENTATION_CATALOG.md design
Create consolidation plan for redundant files
Design task-based navigation paths

Deliverable: DocArchitecture_Agent1_[date].md
Focus: LLM-discoverable organization
```

**Agent2 Assignment - Templates:**
```markdown
Status: DESIGN PHASE
Task: Create Documentation Templates  
Priority: HIGH

Create PROJECT_OVERVIEW.md template addressing:
- What is this project?
- What are its features?
- What's the architecture?
- How do I start?

Design user journey paths for common tasks
Include quick reference sections

Deliverable: DocTemplates_Agent2_[date].md
```

### Phase 3: Implementation

**Direct Implementation:**
```markdown
Agent1: Create DOCUMENTATION_CATALOG.md at project root
Agent2: Create PROJECT_OVERVIEW.md at project root
Both: Use templates from Phase 2
Both: Ensure cross-references work
```

### Phase 4: Validation

**Fresh Perspective Test:**
```markdown
Both agents: Pretend you know NOTHING about project
Agent1: Use only docs to understand architecture
Agent2: Use only docs to complete basic task
Both: Report success rate and gaps
```

## Agent-Specific Instructions

### For Agent1 (Typically Structure/Inventory Focus)

**Discovery Excellence:**
```python
# Comprehensive search pattern
glob("**/*.md")  # All markdown
glob("**/README*")  # All readmes
glob("**/CONTRIBUTING*")  # Contributing guides
glob("docs/**/*")  # Docs folders
glob(".github/**/*.md")  # GitHub docs
```

**Categorization Schema:**
- `readme` - Project overviews
- `guide` - How-to documentation  
- `reference` - API/technical specs
- `contributing` - Contributor guides
- `changelog` - Version history
- `legal` - License/legal docs
- `internal` - Team documentation

**Redundancy Detection:**
- Compare file names (case-insensitive)
- Check file sizes (similar size = potential duplicate)
- Sample content comparison
- Version/timestamp checking

### For Agent2 (Typically Quality/Effectiveness Focus)

**Quality Checklist:**
- [ ] Can I understand what this project does?
- [ ] Can I set up development environment?
- [ ] Can I find API/component documentation?
- [ ] Can I understand the architecture?
- [ ] Can I contribute a simple fix?
- [ ] Can I deploy to production?

**Task Scenarios to Test:**
1. "Fix a bug in the frontend"
2. "Add new API endpoint"
3. "Update documentation"
4. "Deploy to production"
5. "Run tests locally"
6. "Understand data flow"

**Code Documentation Check:**
```python
# Sample key files
core_files = glob("**/main.*", "**/app.*", "**/index.*")
# Check for:
# - File headers
# - Function documentation  
# - Complex logic explanations
# - TODO/FIXME tracking
```

## Synthesis Guidelines

### After Phase 1:
- Quantify documentation state (X files, Y% redundancy)
- Identify top 3-5 critical gaps
- Assess overall organization health
- Decide on consolidation strategy

### After Phase 2:
- Ensure designs are complementary
- Validate navigation paths
- Confirm all gaps addressed
- Create implementation checklist

### After Phase 3:
- Verify files created successfully
- Check cross-references work
- Ensure consistency
- Plan validation approach

### After Phase 4:
- Calculate success improvement
- Document remaining gaps
- Create maintenance recommendations
- Summarize mission impact

## Common Patterns

### Small Project Pattern:
- 10-30 files, often unorganized
- Focus on creating structure
- PROJECT_OVERVIEW.md is transformative
- Quick consolidation of duplicates

### Large Project Pattern:
- 100+ files, usually some organization
- Focus on navigation and discovery
- DOCUMENTATION_CATALOG.md critical
- Gradual consolidation approach

### Legacy Project Pattern:
- Mix of old and new docs
- Focus on identifying current docs
- Archive outdated content
- Create clear "start here" path

## Success Validation

### Minimum Success:
- PROJECT_OVERVIEW.md answers basic questions
- Clear entry point exists
- Navigation to common tasks works
- 70%+ task success rate

### Good Success:
- Comprehensive catalog exists
- Redundancy eliminated
- All critical gaps filled
- 85%+ task success rate

### Excellent Success:
- Self-service documentation
- Task-based navigation
- No redundancy
- 95%+ task success rate

## Troubleshooting

### "Too many documentation files"
- Focus on primary user paths
- Archive historical docs
- Create clear hierarchy
- Use catalog for navigation

### "No documentation structure"
- Start with PROJECT_OVERVIEW.md
- Create basic categorization
- Focus on critical paths
- Build incrementally

### "Conflicting documentation"
- Identify authoritative source
- Consolidate into single truth
- Archive conflicts
- Add timestamps

### "Missing critical docs"
- Create templates for gaps
- Focus on blockers first
- Note for future work
- Provide workarounds

---

*These instructions enable consistent, high-quality documentation audits across diverse projects.*
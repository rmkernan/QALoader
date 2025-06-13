# Operator FAQ - Multi-Agent Framework

**Version:** 1.0  
**Purpose:** Quick answers to common questions and issues

---

## General Questions

### Q: How long does a typical mission take?
**A:** Most missions complete in 2-6 hours of active work, but can be spread across multiple days. The process is fully asynchronous - you can take breaks anytime.

### Q: Can I run multiple missions simultaneously?
**A:** Not recommended in the same project. Complete one mission before starting another, or use separate project directories.

### Q: Which model should I use for what?
**A:** 
- **Orchestrator:** Opus for complex missions, Sonnet for simple ones
- **Agents:** Almost always Sonnet (more cost-effective)
- **Switch** when Orchestrator recommends

### Q: How much will this cost in API usage?
**A:** Typical documentation audit mission:
- Orchestrator (Opus): ~2-3 hours of context
- Agents (Sonnet): ~4-6 hours combined
- Total cost varies by project size

---

## Communication Issues

### Q: I typed "O ready for A1" but nothing happened
**A:** This trigger tells YOU to launch Agent1, not the system:
1. Open new terminal/Claude instance
2. Start Claude with agent prompt
3. Agent will read its assignment from Agent1.md

### Q: Agent says "no new assignments found"
**A:** Agent is reading old messages. Ensure:
1. Agent reads the MOST RECENT 15-line block only
2. Look for latest timestamp
3. Ignore all previous message blocks

### Q: How do I know when an agent is done?
**A:** Look for these indicators:
- `Status: COMPLETED` in their response
- `Deliverable: [filename] created`
- `Next: Awaiting further instructions`

### Q: Orchestrator isn't seeing agent responses
**A:** You must manually trigger:
- Type "A1 ready for O" after Agent1 completes
- Type "A2 ready for O" after Agent2 completes
- Orchestrator only checks when YOU signal

---

## Context Management

### Q: "Approaching context limit" - what do I do?
**A:** 
1. Let agent finish current task
2. Have them create handoff document
3. Use "context compacting" (preferred over clearing)
4. Resume with fresh context

### Q: How do I compact context?
**A:** Claude Code will prompt you. Choose:
- "Compact" to preserve key context
- Avoid "Clear" unless absolutely necessary
- Follow handoff protocol first

### Q: Lost context mid-mission - how to recover?
**A:**
1. Search memory: "project name" + "multi-agent mission"
2. Read most recent Handoff document
3. Check CurrentState.md if it exists
4. Resume from documented next steps

---

## File and Directory Issues

### Q: Where should deliverables be created?
**A:** 
- **Mission reports:** In MultiAgentFramework/ or project root
- **Project files** (like PROJECT_OVERVIEW.md): In project root
- **Handoffs:** In MultiAgentFramework/ or working directory

### Q: Can't find agent deliverables
**A:** Common locations to check:
1. `/MultiAgentFramework/` directory
2. Project root directory
3. Use `find . -name "*Agent1*" -type f -mtime -1`

### Q: Should I delete the framework after mission?
**A:** No, keep it for:
- Future missions
- Reference documentation  
- Handoff records
- Mission history

---

## Memory System

### Q: Memory search returns nothing
**A:** Try broader searches:
- Just project name
- Just "multi-agent"
- Today's date
- Role names (Orchestrator, Agent1)

### Q: Should agents update memory?
**A:** Yes, for:
- Major discoveries
- Created deliverables
- Key decisions
- Blockers encountered

### Q: Memory entity naming convention?
**A:** 
- Main: "[Project] Multi-Agent Mission"
- Specific: "[Project] Documentation Audit"
- Handoffs: "[Project] Handoff [timestamp]"

---

## Mission-Specific Issues

### Q: Documentation audit found no problems
**A:** Still valuable! Document:
- What's working well
- Minor improvements
- Confirmation of quality
- Maintenance recommendations

### Q: Agents have conflicting findings
**A:** Normal! Orchestrator will:
- Identify why views differ
- Synthesize combined insight
- Make strategic decision
- Document rationale

### Q: Mission seems stuck
**A:** Check:
1. OrchestrationPlan.md for current phase
2. Agent[N].md files for pending work
3. Any blockers mentioned
4. Consider strategic pivot

---

## Performance Optimization

### Q: Agents working too slowly
**A:** 
- Break large tasks into smaller chunks
- Be specific about deliverables
- Provide file path hints
- Use Sonnet instead of Opus

### Q: Too much context used quickly
**A:** 
- Avoid reading entire large files
- Create summaries instead of copies
- Use targeted searches
- Implement findings immediately

### Q: Orchestrator overwhelmed by synthesis
**A:** 
- Switch to Opus if using Sonnet
- Break synthesis into phases
- Have agents pre-summarize
- Focus on key decisions only

---

## Best Practices

### Q: How often should I commit to git?
**A:** 
- After each major phase
- When significant deliverables created
- Before context clearing
- After mission completion

### Q: Should I edit agent deliverables?
**A:** 
- Generally no during mission
- Wait until mission complete
- Let agents iterate if needed
- Document manual changes

### Q: How to handle urgent interruptions?
**A:** 
1. Update CurrentState.md immediately
2. Commit all work to git
3. Create quick handoff note
4. Can resume anytime

---

## Troubleshooting Checklist

### Nothing seems to be working:
1. ✓ Correct directory?
2. ✓ Framework files present?
3. ✓ Reading correct Agent[N].md?
4. ✓ Using most recent message?
5. ✓ Memory accessible?

### Mission not progressing:
1. ✓ All agents completed current tasks?
2. ✓ Orchestrator received completions?
3. ✓ Next phase defined?
4. ✓ Any blockers identified?
5. ✓ Model appropriate for task?

### Files missing or wrong location:
1. ✓ Check both project root and framework dir
2. ✓ Use find command for recent files
3. ✓ Check git status for new files
4. ✓ Review agent responses for paths
5. ✓ Check for typos in filenames

---

## Getting Help

### If truly stuck:
1. Create comprehensive CurrentState.md
2. Document what's not working
3. Check this FAQ again
4. Consider restarting mission phase
5. Use handoff protocol to reset

### For framework improvements:
- Document what was confusing
- Note what would help
- Share feedback after mission
- Suggest FAQ additions

---

*Remember: The framework is designed to be resilient. When in doubt, update state documents and memory, then continue.*
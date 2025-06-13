# Multi-Agent Framework Setup Guide

**Version:** 1.0  
**Time Required:** 5-10 minutes  
**Difficulty:** Easy

---

## Prerequisites

- **Claude Code** (Anthropic's CLI) installed and working
- **Target project** where you want to run documentation audit (or other mission)
- **Basic familiarity** with command line

## Step 1: Deploy the Framework

### Option A: Copy Entire Framework (Recommended)
```bash
# From the directory containing MultiAgentFramework/
cp -r MultiAgentFramework/ /path/to/your/project/

# Navigate to your project
cd /path/to/your/project/
```

### Option B: Deploy to Subdirectory
```bash
# If you prefer keeping it separate
cd /path/to/your/project/
mkdir LLMCoordination
cp -r /source/MultiAgentFramework/* LLMCoordination/
```

### What Gets Copied:
```
MultiAgentFramework/
├── Core/               # Framework infrastructure
├── Missions/           # Available missions
├── Templates/          # Document templates
├── Docs/              # This documentation
└── FRAMEWORK_OVERVIEW.md
```

## Step 2: Choose Your Mission

### Currently Available:
1. **Documentation Audit** - Reorganize scattered docs into LLM-friendly system

### Check Available Missions:
```bash
ls MultiAgentFramework/Missions/
```

Each mission folder contains:
- `MissionBrief.md` - Overview and objectives
- `Instructions.md` - Detailed procedures
- `Validation.md` - Success criteria

## Step 3: Start Claude Code

### Launch with Correct Model:
```bash
# For complex missions requiring synthesis
claude --model claude-opus-4 

# For routine execution missions
claude --model claude-sonnet-3
```

### From Project Root:
```bash
# Make sure you're in the project directory
pwd  # Should show /path/to/your/project/
```

## Step 4: Initialize the Orchestrator

### Copy and Paste This Startup Prompt:
```
You are the Orchestrator for a Multi-Agent Mission.

STARTUP SEQUENCE:
1. Read MultiAgentFramework/FRAMEWORK_OVERVIEW.md
2. Read MultiAgentFramework/Core/OrchestratorGuide.md  
3. Read MultiAgentFramework/Core/CommunicationRules.md
4. List available missions in MultiAgentFramework/Missions/
5. Ask me which mission to execute

REMEMBER:
- You coordinate Agent1 and Agent2 through their .md files
- All agent communication is user-mediated  
- Follow the 15-line message protocol
- Update memory throughout the mission
```

## Step 5: Mission Execution Flow

### The Orchestrator Will:
1. Confirm its model (Opus/Sonnet)
2. Search memory for any prior work
3. Show available missions
4. Ask you to select one
5. Begin mission coordination

### Your Role as Human Operator:

**1. Relay Agent Communications:**
- When Orchestrator says it wrote to Agent1.md → Type: "O ready for A1"
- When Orchestrator says it wrote to Agent2.md → Type: "O ready for A2"

**2. Launch Agents When Signaled:**
After "O ready for A1", start new Claude instance:
```bash
claude  # Usually Sonnet for agents
```

Then give agent this prompt:
```
You are Agent1 in a Multi-Agent Mission.

STARTUP:
1. Read MultiAgentFramework/Core/AgentInstructions.md
2. Read MultiAgentFramework/Core/Agent1.md for your assignment
3. Execute the most recent task (last 15 lines)
4. Write your response in the same file
```

**3. Signal Completion:**
- When Agent1 completes task → Type to Orchestrator: "A1 ready for O"
- When Agent2 completes task → Type to Orchestrator: "A2 ready for O"

## Step 6: Managing the Mission

### Typical Session Flow:
```
Orchestrator → Assigns tasks to agents
You → "O ready for A1" and "O ready for A2"
You → Launch Agent1 and Agent2 in separate Claude instances
Agents → Work in parallel on their tasks
Agents → Complete and write responses
You → "A1 ready for O" (when you see completion)
You → "A2 ready for O" (when you see completion)
Orchestrator → Synthesizes findings
[Repeat for each phase]
```

### Best Practices:
- Keep all three Claude instances open (Orchestrator + 2 Agents)
- Watch for "Status: COMPLETED" in agent responses
- Don't rush - the process is asynchronous
- Save work regularly with git commits

## Common Issues and Solutions

### "Can't find framework files"
- Ensure you're in the correct directory
- Check framework deployed correctly
- Use full paths if needed

### "Agent seems confused"
- Make sure agent reads most recent message only
- Check they're reading correct Agent[N].md file
- Restart agent with fresh context if needed

### "Lost track of who's doing what"
- Check OrchestrationPlan.md
- Read CurrentState.md if it exists
- Ask Orchestrator for status update

### "Context limit approaching"
- Let current task complete
- Follow handoff protocol
- Compact context rather than clear

## Advanced Usage

### Switching Models Mid-Mission:
1. Orchestrator completes current phase
2. Creates comprehensive handoff
3. You restart with different model
4. New orchestrator reads handoff and continues

### Handling Interruptions:
1. Orchestrator updates CurrentState.md
2. Updates memory with progress
3. Can resume later from saved state

### Running Multiple Missions:
- Complete one before starting another
- Or use different directories
- Memory system keeps them separate

## Mission Completion

### When Mission Completes:
1. Orchestrator provides final synthesis
2. All deliverables remain in project
3. Memory updated with outcomes
4. **Execute cleanup protocol** (critical for next mission)
5. Consider git commit of results

### Mission Cleanup Protocol (Essential)

**Why Cleanup Matters:**
Without cleanup, Agent files accumulate hundreds of lines from previous missions, causing context bloat and slower agent startup.

**Cleanup Steps:**
```bash
# 1. Create mission archive
mkdir -p MultiAgentFramework/Missions/[MissionName]/
cp MultiAgentFramework/Core/Agent*.md → Missions/[MissionName]/Communication_Archive.md

# 2. Reset agent files to fresh templates
# Agent1.md and Agent2.md should contain only:
# - Instructions header
# - Empty CURRENT ASSIGNMENT section
# - Empty RECENT RESPONSES section  
# - Empty ARCHIVED EXCHANGES section
```

**Result:**
- **Before cleanup:** Next agents read 400+ lines of irrelevant history
- **After cleanup:** Next agents read ~30 lines of clean workspace
- **Improvement:** 90%+ token efficiency gain for future missions

### Typical Deliverables:
- **Mission outputs:** Remain in project structure
- **Communication archive:** Preserved in `Missions/[MissionName]/`
- **Fresh workspace:** Agent files reset for next mission
- **Memory updates:** Key insights stored in Neo4j

**Example Deliverables by Mission:**
- Documentation Audit: PROJECT_OVERVIEW.md, DOCUMENTATION_CATALOG.md, audit reports
- Memory Cleanup: Neo4j optimization, framework discovery improvements
- Security Audit: Vulnerability reports, remediation plans

## Next Steps

### After First Mission:
1. Review the deliverables created
2. Assess improvement in your project
3. Consider running other missions
4. Share feedback on framework

### Creating Custom Missions:
See `NEW_MISSION_GUIDE.md` for instructions on adding your own mission types to the framework.

---

## Quick Reference Card

### Launch Commands:
```bash
# Orchestrator (strategic work)
claude --model claude-opus-4

# Agents (execution work)  
claude --model claude-sonnet-3
```

### Communication Triggers:
- `"O ready for A1"` - After orchestrator writes to Agent1
- `"O ready for A2"` - After orchestrator writes to Agent2  
- `"A1 ready for O"` - After Agent1 completes work
- `"A2 ready for O"` - After Agent2 completes work

### Key Files to Monitor:
- `Core/Agent1.md` - Agent1's assignments and responses
- `Core/Agent2.md` - Agent2's assignments and responses
- `OrchestrationPlan.md` - Overall mission progress
- `CurrentState.md` - Real-time status

---

*With this framework, you can accomplish complex multi-faceted tasks that would overwhelm a single LLM.*
# Simple Multi-Agent Communication Protocol

**Version:** 1.0
**Created on:** June 16, 2025. 6:03 p.m. Eastern Time
**Updated:** June 16, 2025. 6:07 p.m. Eastern Time - Changed lines to read from 30 to 20 for efficiency.
**Purpose:** To define a simple, lightweight, file-based protocol for coordinating work between an Orchestrator and two Agents, facilitated by a Human User.

---

## 1. Roles

*   **Orchestrator:** The project manager. Defines the plan, creates tasks for Agents, and synthesizes results.
*   **Agent 1 & Agent 2:** The developers. Execute specific tasks assigned by the Orchestrator.
*   **Human User:** The communication trigger. You are the essential link that activates the Orchestrator and Agents at the appropriate times.

---

## 2. Communication Channels

*   All communication happens in two dedicated files:
    *   `/mnt/c/pythonprojects/QALoader/MultiAgentFramework/Agent1.md`
    *   `/mnt/c/pythonprojects/QALoader/MultiAgentFramework/Agent2.md`
*   These files are **append-only**. All new messages (assignments, questions, reports) are added to the **bottom** of the file.

---

## 3. The Core Workflow

The process is asynchronous and relies on the Human User as a manual trigger.

1.  **Orchestrator Assigns:** The Orchestrator appends a task to the bottom of the target Agent's file (`Agent1.md` or `Agent2.md`).
2.  **Human Triggers Agent:** The Human User informs the Agent that its assignment is ready.
3.  **Agent Reads & Acts:** The Agent reads its assignment, performs the work, and appends a detailed report to the bottom of its file.
4.  **Human Triggers Orchestrator:** The Human User informs the Orchestrator that the Agent's work is complete.
5.  **Orchestrator Reviews:** The Orchestrator reads the Agent's report and decides the next step.

---

## 4. Critical Rules for Simplicity

To keep this framework lightweight and efficient, you **MUST** follow these two rules:

### Rule #1: Read Only Recent Lines

**DO NOT READ THE ENTIRE FILE.** To get your current assignment or the latest report, read only the **last 20 lines** from the bottom of the relevant file. This ensures speed and token efficiency.

### Rule #2: Use Auxiliary Files for Long Messages

If any assignment or report will be **longer than 15 lines**, you must use an auxiliary file:

1.  Create a new, separate `.md` file in a logical location (e.g., `/MultiAgentFramework/Tasks/` or `/MultiAgentFramework/Outputs/`).
2.  Write the full, detailed message in that new file.
3.  Append a **single-line pointer message** to the main channel file (`Agent1.md` or `Agent2.md`).

**Example of a pointer message:**
`TASK ASSIGNED: Detailed instructions are in /MultiAgentFramework/Tasks/Task_20250616_A.md`

**Example of a completion message:**
`TASK COMPLETE: Full code and analysis are in /MultiAgentFramework/Outputs/Agent1_Report_20250616.md`

---

*Adherence to these rules is mandatory for the framework to function correctly.*

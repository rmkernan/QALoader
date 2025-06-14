Creation Date: 6/9/25 ~ 1PM ET
# Claude Development Guidelines for Q&A Loader

🚨 **MANDATORY: READ THIS ENTIRE FILE BEFORE ANY WORK** 🚨
**STOP - You MUST read this complete file before making ANY code changes**

This file provides specific guidance for AI assistants (Claude) working on the Q&A Loader project.

## 🚨 DOCUMENTATION STANDARDS (CRITICAL - APPLY TO ALL CODE CHANGES)

### ⛔ BEFORE ANY CODE CHANGES - MANDATORY STEPS ⛔
1. **READ `Docs/DocumentationStandards.md` FIRST** - Cannot be skipped
2. **Run `date` command** to get current timestamp - Never guess times  
3. **Apply documentation standards automatically** after any code changes
4. **Use trigger phrase**: "Apply documentation standards" for comprehensive review

### Required for ALL Code Files

### Key Requirements
- **File Headers**: JSDoc with architectural context, workflow context, American timestamps
- **Function Documentation**: Complete JSDoc with examples for all exported functions  
- **Timestamp Format**: `Month Day, Year. Hour:Minute a.m./p.m. Eastern Time` (MUST use `date` bash command)
- **Timestamp Rules**: NEVER overwrite existing timestamps, ALWAYS add new "Updated:" lines
- **Security Documentation**: Required for all auth-related code
- **Component Documentation**: Include accessibility and usage examples

### 🚨 CRITICAL TIMESTAMP PROCESS (MANDATORY - NO EXCEPTIONS)
**❌ STOP ALL WORK if you attempt to modify timestamps without following this process ❌**

**REQUIRED SEQUENCE (Cannot be skipped):**
1. **MANDATORY**: Run `date` command to get actual current time - NEVER guess times
2. **MANDATORY**: Convert to American format: `June 10, 2025. 9:37 a.m. Eastern Time`
3. **FORBIDDEN**: Modifying existing @created timestamps (immediate session termination offense)
4. **REQUIRED**: Add NEW "Updated:" line only
5. **REQUIRED**: Include one-sentence description of what changed

**🚨 TIMESTAMP CORRUPTION PREVENTION:**
- If you see 2024 dates in a 2025 project - STOP and ask user about timeline
- If @created timestamps seem wrong - STOP and ask user for clarification  
- If you're unsure about any timestamp - STOP and run `date` command
- NEVER assume you know what time it is

### 🧠 ENHANCED MEMORY & CONTEXTUAL UNDERSTANDING PROTOCOL (CRITICAL)
**ALWAYS search project memory at session start:**
1. **Search for your task area**: `mcp__neo4j-memory-global__search_nodes` with relevant terms
2. **Check for previous work**: Look for entities related to your current assignment  
3. **Review project context**: Search for project initiatives and ongoing efforts
4. **Load architectural knowledge**: Search for "QALoader Architecture", "Code Patterns", "File Dependency Graph"
5. **Update memory with findings**: Add new observations as you work

**🚀 SMART CONTEXTUAL UNDERSTANDING (Updated Protocol):**
1. **Try Simple First**: Use Glob/Grep/Read for obvious file searches before loading complex context
2. **Reality Check**: If simple tools don't solve it, ask user for more context before escalating
3. **User-Guided Escalation**: Only load full Project Radar context if user confirms complexity
4. **Apply Patterns**: Use ProjectRadar files only after confirming genuine complexity

**Simple-First Workflow:**
1. **Quick assessment** - Parse request for file extensions, specific errors, single files
2. **Direct tool attempts** - Try 1-2 basic searches (30 seconds max)
3. **Stop and ask** - If not solved, ask user for more details instead of assuming complexity
4. **Escalate if confirmed** - Load Project Radar context only if user confirms multi-component task

**Enhanced search terms for QA Loader project:**
- "QALoader Architecture" - System architecture and component relationships  
- "Backend Code Patterns" - Service layer, dependency injection, validation patterns
- "Frontend Code Patterns" - Context providers, component composition, type safety
- "File Dependency Graph" - File relationships and impact analysis
- Your specific task area (e.g., "API", "frontend", "deployment", "authentication")

**When to create new memories:**
- Successful simple-first workflows and tool combinations
- Failed over-engineering attempts and lessons learned
- User-guided escalation patterns and outcomes
- Effective "stop and ask" interaction patterns

### 🔄 CONTEXT MANAGEMENT & CONTINUITY
**When approaching context limit (80% full):**
1. **STOP work immediately** and execute handoff protocol
2. **Read `AgentCoord/HandoffProtocol.md`** for complete procedures  
3. **Update memory** with all critical session information
4. **Create handoff document** for seamless transition
5. **Prefer COMPACTING over clearing** to preserve context

**After context management:**
- Search memory for project context and handoff information
- Review most recent handoff document for critical context
- Resume work with full awareness of previous progress

### 🎯 MODEL SELECTION STRATEGY (For Orchestrators)
**🚨 CRITICAL: Assess model appropriateness before EVERY major task:**

**Initial Confirmation (First Time Only):**
- **Ask user**: "Am I currently running on Opus or Sonnet?"
- **STOP ALL ACTIVITY** until user responds - DO NOT proceed with decisions/actions

**Ongoing Assessment (Every Major Task):**
- **BEFORE each significant task**: Self-assess model appropriateness
- **Recommend switches proactively**: 
  - "This synthesis work requires Opus reasoning - should we switch?"
  - "This routine task is better for Sonnet - recommend switching to save Opus budget"
- **WAIT** for user decision before proceeding with major work

**Use Opus for**: Strategic synthesis, architecture design, complex decision-making
**Use Sonnet for**: Routine coordination, file organization, status reporting, implementation execution

### 🚨 GIT OPERATIONS PROTOCOL (Critical)
**ORCHESTRATOR EXCLUSIVE RESPONSIBILITY:**
- **ALL git operations** performed by Orchestrator only
- **Agents NEVER use git commands** (add, commit, push, status, etc.)
- **Centralized coordination** prevents conflicts and ensures safety
- **Backup before risky operations** always orchestrator-managed

### Backend-Specific Documentation
- Document Supabase integration patterns and error handling
- Include environment variable dependencies and security implications
- Explain FastAPI route patterns, validation, and authentication requirements
- Document transaction handling and database operation patterns

### Automatic Application Required
- After any code modifications or bug fixes
- When adding new functions, components, or files
- Before git commits (especially for significant changes)
- When refactoring or restructuring code

## Performance & Efficiency

### Tool Usage
- **ALWAYS use simultaneous tool calls** when possible to maximize productivity
- Batch read operations for related files in a single message
- Use parallel bash commands when running multiple independent operations
- Prefer concurrent searches over sequential ones

### Git Workflow
- **Remind user to create git backups** after:
  - Significant refactoring (>100 lines changed)
  - Adding new major features
  - Before major architectural changes
  - After completing milestone work
- **Apply documentation standards before commits**
- Suggest meaningful commit messages that explain the "why" not just the "what"
- Include timestamps in commit messages: `Timestamp: YYYY-MM-DD HH:MM ET`

## Code Quality Standards

### File Size & Modularity
- **450 line rule**: If any code file exceeds ~450 lines (excluding comments), suggest refactoring
- Prefer small, focused components over monolithic files
- Extract utility functions into dedicated files in `src/utils/`
- Break complex components into smaller sub-components
- Use custom hooks in `src/hooks/` for reusable logic

### TypeScript Best Practices
- Always use proper TypeScript types - avoid `any`
- Create interfaces in `src/types.ts` for shared data structures
- Use union types for constrained values (e.g., `'Basic' | 'Advanced'`)
- Prefer type safety over convenience
- **Document complex types** with JSDoc comments explaining purpose and usage

### React Patterns
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused on a single responsibility
- Use React.memo for performance when appropriate
- Extract complex state logic into custom hooks

## Project-Specific Guidelines

### Frontend Architecture
- **State Management**: Use React Context for global state, local state for component-specific data
- **Styling**: Use TailwindCSS classes, avoid inline styles
- **API Integration**: All API calls go through services in `src/services/`
- **Constants**: Store all magic strings/numbers in `src/constants.ts`

### File Organization
```
src/
├── components/          # UI components
│   ├── common/         # Reusable components
│   └── pages/          # Page-specific components
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── utils/              # Pure utility functions
├── contexts/           # React contexts
├── types.ts            # TypeScript type definitions
└── constants.ts        # Application constants
```

### Error Handling
- Always provide user-friendly error messages
- Use `react-hot-toast` for user notifications
- Log detailed errors to console for debugging
- Handle loading and error states in UI components
- Validate API responses before using data

### Documentation Standards
- Update JSDoc comments for significant changes
- Keep README files current
- Document complex business logic
- Include usage examples for utility functions
- Update API documentation when backend contracts change

## Environment & Configuration

### Development Setup
- Use `.env.local` for local environment variables
- Never commit API keys or secrets
- Prefer environment variables over hardcoded values
- Use Vite's environment variable handling

### Testing Approach
- Test critical user flows
- Mock external API calls (Gemini, future backend)
- Test error conditions and edge cases
- Verify TypeScript compilation passes

## Backend Development (In Progress - Phase 1 Complete)

### API Design
- Follow RESTful conventions
- Use appropriate HTTP status codes
- Provide detailed error responses
- Implement proper request validation
- Use transactions for data integrity

### Database Patterns
- Use meaningful, human-readable IDs
- Include created/updated timestamps
- Index frequently queried fields
- Design for extensibility

### Backend Context Files
- **Read `backend/BACKEND_CONTEXT.md`** at start of each backend session
- **Update ProjectStatus.md** after completing phases
- **Reference TechnicalImplementationGuide.md** for implementation steps
- **Working Directory:** `/mnt/c/PythonProjects/QALoader/backend`

### Backend Development Notes
- **Phase 1 Complete:** FastAPI foundation with Supabase connection
- **Current State:** Server runs on port 8000, all endpoints accessible (placeholders)
- **Virtual Environment:** `source venv/bin/activate` before any Python commands
- **Database:** Supabase project xxgrrgmrzhayboraohin connected and working

## Code Review Checklist

Before suggesting changes are complete:
- [ ] **Documentation standards applied** (DocumentationStandards.md)
- [ ] **TIMESTAMP VALIDATION**: All timestamps verified against `date` command output
- [ ] **NO @created MODIFICATIONS**: Existing @created timestamps left untouched
- [ ] **File headers include** architectural/workflow context with timestamps
- [ ] **All functions documented** with JSDoc and examples
- [ ] TypeScript compilation passes without errors
- [ ] No console errors in browser
- [ ] UI is responsive and accessible
- [ ] Error states are handled gracefully
- [ ] Loading states provide user feedback
- [ ] Code follows project conventions
- [ ] No obvious performance issues
- [ ] Security implications documented for auth code

## Common Patterns

### Component Creation
```typescript
// Good: Focused, typed component
interface Props {
  data: SpecificType;
  onAction: (id: string) => void;
}

export const ComponentName: React.FC<Props> = ({ data, onAction }) => {
  // Implementation
};
```

### API Service Pattern
```typescript
// Good: Centralized, typed API calls
export const apiService = {
  async getQuestions(filters: Filters): Promise<Question[]> {
    // Implementation with proper error handling
  }
};
```

### Error Handling Pattern
```typescript
// Good: Consistent error handling
try {
  const result = await apiCall();
  toast.success('Operation completed');
  return result;
} catch (error) {
  console.error('Detailed error:', error);
  toast.error('User-friendly message');
  throw error;
}
```

## Priorities

1. **User Experience**: Always prioritize working, intuitive UI
2. **Type Safety**: Leverage TypeScript for better developer experience
3. **Maintainability**: Write code that's easy to understand and modify
4. **Performance**: Consider bundle size and runtime performance
5. **Extensibility**: Design for future features and requirements

---

*This file should be updated as the project evolves and new patterns emerge.*
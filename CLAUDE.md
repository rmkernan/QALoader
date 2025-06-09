# Claude Development Guidelines for Q&A Loader

This file provides specific guidance for AI assistants (Claude) working on the Q&A Loader project.

## Documentation Standards (CRITICAL - READ FIRST)

### Required for ALL Code Files
- **ALWAYS read `Docs/DocumentationStandards.md`** before creating/modifying any code
- **Apply documentation standards automatically** after any code changes
- **Use trigger phrase**: "Apply documentation standards" for comprehensive review

### Key Requirements
- **File Headers**: JSDoc with architectural context, workflow context, American timestamps
- **Function Documentation**: Complete JSDoc with examples for all exported functions  
- **Timestamp Format**: `Month Day, Year. Hour:Minute a.m./p.m. Eastern Time`
- **Security Documentation**: Required for all auth-related code
- **Component Documentation**: Include accessibility and usage examples

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
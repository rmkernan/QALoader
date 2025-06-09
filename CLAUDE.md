# Claude Development Guidelines for Q&A Loader

This file provides specific guidance for AI assistants (Claude) working on the Q&A Loader project.

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
- Suggest meaningful commit messages that explain the "why" not just the "what"

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

## Backend Development (When Implemented)

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

## Code Review Checklist

Before suggesting changes are complete:
- [ ] TypeScript compilation passes without errors
- [ ] No console errors in browser
- [ ] UI is responsive and accessible
- [ ] Error states are handled gracefully
- [ ] Loading states provide user feedback
- [ ] Code follows project conventions
- [ ] No obvious performance issues
- [ ] Documentation is updated if needed

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
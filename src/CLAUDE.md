# Frontend Development Guidelines for Q&A Loader

**Purpose:** Specific guidance for AI assistants working on React TypeScript frontend components.

**Created on:** June 9, 2025. 4:15 p.m. Eastern Time  
**Updated:** June 9, 2025. 4:15 p.m. Eastern Time - Initial creation of frontend-specific guidelines

---

## Documentation Standards (CRITICAL)

### Required Before Any Frontend Work
- **Read `../Docs/DocumentationStandards.md`** before modifying any React components
- **Apply documentation standards** to all .tsx/.ts files
- **Use American timestamp format**: `Month Day, Year. Hour:Minute a.m./p.m. Eastern Time`

### Component Documentation Requirements
```typescript
/**
 * @file src/components/ComponentName.tsx
 * @description Clear description of component purpose and functionality
 * @created Month Day, Year. Hour:Minute a.m./p.m. Eastern Time
 * @updated Month Day, Year. Hour:Minute a.m./p.m. Eastern Time - Change description
 * 
 * @architectural-context
 * Layer: UI Component/Page/Modal/Form/etc.
 * Dependencies: Context dependencies, external libraries, custom hooks
 * Pattern: State management pattern, data flow pattern
 * 
 * @workflow-context
 * User Journey: Which user workflow this supports
 * Sequence Position: Where this fits in the user flow
 * Inputs: Props, user interactions, context data
 * Outputs: UI rendering, events triggered, state changes
 * 
 * @authentication-context
 * Auth Requirements: Public/Protected/Role-based access
 * Security: Any security considerations
 * 
 * @mock-data-context (if applicable)
 * Purpose: Why mock data is used
 * Behavior: How mock data works
 * Activation: What triggers mock mode
 */
```

### Function Documentation
```typescript
/**
 * @function handleSubmit
 * @description Processes form submission and updates application state
 * @param {FormEvent} event - Form submission event
 * @returns {Promise<void>} Resolves when submission complete
 * @throws {Error} When validation fails or API call errors
 * @example
 * const handleSubmit = async (event) => {
 *   // Implementation details
 * };
 */
```

## React Component Standards

### Component Structure
- **Keep components under 450 lines** (excluding documentation)
- **Single responsibility principle** - one clear purpose per component
- **Extract sub-components** when logic becomes complex
- **Use TypeScript interfaces** for all props and state

### Props and State Management
```typescript
// Always define proper interfaces
interface ComponentProps {
  data: SpecificType;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

// Document complex prop structures
interface FilterProps {
  /** Current filter values applied to the data */
  filters: Filters;
  /** Callback when filters change, triggers data refetch */
  onFiltersChange: (newFilters: Filters) => void;
  /** Available filter options populated from server */
  availableOptions: FilterOptions;
}
```

### State Management Patterns
- **Local state**: `useState` for component-specific data
- **Global state**: React Context (`AppContext`) for shared application state
- **Server state**: Direct API calls through services, not stored in global state
- **Form state**: Local state with proper validation

### Error Handling Requirements
```typescript
// Always include error boundaries and loading states
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

try {
  setIsLoading(true);
  const result = await apiCall();
  toast.success('Operation completed successfully');
} catch (err) {
  const errorMessage = 'User-friendly error message';
  setError(errorMessage);
  toast.error(errorMessage);
  console.error('Detailed error for debugging:', err);
} finally {
  setIsLoading(false);
}
```

## Accessibility Requirements

### Required Accessibility Features
- **Semantic HTML**: Use proper HTML elements (button, form, nav, etc.)
- **ARIA labels**: For complex interactions and dynamic content
- **Keyboard navigation**: All interactive elements must be keyboard accessible
- **Focus management**: Proper focus handling in modals and dynamic content
- **Color contrast**: Ensure sufficient contrast for text and interactive elements

### Accessibility Documentation
```typescript
/**
 * @accessibility
 * - Uses semantic button elements for all actions
 * - Includes ARIA labels for screen readers
 * - Supports keyboard navigation (Enter/Space for actions)
 * - Focus trap implemented for modal interactions
 * - High contrast colors meet WCAG AA standards
 */
```

## TypeScript Best Practices

### Type Safety Requirements
- **No `any` types** - always use specific types or unions
- **Strict mode enabled** - leverage TypeScript's strict checking
- **Interface definitions** in `types.ts` for shared structures
- **Generic types** for reusable component patterns

### Type Documentation
```typescript
/**
 * @interface Question
 * @description Core data structure for Q&A items stored in database
 * @field {string} id - Unique identifier (format: DCF-WACC-P-001)
 * @field {string} topic - Main subject area (e.g., "DCF", "M&A")
 * @field {string} subtopic - Specific area within topic (e.g., "WACC", "Synergies")
 * @field {string} difficulty - Complexity level ("Basic" | "Advanced" | "Expert")
 * @field {string} type - Question type ("Problem" | "Definition" | "Theory")
 */
interface Question {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  type: string;
  questionText: string;
  answerText: string;
}
```

## Styling and UI Standards

### TailwindCSS Usage
- **Use utility classes** over custom CSS
- **Consistent spacing**: Use standardized spacing scale (p-4, m-6, etc.)
- **Responsive design**: Include responsive breakpoints for mobile/tablet
- **Color system**: Use defined color palette from Tailwind config

### Component Patterns
```typescript
// Good: Consistent styling patterns
const buttonClasses = "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors";
const cardClasses = "bg-white shadow-md rounded-lg p-6 border border-slate-200";

// Good: Conditional styling
const statusClasses = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800"
};
```

## Testing Requirements

### Component Testing
- **Test user interactions** (clicks, form submissions, navigation)
- **Test error states** (loading, error messages, empty states)
- **Test accessibility** (keyboard navigation, screen reader compatibility)
- **Mock external dependencies** (API calls, context providers)

### Testing Documentation
```typescript
/**
 * @testing
 * - Renders correctly with all prop variations
 * - Handles form submission with validation
 * - Displays error states appropriately
 * - Supports keyboard navigation
 * - Integrates properly with AppContext
 */
```

## Performance Considerations

### Optimization Patterns
- **React.memo** for components that receive stable props
- **useMemo/useCallback** for expensive calculations or stable references
- **Code splitting** with React.lazy for large components
- **Image optimization** with proper sizing and lazy loading

### Performance Documentation
```typescript
/**
 * @performance
 * - Memoized to prevent unnecessary re-renders when parent updates
 * - Uses React.memo with custom comparison for complex props
 * - Debounced search input to prevent excessive API calls
 * - Virtualized table for large datasets (>100 items)
 */
```

## Integration with Backend

### API Integration Patterns
- **Services layer**: All API calls go through `src/services/`
- **Error handling**: Consistent error responses and user feedback
- **Loading states**: Proper loading indicators for async operations
- **Type safety**: API responses match TypeScript interfaces

### API Service Documentation
```typescript
/**
 * @service QuestionService
 * @description Handles all question-related API operations
 * @integration Backend FastAPI endpoints at /api/questions/*
 * @authentication Requires JWT token in Authorization header
 * @error-handling Returns standardized error format with user-friendly messages
 */
```

## Common Patterns

### Form Handling Pattern
```typescript
/**
 * @pattern FormHandling
 * @description Standard form handling with validation and submission
 */
const [formData, setFormData] = useState<FormType>({});
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();
  
  // Validation
  const validationErrors = validateForm(formData);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // Submission with error handling
  try {
    setIsSubmitting(true);
    await submitForm(formData);
    toast.success('Form submitted successfully');
    onSuccess?.();
  } catch (error) {
    toast.error('Failed to submit form');
    console.error('Form submission error:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

### Modal Pattern
```typescript
/**
 * @pattern ModalComponent
 * @description Standard modal with focus management and accessibility
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      // Focus management
      const firstFocusable = modalRef.current?.querySelector('[tabindex="0"]');
      firstFocusable?.focus();
      
      // Escape key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
```

## Automated Quality Assurance (MANDATORY - FRONTEND)

### After Every Frontend Code Change
- **Run linting**: `npm run lint` (must pass with zero warnings)
- **Run type checking**: `npm run typecheck` (must pass completely)
- **Test functionality**: Start dev server `npm run dev`, verify changes work
- **Browser console**: Check for JavaScript errors, warnings, or TypeScript issues
- **Responsive test**: Verify mobile/desktop layouts work correctly

### Before Any Git Commit (NON-NEGOTIABLE)
- [ ] **ESLint passes**: `npm run lint` with zero warnings
- [ ] **TypeScript compiles**: `npm run typecheck` with no errors
- [ ] **Manual functionality test**: Changed components/features tested
- [ ] **No console errors**: Browser console clean during testing
- [ ] **Accessibility verified**: Screen reader/keyboard navigation tested
- [ ] **Performance check**: No obvious performance regressions

### Frontend Quality Commands
```bash
# Essential quality checks (run every time)
npm run lint                    # ESLint check
npm run typecheck              # TypeScript compilation  
npm run dev                    # Start server, verify no crashes

# Development server verification
curl http://localhost:3000     # Verify server responds
# Open browser, check console for errors
```

### Quality Reporting (REQUIRED)
Always include after frontend changes:
```
🔍 FRONTEND QUALITY CHECK:
✅ ESLint: Clean (0 warnings)
✅ TypeScript: Compiled successfully
✅ Manual Test: [Component/feature tested]
✅ Browser Console: No errors
✅ Responsive: Mobile/desktop verified
✅ Ready for commit
```

### React-Specific Quality Checks
- **Component rendering**: No React warnings in console
- **State updates**: No memory leaks or infinite re-renders
- **Props validation**: TypeScript interfaces enforced
- **Event handlers**: Proper cleanup and no memory leaks
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Code Review Checklist (Frontend)

Before completing frontend work:
- [ ] **Quality assurance completed** (linting, type checking, browser testing)
- [ ] **Documentation standards applied** with proper timestamps
- [ ] **Component headers include** architectural/workflow context
- [ ] **All functions documented** with JSDoc and examples
- [ ] **TypeScript types** are specific and well-documented
- [ ] **Accessibility features** implemented and documented
- [ ] **Error handling** includes user feedback and console logging
- [ ] **Performance optimizations** applied where appropriate
- [ ] **Responsive design** works on mobile/tablet/desktop
- [ ] **Integration tested** with backend APIs and global state
- [ ] **No console errors** or TypeScript compilation issues

---

*This file should be referenced for all frontend development work and updated as patterns evolve.*
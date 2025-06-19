# Task: QuizMe Basic UI Components

**Assigned to:** Agent 1  
**Date:** 2025-06-16 18:12  
**Priority:** HIGH  
**Context:** Building UI components for MockMe's QuizMe feature

## Background
MockMe is implementing a structured quiz feature. You'll create reusable React components that will be assembled into the full quiz interface. These components should follow MockMe's existing design patterns using Tailwind CSS and shadcn/ui.

## Component Specifications

### 1. DifficultyToggle Component
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/quiz/DifficultyToggle.tsx`

```typescript
interface DifficultyToggleProps {
  value: 'Basic' | 'Advanced'
  onChange: (value: 'Basic' | 'Advanced') => void
  disabled?: boolean
}
```

**Design Requirements:**
- Toggle button group style (like radio buttons but visually connected)
- Basic: Default state, left button
- Advanced: Right button
- Active state: Primary color background (use Tailwind's primary colors)
- Inactive state: Gray outline
- Smooth transition: 200ms ease
- Disabled state: Reduced opacity, no hover effects
- Mobile responsive: Full width on small screens

**Visual Example:**
```
[Basic] [Advanced]  <- Connected buttons
 Active   Inactive
```

### 2. QuizProgressIndicator Component
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/quiz/QuizProgressIndicator.tsx`

```typescript
interface QuizProgressIndicatorProps {
  currentQuestion: number // 1-10
  totalQuestions: number // Always 10 for MVP
  answers: Record<number, boolean> // Question number -> answered
  className?: string
}
```

**Design Requirements:**
- Horizontal row of circles representing each question
- States:
  - Unanswered: ○ (gray outline)
  - Current: ◉ (blue with pulse animation)
  - Answered: ✓ (green check)
- Show "Question X/10" text above or beside
- Click on circle to jump to question (emit onQuestionClick event)
- Mobile: Scrollable horizontal if needed
- Accessibility: Proper ARIA labels

### 3. QuizQuestion Component
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/quiz/QuizQuestion.tsx`

```typescript
interface QuizQuestionProps {
  questionNumber: number
  questionText: string
  isActive?: boolean
  className?: string
}
```

**Design Requirements:**
- Background: Light blue (#E3F2FD or Tailwind blue-50)
- Padding: 20px (p-5 in Tailwind)
- Border radius: 8px (rounded-lg)
- Font: 18px (text-lg), font-weight 600 (font-semibold)
- Question number: "Q1:" format, slightly bolder
- Fade-in animation when appearing (300ms)
- Optional hover effect for review mode
- Max width for readability

### 4. QuizAnswerInput Component
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/quiz/QuizAnswerInput.tsx`

```typescript
interface QuizAnswerInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  questionId: string
  autoFocus?: boolean
}
```

**Design Requirements:**
- Auto-expanding textarea (grows with content)
- Initial height: 3 lines
- Max height: 10 lines (then scrollable)
- Background: White
- Border: 1px solid #E0E0E0 (Tailwind border-gray-300)
- Focus state: Blue border with subtle shadow
- Padding: 12px (p-3)
- Border radius: 8px (rounded-lg)
- Placeholder text: Light gray
- Character count indicator if >500 chars
- Smooth height transitions

## Implementation Guidelines

1. **Use Existing Patterns:**
   - Check `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/ui/` for similar components
   - Follow the Button component pattern for DifficultyToggle
   - Use consistent spacing and colors

2. **TypeScript Requirements:**
   - Export all interfaces
   - Use proper React.FC type
   - Include JSDoc comments

3. **Styling Approach:**
   - Tailwind utility classes preferred
   - Use cn() utility for conditional classes
   - Support dark mode where applicable

4. **Accessibility:**
   - Proper ARIA labels
   - Keyboard navigation support
   - Focus management

5. **Testing Considerations:**
   - Export props interfaces for testing
   - Add data-testid attributes
   - Pure components (no side effects)

## Example Code Structure

```typescript
import React from 'react'
import { cn } from '@/lib/utils'

interface ComponentProps {
  // ... props
}

export const ComponentName: React.FC<ComponentProps> = ({
  // ... destructured props
}) => {
  // Component logic
  
  return (
    <div className={cn(
      "base-classes",
      conditionalClass && "conditional-classes",
      className
    )}>
      {/* Component JSX */}
    </div>
  )
}

ComponentName.displayName = 'ComponentName'
```

## Deliverables
1. Four complete React components with TypeScript
2. All components exported from an index file
3. Components should be visually polished and production-ready
4. Follow MockMe's existing component patterns

## Success Criteria
- Components render without errors
- TypeScript compilation passes
- Responsive design works on mobile
- Smooth animations and transitions
- Matches the design specifications exactly

Please implement all four components following these specifications. Focus on creating clean, reusable components that will integrate smoothly with the quiz pages.
# Task: QuizMe Basic UI Components

**Created:** 2025.06.16_ 6:23PM ET  
**Purpose:** Detailed specifications for Agent 1 to build QuizMe UI components

## Background
MockMe is implementing a structured quiz feature where users select a topic + difficulty, answer 10 questions, and receive AI-powered feedback. You'll create the foundational React components.

## Component Specifications

### 1. DifficultyToggle Component
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/quiz/DifficultyToggle.tsx`

```typescript
interface DifficultyToggleProps {
  value: 'Basic' | 'Advanced'
  onChange: (value: 'Basic' | 'Advanced') => void
  disabled?: boolean
  className?: string
}
```

**Visual Design:**
- Two connected buttons (like a toggle group)
- Active: Primary background color
- Inactive: Gray outline only
- Smooth transition on selection change
- Full width on mobile screens

### 2. QuizProgressIndicator Component
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/quiz/QuizProgressIndicator.tsx`

```typescript
interface QuizProgressIndicatorProps {
  currentQuestion: number // 1-10
  totalQuestions: number // Always 10
  answeredQuestions: number[] // Array of answered question numbers
  onQuestionClick?: (questionNumber: number) => void
  className?: string
}
```

**Visual Design:**
- Horizontal row of 10 circles
- States: Unanswered (○), Current (◉ with pulse), Answered (✓)
- Clickable for navigation
- Shows "Question X/10" text

### 3. QuizQuestion Component
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/quiz/QuizQuestion.tsx`

```typescript
interface QuizQuestionProps {
  questionNumber: number
  questionText: string
  className?: string
}
```

**Visual Design:**
- Light blue background (#E3F2FD)
- 20px padding, 8px border radius
- Question number format: "Q1: "
- Font: 18px, semibold

### 4. QuizAnswerInput Component
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/components/quiz/QuizAnswerInput.tsx`

```typescript
interface QuizAnswerInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}
```

**Visual Design:**
- Auto-expanding textarea
- Min height: 3 lines, Max: 10 lines
- White background, gray border
- Blue focus state with shadow
- Character count if >500 chars

## Implementation Notes

1. Check existing UI components in `/mvp/src/components/ui/` for patterns
2. Use `cn()` utility from `@/lib/utils` for conditional classes
3. Export all components from `/mvp/src/components/quiz/index.ts`
4. Include proper TypeScript types and JSDoc comments
5. Make components pure (no side effects)

## Example Structure
```typescript
import React from 'react'
import { cn } from '@/lib/utils'

export interface ComponentNameProps {
  // props with JSDoc
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  ...props 
}) => {
  return (
    <div className={cn("base-classes", className)}>
      {/* content */}
    </div>
  )
}
```

## Success Criteria
- All 4 components created and exported
- TypeScript compilation passes
- Responsive on mobile
- Matches design specifications
- Smooth animations where specified
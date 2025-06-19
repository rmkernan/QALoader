# Task: QuizMe Core Architecture & Type Definitions

**Assigned to:** Agent 2  
**Date:** 2025-06-16 18:12  
**Priority:** HIGH  
**Context:** Building structured 10-question quiz feature for MockMe finance education platform

## Background
MockMe is transitioning from chat-based AI mentor to structured quiz format. We're building a QuizMe feature where users:
1. Select topic + difficulty (Basic/Advanced)
2. Answer 10 questions sequentially
3. Review answers before submission
4. Submit for batch AI evaluation
5. View comprehensive feedback

The all_questions table is managed by QALoader service (separate project).

## Deliverables

### 1. TypeScript Type Definitions
Create `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/types/quiz.ts` with:

```typescript
// Core quiz configuration
interface QuizConfig {
  topic: string
  difficulty: 'Basic' | 'Advanced'
  questionCount: number // Always 10 for MVP
}

// Question structure (from QALoader, no answers included)
interface QuizQuestion {
  questionId: string // e.g., "DCF-WACC-D-001"
  questionText: string
  questionNumber: number // 1-10
}

// User's answer to a question
interface QuizAnswer {
  questionId: string
  userAnswer: string
  timeSpent?: number // Optional: seconds
  savedAt?: string // ISO timestamp for auto-save
}

// Quiz session state
interface QuizSession {
  sessionId: string
  config: QuizConfig
  questions: QuizQuestion[]
  answers: Record<string, QuizAnswer> // keyed by questionId
  status: 'configuring' | 'taking' | 'reviewing' | 'submitting' | 'completed'
  startedAt: string
  submittedAt?: string
}

// Results from evaluation
interface QuizResults {
  sessionId: string
  overallScore: number // 0-10
  percentageScore: number // 0-100
  summary: {
    strengths: string[]
    weaknesses: string[]
    keyInsights: string
  }
  questionResults: QuizQuestionResult[]
  recommendations: {
    nextTopics: string[]
    studyTips: string[]
  }
  evaluatedAt: string
}

interface QuizQuestionResult {
  questionId: string
  questionText: string
  userAnswer: string
  expectedAnswer: string
  score: number // 0-1
  evaluation: 'Correct' | 'Partially Correct' | 'Incorrect'
  feedback: string
  improvementTips: string[]
}

// Topic information
interface QuizTopic {
  value: string // e.g., "DCF Analysis"
  label: string // Display name
  questionCounts: {
    basic: number
    advanced: number
  }
}

// LocalStorage schema
interface QuizLocalStorage {
  sessionId: string
  answers: Record<string, string> // simplified for storage
  lastSaved: number // timestamp
  currentQuestionIndex: number
}
```

### 2. Update Session Types
Update `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/types/session.ts`:
- Add quiz-specific metadata to session interface
- Ensure compatibility with existing session structure

### 3. Mock API Response Types
Create type definitions for mock API responses:
```typescript
interface TopicsApiResponse {
  topics: QuizTopic[]
  totalTopics: number
}

interface StartQuizApiResponse {
  sessionId: string
  topic: string
  difficulty: string
  questionCount: number
  questions: QuizQuestion[]
}

interface SubmitQuizApiResponse {
  message: string
  sessionId: string
  evaluationId: string
  estimatedTime: number
}

interface QuizResultsApiResponse {
  sessionId: string
  evaluationStatus: 'pending' | 'completed' | 'error'
  results?: QuizResults
}
```

### 4. State Management Design
Create a document outlining the quiz state management approach:
- How quiz state flows through components
- Where state lives (React Context vs local state)
- Auto-save implementation strategy
- Error recovery approach

## Technical Constraints
- Must work with existing MockMe authentication
- Compatible with Supabase session management
- TypeScript strict mode compliance
- Support for development mode testing

## Integration Points
- QALoader API will provide questions (via MockMe proxy)
- n8n workflow will handle evaluation
- Existing session system must be extended

## Success Criteria
- All types properly exported and documented
- No TypeScript errors when imported
- Clear separation between frontend and API types
- Supports all quiz workflow states

## Next Steps
After completion, Agent 1 will use these types to build UI components. Your architecture decisions will guide the entire implementation.

Please create the complete type system and update the session types as needed. Focus on making the types comprehensive yet flexible for future enhancements.
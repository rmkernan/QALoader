# Task: QuizMe Core Architecture & Type Definitions

**Created:** 2025.06.16_ 6:24PM ET  
**Purpose:** Detailed specifications for Agent 2 to design QuizMe type system and architecture

## Context
MockMe is building a structured 10-question quiz feature that integrates with the QALoader service (which manages the all_questions table in Supabase). Users select topic + difficulty, answer questions sequentially, then submit for batch AI evaluation via n8n workflow.

## Deliverable 1: Core Type Definitions
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/types/quiz.ts`

### Required Interfaces

```typescript
// Quiz configuration
export interface QuizConfig {
  topic: string
  difficulty: 'Basic' | 'Advanced'
  questionCount: number // Always 10 for MVP
}

// Question from QALoader (no answer included)
export interface QuizQuestion {
  questionId: string // e.g., "DCF-WACC-D-001"
  questionText: string
  questionNumber: number // 1-10, for display
}

// User's answer
export interface QuizAnswer {
  questionId: string
  userAnswer: string
  timeSpent?: number // seconds
  savedAt?: string // ISO timestamp
}

// Session state
export interface QuizSession {
  sessionId: string
  config: QuizConfig
  questions: QuizQuestion[]
  answers: Record<string, QuizAnswer> // keyed by questionId
  status: 'configuring' | 'taking' | 'reviewing' | 'submitting' | 'completed'
  startedAt: string
  submittedAt?: string
}

// Evaluation results
export interface QuizResults {
  sessionId: string
  overallScore: number // 0-10
  percentageScore: number // 0-100
  summary: QuizSummary
  questionResults: QuizQuestionResult[]
  recommendations: QuizRecommendations
  evaluatedAt: string
}

export interface QuizSummary {
  strengths: string[]
  weaknesses: string[]
  keyInsights: string
}

export interface QuizQuestionResult {
  questionId: string
  questionText: string
  userAnswer: string
  expectedAnswer: string
  score: number // 0-1
  evaluation: 'Correct' | 'Partially Correct' | 'Incorrect'
  feedback: string
  improvementTips: string[]
}

export interface QuizRecommendations {
  nextTopics: string[]
  studyTips: string[]
}

// Topic info with counts
export interface QuizTopic {
  value: string
  label: string
  questionCounts: {
    basic: number
    advanced: number
  }
}

// LocalStorage schema
export interface QuizLocalStorage {
  sessionId: string
  answers: Record<string, string>
  lastSaved: number
  currentQuestionIndex: number
}

// API Response types
export interface TopicsApiResponse {
  topics: QuizTopic[]
  totalTopics: number
}

export interface StartQuizApiResponse {
  sessionId: string
  topic: string
  difficulty: string
  questionCount: number
  questions: QuizQuestion[]
}

export interface SubmitQuizApiResponse {
  message: string
  sessionId: string
  evaluationId: string
  estimatedTime: number
}

export interface QuizResultsApiResponse {
  sessionId: string
  evaluationStatus: 'pending' | 'completed' | 'error'
  results?: QuizResults
}
```

## Deliverable 2: Update Session Types
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/types/session.ts`

Add quiz-specific metadata to the existing session types:
```typescript
// Add to session metadata
interface SessionMetadata {
  // ... existing fields
  quiz_config?: {
    topic: string
    difficulty: 'Basic' | 'Advanced'
    question_ids: string[]
    start_time: string
    submit_time?: string
  }
}
```

## Deliverable 3: State Management Design
**File:** `/mnt/c/pythonprojects/QALoader/MultiAgentFramework/Tasks/QuizStateManagement.md`

Document the following:
1. Quiz state flow diagram
2. Where state lives (Context vs local)
3. Auto-save implementation strategy
4. Error recovery approach
5. Integration points with existing auth/session system

## Technical Constraints
- Must integrate with existing Supabase session management
- Compatible with MockMe's authentication system
- TypeScript strict mode
- Support development mode with mock data
- Auto-save to localStorage every 30 seconds

## Integration Notes
- QALoader provides questions via REST API (requires JWT auth)
- MockMe will proxy QALoader requests (no direct frontend access)
- n8n workflow handles batch evaluation of all 10 answers
- Results stored in new quiz_results table

## Success Criteria
- Complete type coverage for entire quiz flow
- No TypeScript errors when integrated
- Clear separation of concerns
- Supports all states from selection to results
- Flexible for future enhancements
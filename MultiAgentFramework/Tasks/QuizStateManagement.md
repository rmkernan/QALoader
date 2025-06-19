# QuizMe State Management Design

**Purpose:** Comprehensive design document for QuizMe feature state management, including flow diagrams, storage strategy, and integration patterns.

**Created on:** June 16, 2025. 6:30 PM Eastern Time

## 1. Quiz State Flow Diagram

```
┌─────────────────┐
│   Topic Select  │ ← User selects from available topics
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Difficulty Select│ ← User chooses Basic/Advanced
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Loading State  │ ← Fetch questions from QALoader
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Quiz Taking    │ ← Sequential question presentation
│  (Questions 1-10)│   with auto-save every 30s
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Review State   │ ← User can review answers before submit
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Submitting    │ ← Send to n8n for evaluation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Results Pending │ ← Poll for evaluation completion
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Results Display │ ← Show scores, feedback, recommendations
└─────────────────┘
```

## 2. State Storage Architecture

### Context vs Local State Division

**QuizContext (Global State)**
```typescript
interface QuizContextState {
  // Core session data
  session: QuizSession | null;
  
  // UI state
  currentQuestionIndex: number;
  isAutoSaving: boolean;
  
  // Results when available
  results: QuizResults | null;
  
  // Error handling
  error: QuizErrorResponse | null;
}
```

**Component Local State**
- Timer state for individual questions
- Form input values (before saving to context)
- UI transitions and animations
- Temporary validation states

### Storage Layers

1. **React Context (Primary)**
   - Real-time quiz state
   - Current question tracking
   - Answer collection
   - Navigation control

2. **LocalStorage (Backup)**
   - Auto-save snapshots
   - Recovery data
   - Progress tracking
   - Offline resilience

3. **Session Storage (Temporary)**
   - Navigation guards
   - Unsaved changes warnings
   - Tab recovery

4. **Supabase (Persistent)**
   - Final submission data
   - Results storage
   - Historical sessions
   - Analytics data

## 3. Auto-Save Implementation Strategy

### Trigger Points
- Every 30 seconds (timer-based)
- On answer change (debounced 2s)
- On question navigation
- On page visibility change
- Before page unload

### Auto-Save Flow
```typescript
const autoSaveFlow = async () => {
  // 1. Collect current state
  const snapshot: QuizLocalStorage = {
    sessionId: session.sessionId,
    answers: extractAnswers(session.answers),
    lastSaved: Date.now(),
    currentQuestionIndex
  };
  
  // 2. Save to localStorage
  localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(snapshot));
  
  // 3. Update session metadata in Supabase (throttled)
  if (shouldUpdateDatabase()) {
    await updateSessionAutoSave({
      sessionId,
      metadata: { quiz_config: snapshot }
    });
  }
};
```

### Recovery Strategy
```typescript
const recoverSession = async (sessionId: string) => {
  // 1. Check localStorage first
  const localData = localStorage.getItem(`quiz_session_${sessionId}`);
  
  // 2. Validate and merge with server state
  if (localData) {
    const parsed = JSON.parse(localData);
    if (Date.now() - parsed.lastSaved < 24 * 60 * 60 * 1000) { // 24hr expiry
      return mergeWithServerState(parsed, serverSession);
    }
  }
  
  // 3. Fall back to server state only
  return serverSession;
};
```

## 4. Error Recovery Approach

### Network Failure Handling
1. **Question Fetching Failure**
   - Retry with exponential backoff
   - Show user-friendly error with retry button
   - Maintain topic/difficulty selection

2. **Auto-Save Failure**
   - Queue saves for retry
   - Continue with localStorage only
   - Show subtle warning indicator

3. **Submission Failure**
   - Store complete answers locally
   - Retry queue with persistence
   - Provide manual retry option

### State Corruption Recovery
```typescript
const validateQuizState = (state: unknown): QuizSession | null => {
  try {
    // Type guards and validation
    if (!isValidQuizSession(state)) {
      console.error('Invalid quiz state detected');
      return null;
    }
    return state as QuizSession;
  } catch (error) {
    // Log to error tracking
    return null;
  }
};
```

## 5. Integration Points

### Authentication System
- JWT token required for QALoader API calls
- User tier determines available topics
- Session tied to authenticated user_id

### Session Management
- Create Supabase session on quiz start
- Update session status throughout flow
- Link quiz results to session record

### Analytics Integration
- Track question timing
- Capture navigation patterns
- Record completion rates
- Monitor auto-save effectiveness

### Mock Data Integration
```typescript
// Development mode support
const getQuestions = async (config: QuizConfig) => {
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return getMockQuestions(config);
  }
  return fetchFromQALoader(config);
};
```

## 6. Performance Considerations

### Optimization Strategies
1. **Lazy Loading**
   - Load questions progressively
   - Defer result processing components
   - Code-split quiz routes

2. **Memoization**
   - Cache topic lists
   - Memoize question components
   - Prevent unnecessary re-renders

3. **Debouncing**
   - Answer input changes (2s)
   - Auto-save triggers (30s)
   - Navigation actions (300ms)

### Memory Management
- Clear old quiz sessions from localStorage
- Limit stored answer history
- Implement state cleanup on unmount

## 7. Security Considerations

### Data Protection
- No answer keys in frontend
- Sanitize user inputs
- Validate all state transitions
- Encrypt localStorage data

### API Security
- Proxy QALoader requests through backend
- Validate session ownership
- Rate limit submissions
- Audit quiz completions

## 8. Future Enhancement Hooks

### Extensibility Points
- Multiple quiz formats (beyond 10 questions)
- Timed quiz modes
- Practice vs evaluation modes
- Collaborative quizzes
- Question bookmarking
- Progress analytics dashboard

### State Structure Flexibility
- Versioned state schema
- Migration utilities
- Feature flags for new capabilities
- A/B testing support

## Implementation Priority

1. **Phase 1: Core State Management**
   - Basic context setup
   - Question navigation
   - Answer collection

2. **Phase 2: Persistence & Recovery**
   - LocalStorage integration
   - Auto-save implementation
   - Session recovery

3. **Phase 3: Advanced Features**
   - Real-time progress sync
   - Offline mode support
   - Analytics integration
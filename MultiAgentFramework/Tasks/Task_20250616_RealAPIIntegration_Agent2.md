# Task: QuizMe Real API Integration with QALoader

**Created:** 2025.06.16_ 6:58PM ET  
**Purpose:** Implement live API endpoints using real QALoader service integration

## Background
You're right - we already have a live all_questions table via QALoader service. Instead of creating extensive mock data, let's build the real API endpoints that integrate with the existing QALoader service and populate dropdowns with actual question data.

## Revised Approach: Real Integration

### 1. QALoader Service Integration
**Existing Service:** `/mnt/c/PythonProjects/QALoader`
- Live REST API with authentication
- Real question bank in all_questions table
- Existing endpoints we can proxy through MockMe

### 2. Hybrid Development Strategy
- **Live data** for topics dropdown (from real QALoader)
- **Live questions** for quiz content
- **Mock evaluation** only (since n8n workflow isn't ready)
- **Real session management** (MockMe Supabase)

## API Implementation Requirements

### Route 1: GET /api/quiz/topics
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/app/api/quiz/topics/route.ts`

**Implementation:**
```typescript
// Proxy to QALoader service
const qaLoaderResponse = await fetch(`${process.env.QALOADER_URL}/api/questions`, {
  headers: { 'Authorization': `Bearer ${qaLoaderToken}` }
});

const questions = await qaLoaderResponse.json();

// Process into topic counts
const topicCounts = questions.reduce((acc, q) => {
  if (!acc[q.topic]) acc[q.topic] = { basic: 0, advanced: 0 };
  acc[q.topic][q.difficulty.toLowerCase()]++;
  return acc;
}, {});
```

### Route 2: POST /api/quiz/start
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/app/api/quiz/start/route.ts`

**Implementation:**
- Query QALoader for real questions: `GET /api/questions?topic=${topic}&difficulty=${difficulty}`
- Randomly select 10 questions from results
- Create MockMe session with quiz metadata
- Return questions (without answers for security)

### Route 3: POST /api/quiz/submit
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/app/api/quiz/submit/route.ts`

**Implementation:**
- Store user responses in session
- Return mock evaluation status (since n8n isn't ready)
- Simulate realistic processing time

### Route 4: GET /api/quiz/results/[sessionId]
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/app/api/quiz/results/[sessionId]/route.ts`

**Implementation:**
- Fetch question details from QALoader for comparison
- Generate mock evaluation results using real expected answers
- Provide realistic feedback based on actual question content

## Environment Configuration

### QALoader Integration Setup
```typescript
// Environment variables needed
QALOADER_URL=http://localhost:8000  // Or production URL
QALOADER_SERVICE_TOKEN=<jwt-token>  // Service account auth
```

### Authentication Flow
```typescript
// Service-to-service authentication
async function getQALoaderToken() {
  // Use service account credentials
  // Return JWT for QALoader API calls
}
```

## Key Benefits of This Approach

1. **Real data** for topics dropdown - no need to maintain mock topic lists
2. **Actual questions** from finance experts - authentic content
3. **Live integration testing** - catches integration issues early
4. **Minimal mock data** - only evaluation results need mocking
5. **Faster development** - leverages existing QALoader infrastructure

## Implementation Tasks

### Phase 1: QALoader Proxy Setup
1. Configure QALoader service connection
2. Implement service authentication
3. Create /api/quiz/topics with real data
4. Test topic dropdown with live questions

### Phase 2: Quiz Flow Implementation  
1. Implement /api/quiz/start with real question fetching
2. Create /api/quiz/submit with session storage
3. Build /api/quiz/results with mock evaluation
4. Test complete quiz flow

### Phase 3: Error Handling & Polish
1. Handle QALoader service downtime gracefully
2. Implement rate limiting and caching
3. Add comprehensive error messages
4. Performance optimization

## Mock Data Requirements (Minimal)

### Only Mock Evaluation Results
Since we have real questions and answers from QALoader:
- Mock the scoring algorithm (0-1 scale per question)
- Mock the feedback generation
- Mock the improvement suggestions
- Use real expected answers for comparison

### Development Mode Features
- Toggle between real QALoader and offline mode
- Configurable evaluation strictness
- Debug information for development

## Success Criteria
- Topics dropdown populated from real QALoader data
- Quiz questions fetched live from all_questions table
- Complete quiz flow functional end-to-end
- Proper error handling for service integration
- Ready for real n8n evaluation workflow integration

This approach gives us a working QuizMe feature much faster while using real data from day one.
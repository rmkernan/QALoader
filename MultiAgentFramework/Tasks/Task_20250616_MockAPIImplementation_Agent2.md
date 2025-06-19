# Task: Mock API Implementation for QuizMe Development

**Created:** 2025.06.16_ 6:37PM ET  
**Purpose:** Create fully functional mock API endpoints to enable QuizMe frontend development

## Background
With the type system complete, we need working API endpoints to develop and test the QuizMe frontend. Since the real QALoader integration and n8n workflow aren't ready, you'll create sophisticated mock APIs that simulate the complete quiz experience with realistic data.

## Objectives

### 1. Create Complete Mock API Routes
Implement all four quiz API endpoints with realistic responses:
- `/api/quiz/topics` - Available topics with question counts
- `/api/quiz/start` - Initialize quiz with 10 questions
- `/api/quiz/submit` - Accept quiz submission
- `/api/quiz/results/[sessionId]` - Return evaluation results

### 2. Generate Realistic Finance Data
Create mock data that:
- Uses actual finance terminology and concepts
- Provides varied question types and difficulties
- Includes realistic evaluation feedback
- Supports different topics (DCF, Valuation, M&A, etc.)

### 3. Simulate Real-World Scenarios
Handle edge cases and realistic flows:
- Topics with insufficient questions
- Network delays and timeouts
- Different evaluation outcomes
- Session management

## API Implementation Requirements

### Route 1: GET /api/quiz/topics
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/app/api/quiz/topics/route.ts`

```typescript
// Mock response structure
{
  topics: [
    {
      value: "DCF Analysis",
      label: "DCF Analysis", 
      questionCounts: { basic: 15, advanced: 12 }
    },
    {
      value: "Valuation Methods",
      label: "Valuation Methods",
      questionCounts: { basic: 18, advanced: 8 }
    }
    // Add 6-8 realistic finance topics
  ],
  totalTopics: 8
}
```

**Requirements:**
- Support difficulty filtering
- Realistic question count variations
- Some topics with insufficient questions (<10) for testing
- Consistent with finance interview topics

### Route 2: POST /api/quiz/start
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/app/api/quiz/start/route.ts`

Generate realistic quiz sessions:
- 10 unique questions per topic/difficulty
- Actual finance question text 
- Proper session metadata
- Integration with MockMe session system

### Route 3: POST /api/quiz/submit
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/app/api/quiz/submit/route.ts`

Simulate evaluation workflow:
- Accept quiz responses
- Trigger mock evaluation process
- Return realistic processing time estimates
- Store submission for results retrieval

### Route 4: GET /api/quiz/results/[sessionId]
**File:** `/mnt/c/PythonProjects/ClickablePrototype/mvp/src/app/api/quiz/results/[sessionId]/route.ts`

Provide comprehensive mock evaluation:
- Realistic scoring based on answer quality
- Detailed per-question feedback
- Varied evaluation outcomes (Correct/Partially Correct/Incorrect)
- Personalized improvement suggestions

## Mock Data Requirements

### 1. Finance Question Bank
Create 50+ realistic questions across topics:
- **DCF Analysis:** WACC calculation, terminal value, discount rates
- **Valuation Methods:** Comparable company analysis, precedent transactions
- **M&A:** Deal structures, synergies, due diligence
- **Financial Modeling:** Three-statement models, sensitivity analysis
- **Equity Research:** Industry analysis, investment thesis
- **Investment Banking:** Deal processes, client presentations

### 2. Evaluation Response Patterns
Simulate realistic AI evaluation:
- Partial credit for incomplete but correct concepts
- Constructive feedback focusing on improvement
- Recognition of correct methodology even with calculation errors
- Personalized study recommendations

### 3. Development Mode Features
Support MockMe's development patterns:
- Toggle between mock and "real" mode
- Configurable response delays
- Deterministic vs random scoring
- Debug information in responses

## Technical Implementation

### 1. Authentication Integration
```typescript
// Standard MockMe auth pattern
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Mock API logic
}
```

### 2. Session Management
Integrate with existing MockMe session system:
- Create sessions in Supabase with quiz metadata
- Use proper session status tracking
- Support session resumption patterns

### 3. Error Handling
Implement comprehensive error scenarios:
- Invalid topic/difficulty combinations
- Session not found errors
- Submission timeout simulations
- Malformed request handling

### 4. Performance Simulation
Add realistic delays:
- Topic loading: 200-500ms
- Quiz start: 1-2 seconds
- Submit processing: 3-8 seconds
- Results retrieval: 100-300ms

## File Structure
```
/api/quiz/
├── topics/
│   └── route.ts
├── start/
│   └── route.ts
├── submit/
│   └── route.ts
└── results/
    └── [sessionId]/
        └── route.ts
```

## Mock Data Organization
Create supporting files:
```
/lib/mock-data/
├── quiz-topics.ts
├── quiz-questions.ts
├── quiz-evaluations.ts
└── quiz-helpers.ts
```

## Development Features

### 1. Configuration Options
Support environment-based behavior:
```typescript
const MOCK_CONFIG = {
  enableDelays: process.env.NODE_ENV !== 'test',
  randomizeScores: process.env.QUIZ_DETERMINISTIC !== 'true',
  failureRate: 0.05 // 5% chance of mock errors
};
```

### 2. Debug Endpoints
Additional development routes:
- `/api/quiz/debug/reset` - Clear all mock session data
- `/api/quiz/debug/scenarios` - List available test scenarios
- `/api/quiz/debug/evaluate` - Direct evaluation testing

## Success Criteria
- All four API routes fully functional
- Realistic finance question content
- Proper error handling and edge cases
- Integration with MockMe auth/session system
- Support for development and testing workflows
- Ready for frontend integration

This mock API system will enable complete QuizMe frontend development while the real backend integration is being built.
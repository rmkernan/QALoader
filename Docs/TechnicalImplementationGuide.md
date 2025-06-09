# Technical Implementation Guide for Q&A Loader Backend

**For AI Assistants:** Detailed step-by-step implementation instructions for building the FastAPI backend.

**Created:** June 9, 2025  
**Tech Stack:** Python 3.10+, FastAPI, Supabase PostgreSQL, JWT Authentication

---

## Pre-Implementation Checklist

Before starting, verify:
- [ ] Frontend is working at http://localhost:3000
- [ ] Git repository is set up and current
- [ ] Read BackendDesign.md and APIs.md specifications
- [ ] Understand project structure from CLAUDE.md

## Phase 1: Foundation Setup

### 1.1 Create Backend Directory Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment/database config
│   ├── database.py          # Supabase connection
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   └── question.py      # Question model/schema
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication routes
│   │   ├── questions.py     # Question CRUD routes
│   │   └── upload.py        # File upload routes
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py  # JWT handling
│   │   ├── question_service.py  # Question operations
│   │   └── markdown_parser.py   # Markdown parsing logic
│   └── utils/               # Utility functions
│       ├── __init__.py
│       ├── id_generator.py  # Question ID generation
│       └── validators.py    # Request validation
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
└── README.md               # Backend setup instructions
```

### 1.2 Initialize Python Environment
```bash
cd /mnt/c/PythonProjects/QALoader
mkdir backend
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 1.3 Install Dependencies
Create `requirements.txt`:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
supabase==2.0.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
pydantic==2.5.0
python-dotenv==1.0.0
pytest==7.4.3
httpx==0.25.2
```

Install: `pip install -r requirements.txt`

### 1.4 Environment Configuration
Create `.env` file with:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
ADMIN_PASSWORD=password123
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 1.5 Basic FastAPI Setup
Create `app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, questions, upload
from app.database import init_db

app = FastAPI(title="Q&A Loader API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(questions.router, prefix="/api", tags=["questions"])
app.include_router(upload.router, prefix="/api", tags=["upload"])

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/")
def read_root():
    return {"message": "Q&A Loader API is running"}
```

**Checkpoint:** Verify FastAPI starts with `uvicorn app.main:app --reload`

## Phase 2: Database Setup

### 2.1 Supabase Connection
Create `app/database.py`:
```python
from supabase import create_client, Client
from app.config import settings
import asyncio

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

async def init_db():
    """Initialize database tables if they don't exist"""
    # Create all_questions table
    # Create activity_log table
    # Add indexes
    pass

async def get_db():
    """Dependency for database operations"""
    return supabase
```

### 2.2 Create Database Schema
SQL to run in Supabase dashboard:
```sql
-- Main questions table
CREATE TABLE all_questions (
    question_id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    type TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    notes_for_tutor TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_filters ON all_questions (topic, subtopic, difficulty, type);
CREATE INDEX idx_activity_log_timestamp ON activity_log (timestamp DESC);
```

### 2.3 Data Models
Create `app/models/question.py`:
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuestionBase(BaseModel):
    topic: str
    subtopic: str
    difficulty: str
    type: str
    question: str
    answer: str
    notes_for_tutor: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    question_id: str

class Question(QuestionBase):
    question_id: str
    created_at: datetime
    updated_at: datetime

class ParsedQuestionFromAI(BaseModel):
    subtopic: str
    difficulty: str
    type: str
    question: str
    answer: str
```

**Checkpoint:** Verify database connection and tables exist

## Phase 3: Authentication System

### 3.1 JWT Service
Create `app/services/auth_service.py`:
```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.config import settings

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str) -> bool:
    return plain_password == settings.ADMIN_PASSWORD

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
```

### 3.2 Auth Router
Create `app/routers/auth.py`:
```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.auth_service import create_access_token, verify_password

router = APIRouter()

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    token: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if not verify_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    access_token = create_access_token(data={"sub": "admin"})
    return LoginResponse(token=access_token)
```

**Checkpoint:** Test login endpoint returns JWT token

## Phase 4: Question CRUD Operations

### 4.1 Question Service
Create `app/services/question_service.py`:
```python
from app.models.question import Question, QuestionCreate, QuestionUpdate
from app.utils.id_generator import generate_question_id
from supabase import Client
from typing import List, Optional

class QuestionService:
    def __init__(self, db: Client):
        self.db = db

    async def create_question(self, question_data: QuestionCreate) -> Question:
        # Generate ID
        # Insert to database
        # Return created question
        pass

    async def get_question(self, question_id: str) -> Optional[Question]:
        # Query by ID
        pass

    async def update_question(self, question_data: QuestionUpdate) -> Question:
        # Update existing question
        pass

    async def delete_question(self, question_id: str) -> bool:
        # Delete question
        pass

    async def search_questions(self, filters: dict) -> List[Question]:
        # Filter and search questions
        pass
```

### 4.2 ID Generator Utility
Create `app/utils/id_generator.py`:
```python
def generate_question_id(topic: str, subtopic: str, type_code: str, db: Client) -> str:
    """Generate human-readable ID like DCF-WACC-P-001"""
    # Create abbreviations
    # Query for next sequence number
    # Return formatted ID
    pass
```

### 4.3 Questions Router
Create `app/routers/questions.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from app.services.question_service import QuestionService
from app.models.question import Question, QuestionCreate, QuestionUpdate
from app.database import get_db

router = APIRouter()

@router.post("/questions", response_model=Question)
async def create_question(question: QuestionCreate, db=Depends(get_db)):
    # Create new question
    pass

@router.get("/questions")
async def search_questions(
    topic: str = None,
    subtopic: str = None,
    difficulty: str = None,
    type: str = None,
    searchText: str = None,
    db=Depends(get_db)
):
    # Search with filters
    pass

@router.put("/questions/{question_id}")
async def update_question(question_id: str, question: QuestionUpdate, db=Depends(get_db)):
    # Update question
    pass

@router.delete("/questions/{question_id}")
async def delete_question(question_id: str, db=Depends(get_db)):
    # Delete question
    pass
```

**Checkpoint:** Test all CRUD operations work correctly

## Phase 5: Bootstrap & Activity System

### 5.1 Bootstrap Endpoint
Add to `app/routers/questions.py`:
```python
@router.get("/bootstrap-data")
async def get_bootstrap_data(db=Depends(get_db)):
    # Get all questions
    # Calculate topic summaries
    # Get recent activity log
    # Return comprehensive data
    pass
```

### 5.2 Activity Logging
Create `app/services/activity_service.py`:
```python
from supabase import Client
from datetime import datetime

class ActivityService:
    def __init__(self, db: Client):
        self.db = db

    async def log_activity(self, action: str, details: str = None):
        # Insert activity log entry
        pass

    async def get_recent_activity(self, limit: int = 5):
        # Get recent activity entries
        pass
```

**Checkpoint:** Bootstrap endpoint returns all required data

## Phase 6: File Upload & Markdown Parser

### 6.1 Markdown Parser
Create `app/services/markdown_parser.py`:
```python
from app.models.question import ParsedQuestionFromAI
from typing import List
import re

class MarkdownParser:
    def __init__(self):
        self.current_topic = ""
        self.current_subtopic = ""
        self.current_difficulty = ""
        self.current_type = ""

    def parse_markdown(self, content: str, topic_name: str) -> List[ParsedQuestionFromAI]:
        """Parse hierarchical markdown into Q&A objects"""
        # Implement stateful parsing
        # Track hierarchy levels
        # Extract Q&A pairs
        pass

    def _parse_hierarchy(self, line: str) -> dict:
        """Parse markdown headers to extract hierarchy info"""
        pass

    def _extract_qa_pair(self, content: str) -> dict:
        """Extract question and answer from content block"""
        pass
```

### 6.2 Upload Router
Create `app/routers/upload.py`:
```python
from fastapi import APIRouter, UploadFile, File, Form, Depends
from app.services.markdown_parser import MarkdownParser
from app.services.question_service import QuestionService

router = APIRouter()

@router.post("/upload-markdown")
async def upload_markdown(
    topic: str = Form(...),
    file: UploadFile = File(...),
    db=Depends(get_db)
):
    # Read file content
    # Parse markdown
    # Validate parsed data
    # Replace questions for topic (transactional)
    pass

@router.post("/topics/{topic}/questions/batch-replace")
async def batch_replace_questions(
    topic: str,
    questions: List[ParsedQuestionFromAI],
    db=Depends(get_db)
):
    # Transactional delete + insert
    pass
```

**Checkpoint:** File upload and parsing works correctly

## Phase 7: Integration & Testing

### 7.1 Frontend Integration
1. Update frontend API calls to point to backend
2. Test all frontend functionality
3. Verify authentication flows
4. Test file upload process
5. Validate all CRUD operations

### 7.2 Testing Strategy
Create `tests/` directory with:
- Unit tests for each service
- Integration tests for API endpoints
- End-to-end tests with frontend

### 7.3 Documentation Updates
Update all documentation to reflect:
- Actual implementation details
- Any deviations from original plan
- Setup and deployment instructions

**Final Checkpoint:** Complete application works end-to-end

---

## Implementation Notes

- **Use simultaneous tool calls** for efficiency
- **Test each phase** before proceeding
- **Commit progress** after each major milestone
- **Update ProjectStatus.md** as you complete sections
- **Follow CLAUDE.md** best practices
- **Keep frontend working** throughout development

## Troubleshooting

Common issues and solutions:
- CORS errors: Check middleware configuration
- Database connection: Verify Supabase credentials
- JWT errors: Check secret key and algorithm
- File upload: Verify multipart handling
- Frontend integration: Check API endpoint URLs

---

*This guide provides step-by-step implementation instructions that can be followed across multiple AI conversations.*
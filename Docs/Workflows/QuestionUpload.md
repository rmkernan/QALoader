# Question Upload Workflow

**Created:** June 14, 2025. 10:23 a.m. Eastern Time  
**Purpose:** Documents the complete workflow for uploading and validating question files from markdown format to database storage  
**Scope:** Functional user experience and technical implementation details  

---

## 🎯 Workflow Overview

This workflow enables users to upload structured markdown files containing Q&A content and have them validated, transformed, and loaded into the Supabase database. The process emphasizes validation-first approach to ensure data quality and provide immediate user feedback.

### Key Principles
- **Validation First**: Files are validated before any database operations
- **Immediate Feedback**: Users receive instant validation results
- **Error Prevention**: Invalid data cannot reach the database
- **User-Friendly**: Clear error messages guide users to fix formatting issues

---

## 👤 Functional Workflow (User Perspective)

### Step 1: File Selection
**User Action:** Navigate to Loader view and select a markdown file  
**Options Available:**
- Browse button to select file from file system
- Drag and drop file directly onto upload area

**UI Component:** `LoaderView.tsx`  
**User Feedback:** File name and size displayed upon selection

### Step 2: Immediate Format Validation
**Trigger:** Automatically upon file selection  
**Process:** Client-side validation of markdown structure  
**Duration:** Instant (< 1 second)

**Validation Checks:**
- Proper markdown hierarchy (# Topic → ## Subtopic → ### Difficulty → #### Type)
- Required sections present (Question, Brief Answer)
- Proper formatting of question/answer blocks

**User Feedback:**
- ✅ **Valid Format**: Green checkmark, "File format validated" message
- ❌ **Invalid Format**: Red error icon, specific error messages with line numbers

### Step 3: Content Validation
**Trigger:** Only if format validation passes  
**Process:** Backend validation against database schema  
**Duration:** 1-2 seconds

**Validation Checks:**
- Difficulty values limited to "Basic" or "Advanced"
- Question types match allowed values (Definition, Problem, GenConcept, Calculation, Analysis)
- Character limits enforced (100 chars for topic/subtopic)
- Required fields have minimum content

**User Feedback:**
- ✅ **Valid Content**: "Ready to upload" button becomes enabled
- ❌ **Invalid Content**: Detailed validation report showing specific issues

### Step 4: Upload Confirmation
**User Action:** Click "Upload Questions" button (only enabled after successful validation)  
**Display:** Summary of what will be uploaded:
- Topic name
- Number of questions by difficulty level
- Number of questions by type

**User Feedback:** Confirmation dialog with upload summary

### Step 5: Database Processing
**Process:** Transform validated data and insert into Supabase  
**Duration:** 2-5 seconds depending on question count

**Operations:**
- Generate unique question IDs
- Insert questions with proper timestamps
- Update topic summaries
- Log activity

**User Feedback:**
- Loading spinner during processing
- Success message with count of questions uploaded
- Error message if database operation fails

### Step 6: State Refresh
**Process:** Reload application data to reflect new questions  
**User Feedback:** Updated question counts in dashboard and navigation

---

## 🔑 Question ID Generation

**Updated:** June 14, 2025. 10:53 a.m. Eastern Time - Added question ID generation strategy based on existing system patterns

### Current ID Pattern Analysis
Based on existing questions in the system:
```
TOPICTEST-TESTING-P-001    (TOPIC-SUBTOPIC-TYPE-SEQUENCE)
DCF-TESTING-P-001          (TOPIC-SUBTOPIC-TYPE-SEQUENCE)  
CREATEDNEW-MATH-G-001      (TOPIC-SUBTOPIC-TYPE-SEQUENCE)
```

### Enhanced ID Pattern for File Uploads
**Format:** `{TOPIC}-{SUBTOPIC}-{DIFFICULTY}-{TYPE}-{SEQUENCE}`
**Example:** `DCF-WACC-B-G-001` (DCF topic, WACC subtopic, Basic difficulty, GenConcept type, sequence 001)

### ID Generation Logic
```python
def generate_question_id(topic: str, subtopic: str, difficulty: str, type: str) -> str:
    """Generate semantic question ID following established pattern"""
    
    # Normalize components to match existing pattern
    topic_code = normalize_topic(topic)        # "DCF", "TOPICTEST" 
    subtopic_code = normalize_subtopic(subtopic)  # "WACC", "TESTING"
    difficulty_code = difficulty[0].upper()    # "B" or "A"
    type_code = get_type_code(type)           # "G", "P", "D", "C", "A"
    
    # Get next sequence number for this combination
    sequence = get_next_sequence(topic_code, subtopic_code, difficulty_code, type_code)
    
    return f"{topic_code}-{subtopic_code}-{difficulty_code}-{type_code}-{sequence:03d}"

def normalize_topic(topic: str) -> str:
    """Convert 'Discounted Cash Flow (DCF)' -> 'DCF'"""
    # Extract abbreviation from parentheses if present
    if '(' in topic and ')' in topic:
        abbrev = topic.split('(')[1].split(')')[0]
        return abbrev.upper().replace(' ', '').replace('&', '')
    # Otherwise use first 10 chars, remove spaces
    return topic.upper().replace(' ', '').replace('&', '')[:10]

def get_type_code(question_type: str) -> str:
    """Map question types to single letter codes"""
    type_mapping = {
        'GenConcept': 'G',
        'Problem': 'P', 
        'Definition': 'D',
        'Calculation': 'C',
        'Analysis': 'A'
    }
    return type_mapping.get(question_type, 'G')  # Default to G
```

### Uniqueness Strategy
1. **Database Primary Key**: Enforces uniqueness at database level
2. **Sequence Checking**: Query existing IDs to find next available sequence
3. **Collision Handling**: Auto-increment sequence if ID exists
4. **Validation**: Pre-check ID availability before batch upload

```python
async def ensure_unique_id(base_id: str, supabase_client) -> str:
    """Ensure ID uniqueness by checking database and incrementing sequence"""
    
    # Extract components: DCF-WACC-B-G-001
    parts = base_id.split('-')
    base = '-'.join(parts[:-1])  # DCF-WACC-B-G
    sequence = int(parts[-1])    # 1
    
    while True:
        candidate_id = f"{base}-{sequence:03d}"
        
        # Check if ID exists in database
        result = supabase_client.table('all_questions')\
            .select('question_id')\
            .eq('question_id', candidate_id)\
            .execute()
        
        if not result.data:  # ID is available
            return candidate_id
            
        sequence += 1  # Try next sequence number
```

## ⚙️ Technical Implementation

### Frontend Components

#### LoaderView.tsx
**Responsibilities:**
- File selection UI (browse button + drag/drop zone)
- Display validation status and error messages
- Upload confirmation dialog
- Progress indicators

**State Management:**
- Selected file information
- Validation status (pending/valid/invalid)
- Upload progress
- Error messages

**Integration Points:**
- Calls `AppContext.uploadMarkdownFile()` for processing
- Updates UI based on validation results
- Triggers activity logging

#### AppContext.tsx - uploadMarkdownFile Function
**Enhanced Workflow:**
```typescript
uploadMarkdownFile(topic: string, file: File, dryRun: boolean) {
  // Step 1: Format Validation (client-side)
  if (!validateMarkdownFormat(file)) {
    return validation errors;
  }
  
  // Step 2: Content Validation (backend API call)
  if (dryRun) {
    const result = await validateContent(file, topic);
    return validation report;
  }
  
  // Step 3: Database Upload (after validation passes)
  const formData = new FormData();
  formData.append('topic', topic);
  formData.append('file', file);
  const response = await fetch('/api/upload-markdown', {
    method: 'POST',
    body: formData,
  });
}
```

### Backend Components

#### Validation Service (New)
**File:** `backend/app/services/validation_service.py`  
**Responsibilities:**
- Parse markdown file structure
- Validate against database schema
- Generate detailed validation reports
- Transform data for database insertion

**Key Functions:**
```python
def validate_markdown_structure(content: str) -> ValidationResult:
    """Validates markdown hierarchy and formatting"""
    
def validate_question_content(questions: List[Dict]) -> ValidationResult:
    """Validates content against database constraints"""
    
def transform_to_database_format(questions: List[Dict], topic: str) -> List[QuestionCreate]:
    """Transforms validated data for database insertion"""
```

#### Upload Router Enhancement
**File:** `backend/app/routers/upload.py`  
**New Endpoint:** `POST /api/validate-markdown`  
**Purpose:** Validation-only endpoint for dry-run validation

**Enhanced Endpoint:** `POST /api/upload-markdown`  
**Process:**
1. Receive file and topic
2. Validate file format and content
3. Transform data if validation passes
4. Insert into database with proper error handling
5. Return detailed results

#### Question Models Updates
**File:** `backend/app/models/question.py`  
**Enhancements:**
- Add validation for "Basic"/"Advanced" difficulty constraint
- Update question type validation
- Add batch validation methods

### Database Integration

#### Supabase Schema Validation
**Table:** `all_questions`  
**Validation Points:**
- Primary key generation for `question_id`
- Difficulty enum constraint (Basic, Advanced)
- Question type enum constraint
- Character limits on topic/subtopic fields
- Required field validation

#### Transaction Handling
**Pattern:** Batch insertion with rollback on failure  
**Implementation:** Use Supabase client transaction capabilities  
**Error Recovery:** Detailed error reporting for partial failures

---

## 🔍 Validation Process Details

### Format Validation (Client-Side)
**Technology:** JavaScript/TypeScript with regex patterns  
**Performance:** Immediate (< 100ms)  
**Location:** `src/services/validation.ts`

**Validation Rules:**
```typescript
const MARKDOWN_PATTERNS = {
  topic: /^# Topic: (.+)$/m,
  subtopic: /^## Subtopic.*: (.+)$/m,
  difficulty: /^### Difficulty: (Basic|Advanced)$/m,
  type: /^#### Type: (.+)$/m,
  question: /^\*\*Question:\*\* (.+)$/m,
  answer: /^\*\*Brief Answer:\*\* (.+)$/m
};
```

### Content Validation (Server-Side)
**Technology:** Python with Pydantic models  
**Performance:** 1-2 seconds  
**Location:** `backend/app/services/validation_service.py`

**Database Constraint Validation:**
- Field length limits
- Enum value constraints
- Required field presence
- Character encoding validation

---

## 🚨 Error Handling Strategy

**Updated:** June 14, 2025. 10:53 a.m. Eastern Time - Added individual question error handling based on Supabase response patterns

### Individual Question Error Handling

Supabase will return errors at the **individual question level**, not for the entire batch. Our strategy handles partial successes gracefully:

### Error Processing Flow
```python
class BatchUploadResult:
    total_attempted: int
    successful_uploads: List[str]  # Question IDs that succeeded
    failed_uploads: List[str]      # Question IDs that failed
    errors: Dict[str, str]         # Question ID -> Error message
    
async def upload_questions_batch(questions: List[ParsedQuestion], topic: str) -> BatchUploadResult:
    """Process questions individually with comprehensive error tracking"""
    
    results = BatchUploadResult(
        total_attempted=len(questions),
        successful_uploads=[],
        failed_uploads=[],
        errors={}
    )
    
    for question_data in questions:
        try:
            # Generate unique ID for this question
            question_id = generate_question_id(
                topic, 
                question_data.subtopic, 
                question_data.difficulty, 
                question_data.type
            )
            
            # Ensure ID uniqueness
            unique_id = await ensure_unique_id(question_id, supabase)
            
            # Create question object
            question = QuestionCreate(
                question_id=unique_id,
                topic=topic,
                **question_data.dict()
            )
            
            # Attempt individual insert
            result = supabase.table('all_questions').insert(question.dict()).execute()
            
            if result.data:
                results.successful_uploads.append(unique_id)
                logger.info(f"Successfully uploaded question: {unique_id}")
            else:
                results.failed_uploads.append(unique_id)
                results.errors[unique_id] = "Database insert returned no data"
                
        except Exception as e:
            # Handle individual question failures
            error_message = categorize_error(e, unique_id)
            results.failed_uploads.append(unique_id)
            results.errors[unique_id] = error_message
            logger.error(f"Failed to upload question {unique_id}: {error_message}")
    
    return results

def categorize_error(error: Exception, question_id: str) -> str:
    """Convert technical errors to user-friendly messages"""
    error_str = str(error).lower()
    
    if "duplicate key" in error_str or "violates unique constraint" in error_str:
        return f"Question ID '{question_id}' already exists in database"
    
    elif "check constraint" in error_str:
        if "difficulty" in error_str:
            return "Invalid difficulty - must be 'Basic' or 'Advanced'"
        elif "type" in error_str:
            return "Invalid question type - must be Definition, Problem, GenConcept, Calculation, or Analysis"
        else:
            return "Invalid data format - check field values"
    
    elif "not null" in error_str:
        return "Missing required fields - question and answer cannot be empty"
    
    elif "value too long" in error_str:
        return "Content too long - topic/subtopic must be under 100 characters"
    
    elif "connection" in error_str or "timeout" in error_str:
        return "Database connection error - please try again"
    
    else:
        return f"Upload error: {str(error)[:100]}..."  # Truncate long errors
```

### Frontend Result Processing
```typescript
// In AppContext.tsx uploadMarkdownFile function
const handleBatchUploadResult = (result: BatchUploadResult) => {
    const { total_attempted, successful_uploads, failed_uploads, errors } = result;
    
    if (failed_uploads.length === 0) {
        // Complete success
        toast.success(`✅ All ${successful_uploads.length} questions uploaded successfully!`);
        logActivity("File upload completed", `${successful_uploads.length} questions added`);
        
    } else if (successful_uploads.length > 0) {
        // Partial success - show summary with option to view details
        toast.success(
            `✅ ${successful_uploads.length} questions uploaded successfully.\n` +
            `❌ ${failed_uploads.length} questions failed. Click for details.`,
            {
                duration: 8000,
                onClick: () => showErrorDetailsModal(errors)
            }
        );
        
        logActivity("File upload partial success", 
            `${successful_uploads.length} succeeded, ${failed_uploads.length} failed`);
        
    } else {
        // Complete failure
        toast.error(`❌ Upload failed: No questions were added to database.`);
        showErrorDetailsModal(errors);
        logActivity("File upload failed", "No questions added");
    }
    
    // Always refresh data if any questions succeeded
    if (successful_uploads.length > 0) {
        fetchInitialData();
    }
};

const showErrorDetailsModal = (errors: Record<string, string>) => {
    // Display modal with:
    // - List of failed question IDs
    // - Specific error message for each
    // - Option to download error report
    // - Guidance on how to fix common issues
};
```

### User-Facing Error Messages

#### Format Errors
- "Missing topic header on line X"
- "Invalid difficulty value 'Intermediate' on line Y. Must be 'Basic' or 'Advanced'"
- "Question block missing **Brief Answer:** on line Z"

#### Content Errors
- "Topic name exceeds 100 character limit"
- "Invalid question type 'CustomType'. Must be one of: Definition, Problem, GenConcept, Calculation, Analysis"
- "Empty question text not allowed"

#### System Errors
- "Upload failed: Database connection error"
- "File processing timeout - please try again"
- "Authentication required for upload operations"

### Technical Error Handling

#### Frontend Error Recovery
- Display validation errors with clear formatting
- Allow users to fix files and re-upload
- Maintain upload state during error correction
- Log errors for debugging

#### Backend Error Recovery
- Detailed error logging with stack traces
- Graceful handling of file format issues
- Database transaction rollback on errors
- Proper HTTP status code responses

---

## 🔗 Integration Points

### Existing System Integration

#### Authentication
**Requirement:** Users must be logged in to upload files  
**Implementation:** JWT token validation on upload endpoints  
**Error Handling:** Redirect to login if session expired

#### Activity Logging
**Events Logged:**
- File validation attempts (success/failure)
- Upload operations (with question counts)
- Error occurrences (with error types)

**Implementation:** `AppContext.logActivity()` calls

#### State Management
**Global State Updates:**
- Question list refresh after successful upload
- Topic summaries recalculation
- Last upload timestamp update
- Loading state management during operations

#### Navigation
**User Flow:**
- Upload button becomes available after validation
- Automatic navigation to Curation view after successful upload
- Error states keep user on Loader view for correction

---

## 📊 Success Metrics

### Validation Effectiveness
- Percentage of files passing validation on first attempt
- Most common validation errors (for UI improvement)
- Average time from file selection to upload completion

### User Experience
- User retry rate after validation errors
- Success rate of upload operations
- Time spent in upload workflow

### System Performance
- Validation processing time
- Database insertion time
- File size handling limits

---

## 🔄 Future Enhancements

### Planned Improvements
1. **Batch Upload**: Support for multiple files in single operation
2. **Preview Mode**: Show parsed questions before final upload
3. **Template Download**: Provide properly formatted template files
4. **Auto-Correction**: Suggest fixes for common formatting errors
5. **Progress Tracking**: Detailed progress for large file uploads

### Integration Opportunities
1. **AI Enhancement**: Use LLM for content quality validation
2. **Version Control**: Track changes to uploaded questions
3. **Collaboration**: Multi-user upload and review workflows
4. **Analytics**: Upload pattern analysis and optimization

---

*This workflow documentation serves as the definitive guide for question upload functionality, covering both user experience and technical implementation details.*
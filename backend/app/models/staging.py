"""
@file backend/app/models/staging.py
@description Pydantic data models for the staging workflow system. Defines schemas for upload batches, staged questions, and duplicate detection.
@created June 20, 2025. 9:59 AM Eastern Time
@updated June 20, 2025. 9:59 AM Eastern Time - Initial creation with comprehensive staging workflow models

@architectural-context
Layer: Data Models (Pydantic schemas)
Dependencies: pydantic (validation), typing (type hints), datetime (timestamps), enum (status enums)
Pattern: Request/Response validation with status tracking for multi-stage upload workflow

@workflow-context
User Journey: Staging workflow for reviewing questions before production import
Sequence Position: Used by staging API routes for batch management and review operations
Inputs: Raw JSON data from upload and review endpoints
Outputs: Validated Python objects for staging operations and review responses

@authentication-context
Auth Requirements: All staging operations require JWT authentication
Security: Input validation, status tracking, and audit trail for review operations

@database-context
Tables: upload_batches, staged_questions, staging_duplicates in Supabase
Operations: Used for batch creation, question staging, duplicate detection, and review operations
Transactions: Supports batch operations with proper rollback on failures
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import BaseModel, Field, validator


class BatchStatus(str, Enum):
    """
    @enum BatchStatus
    @description Status values for upload batches
    """
    PENDING = "pending"
    REVIEWING = "reviewing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class QuestionStatus(str, Enum):
    """
    @enum QuestionStatus  
    @description Status values for staged questions
    """
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DUPLICATE = "duplicate"
    IMPORTED = "imported"


class DuplicateResolution(str, Enum):
    """
    @enum DuplicateResolution
    @description Resolution options for duplicate questions
    """
    KEEP_EXISTING = "keep_existing"
    REPLACE = "replace"
    KEEP_BOTH = "keep_both"
    PENDING = "pending"


class UploadBatchBase(BaseModel):
    """
    @class UploadBatchBase
    @description Base model for upload batch information
    @example:
        batch = UploadBatchBase(
            file_name="accounting_questions.md",
            total_questions=50,
            notes="Q2 2025 accounting questions"
        )
    """
    file_name: str = Field(..., max_length=255, description="Name of the uploaded file")
    total_questions: int = Field(..., ge=0, description="Total number of questions in the batch")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes about the batch")


class UploadBatchCreate(UploadBatchBase):
    """
    @class UploadBatchCreate
    @description Model for creating a new upload batch
    @example:
        batch = UploadBatchCreate(
            file_name="dcf_questions.md",
            total_questions=25,
            uploaded_by="user@example.com"
        )
    """
    uploaded_by: str = Field(..., max_length=255, description="Email or username of the uploader")


class UploadBatch(UploadBatchBase):
    """
    @class UploadBatch
    @description Complete upload batch model with all database fields
    @example:
        batch = UploadBatch(
            batch_id="batch_20250620_1234",
            uploaded_by="admin@example.com",
            uploaded_at="2025-06-20T10:00:00Z",
            file_name="finance_questions.md",
            total_questions=100,
            questions_pending=80,
            questions_approved=15,
            questions_rejected=2,
            questions_duplicate=3,
            status="reviewing"
        )
    """
    batch_id: str = Field(..., description="Unique identifier for the batch")
    uploaded_by: str = Field(..., description="User who uploaded the batch")
    uploaded_at: datetime = Field(..., description="When the batch was uploaded")
    questions_pending: int = Field(0, description="Number of questions pending review")
    questions_approved: int = Field(0, description="Number of approved questions")
    questions_rejected: int = Field(0, description="Number of rejected questions")
    questions_duplicate: int = Field(0, description="Number of duplicate questions")
    status: BatchStatus = Field(..., description="Current status of the batch")
    review_started_at: Optional[datetime] = Field(None, description="When review began")
    review_completed_at: Optional[datetime] = Field(None, description="When review completed")
    reviewed_by: Optional[str] = Field(None, description="User who reviewed the batch")
    import_started_at: Optional[datetime] = Field(None, description="When import began")
    import_completed_at: Optional[datetime] = Field(None, description="When import completed")

    class Config:
        json_encoders = {datetime: lambda dt: dt.isoformat()}
        use_enum_values = True


class StagedQuestionBase(BaseModel):
    """
    @class StagedQuestionBase
    @description Base model for staged questions with common fields
    @example:
        question = StagedQuestionBase(
            topic="Valuation",
            subtopic="DCF",
            difficulty="Advanced",
            type="Problem",
            question="Calculate enterprise value...",
            answer="Step 1: Calculate FCF..."
        )
    """
    topic: str = Field(..., min_length=1, max_length=100, description="Topic category")
    subtopic: str = Field(..., min_length=1, max_length=100, description="Subtopic within the main topic")
    difficulty: str = Field(..., description="Difficulty level: 'Basic' or 'Advanced'")
    type: str = Field(..., description="Question type: 'Definition', 'Problem', etc.")
    question: str = Field(..., min_length=1, description="The actual question text")
    answer: str = Field(..., min_length=1, description="The complete answer text")
    notes_for_tutor: Optional[str] = Field(None, description="Additional notes for tutors")

    @validator("difficulty")
    def validate_difficulty(cls, v):
        """
        @function validate_difficulty
        @description Validates that difficulty is one of the allowed values
        @param v: The difficulty value to validate
        @returns: The validated difficulty value
        @raises ValueError: If difficulty is not in allowed values
        """
        allowed = ["Basic", "Advanced"]
        if v not in allowed:
            raise ValueError(f"Difficulty must be one of: {allowed}")
        return v

    @validator("type")
    def validate_type(cls, v):
        """
        @function validate_type
        @description Validates that question type is one of the allowed values
        @param v: The type value to validate
        @returns: The validated type value
        @raises ValueError: If type is not in allowed values
        """
        allowed = ["Definition", "Problem", "GenConcept", "Calculation", "Analysis", "Question"]
        if v not in allowed:
            raise ValueError(f"Type must be one of: {allowed}")
        return v


class StagedQuestionCreate(StagedQuestionBase):
    """
    @class StagedQuestionCreate
    @description Model for creating staged questions
    @example:
        question = StagedQuestionCreate(
            upload_batch_id="batch_20250620_1234",
            topic="Accounting",
            subtopic="Revenue Recognition",
            difficulty="Basic",
            type="Definition",
            question="What is ASC 606?",
            answer="ASC 606 is the revenue recognition standard..."
        )
    """
    upload_batch_id: str = Field(..., description="ID of the upload batch")
    uploaded_by: str = Field(..., max_length=25, description="Who uploaded the question")
    upload_notes: Optional[str] = Field(None, max_length=100, description="Notes about the upload")


class StagedQuestion(StagedQuestionBase):
    """
    @class StagedQuestion
    @description Complete staged question model with all fields
    @example:
        question = StagedQuestion(
            question_id="ACC-REV-D-001",
            upload_batch_id="batch_20250620_1234",
            status="pending",
            duplicate_of=None,
            similarity_score=None,
            created_at="2025-06-20T10:00:00Z"
        )
    """
    question_id: str = Field(..., description="Generated question ID (primary key)")
    upload_batch_id: str = Field(..., description="ID of the upload batch")
    status: QuestionStatus = Field(..., description="Current status of the question")
    duplicate_of: Optional[str] = Field(None, description="Question ID if this is a duplicate")
    similarity_score: Optional[float] = Field(None, ge=0, le=1, description="Similarity score (0-1) if duplicate")
    review_notes: Optional[str] = Field(None, description="Notes from the reviewer")
    reviewed_by: Optional[str] = Field(None, description="User who reviewed the question")
    reviewed_at: Optional[datetime] = Field(None, description="When the question was reviewed")
    created_at: datetime = Field(..., description="When the question was staged")
    uploaded_by: str = Field(..., description="User who uploaded the question")
    uploaded_on: str = Field(..., description="Timestamp in MM/DD/YY H:MMPM ET format")
    upload_notes: Optional[str] = Field(None, description="Notes about the upload")

    class Config:
        json_encoders = {datetime: lambda dt: dt.isoformat()}
        use_enum_values = True


class StagingDuplicate(BaseModel):
    """
    @class StagingDuplicate
    @description Model for duplicate detection results
    @example:
        duplicate = StagingDuplicate(
            duplicate_id="dup_20250620_9012",
            staged_question_id="stg_20250620_5678",
            existing_question_id="DCF-WACC-D-001",
            similarity_score=0.85,
            resolution="pending"
        )
    """
    duplicate_id: str = Field(..., description="Unique ID for the duplicate record")
    staged_question_id: str = Field(..., description="Question ID of the staged question")
    existing_question_id: str = Field(..., description="ID of the existing question")
    similarity_score: float = Field(..., ge=0, le=1, description="Similarity score (0-1)")
    resolution: DuplicateResolution = Field(DuplicateResolution.PENDING, description="How the duplicate was resolved")
    resolution_notes: Optional[str] = Field(None, description="Notes about the resolution")
    resolved_by: Optional[str] = Field(None, description="User who resolved the duplicate")
    resolved_at: Optional[datetime] = Field(None, description="When the duplicate was resolved")
    created_at: datetime = Field(..., description="When the duplicate was detected")

    class Config:
        json_encoders = {datetime: lambda dt: dt.isoformat()}
        use_enum_values = True


class BatchReviewRequest(BaseModel):
    """
    @class BatchReviewRequest
    @description Request model for batch review operations
    @example:
        request = BatchReviewRequest(
            question_ids=["stg_20250620_5678", "stg_20250620_5679"],
            action="approve",
            review_notes="Questions look good"
        )
    """
    question_ids: List[str] = Field(..., min_items=1, description="IDs of questions to review")
    action: str = Field(..., description="Action to take: 'approve' or 'reject'")
    review_notes: Optional[str] = Field(None, description="Optional review notes")

    @validator("action")
    def validate_action(cls, v):
        """
        @function validate_action
        @description Validates that action is one of the allowed values
        @param v: The action value to validate
        @returns: The validated action value
        @raises ValueError: If action is not in allowed values
        """
        allowed = ["approve", "reject"]
        if v not in allowed:
            raise ValueError(f"Action must be one of: {allowed}")
        return v


class DuplicateResolutionRequest(BaseModel):
    """
    @class DuplicateResolutionRequest
    @description Request model for resolving duplicate questions
    @example:
        request = DuplicateResolutionRequest(
            resolution="keep_existing",
            resolution_notes="Existing question has better formatting"
        )
    """
    resolution: DuplicateResolution = Field(..., description="How to resolve the duplicate")
    resolution_notes: Optional[str] = Field(None, description="Notes about the resolution")


class BatchListResponse(BaseModel):
    """
    @class BatchListResponse
    @description Response model for listing upload batches
    @example:
        response = BatchListResponse(
            batches=[batch1, batch2],
            total_count=10,
            pending_count=3,
            reviewing_count=2,
            completed_count=5
        )
    """
    batches: List[UploadBatch] = Field(..., description="List of upload batches")
    total_count: int = Field(..., description="Total number of batches")
    pending_count: int = Field(..., description="Number of pending batches")
    reviewing_count: int = Field(..., description="Number of batches under review")
    completed_count: int = Field(..., description="Number of completed batches")


class BatchDetailResponse(BaseModel):
    """
    @class BatchDetailResponse
    @description Response model for batch details with statistics
    @example:
        response = BatchDetailResponse(
            batch=upload_batch,
            questions=[staged_q1, staged_q2],
            duplicates=[dup1, dup2],
            statistics={"pending": 10, "approved": 5}
        )
    """
    batch: UploadBatch = Field(..., description="The upload batch details")
    questions: List[StagedQuestion] = Field(..., description="Questions in the batch")
    duplicates: List[StagingDuplicate] = Field(..., description="Detected duplicates")
    statistics: Dict[str, int] = Field(..., description="Batch statistics by status")


class ImportResponse(BaseModel):
    """
    @class ImportResponse
    @description Response model for importing approved questions to production
    @example:
        response = ImportResponse(
            imported_count=45,
            failed_count=2,
            imported_ids=["DCF-WACC-D-001"],
            failed_ids=["ACC-REV-P-002"],
            errors={"ACC-REV-P-002": "ID already exists"},
            message="45 questions imported successfully"
        )
    """
    imported_count: int = Field(..., description="Number of questions imported")
    failed_count: int = Field(..., description="Number of questions that failed to import")
    imported_ids: List[str] = Field(..., description="IDs of imported questions")
    failed_ids: List[str] = Field(..., description="IDs of failed questions")
    errors: Dict[str, str] = Field(default_factory=dict, description="Error messages for failures")
    message: str = Field(..., description="Human-readable summary")
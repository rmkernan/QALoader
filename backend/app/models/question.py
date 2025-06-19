"""
@file backend/app/models/question.py
@description Pydantic data models for Q&A question management system. Defines request/response schemas and validation for question CRUD operations.
@created 2025.06.09 4:17 PM ET
@updated 2025.06.09 4:17 PM ET - Initial creation with comprehensive question models and validation
@updated June 14, 2025. 9:27 a.m. Eastern Time - Added BulkDeleteRequest and BulkDeleteResponse models for bulk deletion functionality
@updated June 14, 2025. 11:27 a.m. Eastern Time - Enhanced with validation models for file upload workflow, updated difficulty constraint to Basic/Advanced only
@updated June 14, 2025. 2:18 p.m. Eastern Time - Added upload metadata fields (uploaded_on timestamp, uploaded_by 25 chars, upload_notes 100 chars) for enhanced question tracking
@updated June 14, 2025. 3:36 p.m. Eastern Time - Removed created_at field and updated timestamp format to MM/DD/YY H:MMPM ET for uploaded_on and updated_at
@updated June 14, 2025. 4:05 p.m. Eastern Time - Fixed uploaded_on field max_length constraint to properly support short timestamp format (MM/DD/YY H:MMPM ET)
@updated June 14, 2025. 4:27 p.m. Eastern Time - Changed updated_at field from datetime to string with short timestamp format for consistency with uploaded_on
@updated June 19, 2025. 12:01 PM Eastern Time - Added 'Question' to valid type values in both QuestionBase and ParsedQuestionFromAI validators
@updated June 19, 2025. 6:01 PM Eastern Time - Added duplicate detection fields to BatchUploadResult model

@architectural-context
Layer: Data Models (Pydantic schemas)
Dependencies: pydantic (validation), typing (type hints), datetime (timestamps)
Pattern: Request/Response validation with inheritance hierarchy for different use cases

@workflow-context
User Journey: All question-related API operations (create, read, update, delete, search)
Sequence Position: Used by API routes for request validation and response formatting
Inputs: Raw JSON data from API requests
Outputs: Validated Python objects for database operations and API responses

@authentication-context
Auth Requirements: Models are auth-agnostic, used by both public and protected endpoints
Security: Input validation prevents injection attacks and ensures data integrity

@database-context
Tables: Corresponds to all_questions table schema in Supabase
Operations: Used for INSERT, UPDATE, SELECT operations with type safety
Transactions: Models support batch operations for file upload workflows
"""

from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field, validator


class QuestionBase(BaseModel):
    """
    @class QuestionBase
    @description Base model with common question fields used for inheritance by other question models
    @example:
        # Used as base class for other question models
        class QuestionCreate(QuestionBase):
            pass
    """

    topic: str = Field(..., min_length=1, max_length=100, description="Topic category (e.g., 'DCF', 'Valuation')")
    subtopic: str = Field(..., min_length=1, max_length=100, description="Subtopic within the main topic")
    difficulty: str = Field(..., description="Difficulty level: 'Basic' or 'Advanced'")
    type: str = Field(..., description="Question type: 'Definition', 'Problem', 'GenConcept', etc.")
    question: str = Field(..., min_length=1, description="The actual question text")
    answer: str = Field(..., min_length=1, description="The complete answer text")
    notes_for_tutor: Optional[str] = Field(None, description="Additional notes or guidance for tutors")
    uploaded_on: Optional[str] = Field(None, max_length=20, description="Short timestamp when question was uploaded (MM/DD/YY H:MMPM ET format)")
    uploaded_by: Optional[str] = Field(None, max_length=25, description="Free text field for who uploaded the question")
    upload_notes: Optional[str] = Field(None, max_length=100, description="Free text notes about the upload process")

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


class QuestionCreate(QuestionBase):
    """
    @class QuestionCreate
    @description Model for creating new questions. Inherits all validation from QuestionBase.
    @example:
        # Create new question
        question = QuestionCreate(
            topic="DCF",
            subtopic="WACC",
            difficulty="Basic",
            type="Definition",
            question="What is WACC?",
            answer="Weighted Average Cost of Capital..."
        )
    """

    pass


class QuestionUpdate(QuestionBase):
    """
    @class QuestionUpdate
    @description Model for updating existing questions. Includes question_id and inherits validation.
    @example:
        # Update existing question
        updated = QuestionUpdate(
            question_id="DCF-WACC-D-001",
            topic="DCF",
            subtopic="WACC Calculation",
            difficulty="Intermediate",
            type="Problem",
            question="How do you calculate WACC?",
            answer="WACC = (E/V * Re) + (D/V * Rd * (1-T))"
        )
    """

    question_id: str = Field(..., description="Unique identifier for the question")


class Question(QuestionBase):
    """
    @class Question
    @description Complete question model with all database fields including timestamps. Used for API responses.
    @example:
        # Full question object from database
        question = Question(
            question_id="DCF-WACC-D-001",
            topic="DCF",
            subtopic="WACC",
            difficulty="Basic",
            type="Definition",
            question="What is WACC?",
            answer="Weighted Average Cost of Capital...",
            updated_at="06/14/25 3:25PM ET"
        )
    """

    question_id: str = Field(..., description="Unique identifier for the question")
    updated_at: str = Field(..., max_length=20, description="Short timestamp when question was last updated (MM/DD/YY H:MMPM ET format)")

    class Config:
        # Allow datetime objects to be serialized to ISO format (for any remaining datetime fields)
        json_encoders = {datetime: lambda dt: dt.isoformat()}


class ParsedQuestionFromAI(BaseModel):
    """
    @class ParsedQuestionFromAI
    @description Model for questions parsed from AI-generated markdown files. Missing topic (provided separately) and question_id (generated by backend).
    @example:
        # Parsed from markdown file
        parsed = ParsedQuestionFromAI(
            subtopic="Free Cash Flow",
            difficulty="Intermediate",
            type="Calculation",
            question="Calculate FCF given EBITDA of $100M...",
            answer="FCF = EBITDA - Taxes - CapEx - Change in WC..."
        )
    """

    subtopic: str = Field(..., min_length=1, max_length=100, description="Subtopic within the main topic")
    difficulty: str = Field(..., description="Difficulty level: 'Basic' or 'Advanced'")
    type: str = Field(..., description="Question type: 'Definition', 'Problem', 'GenConcept', etc.")
    question: str = Field(..., min_length=1, description="The actual question text")
    answer: str = Field(..., min_length=1, description="The complete answer text")

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


class ActivityLogItem(BaseModel):
    """
    @class ActivityLogItem
    @description Model for activity log entries tracking user actions and system events
    @example:
        # Activity log entry
        activity = ActivityLogItem(
            id="123e4567-e89b-12d3-a456-426614174000",
            action="Question Created",
            details="DCF-WACC-D-001: What is WACC?",
            timestamp=datetime.now()
        )
    """

    id: str = Field(..., description="UUID of the activity log entry")
    action: str = Field(..., min_length=1, description="Description of the action performed")
    details: Optional[str] = Field(None, description="Additional details about the action")
    timestamp: datetime = Field(..., description="When the action occurred")

    class Config:
        # Allow datetime objects to be serialized to ISO format
        json_encoders = {datetime: lambda dt: dt.isoformat()}


# Enhanced models for file upload workflow

class ValidationResult(BaseModel):
    """
    @class ValidationResult
    @description Result of markdown file validation with detailed feedback for user guidance
    @example:
        result = ValidationResult(
            is_valid=True,
            errors=[],
            warnings=["Long content in question 1"],
            parsed_count=25
        )
    """
    is_valid: bool = Field(..., description="Whether the validation passed")
    errors: List[str] = Field(default_factory=list, description="List of validation errors")
    warnings: List[str] = Field(default_factory=list, description="List of validation warnings")
    parsed_count: int = Field(..., description="Number of questions successfully parsed")
    line_numbers: Optional[Dict[str, int]] = Field(None, description="Line numbers for error reporting")


class BatchUploadRequest(BaseModel):
    """
    @class BatchUploadRequest
    @description Request model for batch question upload operations with metadata tracking
    @example:
        request = BatchUploadRequest(
            topic="DCF",
            questions=[parsed_question_1, parsed_question_2],
            uploaded_on="June 14, 2025. 2:18 p.m. Eastern Time",
            uploaded_by="John Smith",
            upload_notes="Initial DCF questions for spring semester"
        )
    """
    topic: str = Field(..., min_length=1, max_length=100, description="Topic for all questions")
    questions: List[ParsedQuestionFromAI] = Field(..., min_items=1, description="List of questions to upload")
    uploaded_on: Optional[str] = Field(None, max_length=20, description="Short timestamp when questions were uploaded (MM/DD/YY H:MMPM ET format)")
    uploaded_by: Optional[str] = Field(None, max_length=25, description="Free text field for who uploaded the questions")
    upload_notes: Optional[str] = Field(None, max_length=100, description="Free text notes about this upload")


class BatchUploadResult(BaseModel):
    """
    @class BatchUploadResult
    @description Result of batch question upload operation with detailed tracking for each question including duplicate detection
    @example:
        result = BatchUploadResult(
            total_attempted=25,
            successful_uploads=["DCF-WACC-B-G-001", "DCF-WACC-B-G-002"],
            failed_uploads=["DCF-WACC-B-P-001"],
            errors={"DCF-WACC-B-P-001": "Duplicate ID"},
            duplicate_count=3,
            duplicate_groups=[{"primary_id": "DCF-WACC-B-G-001", "duplicates": [...]}]
        )
    """
    total_attempted: int = Field(..., description="Total number of questions attempted")
    successful_uploads: List[str] = Field(default_factory=list, description="Question IDs that were successfully uploaded")
    failed_uploads: List[str] = Field(default_factory=list, description="Question IDs that failed to upload")
    errors: Dict[str, str] = Field(default_factory=dict, description="Question ID to error message mapping")
    warnings: List[str] = Field(default_factory=list, description="General warnings about the upload operation")
    processing_time_ms: Optional[int] = Field(None, description="Time taken to process the upload in milliseconds")
    duplicate_count: Optional[int] = Field(0, description="Number of potential duplicates found")
    duplicate_groups: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Grouped duplicate information")


class BulkDeleteRequest(BaseModel):
    """
    @class BulkDeleteRequest
    @description Request model for bulk question deletion operations
    @example:
        request = BulkDeleteRequest(
            question_ids=["DCF-WACC-B-G-001", "DCF-WACC-B-G-002"]
        )
    """
    question_ids: List[str] = Field(..., min_items=1, description="List of question IDs to delete")


class BulkDeleteResponse(BaseModel):
    """
    @class BulkDeleteResponse
    @description Response model for bulk question deletion operations
    @example:
        response = BulkDeleteResponse(
            deleted_count=15,
            failed_count=2,
            deleted_ids=["DCF-WACC-B-G-001"],
            failed_ids=["DCF-WACC-B-G-002"],
            message="15 questions deleted successfully, 2 failed"
        )
    """
    deleted_count: int = Field(..., description="Number of questions successfully deleted")
    failed_count: int = Field(..., description="Number of questions that failed to delete")
    deleted_ids: List[str] = Field(default_factory=list, description="Question IDs that were successfully deleted")
    failed_ids: List[str] = Field(default_factory=list, description="Question IDs that failed to delete")
    errors: Optional[List[str]] = Field(None, description="Specific error messages for failed deletions")
    message: str = Field(..., description="Human-readable summary of the operation")

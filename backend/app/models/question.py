"""
@file backend/app/models/question.py
@description Pydantic data models for Q&A question management system. Defines request/response schemas and validation for question CRUD operations.
@created 2025.06.09 4:17 PM ET
@updated 2025.06.09 4:17 PM ET - Initial creation with comprehensive question models and validation
@updated June 14, 2025. 9:27 a.m. Eastern Time - Added BulkDeleteRequest and BulkDeleteResponse models for bulk deletion functionality

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
    difficulty: str = Field(..., description="Difficulty level: 'Basic', 'Intermediate', or 'Advanced'")
    type: str = Field(..., description="Question type: 'Definition', 'Problem', 'GenConcept', etc.")
    question: str = Field(..., min_length=1, description="The actual question text")
    answer: str = Field(..., min_length=1, description="The complete answer text")
    notes_for_tutor: Optional[str] = Field(None, description="Additional notes or guidance for tutors")

    @validator("difficulty")
    def validate_difficulty(cls, v):
        """
        @function validate_difficulty
        @description Validates that difficulty is one of the allowed values
        @param v: The difficulty value to validate
        @returns: The validated difficulty value
        @raises ValueError: If difficulty is not in allowed values
        """
        allowed = ["Basic", "Intermediate", "Advanced"]
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
        allowed = ["Definition", "Problem", "GenConcept", "Calculation", "Analysis"]
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
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    """

    question_id: str = Field(..., description="Unique identifier for the question")
    created_at: datetime = Field(..., description="Timestamp when question was created")
    updated_at: datetime = Field(..., description="Timestamp when question was last updated")

    class Config:
        # Allow datetime objects to be serialized to ISO format
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
    difficulty: str = Field(..., description="Difficulty level: 'Basic', 'Intermediate', or 'Advanced'")
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
        allowed = ["Basic", "Intermediate", "Advanced"]
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
        allowed = ["Definition", "Problem", "GenConcept", "Calculation", "Analysis"]
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

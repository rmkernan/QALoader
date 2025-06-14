"""
@file backend/app/models/question_bulk.py
@description Pydantic models for bulk question operations including bulk delete functionality
@created June 14, 2025. 9:27 a.m. Eastern Time
@updated June 14, 2025. 9:27 a.m. Eastern Time - Initial creation with BulkDeleteRequest and BulkDeleteResponse models

@architectural-context
Layer: Data Models (Pydantic schemas)
Dependencies: pydantic (validation), typing (type hints)
Pattern: Request/Response validation for bulk operations with detailed result tracking

@workflow-context
User Journey: Bulk question management operations (delete multiple questions at once)
Sequence Position: Used by bulk API routes for request validation and response formatting
Inputs: Arrays of question IDs for bulk operations
Outputs: Detailed operation results including successes, failures, and error messages

@authentication-context
Auth Requirements: Models are auth-agnostic, used by protected bulk operation endpoints
Security: Input validation prevents injection attacks, deduplicates IDs, ensures data integrity

@database-context
Tables: Corresponds to bulk operations on all_questions table in Supabase
Operations: Used for bulk DELETE operations with transaction support
Transactions: Models support atomic bulk operations with rollback on failure
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field, validator


class BulkDeleteRequest(BaseModel):
    """
    @class BulkDeleteRequest
    @description Request model for bulk deletion of multiple questions. Validates that at least one ID is provided.
    @example:
        # Delete multiple questions
        request = BulkDeleteRequest(
            question_ids=["DCF-WACC-D-001", "DCF-WACC-P-002", "VAL-COMP-T-003"]
        )
    """
    
    question_ids: List[str] = Field(
        ..., 
        min_items=1, 
        description="List of question IDs to delete. Must contain at least one ID."
    )
    
    @validator("question_ids")
    def validate_question_ids(cls, v):
        """
        @function validate_question_ids
        @description Ensures all question IDs are non-empty strings and removes duplicates
        @param v: List of question IDs to validate
        @returns: Deduplicated list of valid question IDs
        @raises ValueError: If any ID is empty or not a string
        """
        # Remove duplicates while preserving order
        unique_ids = []
        seen = set()
        for qid in v:
            if not isinstance(qid, str) or not qid.strip():
                raise ValueError("All question IDs must be non-empty strings")
            if qid not in seen:
                seen.add(qid)
                unique_ids.append(qid)
        return unique_ids


class BulkDeleteResponse(BaseModel):
    """
    @class BulkDeleteResponse
    @description Response model for bulk deletion operations. Provides detailed results including successes and failures.
    @example:
        # Successful bulk delete response
        response = BulkDeleteResponse(
            success=True,
            deleted_count=3,
            failed_count=0,
            deleted_ids=["DCF-WACC-D-001", "DCF-WACC-P-002", "VAL-COMP-T-003"],
            failed_ids=[],
            message="Successfully deleted 3 questions"
        )
    """
    
    success: bool = Field(..., description="Overall operation success status")
    deleted_count: int = Field(..., description="Number of questions successfully deleted")
    failed_count: int = Field(..., description="Number of questions that failed to delete")
    deleted_ids: List[str] = Field(..., description="List of successfully deleted question IDs")
    failed_ids: List[str] = Field(..., description="List of question IDs that failed to delete")
    message: str = Field(..., description="Human-readable summary of the operation")
    errors: Optional[Dict[str, str]] = Field(
        None, 
        description="Detailed error messages for each failed ID"
    )
"""
@file backend/app/models/__init__.py
@description Central export point for all Pydantic models used in the application
@created June 20, 2025. 10:00 AM Eastern Time
@updated June 20, 2025. 10:00 AM Eastern Time - Added staging workflow model exports

@architectural-context
Layer: Data Models (Pydantic schemas)
Dependencies: auth, question, staging modules
Pattern: Single import point for all application models

@workflow-context
User Journey: All API operations requiring data validation
Sequence Position: Imported by routers and services for type safety
Inputs: N/A (export module)
Outputs: Pydantic model classes for use throughout application

@authentication-context
Auth Requirements: N/A (models themselves don't enforce auth)
Security: Models provide input validation and type safety

@database-context
Tables: Models correspond to database tables in Supabase
Operations: N/A (models are data structures only)
Transactions: N/A
"""

# Authentication models
from .auth import (
    LoginRequest,
    LoginResponse,
    TokenData,
    UserInDB
)

# Question models
from .question import (
    Question,
    QuestionBase,
    QuestionCreate,
    QuestionUpdate,
    ParsedQuestionFromAI,
    ActivityLogItem,
    ValidationResult,
    BatchUploadRequest,
    BatchUploadResult,
    BulkDeleteRequest,
    BulkDeleteResponse
)

# Staging workflow models
from .staging import (
    BatchStatus,
    QuestionStatus,
    DuplicateResolution,
    UploadBatch,
    UploadBatchBase,
    UploadBatchCreate,
    StagedQuestion,
    StagedQuestionBase,
    StagedQuestionCreate,
    StagingDuplicate,
    BatchReviewRequest,
    DuplicateResolutionRequest,
    BatchListResponse,
    BatchDetailResponse,
    ImportResponse
)

__all__ = [
    # Auth
    "LoginRequest",
    "LoginResponse", 
    "TokenData",
    "UserInDB",
    # Questions
    "Question",
    "QuestionBase",
    "QuestionCreate",
    "QuestionUpdate",
    "ParsedQuestionFromAI",
    "ActivityLogItem",
    "ValidationResult",
    "BatchUploadRequest",
    "BatchUploadResult",
    "BulkDeleteRequest",
    "BulkDeleteResponse",
    # Staging
    "BatchStatus",
    "QuestionStatus",
    "DuplicateResolution",
    "UploadBatch",
    "UploadBatchBase",
    "UploadBatchCreate",
    "StagedQuestion",
    "StagedQuestionBase", 
    "StagedQuestionCreate",
    "StagingDuplicate",
    "BatchReviewRequest",
    "DuplicateResolutionRequest",
    "BatchListResponse",
    "BatchDetailResponse",
    "ImportResponse"
]
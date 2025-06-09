"""
@file backend/app/routers/questions.py
@description Question management API endpoints for Q&A Loader. Provides CRUD operations, search, and bootstrap data with JWT authentication.
@created 2025.06.09 6:30 PM ET
@updated 2025.06.09 6:30 PM ET - Phase 4 reconstruction with complete CRUD implementation

@architectural-context
Layer: API Router (FastAPI endpoints)
Dependencies: FastAPI (routing), app.models.question (request/response models), app.services.question_service (business logic)
Pattern: RESTful API with JWT authentication, standardized error responses, and comprehensive CRUD operations

@workflow-context
User Journey: Question management operations - create, read, update, delete, search questions, dashboard data loading
Sequence Position: Called after authentication, interacts with question service for database operations
Inputs: Authenticated requests with question data, search filters, question IDs
Outputs: Question objects, search results, bootstrap data, operation confirmations

@authentication-context
Auth Requirements: ALL endpoints require valid JWT token via Authorization header
Security: Protected by get_current_user dependency, input validation via Pydantic models
Rate Limiting: Consider implementing for bulk operations in production

@database-context
Tables: Delegates to question service which handles all_questions and activity_log tables
Operations: Full CRUD operations via service layer with proper error handling
Transactions: Individual operations are atomic, service layer handles complex operations
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.models.question import Question, QuestionCreate, QuestionUpdate
from app.routers.auth import get_current_user
from app.services.question_service import QuestionService

router = APIRouter()


def get_question_service(db=Depends(get_db)) -> QuestionService:
    """
    @function get_question_service
    @description Dependency to create QuestionService instance with database client
    @param db: Supabase client from dependency injection
    @returns: Configured QuestionService instance
    @example:
        # Used in endpoint functions
        @router.get("/questions")
        async def get_questions(service: QuestionService = Depends(get_question_service)):
            return await service.search_questions()
    """
    return QuestionService(db)


@router.get("/bootstrap-data")
async def get_bootstrap_data(
    current_user: str = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service)
):
    """
    @api GET /api/bootstrap-data
    @description Retrieves all data needed for dashboard initialization including questions, topics, and activity log
    @returns: Bootstrap data object with questions array, topics array, last upload timestamp, and activity log
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 500: Database connection error
    @example:
        # Request
        GET /api/bootstrap-data
        Authorization: Bearer <jwt_token>
        
        # Response
        {
            "questions": [Question[]],
            "topics": ["DCF", "Valuation", ...],
            "lastUploadTimestamp": "2025-06-09T18:30:00Z",
            "activityLog": [ActivityLogItem[]]
        }
    """
    try:
        data = await service.get_bootstrap_data()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load bootstrap data: {str(e)}"
        )


@router.get("/questions", response_model=List[Question])
async def search_questions(
    topic: Optional[str] = None,
    subtopic: Optional[str] = None,
    difficulty: Optional[str] = None,
    type: Optional[str] = None,
    searchText: Optional[str] = None,
    limit: Optional[int] = None,
    current_user: str = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service)
):
    """
    @api GET /api/questions
    @description Searches questions with optional filters for topic, subtopic, difficulty, type, and text search
    @param topic: Filter by exact topic match (e.g., "DCF")
    @param subtopic: Filter by exact subtopic match (e.g., "WACC")
    @param difficulty: Filter by difficulty level ("Basic", "Intermediate", "Advanced")
    @param type: Filter by question type ("Definition", "Problem", "GenConcept", "Calculation", "Analysis")
    @param searchText: Text search in question and answer fields
    @param limit: Maximum number of results to return
    @returns: Array of Question objects matching the search criteria
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 500: Database query error
    @example:
        # Search DCF questions
        GET /api/questions?topic=DCF&difficulty=Basic
        Authorization: Bearer <jwt_token>
        
        # Text search
        GET /api/questions?searchText=WACC&limit=10
        Authorization: Bearer <jwt_token>
    """
    try:
        questions = await service.search_questions(
            topic=topic,
            subtopic=subtopic,
            difficulty=difficulty,
            question_type=type,
            search_text=searchText,
            limit=limit
        )
        return questions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search questions: {str(e)}"
        )


@router.post("/questions", response_model=Question, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: QuestionCreate,
    current_user: str = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service)
):
    """
    @api POST /api/questions
    @description Creates a new question with auto-generated ID and activity logging
    @param question_data: QuestionCreate object with all required question fields
    @returns: Created Question object with generated ID and timestamps
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 400: Invalid question data or validation error
        - 401: Invalid or missing JWT token
        - 500: Database creation error
    @example:
        # Request
        POST /api/questions
        Authorization: Bearer <jwt_token>
        Content-Type: application/json
        
        {
            "topic": "DCF",
            "subtopic": "WACC",
            "difficulty": "Basic",
            "type": "Definition",
            "question": "What is WACC?",
            "answer": "Weighted Average Cost of Capital is...",
            "notes_for_tutor": "Focus on the components"
        }
        
        # Response (201 Created)
        {
            "question_id": "DCF-WACC-D-001",
            "topic": "DCF",
            "subtopic": "WACC",
            "difficulty": "Basic",
            "type": "Definition",
            "question": "What is WACC?",
            "answer": "Weighted Average Cost of Capital is...",
            "notes_for_tutor": "Focus on the components",
            "created_at": "2025-06-09T18:30:00Z",
            "updated_at": "2025-06-09T18:30:00Z"
        }
    """
    try:
        new_question = await service.create_question(question_data, current_user)
        return new_question
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create question: {str(e)}"
        )


@router.get("/questions/{question_id}", response_model=Question)
async def get_question(
    question_id: str,
    current_user: str = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service)
):
    """
    @api GET /api/questions/{question_id}
    @description Retrieves a single question by its unique ID
    @param question_id: Unique question identifier (e.g., "DCF-WACC-D-001")
    @returns: Question object if found
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 404: Question not found
        - 500: Database query error
    @example:
        # Request
        GET /api/questions/DCF-WACC-D-001
        Authorization: Bearer <jwt_token>
        
        # Response
        {
            "question_id": "DCF-WACC-D-001",
            "topic": "DCF",
            "subtopic": "WACC",
            "difficulty": "Basic",
            "type": "Definition",
            "question": "What is WACC?",
            "answer": "Weighted Average Cost of Capital is...",
            "notes_for_tutor": "Focus on the components",
            "created_at": "2025-06-09T18:30:00Z",
            "updated_at": "2025-06-09T18:30:00Z"
        }
    """
    try:
        question = await service.get_question_by_id(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with ID '{question_id}' not found"
            )
        return question
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve question: {str(e)}"
        )


@router.put("/questions/{question_id}", response_model=Question)
async def update_question(
    question_id: str,
    question_data: QuestionUpdate,
    current_user: str = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service)
):
    """
    @api PUT /api/questions/{question_id}
    @description Updates an existing question with new data and activity logging
    @param question_id: Unique question identifier (e.g., "DCF-WACC-D-001")
    @param question_data: QuestionUpdate object with updated question fields
    @returns: Updated Question object with new timestamps
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 400: Invalid question data or validation error
        - 401: Invalid or missing JWT token
        - 404: Question not found
        - 500: Database update error
    @example:
        # Request
        PUT /api/questions/DCF-WACC-D-001
        Authorization: Bearer <jwt_token>
        Content-Type: application/json
        
        {
            "question_id": "DCF-WACC-D-001",
            "topic": "DCF",
            "subtopic": "WACC Advanced",
            "difficulty": "Intermediate",
            "type": "Problem",
            "question": "How do you calculate WACC with multiple debt sources?",
            "answer": "When calculating WACC with multiple debt sources...",
            "notes_for_tutor": "Emphasize the weighted approach"
        }
        
        # Response
        {
            "question_id": "DCF-WACC-D-001",
            "topic": "DCF",
            "subtopic": "WACC Advanced",
            "difficulty": "Intermediate",
            "type": "Problem",
            "question": "How do you calculate WACC with multiple debt sources?",
            "answer": "When calculating WACC with multiple debt sources...",
            "notes_for_tutor": "Emphasize the weighted approach",
            "created_at": "2025-06-09T18:30:00Z",
            "updated_at": "2025-06-09T19:15:00Z"
        }
    """
    try:
        # Validate that question_id in URL matches question_data
        if question_data.question_id != question_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question ID in URL must match question ID in request body"
            )
        
        updated_question = await service.update_question(question_id, question_data, current_user)
        if not updated_question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with ID '{question_id}' not found"
            )
        return updated_question
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update question: {str(e)}"
        )


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: str = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service)
):
    """
    @api DELETE /api/questions/{question_id}
    @description Deletes a question by ID with activity logging
    @param question_id: Unique question identifier (e.g., "DCF-WACC-D-001")
    @returns: Confirmation message with deleted question ID
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 404: Question not found
        - 500: Database deletion error
    @example:
        # Request
        DELETE /api/questions/DCF-WACC-D-001
        Authorization: Bearer <jwt_token>
        
        # Response
        {
            "message": "Question deleted successfully",
            "question_id": "DCF-WACC-D-001"
        }
    """
    try:
        success = await service.delete_question(question_id, current_user)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with ID '{question_id}' not found"
            )
        
        return {
            "message": "Question deleted successfully",
            "question_id": question_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete question: {str(e)}"
        )
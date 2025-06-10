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
from supabase import Client

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
    enhanced: bool = False,
    current_user: str = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service)
):
    """
    @api GET /api/bootstrap-data
    @description Retrieves all data needed for dashboard initialization including questions, topics, and activity log
    @param enhanced: If true, returns enhanced data with statistics, metrics, and system health
    @returns: Bootstrap data object with questions array, topics array, last upload timestamp, and activity log
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 500: Database connection error
    @example:
        # Basic Request
        GET /api/bootstrap-data
        Authorization: Bearer <jwt_token>
        
        # Enhanced Request
        GET /api/bootstrap-data?enhanced=true
        Authorization: Bearer <jwt_token>
        
        # Enhanced Response includes:
        {
            "questions": [Question[]],
            "topics": ["DCF", "Valuation", ...],
            "statistics": {
                "totalQuestions": 150,
                "questionsByDifficulty": {"Basic": 50, "Intermediate": 60, "Advanced": 40},
                "questionsByType": {"Definition": 40, "Problem": 110},
                "questionsByTopic": {"DCF": 30, "Valuation": 45, ...},
                "recentActivity": 25
            },
            "systemHealth": {
                "status": "healthy",
                "databaseConnected": true,
                "totalStorageUsed": "2.45 MB",
                "avgResponseTime": 0.05
            },
            "activityTrends": [
                {"date": "2025-06-03", "activityCount": 5, "questionsCreated": 2},
                ...
            ],
            "lastUploadTimestamp": "2025-06-09T18:30:00Z",
            "activityLog": [ActivityLogItem[]]
        }
    """
    try:
        if enhanced:
            data = await service.get_enhanced_bootstrap_data()
        else:
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


# Analytics Endpoints (Phase 5)

@router.get("/analytics/dashboard")
async def get_dashboard_analytics(
    current_user: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    @api GET /api/analytics/dashboard
    @description Detailed dashboard analytics including question metrics, activity summaries, and engagement data
    @returns: Comprehensive analytics object with multiple metric categories
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 500: Analytics calculation error
    @example:
        # Request
        GET /api/analytics/dashboard
        Authorization: Bearer <jwt_token>
        
        # Response
        {
            "questionMetrics": {
                "total": 150,
                "byDifficulty": {"Basic": 50, "Intermediate": 60, "Advanced": 40},
                "byType": {"Definition": 40, "Problem": 60, ...},
                "recentAdditions": 15,
                "averagePerTopic": 25
            },
            "activityMetrics": {
                "total": 500,
                "byType": {"Question Created": 150, "Search Performed": 200, ...},
                "last24Hours": 45,
                "dailyAverage": 16.7,
                "peakHour": 14
            },
            "topicMetrics": {...},
            "engagementMetrics": {...},
            "timeMetrics": {...},
            "generatedAt": "2025-06-10T00:45:00Z"
        }
    """
    try:
        from app.services.analytics_service import AnalyticsService
        analytics_service = AnalyticsService(db)
        metrics = await analytics_service.get_dashboard_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate dashboard analytics: {str(e)}"
        )


@router.get("/analytics/activity-trends")
async def get_activity_trends(
    days: int = 7,
    current_user: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    @api GET /api/analytics/activity-trends
    @description Activity trends over specified period with daily breakdown and trend indicators
    @param days: Number of days to analyze (default: 7, max: 90)
    @returns: List of daily activity summaries with trends
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 400: Invalid days parameter
        - 500: Trend calculation error
    @example:
        # Request
        GET /api/analytics/activity-trends?days=30
        Authorization: Bearer <jwt_token>
        
        # Response
        [
            {
                "date": "2025-06-01",
                "dayOfWeek": "Saturday",
                "totalActivities": 25,
                "questionsCreated": 5,
                "activityBreakdown": {"Question Created": 5, "Search Performed": 15, ...},
                "peakHour": 14,
                "activityChange": 3,
                "questionChange": 2,
                "trend": "up"
            },
            ...
        ]
    """
    try:
        # Validate days parameter
        if days < 1 or days > 90:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Days parameter must be between 1 and 90"
            )
        
        from app.services.analytics_service import AnalyticsService
        analytics_service = AnalyticsService(db)
        trends = await analytics_service.get_activity_trends(days=days)
        return trends
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate activity trends: {str(e)}"
        )


@router.get("/analytics/content")
async def get_content_analytics(
    current_user: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    @api GET /api/analytics/content
    @description Content analytics including question distribution, coverage gaps, and quality metrics
    @returns: Content analysis with distribution and balance metrics
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 500: Content analysis error
    @example:
        # Request
        GET /api/analytics/content
        Authorization: Bearer <jwt_token>
        
        # Response
        {
            "distribution": {
                "topicSubtopicBreakdown": {"DCF": {"WACC": 10, "Terminal Value": 8}, ...},
                "totalCombinations": 25
            },
            "coverage": {
                "expectedTopics": 6,
                "coveredTopics": 5,
                "missingTopics": ["LBO"],
                "coveragePercentage": 83.3,
                "additionalTopics": ["ESG"]
            },
            "difficultyBalance": {
                "distribution": {"Basic": {"count": 50, "percentage": 33.3, "deviation": 0.1}},
                "overallBalance": 95.2,
                "recommendation": "Good balance across difficulty levels"
            },
            "typeDistribution": {...}
        }
    """
    try:
        from app.services.analytics_service import AnalyticsService
        analytics_service = AnalyticsService(db)
        content_analysis = await analytics_service.get_content_analytics()
        return content_analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze content: {str(e)}"
        )


@router.get("/system/health")
async def get_system_health(
    current_user: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    @api GET /api/system/health
    @description System health and performance metrics including database status and resource usage
    @returns: System health object with performance metrics
    @authentication: Required JWT token in Authorization header
    @errors: 
        - 401: Invalid or missing JWT token
        - 500: Health check error
    @example:
        # Request
        GET /api/system/health
        Authorization: Bearer <jwt_token>
        
        # Response
        {
            "database": {
                "status": "healthy",
                "connectionActive": true,
                "lastQueryTime": "12.5ms",
                "healthScore": 95
            },
            "queryPerformance": {
                "avgTime": 25.3,
                "queries": [{"type": "simple", "time": 12.5, "status": "success"}],
                "performance": "good"
            },
            "resourceUsage": {
                "storage": {"totalMB": 2.45, "questionsKB": 300, "activitiesKB": 150},
                "records": {"questions": 150, "activities": 300, "total": 450}
            },
            "apiMetrics": {
                "avgResponseTime": 45.2,
                "successRate": 99.5,
                "errorRate": 0.5,
                "requestsPerMinute": 12
            },
            "timestamp": "2025-06-10T00:45:00Z"
        }
    """
    try:
        from app.services.analytics_service import AnalyticsService
        analytics_service = AnalyticsService(db)
        performance = await analytics_service.get_performance_metrics()
        return performance
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check system health: {str(e)}"
        )
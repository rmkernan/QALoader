"""
@file backend/app/routers/staging.py
@description API endpoints for staging workflow management including batch review, duplicate resolution, and import operations
@created June 20, 2025. 10:05 AM Eastern Time
@updated June 20, 2025. 10:05 AM Eastern Time - Initial creation with comprehensive staging endpoints
@updated June 20, 2025. 12:11 PM Eastern Time - Fixed staged_id column references to question_id to match table schema

@architectural-context
Layer: API Route Layer (FastAPI endpoints)
Dependencies: fastapi, app.services.staging_service, app.models.staging, app.database
Pattern: RESTful API with batch management and review workflow

@workflow-context
User Journey: Staging workflow for question review and approval
Sequence Position: Manages staged questions before production import
Inputs: Batch IDs, review decisions, import requests
Outputs: Batch information, staged questions, import results

@authentication-context
Auth Requirements: All endpoints require JWT authentication
Security: User tracking for all review and import operations

@database-context
Tables: upload_batches, staged_questions, staging_duplicates
Operations: Complex queries for batch management and review
Transactions: Batch operations with proper error handling
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from app.database import supabase
from app.routers.auth import get_current_user
from app.services.staging_service import StagingService
from app.models.staging import (
    BatchStatus,
    QuestionStatus,
    UploadBatch,
    StagedQuestion,
    StagingDuplicate,
    BatchReviewRequest,
    DuplicateResolutionRequest,
    BatchListResponse,
    BatchDetailResponse,
    ImportResponse
)

router = APIRouter(prefix="/staging", tags=["staging"])


@router.get("/batches", response_model=BatchListResponse)
async def list_upload_batches(
    status: Optional[str] = Query(None, description="Filter by batch status"),
    limit: int = Query(50, le=100, description="Maximum number of batches to return"),
    offset: int = Query(0, ge=0, description="Number of batches to skip"),
    current_user: dict = Depends(get_current_user)
):
    """
    @api GET /api/staging/batches
    @description List upload batches with optional status filter
    @param status: Optional status filter (pending, reviewing, approved, importing, completed, failed)
    @param limit: Maximum number of batches to return (default: 50, max: 100)
    @param offset: Number of batches to skip for pagination
    @returns: BatchListResponse with list of batches and statistics
    @authentication: Required JWT token
    @errors:
        - 401: Invalid or missing JWT token
        - 500: Database error
    """
    try:
        # Build query
        query = supabase.table("upload_batches")\
            .select("*")\
            .order("uploaded_at", desc=True)\
            .limit(limit)\
            .offset(offset)
        
        if status:
            query = query.eq("status", status)
        
        result = query.execute()
        
        # Get statistics
        stats_result = supabase.table("upload_batches")\
            .select("status")\
            .execute()
        
        # Count by status
        status_counts = {
            "total_count": len(stats_result.data) if stats_result.data else 0,
            "pending_count": 0,
            "reviewing_count": 0,
            "completed_count": 0
        }
        
        if stats_result.data:
            for batch in stats_result.data:
                if batch["status"] == BatchStatus.PENDING:
                    status_counts["pending_count"] += 1
                elif batch["status"] == BatchStatus.REVIEWING:
                    status_counts["reviewing_count"] += 1
                elif batch["status"] == BatchStatus.COMPLETED:
                    status_counts["completed_count"] += 1
        
        # Convert to models
        batches = [UploadBatch(**batch) for batch in result.data] if result.data else []
        
        return BatchListResponse(
            batches=batches,
            **status_counts
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing batches: {str(e)}")


@router.get("/batches/{batch_id}", response_model=BatchDetailResponse)
async def get_batch_details(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    @api GET /api/staging/batches/{batch_id}
    @description Get detailed information about a specific batch
    @param batch_id: ID of the batch to retrieve
    @returns: BatchDetailResponse with batch details, questions, and duplicates
    @authentication: Required JWT token
    @errors:
        - 401: Invalid or missing JWT token
        - 404: Batch not found
        - 500: Database error
    """
    try:
        # Get batch
        batch_result = supabase.table("upload_batches")\
            .select("*")\
            .eq("batch_id", batch_id)\
            .single()\
            .execute()
        
        if not batch_result.data:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Get questions
        questions_result = supabase.table("staged_questions")\
            .select("*")\
            .eq("upload_batch_id", batch_id)\
            .order("created_at")\
            .execute()
        
        # Get duplicates
        duplicates_result = supabase.table("staging_duplicates")\
            .select("*")\
            .in_("staged_question_id", [q["question_id"] for q in questions_result.data] if questions_result.data else [])\
            .execute()
        
        # Get statistics
        statistics = {}
        if questions_result.data:
            for question in questions_result.data:
                status = question["status"]
                statistics[status] = statistics.get(status, 0) + 1
        
        # Convert to models
        batch = UploadBatch(**batch_result.data)
        questions = [StagedQuestion(**q) for q in questions_result.data] if questions_result.data else []
        duplicates = [StagingDuplicate(**d) for d in duplicates_result.data] if duplicates_result.data else []
        
        return BatchDetailResponse(
            batch=batch,
            questions=questions,
            duplicates=duplicates,
            statistics=statistics
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] Batch detail error: {str(e)}")
        print(f"[DEBUG] Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting batch details: {str(e)}")


@router.get("/batches/{batch_id}/questions")
async def get_batch_questions(
    batch_id: str,
    status: Optional[str] = Query(None, description="Filter by question status"),
    current_user: dict = Depends(get_current_user)
):
    """
    @api GET /api/staging/batches/{batch_id}/questions
    @description Get questions in a batch with optional status filter
    @param batch_id: ID of the batch
    @param status: Optional status filter (pending, approved, rejected, duplicate, imported)
    @returns: List of staged questions
    @authentication: Required JWT token
    @errors:
        - 401: Invalid or missing JWT token
        - 500: Database error
    """
    try:
        questions = await StagingService.get_batch_questions(batch_id, status)
        return {"questions": questions, "count": len(questions)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting questions: {str(e)}")


@router.post("/batches/{batch_id}/review")
async def review_batch_questions(
    batch_id: str,
    review_request: BatchReviewRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    @api POST /api/staging/batches/{batch_id}/review
    @description Bulk approve or reject questions in a batch
    @param batch_id: ID of the batch
    @param review_request: Review action details (question IDs and action)
    @returns: Summary of review operation
    @authentication: Required JWT token
    @errors:
        - 400: Invalid review action
        - 401: Invalid or missing JWT token
        - 404: Batch or questions not found
        - 500: Database error
    """
    try:
        reviewer_email = current_user  # current_user is already the username/email string
        
        if review_request.action == "approve":
            result = await StagingService.approve_questions(
                batch_id,
                review_request.question_ids,
                reviewer_email,
                review_request.review_notes
            )
        elif review_request.action == "reject":
            result = await StagingService.reject_questions(
                batch_id,
                review_request.question_ids,
                reviewer_email,
                review_request.review_notes
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve' or 'reject'")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reviewing questions: {str(e)}")


@router.post("/batches/{batch_id}/import", response_model=ImportResponse)
async def import_approved_questions(
    batch_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    @api POST /api/staging/batches/{batch_id}/import
    @description Import approved questions from staging to production
    @param batch_id: ID of the batch to import
    @returns: ImportResponse with details of imported and failed questions
    @authentication: Required JWT token
    @errors:
        - 401: Invalid or missing JWT token
        - 404: Batch not found
        - 409: Batch not ready for import
        - 500: Database error
    """
    try:
        # Check batch exists and has approved questions
        batch_result = supabase.table("upload_batches")\
            .select("*")\
            .eq("batch_id", batch_id)\
            .single()\
            .execute()
        
        if not batch_result.data:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        batch = batch_result.data
        
        if batch["questions_approved"] == 0:
            raise HTTPException(
                status_code=409, 
                detail="No approved questions to import"
            )
        
        if batch["status"] not in [BatchStatus.REVIEWING, BatchStatus.PENDING, BatchStatus.COMPLETED]:
            raise HTTPException(
                status_code=409,
                detail=f"Batch is not ready for import. Current status: {batch['status']}"
            )
        
        # Perform import
        import_result = await StagingService.import_approved(
            batch_id,
            current_user
        )
        
        return ImportResponse(**import_result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing questions: {str(e)}")


@router.get("/duplicates/{batch_id}")
async def get_batch_duplicates(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    @api GET /api/staging/duplicates/{batch_id}
    @description Get all detected duplicates for a batch
    @param batch_id: ID of the batch
    @returns: List of duplicate records with similarity scores
    @authentication: Required JWT token
    @errors:
        - 401: Invalid or missing JWT token
        - 500: Database error
    """
    try:
        # Get staged question IDs for the batch
        questions_result = supabase.table("staged_questions")\
            .select("question_id")\
            .eq("upload_batch_id", batch_id)\
            .execute()
        
        if not questions_result.data:
            return {"duplicates": [], "count": 0}
        
        question_ids = [q["question_id"] for q in questions_result.data]
        
        # Get duplicates
        duplicates_result = supabase.table("staging_duplicates")\
            .select("*")\
            .in_("staged_question_id", question_ids)\
            .order("similarity_score", desc=True)\
            .execute()
        
        duplicates = duplicates_result.data if duplicates_result.data else []
        
        # Enhance with question details
        for dup in duplicates:
            # Get staged question details
            staged_result = supabase.table("staged_questions")\
                .select("question, topic, subtopic")\
                .eq("question_id", dup["staged_question_id"])\
                .single()\
                .execute()
            
            if staged_result.data:
                dup["staged_question"] = staged_result.data
            
            # Get existing question details
            existing_result = supabase.table("all_questions")\
                .select("question, topic, subtopic")\
                .eq("question_id", dup["existing_question_id"])\
                .single()\
                .execute()
            
            if existing_result.data:
                dup["existing_question"] = existing_result.data
        
        return {
            "duplicates": duplicates,
            "count": len(duplicates)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting duplicates: {str(e)}")


@router.post("/duplicates/{duplicate_id}/resolve")
async def resolve_duplicate(
    duplicate_id: str,
    resolution_request: DuplicateResolutionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    @api POST /api/staging/duplicates/{duplicate_id}/resolve
    @description Resolve a duplicate by choosing keep_existing, replace, or keep_both
    @param duplicate_id: ID of the duplicate record
    @param resolution_request: Resolution decision and notes
    @returns: Success message
    @authentication: Required JWT token
    @errors:
        - 400: Invalid resolution option
        - 401: Invalid or missing JWT token
        - 404: Duplicate not found
        - 500: Database error
    """
    try:
        # Get duplicate record
        dup_result = supabase.table("staging_duplicates")\
            .select("*")\
            .eq("duplicate_id", duplicate_id)\
            .single()\
            .execute()
        
        if not dup_result.data:
            raise HTTPException(status_code=404, detail="Duplicate record not found")
        
        duplicate = dup_result.data
        
        # Update duplicate record
        update_result = supabase.table("staging_duplicates")\
            .update({
                "resolution": resolution_request.resolution,
                "resolution_notes": resolution_request.resolution_notes,
                "resolved_by": current_user.get('email', 'unknown'),
                "resolved_at": datetime.utcnow().isoformat()
            })\
            .eq("duplicate_id", duplicate_id)\
            .execute()
        
        # Update staged question based on resolution
        if resolution_request.resolution == "keep_existing":
            # Reject the staged question
            supabase.table("staged_questions")\
                .update({
                    "status": QuestionStatus.REJECTED,
                    "review_notes": f"Duplicate of {duplicate['existing_question_id']} - keeping existing"
                })\
                .eq("question_id", duplicate["staged_question_id"])\
                .execute()
        
        elif resolution_request.resolution == "replace":
            # Approve staged question, will replace existing on import
            supabase.table("staged_questions")\
                .update({
                    "status": QuestionStatus.APPROVED,
                    "review_notes": f"Will replace {duplicate['existing_question_id']}"
                })\
                .eq("question_id", duplicate["staged_question_id"])\
                .execute()
        
        elif resolution_request.resolution == "keep_both":
            # Clear duplicate status and approve
            supabase.table("staged_questions")\
                .update({
                    "status": QuestionStatus.APPROVED,
                    "duplicate_of": None,
                    "similarity_score": None,
                    "review_notes": "Keeping both questions despite similarity"
                })\
                .eq("question_id", duplicate["staged_question_id"])\
                .execute()
        
        # Update batch counts
        batch_id = supabase.table("staged_questions")\
            .select("upload_batch_id")\
            .eq("question_id", duplicate["staged_question_id"])\
            .single()\
            .execute()
        
        if batch_id.data:
            await StagingService.update_batch_counts(batch_id.data["upload_batch_id"])
        
        return {
            "success": True,
            "message": f"Duplicate resolved with action: {resolution_request.resolution}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resolving duplicate: {str(e)}")


# Add missing datetime import
from datetime import datetime
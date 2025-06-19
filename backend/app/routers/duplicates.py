"""
@file backend/app/routers/duplicates.py
@description API endpoints for duplicate question management using PostgreSQL pg_trgm extension
@created June 19, 2025. 6:01 PM Eastern Time

@architectural-context
Layer: API Route Handler
Dependencies: FastAPI, duplicate_service, auth_service
Pattern: RESTful API for duplicate operations

@workflow-context
User Journey: Post-upload duplicate management and cleanup
Sequence Position: Called after successful upload or manual duplicate scanning
Inputs: Optional question IDs, similarity thresholds
Outputs: Grouped duplicate information, deletion confirmations

@authentication-context
Auth Requirements: JWT token required for all endpoints
Security: Question access restricted to authenticated users

@database-context
Tables: Reads from all_questions table using pg_trgm similarity
Operations: SELECT with similarity queries, DELETE for cleanup
Transactions: Individual operations for flexibility
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.services.auth_service import get_current_user
from app.services.duplicate_service import duplicate_service
from app.database import supabase

router = APIRouter(prefix="/api/duplicates", tags=["duplicates"])

@router.get("/")
async def get_all_duplicates(
    threshold: float = Query(0.8, ge=0.1, le=1.0, description="Similarity threshold (0.1-1.0)"),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    @api GET /api/duplicates
    @description Get all potential duplicates in the database using similarity matching
    @param threshold: Similarity threshold for duplicate detection (0.1-1.0)
    @returns: Dictionary with count and grouped duplicate information
    @authentication: Required JWT token in Authorization header
    @errors:
        - 401: Invalid or missing JWT token
        - 422: Invalid threshold value
        - 500: Database or processing error
    @example:
        # Request
        GET /api/duplicates?threshold=0.8
        Authorization: Bearer <jwt_token>
    """
    try:
        result = await duplicate_service.scan_all_duplicates(threshold)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to scan for duplicates: {str(e)}"
        )

@router.get("/scan")
async def scan_for_duplicates(
    question_ids: Optional[str] = Query(None, description="Comma-separated list of question IDs to scan"),
    threshold: float = Query(0.8, ge=0.1, le=1.0, description="Similarity threshold (0.1-1.0)"),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    @api GET /api/duplicates/scan
    @description Scan for duplicates, optionally limited to specific question IDs
    @param question_ids: Optional comma-separated list of question IDs to scan
    @param threshold: Similarity threshold for duplicate detection (0.1-1.0)
    @returns: Dictionary with count and grouped duplicate information
    @authentication: Required JWT token in Authorization header
    @errors:
        - 401: Invalid or missing JWT token
        - 422: Invalid threshold value
        - 500: Database or processing error
    @example:
        # Request
        GET /api/duplicates/scan?question_ids=DCF-001,DCF-002&threshold=0.8
        Authorization: Bearer <jwt_token>
    """
    try:
        if question_ids:
            # Parse comma-separated question IDs
            id_list = [qid.strip() for qid in question_ids.split(',') if qid.strip()]
            result = await duplicate_service.detect_duplicates(id_list, threshold)
        else:
            result = await duplicate_service.scan_all_duplicates(threshold)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to scan for duplicates: {str(e)}"
        )

@router.delete("/batch")
async def batch_delete_duplicates(
    request_data: Dict[str, List[str]],
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    @api DELETE /api/duplicates/batch
    @description Delete multiple duplicate questions in a batch operation
    @param request_data: JSON body with question_ids array
    @returns: Deletion summary with success/failure counts
    @authentication: Required JWT token in Authorization header
    @errors:
        - 400: Invalid request format or empty question_ids
        - 401: Invalid or missing JWT token
        - 500: Database operation error
    @example:
        # Request
        DELETE /api/duplicates/batch
        Authorization: Bearer <jwt_token>
        Content-Type: application/json
        
        {
            "question_ids": ["DCF-001", "DCF-002", "DCF-003"]
        }
    """
    try:
        question_ids = request_data.get('question_ids', [])
        
        if not question_ids:
            raise HTTPException(
                status_code=400,
                detail="question_ids array is required and cannot be empty"
            )
        
        # Track deletion results
        deleted_count = 0
        failed_count = 0
        deleted_ids = []
        failed_ids = []
        errors = []
        
        # Delete questions individually to track success/failure
        for question_id in question_ids:
            try:
                result = supabase.table('all_questions').delete().eq('question_id', question_id).execute()
                
                if result.data and len(result.data) > 0:
                    deleted_count += 1
                    deleted_ids.append(question_id)
                else:
                    failed_count += 1
                    failed_ids.append(question_id)
                    errors.append(f"Question {question_id} not found or already deleted")
                    
            except Exception as e:
                failed_count += 1
                failed_ids.append(question_id)
                errors.append(f"Failed to delete {question_id}: {str(e)}")
        
        return {
            "deleted_count": deleted_count,
            "failed_count": failed_count,
            "deleted_ids": deleted_ids,
            "failed_ids": failed_ids,
            "errors": errors if errors else None,
            "message": f"Deleted {deleted_count} questions successfully, {failed_count} failed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Batch delete operation failed: {str(e)}"
        )
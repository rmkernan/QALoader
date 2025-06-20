"""
@file backend/app/routers/upload.py
@description API endpoints for file upload and validation operations. Handles markdown file processing with validation-first approach.
@created June 14, 2025. 11:27 a.m. Eastern Time
@updated June 14, 2025. 11:27 a.m. Eastern Time - Enhanced with comprehensive validation and upload workflow
@updated June 14, 2025. 2:18 p.m. Eastern Time - Added support for upload metadata fields (uploaded_on, uploaded_by, upload_notes)
@updated June 14, 2025. 4:46 p.m. Eastern Time - CRITICAL FIX: Added missing updated_at field to database insertion, resolving zero upload issue
@updated June 19, 2025. 2:08 PM Eastern Time - Removed topic parameter from validation and upload endpoints - topics extracted from file content
@updated June 19, 2025. 6:01 PM Eastern Time - Added duplicate detection using PostgreSQL pg_trgm extension
@updated June 20, 2025. 10:04 AM Eastern Time - Modified upload endpoint to use staging workflow for review before production
@updated June 20, 2025. 12:16 PM Eastern Time - Added detailed error logging for staging workflow debugging
@updated June 20, 2025. 4:00 PM Eastern Time - Fixed current_user parameter type from dict to str to match auth dependency

@architectural-context
Layer: API Route Layer (FastAPI endpoints)
Dependencies: fastapi, app.services.validation_service, app.utils.id_generator, app.models.question, app.database
Pattern: RESTful API with validation-first approach and detailed error handling

@workflow-context
User Journey: File upload workflow from validation to database insertion
Sequence Position: Entry point for file upload operations, coordinates validation and upload services
Inputs: Multipart form data with topic and markdown file
Outputs: Validation results and upload status with detailed feedback

@authentication-context
Auth Requirements: All endpoints require JWT authentication via get_current_user dependency
Security: File type validation, size limits, input sanitization

@database-context
Tables: Inserts into all_questions table with proper ID generation and conflict handling
Operations: Individual INSERT operations with error tracking per question
Transactions: No explicit transactions - allows partial success for better user experience
"""

import time
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from typing import List, Dict, Any

from app.database import supabase
from app.routers.auth import get_current_user
from app.services.validation_service import validation_service, ValidationResult, BatchUploadResult
from app.services.duplicate_service import duplicate_service
from app.services.staging_service import StagingService
from app.utils.id_generator import id_generator
from app.models.question import (
    QuestionCreate, 
    ParsedQuestionFromAI, 
    BatchUploadRequest,
    ValidationResult as ValidationResultModel,
    BatchUploadResult as BatchUploadResultModel
)
from app.models.staging import (
    UploadBatchCreate,
    StagedQuestionCreate
)

router = APIRouter()
logger = logging.getLogger(__name__)

# File upload constraints
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_CONTENT_TYPES = ["text/markdown", "text/plain", "application/octet-stream"]
ALLOWED_EXTENSIONS = [".md", ".txt"]


async def validate_file(file: UploadFile) -> None:
    """
    @function validate_file
    @description Validates uploaded file meets requirements
    @param file: Uploaded file object
    @raises HTTPException: If file validation fails
    """
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Check file extension
    if file.filename:
        extension = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
            )


def categorize_database_error(error: Exception, question_id: str) -> str:
    """
    @function categorize_database_error
    @description Converts database errors to user-friendly messages
    @param error: Database exception
    @param question_id: Question ID for context
    @returns: User-friendly error message
    """
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
        return f"Upload error: {str(error)[:100]}..."


@router.post("/validate-markdown", response_model=ValidationResultModel)
async def validate_markdown_file(
    file: UploadFile = File(..., description="Markdown file to validate"),
    current_user: str = Depends(get_current_user)
):
    """
    @api POST /api/validate-markdown
    @description Validates markdown file structure and content without saving to database
    @param file: Uploaded markdown file containing questions with embedded topics
    @returns: ValidationResult with detailed feedback
    @authentication: Required JWT token in Authorization header
    @errors:
        - 400: Invalid file format or content validation errors
        - 401: Invalid or missing JWT token
        - 413: File too large
        - 500: Server processing error
    @example:
        # Request
        POST /api/validate-markdown
        Content-Type: multipart/form-data
        Authorization: Bearer <jwt_token>
        
        file=<markdown_file>
    """
    start_time = time.time()
    
    try:
        # Validate file constraints
        await validate_file(file)
        
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Log first 500 chars of content for debugging
        logger.info(f"File content preview (first 500 chars): {content_str[:500]}")
        
        # Parse and validate questions
        questions, validation_result = validation_service.parse_markdown_to_questions(content_str)
        logger.info(f"Parsed {len(questions)} questions from file")
        
        # Return validation result
        return ValidationResultModel(
            is_valid=validation_result.is_valid,
            errors=validation_result.errors,
            warnings=validation_result.warnings,
            parsed_count=validation_result.parsed_count,
            line_numbers=validation_result.line_numbers
        )
        
    except HTTPException:
        raise
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding error. Please ensure file is UTF-8 encoded.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")
    finally:
        # Reset file position for potential reuse
        await file.seek(0)


@router.post("/upload-markdown", response_model=Dict[str, Any])
async def upload_markdown_file(
    file: UploadFile = File(..., description="Markdown file to upload with embedded topics"),
    use_staging: bool = Form(True, description="Whether to use staging workflow (default: True)"),
    uploaded_on: str = Form(None, description="American timestamp when questions were uploaded (Eastern Time)"),
    uploaded_by: str = Form(None, description="Free text field for who uploaded the questions"),
    upload_notes: str = Form(None, description="Free text notes about this upload"),
    current_user: str = Depends(get_current_user)
):
    """
    @api POST /api/upload-markdown
    @description Validates and uploads questions to staging area for review before production
    @param file: Uploaded markdown file containing questions with embedded topics
    @param use_staging: Whether to use staging workflow (default: True, set False for direct upload)
    @param uploaded_on: American timestamp when questions were uploaded (Eastern Time)
    @param uploaded_by: Free text field for who uploaded the questions (max 25 chars)
    @param upload_notes: Free text notes about this upload (max 100 chars)
    @returns: Upload result with batch ID for staging review or direct upload results
    @authentication: Required JWT token in Authorization header
    @errors:
        - 400: Invalid file format or validation errors
        - 401: Invalid or missing JWT token
        - 413: File too large
        - 500: Server processing error
    @example:
        # Request
        POST /api/upload-markdown
        Content-Type: multipart/form-data
        Authorization: Bearer <jwt_token>
        
        file=<markdown_file>&uploaded_by=John Smith&upload_notes=Q2 2025 questions
    """
    start_time = time.time()
    
    try:
        # Validate file constraints
        await validate_file(file)
        
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Log first 500 chars of content for debugging
        logger.info(f"File content preview (first 500 chars): {content_str[:500]}")
        
        # Parse and validate questions
        questions, validation_result = validation_service.parse_markdown_to_questions(content_str)
        logger.info(f"Parsed {len(questions)} questions from file")
        
        # If validation failed, return validation errors
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=400, 
                detail={
                    "message": "File validation failed",
                    "errors": validation_result.errors,
                    "warnings": validation_result.warnings
                }
            )
        
        # Use staging workflow if enabled
        if use_staging:
            # Create upload batch
            batch_data = UploadBatchCreate(
                file_name=file.filename or "unknown.md",
                total_questions=len(questions),
                uploaded_by=uploaded_by or current_user,
                notes=upload_notes
            )
            
            batch = await StagingService.create_batch(batch_data)
            batch_id = batch['batch_id']
            
            # Stage questions
            staged_questions = []
            for question in questions:
                staged_questions.append(StagedQuestionCreate(
                    upload_batch_id=batch_id,
                    topic=question.topic,
                    subtopic=question.subtopic,
                    difficulty=question.difficulty,
                    type=question.type,
                    question=question.question,
                    answer=question.answer,
                    notes_for_tutor=question.notes_for_tutor,
                    uploaded_by=uploaded_by or current_user,
                    upload_notes=upload_notes
                ))
            
            staging_result = await StagingService.stage_questions(batch_id, staged_questions)
            
            # Run duplicate detection
            duplicate_result = await StagingService.detect_duplicates(batch_id)
            
            # Return staging result in expected format
            return {
                "success": True,
                "message": "Questions uploaded to staging for review",
                "batchId": batch_id,
                "totalAttempted": len(questions),
                "successfulUploads": staging_result.get('question_ids', []),
                "failedUploads": [],
                "errors": {},
                "warnings": validation_result.warnings,
                "duplicateCount": duplicate_result['duplicates_found'],
                "reviewUrl": f"/review/batch/{batch_id}",
                "nextSteps": "Please review the questions in the staging area before importing to production"
            }
        
        # Legacy direct upload (if staging disabled)
        upload_result = BatchUploadResult(
            total_attempted=len(questions),
            successful_uploads=[],
            failed_uploads=[],
            errors={},
            warnings=validation_result.warnings
        )
        
        # Upload questions individually
        for question in questions:
            try:
                # Generate unique ID
                unique_id = await id_generator.generate_unique_question_id(
                    question.topic,  # Use topic from question, not parameter
                    question.subtopic, 
                    question.difficulty, 
                    question.type, 
                    supabase
                )
                
                # Create question object for database
                # Generate short timestamp for updated_at
                eastern = timezone(timedelta(hours=-5))  # EST/EDT handling
                now = datetime.now(eastern)
                month = f"{now.month:02d}"
                day = f"{now.day:02d}"
                year = str(now.year)[-2:]
                hour = now.hour
                minute = f"{now.minute:02d}"
                ampm = "AM" if hour < 12 else "PM"
                hour = hour % 12
                hour = 12 if hour == 0 else hour
                updated_at_timestamp = f"{month}/{day}/{year} {hour}:{minute}{ampm} ET"
                
                db_question = {
                    "question_id": unique_id,
                    "topic": question.topic,  # Use topic from question
                    "subtopic": question.subtopic,
                    "difficulty": question.difficulty,
                    "type": question.type,
                    "question": question.question,
                    "answer": question.answer,
                    "notes_for_tutor": question.notes_for_tutor,
                    "uploaded_on": uploaded_on,
                    "uploaded_by": uploaded_by,
                    "upload_notes": upload_notes,
                    "updated_at": updated_at_timestamp
                }
                
                # Insert into database
                result = supabase.table('all_questions').insert(db_question).execute()
                
                if result.data:
                    upload_result.successful_uploads.append(unique_id)
                else:
                    upload_result.failed_uploads.append(unique_id)
                    upload_result.errors[unique_id] = "Database insert returned no data"
                    
            except Exception as e:
                # Handle individual question failure
                error_message = categorize_database_error(e, unique_id if 'unique_id' in locals() else "unknown")
                upload_result.failed_uploads.append(unique_id if 'unique_id' in locals() else f"question_{len(upload_result.failed_uploads) + 1}")
                upload_result.errors[unique_id if 'unique_id' in locals() else f"question_{len(upload_result.failed_uploads)}"] = error_message
        
        # Check for duplicates (non-blocking)
        duplicate_info = {"count": 0, "groups": []}
        if upload_result.successful_uploads:
            try:
                duplicate_info = await duplicate_service.detect_duplicates(
                    upload_result.successful_uploads
                )
            except Exception as e:
                # Don't fail upload if duplicate detection fails
                print(f"Duplicate detection failed: {str(e)}")
        
        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)
        
        return BatchUploadResultModel(
            total_attempted=upload_result.total_attempted,
            successful_uploads=upload_result.successful_uploads,
            failed_uploads=upload_result.failed_uploads,
            errors=upload_result.errors,
            warnings=upload_result.warnings,
            processing_time_ms=processing_time,
            duplicate_count=duplicate_info.get('count', 0),
            duplicate_groups=duplicate_info.get('groups', [])
        )
        
    except HTTPException:
        raise
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding error. Please ensure file is UTF-8 encoded.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload processing error: {str(e)}")


@router.post("/topics/{topic}/questions/batch-replace")
async def batch_replace_questions(
    topic: str,
    questions: List[ParsedQuestionFromAI],
    current_user: str = Depends(get_current_user)
):
    """
    @api POST /api/topics/{topic}/questions/batch-replace
    @description Replaces all questions for a topic with new questions (legacy endpoint for compatibility)
    @param topic: Topic name
    @param questions: List of questions to replace existing ones
    @returns: Success message with count
    @authentication: Required JWT token in Authorization header
    @errors:
        - 401: Invalid or missing JWT token
        - 500: Database operation error
    """
    try:
        # Delete existing questions for this topic
        delete_result = supabase.table('all_questions').delete().eq('topic', topic).execute()
        
        # Process new questions
        upload_result = BatchUploadResult(
            total_attempted=len(questions),
            successful_uploads=[],
            failed_uploads=[],
            errors={},
            warnings=[]
        )
        
        # Upload new questions
        for question in questions:
            try:
                # Generate unique ID
                unique_id = await id_generator.generate_unique_question_id(
                    question.topic,  # Use topic from question, not parameter
                    question.subtopic, 
                    question.difficulty, 
                    question.type, 
                    supabase
                )
                
                # Create question object
                # Generate short timestamp for updated_at
                eastern = timezone(timedelta(hours=-5))  # EST/EDT handling
                now = datetime.now(eastern)
                month = f"{now.month:02d}"
                day = f"{now.day:02d}"
                year = str(now.year)[-2:]
                hour = now.hour
                minute = f"{now.minute:02d}"
                ampm = "AM" if hour < 12 else "PM"
                hour = hour % 12
                hour = 12 if hour == 0 else hour
                updated_at_timestamp = f"{month}/{day}/{year} {hour}:{minute}{ampm} ET"
                
                db_question = {
                    "question_id": unique_id,
                    "topic": question.topic,  # Use topic from question
                    "subtopic": question.subtopic,
                    "difficulty": question.difficulty,
                    "type": question.type,
                    "question": question.question,
                    "answer": question.answer,
                    "updated_at": updated_at_timestamp
                }
                
                # Insert into database
                result = supabase.table('all_questions').insert(db_question).execute()
                
                if result.data:
                    upload_result.successful_uploads.append(unique_id)
                else:
                    upload_result.failed_uploads.append(unique_id)
                    upload_result.errors[unique_id] = "Database insert failed"
                    
            except Exception as e:
                error_message = categorize_database_error(e, unique_id if 'unique_id' in locals() else "unknown")
                upload_result.failed_uploads.append(unique_id if 'unique_id' in locals() else f"question_{len(upload_result.failed_uploads) + 1}")
                upload_result.errors[unique_id if 'unique_id' in locals() else f"question_{len(upload_result.failed_uploads)}"] = error_message
        
        return {
            "message": f"Batch replace completed for topic '{topic}'",
            "successful_count": len(upload_result.successful_uploads),
            "failed_count": len(upload_result.failed_uploads),
            "errors": upload_result.errors if upload_result.failed_uploads else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch replace failed: {str(e)}")
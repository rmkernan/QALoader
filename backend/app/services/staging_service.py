"""
@file backend/app/services/staging_service.py
@description Service layer for staging workflow operations including batch management, duplicate detection, and import operations
@created June 20, 2025. 10:01 AM Eastern Time
@updated June 20, 2025. 10:01 AM Eastern Time - Initial creation with comprehensive staging operations
@updated June 20, 2025. 12:16 PM Eastern Time - Fixed question insertion issue and added error logging
@updated June 20, 2025. 4:54 PM Eastern Time - Fixed duplicate ID generation within batch by tracking IDs per batch

@architectural-context
Layer: Service (Business Logic)
Dependencies: supabase-py (database), datetime, logging, typing
Pattern: Service layer with transactional operations and error handling

@workflow-context
User Journey: Staging workflow for question review before production
Sequence Position: Called by staging routers to handle batch and review operations
Inputs: Batch data, question data, review decisions
Outputs: Database operations results with proper error handling

@authentication-context
Auth Requirements: All operations require authenticated user context
Security: User email tracked for all operations, audit trail maintained

@database-context
Tables: upload_batches, staged_questions, staging_duplicates, all_questions
Operations: Complex transactions for batch operations, duplicate detection, import
Transactions: Uses database transactions for data consistency
"""

import logging
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Any
import json

from ..database import supabase
from ..models.staging import (
    BatchStatus,
    QuestionStatus,
    DuplicateResolution,
    UploadBatch,
    UploadBatchCreate,
    StagedQuestion,
    StagedQuestionCreate,
    StagingDuplicate
)
from ..utils.id_generator import id_generator

logger = logging.getLogger(__name__)


class StagingService:
    """
    @class StagingService
    @description Handles all staging workflow operations including batch management and review
    """

    @staticmethod
    async def create_batch(batch_data: UploadBatchCreate) -> Dict[str, Any]:
        """
        @function create_batch
        @description Creates a new upload batch for staging questions
        @param batch_data: Upload batch creation data
        @returns: Created batch with generated ID
        @raises Exception: On database operation failure
        """
        try:
            # Create batch record (batch_id will be auto-generated as UUID)
            batch_record = {
                "uploaded_by": batch_data.uploaded_by,
                "uploaded_at": datetime.utcnow().isoformat(),
                "file_name": batch_data.file_name,
                "total_questions": batch_data.total_questions,
                "questions_pending": batch_data.total_questions,
                "questions_approved": 0,
                "questions_rejected": 0,
                "questions_duplicate": 0,
                "status": BatchStatus.PENDING,
                "notes": batch_data.notes
            }
            
            result = supabase.table("upload_batches").insert(batch_record).execute()
            
            if not result.data:
                raise Exception("Failed to create upload batch")
                
            logger.info(f"Created upload batch {result.data[0]['batch_id']} with {batch_data.total_questions} questions")
            return result.data[0]
            
        except Exception as e:
            logger.error(f"Error creating batch: {str(e)}")
            raise

    @staticmethod
    async def stage_questions(batch_id: str, questions: List[StagedQuestionCreate]) -> Dict[str, Any]:
        """
        @function stage_questions
        @description Stages questions for review in a batch
        @param batch_id: ID of the upload batch
        @param questions: List of questions to stage
        @returns: Summary of staged questions
        @raises Exception: On database operation failure
        """
        try:
            staged_records = []
            current_time = datetime.utcnow()
            
            logger.info(f"Starting to stage {len(questions)} questions for batch {batch_id}")
            
            # Track generated IDs within this batch to avoid duplicates
            batch_id_tracker = {}
            
            for i, question in enumerate(questions):
                try:
                    logger.debug(f"Processing question {i+1}: {question.topic} - {question.subtopic}")
                    
                    # Generate base ID
                    base_id = id_generator.generate_question_id(
                        question.topic,
                        question.subtopic,
                        question.difficulty,
                        question.type
                    )
                    
                    # Check if we've seen this base ID in this batch
                    if base_id not in batch_id_tracker:
                        # First time seeing this base ID in batch, get sequence from database
                        sequence = await id_generator.get_next_sequence(base_id, supabase)
                        batch_id_tracker[base_id] = sequence
                    else:
                        # We've seen this base ID before in this batch, increment
                        batch_id_tracker[base_id] += 1
                        sequence = batch_id_tracker[base_id]
                    
                    # Generate the full question ID
                    question_id = f"{base_id}-{sequence:03d}"
                    
                    logger.debug(f"Generated question ID: {question_id}")
                    
                    # Format uploaded_on timestamp
                    uploaded_on = current_time.strftime("%m/%d/%y %-I:%M%p ET")
                    
                    staged_record = {
                        "question_id": question_id,
                        "upload_batch_id": batch_id,
                        "topic": question.topic,
                        "subtopic": question.subtopic,
                        "difficulty": question.difficulty,
                        "type": question.type,
                        "question": question.question,
                        "answer": question.answer,
                        "notes_for_tutor": question.notes_for_tutor,
                        "status": QuestionStatus.PENDING,
                        "created_at": current_time.isoformat(),
                        "uploaded_by": question.uploaded_by,
                        "uploaded_on": uploaded_on,
                        "upload_notes": question.upload_notes
                    }
                    
                    staged_records.append(staged_record)
                    logger.debug(f"Prepared staged record for {question_id}")
                    
                except Exception as e:
                    logger.error(f"Error preparing question {i+1}: {str(e)}")
                    logger.error(f"Question data: {question}")
                    raise
            
            logger.info(f"Prepared {len(staged_records)} staged records, inserting into database...")
            
            # Check for duplicate IDs within the batch
            ids_in_batch = [r['question_id'] for r in staged_records]
            if len(ids_in_batch) != len(set(ids_in_batch)):
                # Find duplicates
                seen = set()
                duplicates = []
                for id in ids_in_batch:
                    if id in seen:
                        duplicates.append(id)
                    seen.add(id)
                logger.error(f"Duplicate IDs found within batch: {duplicates}")
                raise Exception(f"Duplicate question IDs generated within batch: {duplicates}")
            
            # Bulk insert staged questions
            try:
                result = supabase.table("staged_questions").insert(staged_records).execute()
                logger.info(f"Database insert completed. Result: {result}")
                
                if not result.data:
                    logger.error("Database insert returned no data")
                    logger.error(f"Result object: {result}")
                    raise Exception("Failed to stage questions - no data returned from database")
                
                logger.info(f"Successfully staged {len(result.data)} questions for batch {batch_id}")
                
                return {
                    "batch_id": batch_id,
                    "staged_count": len(result.data),
                    "question_ids": [q["question_id"] for q in result.data]
                }
                
            except Exception as e:
                logger.error(f"Database insert failed: {str(e)}")
                # Only log question IDs, not full records
                logger.error(f"Question IDs being inserted: {[r['question_id'] for r in staged_records]}")
                raise
            
        except Exception as e:
            logger.error(f"Error staging questions for batch {batch_id}: {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise

    @staticmethod
    async def detect_duplicates(batch_id: str, threshold: float = 0.65) -> Dict[str, Any]:
        """
        @function detect_duplicates
        @description Detects duplicate questions using pg_trgm similarity
        @param batch_id: ID of the batch to check
        @param threshold: Similarity threshold (0-1)
        @returns: Summary of duplicate detection results
        @raises Exception: On database operation failure
        """
        try:
            # Get staged questions for the batch
            staged_result = supabase.table("staged_questions")\
                .select("*")\
                .eq("upload_batch_id", batch_id)\
                .eq("status", QuestionStatus.PENDING)\
                .execute()
            
            if not staged_result.data:
                return {"duplicates_found": 0, "questions_checked": 0}
            
            staged_questions = staged_result.data
            duplicate_records = []
            questions_marked_duplicate = set()
            
            # Check each staged question against existing questions
            for staged in staged_questions:
                # Skip if already marked as duplicate
                if staged["question_id"] in questions_marked_duplicate:
                    continue
                    
                # Build similarity query
                search_text = f"{staged['topic']} {staged['subtopic']} {staged['question']}"
                
                # Find similar questions using RPC function
                similar_result = supabase.rpc(
                    "find_similar_questions",
                    {
                        "search_text": search_text,
                        "threshold": threshold,
                        "limit_count": 5
                    }
                ).execute()
                
                if similar_result.data:
                    for similar in similar_result.data:
                        duplicate_id = f"dup_{datetime.utcnow().strftime('%Y%m%d')}_{len(duplicate_records) + 1:04d}"
                        
                        duplicate_record = {
                            "duplicate_id": duplicate_id,
                            "staged_question_id": staged["question_id"],
                            "existing_question_id": similar["question_id"],
                            "similarity_score": round(similar["similarity_score"], 3),
                            "resolution": DuplicateResolution.PENDING,
                            "created_at": datetime.utcnow().isoformat()
                        }
                        
                        duplicate_records.append(duplicate_record)
                        questions_marked_duplicate.add(staged["question_id"])
                        
                        # Update staged question status
                        supabase.table("staged_questions")\
                            .update({
                                "status": QuestionStatus.DUPLICATE,
                                "duplicate_of": similar["question_id"],
                                "similarity_score": round(similar["similarity_score"], 3)
                            })\
                            .eq("question_id", staged["question_id"])\
                            .execute()
            
            # Insert duplicate records if any found
            if duplicate_records:
                supabase.table("staging_duplicates").insert(duplicate_records).execute()
            
            # Update batch counts
            await StagingService.update_batch_counts(batch_id)
            
            logger.info(f"Duplicate detection for batch {batch_id}: {len(duplicate_records)} duplicates found")
            
            return {
                "batch_id": batch_id,
                "questions_checked": len(staged_questions),
                "duplicates_found": len(duplicate_records),
                "duplicate_groups": len(questions_marked_duplicate)
            }
            
        except Exception as e:
            logger.error(f"Error detecting duplicates: {str(e)}")
            # Fallback to simple text matching if pg_trgm fails
            return await StagingService._detect_duplicates_fallback(batch_id, threshold)

    @staticmethod
    async def _detect_duplicates_fallback(batch_id: str, threshold: float) -> Dict[str, Any]:
        """
        @function _detect_duplicates_fallback
        @description Fallback duplicate detection using simple text matching
        @param batch_id: ID of the batch to check
        @param threshold: Not used in fallback
        @returns: Summary of duplicate detection results
        """
        try:
            # Get staged questions
            staged_result = supabase.table("staged_questions")\
                .select("*")\
                .eq("upload_batch_id", batch_id)\
                .eq("status", QuestionStatus.PENDING)\
                .execute()
            
            if not staged_result.data:
                return {"duplicates_found": 0, "questions_checked": 0}
            
            # Get all existing questions
            existing_result = supabase.table("all_questions")\
                .select("question_id, topic, subtopic, question")\
                .execute()
            
            if not existing_result.data:
                return {"duplicates_found": 0, "questions_checked": len(staged_result.data)}
            
            duplicate_records = []
            questions_marked_duplicate = set()
            
            # Simple text comparison
            for staged in staged_result.data:
                staged_text = f"{staged['topic']} {staged['subtopic']} {staged['question']}".lower()
                
                for existing in existing_result.data:
                    existing_text = f"{existing['topic']} {existing['subtopic']} {existing['question']}".lower()
                    
                    # Simple exact match on question text
                    if staged['question'].lower().strip() == existing['question'].lower().strip():
                        duplicate_id = f"dup_{datetime.utcnow().strftime('%Y%m%d')}_{len(duplicate_records) + 1:04d}"
                        
                        duplicate_record = {
                            "duplicate_id": duplicate_id,
                            "staged_question_id": staged["question_id"],
                            "existing_question_id": existing["question_id"],
                            "similarity_score": 1.0,  # Exact match
                            "resolution": DuplicateResolution.PENDING,
                            "created_at": datetime.utcnow().isoformat()
                        }
                        
                        duplicate_records.append(duplicate_record)
                        questions_marked_duplicate.add(staged["question_id"])
                        
                        # Update staged question
                        supabase.table("staged_questions")\
                            .update({
                                "status": QuestionStatus.DUPLICATE,
                                "duplicate_of": existing["question_id"],
                                "similarity_score": 1.0
                            })\
                            .eq("question_id", staged["question_id"])\
                            .execute()
                        
                        break  # Found duplicate, no need to check more
            
            if duplicate_records:
                supabase.table("staging_duplicates").insert(duplicate_records).execute()
            
            await StagingService.update_batch_counts(batch_id)
            
            return {
                "batch_id": batch_id,
                "questions_checked": len(staged_result.data),
                "duplicates_found": len(duplicate_records),
                "duplicate_groups": len(questions_marked_duplicate),
                "method": "fallback"
            }
            
        except Exception as e:
            logger.error(f"Error in fallback duplicate detection: {str(e)}")
            raise

    @staticmethod
    async def update_batch_counts(batch_id: str) -> None:
        """
        @function update_batch_counts
        @description Updates question counts for a batch based on current status
        @param batch_id: ID of the batch to update
        @raises Exception: On database operation failure
        """
        try:
            # Get current status counts
            staged_result = supabase.table("staged_questions")\
                .select("status")\
                .eq("upload_batch_id", batch_id)\
                .execute()
            
            if not staged_result.data:
                return
            
            # Count by status
            status_counts = {
                "questions_pending": 0,
                "questions_approved": 0,
                "questions_rejected": 0,
                "questions_duplicate": 0
            }
            
            for question in staged_result.data:
                status = question["status"]
                if status == QuestionStatus.PENDING:
                    status_counts["questions_pending"] += 1
                elif status == QuestionStatus.APPROVED:
                    status_counts["questions_approved"] += 1
                elif status == QuestionStatus.REJECTED:
                    status_counts["questions_rejected"] += 1
                elif status == QuestionStatus.DUPLICATE:
                    status_counts["questions_duplicate"] += 1
            
            # Update batch
            supabase.table("upload_batches")\
                .update(status_counts)\
                .eq("batch_id", batch_id)\
                .execute()
                
        except Exception as e:
            logger.error(f"Error updating batch counts: {str(e)}")

    @staticmethod
    async def get_batch_questions(batch_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        @function get_batch_questions
        @description Retrieves questions for a batch with optional status filter
        @param batch_id: ID of the batch
        @param status: Optional status filter
        @returns: List of staged questions
        @raises Exception: On database operation failure
        """
        try:
            query = supabase.table("staged_questions")\
                .select("*")\
                .eq("upload_batch_id", batch_id)\
                .order("created_at")
            
            if status:
                query = query.eq("status", status)
            
            result = query.execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Error getting batch questions: {str(e)}")
            raise

    @staticmethod
    async def approve_questions(
        batch_id: str, 
        question_ids: List[str], 
        reviewed_by: str,
        review_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        @function approve_questions
        @description Marks questions as approved for import
        @param batch_id: ID of the batch
        @param question_ids: List of staged question IDs to approve
        @param reviewed_by: Email of the reviewer
        @param review_notes: Optional review notes
        @returns: Summary of approval operation
        @raises Exception: On database operation failure
        """
        try:
            update_data = {
                "status": QuestionStatus.APPROVED,
                "reviewed_by": reviewed_by,
                "reviewed_at": datetime.utcnow().isoformat(),
                "review_notes": review_notes
            }
            
            result = supabase.table("staged_questions")\
                .update(update_data)\
                .eq("upload_batch_id", batch_id)\
                .in_("question_id", question_ids)\
                .execute()
            
            if not result.data:
                raise Exception("Failed to approve questions")
            
            # Update batch counts
            await StagingService.update_batch_counts(batch_id)
            
            # Update batch status if this is the first review
            batch_result = supabase.table("upload_batches")\
                .select("status, review_started_at")\
                .eq("batch_id", batch_id)\
                .single()\
                .execute()
            
            if batch_result.data and not batch_result.data["review_started_at"]:
                supabase.table("upload_batches")\
                    .update({
                        "status": BatchStatus.REVIEWING,
                        "review_started_at": datetime.utcnow().isoformat()
                    })\
                    .eq("batch_id", batch_id)\
                    .execute()
            
            logger.info(f"Approved {len(result.data)} questions in batch {batch_id}")
            
            return {
                "batch_id": batch_id,
                "approved_count": len(result.data),
                "approved_ids": [q["question_id"] for q in result.data]
            }
            
        except Exception as e:
            logger.error(f"Error approving questions: {str(e)}")
            raise

    @staticmethod
    async def reject_questions(
        batch_id: str,
        question_ids: List[str],
        reviewed_by: str,
        review_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        @function reject_questions
        @description Marks questions as rejected
        @param batch_id: ID of the batch
        @param question_ids: List of staged question IDs to reject
        @param reviewed_by: Email of the reviewer
        @param review_notes: Optional review notes
        @returns: Summary of rejection operation
        @raises Exception: On database operation failure
        """
        try:
            update_data = {
                "status": QuestionStatus.REJECTED,
                "reviewed_by": reviewed_by,
                "reviewed_at": datetime.utcnow().isoformat(),
                "review_notes": review_notes
            }
            
            result = supabase.table("staged_questions")\
                .update(update_data)\
                .eq("upload_batch_id", batch_id)\
                .in_("question_id", question_ids)\
                .execute()
            
            if not result.data:
                raise Exception("Failed to reject questions")
            
            # Update batch counts
            await StagingService.update_batch_counts(batch_id)
            
            logger.info(f"Rejected {len(result.data)} questions in batch {batch_id}")
            
            return {
                "batch_id": batch_id,
                "rejected_count": len(result.data),
                "rejected_ids": [q["question_id"] for q in result.data]
            }
            
        except Exception as e:
            logger.error(f"Error rejecting questions: {str(e)}")
            raise

    @staticmethod
    async def import_approved(batch_id: str, imported_by: str) -> Dict[str, Any]:
        """
        @function import_approved
        @description Imports approved questions to production all_questions table
        @param batch_id: ID of the batch to import
        @param imported_by: Email of the user performing import
        @returns: Summary of import operation
        @raises Exception: On database operation failure
        """
        try:
            # Update batch status
            supabase.table("upload_batches")\
                .update({
                    "status": BatchStatus.REVIEWING,
                    "import_started_at": datetime.utcnow().isoformat()
                })\
                .eq("batch_id", batch_id)\
                .execute()
            
            # Get approved questions
            approved_result = supabase.table("staged_questions")\
                .select("*")\
                .eq("upload_batch_id", batch_id)\
                .eq("status", QuestionStatus.APPROVED)\
                .execute()
            
            if not approved_result.data:
                return {
                    "imported_count": 0,
                    "failed_count": 0,
                    "message": "No approved questions to import"
                }
            
            imported_ids = []
            failed_ids = []
            errors = {}
            
            # Import each approved question
            for staged in approved_result.data:
                try:
                    # Prepare production record
                    production_record = {
                        "question_id": staged["question_id"],
                        "topic": staged["topic"],
                        "subtopic": staged["subtopic"],
                        "difficulty": staged["difficulty"],
                        "type": staged["type"],
                        "question": staged["question"],
                        "answer": staged["answer"],
                        "notes_for_tutor": staged["notes_for_tutor"],
                        "uploaded_by": staged["uploaded_by"],
                        "uploaded_on": staged["uploaded_on"],
                        "upload_notes": staged["upload_notes"],
                        "updated_at": datetime.utcnow().strftime("%m/%d/%y %I:%M%p ET")
                    }
                    
                    # Insert into production
                    insert_result = supabase.table("all_questions")\
                        .insert(production_record)\
                        .execute()
                    
                    if insert_result.data:
                        imported_ids.append(staged["question_id"])
                        
                        # Mark staged question as imported to prevent re-import
                        supabase.table("staged_questions")\
                            .update({"status": QuestionStatus.IMPORTED})\
                            .eq("question_id", staged["question_id"])\
                            .execute()
                    else:
                        failed_ids.append(staged["question_id"])
                        errors[staged["question_id"]] = "Insert failed"
                        
                except Exception as e:
                    failed_ids.append(staged["question_id"])
                    errors[staged["question_id"]] = str(e)
                    logger.error(f"Error importing question {staged['question_id']}: {str(e)}")
                    print(f"[DEBUG] Import error for {staged['question_id']}: {str(e)}")
                    import traceback
                    traceback.print_exc()
            
            # Update batch status
            final_status = BatchStatus.COMPLETED if len(failed_ids) == 0 else BatchStatus.CANCELLED
            
            supabase.table("upload_batches")\
                .update({
                    "status": final_status,
                    "import_completed_at": datetime.utcnow().isoformat(),
                    "reviewed_by": imported_by
                })\
                .eq("batch_id", batch_id)\
                .execute()
            
            # Final count update
            await StagingService.update_batch_counts(batch_id)
            
            logger.info(f"Import completed for batch {batch_id}: {len(imported_ids)} imported, {len(failed_ids)} failed")
            
            return {
                "batch_id": batch_id,
                "imported_count": len(imported_ids),
                "failed_count": len(failed_ids),
                "imported_ids": imported_ids,
                "failed_ids": failed_ids,
                "errors": errors,
                "message": f"{len(imported_ids)} questions imported successfully"
            }
            
        except Exception as e:
            logger.error(f"Error importing approved questions: {str(e)}")
            print(f"[DEBUG] Critical import error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Update batch status to failed
            supabase.table("upload_batches")\
                .update({
                    "status": BatchStatus.CANCELLED,
                    "import_completed_at": datetime.utcnow().isoformat()
                })\
                .eq("batch_id", batch_id)\
                .execute()
            
            raise
"""
Test script for staging workflow functionality
Created: June 20, 2025. 10:07 AM Eastern Time
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test imports
try:
    from app.database import supabase
    from app.models.staging import (
        UploadBatchCreate,
        StagedQuestionCreate,
        BatchStatus,
        QuestionStatus
    )
    from app.services.staging_service import StagingService
    print("✓ All imports successful")
except Exception as e:
    print(f"✗ Import error: {e}")
    exit(1)

async def test_staging_workflow():
    """Test the complete staging workflow"""
    
    print("\n=== Testing Staging Workflow ===\n")
    
    # Clean up any existing test data
    print("0. Cleaning up any existing test data...")
    supabase.table("staged_questions")\
        .delete()\
        .eq("topic", "Testing")\
        .execute()
    print("   ✓ Cleanup complete")
    
    try:
        # 1. Create a test batch
        print("1. Creating test batch...")
        batch_data = UploadBatchCreate(
            file_name="test_questions.md",
            total_questions=3,
            uploaded_by="test@example.com",
            notes="Test batch for staging workflow"
        )
        
        batch = await StagingService.create_batch(batch_data)
        batch_id = batch['batch_id']
        print(f"   ✓ Batch created: {batch_id}")
        
        # 2. Stage test questions
        print("\n2. Staging test questions...")
        test_questions = [
            StagedQuestionCreate(
                upload_batch_id=batch_id,
                topic="Testing",
                subtopic="Unit Tests",
                difficulty="Basic",
                type="Definition",
                question="What is unit testing?",
                answer="Unit testing is a software testing method where individual units of source code are tested.",
                uploaded_by="test@example.com",
                upload_notes="Test question 1"
            ),
            StagedQuestionCreate(
                upload_batch_id=batch_id,
                topic="Testing",
                subtopic="Integration Tests",
                difficulty="Advanced",
                type="Problem",
                question="How do you design an integration test suite?",
                answer="Integration test suites should cover component interactions...",
                uploaded_by="test@example.com",
                upload_notes="Test question 2"
            ),
            StagedQuestionCreate(
                upload_batch_id=batch_id,
                topic="Testing",
                subtopic="Performance Tests",
                difficulty="Advanced",
                type="Problem",
                question="How do you optimize test performance?",
                answer="Test performance can be optimized through parallel execution...",
                uploaded_by="test@example.com",
                upload_notes="Test question 3"
            )
        ]
        
        staging_result = await StagingService.stage_questions(batch_id, test_questions)
        print(f"   ✓ Staged {staging_result['staged_count']} questions")
        
        # 3. Run duplicate detection
        print("\n3. Running duplicate detection...")
        duplicate_result = await StagingService.detect_duplicates(batch_id)
        print(f"   ✓ Checked {duplicate_result['questions_checked']} questions")
        print(f"   ✓ Found {duplicate_result['duplicates_found']} duplicates")
        
        # 4. Get batch questions
        print("\n4. Retrieving batch questions...")
        questions = await StagingService.get_batch_questions(batch_id)
        print(f"   ✓ Retrieved {len(questions)} questions")
        for q in questions:
            print(f"      - {q['topic']}/{q['subtopic']}: {q['status']}")
        
        # 5. Approve non-duplicate questions
        print("\n5. Approving non-duplicate questions...")
        non_duplicate_ids = [q['question_id'] for q in questions if q['status'] != 'duplicate']
        if non_duplicate_ids:
            approval_result = await StagingService.approve_questions(
                batch_id,
                non_duplicate_ids,
                "test@example.com",
                "Approved for testing"
            )
            print(f"   ✓ Approved {approval_result['approved_count']} questions")
        
        # 6. Check batch status
        print("\n6. Checking batch status...")
        batch_result = supabase.table("upload_batches")\
            .select("*")\
            .eq("batch_id", batch_id)\
            .single()\
            .execute()
        
        if batch_result.data:
            batch_data = batch_result.data
            print(f"   ✓ Batch status: {batch_data['status']}")
            print(f"   ✓ Pending: {batch_data['questions_pending']}")
            print(f"   ✓ Approved: {batch_data['questions_approved']}")
            print(f"   ✓ Duplicates: {batch_data['questions_duplicate']}")
        
        print("\n✅ All staging workflow tests passed!")
        
        # Cleanup - remove test batch
        print("\n7. Cleaning up test data...")
        # Delete staged questions
        supabase.table("staged_questions")\
            .delete()\
            .eq("upload_batch_id", batch_id)\
            .execute()
        
        # Delete duplicates
        supabase.table("staging_duplicates")\
            .delete()\
            .in_("staged_question_id", [q['question_id'] for q in questions])\
            .execute()
        
        # Delete batch
        supabase.table("upload_batches")\
            .delete()\
            .eq("batch_id", batch_id)\
            .execute()
        
        print("   ✓ Test data cleaned up")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_staging_workflow())
#!/usr/bin/env python3
"""
@file backend/test_database.py
@description Database operations testing script for Q&A Loader. Tests table creation, data insertion, and retrieval operations.
@created 2025.06.09 4:19 PM ET
@updated 2025.06.09 4:19 PM ET - Initial creation with comprehensive database testing

@architectural-context
Layer: Testing Utility
Dependencies: app.database (Supabase client), app.models.question (data models), datetime (timestamps)
Pattern: Integration testing with real database operations and validation

@workflow-context
User Journey: Database validation and testing workflow
Sequence Position: Run after table creation to verify database operations work correctly
Inputs: Supabase connection and test data
Outputs: Test results and validation of database operations

@authentication-context
Auth Requirements: Uses configured Supabase service role key
Security: Only performs safe read/write operations for testing

@database-context
Tables: Tests all_questions and activity_log tables
Operations: INSERT, SELECT, UPDATE, DELETE operations with validation
Transactions: Tests individual operations and error handling
"""

import asyncio
from datetime import datetime
from app.database import supabase
from app.models.question import Question, QuestionCreate, ActivityLogItem

async def test_database_operations():
    """
    @function test_database_operations
    @description Comprehensive test of database operations including question CRUD and activity logging
    @returns: None
    @example:
        # Run database tests
        await test_database_operations()
    """
    print("🧪 Testing Database Operations...")
    print("=" * 50)
    
    if not supabase:
        print("❌ Database not configured. Please check your .env file.")
        return
    
    try:
        # Test 1: Verify tables exist
        print("\n1️⃣ Testing table existence...")
        
        # Test all_questions table
        questions_result = supabase.table('all_questions').select('question_id').limit(1).execute()
        print("✅ all_questions table accessible")
        
        # Test activity_log table
        activity_result = supabase.table('activity_log').select('id').limit(1).execute()
        print("✅ activity_log table accessible")
        
        # Test 2: Insert test question
        print("\n2️⃣ Testing question insertion...")
        
        test_question = {
            'question_id': 'TEST-DB-D-001',
            'topic': 'Testing',
            'subtopic': 'Database Operations',
            'difficulty': 'Basic',
            'type': 'Definition',
            'question': 'What is a database test?',
            'answer': 'A database test verifies that database operations work correctly.',
            'notes_for_tutor': 'This is a test question for validation'
        }
        
        # Insert test question
        insert_result = supabase.table('all_questions').insert(test_question).execute()
        if insert_result.data:
            print("✅ Question inserted successfully")
            print(f"   Question ID: {test_question['question_id']}")
        else:
            print(f"❌ Question insertion failed: {insert_result}")
            return
        
        # Test 3: Query test question
        print("\n3️⃣ Testing question retrieval...")
        
        query_result = supabase.table('all_questions').select('*').eq('question_id', 'TEST-DB-D-001').execute()
        if query_result.data and len(query_result.data) > 0:
            retrieved_question = query_result.data[0]
            print("✅ Question retrieved successfully")
            print(f"   Topic: {retrieved_question['topic']}")
            print(f"   Question: {retrieved_question['question'][:50]}...")
        else:
            print("❌ Question retrieval failed")
            return
        
        # Test 4: Insert activity log
        print("\n4️⃣ Testing activity log insertion...")
        
        activity_entry = {
            'action': 'Database Test',
            'details': 'Testing database operations with test question TEST-DB-D-001'
        }
        
        activity_result = supabase.table('activity_log').insert(activity_entry).execute()
        if activity_result.data:
            print("✅ Activity log entry inserted successfully")
            activity_id = activity_result.data[0]['id']
            print(f"   Activity ID: {activity_id}")
        else:
            print(f"❌ Activity log insertion failed: {activity_result}")
        
        # Test 5: Query recent activity
        print("\n5️⃣ Testing activity log retrieval...")
        
        recent_activity = supabase.table('activity_log').select('*').order('timestamp', desc=True).limit(5).execute()
        if recent_activity.data:
            print(f"✅ Retrieved {len(recent_activity.data)} recent activity entries")
            for activity in recent_activity.data[:2]:  # Show first 2
                print(f"   - {activity['action']}: {activity['details'][:30]}...")
        else:
            print("❌ Activity log retrieval failed")
        
        # Test 6: Update test question
        print("\n6️⃣ Testing question update...")
        
        update_data = {
            'answer': 'An updated answer: A database test verifies that database operations work correctly and validates data integrity.',
            'updated_at': datetime.utcnow().isoformat()
        }
        
        update_result = supabase.table('all_questions').update(update_data).eq('question_id', 'TEST-DB-D-001').execute()
        if update_result.data:
            print("✅ Question updated successfully")
        else:
            print(f"❌ Question update failed: {update_result}")
        
        # Test 7: Search functionality
        print("\n7️⃣ Testing search functionality...")
        
        search_result = supabase.table('all_questions').select('*').eq('topic', 'Testing').execute()
        if search_result.data:
            print(f"✅ Search returned {len(search_result.data)} questions for topic 'Testing'")
        else:
            print("❌ Search functionality failed")
        
        # Test 8: Clean up test data
        print("\n8️⃣ Cleaning up test data...")
        
        delete_result = supabase.table('all_questions').delete().eq('question_id', 'TEST-DB-D-001').execute()
        if delete_result.data:
            print("✅ Test question deleted successfully")
        else:
            print("⚠️  Test question cleanup may have failed")
        
        print("\n" + "=" * 50)
        print("🎉 All database tests completed successfully!")
        print("✅ Database is ready for Phase 3 (Authentication)")
        
    except Exception as e:
        print(f"\n❌ Database test failed with error: {e}")
        print("Please check your Supabase configuration and table setup.")

async def test_pydantic_models():
    """
    @function test_pydantic_models
    @description Test Pydantic model validation and serialization
    @returns: None
    @example:
        # Test model validation
        await test_pydantic_models()
    """
    print("\n🔍 Testing Pydantic Models...")
    print("=" * 30)
    
    try:
        # Test QuestionCreate validation
        valid_question = QuestionCreate(
            topic="DCF",
            subtopic="WACC",
            difficulty="Basic",
            type="Definition",
            question="What is WACC?",
            answer="Weighted Average Cost of Capital",
            notes_for_tutor="Basic finance concept"
        )
        print("✅ QuestionCreate model validation passed")
        
        # Test invalid difficulty
        try:
            invalid_question = QuestionCreate(
                topic="DCF",
                subtopic="WACC", 
                difficulty="Invalid",
                type="Definition",
                question="Test",
                answer="Test"
            )
            print("❌ Validation should have failed for invalid difficulty")
        except ValueError:
            print("✅ Invalid difficulty correctly rejected")
        
        print("🎉 Pydantic model tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Pydantic model test failed: {e}")

if __name__ == "__main__":
    print("Q&A Loader Database Testing Suite")
    print("==================================")
    
    # Run tests
    asyncio.run(test_pydantic_models())
    asyncio.run(test_database_operations())
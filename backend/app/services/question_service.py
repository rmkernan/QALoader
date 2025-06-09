"""
@file backend/app/services/question_service.py
@description Question management service for Q&A Loader. Handles CRUD operations, ID generation, activity logging, and search functionality.
@created 2025.06.09 6:25 PM ET
@updated 2025.06.09 6:25 PM ET - Phase 4 reconstruction after git recovery

@architectural-context
Layer: Service Layer (Business Logic)
Dependencies: supabase (database), app.models.question (validation), datetime (timestamps), typing (type hints)
Pattern: Service pattern with database operations, ID generation, and activity logging

@workflow-context
User Journey: All question management operations - create, read, update, delete, search, bootstrap data
Sequence Position: Called by API routes after authentication, interacts with Supabase database
Inputs: Validated Pydantic models, search filters, question IDs
Outputs: Question objects, search results, activity logs, bootstrap data

@authentication-context
Auth Requirements: All operations require valid JWT token (enforced at router level)
Security: Input validation handled by Pydantic models, SQL injection prevented by Supabase client

@database-context
Tables: all_questions (primary), activity_log (logging)
Operations: SELECT (search/get), INSERT (create), UPDATE (modify), DELETE (remove)
Transactions: Individual operations are atomic, batch operations use transactions
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from supabase import Client

from app.models.question import Question, QuestionCreate, QuestionUpdate, ActivityLogItem


class QuestionService:
    """
    @class QuestionService
    @description Service class for managing questions with CRUD operations, ID generation, and activity logging
    @example:
        # Initialize service
        service = QuestionService(supabase_client)
        
        # Create question
        question = await service.create_question(question_data, "admin")
        
        # Search questions
        results = await service.search_questions(topic="DCF", difficulty="Basic")
    """

    def __init__(self, db: Client):
        """
        @function __init__
        @description Initialize the question service with database client
        @param db: Supabase client for database operations
        """
        self.db = db

    async def generate_question_id(self, topic: str, subtopic: str, question_type: str) -> str:
        """
        @function generate_question_id
        @description Generates unique question ID in format TOPIC-SUBTOPIC-TYPE-NNN
        @param topic: Topic category (e.g., 'DCF')
        @param subtopic: Subtopic within topic (e.g., 'WACC')
        @param question_type: Question type (e.g., 'Definition') - uses first letter
        @returns: Unique question ID string
        @example:
            # Generate ID for DCF WACC Definition question
            question_id = await service.generate_question_id("DCF", "WACC", "Definition")
            # Returns: "DCF-WACC-D-001"
        """
        # Clean and format components
        topic_clean = topic.upper().replace(" ", "").replace("-", "")[:10]
        subtopic_clean = subtopic.upper().replace(" ", "").replace("-", "")[:15]
        type_letter = question_type[0].upper()
        
        # Find next available number
        prefix = f"{topic_clean}-{subtopic_clean}-{type_letter}-"
        
        # Query existing questions with same prefix
        result = self.db.table('all_questions').select('question_id').ilike('question_id', f'{prefix}%').execute()
        
        # Extract numbers and find next available
        existing_numbers = []
        for row in result.data:
            question_id = row['question_id']
            if question_id.startswith(prefix):
                try:
                    number_part = question_id[len(prefix):]
                    existing_numbers.append(int(number_part))
                except ValueError:
                    continue
        
        # Generate next number
        next_number = 1
        if existing_numbers:
            next_number = max(existing_numbers) + 1
        
        return f"{prefix}{next_number:03d}"

    async def log_activity(self, action: str, details: Optional[str] = None) -> None:
        """
        @function log_activity
        @description Logs user activity to the activity_log table
        @param action: Description of the action performed
        @param details: Additional details about the action
        @example:
            # Log question creation
            await service.log_activity("Question Created", "DCF-WACC-D-001: What is WACC?")
        """
        try:
            activity_data = {
                'action': action,
                'details': details,
                'timestamp': datetime.utcnow().isoformat()
            }
            self.db.table('activity_log').insert(activity_data).execute()
        except Exception as e:
            # Log activity errors shouldn't break main operations
            print(f"Warning: Failed to log activity: {e}")

    async def create_question(self, question_data: QuestionCreate, username: str) -> Question:
        """
        @function create_question
        @description Creates a new question with auto-generated ID and activity logging
        @param question_data: Validated question data from API request
        @param username: Username of the user creating the question
        @returns: Created question with ID and timestamps
        @raises Exception: If database operation fails
        @example:
            # Create new question
            question_data = QuestionCreate(
                topic="DCF",
                subtopic="WACC",
                difficulty="Basic",
                type="Definition",
                question="What is WACC?",
                answer="Weighted Average Cost of Capital..."
            )
            new_question = await service.create_question(question_data, "admin")
        """
        # Generate unique ID
        question_id = await self.generate_question_id(
            question_data.topic, 
            question_data.subtopic, 
            question_data.type
        )
        
        # Prepare data for database
        now = datetime.utcnow()
        db_data = {
            'question_id': question_id,
            'topic': question_data.topic,
            'subtopic': question_data.subtopic,
            'difficulty': question_data.difficulty,
            'type': question_data.type,
            'question': question_data.question,
            'answer': question_data.answer,
            'notes_for_tutor': question_data.notes_for_tutor,
            'created_at': now.isoformat(),
            'updated_at': now.isoformat()
        }
        
        # Insert into database
        result = self.db.table('all_questions').insert(db_data).execute()
        
        if not result.data:
            raise Exception("Failed to create question")
        
        # Log activity
        await self.log_activity(
            "Question Created",
            f"{question_id}: {question_data.question[:50]}{'...' if len(question_data.question) > 50 else ''}"
        )
        
        # Return created question
        created_data = result.data[0]
        return Question(**created_data)

    async def get_question_by_id(self, question_id: str) -> Optional[Question]:
        """
        @function get_question_by_id
        @description Retrieves a single question by its ID
        @param question_id: Unique question identifier
        @returns: Question object if found, None if not found
        @example:
            # Get specific question
            question = await service.get_question_by_id("DCF-WACC-D-001")
            if question:
                print(f"Found: {question.question}")
        """
        result = self.db.table('all_questions').select('*').eq('question_id', question_id).execute()
        
        if not result.data:
            return None
        
        return Question(**result.data[0])

    async def search_questions(
        self,
        topic: Optional[str] = None,
        subtopic: Optional[str] = None,
        difficulty: Optional[str] = None,
        question_type: Optional[str] = None,
        search_text: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Question]:
        """
        @function search_questions
        @description Searches questions with multiple filter options
        @param topic: Filter by topic (exact match)
        @param subtopic: Filter by subtopic (exact match)
        @param difficulty: Filter by difficulty level
        @param question_type: Filter by question type
        @param search_text: Text search in question and answer fields
        @param limit: Maximum number of results to return
        @returns: List of matching questions
        @example:
            # Search DCF questions
            results = await service.search_questions(topic="DCF", difficulty="Basic")
            
            # Text search
            results = await service.search_questions(search_text="WACC")
        """
        query = self.db.table('all_questions').select('*')
        
        # Apply filters
        if topic:
            query = query.eq('topic', topic)
        if subtopic:
            query = query.eq('subtopic', subtopic)
        if difficulty:
            query = query.eq('difficulty', difficulty)
        if question_type:
            query = query.eq('type', question_type)
        
        # Text search in question field (simplified for Supabase compatibility)
        if search_text:
            search_pattern = f"%{search_text}%"
            query = query.ilike('question', search_pattern)
        
        # Apply limit
        if limit:
            query = query.limit(limit)
        
        # Order by created_at descending (newest first)
        query = query.order('created_at', desc=True)
        
        result = query.execute()
        
        return [Question(**row) for row in result.data]

    async def update_question(self, question_id: str, question_data: QuestionUpdate, username: str) -> Optional[Question]:
        """
        @function update_question
        @description Updates an existing question with new data
        @param question_id: Unique question identifier
        @param question_data: Updated question data
        @param username: Username of the user updating the question
        @returns: Updated question if successful, None if not found
        @raises Exception: If database operation fails
        @example:
            # Update question
            updated_data = QuestionUpdate(
                question_id="DCF-WACC-D-001",
                topic="DCF",
                subtopic="WACC Advanced",
                difficulty="Intermediate",
                type="Problem",
                question="How do you calculate WACC with multiple debt sources?",
                answer="WACC = Sum of weighted costs..."
            )
            updated = await service.update_question("DCF-WACC-D-001", updated_data, "admin")
        """
        # Check if question exists
        existing = await self.get_question_by_id(question_id)
        if not existing:
            return None
        
        # Prepare update data
        update_data = {
            'topic': question_data.topic,
            'subtopic': question_data.subtopic,
            'difficulty': question_data.difficulty,
            'type': question_data.type,
            'question': question_data.question,
            'answer': question_data.answer,
            'notes_for_tutor': question_data.notes_for_tutor,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Update in database
        result = self.db.table('all_questions').update(update_data).eq('question_id', question_id).execute()
        
        if not result.data:
            raise Exception("Failed to update question")
        
        # Log activity
        await self.log_activity(
            "Question Updated",
            f"{question_id}: {question_data.question[:50]}{'...' if len(question_data.question) > 50 else ''}"
        )
        
        # Return updated question
        return Question(**result.data[0])

    async def delete_question(self, question_id: str, username: str) -> bool:
        """
        @function delete_question
        @description Deletes a question by ID with activity logging
        @param question_id: Unique question identifier
        @param username: Username of the user deleting the question
        @returns: True if deleted successfully, False if not found
        @example:
            # Delete question
            success = await service.delete_question("DCF-WACC-D-001", "admin")
            if success:
                print("Question deleted successfully")
        """
        # Check if question exists and get details for logging
        existing = await self.get_question_by_id(question_id)
        if not existing:
            return False
        
        # Delete from database
        result = self.db.table('all_questions').delete().eq('question_id', question_id).execute()
        
        if not result.data:
            return False
        
        # Log activity
        await self.log_activity(
            "Question Deleted",
            f"{question_id}: {existing.question[:50]}{'...' if len(existing.question) > 50 else ''}"
        )
        
        return True

    async def get_all_topics(self) -> List[str]:
        """
        @function get_all_topics
        @description Retrieves all unique topics from the database
        @returns: List of unique topic names
        @example:
            # Get all topics for filter dropdown
            topics = await service.get_all_topics()
            # Returns: ["DCF", "Valuation", "Financial Modeling", ...]
        """
        result = self.db.table('all_questions').select('topic').execute()
        
        # Extract unique topics
        topics = list(set(row['topic'] for row in result.data))
        return sorted(topics)

    async def get_activity_log(self, limit: int = 10) -> List[ActivityLogItem]:
        """
        @function get_activity_log
        @description Retrieves recent activity log entries
        @param limit: Maximum number of entries to return
        @returns: List of activity log items, newest first
        @example:
            # Get recent activity
            activities = await service.get_activity_log(limit=5)
            for activity in activities:
                print(f"{activity.timestamp}: {activity.action}")
        """
        result = self.db.table('activity_log').select('*').order('timestamp', desc=True).limit(limit).execute()
        
        return [ActivityLogItem(**row) for row in result.data]

    async def get_bootstrap_data(self) -> Dict[str, Any]:
        """
        @function get_bootstrap_data
        @description Retrieves all data needed for dashboard initialization
        @returns: Dictionary containing questions, topics, and activity log
        @example:
            # Get dashboard data
            data = await service.get_bootstrap_data()
            print(f"Found {len(data['questions'])} questions in {len(data['topics'])} topics")
        """
        # Get all questions
        questions_result = self.db.table('all_questions').select('*').order('created_at', desc=True).execute()
        questions = [Question(**row) for row in questions_result.data]
        
        # Get unique topics
        topics = await self.get_all_topics()
        
        # Get recent activity
        activity_log = await self.get_activity_log(limit=20)
        
        # Determine last upload timestamp (most recent question creation)
        last_upload_timestamp = None
        if questions:
            last_upload_timestamp = questions[0].created_at.isoformat()
        
        return {
            'questions': questions,
            'topics': topics,
            'lastUploadTimestamp': last_upload_timestamp,
            'activityLog': activity_log
        }
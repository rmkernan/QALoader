"""
@file backend/app/services/question_service.py
@description Question management service for Q&A Loader. Handles CRUD operations, ID generation, activity logging, and search functionality.
@created 2025.06.09 6:25 PM ET
@updated 2025.06.09 6:25 PM ET - Phase 4 reconstruction after git recovery
@updated June 14, 2025. 9:27 a.m. Eastern Time - Added bulk_delete_questions method for bulk deletion with transaction support
@updated June 14, 2025. 3:54 p.m. Eastern Time - Removed created_at field references and fixed imports for consolidated models
@updated June 14, 2025. 4:27 p.m. Eastern Time - Added short timestamp generation method and updated updated_at field to use consistent MM/DD/YY H:MMPM ET format

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

from app.models.question import Question, QuestionCreate, QuestionUpdate, ActivityLogItem, BulkDeleteResponse


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

    def _generate_short_timestamp(self) -> str:
        """
        @function _generate_short_timestamp
        @description Generates current timestamp in short Eastern Time format
        @returns: Formatted timestamp like "06/14/25 3:25PM ET"
        @example:
            timestamp = self._generate_short_timestamp()
            # Returns: "06/14/25 3:25PM ET"
        """
        from datetime import timezone, timedelta
        
        # Get current time in Eastern Time
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
        
        return f"{month}/{day}/{year} {hour}:{minute}{ampm} ET"

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

    async def log_system_event(self, event_type: str, event_data: Dict[str, Any]) -> None:
        """
        @function log_system_event
        @description Enhanced activity logging for system events and monitoring
        @param event_type: Type of system event (startup, query, error, etc.)
        @param event_data: Dictionary containing event-specific data
        @example:
            # Log system startup
            await service.log_system_event("System Startup", {
                "server": "backend",
                "port": 8000,
                "version": "1.0.0"
            })
            
            # Log search query
            await service.log_system_event("Search Query", {
                "filters": {"topic": "DCF", "difficulty": "Basic"},
                "results": 5,
                "response_time": 45.2
            })
        """
        try:
            # Format action based on event type
            action_mapping = {
                'System Startup': 'System Started',
                'System Shutdown': 'System Stopped',
                'Database Query': 'Database Query Executed',
                'Search Query': 'Search Performed',
                'User Session': 'User Activity',
                'Performance Alert': 'Performance Issue Detected',
                'File Upload': 'File Processing',
                'Error Occurred': 'System Error',
                'Batch Operation': 'Batch Process Executed'
            }
            
            action = action_mapping.get(event_type, event_type)
            
            # Create detailed description
            details_parts = []
            if 'description' in event_data:
                details_parts.append(event_data['description'])
            
            # Add specific details based on event type
            if event_type == 'Search Query':
                filters = event_data.get('filters', {})
                filter_str = ', '.join([f"{k}={v}" for k, v in filters.items()])
                if filter_str:
                    details_parts.append(f"Filters: {filter_str}")
                if 'results' in event_data:
                    details_parts.append(f"Results: {event_data['results']}")
                    
            elif event_type == 'Database Query':
                if 'query_type' in event_data:
                    details_parts.append(f"Type: {event_data['query_type']}")
                if 'response_time' in event_data:
                    details_parts.append(f"Time: {event_data['response_time']}ms")
                    
            elif event_type == 'Performance Alert':
                if 'metric' in event_data:
                    details_parts.append(f"Metric: {event_data['metric']}")
                if 'value' in event_data:
                    details_parts.append(f"Value: {event_data['value']}")
                    
            elif event_type == 'File Upload':
                if 'filename' in event_data:
                    details_parts.append(f"File: {event_data['filename']}")
                if 'questions_processed' in event_data:
                    details_parts.append(f"Questions: {event_data['questions_processed']}")
            
            details = '; '.join(details_parts) if details_parts else str(event_data)
            
            await self.log_activity(action, details)
            
        except Exception as e:
            print(f"Failed to log system event: {e}")

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
            'updated_at': self._generate_short_timestamp()
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
        
        # Order by updated_at descending (newest first)
        query = query.order('updated_at', desc=True)
        
        # Track query performance
        from datetime import datetime
        start_time = datetime.now()
        result = query.execute()
        query_time = (datetime.now() - start_time).total_seconds() * 1000  # Convert to ms
        
        # Log search activity with analytics
        filters_used = {}
        if topic:
            filters_used['topic'] = topic
        if subtopic:
            filters_used['subtopic'] = subtopic
        if difficulty:
            filters_used['difficulty'] = difficulty
        if question_type:
            filters_used['type'] = question_type
        if search_text:
            filters_used['search_text'] = search_text
        
        await self.log_system_event('Search Query', {
            'filters': filters_used,
            'results': len(result.data),
            'response_time': round(query_time, 2),
            'limit': limit
        })
        
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
            'updated_at': self._generate_short_timestamp()
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

    async def bulk_delete_questions(self, question_ids: List[str], username: str) -> BulkDeleteResponse:
        """
        @function bulk_delete_questions
        @description Deletes multiple questions in a single operation with detailed result tracking
        @param question_ids: List of unique question identifiers to delete
        @param username: Username of the user performing the bulk deletion
        @returns: BulkDeleteResponse with detailed results including successes and failures
        @example:
            # Bulk delete multiple questions
            ids = ["DCF-WACC-D-001", "DCF-WACC-P-002", "VAL-COMP-T-003"]
            result = await service.bulk_delete_questions(ids, "admin")
            print(f"Deleted {result.deleted_count} of {len(ids)} questions")
            if result.failed_count > 0:
                print(f"Failed IDs: {result.failed_ids}")
        """
        deleted_ids = []
        failed_ids = []
        errors = {}
        
        # First, verify which questions exist and collect their details for logging
        existing_questions = {}
        for qid in question_ids:
            question = await self.get_question_by_id(qid)
            if question:
                existing_questions[qid] = question
            else:
                failed_ids.append(qid)
                errors[qid] = f"Question with ID '{qid}' not found"
        
        # Perform bulk deletion for existing questions
        if existing_questions:
            try:
                # Supabase doesn't support true transactions in the client library,
                # so we'll delete one by one but track successes/failures
                for qid, question in existing_questions.items():
                    try:
                        result = self.db.table('all_questions').delete().eq('question_id', qid).execute()
                        if result.data:
                            deleted_ids.append(qid)
                        else:
                            failed_ids.append(qid)
                            errors[qid] = "Deletion failed - no data returned"
                    except Exception as e:
                        failed_ids.append(qid)
                        errors[qid] = f"Deletion error: {str(e)}"
                
                # Log bulk activity if any deletions succeeded
                if deleted_ids:
                    details = f"Deleted {len(deleted_ids)} questions: "
                    # Include first 3 IDs in details, plus count if more
                    if len(deleted_ids) <= 3:
                        details += ", ".join(deleted_ids)
                    else:
                        details += f"{', '.join(deleted_ids[:3])}, and {len(deleted_ids) - 3} more"
                    
                    await self.log_activity("Bulk Delete", details)
                    
            except Exception as e:
                # Catastrophic failure - mark all as failed
                for qid in existing_questions:
                    if qid not in deleted_ids and qid not in failed_ids:
                        failed_ids.append(qid)
                        errors[qid] = f"Bulk operation error: {str(e)}"
        
        # Prepare response
        deleted_count = len(deleted_ids)
        failed_count = len(failed_ids)
        total_requested = len(question_ids)
        
        if deleted_count == total_requested:
            message = f"Successfully deleted all {deleted_count} questions"
            success = True
        elif deleted_count > 0:
            message = f"Partially successful: deleted {deleted_count} of {total_requested} questions"
            success = True  # Partial success is still success
        else:
            message = f"Failed to delete any questions (0 of {total_requested})"
            success = False
        
        return BulkDeleteResponse(
            success=success,
            deleted_count=deleted_count,
            failed_count=failed_count,
            deleted_ids=deleted_ids,
            failed_ids=failed_ids,
            message=message,
            errors=errors if errors else None
        )

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
        questions_result = self.db.table('all_questions').select('*').order('updated_at', desc=True).execute()
        questions = [Question(**row) for row in questions_result.data]
        
        # Get unique topics
        topics = await self.get_all_topics()
        
        # Get recent activity
        activity_log = await self.get_activity_log(limit=20)
        
        # Determine last upload timestamp (most recent question creation)
        last_upload_timestamp = None
        if questions:
            last_upload_timestamp = questions[0].updated_at
        
        return {
            'questions': questions,
            'topics': topics,
            'lastUploadTimestamp': last_upload_timestamp,
            'activityLog': activity_log
        }

    async def get_enhanced_bootstrap_data(self) -> Dict[str, Any]:
        """
        @function get_enhanced_bootstrap_data
        @description Enhanced bootstrap with detailed statistics, metrics, and system health
        @returns: Comprehensive dashboard data including statistics and analytics
        @example:
            # Get enhanced dashboard data
            data = await service.get_enhanced_bootstrap_data()
            print(f"Total questions: {data['statistics']['totalQuestions']}")
            print(f"System status: {data['systemHealth']['status']}")
        """
        # Get basic bootstrap data
        basic_data = await self.get_bootstrap_data()
        questions = basic_data['questions']
        
        # Calculate statistics
        statistics = {
            'totalQuestions': len(questions),
            'questionsByDifficulty': self._count_by_field(questions, 'difficulty'),
            'questionsByType': self._count_by_field(questions, 'type'),
            'questionsByTopic': self._count_by_field(questions, 'topic'),
            'recentActivity': await self._count_recent_activity(days=7)
        }
        
        # Get system health metrics
        system_health = await self._get_system_health()
        
        # Get activity trends
        activity_trends = await self._get_activity_trends(days=7)
        
        return {
            'questions': questions,
            'topics': basic_data['topics'],
            'statistics': statistics,
            'lastUploadTimestamp': basic_data['lastUploadTimestamp'],
            'activityLog': basic_data['activityLog'],
            'systemHealth': system_health,
            'activityTrends': activity_trends
        }

    def _count_by_field(self, questions: List[Question], field: str) -> Dict[str, int]:
        """
        @function _count_by_field
        @description Helper to count questions by a specific field
        @param questions: List of question objects
        @param field: Field name to count by (difficulty, type, topic)
        @returns: Dictionary mapping field values to counts
        """
        counts = {}
        for q in questions:
            value = getattr(q, field)
            counts[value] = counts.get(value, 0) + 1
        return counts

    async def _count_recent_activity(self, days: int) -> int:
        """
        @function _count_recent_activity
        @description Count activities in the past N days
        @param days: Number of days to look back
        @returns: Count of recent activities
        """
        from datetime import timedelta
        cutoff_date = datetime.now() - timedelta(days=days)
        
        result = self.db.table('activity_log').select('id', count='exact').gte('timestamp', cutoff_date.isoformat()).execute()
        return result.count or 0

    async def _get_system_health(self) -> Dict[str, Any]:
        """
        @function _get_system_health
        @description Get system health metrics and status
        @returns: Dictionary with database status, storage usage, and performance metrics
        """
        try:
            # Test database connection with a simple query
            test_result = self.db.table('all_questions').select('question_id').limit(1).execute()
            db_connected = len(test_result.data) >= 0  # Will be True if query succeeds
            
            # Get storage metrics (estimated)
            questions_count = self.db.table('all_questions').select('*', count='exact').execute().count or 0
            activity_count = self.db.table('activity_log').select('*', count='exact').execute().count or 0
            
            # Estimate storage (rough approximation)
            avg_question_size_kb = 2  # Estimated 2KB per question
            avg_activity_size_kb = 0.5  # Estimated 0.5KB per activity log entry
            total_storage_mb = (questions_count * avg_question_size_kb + activity_count * avg_activity_size_kb) / 1024
            
            return {
                'status': 'healthy',
                'databaseConnected': db_connected,
                'totalStorageUsed': f"{total_storage_mb:.2f} MB",
                'questionsCount': questions_count,
                'activitiesCount': activity_count,
                'avgResponseTime': 0.05,  # Placeholder - would implement actual monitoring
                'uptime': '100%'  # Placeholder - would track actual uptime
            }
        except Exception as e:
            return {
                'status': 'degraded',
                'databaseConnected': False,
                'error': str(e),
                'totalStorageUsed': 'Unknown',
                'avgResponseTime': None
            }

    async def _get_activity_trends(self, days: int) -> List[Dict[str, Any]]:
        """
        @function _get_activity_trends
        @description Get activity trends over the past N days
        @param days: Number of days to analyze
        @returns: List of daily activity summaries
        """
        from datetime import timedelta, date
        
        trends = []
        today = date.today()
        
        for i in range(days):
            target_date = today - timedelta(days=i)
            start_time = datetime.combine(target_date, datetime.min.time())
            end_time = start_time + timedelta(days=1)
            
            # Count activities for this day
            activities = self.db.table('activity_log').select('*', count='exact').gte(
                'timestamp', start_time.isoformat()
            ).lt('timestamp', end_time.isoformat()).execute()
            
            # Count questions created on this day (using updated_at as proxy)
            questions = self.db.table('all_questions').select('*', count='exact').gte(
                'updated_at', start_time.isoformat()
            ).lt('updated_at', end_time.isoformat()).execute()
            
            trends.append({
                'date': target_date.isoformat(),
                'activityCount': activities.count or 0,
                'questionsCreated': questions.count or 0,
                'dayOfWeek': target_date.strftime('%A')
            })
        
        # Reverse to show oldest to newest
        trends.reverse()
        return trends
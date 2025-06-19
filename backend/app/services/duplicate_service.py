"""
@file backend/app/services/duplicate_service.py
@description Service for detecting duplicate questions using PostgreSQL pg_trgm
@created June 19, 2025. 6:01 PM Eastern Time

@architectural-context
Layer: Service (Business Logic)
Dependencies: Supabase client, PostgreSQL pg_trgm
Pattern: Database service for similarity matching
"""

from typing import List, Dict, Optional, Any
from uuid import UUID
from app.database import supabase
import logging

logger = logging.getLogger(__name__)

class DuplicateService:
    """Service for detecting and managing duplicate questions using PostgreSQL pg_trgm extension"""
    
    SIMILARITY_THRESHOLD = 0.8  # 80% similarity
    
    async def detect_duplicates(
        self, 
        question_ids: List[str], 
        threshold: float = None
    ) -> Dict[str, Any]:
        """
        Detect potential duplicates for given question IDs using text similarity
        
        Args:
            question_ids: List of question IDs to check for duplicates
            threshold: Similarity threshold (0.0-1.0), defaults to class default
            
        Returns:
            Dictionary with count and grouped duplicates
        """
        if not question_ids:
            return {"count": 0, "groups": []}
        
        threshold = threshold or self.SIMILARITY_THRESHOLD
        
        try:
            # SQL query to find similar questions using pg_trgm
            query = """
            SELECT 
                a.question_id as id1,
                a.question as text1,
                a.topic as topic1,
                b.question_id as id2,
                b.question as text2,
                b.topic as topic2,
                similarity(a.question, b.question) as score
            FROM all_questions a
            JOIN all_questions b ON a.question_id != b.question_id
            WHERE a.question_id = ANY(%s)
            AND similarity(a.question, b.question) > %s
            ORDER BY score DESC
            """
            
            # Execute query using Supabase RPC
            result = supabase.rpc(
                'execute_sql',
                {
                    'query': query,
                    'params': [question_ids, threshold]
                }
            ).execute()
            
            if result.data:
                return self._group_duplicates(result.data)
            else:
                return {"count": 0, "groups": []}
                
        except Exception as e:
            logger.error(f"Error detecting duplicates: {str(e)}")
            return {"count": 0, "groups": [], "error": str(e)}
    
    async def scan_all_duplicates(self, threshold: float = None) -> Dict[str, Any]:
        """
        Scan entire database for duplicate questions
        
        Args:
            threshold: Similarity threshold (0.0-1.0)
            
        Returns:
            Dictionary with count and grouped duplicates
        """
        threshold = threshold or self.SIMILARITY_THRESHOLD
        
        try:
            # Query to find all duplicates in database
            query = """
            SELECT 
                a.question_id as id1,
                a.question as text1,
                a.topic as topic1,
                b.question_id as id2,
                b.question as text2,
                b.topic as topic2,
                similarity(a.question, b.question) as score
            FROM all_questions a
            JOIN all_questions b ON a.question_id > b.question_id
            WHERE similarity(a.question, b.question) > %s
            ORDER BY score DESC
            """
            
            result = supabase.rpc(
                'execute_sql',
                {
                    'query': query,
                    'params': [threshold]
                }
            ).execute()
            
            if result.data:
                return self._group_duplicates(result.data)
            else:
                return {"count": 0, "groups": []}
                
        except Exception as e:
            logger.error(f"Error scanning for duplicates: {str(e)}")
            return {"count": 0, "groups": [], "error": str(e)}
    
    def _group_duplicates(self, duplicate_pairs: List[Dict]) -> Dict[str, Any]:
        """
        Group duplicate pairs into clusters
        
        Args:
            duplicate_pairs: List of duplicate pair dictionaries
            
        Returns:
            Dictionary with grouped duplicates
        """
        if not duplicate_pairs:
            return {"count": 0, "groups": []}
        
        groups = []
        processed = set()
        
        for pair in duplicate_pairs:
            id1, id2 = pair['id1'], pair['id2']
            
            if id1 in processed or id2 in processed:
                continue
                
            # Create new group with primary question
            group = {
                'primary_id': id1,
                'primary_question': {
                    'id': id1,
                    'text': pair['text1'],
                    'topic': pair.get('topic1', '')
                },
                'duplicates': [{
                    'id': id2,
                    'text': pair['text2'],
                    'topic': pair.get('topic2', ''),
                    'similarity_score': pair['score']
                }]
            }
            
            # Look for additional duplicates for this group
            for other_pair in duplicate_pairs:
                if (other_pair['id1'] == id1 and other_pair['id2'] not in processed and 
                    other_pair['id2'] != id2):
                    group['duplicates'].append({
                        'id': other_pair['id2'],
                        'text': other_pair['text2'],
                        'topic': other_pair.get('topic2', ''),
                        'similarity_score': other_pair['score']
                    })
                    processed.add(other_pair['id2'])
            
            groups.append(group)
            processed.add(id1)
            processed.add(id2)
        
        return {
            'count': len(duplicate_pairs),
            'groups': groups
        }

# Global instance
duplicate_service = DuplicateService()
"""
@file backend/app/services/duplicate_service_fallback.py
@description Fallback duplicate detection service using application-level similarity matching
@created June 20, 2025. 8:58 AM Eastern Time

@architectural-context
Layer: Service (Business Logic)
Dependencies: Supabase client, difflib for text similarity
Pattern: Application-level similarity matching when pg_trgm is unavailable
"""

from typing import List, Dict, Optional, Any
from difflib import SequenceMatcher
from app.database import supabase
import logging

logger = logging.getLogger(__name__)

class DuplicateServiceFallback:
    """Fallback service for detecting duplicates using Python's difflib when pg_trgm is unavailable"""
    
    SIMILARITY_THRESHOLD = 0.8  # 80% similarity
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity ratio between two texts using SequenceMatcher"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
    
    async def detect_duplicates(
        self, 
        question_ids: List[str], 
        threshold: float = None
    ) -> Dict[str, Any]:
        """
        Detect potential duplicates using application-level text similarity
        
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
            # Fetch all questions to compare
            all_questions = supabase.table('all_questions').select('*').execute()
            
            if not all_questions.data:
                return {"count": 0, "groups": []}
            
            # Create lookup for target questions
            target_questions = {
                q['question_id']: q 
                for q in all_questions.data 
                if q['question_id'] in question_ids
            }
            
            # Find duplicates
            duplicate_pairs = []
            processed_pairs = set()
            
            for target_id, target_q in target_questions.items():
                for compare_q in all_questions.data:
                    # Skip self-comparison and already processed pairs
                    if compare_q['question_id'] == target_id:
                        continue
                    
                    pair_key = tuple(sorted([target_id, compare_q['question_id']]))
                    if pair_key in processed_pairs:
                        continue
                    
                    # Calculate similarity
                    similarity = self._calculate_similarity(
                        target_q['question'], 
                        compare_q['question']
                    )
                    
                    if similarity >= threshold:
                        duplicate_pairs.append({
                            'id1': target_id,
                            'text1': target_q['question'],
                            'topic1': target_q.get('topic', ''),
                            'id2': compare_q['question_id'],
                            'text2': compare_q['question'],
                            'topic2': compare_q.get('topic', ''),
                            'score': similarity
                        })
                        processed_pairs.add(pair_key)
            
            return self._group_duplicates(duplicate_pairs)
            
        except Exception as e:
            logger.error(f"Error detecting duplicates (fallback): {str(e)}")
            return {"count": 0, "groups": [], "error": str(e)}
    
    def _group_duplicates(self, pairs: List[Dict]) -> Dict[str, Any]:
        """Group duplicate pairs into connected components"""
        if not pairs:
            return {"count": 0, "groups": []}
        
        # Build adjacency list
        adjacency = {}
        all_questions = {}
        
        for pair in pairs:
            # Add to adjacency list
            if pair['id1'] not in adjacency:
                adjacency[pair['id1']] = []
            if pair['id2'] not in adjacency:
                adjacency[pair['id2']] = []
            
            adjacency[pair['id1']].append({
                'id': pair['id2'],
                'score': pair['score']
            })
            adjacency[pair['id2']].append({
                'id': pair['id1'],
                'score': pair['score']
            })
            
            # Store question details
            all_questions[pair['id1']] = {
                'id': pair['id1'],
                'text': pair['text1'],
                'topic': pair['topic1']
            }
            all_questions[pair['id2']] = {
                'id': pair['id2'],
                'text': pair['text2'],
                'topic': pair['topic2']
            }
        
        # Find connected components using DFS
        visited = set()
        groups = []
        
        for question_id in adjacency:
            if question_id not in visited:
                group = []
                stack = [question_id]
                
                while stack:
                    current = stack.pop()
                    if current in visited:
                        continue
                    
                    visited.add(current)
                    group.append(all_questions[current])
                    
                    for neighbor in adjacency[current]:
                        if neighbor['id'] not in visited:
                            stack.append(neighbor['id'])
                
                if len(group) > 1:
                    groups.append({
                        'questions': group,
                        'average_score': sum(
                            p['score'] for p in pairs 
                            if any(q['id'] in [p['id1'], p['id2']] for q in group)
                        ) / len(group)
                    })
        
        return {
            'count': len(groups),
            'groups': sorted(groups, key=lambda g: g['average_score'], reverse=True)
        }

# Create singleton instance
duplicate_service_fallback = DuplicateServiceFallback()
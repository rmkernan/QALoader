"""
Duplicate detection service for Q&A questions.

Created: June 19, 2025. 4:52 PM Eastern Time
Updated: June 19, 2025. 4:56 PM Eastern Time - Modified to work with Supabase client instead of SQLAlchemy
"""

from typing import Dict, List, Optional, Tuple, Any
import re
import difflib

from app.services.validation_service import ParsedQuestion


class DuplicateService:
    """Service for detecting duplicate questions in the database."""
    
    def __init__(self, supabase_client: Any):
        """
        Initialize the duplicate service.
        
        Args:
            supabase_client: Supabase client instance
        """
        self.supabase = supabase_client
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalize text for comparison by removing punctuation and converting to lowercase.
        
        Args:
            text: The text to normalize
            
        Returns:
            Normalized text string
        """
        # Convert to lowercase
        text = text.lower()
        # Remove punctuation and extra whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = ' '.join(text.split())
        return text
    
    def check_exact_duplicates(self, questions: List[ParsedQuestion]) -> Dict[str, str]:
        """
        Check for exact duplicate questions in the database.
        
        Args:
            questions: List of parsed questions to check
            
        Returns:
            Dictionary mapping question text to existing question IDs
        """
        duplicates = {}
        
        for question in questions:
            normalized_question = self.normalize_text(question.question)
            
            # Query all questions from the database
            # Note: In a production environment, we'd want to optimize this
            # by using text search or batching queries
            try:
                result = self.supabase.table('all_questions').select('*').execute()
                existing_questions = result.data if result.data else []
                
                # Check for exact match including metadata
                for existing in existing_questions:
                    existing_normalized = self.normalize_text(existing['question'])
                    
                    if (existing_normalized == normalized_question and
                        existing['topic'] == question.topic and
                        existing['subtopic'] == question.subtopic and
                        existing['difficulty'] == question.difficulty and
                        existing['type'] == question.type):
                        duplicates[question.question] = existing['question_id']
                        break
            except Exception as e:
                # Log error but continue checking other questions
                print(f"Error checking duplicate for question: {e}")
                continue
        
        return duplicates
    
    def check_similar_questions(self, questions: List[ParsedQuestion], 
                                    similarity_threshold: float = 0.85) -> Dict[str, List[Dict[str, str]]]:
        """
        Check for similar questions using fuzzy matching.
        
        Args:
            questions: List of parsed questions to check
            similarity_threshold: Minimum similarity score (0-1) to consider as duplicate
            
        Returns:
            Dictionary mapping question text to list of similar questions with details
        """
        similar = {}
        
        for question in questions:
            normalized_new = self.normalize_text(question.question)
            
            try:
                # Get all questions with the same topic for comparison
                result = self.supabase.table('all_questions').select('*').eq('topic', question.topic).execute()
                existing_questions = result.data if result.data else []
                
                similar_matches = []
                for existing in existing_questions:
                    normalized_existing = self.normalize_text(existing['question'])
                    
                    # Calculate similarity ratio
                    similarity = difflib.SequenceMatcher(None, normalized_new, normalized_existing).ratio()
                    
                    if similarity >= similarity_threshold and similarity < 1.0:  # Exclude exact matches
                        similar_matches.append({
                            'id': existing['question_id'],
                            'question': existing['question'],
                            'topic': existing['topic'],
                            'subtopic': existing['subtopic'],
                            'difficulty': existing['difficulty'],
                            'type': existing['type'],
                            'similarity': round(similarity * 100, 1)
                        })
                
                if similar_matches:
                    # Sort by similarity score descending
                    similar_matches.sort(key=lambda x: x['similarity'], reverse=True)
                    similar[question.question] = similar_matches[:5]  # Return top 5 matches
            except Exception as e:
                # Log error but continue checking other questions
                print(f"Error checking similar questions: {e}")
                continue
        
        return similar
    
    def find_all_duplicates_in_database(self) -> List[Tuple[str, List[Dict]]]:
        """
        Find all duplicate questions currently in the database.
        
        Returns:
            List of tuples containing (normalized_question, list of duplicate records)
        """
        try:
            # Get all questions
            result = self.supabase.table('all_questions').select('*').execute()
            all_questions = result.data if result.data else []
            
            # Group by normalized question text
            duplicates_map = {}
            for question in all_questions:
                normalized = self.normalize_text(question['question'])
                key = f"{normalized}|{question['topic']}|{question['subtopic']}|{question['difficulty']}|{question['type']}"
                
                if key not in duplicates_map:
                    duplicates_map[key] = []
                
                duplicates_map[key].append({
                    'id': question['question_id'],
                    'question': question['question'],
                    'topic': question['topic'],
                    'subtopic': question['subtopic'],
                    'difficulty': question['difficulty'],
                    'type': question['type'],
                    'upload_date': question.get('upload_date')
                })
            
            # Filter to only include groups with duplicates
            duplicate_groups = [
                (key.split('|')[0], questions) 
                for key, questions in duplicates_map.items() 
                if len(questions) > 1
            ]
            
            return duplicate_groups
        except Exception as e:
            print(f"Error finding duplicates in database: {e}")
            return []
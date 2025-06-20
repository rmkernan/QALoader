"""
@file backend/app/utils/id_generator.py
@description Question ID generation utility for creating unique, semantic question identifiers following established patterns.
@created June 14, 2025. 11:27 a.m. Eastern Time
@updated June 14, 2025. 11:27 a.m. Eastern Time - Initial creation with semantic ID generation logic
@updated June 19, 2025. 4:00 PM Eastern Time - Updated abbreviation system for topics, subtopics, and question types
@updated June 20, 2025. 4:25 PM Eastern Time - Modified to check both staged_questions and all_questions tables for ID uniqueness

@architectural-context
Layer: Utility Layer (Helper Functions)
Dependencies: re (regex), typing (type hints), supabase client for uniqueness checking
Pattern: Utility functions for ID generation with database integration for uniqueness

@workflow-context
User Journey: Question upload workflow - generates unique IDs before database insertion
Sequence Position: Called by upload service after question validation, before database operations
Inputs: Topic, subtopic, difficulty, type, and database client for uniqueness checking
Outputs: Unique semantic question IDs following established patterns

@authentication-context
Auth Requirements: Uses authenticated database client passed from calling service
Security: No direct authentication handling, relies on caller's authentication context

@database-context
Tables: Queries both staged_questions and all_questions tables to ensure ID uniqueness
Operations: SELECT queries to check existing IDs and find next available sequence numbers
Transactions: Read-only operations for ID conflict detection
"""

import re
from typing import Dict, Optional
from supabase import Client


class IDGenerator:
    """
    @class IDGenerator
    @description Generates unique, semantic question IDs following established patterns
    """
    
    # Type code mapping for question types - simplified to Q (Question) or P (Problem)
    TYPE_CODES = {
        'Question': 'Q',
        'Problem': 'P',
        'GenConcept': 'Q',  # Map to Question
        'Definition': 'Q',  # Map to Question
        'Calculation': 'P', # Map to Problem
        'Analysis': 'Q'     # Map to Question
    }
    
    # Topic abbreviation mapping for common topics
    TOPIC_ABBREVIATIONS = {
        'accounting': 'ACC',
        'finance': 'FIN',
        'economics': 'ECON',
        'business': 'BUS',
        'marketing': 'MKT',
        'operations': 'OPS',
        'strategy': 'STRAT',
        'management': 'MGMT',
        'dcf': 'DCF',
        'valuation': 'VAL',
        'financial modeling': 'FINMOD',
        'mergers and acquisitions': 'MA',
        'm&a': 'MA'
    }
    
    # Maximum component lengths to prevent overly long IDs
    MAX_TOPIC_CODE_LENGTH = 10
    MAX_SUBTOPIC_CODE_LENGTH = 8

    def generate_question_id(self, topic: str, subtopic: str, difficulty: str, question_type: str) -> str:
        """
        @function generate_question_id
        @description Generates semantic question ID following pattern: {TOPIC}-{SUBTOPIC}-{DIFFICULTY}-{TYPE}-{SEQUENCE}
        @param topic: Full topic name (e.g., "Discounted Cash Flow (DCF)")
        @param subtopic: Subtopic name (e.g., "WACC Calculation")
        @param difficulty: Question difficulty ("Basic" or "Advanced")
        @param question_type: Question type (e.g., "GenConcept", "Problem")
        @returns: Base question ID without sequence number
        @example:
            base_id = generator.generate_question_id("DCF", "WACC", "Basic", "GenConcept")
            # Returns: "DCF-WACC-B-G"
        """
        topic_code = self.normalize_topic(topic)
        subtopic_code = self.normalize_subtopic(subtopic)
        difficulty_code = difficulty[0].upper()  # "B" or "A"
        type_code = self.get_type_code(question_type)
        
        return f"{topic_code}-{subtopic_code}-{difficulty_code}-{type_code}"

    def normalize_topic(self, topic: str) -> str:
        """
        @function normalize_topic
        @description Normalizes topic name to 3-letter abbreviation for ID generation
        @param topic: Full topic name
        @returns: 3-letter normalized topic code
        @example:
            code = normalize_topic("Accounting")  # Returns: "ACC"
            code = normalize_topic("DCF")         # Returns: "DCF"
        """
        topic_lower = topic.lower().strip()
        
        # First check predefined abbreviations
        if topic_lower in self.TOPIC_ABBREVIATIONS:
            return self.TOPIC_ABBREVIATIONS[topic_lower]
        
        # Extract abbreviation from parentheses if present
        parentheses_match = re.search(r'\(([^)]+)\)', topic)
        if parentheses_match:
            abbrev = parentheses_match.group(1)
            clean_abbrev = re.sub(r'[^A-Za-z0-9]', '', abbrev)
            if clean_abbrev and len(clean_abbrev) <= 4:
                return clean_abbrev.upper()[:3]
        
        # Remove parentheses content and clean
        topic_clean = re.sub(r'\([^)]*\)', '', topic)
        topic_clean = re.sub(r'[^A-Za-z0-9\s]', '', topic_clean).strip()
        
        # If already short, use as-is
        if len(topic_clean) <= 3:
            return topic_clean.upper().ljust(3, 'X')
        
        # Split into words
        words = [w for w in topic_clean.split() if len(w) > 0]
        
        if not words:
            return 'UNK'
        
        if len(words) == 1:
            # Single word - take first 3 characters
            return words[0][:3].upper()
        
        # Multiple words - take first letter of each word, up to 3
        abbrev = ''.join(word[0].upper() for word in words[:3])
        
        # If we have less than 3 letters, pad with more from first word
        if len(abbrev) < 3 and len(words[0]) > 1:
            needed = 3 - len(abbrev)
            abbrev += words[0][1:1+needed].upper()
        
        return abbrev[:3].ljust(3, 'X')

    def normalize_subtopic(self, subtopic: str) -> str:
        """
        @function normalize_subtopic
        @description Normalizes subtopic name to 3-letter abbreviation for ID generation
        @param subtopic: Full subtopic name
        @returns: 3-letter normalized subtopic code
        @example:
            code = normalize_subtopic("WACC Calculation")  # Returns: "WAC"
            code = normalize_subtopic("Undefined")         # Returns: "UND"
        """
        subtopic_clean = subtopic.strip()
        
        # Handle special cases
        if subtopic_clean.lower() in ['undefined', 'unknown', 'misc', 'general']:
            return 'UND'
        
        # Remove special characters and extra spaces
        clean_subtopic = re.sub(r'[^A-Za-z0-9\s]', '', subtopic_clean)
        clean_subtopic = re.sub(r'\s+', ' ', clean_subtopic.strip())
        
        if not clean_subtopic:
            return 'UND'
        
        # Split into words
        words = [w for w in clean_subtopic.split() if len(w) > 0]
        
        if not words:
            return 'UND'
        
        if len(words) == 1:
            # Single word - take first 3 characters
            word = words[0]
            if len(word) <= 3:
                return word.upper().ljust(3, 'X')
            return word[:3].upper()
        
        # Multiple words - take first letter of each word, up to 3
        abbrev = ''.join(word[0].upper() for word in words[:3])
        
        # If we have less than 3 letters, pad with more from first word
        if len(abbrev) < 3 and len(words[0]) > 1:
            needed = 3 - len(abbrev)
            abbrev += words[0][1:1+needed].upper()
        
        return abbrev[:3].ljust(3, 'X')

    def get_type_code(self, question_type: str) -> str:
        """
        @function get_type_code
        @description Maps question type to single letter code (Q for Question, P for Problem)
        @param question_type: Full question type name
        @returns: Single letter type code (Q or P)
        @example:
            code = get_type_code("Question")    # Returns: "Q"
            code = get_type_code("Problem")     # Returns: "P"
            code = get_type_code("GenConcept")  # Returns: "Q" (mapped to Question)
        """
        return self.TYPE_CODES.get(question_type, 'Q')  # Default to 'Q' for Question

    async def get_next_sequence(self, base_id: str, supabase_client: Client) -> int:
        """
        @function get_next_sequence
        @description Finds the next available sequence number for a base ID pattern by checking both staged and production tables
        @param base_id: Base ID pattern (e.g., "DCF-WACC-B-G")
        @param supabase_client: Authenticated Supabase client
        @returns: Next available sequence number
        @example:
            sequence = await get_next_sequence("DCF-WACC-B-G", supabase)
            # If DCF-WACC-B-G-001 and DCF-WACC-B-G-002 exist, returns 3
        """
        try:
            pattern = f"{base_id}-%"
            max_sequence = 0
            
            # Check all_questions table
            all_questions_result = supabase_client.table('all_questions')\
                .select('question_id')\
                .like('question_id', pattern)\
                .order('question_id', desc=True)\
                .limit(50)\
                .execute()
            
            if all_questions_result.data:
                for row in all_questions_result.data:
                    question_id = row['question_id']
                    sequence_match = re.search(r'-(\d+)$', question_id)
                    if sequence_match:
                        sequence = int(sequence_match.group(1))
                        max_sequence = max(max_sequence, sequence)
            
            # Check staged_questions table
            staged_result = supabase_client.table('staged_questions')\
                .select('question_id')\
                .like('question_id', pattern)\
                .order('question_id', desc=True)\
                .limit(50)\
                .execute()
            
            if staged_result.data:
                for row in staged_result.data:
                    question_id = row['question_id']
                    sequence_match = re.search(r'-(\d+)$', question_id)
                    if sequence_match:
                        sequence = int(sequence_match.group(1))
                        max_sequence = max(max_sequence, sequence)
            
            return max_sequence + 1
            
        except Exception as e:
            # If query fails, return 1 and let uniqueness check handle conflicts
            print(f"Error getting next sequence for {base_id}: {e}")
            return 1

    async def ensure_unique_id(self, base_id: str, supabase_client: Client) -> str:
        """
        @function ensure_unique_id
        @description Ensures ID uniqueness by checking both staged and production tables and incrementing sequence if needed
        @param base_id: Base ID pattern without sequence
        @param supabase_client: Authenticated Supabase client
        @returns: Unique question ID with sequence number
        @example:
            unique_id = await ensure_unique_id("DCF-WACC-B-G", supabase)
            # Returns: "DCF-WACC-B-G-001" (or next available sequence)
        """
        sequence = await self.get_next_sequence(base_id, supabase_client)
        
        # Generate candidate ID
        candidate_id = f"{base_id}-{sequence:03d}"
        
        # Double-check uniqueness in both tables
        max_attempts = 10
        attempt = 0
        
        while attempt < max_attempts:
            try:
                # Check all_questions table
                all_questions_result = supabase_client.table('all_questions')\
                    .select('question_id')\
                    .eq('question_id', candidate_id)\
                    .execute()
                
                # Check staged_questions table
                staged_result = supabase_client.table('staged_questions')\
                    .select('question_id')\
                    .eq('question_id', candidate_id)\
                    .execute()
                
                if not all_questions_result.data and not staged_result.data:
                    # ID is unique in both tables
                    return candidate_id
                
                # ID exists in one of the tables, try next sequence
                sequence += 1
                candidate_id = f"{base_id}-{sequence:03d}"
                attempt += 1
                
            except Exception as e:
                print(f"Error checking ID uniqueness: {e}")
                # If database check fails, return the candidate and let insert handle the conflict
                return candidate_id
        
        # If we've tried many sequences and all exist, something is wrong
        # Return the last candidate and let the database handle the conflict
        return candidate_id

    async def generate_unique_question_id(self, topic: str, subtopic: str, difficulty: str, 
                                         question_type: str, supabase_client: Client) -> str:
        """
        @function generate_unique_question_id
        @description Main function to generate a complete unique question ID
        @param topic: Full topic name
        @param subtopic: Subtopic name
        @param difficulty: Question difficulty ("Basic" or "Advanced")
        @param question_type: Question type
        @param supabase_client: Authenticated Supabase client
        @returns: Complete unique question ID
        @example:
            unique_id = await generator.generate_unique_question_id(
                "Discounted Cash Flow (DCF)", 
                "WACC Calculation", 
                "Basic", 
                "GenConcept", 
                supabase
            )
            # Returns: "DCF-WACC-B-G-001"
        """
        base_id = self.generate_question_id(topic, subtopic, difficulty, question_type)
        return await self.ensure_unique_id(base_id, supabase_client)


# Service instance for dependency injection
id_generator = IDGenerator()
"""
@file backend/app/utils/id_generator.py
@description Question ID generation utility for creating unique, semantic question identifiers following established patterns.
@created June 14, 2025. 11:27 a.m. Eastern Time
@updated June 14, 2025. 11:27 a.m. Eastern Time - Initial creation with semantic ID generation logic

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
Tables: Queries all_questions table to ensure ID uniqueness
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
    
    # Type code mapping for question types
    TYPE_CODES = {
        'GenConcept': 'G',
        'Problem': 'P',
        'Definition': 'D',
        'Calculation': 'C',
        'Analysis': 'A'
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
        @description Normalizes topic name to short code for ID generation
        @param topic: Full topic name
        @returns: Normalized topic code
        @example:
            # Extract abbreviation from parentheses
            code = normalize_topic("Discounted Cash Flow (DCF)")  # Returns: "DCF"
            
            # Use first words if no abbreviation
            code = normalize_topic("Mergers and Acquisitions")  # Returns: "MERGERSACQ"
        """
        # First, try to extract abbreviation from parentheses
        parentheses_match = re.search(r'\(([^)]+)\)', topic)
        if parentheses_match:
            abbrev = parentheses_match.group(1)
            # Clean up abbreviation
            clean_abbrev = re.sub(r'[^A-Za-z0-9]', '', abbrev)
            if clean_abbrev and len(clean_abbrev) <= self.MAX_TOPIC_CODE_LENGTH:
                return clean_abbrev.upper()
        
        # No abbreviation found, create one from the topic name
        # Remove common words and extract meaningful parts
        topic_clean = re.sub(r'\([^)]*\)', '', topic)  # Remove parentheses content
        topic_clean = re.sub(r'[^A-Za-z0-9\s]', '', topic_clean)  # Remove special chars
        
        # Split into words and take first letters of significant words
        words = topic_clean.split()
        significant_words = [w for w in words if len(w) > 2 and w.lower() not in ['the', 'and', 'of', 'for', 'to', 'in', 'on', 'at', 'by']]
        
        if not significant_words:
            significant_words = words  # Fallback to all words
        
        # Create abbreviation
        if len(significant_words) == 1:
            # Single word - take first N characters
            return significant_words[0][:self.MAX_TOPIC_CODE_LENGTH].upper()
        else:
            # Multiple words - take first letter of each or first few letters
            abbrev = ''.join(word[0].upper() for word in significant_words[:4])
            if len(abbrev) < 3 and significant_words:
                # If too short, take more letters from first word
                abbrev = significant_words[0][:min(4, self.MAX_TOPIC_CODE_LENGTH)].upper()
            return abbrev[:self.MAX_TOPIC_CODE_LENGTH]

    def normalize_subtopic(self, subtopic: str) -> str:
        """
        @function normalize_subtopic
        @description Normalizes subtopic name to short code for ID generation
        @param subtopic: Full subtopic name
        @returns: Normalized subtopic code
        @example:
            code = normalize_subtopic("WACC Calculation")  # Returns: "WACC"
            code = normalize_subtopic("Terminal Value")     # Returns: "TERMVAL"
        """
        # Remove special characters and extra spaces
        clean_subtopic = re.sub(r'[^A-Za-z0-9\s]', '', subtopic)
        clean_subtopic = re.sub(r'\s+', ' ', clean_subtopic.strip())
        
        # Split into words
        words = clean_subtopic.split()
        
        if not words:
            return "UNKNOWN"
        
        if len(words) == 1:
            # Single word - use as is (truncated if needed)
            return words[0][:self.MAX_SUBTOPIC_CODE_LENGTH].upper()
        
        # Multiple words - try different strategies
        # Strategy 1: Look for abbreviations (all caps words)
        abbrev_words = [w for w in words if w.isupper() and len(w) > 1]
        if abbrev_words:
            return abbrev_words[0][:self.MAX_SUBTOPIC_CODE_LENGTH]
        
        # Strategy 2: Take first letter of each word
        initials = ''.join(word[0].upper() for word in words)
        if len(initials) <= self.MAX_SUBTOPIC_CODE_LENGTH:
            return initials
        
        # Strategy 3: Combine first word with initials of others
        if len(words[0]) <= 4:
            remaining_initials = ''.join(word[0].upper() for word in words[1:])
            combined = words[0].upper() + remaining_initials
            return combined[:self.MAX_SUBTOPIC_CODE_LENGTH]
        
        # Strategy 4: Use first word only
        return words[0][:self.MAX_SUBTOPIC_CODE_LENGTH].upper()

    def get_type_code(self, question_type: str) -> str:
        """
        @function get_type_code
        @description Maps question type to single letter code
        @param question_type: Full question type name
        @returns: Single letter type code
        @example:
            code = get_type_code("GenConcept")  # Returns: "G"
            code = get_type_code("Problem")     # Returns: "P"
        """
        return self.TYPE_CODES.get(question_type, 'G')  # Default to 'G' for GenConcept

    async def get_next_sequence(self, base_id: str, supabase_client: Client) -> int:
        """
        @function get_next_sequence
        @description Finds the next available sequence number for a base ID pattern
        @param base_id: Base ID pattern (e.g., "DCF-WACC-B-G")
        @param supabase_client: Authenticated Supabase client
        @returns: Next available sequence number
        @example:
            sequence = await get_next_sequence("DCF-WACC-B-G", supabase)
            # If DCF-WACC-B-G-001 and DCF-WACC-B-G-002 exist, returns 3
        """
        try:
            # Query for existing IDs with this base pattern
            pattern = f"{base_id}-%"
            result = supabase_client.table('all_questions')\
                .select('question_id')\
                .like('question_id', pattern)\
                .order('question_id', desc=True)\
                .limit(50)\
                .execute()
            
            if not result.data:
                return 1  # No existing questions with this pattern
            
            # Extract sequence numbers and find the highest
            max_sequence = 0
            for row in result.data:
                question_id = row['question_id']
                # Extract sequence number from end of ID
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
        @description Ensures ID uniqueness by checking database and incrementing sequence if needed
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
        
        # Double-check uniqueness
        max_attempts = 10
        attempt = 0
        
        while attempt < max_attempts:
            try:
                # Check if this specific ID exists
                result = supabase_client.table('all_questions')\
                    .select('question_id')\
                    .eq('question_id', candidate_id)\
                    .execute()
                
                if not result.data:
                    # ID is unique
                    return candidate_id
                
                # ID exists, try next sequence
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
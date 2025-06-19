"""
@file backend/app/services/validation_service.py
@description Markdown file validation service for Q&A question uploads. Validates file structure, content, and transforms data for database insertion.
@created June 14, 2025. 11:27 a.m. Eastern Time
@updated June 14, 2025. 11:27 a.m. Eastern Time - Initial creation with comprehensive validation logic
@updated June 14, 2025. 3:40 p.m. Eastern Time - Fixed subtopic parsing by preserving hierarchical context during question block extraction
@updated June 14, 2025. 4:20 p.m. Eastern Time - Fixed critical parsing logic that was only capturing 1 question instead of all 89 questions due to flawed flow control
@updated June 19, 2025. 11:39 AM Eastern Time - Updated validation patterns to handle new markdown format with **Answer:** instead of **Brief Answer:**
@updated June 19, 2025. 11:44 AM Eastern Time - Added support for optional **Notes for Tutor:** field parsing
@updated June 19, 2025. 2:12 PM Eastern Time - Removed topic parameter from parse_markdown_to_questions - topics extracted from content

@architectural-context
Layer: Service Layer (Business Logic)
Dependencies: re (regex), typing (type hints), pydantic (validation), app.models.question
Pattern: Service layer pattern with validation and transformation responsibilities

@workflow-context
User Journey: File upload validation and processing workflow
Sequence Position: Called by upload router endpoints to validate markdown files before database operations
Inputs: Raw markdown file content and topic information
Outputs: Validation results and transformed question data ready for database insertion

@authentication-context
Auth Requirements: Called by authenticated upload endpoints only
Security: Input validation prevents injection attacks and ensures data integrity

@database-context
Tables: Validates data format for all_questions table schema
Operations: Prepares data for INSERT operations with proper validation
Transactions: Validation-only service, does not perform database operations directly
"""

import re
from typing import List, Dict, Tuple, Optional
from pydantic import BaseModel, ValidationError

from app.models.question import ParsedQuestionFromAI


class ValidationResult(BaseModel):
    """
    @class ValidationResult
    @description Result of markdown file validation with detailed feedback
    @example:
        result = ValidationResult(
            is_valid=True,
            errors=[],
            warnings=["Long content in question 1"],
            parsed_count=25
        )
    """
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    parsed_count: int
    line_numbers: Optional[Dict[str, int]] = None


class ParsedQuestion(BaseModel):
    """
    @class ParsedQuestion
    @description Individual question parsed from markdown with all required fields
    @example:
        question = ParsedQuestion(
            topic="Finance",
            subtopic="WACC Calculation",
            difficulty="Basic",
            type="GenConcept",
            question="What is WACC?",
            answer="Weighted Average Cost of Capital...",
            line_number=15
        )
    """
    topic: str
    subtopic: str
    difficulty: str
    type: str
    question: str
    answer: str
    notes_for_tutor: Optional[str] = None
    line_number: Optional[int] = None


class BatchUploadResult(BaseModel):
    """
    @class BatchUploadResult
    @description Result of batch question upload operation with detailed tracking
    @example:
        result = BatchUploadResult(
            total_attempted=25,
            successful_uploads=["DCF-WACC-B-G-001", "DCF-WACC-B-G-002"],
            failed_uploads=["DCF-WACC-B-P-001"],
            errors={"DCF-WACC-B-P-001": "Duplicate ID"}
        )
    """
    total_attempted: int
    successful_uploads: List[str]
    failed_uploads: List[str]
    errors: Dict[str, str]
    warnings: List[str] = []


class ValidationService:
    """
    @class ValidationService
    @description Main service class for markdown validation and question parsing
    """
    
    # Markdown structure patterns
    PATTERNS = {
        'topic': re.compile(r'^# Topic: (.+)$', re.MULTILINE),
        'subtopic': re.compile(r'^## Subtopic.*?:\s*(.+)$', re.MULTILINE),
        'difficulty': re.compile(r'^### Difficulty:\s*(Basic|Advanced)$', re.MULTILINE),
        'type': re.compile(r'^#### Type:\s*(.+)$', re.MULTILINE),
        'question': re.compile(r'^\s*\*\*Question:\*\*\s*(.+)$', re.MULTILINE),
        'answer': re.compile(r'^\s*\*\*Answer:\*\*\s*(.+)$', re.MULTILINE | re.DOTALL),
        'notes_for_tutor': re.compile(r'^\s*\*\*Notes for Tutor:\*\*\s*(.+?)(?=\n\n#|\n\s*$|$)', re.MULTILINE | re.DOTALL),
    }
    
    # Valid values for validation
    VALID_DIFFICULTIES = ['Basic', 'Advanced']
    VALID_TYPES = ['Definition', 'Problem', 'GenConcept', 'Calculation', 'Analysis', 'Question']
    
    # Content limits
    MAX_TOPIC_LENGTH = 100
    MAX_SUBTOPIC_LENGTH = 100
    MAX_QUESTION_LENGTH = 5000
    MAX_ANSWER_LENGTH = 10000

    def validate_markdown_structure(self, content: str) -> ValidationResult:
        """
        @function validate_markdown_structure
        @description Validates the overall markdown structure and hierarchy
        @param content: Raw markdown file content
        @returns: ValidationResult with structure validation details
        @example:
            result = service.validate_markdown_structure(file_content)
            if result.is_valid:
                print(f"Found {result.parsed_count} questions")
        """
        errors = []
        warnings = []
        line_numbers = {}
        
        lines = content.split('\n')
        
        # Check for required topic header
        topic_match = self.PATTERNS['topic'].search(content)
        if not topic_match:
            errors.append("Missing topic header. Expected format: '# Topic: Your Topic Name'")
        else:
            line_numbers['topic'] = self._find_line_number(lines, topic_match.group(0))
        
        # Check for subtopic sections
        subtopic_matches = list(self.PATTERNS['subtopic'].finditer(content))
        if not subtopic_matches:
            errors.append("No subtopic sections found. Expected format: '## Subtopic: Your Subtopic Name'")
        
        # Validate question blocks
        question_blocks = self._extract_question_blocks(content)
        parsed_count = len(question_blocks)
        
        if parsed_count == 0:
            errors.append("No question blocks found. Check formatting of **Question:** and **Answer:** sections. **Notes for Tutor:** is optional.")
        
        # Validate each question block structure
        for i, block in enumerate(question_blocks, 1):
            block_errors = self._validate_question_block_structure(block, i)
            errors.extend(block_errors)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            parsed_count=parsed_count,
            line_numbers=line_numbers
        )

    def validate_question_content(self, questions: List[ParsedQuestion]) -> ValidationResult:
        """
        @function validate_question_content
        @description Validates question content against database constraints
        @param questions: List of parsed questions to validate
        @returns: ValidationResult with content validation details
        @example:
            result = service.validate_question_content(parsed_questions)
            if not result.is_valid:
                for error in result.errors:
                    print(f"Validation error: {error}")
        """
        errors = []
        warnings = []
        
        for i, question in enumerate(questions, 1):
            # Validate difficulty
            if question.difficulty not in self.VALID_DIFFICULTIES:
                errors.append(f"Question {i}: Invalid difficulty '{question.difficulty}'. Must be: {', '.join(self.VALID_DIFFICULTIES)}")
            
            # Validate type
            if question.type not in self.VALID_TYPES:
                errors.append(f"Question {i}: Invalid type '{question.type}'. Must be: {', '.join(self.VALID_TYPES)}")
            
            # Validate field lengths
            if len(question.subtopic) > self.MAX_SUBTOPIC_LENGTH:
                errors.append(f"Question {i}: Subtopic exceeds {self.MAX_SUBTOPIC_LENGTH} characters")
            
            if len(question.question) > self.MAX_QUESTION_LENGTH:
                errors.append(f"Question {i}: Question text exceeds {self.MAX_QUESTION_LENGTH} characters")
            
            if len(question.answer) > self.MAX_ANSWER_LENGTH:
                errors.append(f"Question {i}: Answer text exceeds {self.MAX_ANSWER_LENGTH} characters")
            
            # Check for empty content
            if not question.question.strip():
                errors.append(f"Question {i}: Question text cannot be empty")
            
            if not question.answer.strip():
                errors.append(f"Question {i}: Answer text cannot be empty")
            
            # Generate warnings for long content
            if len(question.question) > 1000:
                warnings.append(f"Question {i}: Question text is very long ({len(question.question)} characters)")
            
            if len(question.answer) > 2000:
                warnings.append(f"Question {i}: Answer text is very long ({len(question.answer)} characters)")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            parsed_count=len(questions)
        )

    def parse_markdown_to_questions(self, content: str) -> Tuple[List[ParsedQuestion], ValidationResult]:
        """
        @function parse_markdown_to_questions
        @description Parses markdown content into structured question objects
        @param content: Raw markdown file content
        @returns: Tuple of (parsed questions list, validation result)
        @example:
            questions, result = service.parse_markdown_to_questions(content)
            if result.is_valid:
                for q in questions:
                    print(f"Parsed: {q.topic} - {q.subtopic} - {q.difficulty}")
        """
        # First validate structure
        structure_result = self.validate_markdown_structure(content)
        if not structure_result.is_valid:
            return [], structure_result
        
        questions = []
        question_blocks = self._extract_question_blocks(content)
        
        for block in question_blocks:
            try:
                question = self._parse_question_block(block)
                if question:
                    questions.append(question)
            except Exception as e:
                structure_result.errors.append(f"Error parsing question block: {str(e)}")
        
        # Validate content
        if questions:
            content_result = self.validate_question_content(questions)
            # Merge results
            structure_result.errors.extend(content_result.errors)
            structure_result.warnings.extend(content_result.warnings)
            structure_result.is_valid = structure_result.is_valid and content_result.is_valid
        
        return questions, structure_result

    def transform_to_api_format(self, questions: List[ParsedQuestion]) -> List[ParsedQuestionFromAI]:
        """
        @function transform_to_api_format
        @description Transforms parsed questions to API format for backend processing
        @param questions: List of parsed questions
        @returns: List of questions in API format
        @example:
            api_questions = service.transform_to_api_format(parsed_questions)
            # Ready for API submission
        """
        api_questions = []
        
        for question in questions:
            api_question = ParsedQuestionFromAI(
                subtopic=question.subtopic,
                difficulty=question.difficulty,
                type=question.type,
                question=question.question,
                answer=question.answer
            )
            api_questions.append(api_question)
        
        return api_questions

    def _extract_question_blocks(self, content: str) -> List[str]:
        """
        @function _extract_question_blocks
        @description Extracts individual question blocks from markdown content while preserving subtopic context
        @param content: Raw markdown content
        @returns: List of question block strings with subtopic context included
        """
        blocks = []
        lines = content.split('\n')
        
        current_subtopic = "Unknown"
        current_difficulty = None
        current_type = None
        current_question_block = []
        in_question_block = False
        
        def save_current_block():
            """Helper function to save the current question block if valid"""
            if in_question_block and len(current_question_block) > 3:
                block_content = '\n'.join(current_question_block)
                if '**Question:**' in block_content and '**Answer:**' in block_content:
                    blocks.append(block_content)
        
        for line in lines:
            line_stripped = line.strip()
            
            # Track subtopic changes
            subtopic_match = re.match(r'^## (?:Subtopic.*?:\s*)?(.+)$', line)
            if subtopic_match:
                # Save current block before changing subtopic
                save_current_block()
                current_subtopic = subtopic_match.group(1).strip()
                in_question_block = False
                current_question_block = []
                continue
            
            # Track difficulty changes
            difficulty_match = re.match(r'^### Difficulty:\s*(Basic|Advanced)$', line)
            if difficulty_match:
                # Save current block before changing difficulty
                save_current_block()
                current_difficulty = difficulty_match.group(1)
                in_question_block = False
                current_question_block = []
                continue
            
            # Track type changes
            type_match = re.match(r'^#### Type:\s*(.+)$', line)
            if type_match:
                # Save current block before changing type
                save_current_block()
                current_type = type_match.group(1).strip()
                in_question_block = False
                current_question_block = []
                continue
            
            # Detect question start (with or without indentation)
            if '**Question:**' in line_stripped:
                # Save any existing block before starting new one
                save_current_block()
                
                # Start new question block if we have context
                if current_difficulty and current_type:
                    in_question_block = True
                    current_question_block = [
                        f"## Subtopic: {current_subtopic}",
                        f"### Difficulty: {current_difficulty}",
                        f"#### Type: {current_type}",
                        line
                    ]
                continue
            
            # Collect question block content
            if in_question_block:
                current_question_block.append(line)
        
        # Handle the last question block
        save_current_block()
        
        return blocks

    def _parse_question_block(self, block: str) -> Optional[ParsedQuestion]:
        """
        @function _parse_question_block
        @description Parses a single question block into a ParsedQuestion object
        @param block: Question block content
        @returns: ParsedQuestion object or None if parsing fails
        """
        # Extract components
        difficulty_match = self.PATTERNS['difficulty'].search(block)
        type_match = self.PATTERNS['type'].search(block)
        question_match = self.PATTERNS['question'].search(block)
        answer_match = self.PATTERNS['answer'].search(block)
        notes_match = self.PATTERNS['notes_for_tutor'].search(block)
        
        if not all([difficulty_match, type_match, question_match, answer_match]):
            return None
        
        # Extract answer content (everything after **Answer:** until Notes for Tutor or end)
        answer_start = answer_match.start()
        if notes_match:
            # Answer ends where Notes for Tutor begins
            answer_end = notes_match.start()
            answer_content = block[answer_start:answer_end]
        else:
            # Answer goes to end of block
            answer_content = block[answer_start:]
        
        answer_text = re.sub(r'^\s*\*\*Answer:\*\*\s*', '', answer_content, flags=re.MULTILINE)
        # Clean up answer text (remove extra whitespace, but preserve formatting)
        answer_text = re.sub(r'\n\s*\n\s*\n', '\n\n', answer_text.strip())
        
        # Extract notes for tutor if present
        notes_for_tutor = None
        if notes_match:
            notes_text = notes_match.group(1).strip()
            # Don't include empty notes
            if notes_text:
                notes_for_tutor = notes_text
        
        # Extract topic from the block
        topic = "Unknown"
        topic_match = self.PATTERNS['topic'].search(block)
        if topic_match:
            topic = topic_match.group(1).strip()
        
        # Extract subtopic from the block (now properly included by _extract_question_blocks)
        subtopic = "Unknown"
        subtopic_match = self.PATTERNS['subtopic'].search(block)
        if subtopic_match:
            subtopic = subtopic_match.group(1).strip()
        
        return ParsedQuestion(
            topic=topic,
            subtopic=subtopic,
            difficulty=difficulty_match.group(1),
            type=type_match.group(1),
            question=question_match.group(1).strip(),
            answer=answer_text,
            notes_for_tutor=notes_for_tutor,
            line_number=None  # Would need line tracking for this
        )

    def _validate_question_block_structure(self, block: str, block_number: int) -> List[str]:
        """
        @function _validate_question_block_structure
        @description Validates the structure of a single question block
        @param block: Question block content
        @param block_number: Block number for error reporting
        @returns: List of validation errors
        """
        errors = []
        
        # Check for required patterns
        if not self.PATTERNS['difficulty'].search(block):
            errors.append(f"Question block {block_number}: Missing difficulty header")
        
        if not self.PATTERNS['type'].search(block):
            errors.append(f"Question block {block_number}: Missing type header")
        
        if not self.PATTERNS['question'].search(block):
            errors.append(f"Question block {block_number}: Missing **Question:** section")
        
        if not self.PATTERNS['answer'].search(block):
            errors.append(f"Question block {block_number}: Missing **Answer:** section")
        
        return errors

    def _find_line_number(self, lines: List[str], search_text: str) -> int:
        """
        @function _find_line_number
        @description Finds the line number of a specific text in the content
        @param lines: List of content lines
        @param search_text: Text to search for
        @returns: Line number (1-indexed) or 0 if not found
        """
        for i, line in enumerate(lines, 1):
            if search_text in line:
                return i
        return 0


# Service instance for dependency injection
validation_service = ValidationService()
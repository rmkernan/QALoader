#!/usr/bin/env python3
"""
Test script to validate the updated validation service with new markdown format
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.services.validation_service import ValidationService

def test_new_format():
    """Test the validation service with the new markdown format"""
    
    # Read the new format file
    with open('Docs/Supabase/BIW_Qs.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create validation service
    service = ValidationService()
    
    # Parse the content
    questions, result = service.parse_markdown_to_questions(content, "LBO")
    
    print(f"Validation Results:")
    print(f"  Is Valid: {result.is_valid}")
    print(f"  Parsed Count: {result.parsed_count}")
    print(f"  Questions Found: {len(questions)}")
    
    if result.errors:
        print("\nErrors:")
        for error in result.errors:
            print(f"  - {error}")
    
    if result.warnings:
        print("\nWarnings:")
        for warning in result.warnings:
            print(f"  - {warning}")
    
    # Show first question if parsed
    if questions:
        print(f"\nFirst Question:")
        q = questions[0]
        print(f"  Subtopic: {q.subtopic}")
        print(f"  Difficulty: {q.difficulty}")
        print(f"  Type: {q.type}")
        print(f"  Question: {q.question[:100]}...")
        print(f"  Answer: {q.answer[:100]}...")

if __name__ == "__main__":
    test_new_format()
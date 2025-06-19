#!/usr/bin/env python3
"""
Quick test script for the new ID generation system
Run from backend directory: python ../test_id_generation.py
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.utils.id_generator import IDGenerator

def test_id_generation():
    """Test the new ID generation system"""
    generator = IDGenerator()
    
    test_cases = [
        ("Accounting", "Financial Statements", "Basic", "Question"),
        ("Accounting", "Undefined", "Advanced", "Problem"),
        ("DCF", "WACC Calculation", "Basic", "GenConcept"),
        ("Finance", "Valuation Methods", "Advanced", "Analysis"),
        ("Business", "Marketing Strategy", "Basic", "Definition"),
    ]
    
    print("Testing new ID generation system:")
    print("=" * 50)
    
    for topic, subtopic, difficulty, question_type in test_cases:
        # Test topic normalization
        topic_code = generator.normalize_topic(topic)
        subtopic_code = generator.normalize_subtopic(subtopic)
        type_code = generator.get_type_code(question_type)
        
        # Generate base ID
        base_id = generator.generate_question_id(topic, subtopic, difficulty, question_type)
        
        print(f"Topic: '{topic}' → '{topic_code}'")
        print(f"Subtopic: '{subtopic}' → '{subtopic_code}'")
        print(f"Type: '{question_type}' → '{type_code}'")
        print(f"Full Base ID: {base_id}")
        print("-" * 30)
    
    print("\nAbbreviation Examples:")
    print("=" * 30)
    topics = ["Accounting", "Finance", "Economics", "DCF", "Mergers and Acquisitions", "Financial Modeling"]
    for topic in topics:
        abbrev = generator.normalize_topic(topic)
        print(f"'{topic}' → '{abbrev}'")
    
    print("\nSubtopic Examples:")
    print("=" * 30)
    subtopics = ["WACC Calculation", "Terminal Value", "Undefined", "Financial Statements", "Cash Flow Analysis"]
    for subtopic in subtopics:
        abbrev = generator.normalize_subtopic(subtopic)
        print(f"'{subtopic}' → '{abbrev}'")

if __name__ == "__main__":
    test_id_generation()
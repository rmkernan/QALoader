#!/usr/bin/env python3
"""
@file backend/update_question_ids.py
@description Script to update question ID abbreviation system in Supabase database
@created June 19, 2025. 2:45 PM Eastern Time - Initial script for question ID abbreviation updates
"""

import os
import sys
from typing import Dict, List, Any

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import Client, create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_supabase_client() -> Client:
    """Initialize and return Supabase client"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    
    return create_client(supabase_url, supabase_key)

def check_current_data(client: Client) -> Dict[str, Any]:
    """Check current state of the data before updates"""
    print("🔍 Checking current data state...")
    
    # Get sample of current data
    response = client.table('all_questions').select('question_id, topic, subtopic, difficulty, type').limit(10).execute()
    
    print(f"📊 Found {len(response.data)} sample records:")
    for record in response.data:
        print(f"  ID: {record['question_id']}, Topic: {record['topic']}, Subtopic: {record['subtopic']}, Type: {record['type']}")
    
    # Get counts of topics and subtopics that need updating
    topic_counts = {}
    subtopic_counts = {}
    
    # Count topics
    all_data = client.table('all_questions').select('topic, subtopic, type, question_id').execute()
    
    for record in all_data.data:
        topic = record['topic']
        subtopic = record['subtopic']
        
        topic_counts[topic] = topic_counts.get(topic, 0) + 1
        subtopic_counts[subtopic] = subtopic_counts.get(subtopic, 0) + 1
    
    print(f"\n📈 Topic counts:")
    for topic, count in topic_counts.items():
        print(f"  {topic}: {count}")
    
    print(f"\n📈 Subtopic counts:")
    for subtopic, count in subtopic_counts.items():
        print(f"  {subtopic}: {count}")
    
    return {
        'total_records': len(all_data.data),
        'topic_counts': topic_counts,
        'subtopic_counts': subtopic_counts,
        'sample_data': response.data
    }

def update_topics(client: Client) -> int:
    """Update topic values: 'Accounting' → 'ACC'"""
    print("\n🔄 Updating topics...")
    
    # Update Accounting to ACC
    response = client.table('all_questions').update({'topic': 'ACC'}).eq('topic', 'Accounting').execute()
    
    affected_rows = len(response.data) if response.data else 0
    print(f"✅ Updated {affected_rows} records from 'Accounting' to 'ACC'")
    
    return affected_rows

def update_subtopics(client: Client) -> int:
    """Update subtopic values to 'UND' for various undefined values"""
    print("\n🔄 Updating subtopics...")
    
    undefined_values = ['Undefined', 'undefined', 'Unknown', 'unknown', 'General', 'general', 'Misc', 'misc']
    total_affected = 0
    
    for value in undefined_values:
        response = client.table('all_questions').update({'subtopic': 'UND'}).eq('subtopic', value).execute()
        affected_rows = len(response.data) if response.data else 0
        if affected_rows > 0:
            print(f"✅ Updated {affected_rows} records from '{value}' to 'UND'")
            total_affected += affected_rows
    
    print(f"📊 Total subtopic records updated: {total_affected}")
    return total_affected

def update_question_ids(client: Client) -> int:
    """Update question_id patterns with new abbreviations"""
    print("\n🔄 Updating question IDs...")
    
    # Get all records to process
    all_records = client.table('all_questions').select('id, question_id, type').execute()
    
    updates_made = 0
    
    for record in all_records.data:
        original_id = record['question_id']
        new_id = original_id
        question_type = record['type']
        
        # Replace topic abbreviations at start of question_id
        if new_id.startswith('Accounting-'):
            new_id = new_id.replace('Accounting-', 'ACC-', 1)
        elif new_id.startswith('ACCOUNTING-'):
            new_id = new_id.replace('ACCOUNTING-', 'ACC-', 1)
        
        # Replace type abbreviations based on question type
        if question_type in ['GenConcept', 'Definition', 'Analysis']:
            new_id = new_id.replace('-G-', '-Q-').replace('-D-', '-Q-').replace('-A-', '-Q-')
        elif question_type == 'Calculation':
            new_id = new_id.replace('-C-', '-P-')
        
        # If changes were made, update the record
        if new_id != original_id:
            update_response = client.table('all_questions').update({'question_id': new_id}).eq('id', record['id']).execute()
            if update_response.data:
                print(f"✅ Updated: {original_id} → {new_id}")
                updates_made += 1
    
    print(f"📊 Total question IDs updated: {updates_made}")
    return updates_made

def verify_updates(client: Client) -> Dict[str, Any]:
    """Verify the updates were applied correctly"""
    print("\n🔍 Verifying updates...")
    
    # Get updated data
    response = client.table('all_questions').select('question_id, topic, subtopic, difficulty, type').limit(10).execute()
    
    print(f"📊 Sample of updated records:")
    for record in response.data:
        print(f"  ID: {record['question_id']}, Topic: {record['topic']}, Subtopic: {record['subtopic']}, Type: {record['type']}")
    
    # Get new counts
    all_data = client.table('all_questions').select('topic, subtopic, type, question_id').execute()
    
    topic_counts = {}
    subtopic_counts = {}
    
    for record in all_data.data:
        topic = record['topic']
        subtopic = record['subtopic']
        
        topic_counts[topic] = topic_counts.get(topic, 0) + 1
        subtopic_counts[subtopic] = subtopic_counts.get(subtopic, 0) + 1
    
    print(f"\n📈 Updated topic counts:")
    for topic, count in topic_counts.items():
        print(f"  {topic}: {count}")
    
    print(f"\n📈 Updated subtopic counts:")
    for subtopic, count in subtopic_counts.items():
        print(f"  {subtopic}: {count}")
    
    return {
        'total_records': len(all_data.data),
        'topic_counts': topic_counts,
        'subtopic_counts': subtopic_counts,
        'sample_data': response.data
    }

def main():
    """Main execution function"""
    print("🚀 Starting Question ID Abbreviation Update Process")
    print("=" * 60)
    
    try:
        # Initialize Supabase client
        client = get_supabase_client()
        print("✅ Connected to Supabase database")
        
        # Check current data state
        initial_state = check_current_data(client)
        
        # Perform updates
        topic_updates = update_topics(client)
        subtopic_updates = update_subtopics(client)
        id_updates = update_question_ids(client)
        
        # Verify updates
        final_state = verify_updates(client)
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 UPDATE SUMMARY")
        print("=" * 60)
        print(f"Total records in database: {final_state['total_records']}")
        print(f"Topics updated: {topic_updates}")
        print(f"Subtopics updated: {subtopic_updates}")
        print(f"Question IDs updated: {id_updates}")
        print(f"Total updates applied: {topic_updates + subtopic_updates + id_updates}")
        
        print("\n✅ Question ID abbreviation update process completed successfully!")
        
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
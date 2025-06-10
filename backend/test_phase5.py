#!/usr/bin/env python3
"""
Phase 5 Feature Test Script
Tests all new Phase 5 endpoints and enhanced features
"""

import asyncio
import json
from datetime import datetime

# Test imports
print("Testing Phase 5 imports...")
try:
    from app.services.analytics_service import AnalyticsService
    from app.services.question_service import QuestionService
    from app.database import supabase
    print("✅ All imports successful")
except Exception as e:
    print(f"❌ Import error: {e}")
    exit(1)

# Test enhanced bootstrap data
async def test_enhanced_bootstrap():
    print("\n1. Testing Enhanced Bootstrap Data...")
    try:
        service = QuestionService(supabase)
        data = await service.get_enhanced_bootstrap_data()
        
        # Check for new fields
        assert 'statistics' in data, "Missing statistics field"
        assert 'systemHealth' in data, "Missing systemHealth field"
        assert 'activityTrends' in data, "Missing activityTrends field"
        
        # Validate statistics
        stats = data['statistics']
        assert 'totalQuestions' in stats, "Missing totalQuestions"
        assert 'questionsByDifficulty' in stats, "Missing questionsByDifficulty"
        assert 'questionsByType' in stats, "Missing questionsByType"
        assert 'questionsByTopic' in stats, "Missing questionsByTopic"
        assert 'recentActivity' in stats, "Missing recentActivity"
        
        print(f"✅ Enhanced bootstrap working - Total questions: {stats['totalQuestions']}")
        print(f"   System health: {data['systemHealth']['status']}")
        print(f"   Activity trends: {len(data['activityTrends'])} days")
        
    except Exception as e:
        print(f"❌ Enhanced bootstrap failed: {e}")

# Test analytics service
async def test_analytics_service():
    print("\n2. Testing Analytics Service...")
    try:
        analytics = AnalyticsService(supabase)
        
        # Test dashboard metrics
        print("   Testing dashboard metrics...")
        metrics = await analytics.get_dashboard_metrics()
        assert 'questionMetrics' in metrics
        assert 'activityMetrics' in metrics
        assert 'topicMetrics' in metrics
        print(f"   ✅ Dashboard metrics: {metrics['questionMetrics']['total']} questions")
        
        # Test activity trends
        print("   Testing activity trends...")
        trends = await analytics.get_activity_trends(days=7)
        assert isinstance(trends, list)
        if trends:
            assert 'date' in trends[0]
            assert 'totalActivities' in trends[0]
            print(f"   ✅ Activity trends: {len(trends)} days of data")
        
        # Test performance metrics
        print("   Testing performance metrics...")
        perf = await analytics.get_performance_metrics()
        assert 'database' in perf
        assert 'queryPerformance' in perf
        print(f"   ✅ Performance metrics: DB status = {perf['database']['status']}")
        
        # Test content analytics
        print("   Testing content analytics...")
        content = await analytics.get_content_analytics()
        assert 'distribution' in content
        assert 'coverage' in content
        print(f"   ✅ Content analytics: {content['coverage']['coveredTopics']} topics covered")
        
    except Exception as e:
        import traceback
        print(f"❌ Analytics service failed: {e}")
        print(f"   Traceback: {traceback.format_exc()}")

# Test system event logging
async def test_system_event_logging():
    print("\n3. Testing System Event Logging...")
    try:
        service = QuestionService(supabase)
        
        # Log test event
        await service.log_system_event('Search Query', {
            'filters': {'topic': 'DCF', 'difficulty': 'Basic'},
            'results': 5,
            'response_time': 45.2
        })
        
        # Log another test event
        await service.log_system_event('Performance Alert', {
            'metric': 'query_time',
            'value': 150,
            'threshold': 100
        })
        
        # Check activity log
        activities = await service.get_activity_log(limit=5)
        print(f"✅ System event logging working - Recent activities: {len(activities)}")
        
    except Exception as e:
        print(f"❌ System event logging failed: {e}")

# Test basic bootstrap for comparison
async def test_basic_bootstrap():
    print("\n4. Testing Basic vs Enhanced Bootstrap...")
    try:
        service = QuestionService(supabase)
        
        # Get basic data
        basic_data = await service.get_bootstrap_data()
        # Count questions and convert to simple format for size comparison
        basic_questions = len(basic_data['questions'])
        basic_topics = len(basic_data['topics'])
        
        # Get enhanced data
        enhanced_data = await service.get_enhanced_bootstrap_data()
        enhanced_questions = len(enhanced_data['questions'])
        
        # Compare features
        basic_keys = set(basic_data.keys())
        enhanced_keys = set(enhanced_data.keys())
        new_features = enhanced_keys - basic_keys
        
        print(f"✅ Basic bootstrap: {basic_questions} questions, {basic_topics} topics")
        print(f"✅ Enhanced bootstrap: {enhanced_questions} questions, same data plus:")
        print(f"   New features: {', '.join(new_features)}")
        
    except Exception as e:
        print(f"❌ Bootstrap comparison failed: {e}")

# Run all tests
async def main():
    print("=== PHASE 5 FEATURE TESTING ===")
    print(f"Started at: {datetime.now().isoformat()}")
    
    await test_enhanced_bootstrap()
    await test_analytics_service()
    await test_system_event_logging()
    await test_basic_bootstrap()
    
    print("\n=== TESTING COMPLETE ===")

if __name__ == "__main__":
    asyncio.run(main())
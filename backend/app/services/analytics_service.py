"""
@file backend/app/services/analytics_service.py
@description Analytics service for Q&A Loader dashboard metrics, activity trends, and performance monitoring
@created 2025.06.10 12:30 AM ET
@updated 2025.06.10 12:30 AM ET - Initial creation for Phase 5

@architectural-context
Layer: Service Layer (Analytics & Metrics)
Dependencies: supabase (database), datetime (time calculations), typing (type hints)
Pattern: Analytics service pattern with dashboard metrics, trend analysis, and performance monitoring

@workflow-context
User Journey: Dashboard analytics and system monitoring workflows
Sequence Position: Called by analytics API routes after authentication
Inputs: Time ranges, metric types, aggregation parameters
Outputs: Dashboard metrics, activity trends, performance data, system health

@authentication-context
Auth Requirements: JWT Required for all analytics endpoints
Security: Read-only operations, no data modification

@database-context
Tables: all_questions (metrics), activity_log (trends and analysis)
Operations: SELECT only with aggregations and time-based queries
Transactions: Read-only analytical queries
"""

from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
from supabase import Client
import re


class AnalyticsService:
    """
    @class AnalyticsService
    @description Service for generating analytics, metrics, and performance data for the Q&A Loader dashboard
    @example:
        # Initialize service
        analytics = AnalyticsService(supabase_client)
        
        # Get dashboard metrics
        metrics = await analytics.get_dashboard_metrics()
        
        # Get activity trends
        trends = await analytics.get_activity_trends(days=30)
    """

    def __init__(self, db: Client):
        """
        @function __init__
        @description Initialize the analytics service with database client
        @param db: Supabase client for database operations
        """
        self.db = db

    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """Helper to parse various timestamp formats from Supabase"""
        # Remove timezone info for simplicity
        if '+' in timestamp_str:
            timestamp_str = timestamp_str.split('+')[0]
        elif 'Z' in timestamp_str:
            timestamp_str = timestamp_str.replace('Z', '')
        
        # Handle microseconds - pad with zeros if needed
        if '.' in timestamp_str:
            base, micro = timestamp_str.split('.')
            # Pad microseconds to 6 digits
            micro = micro.ljust(6, '0')[:6]
            timestamp_str = f"{base}.{micro}"
        
        return datetime.fromisoformat(timestamp_str)

    async def get_dashboard_metrics(self) -> Dict[str, Any]:
        """
        @function get_dashboard_metrics
        @description Real-time dashboard metrics including question statistics, activity summary, and content breakdown
        @returns: Comprehensive metrics dictionary for dashboard display
        @example:
            metrics = await analytics.get_dashboard_metrics()
            print(f"Total questions: {metrics['questionMetrics']['total']}")
            print(f"Active topics: {metrics['topicMetrics']['activeTopics']}")
        """
        # Get question metrics
        question_metrics = await self._get_question_metrics()
        
        # Get activity metrics
        activity_metrics = await self._get_activity_metrics()
        
        # Get topic metrics
        topic_metrics = await self._get_topic_metrics()
        
        # Get user engagement metrics
        engagement_metrics = await self._get_engagement_metrics()
        
        # Get time-based metrics
        time_metrics = await self._get_time_based_metrics()
        
        return {
            'questionMetrics': question_metrics,
            'activityMetrics': activity_metrics,
            'topicMetrics': topic_metrics,
            'engagementMetrics': engagement_metrics,
            'timeMetrics': time_metrics,
            'generatedAt': datetime.now().isoformat()
        }

    async def get_activity_trends(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        @function get_activity_trends
        @description Activity trends over specified period with daily breakdown
        @param days: Number of days to analyze (default: 7)
        @returns: List of daily activity summaries with trends
        @example:
            trends = await analytics.get_activity_trends(days=30)
            for trend in trends:
                print(f"{trend['date']}: {trend['totalActivities']} activities")
        """
        trends = []
        today = date.today()
        
        # Collect daily data
        for i in range(days):
            target_date = today - timedelta(days=i)
            daily_data = await self._get_daily_activity_data(target_date)
            trends.append(daily_data)
        
        # Sort chronologically (oldest to newest)
        trends.sort(key=lambda x: x['date'])
        
        # Calculate trend indicators
        trends = self._calculate_trend_indicators(trends)
        
        return trends

    async def get_performance_metrics(self) -> Dict[str, Any]:
        """
        @function get_performance_metrics
        @description System performance data including response times, database health, and resource usage
        @returns: Performance metrics dictionary
        @example:
            perf = await analytics.get_performance_metrics()
            print(f"Database status: {perf['database']['status']}")
            print(f"Average query time: {perf['queryPerformance']['avgTime']}ms")
        """
        # Database performance
        db_performance = await self._get_database_performance()
        
        # Query performance
        query_performance = await self._get_query_performance()
        
        # System resource usage
        resource_usage = await self._get_resource_usage()
        
        # API response times
        api_metrics = await self._get_api_metrics()
        
        return {
            'database': db_performance,
            'queryPerformance': query_performance,
            'resourceUsage': resource_usage,
            'apiMetrics': api_metrics,
            'timestamp': datetime.now().isoformat()
        }

    async def get_content_analytics(self) -> Dict[str, Any]:
        """
        @function get_content_analytics
        @description Detailed content analytics including question distribution, coverage gaps, and quality metrics
        @returns: Content analytics dictionary
        @example:
            content = await analytics.get_content_analytics()
            print(f"Question coverage: {content['coverage']['percentage']}%")
        """
        # Question distribution analysis
        distribution = await self._analyze_question_distribution()
        
        # Topic coverage analysis
        coverage = await self._analyze_topic_coverage()
        
        # Difficulty balance
        difficulty_balance = await self._analyze_difficulty_balance()
        
        # Question type distribution
        type_distribution = await self._analyze_type_distribution()
        
        return {
            'distribution': distribution,
            'coverage': coverage,
            'difficultyBalance': difficulty_balance,
            'typeDistribution': type_distribution
        }

    # Private helper methods

    async def _get_question_metrics(self) -> Dict[str, Any]:
        """Helper to get question-related metrics"""
        # Total questions
        total_result = self.db.table('all_questions').select('*', count='exact').execute()
        total = total_result.count or 0
        
        # Questions by difficulty
        difficulty_counts = {}
        for difficulty in ['Basic', 'Intermediate', 'Advanced']:
            result = self.db.table('all_questions').select('*', count='exact').eq('difficulty', difficulty).execute()
            difficulty_counts[difficulty] = result.count or 0
        
        # Questions by type
        type_counts = {}
        for qtype in ['Definition', 'Problem', 'Conceptual', 'Application', 'Synthesis']:
            result = self.db.table('all_questions').select('*', count='exact').eq('type', qtype).execute()
            type_counts[qtype] = result.count or 0
        
        # Recent questions (last 7 days)
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        recent_result = self.db.table('all_questions').select('*', count='exact').gte('created_at', week_ago).execute()
        recent_count = recent_result.count or 0
        
        return {
            'total': total,
            'byDifficulty': difficulty_counts,
            'byType': type_counts,
            'recentAdditions': recent_count,
            'averagePerTopic': total / max(1, len(await self._get_unique_topics()))
        }

    async def _get_activity_metrics(self) -> Dict[str, Any]:
        """Helper to get activity-related metrics"""
        # Total activities
        total_result = self.db.table('activity_log').select('*', count='exact').execute()
        total = total_result.count or 0
        
        # Activities by type
        activity_types = {}
        for action in ['Question Created', 'Question Updated', 'Question Deleted', 'Search Performed', 'Login']:
            result = self.db.table('activity_log').select('*', count='exact').ilike('action', f'%{action}%').execute()
            activity_types[action] = result.count or 0
        
        # Recent activities (last 24 hours)
        day_ago = (datetime.now() - timedelta(days=1)).isoformat()
        recent_result = self.db.table('activity_log').select('*', count='exact').gte('timestamp', day_ago).execute()
        recent_count = recent_result.count or 0
        
        # Peak activity hour
        peak_hour = await self._calculate_peak_activity_hour()
        
        return {
            'total': total,
            'byType': activity_types,
            'last24Hours': recent_count,
            'dailyAverage': total / max(1, 30),  # Assuming 30 days of data
            'peakHour': peak_hour
        }

    async def _get_topic_metrics(self) -> Dict[str, Any]:
        """Helper to get topic-related metrics"""
        topics = await self._get_unique_topics()
        
        # Questions per topic
        topic_counts = {}
        for topic in topics:
            result = self.db.table('all_questions').select('*', count='exact').eq('topic', topic).execute()
            topic_counts[topic] = result.count or 0
        
        # Most and least populated topics
        sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'totalTopics': len(topics),
            'questionsByTopic': topic_counts,
            'mostPopulated': sorted_topics[0] if sorted_topics else None,
            'leastPopulated': sorted_topics[-1] if sorted_topics else None,
            'averageQuestionsPerTopic': sum(topic_counts.values()) / max(1, len(topics))
        }

    async def _get_engagement_metrics(self) -> Dict[str, Any]:
        """Helper to get user engagement metrics"""
        # Search frequency
        search_result = self.db.table('activity_log').select('*', count='exact').ilike('action', '%search%').execute()
        search_count = search_result.count or 0
        
        # CRUD operation frequency
        crud_ops = {
            'creates': self.db.table('activity_log').select('*', count='exact').ilike('action', '%created%').execute().count or 0,
            'updates': self.db.table('activity_log').select('*', count='exact').ilike('action', '%updated%').execute().count or 0,
            'deletes': self.db.table('activity_log').select('*', count='exact').ilike('action', '%deleted%').execute().count or 0
        }
        
        # Active days (days with at least one activity)
        active_days = await self._count_active_days()
        
        return {
            'searchFrequency': search_count,
            'crudOperations': crud_ops,
            'activeDays': active_days,
            'engagementScore': self._calculate_engagement_score(search_count, crud_ops, active_days)
        }

    async def _get_time_based_metrics(self) -> Dict[str, Any]:
        """Helper to get time-based metrics"""
        now = datetime.now()
        
        # This hour
        hour_ago = (now - timedelta(hours=1)).isoformat()
        hour_result = self.db.table('activity_log').select('*', count='exact').gte('timestamp', hour_ago).execute()
        
        # Today
        today_start = datetime.combine(date.today(), datetime.min.time()).isoformat()
        today_result = self.db.table('activity_log').select('*', count='exact').gte('timestamp', today_start).execute()
        
        # This week
        week_ago = (now - timedelta(days=7)).isoformat()
        week_result = self.db.table('activity_log').select('*', count='exact').gte('timestamp', week_ago).execute()
        
        # This month
        month_ago = (now - timedelta(days=30)).isoformat()
        month_result = self.db.table('activity_log').select('*', count='exact').gte('timestamp', month_ago).execute()
        
        return {
            'lastHour': hour_result.count or 0,
            'today': today_result.count or 0,
            'thisWeek': week_result.count or 0,
            'thisMonth': month_result.count or 0
        }

    async def _get_daily_activity_data(self, target_date: date) -> Dict[str, Any]:
        """Helper to get activity data for a specific day"""
        start_time = datetime.combine(target_date, datetime.min.time())
        end_time = start_time + timedelta(days=1)
        
        # Total activities
        activities = self.db.table('activity_log').select('*').gte(
            'timestamp', start_time.isoformat()
        ).lt('timestamp', end_time.isoformat()).execute()
        
        # Questions created
        questions = self.db.table('all_questions').select('*', count='exact').gte(
            'created_at', start_time.isoformat()
        ).lt('created_at', end_time.isoformat()).execute()
        
        # Activity breakdown by type
        activity_breakdown = {}
        for activity in activities.data:
            action = activity.get('action', 'Unknown')
            activity_breakdown[action] = activity_breakdown.get(action, 0) + 1
        
        return {
            'date': target_date.isoformat(),
            'dayOfWeek': target_date.strftime('%A'),
            'totalActivities': len(activities.data),
            'questionsCreated': questions.count or 0,
            'activityBreakdown': activity_breakdown,
            'peakHour': self._find_peak_hour(activities.data)
        }

    async def _get_database_performance(self) -> Dict[str, Any]:
        """Helper to assess database performance"""
        try:
            # Test query performance
            start_time = datetime.now()
            test_result = self.db.table('all_questions').select('question_id').limit(1).execute()
            query_time = (datetime.now() - start_time).total_seconds() * 1000  # Convert to ms
            
            return {
                'status': 'healthy' if query_time < 100 else 'degraded',
                'connectionActive': True,
                'lastQueryTime': f"{query_time:.2f}ms",
                'healthScore': min(100, max(0, 100 - query_time))
            }
        except Exception as e:
            return {
                'status': 'error',
                'connectionActive': False,
                'error': str(e),
                'healthScore': 0
            }

    async def _get_unique_topics(self) -> List[str]:
        """Helper to get unique topics"""
        result = self.db.table('all_questions').select('topic').execute()
        topics = list(set(row['topic'] for row in result.data if row.get('topic')))
        return sorted(topics)

    async def _calculate_peak_activity_hour(self) -> int:
        """Helper to calculate peak activity hour"""
        # Get activities from last 7 days
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        activities = self.db.table('activity_log').select('timestamp').gte('timestamp', week_ago).execute()
        
        # Count activities by hour
        hour_counts = {}
        for activity in activities.data:
            timestamp = self._parse_timestamp(activity['timestamp'])
            hour = timestamp.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        # Find peak hour
        if hour_counts:
            peak_hour = max(hour_counts.items(), key=lambda x: x[1])[0]
            return peak_hour
        return 12  # Default to noon if no data

    async def _count_active_days(self) -> int:
        """Helper to count days with activity"""
        # Get all activities from last 30 days
        month_ago = (datetime.now() - timedelta(days=30)).isoformat()
        activities = self.db.table('activity_log').select('timestamp').gte('timestamp', month_ago).execute()
        
        # Count unique days
        unique_days = set()
        for activity in activities.data:
            timestamp = self._parse_timestamp(activity['timestamp'])
            unique_days.add(timestamp.date())
        
        return len(unique_days)

    def _calculate_trend_indicators(self, trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Helper to calculate trend indicators"""
        for i, trend in enumerate(trends):
            if i > 0:
                prev = trends[i-1]
                trend['activityChange'] = trend['totalActivities'] - prev['totalActivities']
                trend['questionChange'] = trend['questionsCreated'] - prev['questionsCreated']
                trend['trend'] = 'up' if trend['activityChange'] > 0 else 'down' if trend['activityChange'] < 0 else 'stable'
            else:
                trend['activityChange'] = 0
                trend['questionChange'] = 0
                trend['trend'] = 'stable'
        return trends

    def _calculate_engagement_score(self, searches: int, crud_ops: Dict[str, int], active_days: int) -> float:
        """Helper to calculate engagement score (0-100)"""
        # Weighted scoring
        crud_total = sum(crud_ops.values())
        score = (
            (searches * 0.3) +  # 30% weight for searches
            (crud_total * 0.4) +  # 40% weight for CRUD operations
            (active_days * 3.33)  # 30% weight for active days (max 30 days)
        )
        return min(100, score / 10)  # Normalize to 0-100

    def _find_peak_hour(self, activities: List[Dict[str, Any]]) -> Optional[int]:
        """Helper to find peak hour from activity list"""
        if not activities:
            return None
            
        hour_counts = {}
        for activity in activities:
            timestamp = self._parse_timestamp(activity['timestamp'])
            hour = timestamp.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        if hour_counts:
            return max(hour_counts.items(), key=lambda x: x[1])[0]
        return None

    async def _get_query_performance(self) -> Dict[str, Any]:
        """Helper to get query performance metrics"""
        # Simulate query performance testing
        query_times = []
        
        # Test different query types
        queries = [
            ('simple', self.db.table('all_questions').select('question_id').limit(1)),
            ('filter', self.db.table('all_questions').select('*').eq('difficulty', 'Basic').limit(10)),
            ('count', self.db.table('all_questions').select('*', count='exact'))
        ]
        
        for query_type, query in queries:
            start = datetime.now()
            try:
                result = query.execute()
                elapsed = (datetime.now() - start).total_seconds() * 1000
                query_times.append({'type': query_type, 'time': elapsed, 'status': 'success'})
            except Exception as e:
                query_times.append({'type': query_type, 'time': 0, 'status': 'error', 'error': str(e)})
        
        avg_time = sum(q['time'] for q in query_times if q['status'] == 'success') / max(1, len(query_times))
        
        return {
            'avgTime': round(avg_time, 2),
            'queries': query_times,
            'performance': 'good' if avg_time < 50 else 'fair' if avg_time < 100 else 'poor'
        }

    async def _get_resource_usage(self) -> Dict[str, Any]:
        """Helper to estimate resource usage"""
        # Get counts
        questions_count = self.db.table('all_questions').select('*', count='exact').execute().count or 0
        activities_count = self.db.table('activity_log').select('*', count='exact').execute().count or 0
        
        # Estimate storage
        avg_question_kb = 2
        avg_activity_kb = 0.5
        total_storage_mb = (questions_count * avg_question_kb + activities_count * avg_activity_kb) / 1024
        
        return {
            'storage': {
                'totalMB': round(total_storage_mb, 2),
                'questionsKB': questions_count * avg_question_kb,
                'activitiesKB': activities_count * avg_activity_kb
            },
            'records': {
                'questions': questions_count,
                'activities': activities_count,
                'total': questions_count + activities_count
            }
        }

    async def _get_api_metrics(self) -> Dict[str, Any]:
        """Helper to get API performance metrics"""
        # This would typically come from API monitoring
        # For now, return placeholder data
        return {
            'avgResponseTime': 45.2,
            'successRate': 99.5,
            'errorRate': 0.5,
            'requestsPerMinute': 12
        }

    async def _analyze_question_distribution(self) -> Dict[str, Any]:
        """Helper to analyze question distribution"""
        questions = self.db.table('all_questions').select('topic', 'subtopic', 'difficulty', 'type').execute()
        
        # Topic-subtopic distribution
        topic_subtopic = {}
        for q in questions.data:
            topic = q['topic']
            subtopic = q['subtopic']
            if topic not in topic_subtopic:
                topic_subtopic[topic] = {}
            topic_subtopic[topic][subtopic] = topic_subtopic[topic].get(subtopic, 0) + 1
        
        return {
            'topicSubtopicBreakdown': topic_subtopic,
            'totalCombinations': sum(len(subtopics) for subtopics in topic_subtopic.values())
        }

    async def _analyze_topic_coverage(self) -> Dict[str, Any]:
        """Helper to analyze topic coverage"""
        # Define expected topics (could be configuration-driven)
        expected_topics = ['DCF', 'Valuation', 'Financial Statements', 'Ratios', 'M&A', 'LBO']
        
        actual_topics = await self._get_unique_topics()
        covered = [t for t in expected_topics if t in actual_topics]
        missing = [t for t in expected_topics if t not in actual_topics]
        
        return {
            'expectedTopics': len(expected_topics),
            'coveredTopics': len(covered),
            'missingTopics': missing,
            'coveragePercentage': (len(covered) / len(expected_topics)) * 100 if expected_topics else 0,
            'additionalTopics': [t for t in actual_topics if t not in expected_topics]
        }

    async def _analyze_difficulty_balance(self) -> Dict[str, Any]:
        """Helper to analyze difficulty balance"""
        difficulties = ['Basic', 'Intermediate', 'Advanced']
        counts = {}
        
        for diff in difficulties:
            result = self.db.table('all_questions').select('*', count='exact').eq('difficulty', diff).execute()
            counts[diff] = result.count or 0
        
        total = sum(counts.values())
        ideal_percentage = 100 / len(difficulties)
        
        balance_scores = {}
        for diff, count in counts.items():
            actual_percentage = (count / total * 100) if total > 0 else 0
            deviation = abs(actual_percentage - ideal_percentage)
            balance_scores[diff] = {
                'count': count,
                'percentage': round(actual_percentage, 1),
                'deviation': round(deviation, 1)
            }
        
        overall_balance = 100 - (sum(bs['deviation'] for bs in balance_scores.values()) / len(difficulties))
        
        return {
            'distribution': balance_scores,
            'overallBalance': round(overall_balance, 1),
            'recommendation': self._get_balance_recommendation(balance_scores)
        }

    async def _analyze_type_distribution(self) -> Dict[str, Any]:
        """Helper to analyze question type distribution"""
        types = ['Definition', 'Problem', 'Conceptual', 'Application', 'Synthesis']
        distribution = {}
        
        for qtype in types:
            result = self.db.table('all_questions').select('*', count='exact').eq('type', qtype).execute()
            distribution[qtype] = result.count or 0
        
        total = sum(distribution.values())
        
        return {
            'distribution': distribution,
            'dominantType': max(distribution.items(), key=lambda x: x[1])[0] if distribution else None,
            'leastCommonType': min(distribution.items(), key=lambda x: x[1])[0] if distribution else None,
            'diversity': len([t for t in distribution.values() if t > 0]) / len(types) * 100
        }

    def _get_balance_recommendation(self, balance_scores: Dict[str, Dict[str, Any]]) -> str:
        """Helper to generate balance recommendation"""
        # Find the most underrepresented difficulty
        min_diff = min(balance_scores.items(), key=lambda x: x[1]['percentage'])
        max_diff = max(balance_scores.items(), key=lambda x: x[1]['percentage'])
        
        if balance_scores[min_diff[0]]['percentage'] < 20:
            return f"Consider adding more {min_diff[0]} questions"
        elif balance_scores[max_diff[0]]['percentage'] > 50:
            return f"Consider diversifying beyond {max_diff[0]} questions"
        else:
            return "Good balance across difficulty levels"
/**
 * @file components/DashboardView.tsx
 * @description Defines the Dashboard view, providing an overview of Q&A content metrics, breakdowns, and recent activity.
 * @created June 9, 2025. 1:00 p.m. Eastern Time
 * @updated June 9, 2025. 1:12 p.m. Eastern Time - Applied LLM-focused documentation standards.
 * 
 * @architectural-context
 * Layer: UI Component (Application View/Page)
 * Dependencies: Consumes AppContext for all data (topicSummaries, questions, activityLog, etc.) and for navigation functions (setInitialCurationFilters).
 * Pattern: Data display and summarization, context consumption, navigation trigger.
 * 
 * @workflow-context  
 * User Journey: Monitoring content health, reviewing recent changes, navigating to specific content sets.
 * Sequence Position: Typically the initial view after login.
 * Inputs: Data from AppContext, user interactions with topic links or activity items.
 * Outputs: Renders dashboard UI, triggers navigation to CurationView with filters.
 * 
 * @authentication-context N/A (View is auth-gated by App.tsx)
 * @mock-data-context Consumes data from AppContext, which includes its own loading states and fallback data mechanisms.
 */
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { View, ActivityLogItem, Filters } from '../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean; // Controls display of a skeleton loader
}

/**
 * @component MetricCard
 * @description Displays a single key metric using modern card anatomy and sophisticated design patterns.
 * @param {MetricCardProps} props - Title, value, and loading state for the metric.
 * @returns {JSX.Element}
 */
const MetricCard: React.FC<MetricCardProps> = ({ title, value, isLoading }) => (
  <div className="bg-white rounded-xl shadow-lg shadow-slate-900/5 border-0 p-6 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 transform hover:-translate-y-0.5">
    {/* Card Header - Supporting text with sophisticated spacing */}
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
    </div>
    
    {/* Card Body - Primary metric value */}
    <div className="mb-2">
      {isLoading ? (
        <div className="h-10 w-24 bg-gradient-to-r from-slate-200 to-slate-300 animate-pulse rounded-lg"></div>
      ) : (
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
      )}
    </div>
    
    {/* Card Footer - Subtle visual accent */}
    <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
  </div>
);

/**
 * @function formatRelativeTime
 * @description Converts a Unix timestamp (milliseconds) to a human-readable relative time string (e.g., "5m ago").
 * @param {number} timestamp - The timestamp to format.
 * @returns {string} Relative time string.
 */
const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.round((now - timestamp) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 5) return `just now`;
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

/**
 * @component ActivityIcon
 * @description Renders a simple decorative icon for activity log items.
 * @param {{className?: string}} props - Optional styling.
 * @returns {JSX.Element}
 */
const ActivityIcon: React.FC<{className?: string}> = ({className = "h-5 w-5 text-slate-400 mr-3 mt-0.5"}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

/**
 * @component DifficultyLegend
 * @description Renders a sophisticated legend for difficulty colors used in charts, following modern design patterns.
 * @returns {JSX.Element}
 */
const DifficultyLegend: React.FC = () => (
    <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Difficulty Scale</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center">
                <span className="h-3 w-3 rounded-md bg-gradient-to-r from-sky-400 to-sky-500 mr-2 shadow-sm"></span>
                <span className="text-sm font-medium text-slate-700">Basic</span>
            </div>
            <div className="flex items-center">
                <span className="h-3 w-3 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 mr-2 shadow-sm"></span>
                <span className="text-sm font-medium text-slate-700">Advanced</span>
            </div>
            <div className="flex items-center">
                <span className="h-3 w-3 rounded-md bg-gradient-to-r from-slate-400 to-slate-500 mr-2 shadow-sm"></span>
                <span className="text-sm font-medium text-slate-700">Other</span>
            </div>
        </div>
    </div>
);


interface DashboardViewProps {
  setActiveView: (view: View) => void;
}

/**
 * @component DashboardView
 * @description Main component for the Dashboard view. Aggregates and displays metrics, content breakdowns, and recent activity.
 * @param {DashboardViewProps} props - Props for setting the active view.
 * @returns {JSX.Element}
 */
const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
  const { 
    topicSummaries, 
    questions, 
    lastUploadTimestamp, 
    isContextLoading,
    setInitialCurationFilters,
    activityLog
  } = useAppContext();

  // Calculate derived metrics for display
  const totalQuestions = questions.length;
  const totalTopics = topicSummaries.length;
  const totalSubtopics = new Set(questions.map(q => `${q.topic}-${q.subtopic}`)).size;

  const lastUploadText = lastUploadTimestamp 
    ? new Date(lastUploadTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';
  
  // Handles navigation to CurationView with pre-set filters
  const navigateToCurationWithFilters = (filters: Partial<Filters>) => {
    setInitialCurationFilters(filters);
    setActiveView(View.CURATION);
  };
  
  const handleTopicClick = (topicName: string) => {
    navigateToCurationWithFilters({ topic: topicName, subtopic: "All Subtopics", difficulty: "All Difficulties", type: "All Types", searchText: "" });
  };

  const handleActivityItemClick = (logItem: ActivityLogItem) => {
    if (logItem.action === "Edited question" || logItem.action === "Deleted question" || logItem.action === "Added new question") {
      if (logItem.details) { // details should be question ID
        navigateToCurationWithFilters({ searchText: logItem.details });
      }
    } else if (logItem.action === "Uploaded questions for topic" || logItem.action === "Loaded questions to topic") {
      if (logItem.details) { // details should be topic name
        navigateToCurationWithFilters({ topic: logItem.details });
      }
    }
  };

  const maxQuestionsInAnyTopic = Math.max(...topicSummaries.map(s => s.totalQuestions), 1); // Avoid division by zero for bar chart scaling

  return (
    <div className="view-enter-active p-8 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-slate-800 mb-8 tracking-tight">Dashboard</h2>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard title="Total Questions" value={totalQuestions} isLoading={isContextLoading} />
          <MetricCard title="Topics" value={totalTopics} isLoading={isContextLoading} />
          <MetricCard title="Subtopics" value={totalSubtopics} isLoading={isContextLoading} />
          <MetricCard title="Last Upload" value={lastUploadText} isLoading={isContextLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Breakdown Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg shadow-slate-900/5 border-0 p-8 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4 mb-8">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Content Breakdown</h3>
            <p className="text-sm text-slate-600 mt-1">Visual overview of questions by topic and difficulty</p>
          </div>
          {isContextLoading ? (
              // Skeleton loader for content breakdown
              <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                          <div className="h-5 w-1/2 bg-slate-200 rounded mb-2"></div> {/* Topic Name */}
                          <div className="h-4 w-full bg-slate-200 rounded mb-1"></div> {/* Bar */}
                          <div className="h-3 w-3/4 bg-slate-200 rounded"></div> {/* Difficulty bar */}
                      </div>
                  ))}
              </div>
          ) : topicSummaries.length > 0 ? (
            <div className="space-y-6">
              {topicSummaries.sort((a,b) => b.totalQuestions - a.totalQuestions).map((summary) => {
                const otherCount = summary.totalQuestions - summary.basicCount - summary.advancedCount;
                const basicPercent = summary.totalQuestions > 0 ? (summary.basicCount / summary.totalQuestions) * 100 : 0;
                const advancedPercent = summary.totalQuestions > 0 ? (summary.advancedCount / summary.totalQuestions) * 100 : 0;
                const otherPercent = summary.totalQuestions > 0 ? (otherCount / summary.totalQuestions) * 100 : 0;
                
                const barWidthPercent = summary.totalQuestions > 0 ? (summary.totalQuestions / maxQuestionsInAnyTopic) * 100 : 0;

                return (
                  <div key={summary.name} className="bg-slate-50/50 rounded-lg p-4 border border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex justify-between items-center mb-3">
                        <button 
                          onClick={() => handleTopicClick(summary.name)}
                          className="text-slate-800 hover:text-emerald-700 font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 rounded"
                          aria-label={`Filter by topic: ${summary.name}`}
                        >
                          {summary.name}
                        </button>
                        <div className="text-right">
                          <span className="text-lg font-bold text-slate-800">{summary.totalQuestions}</span>
                          <span className="text-sm text-slate-500 ml-1">questions</span>
                        </div>
                    </div>
                    
                    {/* Enhanced Bar Chart for Total Questions */}
                    <button
                        onClick={() => handleTopicClick(summary.name)}
                        className="w-full bg-slate-200 rounded-lg h-6 mb-4 group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 shadow-inner"
                        aria-label={`View questions for topic: ${summary.name}`}
                        title={`View questions for ${summary.name} (${summary.totalQuestions} total)`}
                    >
                        <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-6 rounded-lg flex items-center justify-between text-xs text-white px-3 group-hover:from-emerald-600 group-hover:to-teal-700 transition-all duration-200 shadow-sm" 
                            style={{ width: `${Math.max(barWidthPercent, 12)}%` }}
                        >
                           <span className="font-medium">{summary.totalQuestions}</span>
                           {barWidthPercent > 30 && <span className="text-emerald-100">questions</span>}
                        </div>
                    </button>

                    {/* Enhanced Difficulty Breakdown */}
                    {summary.totalQuestions > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Difficulty Split</span>
                            <div className="flex items-center space-x-4 text-xs text-slate-600">
                              {summary.basicCount > 0 && <span>Basic: {summary.basicCount}</span>}
                              {summary.advancedCount > 0 && <span>Advanced: {summary.advancedCount}</span>}
                              {otherCount > 0 && <span>Other: {otherCount}</span>}
                            </div>
                          </div>
                          
                          {/* Sophisticated Stacked Progress Bar */}
                          <div className="flex h-4 w-full rounded-lg overflow-hidden bg-slate-200 shadow-inner" title={`Basic: ${summary.basicCount}, Advanced: ${summary.advancedCount}, Other: ${otherCount}`}>
                              <div 
                                  className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 transition-all duration-200 first:rounded-l-lg" 
                                  style={{ width: `${basicPercent}%` }}
                                  title={`Basic: ${summary.basicCount} (${basicPercent.toFixed(0)}%)`}
                              ></div>
                              <div 
                                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all duration-200" 
                                  style={{ width: `${advancedPercent}%` }}
                                  title={`Advanced: ${summary.advancedCount} (${advancedPercent.toFixed(0)}%)`}
                              ></div>
                              <div 
                                  className="bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 transition-all duration-200 last:rounded-r-lg" 
                                  style={{ width: `${otherPercent}%` }}
                                  title={`Other: ${otherCount} (${otherPercent.toFixed(0)}%)`}
                              ></div>
                          </div>
                        </div>
                    )}
                  </div>
                );
              })}
              <DifficultyLegend />
            </div>
          ) : (
              <p className="text-slate-500">No content available. Try loading some questions from Markdown.</p>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-lg shadow-slate-900/5 border-0 p-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Recent Activity</h3>
            <p className="text-sm text-slate-600 mt-1">Latest changes and updates</p>
          </div>
          {isContextLoading && activityLog.length === 0 ? (
            // Skeleton loader for activity feed
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center">
                        <div className="h-5 w-5 bg-slate-200 rounded-full mr-3"></div>
                        <div className="flex-1">
                            <div className="h-4 w-3/4 bg-slate-200 rounded mb-1"></div>
                            <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
          ) : activityLog.length > 0 ? (
            <div className="space-y-0 max-h-96 overflow-y-auto">
              {activityLog.slice(0, 10).map((logItem: ActivityLogItem) => {
                const isActionable = (logItem.action === "Edited question" || logItem.action === "Deleted question" || logItem.action === "Added new question" || logItem.action === "Uploaded questions for topic" || logItem.action === "Loaded questions to topic") && logItem.details;
                const ActionWrapper = isActionable ? 'button' : 'div';
                
                return (
                  <ActionWrapper
                    key={logItem.id} 
                    onClick={isActionable ? () => handleActivityItemClick(logItem) : undefined}
                    className={`flex items-start py-3 px-3 -mx-3 border-b border-slate-50 last:border-b-0 w-full text-left transition-all duration-150 ${isActionable ? 'cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:bg-emerald-50/50' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <ActivityIcon className="h-5 w-5 text-emerald-600 mr-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isActionable ? 'text-slate-800 group-hover:text-emerald-800' : 'text-slate-800'}`}>
                        {logItem.action} 
                        {logItem.details && (
                          <span className={`font-semibold ml-1 ${isActionable ? 'text-emerald-700' : 'text-slate-700'}`} title={logItem.details}>
                            {logItem.details}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{formatRelativeTime(logItem.timestamp)}</p>
                    </div>
                    {isActionable && (
                      <div className="flex-shrink-0 ml-2 mt-1">
                        <svg className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    )}
                  </ActionWrapper>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ActivityIcon className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No recent activity recorded</p>
              <p className="text-xs text-slate-400 mt-1">Activity will appear here as you make changes</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default DashboardView;
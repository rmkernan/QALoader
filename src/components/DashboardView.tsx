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
 * @description Displays a single key metric, with a loading state.
 * @param {MetricCardProps} props - Title, value, and loading state for the metric.
 * @returns {JSX.Element}
 */
const MetricCard: React.FC<MetricCardProps> = ({ title, value, isLoading }) => (
  <div className="bg-white p-6 rounded-lg shadow-md animate-fadeIn">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    {isLoading ? (
        <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-1"></div>
    ) : (
        <p className="text-3xl font-bold text-slate-900">{value}</p>
    )}
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
 * @description Renders a static legend for difficulty colors used in charts.
 * @returns {JSX.Element}
 */
const DifficultyLegend: React.FC = () => (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center">
            <span className="h-3 w-3 rounded-sm bg-sky-500 mr-2"></span>
            <span className="text-xs text-slate-600">Basic</span>
        </div>
        <div className="flex items-center">
            <span className="h-3 w-3 rounded-sm bg-amber-500 mr-2"></span>
            <span className="text-xs text-slate-600">Advanced</span>
        </div>
        <div className="flex items-center">
            <span className="h-3 w-3 rounded-sm bg-slate-400 mr-2"></span>
            <span className="text-xs text-slate-600">Other</span>
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
    <div className="view-enter-active p-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h2>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Questions" value={totalQuestions} isLoading={isContextLoading} />
        <MetricCard title="Topics" value={totalTopics} isLoading={isContextLoading} />
        <MetricCard title="Subtopics" value={totalSubtopics} isLoading={isContextLoading} />
        <MetricCard title="Last Upload" value={lastUploadText} isLoading={isContextLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Breakdown Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md animate-fadeIn">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Content Breakdown</h3>
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
                  <div key={summary.name}>
                    <div className="flex justify-between items-center mb-1">
                        <button 
                          onClick={() => handleTopicClick(summary.name)}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded font-semibold text-slate-800"
                          aria-label={`Filter by topic: ${summary.name}`}
                        >
                          {summary.name}
                        </button>
                        <span className="text-sm text-slate-500">{summary.totalQuestions} total</span>
                    </div>
                    
                    {/* Bar Chart for Total Questions */}
                    <button
                        onClick={() => handleTopicClick(summary.name)}
                        className="w-full bg-slate-200 rounded-full h-5 mb-2 group focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
                        aria-label={`View questions for topic: ${summary.name}`}
                        title={`View questions for ${summary.name} (${summary.totalQuestions} total)`}
                    >
                        <div 
                            className="bg-indigo-500 h-5 rounded-full flex items-center justify-end text-xs text-white pr-2 group-hover:bg-indigo-600 transition-colors duration-150" 
                            style={{ width: `${barWidthPercent}%` }}
                        >
                           {summary.totalQuestions > 0 && barWidthPercent > 10 ? summary.totalQuestions : ''}
                        </div>
                    </button>

                    {/* Stacked Progress Bar for Difficulty */}
                    {summary.totalQuestions > 0 && (
                        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100" title={`Basic: ${summary.basicCount}, Advanced: ${summary.advancedCount}, Other: ${otherCount}`}>
                            <div 
                                className="bg-sky-500 hover:opacity-80 transition-opacity" 
                                style={{ width: `${basicPercent}%` }}
                                title={`Basic: ${summary.basicCount} (${basicPercent.toFixed(0)}%)`}
                            ></div>
                            <div 
                                className="bg-amber-500 hover:opacity-80 transition-opacity" 
                                style={{ width: `${advancedPercent}%` }}
                                title={`Advanced: ${summary.advancedCount} (${advancedPercent.toFixed(0)}%)`}
                            ></div>
                            <div 
                                className="bg-slate-400 hover:opacity-80 transition-opacity" 
                                style={{ width: `${otherPercent}%` }}
                                title={`Other: ${otherCount} (${otherPercent.toFixed(0)}%)`}
                            ></div>
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
        <div className="bg-white p-6 rounded-lg shadow-md animate-fadeIn">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h3>
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
            <div className="space-y-1 -mb-2 max-h-96 overflow-y-auto">
              {activityLog.slice(0, 10).map((logItem: ActivityLogItem) => {
                const isActionable = (logItem.action === "Edited question" || logItem.action === "Deleted question" || logItem.action === "Added new question" || logItem.action === "Uploaded questions for topic" || logItem.action === "Loaded questions to topic") && logItem.details;
                const ActionWrapper = isActionable ? 'button' : 'div';
                
                return (
                  <ActionWrapper
                    key={logItem.id} 
                    onClick={isActionable ? () => handleActivityItemClick(logItem) : undefined}
                    className={`flex items-start py-2.5 border-b border-slate-100 last:border-b-0 w-full text-left ${isActionable ? 'cursor-pointer hover:bg-slate-50 rounded focus:outline-none focus:ring-1 focus:ring-indigo-300' : ''}`}
                    // Accessibility: If it's a button, it's focusable. If a div, it's not.
                    // Role="button" might be needed if a div is made clickable, but here we use an actual button element.
                  >
                    <ActivityIcon className="h-5 w-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={`text-sm ${isActionable ? 'text-indigo-700 group-hover:text-indigo-800' : 'text-slate-800'}`}>
                        {logItem.action} 
                        {logItem.details && <span className={`font-medium ml-1 truncate max-w-[150px] inline-block align-bottom ${isActionable ? 'text-indigo-700' : 'text-slate-700'}`} title={logItem.details}>{logItem.details}</span>}
                      </p>
                      <p className="text-xs text-slate-500">{formatRelativeTime(logItem.timestamp)}</p>
                    </div>
                  </ActionWrapper>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500">No recent activity recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
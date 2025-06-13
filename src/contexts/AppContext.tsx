
/**
 * @file contexts/AppContext.tsx
 * @description Manages global application state including Q&A data, topics, user authentication, activity logging, and file operations. Provides this state and related functions to the application via React Context.
 * @created June 13, 2025. 12:03 p.m. Eastern Time
 * 
 * @architectural-context
 * Layer: Context (Global State Management)
 * Dependencies: react, ../types, ../constants, ../services/geminiService, react-hot-toast
 * Pattern: React Context API for providing global state and updater functions. Centralizes data operations, authentication logic, and interactions with simulated backend services.
 * 
 * @workflow-context  
 * User Journey: Supports all user journeys by providing shared data (questions, topics, auth status) and actions (CRUD operations, login/logout, file uploads).
 * Sequence Position: Initialized at the root of the application (App.tsx) and persists throughout the user session.
 * Inputs: Child components consuming context values, user actions triggering context functions (e.g., login, addQuestions).
 * Outputs: Provides state (questions, topics, isAuthenticated) and functions to modify state to descendant components. Triggers backend API calls (simulated) and UI notifications.
 * 
 * @authentication-context
 * Auth Modes: Manages `isAuthenticated` state. Includes `login` and `logout` functions. Uses `SESSION_TOKEN_KEY` and `MOCK_PASSWORD` for prototype authentication.
 * Security: Handles session token storage in sessionStorage. Login uses a mock password. Backend interactions are simulated as fetch calls to placeholder API endpoints.
 * 
 * @mock-data-context
 * Purpose: `MOCK_PASSWORD` facilitates prototype login. `INITIAL_TOPICS` provides fallback data if backend is unavailable. `uploadMarkdownFile` "dry run" uses Gemini API (real if key provided) without backend persistence.
 * Behavior: Login checks against `MOCK_PASSWORD`. `fetchInitialData` attempts real API call with fallbacks. `uploadMarkdownFile` non-dry-run simulates backend processing.
 * Activation: Mock password always used in `login`. Fallback data used on API failure. Dry run mode is an explicit parameter to `uploadMarkdownFile`.
 */
import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { Question, TopicSummary, AppContextType, ParsedQuestionFromAI, Filters, ValidationReport, ActivityLogItem } from '../types';
import { INITIAL_TOPICS, SESSION_TOKEN_KEY, MOCK_PASSWORD } from '../constants'; 
import { parseMarkdownToQA } from '../services/geminiService';
import { loginUser, verifyAuthToken } from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Removed MOCK_QUESTIONS and MOCK_INITIAL_ACTIVITY as data is fetched or managed dynamically.

/**
 * @component AppProvider
 * @description Wraps the application to provide global state and functions via React Context. Manages Q&A data, topics, authentication status, activity logs, file operations, and interactions with (simulated) backend services.
 * @param {{ children: ReactNode }} props - Props for the component.
 * @param {ReactNode} props.children - The child components that will have access to the context.
 * @returns {JSX.Element} The provider component.
 * @usage
 * ```jsx
 * // In App.tsx or a similar root component:
 * <AppProvider>
 *   <YourAppComponents />
 * </AppProvider>
 * ```
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<string[]>(INITIAL_TOPICS);
  const [topicSummaries, setTopicSummaries] = useState<TopicSummary[]>([]);
  const [lastUploadTimestamp, setLastUploadTimestamp] = useState<number | null>(null);
  const [isContextLoading, setIsContextLoading] = useState<boolean>(true); 
  const [initialCurationFilters, setInitialCurationFiltersState] = useState<Partial<Filters> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);

  /**
   * @function logActivity
   * @description Adds a new item to the activity log. Keeps a maximum of 15 recent items.
   * @param {string} action - A description of the action performed (e.g., "Logged in", "Uploaded file").
   * @param {string} [details] - Optional additional details about the action (e.g., filename, question ID).
   */
  const logActivity = useCallback((action: string, details?: string) => {
    const newItem: ActivityLogItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      details,
      timestamp: Date.now(),
    };
    setActivityLog(prevLog => [newItem, ...prevLog.slice(0, 14)]); 
  }, []);

  /**
   * @function fetchInitialData
   * @description Fetches initial application data (questions, topics, last upload timestamp, activity log) from the backend endpoint `/api/bootstrap-data`. Handles loading states and potential errors, displaying a toast notification if the backend is unreachable.
   * @returns {Promise<void>}
   */
  const fetchInitialData = useCallback(async () => {
    setIsContextLoading(true);
    try {
      const response = await fetch('/api/bootstrap-data');
      if (!response.ok) {
        throw new Error(`Failed to fetch initial data: ${response.statusText} (Status: ${response.status})`);
      }
      const data = await response.json();
      setQuestions(data.questions || []);
      setTopics(data.topics && data.topics.length > 0 ? data.topics : INITIAL_TOPICS); 
      setLastUploadTimestamp(data.lastUploadTimestamp || null);
      setActivityLog(data.activityLog || []);
    } catch (error) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-amber-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}
        >
          <div className="flex-1 w-0">
            <p className="text-sm font-medium text-amber-700">
              Backend Not Connected
            </p>
            <p className="mt-1 text-sm text-amber-600">
              Failed to fetch initial data. The application will be in an empty or loading state until the backend is connected and provides data. Details logged to console.
            </p>
          </div>
        </div>
      ), {id: 'fetch-initial-data-backend-info'});
      console.warn( 
        "Backend Not Connected: Initial data fetch from '/api/bootstrap-data' failed. " +
        "Application will operate with empty data until backend connection is established. Details of failed fetch:", 
        error 
      );
      setQuestions([]); 
      setTopics(INITIAL_TOPICS); 
      setLastUploadTimestamp(null); 
      setActivityLog([]);
    } finally {
      setIsContextLoading(false);
    }
  }, []); 

  // Effect to check session on mount
  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      setIsAuthenticated(true);
      // logActivity is called within the authenticated data fetch effect
    } else {
      setIsContextLoading(false); 
    }
  }, []); 

  // Effect to fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData().then(() => {
        if (sessionStorage.getItem(SESSION_TOKEN_KEY)) { 
            // Logging "Session resumed" is implicitly handled by `fetchInitialData` completing.
            // A more specific log might be added here if needed, distinct from "Logged in".
        }
      });
    }
  }, [isAuthenticated, fetchInitialData]); 


  // Effect to update topic summaries when questions or topics change
  useEffect(() => {
    const activeTopics = topics.length > 0 ? topics : Array.from(new Set(questions.map(q => q.topic)));

    const summaries: TopicSummary[] = activeTopics.map(topicName => {
      const topicQuestions = questions.filter(q => q.topic === topicName);
      return {
        name: topicName,
        totalQuestions: topicQuestions.length,
        basicCount: topicQuestions.filter(q => q.difficulty?.toLowerCase() === 'basic').length,
        advancedCount: topicQuestions.filter(q => q.difficulty?.toLowerCase() === 'advanced').length,
      };
    });
    setTopicSummaries(summaries);
  }, [questions, topics]);
  
  /**
   * @function addQuestions
   * @description Replaces all questions for a given topic with a new set of questions by calling the backend endpoint `/api/topics/{topic}/questions/batch-replace`. Refetches all application data on success.
   * @param {string} topic - The topic for which questions are being added/replaced.
   * @param {ParsedQuestionFromAI[]} newQuestionsData - An array of parsed question objects to be loaded.
   * @returns {Promise<void>}
   */
  const addQuestions = useCallback(async (topic: string, newQuestionsData: ParsedQuestionFromAI[]) => {
    setIsContextLoading(true);
    try {
      const response = await fetch(`/api/topics/${topic}/questions/batch-replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestionsData),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to add questions: ${errorData} (Status: ${response.status})`);
      }
      await fetchInitialData(); 
      logActivity("Uploaded questions for topic", topic);
      setLastUploadTimestamp(Date.now()); 
      toast.success(`Successfully loaded questions for topic: ${topic} to backend. Data refreshed.`);
    } catch (error) {
      console.error("Error adding questions (batch-replace):", error);
      toast.error(`API call to load questions for topic ${topic} failed. Data not changed. (${error instanceof Error ? error.message : 'Unknown error'})`);
    } finally {
      setIsContextLoading(false);
    }
  }, [fetchInitialData, logActivity]);

  /**
   * @function deleteQuestion
   * @description Deletes a question by its ID by calling the backend endpoint `/api/questions/{id}`. Updates local state on success.
   * @param {string} id - The ID of the question to delete.
   * @returns {Promise<void>}
   */
  const deleteQuestion = useCallback(async (id: string) => {
    setIsContextLoading(true);
    const questionInfoForLog = questions.find(q => q.id === id)?.id || id;
    try {
      const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete question: ${errorData} (Status: ${response.status})`);
      }
      setQuestions(prevQuestions => prevQuestions.filter(question => question.id !== id));
      logActivity("Deleted question", questionInfoForLog);
      toast.success(`Question ${questionInfoForLog} deleted successfully from backend.`);
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error(`API call to delete question ${questionInfoForLog} failed. Data not changed. (${error instanceof Error ? error.message : 'Unknown error'})`);
    } finally {
      setIsContextLoading(false);
    }
  }, [questions, logActivity]); 

  /**
   * @function updateQuestion
   * @description Updates an existing question by calling the backend endpoint `/api/questions/{updatedQuestion.id}`. Updates local state with the backend's response on success.
   * @param {Question} updatedQuestion - The question object with updated data.
   * @returns {Promise<void>}
   */
  const updateQuestion = useCallback(async (updatedQuestion: Question) => {
    setIsContextLoading(true);
    try {
      const response = await fetch(`/api/questions/${updatedQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuestion),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update question: ${errorData} (Status: ${response.status})`);
      }
      const savedQuestion = await response.json(); 
      setQuestions(prevQuestions => 
          prevQuestions.map(q => (q.id === savedQuestion.id ? savedQuestion : q))
      );
      logActivity("Edited question", savedQuestion.id);
      toast.success(`Question ${savedQuestion.id} updated successfully on backend.`);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error(`API call to update question ${updatedQuestion.id} failed. Data not changed. (${error instanceof Error ? error.message : 'Unknown error'})`);
    } finally {
      setIsContextLoading(false);
    }
  }, [logActivity]);

  /**
   * @function addNewQuestion
   * @description Adds a new question by calling the backend endpoint `/api/questions`. Updates local state with the backend's response (which includes the new ID) on success. Dynamically adds new topics if created.
   * @param {Omit<Question, 'id'>} newQuestionData - The new question data, without an ID (backend generates it).
   * @returns {Promise<void>}
   */
  const addNewQuestion = useCallback(async (newQuestionData: Omit<Question, 'id'>) => {
    setIsContextLoading(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestionData), 
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to add new question: ${errorData} (Status: ${response.status})`);
      }
      const actualNewQuestion: Question = await response.json();
      
      setQuestions(prevQuestions => [...prevQuestions, actualNewQuestion]);
      if (actualNewQuestion.topic && !topics.includes(actualNewQuestion.topic)) {
          const currentTopics = Array.from(new Set([...topics, actualNewQuestion.topic]));
          setTopics(currentTopics);
      }
      logActivity("Added new question", actualNewQuestion.id);
      toast.success(`New question (ID: ${actualNewQuestion.id}) added successfully to backend for topic: ${actualNewQuestion.topic}.`);
    } catch (error) {
      console.error("Error adding new question:", error);
      toast.error(`API call to add new question for topic ${newQuestionData.topic} failed. Data not changed. (${error instanceof Error ? error.message : 'Unknown error'})`);
    } finally {
      setIsContextLoading(false);
    }
  }, [topics, logActivity]); 

  /**
   * @function uploadMarkdownFile
   * @description Handles Markdown file processing. If `dryRun` is true, it parses the file content using `geminiService` and returns parsed questions and a validation report without backend interaction. If `dryRun` is false, it uploads the file to `/api/upload-markdown` for backend processing and data persistence, then refetches initial data.
   * @param {string} topic - The topic associated with the file.
   * @param {File} file - The Markdown file to process.
   * @param {boolean} dryRun - If true, performs a dry run analysis; otherwise, uploads to backend.
   * @returns {Promise<{ parsedQuestions: ParsedQuestionFromAI[], report: ValidationReport } | void>} For dry run, returns parsed data and report. For actual upload, returns void (or throws error).
   */
  const uploadMarkdownFile = useCallback(async (
    topic: string, 
    file: File, 
    dryRun: boolean
  ): Promise<{ parsedQuestions: ParsedQuestionFromAI[], report: ValidationReport } | void> => {
    if (dryRun) {
      setIsContextLoading(true);
      try {
        const fileContent = await file.text();
        const parsedQuestions = await parseMarkdownToQA(fileContent, topic);
        const report: ValidationReport = {
          success: true,
          message: `Successfully parsed ${parsedQuestions.length} questions for topic '${topic}'.`,
          parsedCount: parsedQuestions.length,
          topic: topic,
        };
        toast.success("Dry run analysis complete!");
        logActivity("Analyzed file (dry run)", file.name);
        return { parsedQuestions, report };
      } catch (error) {
        console.error("Error during dry run analysis:", error);
        const report: ValidationReport = {
          success: false,
          message: error instanceof Error ? error.message : "An unknown error occurred during dry run analysis.",
          errors: error instanceof Error ? [error.message] : undefined,
          topic: topic,
        };
        toast.error(`Dry run analysis failed: ${report.message}`);
        logActivity("Dry run analysis failed", file.name);
        return { parsedQuestions: [], report }; 
      } finally {
        setIsContextLoading(false);
      }
    } else {
      setIsContextLoading(true);
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('file', file);
      try {
        const response = await fetch('/api/upload-markdown', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to upload markdown file: ${response.statusText} - ${errorData} (Status: ${response.status})`);
        }
        await fetchInitialData();
        logActivity("Uploaded file to backend", `${file.name} for topic ${topic}`);
        setLastUploadTimestamp(Date.now());
        toast.success(`Markdown file uploaded and processed by backend for topic: ${topic}. Data refreshed.`);
      } catch (error) {
        console.error("Error uploading markdown file:", error);
        toast.error(`API call to /api/upload-markdown failed. (${error instanceof Error ? error.message : 'Unknown error'})`);
        throw error; 
      } finally {
        setIsContextLoading(false);
      }
    }
  }, [logActivity, fetchInitialData, parseMarkdownToQA]); // parseMarkdownToQA is stable if geminiService is stable

  /**
   * @function exportQuestionsToMarkdown
   * @description Filters current questions based on provided criteria and triggers a browser download of the resulting questions formatted as a Markdown file.
   * @param {string} [selectedTopic] - Optional topic to filter by.
   * @param {string} [selectedSubtopic] - Optional subtopic to filter by.
   * @param {string} [selectedDifficulty] - Optional difficulty to filter by.
   * @param {string} [selectedType] - Optional type to filter by.
   * @param {string} [searchText] - Optional search text to filter by.
   */
  const exportQuestionsToMarkdown = useCallback((selectedTopic?: string, selectedSubtopic?: string, selectedDifficulty?: string, selectedType?: string, searchText?: string) => {
    let filteredQuestions = questions;

    if (selectedTopic && selectedTopic !== "All Topics") {
        filteredQuestions = filteredQuestions.filter(q => q.topic === selectedTopic);
    }
    if (selectedSubtopic && selectedSubtopic !== "All Subtopics") {
        filteredQuestions = filteredQuestions.filter(q => q.subtopic === selectedSubtopic);
    }
    if (selectedDifficulty && selectedDifficulty !== "All Difficulties") {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === selectedDifficulty);
    }
    if (selectedType && selectedType !== "All Types") {
        filteredQuestions = filteredQuestions.filter(q => q.type === selectedType);
    }
    if (searchText) {
        filteredQuestions = filteredQuestions.filter(q => 
            q.questionText.toLowerCase().includes(searchText.toLowerCase()) ||
            q.answerText.toLowerCase().includes(searchText.toLowerCase()) ||
            q.id.toLowerCase().includes(searchText.toLowerCase())
        );
    }
    
    if (filteredQuestions.length === 0) {
        toast.error("No questions to export based on current filters.");
        return;
    }

    const markdownLines: string[] = [];
    const questionsByTopic = filteredQuestions.reduce((acc, q) => {
        acc[q.topic] = acc[q.topic] || [];
        acc[q.topic].push(q);
        return acc;
    }, {} as Record<string, Question[]>);

    for (const topic in questionsByTopic) {
        markdownLines.push(`# Topic: ${topic}\n`);
        const questionsInTopic = questionsByTopic[topic];
        const questionsBySubtopic = questionsInTopic.reduce((acc, q) => {
            acc[q.subtopic] = acc[q.subtopic] || [];
            acc[q.subtopic].push(q);
            return acc;
        }, {} as Record<string, Question[]>);

        for (const subtopic in questionsBySubtopic) {
            markdownLines.push(`## Subtopic: ${subtopic}\n`);
            questionsBySubtopic[subtopic].forEach(q => {
                markdownLines.push(`### ${q.difficulty} - ${q.type}`);
                markdownLines.push(`**Q:** ${q.questionText}`);
                markdownLines.push(`**A:** ${q.answerText}`);
                markdownLines.push("\n---\n");
            });
        }
    }
    
    const markdownContent = markdownLines.join('\n');
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `qna_export_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success(`Exported ${filteredQuestions.length} questions to Markdown.`);
    logActivity("Exported questions", `${filteredQuestions.length} items`);

  }, [questions, logActivity]);

  /**
   * @function setInitialCurationFilters
   * @description Sets filters to be applied when the CurationView is next loaded. Useful for navigating from Dashboard to a pre-filtered CurationView.
   * @param {Partial<Filters>} filters - A partial filter object.
   */
  const setInitialCurationFilters = useCallback((filters: Partial<Filters>) => {
    setInitialCurationFiltersState(filters);
  }, []);

  /**
   * @function clearInitialCurationFilters
   * @description Clears any pre-set initial curation filters.
   */
  const clearInitialCurationFilters = useCallback(() => {
    setInitialCurationFiltersState(null);
  }, []);

  /**
   * @function login
   * @description Authenticates the user with backend API. Supports both real authentication and mock mode fallback.
   * @param {string} usernameOrPassword - Username for real auth, or password for mock mode
   * @param {string} [password] - Password for real auth (optional for backward compatibility)
   * @returns {Promise<boolean>} True if login is successful, false otherwise.
   */
  const login = useCallback(async (usernameOrPassword: string, password?: string): Promise<boolean> => {
    setIsContextLoading(true); 
    try {
      // Try real backend authentication first
      if (password) {
        // Real authentication with username and password
        const result = await loginUser(usernameOrPassword, password);
        sessionStorage.setItem(SESSION_TOKEN_KEY, result.access_token);
        setIsAuthenticated(true);
        toast.success(`Login successful! Welcome, ${result.username}`);
        logActivity("Logged in", `User: ${result.username}`);
        return true;
      } else {
        // Fallback to mock authentication for backward compatibility
        if (usernameOrPassword === MOCK_PASSWORD) {
          sessionStorage.setItem(SESSION_TOKEN_KEY, 'mock-jwt-token-for-prototype');
          setIsAuthenticated(true); 
          toast.success('Login successful!');
          logActivity("Logged in", "Mock authentication"); 
          return true;
        } else {
          toast.error('Login failed: Invalid credentials.');
          setIsContextLoading(false); 
          return false;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to mock authentication on API failure
      if (!password && usernameOrPassword === MOCK_PASSWORD) {
        sessionStorage.setItem(SESSION_TOKEN_KEY, 'mock-jwt-token-for-prototype');
        setIsAuthenticated(true);
        toast.success('Login successful (offline mode)!');
        logActivity("Logged in", "Mock authentication (API unavailable)");
        return true;
      }
      
      toast.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsContextLoading(false); 
      return false;
    } 
  }, [logActivity]);

  /**
   * @function logout
   * @description Logs out the user by clearing the session token from sessionStorage, resetting authentication state, and clearing all application data.
   */
  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    setIsAuthenticated(false);
    setQuestions([]);
    setTopics(INITIAL_TOPICS);
    setTopicSummaries([]);
    setLastUploadTimestamp(null);
    setActivityLog([]); 
    toast.success('Logged out successfully.');
    // logActivity("Logged out"); // Logging this before state clear might be complex; user is effectively starting fresh.
  }, []);


  return (
    <AppContext.Provider value={{ 
        questions, 
        topics, 
        topicSummaries, 
        lastUploadTimestamp, 
        addQuestions, 
        deleteQuestion, 
        updateQuestion, 
        addNewQuestion,
        isContextLoading,
        exportQuestionsToMarkdown,
        uploadMarkdownFile,
        initialCurationFilters,
        setInitialCurationFilters,
        clearInitialCurationFilters,
        isAuthenticated,
        login,
        logout,
        activityLog,
        logActivity
    }}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * @function useAppContext
 * @description Custom hook to easily consume `AppContext` values (state and functions). Throws an error if used outside of an `AppProvider` to ensure context is available.
 * @returns {AppContextType} The context value containing all global state and action dispatchers.
 * @throws {Error} If the hook is used outside of an `AppProvider`.
 * @example
 * ```jsx
 * const { questions, topics, login } = useAppContext();
 * // Now you can use questions, topics, or call login()
 * ```
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

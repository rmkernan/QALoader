
/**
 * @file contexts/AppContext.tsx
 * @description Manages global application state including Q&A data, topics, user authentication, activity logging, and file operations. Provides this state and related functions to the application via React Context.
 * @created June 9, 2025 at unknown time
 * @updated June 13, 2025. 6:34 p.m. Eastern Time - Fixed fetchInitialData to include JWT token in Authorization header for authenticated bootstrap-data endpoint calls
 * @updated June 13, 2025. 6:58 p.m. Eastern Time - Removed unused verifyAuthToken import and fixed HeadersInit type reference
 * @updated June 14, 2025. 9:27 a.m. Eastern Time - Added bulkDeleteQuestions function for bulk deletion operations
 * @updated June 14, 2025. 10:25 a.m. Eastern Time - Fixed API calls to use centralized API service functions instead of relative URLs to resolve 404 errors
 * @updated June 14, 2025. 10:39 a.m. Eastern Time - Added data transformation layer for updateQuestion and addNewQuestion to handle backend/frontend field name mismatches
 * @updated June 14, 2025. 2:00 p.m. Eastern Time - Added fetchInitialData to context exports for Dashboard data refresh, fixed uploadMarkdownFile validation field transformation
 * @updated June 14, 2025. 3:57 p.m. Eastern Time - Enhanced uploadMarkdownFile function signature to support optional metadata parameters (uploadedOn, uploadedBy, uploadNotes)
 * @updated June 14, 2025. 5:42 p.m. Eastern Time - Fixed data transformation for metadata fields (uploaded_on → uploadedOn, etc.) in fetchInitialData, updateQuestion, and addNewQuestion
 * @updated June 16, 2025. 2:01 p.m. Eastern Time - Added missing notesForTutor field transformation in updateQuestion and addNewQuestion functions
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
 * Auth Modes: Supports dual authentication - real backend login and mock password fallback
 * Security: Handles session token storage in sessionStorage, JWT token-based API authentication
 * 
 * @mock-data-context
 * Purpose: `MOCK_PASSWORD` facilitates prototype login. `INITIAL_TOPICS` provides fallback data if backend is unavailable. `uploadMarkdownFile` "dry run" uses Gemini API (real if key provided) without backend persistence.
 * Behavior: Login checks against `MOCK_PASSWORD`. `fetchInitialData` attempts real API call with fallbacks. `uploadMarkdownFile` non-dry-run simulates backend processing.
 * Activation: Mock password always used in `login`. Fallback data used on API failure. Dry run mode is an explicit parameter to `uploadMarkdownFile`.
 */
import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { Question, TopicSummary, AppContextType, ParsedQuestionFromAI, Filters, ValidationReport, ActivityLogItem, ValidationResult, BatchUploadResult } from '../types';
import { INITIAL_TOPICS, SESSION_TOKEN_KEY, MOCK_PASSWORD } from '../constants'; 
import { parseMarkdownToQA as _parseMarkdownToQA } from '../services/geminiService';
import { loginUser, bulkDeleteQuestions as bulkDeleteQuestionsAPI, deleteQuestion as deleteQuestionAPI, createQuestion as createQuestionAPI, updateQuestion as updateQuestionAPI, validateMarkdownFile as validateMarkdownFileAPI, uploadMarkdownFile as uploadMarkdownFileAPI } from '../services/api';
import { validateMarkdownFormat, getValidationSummary } from '../services/validation';
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
   * 
   * @critical-authentication-note
   * This function MUST include JWT token in Authorization header for authenticated endpoints.
   * Silent authentication failures can cause the app to appear "connected" while actually showing empty mock data.
   * Symptoms of missing auth: Login works but Manage Content shows no data despite database having content.
   * 
   * @error-handling
   * Falls back to empty/mock data on failure, which can mask authentication issues.
   * Always check browser network tab if data seems missing after successful login.
   */
  const fetchInitialData = useCallback(async () => {
    setIsContextLoading(true);
    try {
      const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch('http://localhost:8000/api/bootstrap-data', { headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch initial data: ${response.statusText} (Status: ${response.status})`);
      }
      const data = await response.json();
      
      // Note: Debug logging available if needed for troubleshooting field mappings
      
      // Transform backend question_id to frontend id
      const transformedQuestions = (data.questions || []).map((q: Question & { 
        question_id?: string; 
        question?: string; 
        answer?: string;
        notes_for_tutor?: string;
        uploaded_on?: string;
        uploaded_by?: string;
        upload_notes?: string;
      }) => ({
        ...q,
        id: q.question_id || q.id,  // Use question_id from backend, fallback to id
        questionText: q.question || q.questionText,  // Backend uses 'question', frontend uses 'questionText'
        answerText: q.answer || q.answerText,  // Backend uses 'answer', frontend uses 'answerText'
        notesForTutor: q.notes_for_tutor || q.notesForTutor,  // Backend uses snake_case
        uploadedOn: q.uploaded_on || q.uploadedOn,  // Backend uses snake_case
        uploadedBy: q.uploaded_by || q.uploadedBy,  // Backend uses snake_case
        uploadNotes: q.upload_notes || q.uploadNotes  // Backend uses snake_case
      }));
      setQuestions(transformedQuestions);
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
      const response = await fetch(`http://localhost:8000/api/topics/${topic}/questions/batch-replace`, {
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
      await deleteQuestionAPI(id);
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
   * @function bulkDeleteQuestions
   * @description Deletes multiple questions in a single operation with detailed result tracking
   * @param {string[]} ids - Array of question IDs to delete
   * @returns {Promise<void>}
   * @example:
   *   // Delete selected questions
   *   await bulkDeleteQuestions(['DCF-001', 'VAL-002']);
   */
  const bulkDeleteQuestions = useCallback(async (ids: string[]) => {
    setIsContextLoading(true);
    try {
      const result = await bulkDeleteQuestionsAPI(ids);
      
      if (result.deleted_count > 0) {
        // Update local state by removing deleted questions
        setQuestions(prevQuestions => 
          prevQuestions.filter(question => !result.deleted_ids.includes(question.id))
        );
        
        // Log activity
        logActivity("Bulk delete completed", `${result.deleted_count} questions deleted`);
        
        // Show appropriate toast based on results
        if (result.failed_count === 0) {
          toast.success(result.message);
        } else {
          // Partial success
          toast.success(`${result.message}. Failed IDs: ${result.failed_ids.join(', ')}`);
        }
      } else {
        // Complete failure
        toast.error(result.message);
      }
      
      // Log any errors for debugging
      if (result.errors) {
        console.error('Bulk delete errors:', result.errors);
      }
      
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsContextLoading(false);
    }
  }, [logActivity]);

  /**
   * @function handleBatchUploadResult
   * @description Processes batch upload results and provides appropriate user feedback
   * @param {BatchUploadResult} result - Upload result from server
   * @param {string} topic - Topic name for context
   * @param {string} fileName - File name for logging
   * @returns {Promise<void>}
   */
  const handleBatchUploadResult = useCallback(async (
    result: BatchUploadResult, 
    topic: string, 
    fileName: string
  ): Promise<void> => {
    // Defensive programming: ensure all arrays exist
    const successfulUploads = result.successfulUploads || [];
    const failedUploads = result.failedUploads || [];
    const errors = result.errors || {};
    const warnings = result.warnings || [];
    
    // Note: Array processing with defensive programming for undefined fields
    
    if (failedUploads.length === 0) {
      // Complete success
      toast.success(`✅ All ${successfulUploads.length} questions uploaded successfully!`);
      logActivity("File upload completed", `${fileName} - ${successfulUploads.length} questions added to ${topic}`);
      
    } else if (successfulUploads.length > 0) {
      // Partial success - show summary with option to view details
      const successMessage = `✅ ${successfulUploads.length} questions uploaded successfully.`;
      const failureMessage = `❌ ${failedUploads.length} questions failed.`;
      
      toast.success(
        `${successMessage}\n${failureMessage}\nClick to view error details.`,
        {
          duration: 8000,
          onClick: () => showErrorDetailsModal(errors, failedUploads)
        }
      );
      
      logActivity(
        "File upload partial success", 
        `${fileName} - ${successfulUploads.length} succeeded, ${failedUploads.length} failed`
      );
      
    } else {
      // Complete failure
      toast.error(`❌ Upload failed: No questions were added to database.`);
      showErrorDetailsModal(errors, failedUploads);
      logActivity("File upload failed", `${fileName} - No questions added`);
    }
    
    // Show warnings if present
    if (warnings && warnings.length > 0) {
      console.warn('Upload warnings:', warnings);
      toast(
        `⚠️ Upload completed with ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`,
        { icon: '⚠️' }
      );
    }
  }, [logActivity]);

  /**
   * @function showErrorDetailsModal
   * @description Shows detailed error information for failed uploads
   * @param {Record<string, string>} errors - Map of question ID to error message
   * @param {string[]} failedIds - Array of failed question IDs
   */
  const showErrorDetailsModal = useCallback((
    errors: Record<string, string>, 
    failedIds: string[]
  ) => {
    // For now, log detailed errors to console
    // In future, this could open a modal with detailed error display
    console.group('❌ Upload Error Details');
    failedIds.forEach(id => {
      console.error(`Question ${id}: ${errors[id] || 'Unknown error'}`);
    });
    console.groupEnd();
    
    // Show summary toast with actionable guidance
    const errorTypes = Object.values(errors);
    const hasFormatErrors = errorTypes.some(error => 
      error.includes('Invalid difficulty') || 
      error.includes('Invalid question type') ||
      error.includes('Missing required fields')
    );
    
    if (hasFormatErrors) {
      toast.error(
        '💡 Fix format errors: Check difficulty values (Basic/Advanced) and question types (Definition/Problem/GenConcept/Calculation/Analysis)',
        { duration: 10000 }
      );
    }
  }, []);

  /**
   * @function updateQuestion
   * @description Updates an existing question by calling the backend endpoint `/api/questions/{updatedQuestion.id}`. Updates local state with the backend's response on success.
   * @param {Question} updatedQuestion - The question object with updated data.
   * @returns {Promise<void>}
   */
  const updateQuestion = useCallback(async (updatedQuestion: Question) => {
    setIsContextLoading(true);
    try {
      // Transform frontend format to backend format
      const backendQuestion: any = {
        question_id: updatedQuestion.id,
        topic: updatedQuestion.topic,
        subtopic: updatedQuestion.subtopic,
        difficulty: updatedQuestion.difficulty,
        type: updatedQuestion.type,
        question: updatedQuestion.questionText,
        answer: updatedQuestion.answerText
      };
      
      // Only include metadata fields if they have values
      if (updatedQuestion.notesForTutor) backendQuestion.notes_for_tutor = updatedQuestion.notesForTutor;
      if (updatedQuestion.uploadedOn) backendQuestion.uploaded_on = updatedQuestion.uploadedOn;
      if (updatedQuestion.uploadedBy) backendQuestion.uploaded_by = updatedQuestion.uploadedBy;
      if (updatedQuestion.uploadNotes) backendQuestion.upload_notes = updatedQuestion.uploadNotes;
      
      const savedQuestion = await updateQuestionAPI(updatedQuestion.id, backendQuestion);
      
      // Transform backend response to frontend format
      const transformedQuestion = {
        ...savedQuestion,
        id: savedQuestion.question_id || savedQuestion.id,
        questionText: savedQuestion.question || savedQuestion.questionText,
        answerText: savedQuestion.answer || savedQuestion.answerText,
        notesForTutor: savedQuestion.notes_for_tutor || savedQuestion.notesForTutor,
        uploadedOn: savedQuestion.uploaded_on || savedQuestion.uploadedOn,
        uploadedBy: savedQuestion.uploaded_by || savedQuestion.uploadedBy,
        uploadNotes: savedQuestion.upload_notes || savedQuestion.uploadNotes
      };
      
      setQuestions(prevQuestions => 
          prevQuestions.map(q => (q.id === transformedQuestion.id ? transformedQuestion : q))
      );
      logActivity("Edited question", transformedQuestion.id);
      toast.success(`Question ${transformedQuestion.id} updated successfully on backend.`);
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
      // Transform frontend format to backend format
      const backendQuestion: any = {
        topic: newQuestionData.topic,
        subtopic: newQuestionData.subtopic,
        difficulty: newQuestionData.difficulty,
        type: newQuestionData.type,
        question: newQuestionData.questionText,
        answer: newQuestionData.answerText
      };
      
      // Only include metadata fields if they have values
      if (newQuestionData.notesForTutor) backendQuestion.notes_for_tutor = newQuestionData.notesForTutor;
      if (newQuestionData.uploadedOn) backendQuestion.uploaded_on = newQuestionData.uploadedOn;
      if (newQuestionData.uploadedBy) backendQuestion.uploaded_by = newQuestionData.uploadedBy;
      if (newQuestionData.uploadNotes) backendQuestion.upload_notes = newQuestionData.uploadNotes;
      
      const actualNewQuestion = await createQuestionAPI(backendQuestion);
      
      // Transform backend response to frontend format
      const transformedQuestion = {
        ...actualNewQuestion,
        id: actualNewQuestion.question_id || actualNewQuestion.id,
        questionText: actualNewQuestion.question || actualNewQuestion.questionText,
        answerText: actualNewQuestion.answer || actualNewQuestion.answerText,
        notesForTutor: actualNewQuestion.notes_for_tutor || actualNewQuestion.notesForTutor,
        uploadedOn: actualNewQuestion.uploaded_on || actualNewQuestion.uploadedOn,
        uploadedBy: actualNewQuestion.uploaded_by || actualNewQuestion.uploadedBy,
        uploadNotes: actualNewQuestion.upload_notes || actualNewQuestion.uploadNotes
      };
      
      setQuestions(prevQuestions => [...prevQuestions, transformedQuestion]);
      if (transformedQuestion.topic && !topics.includes(transformedQuestion.topic)) {
          const currentTopics = Array.from(new Set([...topics, transformedQuestion.topic]));
          setTopics(currentTopics);
      }
      logActivity("Added new question", transformedQuestion.id);
      toast.success(`New question (ID: ${transformedQuestion.id}) added successfully to backend for topic: ${transformedQuestion.topic}.`);
    } catch (error) {
      console.error("Error adding new question:", error);
      toast.error(`API call to add new question for topic ${newQuestionData.topic} failed. Data not changed. (${error instanceof Error ? error.message : 'Unknown error'})`);
    } finally {
      setIsContextLoading(false);
    }
  }, [topics, logActivity]); 

  /**
   * @function uploadMarkdownFile
   * @description Enhanced markdown file processing with validation-first approach. Supports both validation-only mode and full upload workflow with detailed error handling and metadata tracking.
   * @param {string} topic - The topic associated with the file
   * @param {File} file - The Markdown file to process
   * @param {boolean} dryRun - If true, performs validation only; if false, validates then uploads
   * @param {string} [uploadedOn] - American timestamp when questions were uploaded (Eastern Time)
   * @param {string} [uploadedBy] - Free text field for who uploaded the questions (max 25 chars)
   * @param {string} [uploadNotes] - Free text notes about this upload (max 100 chars)
   * @returns {Promise<{ parsedQuestions: ParsedQuestionFromAI[], report: ValidationReport } | void>} For validation, returns parsed data and report. For upload, returns void or throws error.
   * 
   * @workflow Two-step validation process:
   * 1. Client-side format validation (immediate feedback)
   * 2. Server-side content validation (comprehensive checking)
   * 3. Upload with individual question tracking (if not dry run)
   * 
   * @example
   * // Validation only
   * const result = await uploadMarkdownFile('DCF', file, true);
   * if (result.report.success) {
   *   console.log(`Found ${result.report.parsedCount} questions`);
   * }
   * 
   * // Full upload with metadata
   * await uploadMarkdownFile('DCF', file, false, 'June 14, 2025. 2:18 p.m. Eastern Time', 'John Smith', 'Initial DCF questions');
   */
  const uploadMarkdownFile = useCallback(async (
    topic: string, 
    file: File, 
    dryRun: boolean,
    uploadedOn?: string,
    uploadedBy?: string,
    uploadNotes?: string
  ): Promise<{ parsedQuestions: ParsedQuestionFromAI[], report: ValidationReport } | void> => {
    setIsContextLoading(true);
    
    try {
      // Step 1: Client-side format validation
      const clientValidation = await validateMarkdownFormat(file);
      
      if (!clientValidation.isValid) {
        const report: ValidationReport = {
          success: false,
          message: `File format validation failed: ${clientValidation.errors.length} error${clientValidation.errors.length !== 1 ? 's' : ''} found`,
          errors: clientValidation.errors,
          topic: topic,
          parsedCount: 0
        };
        
        toast.error(getValidationSummary(clientValidation));
        logActivity("File validation failed", `${file.name} - format errors`);
        
        if (dryRun) {
          return { parsedQuestions: [], report };
        } else {
          throw new Error(report.message);
        }
      }
      
      // Step 2: Server-side validation and processing
      if (dryRun) {
        // Validation-only mode: use server validation endpoint
        try {
          const serverValidation: ValidationResult = await validateMarkdownFileAPI(topic, file);
          
          const report: ValidationReport = {
            success: serverValidation.isValid,
            message: serverValidation.isValid 
              ? `Successfully validated ${serverValidation.parsedCount} questions for topic '${topic}'`
              : `Validation failed: ${serverValidation.errors.length} error${serverValidation.errors.length !== 1 ? 's' : ''} found`,
            parsedCount: serverValidation.parsedCount,
            topic: topic,
            errors: serverValidation.errors.length > 0 ? serverValidation.errors : undefined
          };
          
          if (serverValidation.isValid) {
            toast.success(`✅ Validation successful! Found ${serverValidation.parsedCount} questions.`);
            logActivity("File validation successful", `${file.name} - ${serverValidation.parsedCount} questions`);
          } else {
            toast.error(`❌ Validation failed: ${serverValidation.errors.length} errors found`);
            logActivity("File validation failed", `${file.name} - content errors`);
          }
          
          // For dry run, return mock parsed questions (server validation doesn't return actual questions)
          return { parsedQuestions: [], report };
          
        } catch (error) {
          console.error("Server validation failed:", error);
          const report: ValidationReport = {
            success: false,
            message: error instanceof Error ? error.message : "Server validation failed",
            errors: error instanceof Error ? [error.message] : undefined,
            topic: topic,
            parsedCount: 0
          };
          toast.error(`Server validation failed: ${report.message}`);
          logActivity("Server validation error", file.name);
          return { parsedQuestions: [], report };
        }
        
      } else {
        // Full upload mode: upload and process
        try {
          const uploadResult: BatchUploadResult = await uploadMarkdownFileAPI(
            topic, 
            file, 
            uploadedOn, 
            uploadedBy, 
            uploadNotes
          );
          
          // Note: Debug logging available if needed for upload troubleshooting
          
          // Handle upload results with detailed feedback
          await handleBatchUploadResult(uploadResult, topic, file.name);
          
          // Refresh data after successful upload
          await fetchInitialData();
          setLastUploadTimestamp(Date.now());
          
        } catch (error) {
          console.error("Upload failed:", error);
          toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          logActivity("File upload failed", `${file.name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      }
      
    } finally {
      setIsContextLoading(false);
    }
  }, [logActivity, fetchInitialData]);

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
        bulkDeleteQuestions,
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
        logActivity,
        fetchInitialData
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

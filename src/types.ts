/**
 * @file src/types.ts
 * @description Defines shared TypeScript types and enums used throughout the application, such as Question, View, AppContextType, and various data structures for API interactions and state management.
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:45 PM ET - Refactored project structure into src/ and public/ directories and updated JSDoc.
 * @updated June 13, 2025. 6:58 p.m. Eastern Time - Fixed login function signature to support dual authentication modes
 * @updated June 14, 2025. 9:27 a.m. Eastern Time - Added bulkDeleteQuestions to AppContextType
 * @updated June 14, 2025. 11:47 a.m. Eastern Time - Added ValidationResult, BatchUploadResult, and ParsedQuestion interfaces for new upload workflow
 * @updated June 14, 2025. 2:00 p.m. Eastern Time - Added fetchInitialData to AppContextType interface for data refresh functionality
 * @updated June 14, 2025. 3:57 p.m. Eastern Time - Added metadata fields (uploadedOn, uploadedBy, uploadNotes) to Question interface and filtering fields to Filters interface
 * @updated June 14, 2025. 4:12 p.m. Eastern Time - Added uploadedOn field to Filters interface for timestamp filtering support
 * @updated June 16, 2025. 1:42 p.m. Eastern Time - Added notesForTutor field to Question interface for tutor guidance support
@updated June 19, 2025. 6:01 PM Eastern Time - Added duplicate detection interfaces for PostgreSQL pg_trgm integration
 * @updated June 19, 2025. 6:04 PM Eastern Time - Removed simple login option, consolidated to backend authentication only
 * 
 * @architectural-context
 * Layer: Core Types / Data Structures
 * Dependencies: None (Defines base types).
 * Pattern: Centralized type definitions for type safety and clarity.
 * 
 * @workflow-context
 * User Journey: Cross-cutting type definitions for all user workflows
 * Sequence Position: Foundation layer used throughout application
 * Inputs: TypeScript compiler and component implementations
 * Outputs: Type safety and IntelliSense for development
 * 
 * @authentication-context
 * Auth Modes: Defines login function signature for backend JWT authentication
 * Security: Type safety for authentication state and user data structures
 */
/* eslint-disable no-unused-vars */
export enum View {
  DASHBOARD = 'dashboard',
  LOADER = 'loader',
  CURATION = 'curation',
  DUPLICATES = 'duplicates',
}
/* eslint-enable no-unused-vars */

export interface Question {
  id: string; // Should now be controlled by backend
  topic: string;
  subtopic: string;
  difficulty: string; // e.g., "Basic", "Advanced"
  type: string; // e.g., "Problem", "GenConcept", "Definition"
  questionText: string;
  answerText: string;
  notesForTutor?: string; // Optional guidance or instructions for tutors
  uploadedOn?: string; // Short timestamp format: MM/DD/YY H:MMPM ET
  uploadedBy?: string; // Who uploaded the question (max 25 chars)
  uploadNotes?: string; // Notes about the upload (max 100 chars)
}

// Structure expected from Gemini API after parsing markdown
export interface ParsedQuestionFromAI {
  subtopic: string;
  difficulty: string;
  type: string;
  question: string;
  answer: string;
}

export interface TopicSummary {
  name: string;
  totalQuestions: number;
  basicCount: number;
  advancedCount: number;
  // Potentially more detailed breakdown if needed
}

export interface ValidationReport {
  success: boolean;
  message: string;
  parsedCount?: number;
  topic?: string;  // Keep for backward compatibility
  topics?: string[];  // New field for multiple topics from file
  errors?: string[]; // Store detailed errors if any
}

/**
 * @interface ValidationResult
 * @description Result of server-side markdown validation matching backend response
 * @field {boolean} isValid - Whether the validation passed completely
 * @field {string[]} errors - Array of validation error messages
 * @field {string[]} warnings - Array of validation warning messages  
 * @field {number} parsedCount - Number of questions successfully parsed
 * @field {Record<string, number>} lineNumbers - Optional line numbers for error reporting
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedCount: number;
  lineNumbers?: Record<string, number>;
}

/**
 * @interface BatchUploadResult
 * @description Result of batch question upload operation from server including duplicate detection
 * @field {number} totalAttempted - Total number of questions attempted for upload
 * @field {string[]} successfulUploads - Array of question IDs that uploaded successfully
 * @field {string[]} failedUploads - Array of question IDs that failed to upload
 * @field {Record<string, string>} errors - Map of question ID to error message for failures
 * @field {string[]} warnings - Array of warning messages from validation
 * @field {number} processingTimeMs - Server processing time in milliseconds
 * @field {number} duplicateCount - Number of potential duplicates found
 * @field {DuplicateGroup[]} duplicateGroups - Grouped duplicate information
 */
export interface BatchUploadResult {
  totalAttempted: number;
  successfulUploads: string[];
  failedUploads: string[];
  errors: Record<string, string>;
  warnings: string[];
  processingTimeMs: number;
  duplicateCount?: number;
  duplicateGroups?: DuplicateGroup[];
}

/**
 * @interface ParsedQuestion
 * @description Individual question data after markdown parsing, before database insertion
 * @field {string} subtopic - Question subtopic within the main topic
 * @field {string} difficulty - Question difficulty level ("Basic" | "Advanced")
 * @field {string} type - Question type ("Definition" | "Problem" | "GenConcept" | "Calculation" | "Analysis")
 * @field {string} question - The question text content
 * @field {string} answer - The answer text content
 * @field {string} notesForTutor - Optional notes for tutors (optional field)
 */
export interface ParsedQuestion {
  subtopic: string;
  difficulty: string;
  type: string;
  question: string;
  answer: string;
  notesForTutor?: string;
}

/**
 * @interface DuplicateGroup
 * @description Grouped duplicate questions with similarity scores
 * @field {string} primaryId - ID of the primary question in the group
 * @field {Question} primaryQuestion - Full question object for the primary question
 * @field {DuplicateQuestion[]} duplicates - Array of duplicate questions with similarity scores
 */
export interface DuplicateGroup {
  primaryId: string;
  primaryQuestion: {
    id: string;
    text: string;
    topic: string;
  };
  duplicates: Array<{
    id: string;
    text: string;
    topic: string;
    similarityScore: number;
  }>;
}

export interface ActivityLogItem {
  id: string; 
  action: string; 
  details?: string; 
  timestamp: number; 
}

/**
 * @interface AppContextType
 * @description Defines the shape of the global application context, including all shared state and action dispatchers for managing questions, topics, authentication, activity logs, and file operations.
 */
export interface AppContextType {
  questions: Question[];
  topics: string[]; 
  topicSummaries: TopicSummary[];
  lastUploadTimestamp: number | null;
  isContextLoading: boolean;
  
  // CRUD operations now async and interact with backend
  addQuestions: (_topic: string, _newQuestionsData: ParsedQuestionFromAI[]) => Promise<void>; // For batch/topic replacement from already parsed data
  deleteQuestion: (_id: string) => Promise<void>;
  bulkDeleteQuestions: (_ids: string[]) => Promise<void>; // For bulk deletion operations
  updateQuestion: (_updatedQuestion: Question) => Promise<void>;
  addNewQuestion: (_newQuestionData: Omit<Question, 'id'>) => Promise<void>;
  
  // Modified for dry run and actual upload
  uploadMarkdownFile: (
    _file: File, 
    _dryRun: boolean,
    _uploadedOn?: string,
    _uploadedBy?: string,
    _uploadNotes?: string
  ) => Promise<{ parsedQuestions: ParsedQuestionFromAI[], report: ValidationReport } | void>;

  exportQuestionsToMarkdown: (_selectedTopic?: string, _selectedSubtopic?: string, _selectedDifficulty?: string, _selectedType?: string, _searchText?: string) => void;

  // For pre-filtering CurationView
  initialCurationFilters: Partial<Filters> | null;
  setInitialCurationFilters: (_filters: Partial<Filters>) => void;
  clearInitialCurationFilters: () => void;

  // Authentication
  isAuthenticated: boolean;
  login: (_usernameOrPassword: string, _password?: string) => Promise<boolean>;
  logout: () => void;

  // Activity Log
  activityLog: ActivityLogItem[];
  logActivity: (_action: string, _details?: string) => void;
  
  // Data refresh
  fetchInitialData: () => Promise<void>;
}

export interface Filters {
  topic: string;
  subtopic: string;
  difficulty: string;
  type: string;
  searchText: string;
  uploadedBy: string;
  uploadNotes: string;
  uploadedOn: string;
}

// For environment variables, especially API_KEY
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY?: string;
    }
  }
}
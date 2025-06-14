/**
 * @file src/types.ts
 * @description Defines shared TypeScript types and enums used throughout the application, such as Question, View, AppContextType, and various data structures for API interactions and state management.
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:45 PM ET - Refactored project structure into src/ and public/ directories and updated JSDoc.
 * @updated June 13, 2025. 6:58 p.m. Eastern Time - Fixed login function signature to support dual authentication modes
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
 * Auth Modes: Defines login function signature supporting both mock and real authentication
 * Security: Type safety for authentication state and user data structures
 */
/* eslint-disable no-unused-vars */
export enum View {
  DASHBOARD = 'dashboard',
  LOADER = 'loader',
  CURATION = 'curation',
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
  topic?: string;
  errors?: string[]; // Store detailed errors if any
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
  updateQuestion: (_updatedQuestion: Question) => Promise<void>;
  addNewQuestion: (_newQuestionData: Omit<Question, 'id'>) => Promise<void>;
  
  // Modified for dry run and actual upload
  uploadMarkdownFile: (
    _topic: string, 
    _file: File, 
    _dryRun: boolean
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
}

export interface Filters {
  topic: string;
  subtopic: string;
  difficulty: string;
  type: string;
  searchText: string;
}

// For environment variables, especially API_KEY
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY?: string;
    }
  }
}
/**
 * @file src/types.ts
 * @description Defines shared TypeScript types and enums used throughout the application, such as Question, View, AppContextType, and various data structures for API interactions and state management.
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:45 PM ET - Refactored project structure into src/ and public/ directories and updated JSDoc.
 * 
 * @architectural-context
 * Layer: Core Types / Data Structures
 * Dependencies: None (Defines base types).
 * Pattern: Centralized type definitions for type safety and clarity.
 * 
 * @workflow-context N/A (Defines data structures used in various workflows).
 * @authentication-context N/A (Defines types related to auth state like AppContextType.isAuthenticated, but not logic itself).
 * @mock-data-context N/A.
 */
export enum View {
  DASHBOARD = 'dashboard',
  LOADER = 'loader',
  CURATION = 'curation',
}

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
  addQuestions: (topic: string, newQuestionsData: ParsedQuestionFromAI[]) => Promise<void>; // For batch/topic replacement from already parsed data
  deleteQuestion: (id: string) => Promise<void>;
  updateQuestion: (updatedQuestion: Question) => Promise<void>;
  addNewQuestion: (newQuestionData: Omit<Question, 'id'>) => Promise<void>;
  
  // Modified for dry run and actual upload
  uploadMarkdownFile: (
    topic: string, 
    file: File, 
    dryRun: boolean
  ) => Promise<{ parsedQuestions: ParsedQuestionFromAI[], report: ValidationReport } | void>;

  exportQuestionsToMarkdown: (selectedTopic?: string, selectedSubtopic?: string, selectedDifficulty?: string, selectedType?: string, searchText?: string) => void;

  // For pre-filtering CurationView
  initialCurationFilters: Partial<Filters> | null;
  setInitialCurationFilters: (filters: Partial<Filters>) => void;
  clearInitialCurationFilters: () => void;

  // Authentication
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;

  // Activity Log
  activityLog: ActivityLogItem[];
  logActivity: (action: string, details?: string) => void;
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
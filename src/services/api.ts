/**
 * @file src/services/api.ts
 * @description API service layer for QA Loader frontend - handles all backend communication with type safety and error handling
 * @created June 9, 2025 at unknown time
 * @updated June 13, 2025. 6:34 p.m. Eastern Time - Updated API_BASE_URL to point to backend server and added development notes about restart requirements
 * @updated June 13, 2025. 6:58 p.m. Eastern Time - Removed unused ApiResponse interface
 * @updated June 14, 2025. 8:56 a.m. Eastern Time - Removed unused verifyAuthToken function
 * @updated June 14, 2025. 9:27 a.m. Eastern Time - Added bulkDeleteQuestions function for bulk deletion operations
 * @updated June 14, 2025. 10:31 a.m. Eastern Time - Fixed authentication token key mismatch causing 403 errors on API calls
 * @updated June 14, 2025. 11:50 a.m. Eastern Time - Added validateMarkdownFile function for new validation workflow
 * 
 * @architectural-context
 * Layer: Service Layer (API Integration)
 * Dependencies: fetch API, TypeScript types
 * Pattern: Service layer abstraction with consistent error handling and response formatting
 * 
 * @workflow-context
 * User Journey: Supports all user workflows requiring backend communication
 * Sequence Position: Intermediary between React components and FastAPI backend
 * Inputs: Component requests with typed parameters
 * Outputs: Type-safe responses or standardized errors
 * 
 * @authentication-context
 * Auth Requirements: Some endpoints require JWT token in Authorization header
 * Security: Handles JWT token attachment, response validation, error standardization
 */

import { Question, ValidationResult, BatchUploadResult } from '../types';
import { SESSION_TOKEN_KEY } from '../constants';

// API Base Configuration
// NOTE: Changes to this URL require frontend server restart (npm run dev restart)
// Vite does not hot-reload changes to const declarations in some cases
const API_BASE_URL = 'http://localhost:8000/api';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};


/**
 * @interface PasswordResetResponse
 * @description Response format for password reset operations
 */
interface PasswordResetResponse {
  message: string;
  success: boolean;
}

/**
 * @interface BulkDeleteResponse
 * @description Response format for bulk delete operations with detailed results
 */
interface BulkDeleteResponse {
  success: boolean;
  deleted_count: number;
  failed_count: number;
  deleted_ids: string[];
  failed_ids: string[];
  message: string;
  errors?: Record<string, string>;
}

/**
 * @function getAuthHeaders
 * @description Gets authorization headers with JWT token if available
 * @returns {Record<string, string>} Headers object with Authorization if token exists
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  return token 
    ? { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` }
    : DEFAULT_HEADERS;
};

/**
 * @function handleApiError
 * @description Standardizes API error handling and response formatting
 * @param {Response} response - Fetch response object
 * @returns {Promise<never>} Throws standardized error
 */
const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.detail || errorData.message || errorMessage;
  } catch (parseError) {
    // If response isn't JSON, use status text
    console.warn('Failed to parse error response:', parseError);
  }
  
  throw new Error(errorMessage);
};

/**
 * @function requestPasswordReset
 * @description Initiates password reset process by sending reset email
 * @param {string} email - Email address for password reset
 * @returns {Promise<PasswordResetResponse>} Reset request response
 * @example:
 * try {
 *   await requestPasswordReset('admin@qaloader.com');
 *   console.log('Reset email sent');
 * } catch (error) {
 *   console.error('Reset failed:', error.message);
 * }
 */
export const requestPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
  const response = await fetch(`${API_BASE_URL}/password-reset-request`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * @function verifyResetToken
 * @description Verifies if password reset token is valid
 * @param {string} token - Password reset token to verify
 * @returns {Promise<{valid: boolean, email?: string}>} Token verification result
 * @example:
 * try {
 *   const result = await verifyResetToken('abc123def456');
 *   if (result.valid) {
 *     console.log('Token valid for:', result.email);
 *   }
 * } catch (error) {
 *   console.error('Token invalid:', error.message);
 * }
 */
export const verifyResetToken = async (token: string): Promise<{valid: boolean, email?: string}> => {
  const response = await fetch(`${API_BASE_URL}/password-reset-verify`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ token }),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * @function completePasswordReset
 * @description Completes password reset with token and new password
 * @param {string} token - Valid password reset token
 * @param {string} newPassword - New password to set
 * @returns {Promise<PasswordResetResponse>} Reset completion response
 * @example:
 * try {
 *   await completePasswordReset('abc123def456', 'newPassword123');
 *   console.log('Password updated successfully');
 * } catch (error) {
 *   console.error('Reset failed:', error.message);
 * }
 */
export const completePasswordReset = async (
  token: string, 
  newPassword: string
): Promise<PasswordResetResponse> => {
  const response = await fetch(`${API_BASE_URL}/password-reset-complete`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ 
      token, 
      new_password: newPassword 
    }),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * @function loginUser
 * @description Authenticates user with username and password
 * @param {string} username - Username for authentication
 * @param {string} password - Password for authentication
 * @returns {Promise<{access_token: string, token_type: string, username: string}>} Login response with JWT token
 * @example:
 * try {
 *   const result = await loginUser('admin', 'password123');
 *   sessionStorage.setItem('qa_loader_session', result.access_token);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 */
export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};


/**
 * @function fetchQuestions
 * @description Fetches filtered list of questions from backend
 * @param {object} filters - Optional filters for questions
 * @returns {Promise<Question[]>} Array of questions
 * @example:
 * const questions = await fetchQuestions({ topic: 'DCF', difficulty: 'Advanced' });
 */
export const fetchQuestions = async (filters?: Record<string, string>) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/questions?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * @function createQuestion
 * @description Creates a new question in the database
 * @param {object} questionData - Question data without ID
 * @returns {Promise<Question>} Created question with ID
 */
export const createQuestion = async (questionData: Omit<Question, 'id'>) => {
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * @function updateQuestion
 * @description Updates an existing question
 * @param {string} questionId - ID of question to update
 * @param {object} questionData - Updated question data
 * @returns {Promise<Question>} Updated question
 */
export const updateQuestion = async (questionId: string, questionData: Partial<Question>) => {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * @function deleteQuestion
 * @description Deletes a question by ID
 * @param {string} questionId - ID of question to delete
 * @returns {Promise<void>} Deletion confirmation
 */
export const deleteQuestion = async (questionId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
};

/**
 * @function bulkDeleteQuestions
 * @description Deletes multiple questions in a single operation
 * @param {string[]} questionIds - Array of question IDs to delete
 * @returns {Promise<BulkDeleteResponse>} Detailed results of bulk deletion
 * @example:
 * try {
 *   const result = await bulkDeleteQuestions(['DCF-001', 'VAL-002', 'LBO-003']);
 *   console.log(`Deleted ${result.deleted_count} questions`);
 *   if (result.failed_count > 0) {
 *     console.warn(`Failed to delete: ${result.failed_ids.join(', ')}`);
 *   }
 * } catch (error) {
 *   console.error('Bulk delete failed:', error.message);
 * }
 */
export const bulkDeleteQuestions = async (questionIds: string[]): Promise<BulkDeleteResponse> => {
  const response = await fetch(`${API_BASE_URL}/questions/bulk`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ question_ids: questionIds }),
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * @function validateMarkdownFile
 * @description Validates markdown file structure and content without saving to database
 * @param {string} topic - Topic for the uploaded content
 * @param {File} file - Markdown file to validate
 * @returns {Promise<ValidationResult>} Validation result with detailed feedback
 * @example:
 * try {
 *   const result = await validateMarkdownFile('DCF', file);
 *   if (result.isValid) {
 *     console.log(`Found ${result.parsedCount} valid questions`);
 *   } else {
 *     console.error('Validation errors:', result.errors);
 *   }
 * } catch (error) {
 *   console.error('Validation failed:', error.message);
 * }
 */
export const validateMarkdownFile = async (topic: string, file: File) => {
  const formData = new FormData();
  formData.append('topic', topic);
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/validate-markdown`, {
    method: 'POST',
    headers: {
      // Note: Don't set Content-Type for FormData - browser sets it automatically
      Authorization: getAuthHeaders().Authorization || '',
    },
    body: formData,
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * @function uploadMarkdownFile
 * @description Uploads and processes markdown file for database storage
 * @param {string} topic - Topic for the uploaded content
 * @param {File} file - Markdown file to upload
 * @returns {Promise<BatchUploadResult>} Upload result with detailed success/failure breakdown
 * @example:
 * try {
 *   const result = await uploadMarkdownFile('DCF', file);
 *   console.log(`Uploaded ${result.successfulUploads.length} questions`);
 *   if (result.failedUploads.length > 0) {
 *     console.warn('Failed uploads:', result.errors);
 *   }
 * } catch (error) {
 *   console.error('Upload failed:', error.message);
 * }
 */
export const uploadMarkdownFile = async (topic: string, file: File) => {
  const formData = new FormData();
  formData.append('topic', topic);
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload-markdown`, {
    method: 'POST',
    headers: {
      // Note: Don't set Content-Type for FormData - browser sets it automatically
      Authorization: getAuthHeaders().Authorization || '',
    },
    body: formData,
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

// Export API utilities
export { getAuthHeaders, handleApiError };
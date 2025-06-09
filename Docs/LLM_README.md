
**Purpose:** This document provides a detailed, LLM-focused overview of the Q&A Loader frontend prototype, covering its architecture, data flow, core functionalities, and key components to facilitate automated understanding and analysis of the codebase.

**Created on:** June 9, 2025. 1:30 p.m. Eastern Time
**Updated:** June 9, 2025. 1:30 p.m. Eastern Time - Initial creation of LLM-focused README.

---

# Q&A Loader Frontend Prototype - LLM Technical Overview

## 1. Project Goal and Core Functionality

The Q&A Loader is a React-based frontend prototype for an internal tool designed to manage a database of financial questions and answers. Its primary goal is to provide content administrators with a user-friendly interface for:

1.  **Dashboard Overview**: Monitoring content metrics, breakdowns by topic/difficulty, and recent activity.
2.  **Content Loading**: Uploading Q&A content from Markdown files, including a "dry run" analysis using the Gemini API, and a final "load to database" step (simulated).
3.  **Content Curation**: Searching, filtering, viewing, adding, editing, duplicating, and deleting Q&A items, as well as exporting content.

## 2. Frontend Technology Stack

*   **Core Framework**: React 19 (via ES Modules from `esm.sh`)
*   **Language**: TypeScript
*   **Styling**: TailwindCSS (CDN), custom global styles in `index.html`
*   **State Management**: React Context API (`contexts/AppContext.tsx`)
*   **Notifications**: `react-hot-toast`
*   **External API Integration**: Google Gemini API (via `@google/genai` library) for Markdown parsing during "dry run" analysis.

## 3. Architectural Overview

### 3.1. Application Entry Point and Structure

*   **`index.html`**: Main HTML file. Sets up basic page structure, imports TailwindCSS, Google Fonts, and defines an import map for ES module resolution (React, ReactDOM, `@google/genai`, `react-hot-toast`). It also includes a shim for `process.env` to allow the Gemini SDK to access `API_KEY`.
*   **`index.tsx`**: Main JavaScript/TypeScript entry point. Renders the root `<App />` component into the DOM element with `id="root"`.
*   **`App.tsx`**: The root React component.
    *   Wraps the application with `<AppProvider>` to make global state and actions available.
    *   Initializes `<Toaster />` for system-wide notifications.
    *   Contains `<AppContent />` which handles the main conditional rendering logic.
*   **`<AppContent />` (within `App.tsx`)**:
    *   Uses `useAppContext` to access `isAuthenticated` and `isContextLoading`.
    *   Displays a loading indicator during initial authentication check.
    *   If not authenticated, renders `<LoginView />`.
    *   If authenticated, renders the main application layout:
        *   `<Sidebar />` for navigation.
        *   The currently active view (`DashboardView`, `LoaderView`, or `CurationView`) based on `activeView` state.

### 3.2. State Management: `contexts/AppContext.tsx`

This is the central hub for global application state and logic.

*   **Provided State**:
    *   `questions`: `Question[]` - Array of all Q&A items.
    *   `topics`: `string[]` - List of unique topic names.
    *   `topicSummaries`: `TopicSummary[]` - Aggregated data per topic (total questions, difficulty counts).
    *   `lastUploadTimestamp`: `number | null` - Timestamp of the last content upload.
    *   `isContextLoading`: `boolean` - Indicates if context data is currently being fetched or processed.
    *   `isAuthenticated`: `boolean` - User's authentication status.
    *   `activityLog`: `ActivityLogItem[]` - Log of recent user and system actions.
    *   `initialCurationFilters`: `Partial<Filters> | null` - Filters to pre-apply to `CurationView` when navigating from another view.
*   **Key Functions (Actions)**:
    *   **Authentication**: `login(password: string)`, `logout()`.
    *   **Data Fetching**: `fetchInitialData()` - Simulates fetching bootstrap data from `/api/bootstrap-data`.
    *   **CRUD Operations (Simulated Backend Calls)**:
        *   `addQuestions(topic: string, newQuestionsData: ParsedQuestionFromAI[])`: Batch replaces questions for a topic (simulates `POST /api/topics/{topic}/questions/batch-replace`).
        *   `deleteQuestion(id: string)`: Deletes a question (simulates `DELETE /api/questions/{id}`).
        *   `updateQuestion(updatedQuestion: Question)`: Updates a question (simulates `PUT /api/questions/{id}`).
        *   `addNewQuestion(newQuestionData: Omit<Question, 'id'>)`: Adds a new question (simulates `POST /api/questions`).
    *   **File Operations**:
        *   `uploadMarkdownFile(topic: string, file: File, dryRun: boolean)`:
            *   If `dryRun` is true, uses `geminiService.parseMarkdownToQA` for analysis.
            *   If `dryRun` is false, simulates upload to `/api/upload-markdown`.
        *   `exportQuestionsToMarkdown(...)`: Generates and downloads a Markdown file from filtered questions.
    *   **Activity Logging**: `logActivity(action: string, details?: string)`.
    *   **Curation View Navigation**: `setInitialCurationFilters(filters: Partial<Filters>)`, `clearInitialCurationFilters()`.
*   **Error Handling**: Uses `react-hot-toast` for user-facing error messages and `console.error` for detailed logs. Simulates API call failures.
*   **Data Flow**: Components consume state and trigger actions via the `useAppContext` hook. State updates within the context provider cause re-renders in consuming components.

### 3.3. Core Components

*   **`components/LoginView.tsx`**:
    *   Handles user login via a password input.
    *   Calls `appContext.login()` on submission.
    *   Uses `MOCK_PASSWORD` from `constants.ts` for prototype authentication.
*   **`components/Sidebar.tsx`**:
    *   Displays navigation links (`NAV_ITEMS` from `constants.ts`).
    *   Manages `activeView` state in `AppContent` via `setActiveView` prop.
    *   Includes a logout button that calls `appContext.logout()`.
*   **`components/DashboardView.tsx`**:
    *   Displays key metrics (`MetricCard`), content breakdown by topic (bar charts with difficulty distribution), and a recent activity feed.
    *   Data sourced from `appContext` (`topicSummaries`, `questions`, `lastUploadTimestamp`, `activityLog`).
    *   Allows navigation to `CurationView` with pre-set topic filters by calling `appContext.setInitialCurationFilters()`.
*   **`components/LoaderView.tsx`**:
    *   Manages a multi-step workflow for uploading Markdown files:
        1.  Topic selection (existing or new).
        2.  File selection (input field and drag & drop).
        3.  "Analyze File (Dry Run)": Calls `appContext.uploadMarkdownFile(topic, file, true)`, which in turn uses `geminiService.parseMarkdownToQA`. Displays `ValidationReport` and `ParsedQuestionFromAI[]` preview.
        4.  "Load to Database": If dry run is successful, allows user to proceed. Opens a confirmation modal. On confirmation, calls `appContext.addQuestions(topic, parsedData)` (which simulates the backend replacing questions for that topic).
*   **`components/CurationView.tsx`**:
    *   The main interface for managing Q&A content.
    *   **Filtering**: Allows filtering questions by topic, subtopic, difficulty, type, and free-text search. `availableSubtopics` are dynamically populated based on selected topic.
    *   **Table Display**: Shows filtered questions with columns for ID, topic, subtopic, difficulty, type, and question text. Includes row selection via checkboxes for bulk actions.
    *   **Actions per Question**: Edit, Duplicate, Delete buttons for each row. These actions open the `QuestionModal` or a delete confirmation modal.
    *   **Bulk Actions**: Delete selected, Move selected (conceptual).
    *   **Export**: Button to export currently filtered results to Markdown using `appContext.exportQuestionsToMarkdown()`.
    *   **Add New Question**: Button to open `QuestionModal` in "add new" mode.
*   **`components/QuestionModal.tsx`**:
    *   A modal dialog for creating, editing, or duplicating questions.
    *   Form fields for topic (existing or new), subtopic, difficulty, type, question text, and answer text.
    *   On submit, calls `appContext.addNewQuestion()` or `appContext.updateQuestion()`.
    *   Uses `DIFFICULTIES` and `QUESTION_TYPES` from `constants.ts` for dropdowns.
*   **`components/icons/IconComponents.tsx`**: A collection of reusable SVG icon components.

### 3.4. Service Layer

*   **`services/geminiService.ts`**:
    *   `parseMarkdownToQA(markdownContent: string, topicName: string): Promise<ParsedQuestionFromAI[]>`:
        *   Constructs a detailed prompt for the Gemini API, instructing it to parse Markdown into a JSON array of Q&A objects with specific fields (`subtopic`, `difficulty`, `type`, `question`, `answer`).
        *   Uses `GEMINI_MODEL_TEXT` from `constants.ts`.
        *   Requires `API_KEY` from `process.env.API_KEY`.
        *   Sets `responseMimeType: "application/json"` in the API request.
        *   Includes logic to clean potential markdown fences (```json ... ```) from the API response text before parsing.
        *   Performs basic validation on the parsed JSON structure.

## 4. Key Data Structures (`types.ts`)

*   **`View` (enum)**: `DASHBOARD`, `LOADER`, `CURATION`.
*   **`Question` (interface)**: `{ id: string, topic: string, subtopic: string, difficulty: string, type: string, questionText: string, answerText: string }`. `id` is backend-controlled.
*   **`ParsedQuestionFromAI` (interface)**: Structure expected from Gemini API: `{ subtopic: string, difficulty: string, type: string, question: string, answer: string }`.
*   **`TopicSummary` (interface)**: Aggregated data for dashboard: `{ name: string, totalQuestions: number, basicCount: number, advancedCount: number }`.
*   **`ValidationReport` (interface)**: Used in `LoaderView` after dry run: `{ success: boolean, message: string, parsedCount?: number, topic?: string, errors?: string[] }`.
*   **`ActivityLogItem` (interface)**: `{ id: string, action: string, details?: string, timestamp: number }`.
*   **`AppContextType` (interface)**: Defines the shape of the global application context.
*   **`Filters` (interface)**: Structure for filtering in `CurationView`: `{ topic: string, subtopic: string, difficulty: string, type: string, searchText: string }`.

## 5. Authentication Flow

1.  **Initial Load**: `AppContent` checks `isAuthenticated` from `AppContext`. `AppContext` checks `sessionStorage` for `SESSION_TOKEN_KEY` (`qnaLoaderSessionToken`).
2.  **If Not Authenticated**: `<LoginView />` is rendered.
    *   User enters password (prototype: `MOCK_PASSWORD` = "password123").
    *   `LoginView` calls `appContext.login(password)`.
    *   `appContext.login()`:
        *   Compares password with `MOCK_PASSWORD`.
        *   If match:
            *   Sets `isAuthenticated` to `true`.
            *   Stores a mock token in `sessionStorage.setItem(SESSION_TOKEN_KEY, 'mock-jwt-token-for-prototype')`.
            *   Triggers `fetchInitialData()`.
            *   Logs "Logged in" activity.
            *   Displays success toast.
        *   If no match: Displays error toast.
3.  **If Authenticated**: `AppContent` renders `<Sidebar />` and the active view. `AppContext`'s `useEffect` (dependent on `isAuthenticated`) calls `fetchInitialData()`.
4.  **Logout**: User clicks Logout in `Sidebar`.
    *   `Sidebar` calls `appContext.logout()`.
    *   `appContext.logout()`:
        *   Removes `SESSION_TOKEN_KEY` from `sessionStorage`.
        *   Sets `isAuthenticated` to `false`.
        *   Clears application data (questions, topics, etc.).
        *   Displays success toast.

## 6. Environment Variables

*   **`API_KEY`**: Google Gemini API Key.
    *   **Access**: `process.env.API_KEY`.
    *   **Setup (Local Dev)**: `index.html` contains a script to shim `window.process.env.API_KEY`. This is a local development workaround. For production or more robust development, this would be managed by a build system or environment injection.
    *   **Usage**: Exclusively by `services/geminiService.ts` to initialize `GoogleGenAI`.

## 7. File Structure Overview

*   **`public/`**: Contains `index.html` and other static assets (if any).
*   **`src/`**: (Assumed conventional location, though current structure is flat)
    *   **`components/`**: React UI components.
        *   **`icons/`**: SVG icon components.
        *   `App.tsx` (Root component logic).
        *   `Sidebar.tsx`
        *   View components: `DashboardView.tsx`, `LoaderView.tsx`, `CurationView.tsx`.
        *   Modal components: `QuestionModal.tsx`.
        *   `LoginView.tsx`.
    *   **`contexts/`**: React context providers (`AppContext.tsx`).
    *   **`services/`**: External API interaction logic (`geminiService.ts`).
    *   **`types/`**: TypeScript type definitions (`types.ts`).
    *   **`constants/`**: Application-wide constants (`constants.ts`).
    *   `index.tsx` (Application entry point).
*   **`Docs/`**: Documentation files (`doc_standards.md`).
*   Other root files: `metadata.json`, `README.md`, `LLM_README.md`, `APIs.md`.

## 8. Error Handling and Notifications

*   **`react-hot-toast`**: Used for user-facing notifications (success, error, custom). Configured in `App.tsx` with default styles and specific styles for success/error/custom types.
*   **`AppContext.tsx`**: Most action functions include `try...catch` blocks to handle errors from simulated API calls or other operations, displaying toasts accordingly.
*   **`geminiService.ts`**: Throws errors if API key is missing, API call fails, or JSON parsing fails. These errors are caught by `LoaderView` (via `AppContext`) and displayed.
*   **Form Validation**: Client-side validation in `QuestionModal.tsx` (for required fields) and `LoaderView.tsx` (for topic/file selection) triggers toasts on failure.

This LLM-focused README aims to provide a structured and comprehensive understanding of the Q&A Loader frontend prototype's design and implementation.

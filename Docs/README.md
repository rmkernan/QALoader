
**Purpose:** Main project documentation, providing an overview, feature list, architecture, API contract, and setup instructions for the Q&A Loader frontend prototype.

**Created on:** June 8, 2025. 9:00 p.m. Eastern Time
**Updated:** June 9, 2025. 1:30 p.m. Eastern Time - Offloaded detailed API contract to APIs.md.

---

# Mock Me Q&A Loader - Frontend Prototype

## 1. Project Overview

This project is a frontend prototype for an internal tool designed to manage a Q&A database (intended for Supabase) containing financial questions and answers. It provides a user interface for content administrators to upload, curate, and analyze the question bank, facilitating efficient maintenance and expansion of educational content. The frontend uses the Gemini API for parsing Markdown files during the upload process (specifically for dry runs).

## 2. Core Features

The application is structured around three primary views:

*   **Dashboard**: Provides at-a-glance analytics on the state of the question bank. This includes metrics like total questions, topics, and subtopics, a visual breakdown of content by topic and difficulty, and a recent activity feed to track changes and uploads.
*   **Loader View**: Implements a guided, multi-step workflow for safely uploading Markdown files. Users can select a topic (or create a new one), upload a `.md` file, and trigger a "dry run" analysis (using Gemini API) to preview parsed questions and validation results before committing the changes. The final load operation is intended to replace all questions for the specified topic.
*   **Manage Content (Curation View)**: A comprehensive interface for managing the question bank. It allows users to search and filter questions by various criteria (topic, subtopic, difficulty, type, text content), edit existing questions, add new ones, duplicate questions, delete individual questions, and export filtered results to Markdown format. It also includes bulk action capabilities for deleting or moving selected questions.

## 3. Key Component Architecture

The project follows a component-based architecture typical of React applications:

*   **`App.tsx`**: Serves as the main application shell. It sets up the `AppProvider` for global state management, initializes the `Toaster` for notifications, and handles routing between the `LoginView` and the main application content (which includes the `Sidebar` and the active view: `DashboardView`, `LoaderView`, or `CurationView`).
*   **`contexts/AppContext.tsx`**: This is the heart of the application's state management. It uses React Context to provide global state (questions, topics, user authentication status, activity log, etc.) and functions to interact with this state. Crucially, it contains the logic for simulated API communication (fetch calls to placeholder backend endpoints) for CRUD operations, file uploads, and data fetching.
*   **`components/DashboardView.tsx`**: Renders the dashboard, displaying metrics, content breakdown charts, and the activity log. It utilizes data from `AppContext`.
*   **`components/LoaderView.tsx`**: Implements the UI for the Markdown file loading workflow, including topic selection, file input (with drag & drop), dry run analysis, and a confirmation step for loading data.
*   **`components/CurationView.tsx`**: Provides the detailed content management interface with filtering options, a table displaying questions, and modals for adding/editing questions. It also handles single and bulk question operations.
*   **`services/geminiService.ts`**: Contains the logic for interacting with the Google Gemini API, specifically the `parseMarkdownToQA` function used in the Loader View's dry run feature.
*   **`components/LoginView.tsx`**: A simple login interface that gates access to the main application. For this prototype, it uses a mock password.

## 4. Assumed Backend API Contract

The frontend prototype makes `fetch` calls to several placeholder API endpoints, simulating interactions with a backend. A detailed specification of these endpoints, including request/response structures, path parameters, and expected behavior, is documented in the **[`APIs.md`](./APIs.md)** file in the root of this project.

This dedicated `APIs.md` document serves as the comprehensive reference for the backend API contract that this frontend prototype is built against.

## 5. How to Run This Prototype

To run this React prototype locally:

1.  **Set up API Key**:
    This application uses the Google Gemini API for Markdown parsing. You need to have a Gemini API key.
    The application expects the API key to be available as an environment variable named `API_KEY`.
    When running locally, you can make it available to the `index.html` by modifying the script section:
    ```html
    <!-- In index.html -->
    <script>
      if (typeof process === 'undefined') {
        window.process = {
          env: {
            API_KEY: "YOUR_API_KEY_HERE_FOR_LOCAL_TESTING_ONLY"
          }
        };
      } else if (typeof process.env === 'undefined') {
        process.env = {};
      }
      // If process.env already exists, you might need to ensure API_KEY is set here too
      // if (process.env && !process.env.API_KEY) {
      //   process.env.API_KEY = "YOUR_API_KEY_HERE_FOR_LOCAL_TESTING_ONLY";
      // }
    </script>
    ```
    **Important**: Never commit your actual API key to version control. This method is for local development convenience.

2.  **Install dependencies**:
    This project assumes a modern browser environment with support for ES Modules and uses an import map in `index.html` to load dependencies like React, ReactDOM, and `@google/genai` directly from `esm.sh`. Therefore, a traditional `npm install` step for these libraries might not be necessary if you are running it directly as static files. However, if a development server or build process is introduced (e.g., for TypeScript compilation if not done in-browser, or for linting/formatting tools), then `npm install` would be used for development dependencies.

3.  **Run the development server**:
    For this prototype, which relies on ES modules and an import map:
    *   You can use a simple HTTP server to serve the project directory. Many tools can do this, e.g., `http-server` (installable via `npm install -g http-server`) or Python's built-in server (`python -m http.server`).
    *   Navigate to the project's root directory in your terminal.
    *   If using `http-server`, run: `http-server .`
    *   If using Python 3, run: `python -m http.server 8000` (or any desired port).

    This will start a local server.

4.  **Access the Application**:
    Open your browser and navigate to the local address provided by the server (e.g., `http://localhost:8080` if using `http-server`, or `http://localhost:8000` if using Python's server). You will be greeted by the login screen. Use the mock password `password123` to log in.

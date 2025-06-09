Prompts for Building the Mock Me Q&A Loader - Phase 2
Introduction
Overall Goal & Context for AI Studio:
This is "Phase 2" of our prototype development. The goal is to enhance the existing functional prototype with a polished, modern design and advanced user experience features. You will be making significant upgrades to the UI/UX across the entire application, and adding new functionality to the Dashboard and Manage Content views. Continue to treat all API calls as placeholders; the focus remains on building a high-fidelity frontend.

Prompt 1: Implement a Modern Design System & UI Polish
Goal: Refine the overall look and feel of the application by applying a consistent, modern design system to all components. The goal is to elevate the UI from purely functional to polished and professional.

Acceptance Criteria:

Color Palette: Systematically apply a more nuanced color palette. For example, use slate-500 for secondary text, slate-700 for primary text, indigo-600 for primary buttons and active states, and slate-100 for hover backgrounds.

Shadows & Borders: Update all cards, modals, and tables to use softer, more modern box shadows (e.g., shadow-md instead of shadow-sm) and subtle, rounded borders (rounded-lg).

Spacing & Typography: Ensure consistent padding and margin throughout the application (e.g., standardizing on p-6 for cards). Improve typography for better readability.

Buttons & Inputs: All buttons should have a subtle transition effect on hover. Input fields should have a clean focus state (e.g., a soft blue or indigo ring). The dark background issue on input fields in modals must be fixed.

Prompt 2: Enhance the Dashboard View
Goal: Transform the dashboard from a static list of numbers into a more dynamic and visual "mission control" center.

Acceptance Criteria:

Visual Charts: In the "Content Breakdown" section, replace the text-based list with simple, clean data visualizations.

Implement a Bar Chart to show the total number of questions for each topic.

For each topic, display a Donut Chart or a stacked progress bar that visually represents the breakdown of Basic vs. Advanced questions.

Recent Activity Feed:

Add a new component to the dashboard titled "Recent Activity."

This feed should display the last 5 actions taken within the app (e.g., "Uploaded questions for 'DCF'", "Deleted question 'DCF-WACC-P-003'", "Edited question 'ACC-FS-B-G-012'").

Each activity item should have a timestamp (e.g., "5 minutes ago," "2 hours ago").

The backend will eventually provide this data, but for the prototype, simulate this with a client-side log that updates when CRUD actions are performed.

Prompt 3: Upgrade the Loader View
Goal: Improve the usability of the "Load from Markdown" view by adding a modern drag-and-drop feature.

Acceptance Criteria:

In addition to the "Choose File" button, the view must now include a large, clearly marked "Drag-and-Drop Zone."

This zone should have a dashed border and instructional text (e.g., "Drag your .md file here or click to browse").

When a user drags a file over the zone, it must provide clear visual feedback by changing its background color and icon.

Dropping a file onto the zone should have the exact same effect as selecting it with the file input button.

The "Analyze File (Dry Run)" button should become active as soon as a file has been selected via either method.

Prompt 4: Implement Advanced Content Management Features
Goal: Add powerful new features to the "Manage Content" view to streamline the process of creating and maintaining questions.

Acceptance Criteria:

Duplicate Question Feature:

In the results table, add a new "Duplicate" icon/button to each row next to "Edit" and "Delete."

Clicking "Duplicate" should open the QuestionModal pre-filled with the data from the selected question, but with the title "Duplicate Question."

Safety Check: The "Save" button in the modal must remain disabled until at least one character in the questionText, answerText, or notes_for_tutor has been changed from the original. This prevents accidental creation of identical questions.

Bulk Actions:

Add a checkbox to the header of the results table and to the beginning of each question row.

When one or more checkboxes are ticked, a "Bulk Actions" dropdown button should appear at the top of the table.

This dropdown should contain the following actions (for now, they can just trigger a toast notification confirming the action):

"Delete Selected"

"Move Selected to..." (which would eventually open a modal to choose a new topic/subtopic).
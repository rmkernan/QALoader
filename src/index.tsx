/**
 * @file src/index.tsx
 * @description Main entry point for the React application. Mounts the root App component into the DOM.
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:45 PM ET - Refactored project structure into src/ and public/ directories and updated JSDoc.
 * @updated June 19, 2025. 3:56 PM Eastern Time - Added performance timing logs for startup tracking
 * 
 * @architectural-context
 * Layer: Application Bootstrap
 * Dependencies: react, react-dom/client, ./App.
 * Pattern: Standard React application entry point.
 * 
 * @workflow-context  
 * User Journey: Application Initialization.
 * Sequence Position: Executed after index.html is loaded and its scripts are processed.
 * Inputs: DOM element with ID 'root'.
 * Outputs: Renders the App component into the 'root' DOM element.
 * 
 * @authentication-context N/A (Delegates authentication handling to the App component).
 * @mock-data-context N/A.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Track startup timing
const startTime = performance.now();
console.log('[FRONTEND] Starting React application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log(`[FRONTEND] Creating React root (+${(performance.now() - startTime).toFixed(2)}ms)`);
const root = ReactDOM.createRoot(rootElement);

console.log(`[FRONTEND] Rendering App component (+${(performance.now() - startTime).toFixed(2)}ms)`);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log when initial render is complete
requestAnimationFrame(() => {
  console.log(`[FRONTEND] ✅ Initial render complete (+${(performance.now() - startTime).toFixed(2)}ms)`);
});
/**
 * @file src/index.tsx
 * @description Main entry point for the React application. Mounts the root App component into the DOM.
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:45 PM ET - Refactored project structure into src/ and public/ directories and updated JSDoc.
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

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
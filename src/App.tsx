/**
 * @file src/App.tsx
 * @description Main application component. Sets up the AppProvider, Toaster, and handles routing between LoginView and the main application layout (Sidebar + active view).
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:45 PM ET - Refactored project structure into src/ and public/ directories and updated JSDoc.
 * 
 * @architectural-context
 * Layer: UI Component (Root Application Shell)
 * Dependencies: react, ./components/Sidebar, ./components/DashboardView, ./components/LoaderView, ./components/CurationView, ./components/LoginView, ./types (View), ./contexts/AppContext, react-hot-toast.
 * Pattern: Root component with context providers, conditional rendering for authentication, and view switching.
 * 
 * @workflow-context  
 * User Journey: Application Entry, Authentication, Main Navigation.
 * Sequence Position: Top-level component rendered by index.tsx.
 * Inputs: User interactions leading to view changes, authentication state from AppContext.
 * Outputs: Renders the appropriate view based on authentication state and user navigation.
 * 
 * @authentication-context
 * Auth Modes: Uses isAuthenticated from AppContext to gate access to main content, rendering LoginView if not authenticated.
 * Security: Relies on AppContext for authentication state.
 * 
 * @mock-data-context N/A (Consumes AppContext which handles its own mock states).
 */
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import LoaderView from './components/LoaderView';
import CurationView from './components/CurationView';
import LoginView from './components/LoginView'; // Import LoginView
import { View } from './types';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Toaster } from 'react-hot-toast'; // Import Toaster

/**
 * @component AppContent
 * @description Renders the main application layout if the user is authenticated (Sidebar and current view) or the LoginView if not. Also handles the initial loading state.
 * @returns {JSX.Element} The JSX for the main application content or login view.
 * @usage Rendered within the `App` component, wrapped by `AppProvider`.
 */
const AppContent: React.FC = () => {
  const { isAuthenticated, isContextLoading } = useAppContext();
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);

  const renderView = () => {
    switch (activeView) {
      case View.DASHBOARD:
        return <DashboardView setActiveView={setActiveView} />;
      case View.LOADER:
        return <LoaderView />;
      case View.CURATION:
        return <CurationView />;
      default:
        return <DashboardView setActiveView={setActiveView} />;
    }
  };

  if (isContextLoading && !isAuthenticated) { // Show loading only during initial auth check
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-lg font-semibold text-slate-600">Loading Application...</div>
        {/* You could add a spinner here */}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

/**
 * @component App
 * @description Root component of the application. Wraps `AppContent` with `AppProvider` to provide global state and `Toaster` for notifications.
 * @returns {JSX.Element} The root JSX element for the application.
 * @usage Rendered by `ReactDOM.createRoot().render()` in `index.tsx`.
 */
const App: React.FC = () => {
  return (
    <AppProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: { // Default toast style
            background: '#fff', // white
            color: '#334155', // slate-700
            border: '1px solid #e2e8f0', // slate-200
            borderRadius: '0.5rem', // rounded-lg
            padding: '1rem', // p-4
          },
          success: {
            style: {
              background: '#f0fdf4', // green-50
              color: '#15803d', // green-700
              border: '1px solid #bbf7d0', // green-200
            },
            iconTheme: {
              primary: '#22c55e', // green-500
              secondary: '#f0fdf4', // green-50
            },
          },
          error: {
            style: {
              background: '#fef2f2', // red-50
              color: '#b91c1c', // red-700
              border: '1px solid #fecaca', // red-200
            },
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: '#fef2f2', // red-50
            },
          },
          custom: { // For the amber prototype toast in AppContext
             style: {
              background: '#fffbeb', // amber-50
              color: '#b45309', // amber-700
              border: '1px solid #fde68a', // amber-200
            },
          }
         }}
      />
      <AppContent />
    </AppProvider>
  );
};

export default App;
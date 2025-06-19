/**
 * @file components/LoginView.tsx
 * @description Provides the user interface for authentication with support for both username/password login and password reset flow.
 * @created June 13, 2025. 12:03 p.m. Eastern Time
 * @updated June 16, 2025. 8:51 PM Eastern Time - Added test user selector for development mode
 * @updated June 19, 2025. 6:04 PM Eastern Time - Removed simple login option, consolidated to backend authentication only
 * 
 * @architectural-context
 * Layer: UI Component (Application View/Page - Authentication)
 * Dependencies: react, ../contexts/AppContext (for `login` function, `isContextLoading`), ../constants (for `APP_TITLE`), ./icons/IconComponents (for `AppLogoIcon`), ./PasswordResetView
 * Pattern: Form-based authentication with state-based navigation to password reset flow
 * 
 * @workflow-context  
 * User Journey: User Authentication (Login) or Password Reset (Forgot Password).
 * Sequence Position: Entry point to the application if the user is not authenticated.
 * Inputs: Username/password for login, or email for password reset.
 * Outputs: Calls `login` function from `AppContext` or navigates to password reset flow.
 * 
 * @authentication-context
 * Auth Requirements: Public component - handles unauthenticated users
 * Security: Backend JWT authentication only, includes password reset flow
 */
import React, { useState, FormEvent, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { APP_TITLE } from '../constants';
import { AppLogoIcon } from './icons/IconComponents';
import { PasswordResetView } from './PasswordResetView';

// Test user configuration
const TEST_USERS = [
  { email: 'testuser1@dev.com', username: 'testuser1', label: 'Test User 1' },
  { email: 'testuser2@dev.com', username: 'testuser2', label: 'Test User 2' },
  { email: 'testuser3@dev.com', username: 'testuser3', label: 'Test User 3' }
];

const TEST_USER_PASSWORD = '12345678aA1';

/**
 * @component LoginView
 * @description Renders the login form with username/password fields and password reset functionality
 * @returns {JSX.Element} The JSX for the login view or password reset view
 * @example
 * <LoginView />
 */
const LoginView: React.FC = () => {
  const { login, isContextLoading } = useAppContext();
  
  // Form fields
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);
  const [enableTestUsers, setEnableTestUsers] = useState<boolean>(false);
  const [selectedTestUser, setSelectedTestUser] = useState<string>('');

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

  /**
   * @function handleTestUserSelect
   * @description Populates form fields when a test user is selected
   * @param {string} userEmail - Email of the selected test user
   */
  const handleTestUserSelect = (userEmail: string) => {
    const user = TEST_USERS.find(u => u.email === userEmail);
    if (user) {
      setUsername(user.email); // Can use either email or username to login
      setPassword(TEST_USER_PASSWORD);
      setSelectedTestUser(userEmail);
    }
  };

  /**
   * @function handleSubmit
   * @description Handles form submission for backend authentication
   * @param {FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!password.trim() || !username.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    // Use backend authentication
    await login(username, password);
    
    setIsLoading(false);
  };

  /**
   * @function handlePasswordResetBack
   * @description Returns to login view from password reset
   */
  const handlePasswordResetBack = () => {
    setShowPasswordReset(false);
  };

  // Reset test user selection when toggling test users off
  useEffect(() => {
    if (!enableTestUsers) {
      setSelectedTestUser('');
      setUsername('');
      setPassword('');
    }
  }, [enableTestUsers]);

  // Show password reset view
  if (showPasswordReset) {
    return <PasswordResetView onBackToLogin={handlePasswordResetBack} />;
  }

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col items-center justify-center p-4 z-[100]" role="main">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <AppLogoIcon className="h-16 w-16 text-indigo-600 mb-4" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-slate-800">{APP_TITLE}</h1>
          <p className="text-slate-500 mt-1">Please log in to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="login-heading">
          <h2 id="login-heading" className="sr-only">Login Form</h2>
          

          {/* Test User Toggle - Only show in development mode */}
          {isDevelopment && (
            <div className="border-t pt-4">
              <label className="flex items-center space-x-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={enableTestUsers}
                  onChange={(e) => setEnableTestUsers(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span>Enable Test User Login</span>
              </label>
            </div>
          )}

          {/* Test User Dropdown */}
          {enableTestUsers && (
            <div>
              <label htmlFor="test-user" className="block text-sm font-medium text-slate-700 mb-1">
                Select Test User
              </label>
              <select
                id="test-user"
                value={selectedTestUser}
                onChange={(e) => handleTestUserSelect(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={isLoading || isContextLoading}
              >
                <option value="">Choose a test user...</option>
                {TEST_USERS.map(user => (
                  <option key={user.email} value={user.email}>
                    {user.label} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Username field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username or Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-900"
              placeholder="Enter username or email"
              disabled={isLoading || isContextLoading}
            />
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-required="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-900"
              placeholder="Enter password"
              disabled={isLoading || isContextLoading}
              aria-describedby="password-hint"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-colors duration-150 ease-in-out"
              disabled={
                isLoading || 
                isContextLoading || 
                !password.trim() || 
                !username.trim()
              }
            >
              {isLoading || isContextLoading ? 'Logging In...' : 'Log In'}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </form>

        <div id="password-hint" className="mt-6 text-center text-xs text-slate-400 space-y-1">
          {enableTestUsers ? (
            <p>Test users all use password: {TEST_USER_PASSWORD}</p>
          ) : (
            <>
              <p>Use your assigned credentials to log in</p>
              <p>Password reset available for registered emails</p>
            </>
          )}
        </div>
      </div>
       <footer className="absolute bottom-4 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} {APP_TITLE} Prototype
      </footer>
    </div>
  );
};

export default LoginView;
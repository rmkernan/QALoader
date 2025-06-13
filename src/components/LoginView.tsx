/**
 * @file components/LoginView.tsx
 * @description Provides the user interface for authentication with support for both username/password login and password reset flow.
 * @created June 13, 2025. 12:03 p.m. Eastern Time
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
 * Security: Supports both real backend authentication and mock fallback, includes password reset flow
 */
import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { APP_TITLE } from '../constants';
import { AppLogoIcon } from './icons/IconComponents';
import { PasswordResetView } from './PasswordResetView';

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
  const [useAdvancedAuth, setUseAdvancedAuth] = useState<boolean>(false);

  /**
   * @function handleSubmit
   * @description Handles form submission for both advanced and simple authentication
   * @param {FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      return;
    }
    
    if (useAdvancedAuth && !username.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    if (useAdvancedAuth) {
      // Use real backend authentication
      await login(username, password);
    } else {
      // Fallback to simple password authentication
      await login(password);
    }
    
    setIsLoading(false);
  };

  /**
   * @function handlePasswordResetBack
   * @description Returns to login view from password reset
   */
  const handlePasswordResetBack = () => {
    setShowPasswordReset(false);
  };

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
          
          {/* Auth Mode Toggle */}
          <div className="flex items-center justify-center space-x-4 text-sm">
            <button
              type="button"
              onClick={() => setUseAdvancedAuth(false)}
              className={`px-3 py-1 rounded-md transition-colors ${
                !useAdvancedAuth 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Simple Login
            </button>
            <button
              type="button"
              onClick={() => setUseAdvancedAuth(true)}
              className={`px-3 py-1 rounded-md transition-colors ${
                useAdvancedAuth 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Backend Auth
            </button>
          </div>

          {/* Username field - only shown in advanced mode */}
          {useAdvancedAuth && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required={useAdvancedAuth}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-900"
                placeholder="Username (admin)"
                disabled={isLoading || isContextLoading}
              />
            </div>
          )}

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 sr-only">
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
              placeholder="Password"
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
                (useAdvancedAuth && !username.trim())
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
          {useAdvancedAuth ? (
            <>
              <p>Backend Auth: admin / your_admin_password</p>
              <p>Password reset available for admin@qaloader.com</p>
            </>
          ) : (
            <p>Simple Login: password123</p>
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

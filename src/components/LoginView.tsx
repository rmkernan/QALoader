/**
 * @file components/LoginView.tsx
 * @description Provides the user interface for authentication. It captures user credentials (password for this prototype) and uses `AppContext` to handle the login process.
 * @created 2024.06.08 9:00 PM ET
 * @updated 2024.06.09 1:15 PM ET - Applied comprehensive documentation standards.
 * 
 * @architectural-context
 * Layer: UI Component (Application View/Page - Authentication)
 * Dependencies: react, ../contexts/AppContext (for `login` function, `isContextLoading`), ../constants (for `APP_TITLE`), ./icons/IconComponents (for `AppLogoIcon`).
 * Pattern: Form-based input for authentication credentials. Interacts with a global context for authentication logic.
 * 
 * @workflow-context  
 * User Journey: User Authentication (Login).
 * Sequence Position: Entry point to the application if the user is not authenticated.
 * Inputs: User-entered password, submit action.
 * Outputs: Calls `login` function from `AppContext`. UI state changes based on `isContextLoading`.
 * 
 * @authentication-context
 * Auth Modes: Primary authentication interface.
 * Security: Handles password input. Relies on `AppContext` for the actual authentication logic (currently mock password check). The mock password is explicitly mentioned for prototype demonstration.
 * 
 * @mock-data-context
 * Purpose: N/A (This component handles actual login attempts. The mock aspect resides in the AppContext's `login` function using a hardcoded password for the prototype).
 * Behavior: N/A
 * Activation: N/A
 */
import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { APP_TITLE } from '../constants';
import { AppLogoIcon } from './icons/IconComponents';

/**
 * @component LoginView
 * @description Renders the login form for the application. It allows users to enter their password and submit it for authentication via the `AppContext`. Displays loading states during the login process.
 * @returns {JSX.Element} The JSX for the login view.
 * @usage
 * ```jsx
 * // Typically used in App.tsx or a similar top-level component:
 * // import LoginView from './components/LoginView';
 * // import { useAppContext } from './contexts/AppContext';
 * 
 * // const { isAuthenticated } = useAppContext();
 * // if (!isAuthenticated) {
 * //   return <LoginView />;
 * // }
 * ```
 */
const LoginView: React.FC = () => {
  const { login, isContextLoading } = useAppContext();
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
        // AppContext's login function or toastr handles empty password feedback.
        return;
    }
    setIsLoading(true);
    await login(password);
    setIsLoading(false);
    // App.tsx handles conditional rendering based on isAuthenticated, so no explicit redirect here.
  };

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
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 sr-only"
            >
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
              disabled={isLoading || isContextLoading || !password.trim()}
            >
              {isLoading || isContextLoading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>
         <p id="password-hint" className="mt-6 text-center text-xs text-slate-400">
            (Prototype: Use password "password123")
        </p>
      </div>
       <footer className="absolute bottom-4 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} {APP_TITLE} Prototype
      </footer>
    </div>
  );
};

export default LoginView;

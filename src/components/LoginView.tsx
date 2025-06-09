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
    <div className="fixed inset-0 bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 flex flex-col items-center justify-center p-4 z-[100]" role="main">
      <div className="bg-white/95 backdrop-blur-sm p-10 md:p-12 rounded-3xl shadow-2xl shadow-slate-900/10 w-full max-w-lg border border-slate-200/50">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6">
            <AppLogoIcon className="h-12 w-12 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">{APP_TITLE}</h1>
          <p className="text-slate-600 mt-2 text-center">Welcome back! Please sign in to continue managing your Q&A database.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8" aria-labelledby="login-heading">
          <h2 id="login-heading" className="sr-only">Login Form</h2>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700"
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
              className="appearance-none block w-full px-4 py-4 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-slate-900 transition-colors hover:border-slate-300"
              placeholder="Enter your password"
              disabled={isLoading || isContextLoading}
              aria-describedby="password-hint"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-3 py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 transition-all duration-200 transform hover:-translate-y-0.5 shadow-emerald-500/25 disabled:transform-none"
              disabled={isLoading || isContextLoading || !password.trim()}
            >
              {isLoading || isContextLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>
         
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p id="password-hint" className="text-center text-sm text-slate-500 bg-slate-50 px-4 py-3 rounded-lg">
            <span className="font-medium">Prototype Demo:</span> Use password <code className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-mono">"password123"</code>
          </p>
        </div>
      </div>
      
      <footer className="absolute bottom-6 text-sm text-slate-500/80 backdrop-blur-sm bg-white/30 px-4 py-2 rounded-full">
        &copy; {new Date().getFullYear()} {APP_TITLE} - Professional Q&A Management
      </footer>
    </div>
  );
};

export default LoginView;

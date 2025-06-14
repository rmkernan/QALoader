/**
 * @file src/components/PasswordResetView.tsx
 * @description Password reset form component with two-step flow: request reset email and complete reset with token
 * @created June 13, 2025. 12:03 p.m. Eastern Time
 * @updated June 13, 2025. 6:58 p.m. Eastern Time - Fixed unused parameter in toast.custom callback
 * 
 * @architectural-context
 * Layer: UI Component (Form/Authentication)
 * Dependencies: React hooks, AppContext, api service, react-hot-toast, URL params
 * Pattern: Two-step password reset flow with validation and loading states
 * 
 * @workflow-context
 * User Journey: Forgot password → Enter email → Receive reset token → Enter new password → Login
 * Sequence Position: Alternative auth flow from LoginView, returns to login after success
 * Inputs: Email address for reset request, token and new password for completion
 * Outputs: Reset email sent confirmation, password updated confirmation, navigation to login
 * 
 * @authentication-context
 * Auth Requirements: Public component - no authentication required (password reset flow)
 * Security: Validates email format, enforces password requirements, uses secure tokens
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { requestPasswordReset, completePasswordReset, verifyResetToken } from '../services/api';

/**
 * @interface PasswordResetViewProps
 * @description Props for PasswordResetView component
 */
interface PasswordResetViewProps {
  onBackToLogin: () => void;
  resetToken?: string; // Optional token for direct reset completion
}

/**
 * @component PasswordResetView
 * @description Two-step password reset form with email request and token completion flows
 * @param {PasswordResetViewProps} props - Component props
 * @returns {JSX.Element} Password reset form component
 * @example
 * <PasswordResetView onBackToLogin={() => setShowLogin(true)} />
 */
export const PasswordResetView: React.FC<PasswordResetViewProps> = ({ 
  onBackToLogin, 
  resetToken: propToken 
}) => {
  const [token, setToken] = useState<string | null>(propToken || null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [resetStep, setResetStep] = useState<'request' | 'complete'>('request');
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /**
   * @function validateEmail
   * @description Validates email address format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * @function validatePassword
   * @description Validates password strength requirements
   * @param {string} password - Password to validate
   * @returns {string} Error message if invalid, empty string if valid
   */
  const validatePassword = (password: string): string => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  /**
   * @function handleRequestReset
   * @description Handles password reset request form submission
   * @param {React.FormEvent} event - Form submission event
   */
  const handleRequestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Reset errors
    setEmailError('');
    
    // Validate email
    if (!email) {
      setEmailError('Email address is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      await requestPasswordReset(email);
      
      toast.success('If the email address exists in our system, a password reset link has been sent.');
      
      // For demo purposes, show instructions
      toast.custom(() => (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <h4 className="font-medium text-blue-900 mb-2">Demo Mode Instructions</h4>
          <p className="text-sm text-blue-700">
            Check the browser console for the reset token, then use the "Test Reset" button below.
          </p>
        </div>
      ), { duration: 8000 });
      
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function handleCompleteReset
   * @description Handles password reset completion with token
   * @param {React.FormEvent} event - Form submission event
   */
  const handleCompleteReset = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Reset errors
    setPasswordError('');
    
    // Validate passwords
    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }
    
    try {
      setIsLoading(true);
      await completePasswordReset(token, newPassword);
      
      toast.success('Password has been updated successfully! Please log in with your new password.');
      
      // Return to login after brief delay
      setTimeout(() => {
        onBackToLogin();
      }, 1500);
      
    } catch (error) {
      console.error('Password reset completion error:', error);
      toast.error('Failed to update password. Please check your reset token and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function handleTestReset
   * @description Demo function to test reset flow with hardcoded token
   */
  const handleTestReset = () => {
    const testToken = 'a'.repeat(64); // Valid length token for demo
    setToken(testToken);
    setResetStep('complete');
  };

  // Effect to verify token when component loads with token parameter
  useEffect(() => {
    if (token) {
      setResetStep('complete');
      
      const verifyToken = async () => {
        try {
          setIsLoading(true);
          await verifyResetToken(token);
          setIsTokenValid(true);
        } catch (error) {
          console.error('Token verification error:', error);
          setIsTokenValid(false);
          toast.error('Invalid or expired reset token');
        } finally {
          setIsLoading(false);
        }
      };
      
      verifyToken();
    }
  }, [token]);

  // Render token invalid state
  if (resetStep === 'complete' && isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Token</h2>
            <p className="text-gray-600 mb-6">
              The password reset token is invalid or has expired. Please request a new password reset.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {resetStep === 'request' ? 'Reset Password' : 'Set New Password'}
          </h2>
          <p className="text-gray-600 mt-2">
            {resetStep === 'request' 
              ? 'Enter your email address to receive a password reset link'
              : 'Enter your new password to complete the reset process'
            }
          </p>
        </div>

        {resetStep === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="admin@qaloader.com"
                disabled={isLoading}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>

            {/* Demo helper button */}
            <button
              type="button"
              onClick={handleTestReset}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              🧪 Test Reset (Demo Mode)
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCompleteReset} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
                disabled={isLoading || isTokenValid === null}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
                disabled={isLoading || isTokenValid === null}
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isTokenValid !== true}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
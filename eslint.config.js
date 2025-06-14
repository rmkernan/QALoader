/**
 * @file eslint.config.js
 * @description ESLint configuration for Q&A Loader project with TypeScript, React JSX, and browser globals support
 * @created June 13, 2025. 6:58 p.m. Eastern Time
 * @updated June 13, 2025. 6:58 p.m. Eastern Time - Added browser/DOM globals to fix false positive linting errors
 * 
 * @architectural-context
 * Layer: Build Configuration
 * Dependencies: @eslint/js, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, globals
 * Pattern: Flat config format with TypeScript integration
 * 
 * @workflow-context
 * User Journey: Development Quality Assurance
 * Sequence Position: Pre-commit and development-time linting
 * Inputs: TypeScript/TSX source files in src directory
 * Outputs: Linting violations and code quality feedback
 */

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // General rules
      'no-console': 'off', // Allow console for debugging
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
];
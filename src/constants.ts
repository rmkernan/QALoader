/**
 * @file constants.ts
 * @description Defines application-wide constants such as navigation items, API model names, local storage keys, initial topic lists, and UI settings.
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:22 PM ET - Applied comprehensive documentation standards.
 * @updated June 16, 2025. 1:42 p.m. Eastern Time - Updated navigation labels to Question Loader and Question Manager for consistency
 * @updated June 19, 2025. 12:03 PM Eastern Time - Added standard backend question types to align with validation service
 * @updated June 19, 2025. 12:11 PM Eastern Time - Removed unused GEMINI_MODEL_TEXT constant
 * 
 * @architectural-context
 * Layer: Configuration
 * Dependencies: ./types (View) (for NAV_ITEMS).
 * Pattern: Centralized constant definitions.
 * 
 * @workflow-context N/A (Provides static data used across various workflows).
 * 
 * @authentication-context Contains MOCK_PASSWORD and SESSION_TOKEN_KEY used in prototype authentication.
 * 
 * @mock-data-context MOCK_PASSWORD and INITIAL_TOPICS serve as mock/default values.
 */
import { View } from './types';

export const APP_TITLE = "Q&A Loader";
export const LOCAL_STORAGE_KEY = 'qnaLoaderData';

export const INITIAL_TOPICS: string[] = [
  "Discounted Cash Flow (DCF)",
  "Accounting",
  "Valuation",
  "Enterprise Value / Equity Value",
  "Mergers & Acquisitions (M&A)",
  "Leveraged Buyouts (LBOs)",
  "Financial Statement Analysis"
];

export const DIFFICULTIES: string[] = ["Basic", "Advanced", "Expert", "Unknown"];
export const QUESTION_TYPES: string[] = ["Definition", "Problem", "GenConcept", "Calculation", "Analysis", "Question"];


export const NAV_ITEMS = [
  { id: View.DASHBOARD, label: "Dashboard", icon: 'M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.707V18a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 01-1 1H3a1 1 0 01-1-1V10.707a1 1 0 01.293-.707l7-7z' },
  { id: View.LOADER, label: "Question Loader", icon: 'M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z' },
  { id: View.CURATION, label: "Question Manager", icon: 'M10 3.75a2 2 0 100 4 2 2 0 000-4zM4.167 6.375a.625.625 0 01.625-.625h10.416a.625.625 0 010 1.25H4.792a.625.625 0 01-.625-.625zM4.167 11.375a.625.625 0 01.625-.625h10.416a.625.625 0 010 1.25H4.792a.625.625 0 01-.625-.625zM10 13.75a2 2 0 100 4 2 2 0 000-4z' },
];

export const SESSION_TOKEN_KEY = 'qnaLoaderSessionToken';
export const MOCK_PASSWORD = 'password123'; // For prototype only
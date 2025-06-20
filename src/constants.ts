/**
 * @file constants.ts
 * @description Defines application-wide constants such as navigation items, API model names, local storage keys, initial topic lists, and UI settings.
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:22 PM ET - Applied comprehensive documentation standards.
 * @updated June 16, 2025. 1:42 p.m. Eastern Time - Updated navigation labels to Question Loader and Question Manager for consistency
 * @updated June 19, 2025. 12:03 PM Eastern Time - Added standard backend question types to align with validation service
 * @updated June 19, 2025. 12:11 PM Eastern Time - Removed unused GEMINI_MODEL_TEXT constant
 * @updated June 19, 2025. 6:04 PM Eastern Time - Removed simple login option, consolidated to backend authentication only
@updated June 19, 2025. 6:01 PM Eastern Time - Added duplicate management navigation item for PostgreSQL pg_trgm integration
 * @updated June 20, 2025. 10:58 AM Eastern Time - Added staging review navigation item for Phase 3 staging workflow
 * 
 * @architectural-context
 * Layer: Configuration
 * Dependencies: ./types (View) (for NAV_ITEMS).
 * Pattern: Centralized constant definitions.
 * 
 * @workflow-context N/A (Provides static data used across various workflows).
 * 
 * @authentication-context Contains SESSION_TOKEN_KEY used in JWT authentication.
 * 
 * @mock-data-context INITIAL_TOPICS serve as default values.
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
  { id: View.DUPLICATES, label: "Duplicate Scanner", icon: 'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75' },
  { id: View.STAGING, label: "Staging Review", icon: 'M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75' },
];

export const SESSION_TOKEN_KEY = 'qnaLoaderSessionToken';
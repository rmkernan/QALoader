/**
 * @file services/geminiService.ts
 * @description Provides functions to interact with the Google Gemini API, specifically for parsing Markdown content into structured Q&A data.
 * @created 2025.06.08 9:00 PM ET
 * @updated 2025.06.09 1:22 PM ET - Applied comprehensive documentation standards.
 * 
 * @architectural-context
 * Layer: Service / API Client
 * Dependencies: @google/genai, ../types (ParsedQuestionFromAI), ../constants (GEMINI_MODEL_TEXT).
 * Pattern: API wrapper for external AI service. Handles API key management (from process.env.API_KEY).
 * 
 * @workflow-context  
 * User Journey: Content Loading (Dry Run Analysis).
 * Sequence Position: Called by AppContext (and indirectly by LoaderView) during the file analysis step.
 * Inputs: Markdown content string, topic name.
 * Outputs: Promise resolving to an array of ParsedQuestionFromAI objects, or throws an error.
 * 
 * @authentication-context Relies on process.env.API_KEY for Gemini API authentication. No application-level auth context directly.
 * @mock-data-context N/A (Directly interacts with external API; no internal mock data for this service).
 */
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ParsedQuestionFromAI } from '../types';
import { GEMINI_MODEL_TEXT } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. Gemini API calls will fail.");
  // alert("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  // Depending on the app's requirements, you might throw an error or disable features.
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Fallback to prevent crash if key is missing

/**
 * @function parseMarkdownToQA
 * @description Parses Markdown content using the Gemini API to extract structured Q&A pairs. Constructs a prompt instructing the model to return a JSON array of questions, answers, subtopics, difficulties, and types. Handles potential errors from the API call and JSON parsing.
 * @param {string} markdownContent - The raw Markdown string to be parsed.
 * @param {string} topicName - The main topic name, used to contextualize the parsing for the AI.
 * @returns {Promise<ParsedQuestionFromAI[]>} - A promise that resolves to an array of parsed question objects.
 * @throws {Error} - Throws an error if the API key is not configured, if the API call fails, or if the response cannot be parsed into the expected JSON format.
 * @example
 * ```typescript
 * // const markdown = "# Topic: DCF\n## Subtopic: WACC\n### Basic - Problem\nQ: What is WACC?\nA: Weighted Average Cost of Capital.";
 * // const topic = "DCF";
 * // parseMarkdownToQA(markdown, topic)
 * //   .then(questions => console.log(questions))
 * //   .catch(error => console.error(error));
 * ```
 */
export const parseMarkdownToQA = async (markdownContent: string, topicName: string): Promise<ParsedQuestionFromAI[]> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured.");
  }
  
  const prompt = `
    You are an expert Q&A extraction system.
    Parse the following Markdown content, which contains questions and answers related to the financial topic: "${topicName}".
    Extract the following information for each question:
    - subtopic: The specific sub-category within the main topic. Infer from headings or content if possible. If a question doesn't seem to fit a subtopic, use "General".
    - difficulty: (e.g., "Basic", "Advanced", "Expert"). Infer from the question's complexity. Default to "Unknown" if not clear.
    - type: (e.g., "Problem", "GenConcept", "Definition", "Theory", "Case Study"). Infer from the question's nature. Default to "Unknown" if not clear.
    - question: The question text.
    - answer: The answer text. Ensure the full answer is captured.

    Format the output as a JSON array of objects. Each object should represent a single Q&A pair and have the keys "subtopic", "difficulty", "type", "question", and "answer".

    Example for a question:
    {
      "subtopic": "Terminal Value Calculation",
      "difficulty": "Advanced",
      "type": "Problem",
      "question": "What are the two main methods to calculate Terminal Value in a DCF?",
      "answer": "The two main methods are the Gordon Growth Model (Perpetuity Growth Method) and the Exit Multiple Method."
    }

    Markdown Content:
    ---
    ${markdownContent}
    ---

    Return ONLY the JSON array. Do not include any other text, explanations, or markdown formatting around the JSON.
    The response must be a valid JSON array.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature for more deterministic parsing
      },
    });

    let jsonStr = response.text?.trim() || '';
    
    // Remove markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData)) {
        // Basic validation of array items structure
        return parsedData.filter(item => 
          item && 
          typeof item.question === 'string' && 
          typeof item.answer === 'string'
          // Add more checks if needed, e.g. for subtopic, difficulty, type
        ) as ParsedQuestionFromAI[];
      } else {
        console.error("Gemini response is not a JSON array:", parsedData);
        throw new Error("Parsed data from AI is not in the expected array format.");
      }
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", e);
      console.error("Raw Gemini response text:", response.text);
      throw new Error(`Failed to parse AI response as JSON. Raw response: ${response.text?.substring(0,500) || 'undefined'}...`);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

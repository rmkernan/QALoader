/**
 * @file components/LoaderView.tsx
 * @description Defines the Loader view, enabling users to upload Markdown files, perform a dry run analysis using Gemini, and load Q&A content.
 * @created June 9, 2025. 1:02 p.m. Eastern Time
 * @updated June 9, 2025. 1:02 p.m. Eastern Time - Applied LLM-focused documentation standards.
 * 
 * @architectural-context
 * Layer: UI Component (Application View/Page)
 * Dependencies: AppContext (for topics, file upload logic, adding questions), Gemini Service (via AppContext for dry run).
 * Pattern: Multi-step guided workflow, file input handling (drag & drop), API interaction (dry run with Gemini, main load via AppContext to simulated backend).
 * 
 * @workflow-context  
 * User Journey: Ingesting new Q&A content from Markdown files.
 * Sequence Position: Dedicated application section for data loading.
 * Inputs: User-selected topic (existing or new), uploaded Markdown file, user interactions with "Analyze" and "Load" buttons.
 * Outputs: Displays validation reports, parsed data previews; interacts with AppContext to invoke `uploadMarkdownFile` (for analysis/backend upload) and `addQuestions` (for loading parsed data).
 * 
 * @authentication-context N/A (View is auth-gated by App.tsx)
 * @mock-data-context "Dry run" uses Gemini API (if key configured). "Load to Database" uses AppContext, simulating backend interaction.
 */
import React, { useState, ChangeEvent, useEffect, useRef, DragEvent } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ParsedQuestionFromAI, ValidationReport } from '../types';
import toast from 'react-hot-toast';
import { UploadIcon } from './icons/IconComponents'; // Changed from CloudUploadIcon

/**
 * @component LoaderView
 * @description Manages the UI and workflow for uploading Markdown files, analyzing them via a dry run (Gemini API), and loading the parsed Q&A pairs into the application.
 * @returns {JSX.Element}
 */
const LoaderView: React.FC = () => {
  const { topics: contextTopics, uploadMarkdownFile, addQuestions } = useAppContext();
  
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [isNewTopic, setIsNewTopic] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoadingToDB, setIsLoadingToDB] = useState<boolean>(false);
  
  const [parsedData, setParsedData] = useState<ParsedQuestionFromAI[] | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [topicForConfirmation, setTopicForConfirmation] = useState<string>('');
  const [confirmationInput, setConfirmationInput] = useState<string>('');

  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contextTopics.length > 0 && !selectedTopic) {
        setSelectedTopic(contextTopics[0]);
    }
  }, [contextTopics, selectedTopic]);

  const processSelectedFile = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type === 'text/markdown' || selectedFile.name.endsWith('.md') || selectedFile.name.endsWith('.markdown')) {
        setFile(selectedFile);
        setParsedData(null); 
        setValidationReport(null);
        setIsConfirmationModalOpen(false);
        setConfirmationInput('');
      } else {
        toast.error("Invalid file type. Please upload a Markdown file (.md, .markdown).");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      }
    } else {
      setFile(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    processSelectedFile(event.target.files?.[0] || null);
  };
  
  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); // Necessary to allow drop
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processSelectedFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };

  const handleTopicChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "_new_topic_") {
        setIsNewTopic(true);
        setSelectedTopic(""); 
        setNewTopicName("");
    } else {
        setIsNewTopic(false);
        setSelectedTopic(value);
    }
    setParsedData(null);
    setValidationReport(null);
  };

  const handleAnalyzeFile = async () => {
    const currentTopic = isNewTopic ? newTopicName.trim() : selectedTopic;
    if (!currentTopic) {
        toast.error("Please select or enter a topic name.");
        setValidationReport({ success: false, message: "Please select or enter a topic name." });
        return;
    }
    if (!file) { 
        toast.error("Please select a Markdown file.");
        setValidationReport({ success: false, message: "Please select a Markdown file." });
        return;
    }

    setIsAnalyzing(true);
    setValidationReport(null);
    setParsedData(null);

    try {
      // Request dry run analysis from AppContext
      const result = await uploadMarkdownFile(currentTopic, file, true);
      if (result && 'parsedQuestions' in result && 'report' in result) {
        setParsedData(result.parsedQuestions);
        setValidationReport(result.report);
      } else {
        // This case should ideally not happen if uploadMarkdownFile is typed correctly for dryRun=true
        throw new Error("Dry run analysis did not return expected data structure.");
      }
    } catch (error) {
      console.error("Error analyzing file (dry run):", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
      setValidationReport({ 
        success: false, 
        message: errorMessage,
        errors: error instanceof Error ? [error.message] : undefined,
        topic: currentTopic
      });
      toast.error(`Analysis Error: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openConfirmationModal = () => {
    if (!validationReport?.topic) {
      toast.error("Cannot open confirmation: Topic from validation report is missing.");
      return;
    }
    setTopicForConfirmation(validationReport.topic);
    setIsConfirmationModalOpen(true);
    setConfirmationInput(''); 
  };

  const handleConfirmLoad = async () => {
    if (!parsedData || !topicForConfirmation) {
      toast.error("Parsed data or topic for confirmation is missing. Cannot proceed with load.");
      setIsConfirmationModalOpen(false);
      return;
    }

    setIsLoadingToDB(true);
    setIsConfirmationModalOpen(false); 

    try {
      // Load parsed data to the main store via AppContext
      await addQuestions(topicForConfirmation, parsedData);
      // Reset state after successful load
      setParsedData(null);
      setValidationReport(null);
      setFile(null); 
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
      setTopicForConfirmation('');
      setConfirmationInput('');
      // If a new topic was created and loaded, make it the selected topic
      if (isNewTopic && newTopicName.trim() === topicForConfirmation) {
          setSelectedTopic(topicForConfirmation);
          setIsNewTopic(false);
          setNewTopicName("");
      }
    } catch (error) {
        // Error handling is typically done within addQuestions and shown via toast
        console.error("Error loading to DB (via addQuestions):", error);
    } finally {
      setIsLoadingToDB(false);
    }
  };

  const currentActiveTopic = isNewTopic ? newTopicName.trim() : selectedTopic;
  const canAnalyze = !!file && !!currentActiveTopic && !isAnalyzing && !isLoadingToDB;
  const canLoadToDB = validationReport?.success && parsedData && parsedData.length > 0 && !isLoadingToDB && !isAnalyzing;

  return (
    <div className="view-enter-active p-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Load Questions from Markdown</h2>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        {/* Step 1: Topic and File Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Step 1: Select Topic and File</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="topic-select" className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
              <select 
                id="topic-select" 
                value={isNewTopic ? "_new_topic_" : selectedTopic}
                onChange={handleTopicChange}
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                disabled={isAnalyzing || isLoadingToDB}
              >
                <option value="" disabled={!isNewTopic}>Select a topic</option>
                {contextTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                <option value="_new_topic_">-- Create New Topic --</option>
              </select>
              {isNewTopic && (
                <input 
                    type="text"
                    placeholder="Enter new topic name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="mt-2 w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                    disabled={isAnalyzing || isLoadingToDB}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Markdown File</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button" // For accessibility
                tabIndex={0} // For accessibility
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }} // For accessibility
                aria-label="Upload Markdown file or drag and drop"
                className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer
                  ${isDraggingOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'}
                  transition-colors duration-150 ease-in-out`}
              >
                <div className="space-y-1 text-center">
                  <UploadIcon className={`mx-auto h-12 w-12 ${isDraggingOver ? 'text-indigo-500' : 'text-slate-400'}`} aria-hidden="true" />
                  <div className="flex text-sm text-slate-600">
                    <p className="relative">
                      {file ? (
                        <span className="font-medium text-indigo-600">{file.name}</span>
                      ) : (
                        <>
                          <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload a file</span>
                          <span className="pl-1">or drag and drop</span>
                        </>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">Markdown (.md, .markdown) up to 10MB</p>
                </div>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                id="file-upload-hidden" 
                accept=".md, .markdown"
                onChange={handleFileChange} 
                className="hidden" 
                disabled={isAnalyzing || isLoadingToDB}
                aria-hidden="true" // Hidden, interaction is through the styled div
              />
            </div>
          </div>
          <button 
            onClick={handleAnalyzeFile}
            className="mt-6 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-150 ease-in-out"
            disabled={!canAnalyze}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze File (Dry Run)'}
          </button>
        </div>
        
        {/* Step 2: Preview and Validation (shown after analysis) */}
        {(validationReport || parsedData) && !isAnalyzing && (
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Step 2: Preview & Validate</h3>
            {validationReport && (
              <div className={`border-l-4 p-4 rounded-md mb-4 ${validationReport.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`} role="alert">
                <p className={`font-semibold ${validationReport.success ? 'text-green-800' : 'text-red-800'}`}>
                  Validation Report: {validationReport.success ? 'Success!' : 'Failed!'}
                </p>
                <p className={`${validationReport.success ? 'text-green-700' : 'text-red-700'}`}>{validationReport.message}</p>
                {validationReport.errors && validationReport.errors.length > 0 && (
                    <ul className="list-disc list-inside text-red-600 text-sm mt-2">
                        {validationReport.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                )}
              </div>
            )}

            {parsedData && parsedData.length > 0 && (
              <>
                <h4 className="font-semibold text-slate-800 mb-2">Parsed Data Preview (First 5 questions):</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96">
                  <table className="w-full text-sm text-left">
                    <caption className="sr-only">Preview of first 5 parsed questions</caption>
                    <thead className="bg-slate-50 text-xs text-slate-600 uppercase sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3">Subtopic</th>
                        <th scope="col" className="px-6 py-3">Difficulty</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Question</th>
                        <th scope="col" className="px-6 py-3">Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((item, index) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium text-slate-800">{item.subtopic || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-700">{item.difficulty || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-700">{item.type || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={item.question}>{item.question}</td>
                           <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={item.answer}>{item.answer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 5 && <p className="text-sm text-slate-500 mt-2">Showing 5 of {parsedData.length} questions.</p>}
              </>
            )}
            
            {/* Step 3: Load to Database (shown if analysis successful) */}
            {canLoadToDB && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Step 3: Load to Database</h3>
                <p className="text-sm text-slate-600 mb-4">
                  This will delete all existing questions for the topic '{validationReport?.topic}' and replace them with the {validationReport?.parsedCount} new questions. 
                  This action cannot be undone.
                </p>
                <button 
                  onClick={openConfirmationModal}
                  className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 ease-in-out"
                  disabled={isLoadingToDB} 
                >
                  {`Load ${validationReport?.parsedCount || 0} Questions to Database`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirmation-modal-title">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg modal-content">
            <h2 id="confirmation-modal-title" className="text-xl font-bold text-slate-900 mb-4">Confirm Load Operation</h2>
            <p className="text-slate-700 mb-1">
              You are about to replace all questions for the topic:
            </p>
            <p className="text-red-600 font-semibold text-lg mb-4 break-all">
              "{topicForConfirmation}"
            </p>
            <p className="text-slate-700 mb-2">
              This will replace existing questions with the <strong>{parsedData?.length || 0}</strong> new questions from the uploaded file.
              This action cannot be undone.
            </p>
            <label htmlFor="topic-confirmation-input" className="block text-sm font-medium text-slate-700 mb-1">
              To confirm, please type the topic name ("<span className="font-semibold">{topicForConfirmation}</span>") below:
            </label>
            <input
              id="topic-confirmation-input"
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md shadow-sm mb-6 bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Type topic name here"
              aria-describedby="confirmation-modal-title"
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsConfirmationModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors duration-150 ease-in-out"
                disabled={isLoadingToDB}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLoad}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 transition-colors duration-150 ease-in-out"
                disabled={confirmationInput !== topicForConfirmation || isLoadingToDB}
              >
                {isLoadingToDB ? 'Loading...' : 'Confirm Load'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoaderView;
/**
 * @file components/LoaderView.tsx
 * @description Defines the Loader view, enabling users to upload Markdown files, perform a dry run analysis using Gemini, and load Q&A content.
 * @created June 9, 2025. 1:02 p.m. Eastern Time
 * @updated June 9, 2025. 1:02 p.m. Eastern Time - Applied LLM-focused documentation standards.
 * @updated June 14, 2025. 12:18 p.m. Eastern Time - Enhanced for Phase 3 UI integration with validation-first workflow and file upload status indicators
 * @updated June 14, 2025. 12:30 p.m. Eastern Time - Added Clear File button for resetting validation process when errors occur
 * @updated June 14, 2025. 1:12 p.m. Eastern Time - Fixed Step 2 empty content issue by adding user guidance instructions and progress indicators
 * @updated June 14, 2025. 2:00 p.m. Eastern Time - Fixed backend/frontend field name mismatch for validation workflow (is_valid vs isValid), complete Phase 3 implementation tested and verified
 * @updated June 14, 2025. 2:18 p.m. Eastern Time - Added upload metadata fields (uploaded_on, uploaded_by, upload_notes) with American timestamp generation and character validation
 * @updated June 16, 2025. 1:42 p.m. Eastern Time - Changed page title from "Load Questions from Markdown" to "Question Loader" for consistency with navigation
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

 */
import React, { useState, ChangeEvent, useEffect, useRef, DragEvent } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ParsedQuestionFromAI, ValidationReport, ValidationResult, BatchUploadResult } from '../types';
import { validateMarkdownFormat, getValidationSummary } from '../services/validation';
import { validateMarkdownFile as validateMarkdownFileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { UploadIcon } from './icons/IconComponents'; // Changed from CloudUploadIcon

/**
 * @component LoaderView
 * @description Manages the UI and workflow for uploading Markdown files, analyzing them via a dry run (Gemini API), and loading the parsed Q&A pairs into the application.
 * @returns {JSX.Element}
 */
const LoaderView: React.FC = () => {
  const { topics: contextTopics, uploadMarkdownFile } = useAppContext();
  
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [isNewTopic, setIsNewTopic] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Enhanced validation state management
  const [validationStatus, setValidationStatus] = useState<'pending' | 'validating' | 'valid' | 'invalid'>('pending');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [_uploadResult, setUploadResult] = useState<BatchUploadResult | null>(null);
  const [_showErrorDetails, setShowErrorDetails] = useState<boolean>(false);
  
  // Legacy state for backward compatibility
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoadingToDB, setIsLoadingToDB] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ParsedQuestionFromAI[] | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [topicForConfirmation, setTopicForConfirmation] = useState<string>('');
  const [confirmationInput, setConfirmationInput] = useState<string>('');
  
  // Upload metadata fields
  const [uploadedOn, setUploadedOn] = useState<string>('');
  const [uploadedBy, setUploadedBy] = useState<string>('');
  const [uploadNotes, setUploadNotes] = useState<string>('');

  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * @function generateShortTimestamp
   * @description Generates current timestamp in short format (Eastern Time)
   * @returns {string} Formatted timestamp like "06/14/25 3:25PM ET"
   */
  const generateShortTimestamp = (): string => {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    const month = String(easternTime.getMonth() + 1).padStart(2, '0');
    const day = String(easternTime.getDate()).padStart(2, '0');
    const year = String(easternTime.getFullYear()).slice(-2);
    
    let hours = easternTime.getHours();
    const minutes = String(easternTime.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    return `${month}/${day}/${year} ${hours}:${minutes}${ampm} ET`;
  };

  // Initialize uploaded_on timestamp when component mounts
  useEffect(() => {
    if (!uploadedOn) {
      setUploadedOn(generateShortTimestamp());
    }
  }, [uploadedOn]);

  useEffect(() => {
    if (contextTopics.length > 0 && !selectedTopic) {
        setSelectedTopic(contextTopics[0]);
    }
  }, [contextTopics, selectedTopic]);

  const processSelectedFile = async (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type === 'text/markdown' || selectedFile.name.endsWith('.md') || selectedFile.name.endsWith('.markdown') || selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
        
        // Reset all validation and upload state
        setParsedData(null); 
        setValidationReport(null);
        setValidationResult(null);
        setUploadResult(null);
        setShowErrorDetails(false);
        setIsConfirmationModalOpen(false);
        setConfirmationInput('');
        
        // Trigger immediate client-side validation
        setValidationStatus('validating');
        setUploadStatus('idle');
        
        try {
          const clientValidation = await validateMarkdownFormat(selectedFile);
          setValidationResult(clientValidation);
          
          if (clientValidation.isValid) {
            setValidationStatus('valid');
            toast.success(getValidationSummary(clientValidation));
          } else {
            setValidationStatus('invalid');
            toast.error(getValidationSummary(clientValidation));
          }
        } catch (error) {
          setValidationStatus('invalid');
          toast.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        toast.error("Invalid file type. Please upload a Markdown file (.md, .txt, .markdown).");
        setFile(null);
        setValidationStatus('pending');
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      }
    } else {
      setFile(null);
      setValidationStatus('pending');
      setUploadStatus('idle');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    processSelectedFile(event.target.files?.[0] || null);
  };

  const clearFile = () => {
    setFile(null);
    setValidationStatus('pending');
    setValidationResult(null);
    setUploadStatus('idle');
    setUploadResult(null);
    setShowErrorDetails(false);
    setParsedData(null);
    setValidationReport(null);
    setIsConfirmationModalOpen(false);
    setConfirmationInput('');
    // Reset metadata fields
    setUploadedOn(generateShortTimestamp());
    setUploadedBy('');
    setUploadNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleValidateContent = async () => {
    const currentTopic = isNewTopic ? newTopicName.trim() : selectedTopic;
    if (!currentTopic) {
        toast.error("Please select or enter a topic name.");
        return;
    }
    if (!file) { 
        toast.error("Please select a Markdown file.");
        return;
    }
    if (validationStatus !== 'valid') {
        toast.error("Please fix format errors before validating content.");
        return;
    }

    setIsAnalyzing(true);
    setValidationReport(null);
    setParsedData(null);

    try {
      // Server-side content validation
      const serverValidation = await validateMarkdownFileAPI(currentTopic, file);
      
      // Transform backend response (snake_case) to frontend format (camelCase)
      const transformedValidation = {
        isValid: serverValidation.is_valid,
        errors: serverValidation.errors || [],
        warnings: serverValidation.warnings || [],
        parsedCount: serverValidation.parsed_count || 0
      };
      
      const report: ValidationReport = {
        success: transformedValidation.isValid,
        message: transformedValidation.isValid 
          ? `Successfully validated ${transformedValidation.parsedCount} questions for topic '${currentTopic}'`
          : `Content validation failed: ${transformedValidation.errors.length} error${transformedValidation.errors.length !== 1 ? 's' : ''} found`,
        parsedCount: transformedValidation.parsedCount,
        topic: currentTopic,
        errors: transformedValidation.errors.length > 0 ? transformedValidation.errors : undefined
      };
      
      setValidationReport(report);
      
      if (transformedValidation.isValid) {
        toast.success(`✅ Content validation successful! Found ${transformedValidation.parsedCount} valid questions.`);
        // Set mock parsed data for preview (actual data will come from upload)
        setParsedData([]);
      } else {
        toast.error(`❌ Content validation failed: ${transformedValidation.errors.length} errors found`);
      }
      
    } catch (error) {
      console.error("Server validation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Server validation failed";
      setValidationReport({ 
        success: false, 
        message: errorMessage,
        errors: [errorMessage],
        topic: currentTopic,
        parsedCount: 0
      });
      toast.error(`Content validation error: ${errorMessage}`);
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
    if (!validationReport?.success || !topicForConfirmation) {
      toast.error("Content validation must be successful before upload. Cannot proceed.");
      setIsConfirmationModalOpen(false);
      return;
    }
    if (!file) {
      toast.error("File is missing. Cannot proceed with upload.");
      setIsConfirmationModalOpen(false);
      return;
    }

    setIsLoadingToDB(true);
    setUploadStatus('uploading');
    setIsConfirmationModalOpen(false); 

    try {
      // Use new upload workflow from AppContext with metadata
      await uploadMarkdownFile(
        topicForConfirmation, 
        file, 
        false, 
        uploadedOn.trim() || undefined,
        uploadedBy.trim() || undefined,
        uploadNotes.trim() || undefined
      );
      
      // Reset all state after successful upload
      setUploadStatus('success');
      setParsedData(null);
      setValidationReport(null);
      setValidationResult(null);
      setUploadResult(null);
      setFile(null); 
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
      setTopicForConfirmation('');
      setConfirmationInput('');
      setValidationStatus('pending');
      // Reset metadata fields for next upload
      setUploadedOn(generateShortTimestamp());
      setUploadedBy('');
      setUploadNotes('');
      
      // If a new topic was created and loaded, make it the selected topic
      if (isNewTopic && newTopicName.trim() === topicForConfirmation) {
          setSelectedTopic(topicForConfirmation);
          setIsNewTopic(false);
          setNewTopicName("");
      }
      
    } catch (error) {
        setUploadStatus('error');
        console.error("Error uploading file:", error);
        // Error handling is done within uploadMarkdownFile and shown via toast
    } finally {
      setIsLoadingToDB(false);
    }
  };

  const currentActiveTopic = isNewTopic ? newTopicName.trim() : selectedTopic;
  const canValidateContent = !!file && !!currentActiveTopic && validationStatus === 'valid' && !isAnalyzing && !isLoadingToDB;
  const canLoadToDB = validationReport?.success && !isLoadingToDB && !isAnalyzing && uploadStatus !== 'uploading';
  
  // Note: canAnalyze removed as it's replaced by canValidateContent

  return (
    <div className="view-enter-active p-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Question Loader</h2>
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
          
          {/* File validation status indicator */}
          {file && (
            <div className="mt-4 p-3 rounded-md border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">File Validation Status:</span>
                <div className="flex items-center space-x-2">
                  {validationStatus === 'validating' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      <span className="text-sm text-indigo-600">Validating...</span>
                    </>
                  )}
                  {validationStatus === 'valid' && (
                    <>
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-700">Format Valid ({validationResult?.parsedCount} questions)</span>
                    </>
                  )}
                  {validationStatus === 'invalid' && (
                    <>
                      <div className="h-4 w-4 rounded-full bg-red-500"></div>
                      <span className="text-sm text-red-700">{validationResult?.errors.length} format errors</span>
                    </>
                  )}
                  {validationStatus === 'pending' && (
                    <span className="text-sm text-slate-500">Select a file to validate</span>
                  )}
                </div>
              </div>
              
              {/* Show validation errors - Expanded display */}
              {validationStatus === 'invalid' && validationResult?.errors && (
                <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">Format Errors Found:</h4>
                  <div className="max-h-48 overflow-y-auto">
                    <ul className="text-sm text-red-700 space-y-2">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-3"></span>
                          <span className="flex-1">{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {validationResult.errors.length > 5 && (
                    <p className="text-red-600 font-medium text-xs mt-2">
                      Showing all {validationResult.errors.length} errors - scroll to see more
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={handleValidateContent}
            className="mt-6 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-150 ease-in-out"
            disabled={!canValidateContent}
          >
            {isAnalyzing ? 'Validating Content...' : 'Validate Content (Server Check)'}
          </button>
          
          {/* Clear File Button - Show when validation errors exist */}
          {validationStatus === 'invalid' && (
            <button 
              onClick={clearFile}
              className="mt-3 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 ease-in-out"
              disabled={uploadStatus === 'uploading'}
            >
              ✕ Clear File & Start Over
            </button>
          )}
        </div>
        
        {/* Step 2: Content Validation & Upload (shown after format validation) */}
        {validationStatus === 'valid' && (
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Step 2: Content Validation & Upload</h3>
            
            {/* Initial instructions - shown before content validation */}
            {!validationReport && !isAnalyzing && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-blue-900 font-semibold mb-2">Ready for Content Validation</h4>
                    <p className="text-blue-800 text-sm mb-3">
                      File format validation passed! Now validate the question content with our server to ensure all questions are properly structured and valid.
                    </p>
                    <p className="text-blue-700 text-sm font-medium">
                      👆 Click the <strong>"Validate Content (Server Check)"</strong> button above to continue.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content validation in progress */}
            {isAnalyzing && (
              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  <div>
                    <span className="text-indigo-800 font-medium">Validating content with server...</span>
                    <p className="text-indigo-600 text-sm mt-1">Checking question structure, types, and content quality</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content validation results */}
            {validationReport && (
              <div className={`border-l-4 p-4 rounded-md mb-4 ${validationReport.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`} role="alert">
                <p className={`font-semibold ${validationReport.success ? 'text-green-800' : 'text-red-800'}`}>
                  Content Validation: {validationReport.success ? 'Success!' : 'Failed!'}
                </p>
                <p className={`${validationReport.success ? 'text-green-700' : 'text-red-700'}`}>{validationReport.message}</p>
                {validationReport.errors && validationReport.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-700 font-medium text-sm mb-1">Content Errors:</p>
                      <ul className="list-disc list-inside text-red-600 text-sm">
                          {validationReport.errors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                )}
              </div>
            )}
            
            {/* Upload progress indicator */}
            {uploadStatus === 'uploading' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 font-medium">Uploading questions to database...</span>
                </div>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-1/2 animate-pulse"></div>
                </div>
              </div>
            )}
            
            {/* Upload results */}
            {uploadStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-green-800 font-medium">Upload completed successfully!</span>
                </div>
              </div>
            )}
            
            {uploadStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-800 font-medium">Upload failed - see console for details</span>
                </div>
              </div>
            )}
            
            {/* Ready to upload section */}
            {validationReport?.success && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                <h4 className="font-semibold text-indigo-900 mb-2">Ready to Upload</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-indigo-700 font-medium">Topic:</span>
                    <span className="ml-2 text-indigo-900">{validationReport.topic}</span>
                  </div>
                  <div>
                    <span className="text-indigo-700 font-medium">Questions Found:</span>
                    <span className="ml-2 text-indigo-900">{validationReport.parsedCount}</span>
                  </div>
                </div>
                <p className="text-indigo-700 text-sm mt-2">
                  Content validation passed. Click "Upload to Database" to proceed with the upload.
                </p>
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
            <h2 id="confirmation-modal-title" className="text-xl font-bold text-slate-900 mb-4">Confirm Upload Operation</h2>
            <p className="text-slate-700 mb-1">
              You are about to upload new questions for the topic:
            </p>
            <p className="text-green-600 font-semibold text-lg mb-4 break-all">
              "{topicForConfirmation}"
            </p>
            <p className="text-slate-700 mb-2">
              This will upload <strong>{validationReport?.parsedCount || 0}</strong> new questions to the database.
              Each question will receive a unique ID.
            </p>
            {/* Upload Metadata Fields */}
            <div className="mb-6 space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Upload Metadata (Optional)</h3>
              
              <div>
                <label htmlFor="uploaded-on" className="block text-xs font-medium text-slate-600 mb-1">
                  Uploaded On (Eastern Time):
                </label>
                <input
                  id="uploaded-on"
                  type="text"
                  value={uploadedOn}
                  onChange={(e) => setUploadedOn(e.target.value.slice(0, 20))}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="06/14/25 3:25PM ET"
                  maxLength={20}
                />
                <p className="text-xs text-slate-500 mt-1">{uploadedOn.length}/20 characters</p>
              </div>

              <div>
                <label htmlFor="uploaded-by" className="block text-xs font-medium text-slate-600 mb-1">
                  Uploaded By:
                </label>
                <input
                  id="uploaded-by"
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value.slice(0, 25))}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your name or identifier"
                  maxLength={25}
                />
                <p className="text-xs text-slate-500 mt-1">{uploadedBy.length}/25 characters</p>
              </div>

              <div>
                <label htmlFor="upload-notes" className="block text-xs font-medium text-slate-600 mb-1">
                  Upload Notes:
                </label>
                <textarea
                  id="upload-notes"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value.slice(0, 100))}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Notes about this upload (optional)"
                  rows={2}
                  maxLength={100}
                />
                <p className="text-xs text-slate-500 mt-1">{uploadNotes.length}/100 characters</p>
              </div>
            </div>

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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 transition-colors duration-150 ease-in-out"
                disabled={confirmationInput !== topicForConfirmation || isLoadingToDB || uploadStatus === 'uploading'}
              >
                {isLoadingToDB ? 'Uploading...' : 'Confirm Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoaderView;
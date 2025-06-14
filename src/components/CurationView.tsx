/**
 * @file components/CurationView.tsx
 * @description Provides the primary UI for managing, filtering, and curating Q&A content.
 * @created June 8 2025 ??
 * @updated June 9, 2025. 1:02 p.m. Eastern Time - Applied LLM-focused documentation standards.
 * @updated June 14, 2025. 9:27 a.m. Eastern Time - Fixed selection bug and implemented bulk delete functionality with confirmation modal
 * 
 * @architectural-context
 * Layer: UI Component (Application View/Page)
 * Dependencies: Consumes AppContext (questions, topics, CRUD functions, export, activity logging), uses QuestionModal for add/edit/duplicate, IconComponents for UI.
 * Pattern: Data grid with filtering, modal-based editing, bulk actions.
 * 
 * @workflow-context  
 * User Journey: Content Curation (viewing, searching, filtering, adding, editing, duplicating, deleting questions, exporting).
 * Sequence Position: A main application view accessible from the Sidebar.
 * Inputs: User interactions with filters, table rows, action buttons; data from AppContext; initial filters from AppContext.
 * Outputs: Displays filtered questions, triggers CRUD operations in AppContext, opens QuestionModal, initiates exports.
 * 
 * @authentication-context N/A (View is auth-gated by App.tsx)
 * @mock-data-context Relies on AppContext for data, which handles its own loading/fallback states.
 */
import React, { useState, useMemo, ChangeEvent, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Question, Filters } from '../types';
import { PlusIcon, DownloadIcon, EditIcon, DeleteIcon, DuplicateIcon, ChevronDownIcon } from './icons/IconComponents';
import QuestionModal from './QuestionModal';
import { DIFFICULTIES, QUESTION_TYPES } from '../constants';
import toast from 'react-hot-toast';


/**
 * @component CurationView
 * @description Main view for curating Q&A content, including filtering, display, and CRUD operations via modals.
 * @returns {JSX.Element}
 */
const CurationView: React.FC = () => {
  const { 
    questions, 
    topics: contextTopics, 
    deleteQuestion, 
    bulkDeleteQuestions,
    isContextLoading, 
    exportQuestionsToMarkdown,
    initialCurationFilters,
    clearInitialCurationFilters,
    logActivity // Added for logging bulk actions
  } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDuplicateMode, setIsDuplicateMode] = useState<boolean>(false); 

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [questionToDeleteId, setQuestionToDeleteId] = useState<string | null>(null);
  const [questionToDeleteDisplayInfo, setQuestionToDeleteDisplayInfo] = useState<string>("");

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const bulkActionsRef = useRef<HTMLDivElement>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Bulk delete confirmation modal state
  const [isBulkDeleteConfirmModalOpen, setIsBulkDeleteConfirmModalOpen] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState("");


  const [filters, setFilters] = useState<Filters>({
    topic: "All Topics",
    subtopic: "All Subtopics",
    difficulty: "All Difficulties",
    type: "All Types",
    searchText: "",
  });

  // Effect to apply initial filters passed from other views (e.g., Dashboard)
  useEffect(() => {
    if (initialCurationFilters) {
      setFilters(prevFilters => ({
        ...prevFilters, 
        ...initialCurationFilters 
      }));
      clearInitialCurationFilters(); 
    }
  }, [initialCurationFilters, clearInitialCurationFilters]);

  // Memoized calculation for available subtopics based on the selected topic filter
  const availableSubtopics = useMemo(() => {
    if (filters.topic === "All Topics" || !filters.topic) {
      const allSubs = ["All Subtopics", ...Array.from(new Set(questions.map(q => q.subtopic).filter(Boolean)))];
      return allSubs.sort((a,b) => a === "All Subtopics" ? -1 : b === "All Subtopics" ? 1: a.localeCompare(b));
    }
    const topicSubs = ["All Subtopics", ...Array.from(new Set(questions.filter(q => q.topic === filters.topic).map(q => q.subtopic).filter(Boolean)))];
    return topicSubs.sort((a,b) => a === "All Subtopics" ? -1 : b === "All Subtopics" ? 1: a.localeCompare(b));
  }, [questions, filters.topic]);

  // Memoized list of questions filtered based on current filter state
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const topicMatch = filters.topic === "All Topics" || q.topic === filters.topic;
      const subtopicMatch = filters.subtopic === "All Subtopics" || q.subtopic === filters.subtopic;
      const difficultyMatch = filters.difficulty === "All Difficulties" || q.difficulty === filters.difficulty;
      const typeMatch = filters.type === "All Types" || q.type === filters.type;
      const searchMatch = filters.searchText === "" || 
                          q.questionText.toLowerCase().includes(filters.searchText.toLowerCase()) ||
                          (q.answerText && q.answerText.toLowerCase().includes(filters.searchText.toLowerCase())) ||
                          q.id.toLowerCase().includes(filters.searchText.toLowerCase());
      return topicMatch && subtopicMatch && difficultyMatch && typeMatch && searchMatch;
    });
  }, [questions, filters]);

  // Clear row selections when filters actually change (not just when filtered list rerenders)
  // Fixed bug: Previously cleared on every render due to filteredQuestions reference changing
  useEffect(() => {
    setSelectedQuestionIds(new Set());
    setIsBulkActionsOpen(false); 
  }, [filters.topic, filters.subtopic, filters.difficulty, filters.type, filters.searchText]);


  // Handles clicks outside the bulk actions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bulkActionsRef.current && !bulkActionsRef.current.contains(event.target as Node)) {
        setIsBulkActionsOpen(false);
      }
    };
    if (isBulkActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBulkActionsOpen]);

  // Update header checkbox indeterminate state based on row selections
  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numFiltered = filteredQuestions.length;
      const numSelected = selectedQuestionIds.size;
      if (numFiltered > 0 && numSelected > 0 && numSelected < numFiltered) {
        headerCheckboxRef.current.indeterminate = true;
      } else {
        headerCheckboxRef.current.indeterminate = false;
      }
    }
  }, [selectedQuestionIds, filteredQuestions]);

  // Handler for filter input changes
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      // Reset subtopic if topic changes, as subtopics are dependent on topic
      if (name === "topic" && value !== prev.topic) {
        newFilters.subtopic = "All Subtopics";
      }
      return newFilters;
    });
  };
  
  const handleAddNewQuestion = () => {
    setEditingQuestion(null);
    setIsDuplicateMode(false);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsDuplicateMode(false);
    setIsModalOpen(true);
  };

  const handleDuplicateQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsDuplicateMode(true);   
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDeleteId(question.id);
    const questionText = question.questionText || '';
    setQuestionToDeleteDisplayInfo(`ID: ${question.id}\nQuestion: "${questionText.substring(0,100)}${questionText.length > 100 ? '...' : ''}"`) 
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmActualDelete = () => {
    if (questionToDeleteId) {
      deleteQuestion(questionToDeleteId);
    }
    setIsDeleteConfirmModalOpen(false);
    setQuestionToDeleteId(null);
    setQuestionToDeleteDisplayInfo("");
  };

  // Initiates export of currently filtered questions to Markdown
  const handleExport = () => {
    exportQuestionsToMarkdown(
        filters.topic === "All Topics" ? undefined : filters.topic, 
        filters.subtopic === "All Subtopics" ? undefined : filters.subtopic, 
        filters.difficulty === "All Difficulties" ? undefined : filters.difficulty, 
        filters.type === "All Types" ? undefined : filters.type, 
        filters.searchText || undefined
    );
  };

  // Handles selection of all currently filtered questions
  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = new Set(filteredQuestions.map(q => q.id));
      setSelectedQuestionIds(allFilteredIds);
    } else {
      setSelectedQuestionIds(new Set());
    }
  };

  // Handles selection/deselection of a single row
  const handleSelectRow = (questionId: string) => {
    setSelectedQuestionIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(questionId)) {
        newSelected.delete(questionId);
      } else {
        newSelected.add(questionId);
      }
      return newSelected;
    });
  };

  // Trigger bulk delete confirmation modal
  const handleBulkDeleteSelected = () => {
    setIsBulkActionsOpen(false);
    setIsBulkDeleteConfirmModalOpen(true);
    setBulkDeleteConfirmText(""); // Reset confirmation text
  };

  // Confirm and execute bulk deletion
  const confirmBulkDelete = async () => {
    const selectedIds = Array.from(selectedQuestionIds);
    const numSelected = selectedIds.length;
    
    // For large deletions, require typing "DELETE"
    if (numSelected > 10 && bulkDeleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm bulk deletion");
      return;
    }
    
    setIsBulkDeleteConfirmModalOpen(false);
    setBulkDeleteConfirmText("");
    
    try {
      await bulkDeleteQuestions(selectedIds);
      setSelectedQuestionIds(new Set()); // Clear selections after successful deletion
    } catch (error) {
      console.error("Bulk delete error:", error);
      // Error handling is done in the context function
    }
  };

  // Placeholder for bulk move action
  const handleBulkMoveSelected = () => {
    const numSelected = selectedQuestionIds.size;
    toast.success(`Bulk Move: Triggered for ${numSelected} question(s). (Prototype: No actual move)`);
    logActivity("Bulk move triggered (prototype)", `${numSelected} items`);
    setIsBulkActionsOpen(false);
  };


  if (isContextLoading && questions.length === 0) { 
    return <div className="p-8 text-center text-slate-500">Loading content management...</div>;
  }

  const isAllSelected = filteredQuestions.length > 0 && selectedQuestionIds.size === filteredQuestions.length;


  return (
    <div className="view-enter-active p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Manage Content</h2>
        <button 
          onClick={handleAddNewQuestion}
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon />
          Add New Question
        </button>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <select name="topic" value={filters.topic} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="All Topics">All Topics</option>
            {contextTopics.sort().map(topic => <option key={topic} value={topic}>{topic}</option>)}
          </select>
          <select name="subtopic" value={filters.subtopic} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500">
             {availableSubtopics.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
          <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="All Difficulties">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="All Types">All Types</option>
            {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input 
            type="text" 
            name="searchText"
            placeholder="Search ID, question, answer..." 
            value={filters.searchText}
            onChange={handleFilterChange}
            className="w-full p-2 border border-slate-300 rounded-md text-sm col-span-1 md:col-span-3 lg:col-span-1 bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table Area Header: Summary & Bulk Actions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 flex flex-wrap justify-between items-center border-b border-slate-200 gap-4">
          <p className="text-sm font-medium text-slate-600">
            Showing {filteredQuestions.length} matching question(s).
            {selectedQuestionIds.size > 0 && ` ${selectedQuestionIds.size} selected.`}
          </p>
          <div className="flex items-center gap-3">
            {selectedQuestionIds.size > 0 && (
              <div className="relative" ref={bulkActionsRef}>
                <button
                  onClick={() => setIsBulkActionsOpen(prev => !prev)}
                  className="bg-indigo-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-indigo-700 text-sm flex items-center gap-2 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                  aria-haspopup="true"
                  aria-expanded={isBulkActionsOpen}
                >
                  Bulk Actions ({selectedQuestionIds.size})
                  <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${isBulkActionsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isBulkActionsOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 origin-top-right">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <button
                        onClick={handleBulkDeleteSelected}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 ease-in-out"
                        role="menuitem"
                        disabled={isContextLoading}
                      >
                        Delete Selected
                      </button>
                      <button
                        onClick={handleBulkMoveSelected}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 ease-in-out"
                        role="menuitem"
                        disabled={isContextLoading}
                      >
                        Move Selected to...
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={handleExport}
              className="bg-slate-100 text-slate-700 font-semibold py-1 px-3 rounded-md hover:bg-slate-200 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
              disabled={filteredQuestions.length === 0 || isContextLoading}
            >
              <DownloadIcon />
              Export Results to Markdown
            </button>
          </div>
        </div>
        
        {/* Questions Table */}
        <div className="overflow-x-auto max-h-[calc(100vh-25rem)]"> {/* Adjusted max-height for viewability */}
          {isContextLoading && <div className="p-4 text-center text-slate-500">Updating table...</div>}
          {!isContextLoading && (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-600 uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">
                    <label htmlFor="select-all-checkbox" className="sr-only">Select all questions</label>
                    <input 
                      ref={headerCheckboxRef}
                      type="checkbox"
                      id="select-all-checkbox"
                      className="form-checkbox h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      disabled={filteredQuestions.length === 0}
                    />
                  </th>
                  <th className="px-6 py-3">Question ID</th>
                  <th className="px-6 py-3">Topic</th>
                  <th className="px-6 py-3">Subtopic</th>
                  <th className="px-6 py-3">Difficulty</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Question</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                  <tr key={q.id} className={`border-b hover:bg-slate-50 transition-colors duration-100 ${selectedQuestionIds.has(q.id) ? 'bg-indigo-50' : 'bg-white'}`}>
                    <td className="px-4 py-4 text-center">
                       <label htmlFor={`select-q-${q.id}`} className="sr-only">Select question {q.id}</label>
                      <input 
                        type="checkbox"
                        id={`select-q-${q.id}`}
                        className="form-checkbox h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        checked={selectedQuestionIds.has(q.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(q.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{q.id}</td>
                    <td className="px-6 py-4 text-slate-700">{q.topic}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{q.subtopic}</td>
                    <td className="px-6 py-4 text-slate-700">{q.difficulty}</td>
                    <td className="px-6 py-4 text-slate-700">{q.type}</td>
                    <td 
                      className="px-6 py-4 text-slate-600 max-w-md truncate" 
                      title={q.questionText}
                    >
                      {q.questionText}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button 
                        onClick={() => handleEditQuestion(q)} 
                        className="font-medium text-indigo-600 hover:text-indigo-900 mr-2 inline-flex items-center p-1 hover:bg-indigo-50 rounded transition-colors duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-indigo-300"
                        title="Edit question"
                      >
                        <EditIcon className="h-4 w-4"/> <span className="ml-1 sr-only md:not-sr-only">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDuplicateQuestion(q)} 
                        className="font-medium text-sky-600 hover:text-sky-900 mr-2 inline-flex items-center p-1 hover:bg-sky-50 rounded transition-colors duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-sky-300"
                        title="Duplicate question"
                      >
                        <DuplicateIcon className="h-4 w-4"/> <span className="ml-1 sr-only md:not-sr-only">Duplicate</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(q)} 
                        className="font-medium text-red-600 hover:text-red-900 inline-flex items-center p-1 hover:bg-red-50 rounded transition-colors duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-red-300"
                        title="Delete question"
                      >
                        <DeleteIcon className="h-4 w-4"/> <span className="ml-1 sr-only md:not-sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-500">
                          No questions match the current filters.
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Question Add/Edit/Duplicate Modal */}
      <QuestionModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
          setIsDuplicateMode(false); 
        }}
        questionToEdit={editingQuestion}
        isDuplicateMode={isDuplicateMode} 
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl modal-content">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Confirm Deletion</h2>
            <p className="text-slate-700 mb-2">
              Are you sure you want to delete the following question?
            </p>
            <p 
              className="text-sm bg-slate-100 p-3 rounded-md text-slate-600 mb-4 whitespace-pre-wrap max-h-48 overflow-y-auto"
            > 
              {questionToDeleteDisplayInfo}
            </p>
            <p className="text-red-600 font-medium mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmActualDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl modal-content">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Confirm Bulk Deletion</h2>
            
            {/* Display count and preview of questions to delete */}
            <div className="mb-4">
              <p className="text-slate-700 mb-2">
                You are about to delete <span className="font-bold text-red-600">{selectedQuestionIds.size}</span> question(s).
              </p>
              
              {/* Show preview of first 5 questions */}
              <div className="bg-slate-100 p-3 rounded-md max-h-48 overflow-y-auto mb-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Questions to be deleted:</p>
                {Array.from(selectedQuestionIds).slice(0, 5).map(id => {
                  const question = questions.find(q => q.id === id);
                  return question ? (
                    <div key={id} className="text-sm text-slate-600 mb-1">
                      <span className="font-mono">{id}:</span> {question.questionText?.substring(0, 60) || 'No text'}
                      {question.questionText && question.questionText.length > 60 ? '...' : ''}
                    </div>
                  ) : (
                    <div key={id} className="text-sm text-slate-600 mb-1">
                      <span className="font-mono">{id}:</span> <span className="italic">Question not found</span>
                    </div>
                  );
                })}
                {selectedQuestionIds.size > 5 && (
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    ... and {selectedQuestionIds.size - 5} more question(s)
                  </p>
                )}
              </div>
              
              {/* Require typing DELETE for large deletions */}
              {selectedQuestionIds.size > 10 && (
                <div className="mb-4">
                  <p className="text-sm text-red-600 font-medium mb-2">
                    ⚠️ You are deleting more than 10 questions. Type "DELETE" to confirm:
                  </p>
                  <input
                    type="text"
                    value={bulkDeleteConfirmText}
                    onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full p-2 border border-red-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                    autoFocus
                  />
                </div>
              )}
              
              <p className="text-red-600 font-medium">
                ⚠️ This action cannot be undone. All selected questions will be permanently deleted.
              </p>
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsBulkDeleteConfirmModalOpen(false);
                  setBulkDeleteConfirmText("");
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDelete}
                disabled={selectedQuestionIds.size > 10 && bulkDeleteConfirmText !== "DELETE"}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete {selectedQuestionIds.size} Question{selectedQuestionIds.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurationView;
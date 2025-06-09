/**
 * @file components/CurationView.tsx
 * @description Provides the primary UI for managing, filtering, and curating Q&A content.
 * @created June 8 2025 ??
 * @updated June 9, 2025. 1:02 p.m. Eastern Time - Applied LLM-focused documentation standards.
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

  // Clear row selections when filters or the underlying filtered question list changes
  useEffect(() => {
    setSelectedQuestionIds(new Set());
    setIsBulkActionsOpen(false); 
  }, [filteredQuestions]);


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
    setQuestionToDeleteDisplayInfo(`ID: ${question.id}\nQuestion: "${question.questionText.substring(0,100)}${question.questionText.length > 100 ? '...' : ''}"`) 
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

  // Placeholder for bulk delete action
  const handleBulkDeleteSelected = () => {
    const numSelected = selectedQuestionIds.size;
    toast.success(`Bulk Delete: Triggered for ${numSelected} question(s). (Prototype: No actual deletion)`);
    logActivity("Bulk delete triggered (prototype)", `${numSelected} items`);
    setIsBulkActionsOpen(false);
    // setSelectedQuestionIds(new Set()); // Clear selection after action
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
    <div className="view-enter-active p-8 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Manage Content</h2>
            <p className="text-slate-600 mt-2">Create, edit, and organize your Q&A database</p>
          </div>
          <button 
            onClick={handleAddNewQuestion}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 flex items-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25"
          >
            <PlusIcon />
            Add New Question
          </button>
        </div>
      
        {/* Advanced Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg shadow-slate-900/5 border-0 p-8 mb-8">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Filter & Search</h3>
            <p className="text-sm text-slate-600 mt-1">Narrow down questions by topic, difficulty, and content</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Topic</label>
              <select 
                name="topic" 
                value={filters.topic} 
                onChange={handleFilterChange} 
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm hover:border-slate-300"
              >
                <option value="All Topics">All Topics</option>
                {contextTopics.sort().map(topic => <option key={topic} value={topic}>{topic}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Subtopic</label>
              <select 
                name="subtopic" 
                value={filters.subtopic} 
                onChange={handleFilterChange} 
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm hover:border-slate-300"
              >
                {availableSubtopics.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Difficulty</label>
              <select 
                name="difficulty" 
                value={filters.difficulty} 
                onChange={handleFilterChange} 
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm hover:border-slate-300"
              >
                <option value="All Difficulties">All Difficulties</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Type</label>
              <select 
                name="type" 
                value={filters.type} 
                onChange={handleFilterChange} 
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm hover:border-slate-300"
              >
                <option value="All Types">All Types</option>
                {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="space-y-2 col-span-1 lg:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Search</label>
              <input 
                type="text" 
                name="searchText"
                placeholder="Search questions, answers, IDs..." 
                value={filters.searchText}
                onChange={handleFilterChange}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm hover:border-slate-300 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Table Area: Summary & Bulk Actions */}
        <div className="bg-white rounded-xl shadow-lg shadow-slate-900/5 border-0 overflow-hidden">
          <div className="p-6 flex flex-wrap justify-between items-center border-b border-slate-100 gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-lg font-bold text-slate-800">
                  {filteredQuestions.length} {filteredQuestions.length === 1 ? 'Question' : 'Questions'}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedQuestionIds.size > 0 ? `${selectedQuestionIds.size} selected` : 'Use checkboxes to select items'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedQuestionIds.size > 0 && (
                <div className="relative" ref={bulkActionsRef}>
                  <button
                    onClick={() => setIsBulkActionsOpen(prev => !prev)}
                    className="bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-slate-700 hover:to-slate-800 text-sm flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 shadow-lg shadow-slate-500/25"
                    aria-haspopup="true"
                    aria-expanded={isBulkActionsOpen}
                  >
                    Bulk Actions ({selectedQuestionIds.size})
                    <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${isBulkActionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isBulkActionsOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white ring-1 ring-slate-200 z-20 origin-top-right border-0">
                      <div className="py-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                          onClick={handleBulkDeleteSelected}
                          className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 ease-in-out rounded-lg mx-2"
                          role="menuitem"
                          disabled={isContextLoading}
                        >
                          🗑️ Delete Selected
                        </button>
                        <button
                          onClick={handleBulkMoveSelected}
                          className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-150 ease-in-out rounded-lg mx-2"
                          role="menuitem"
                          disabled={isContextLoading}
                        >
                          📁 Move Selected to...
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={handleExport}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 shadow-lg shadow-amber-500/25"
                disabled={filteredQuestions.length === 0 || isContextLoading}
              >
                <DownloadIcon />
                Export to Markdown
              </button>
            </div>
          </div>
        
          {/* Enhanced Questions Table */}
          <div className="overflow-x-auto"> 
            {isContextLoading && (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-slate-600 font-medium">Updating table...</p>
              </div>
            )}
            {!isContextLoading && (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 w-12 text-center">
                      <label htmlFor="select-all-checkbox" className="sr-only">Select all questions</label>
                      <input 
                        ref={headerCheckboxRef}
                        type="checkbox"
                        id="select-all-checkbox"
                        className="form-checkbox h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        disabled={filteredQuestions.length === 0}
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700 tracking-wide">Question ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700 tracking-wide">Topic</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700 tracking-wide">Subtopic</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700 tracking-wide">Difficulty</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700 tracking-wide">Type</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700 tracking-wide">Question</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-700 tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                    <tr key={q.id} className={`hover:bg-slate-50/50 transition-colors duration-150 ${selectedQuestionIds.has(q.id) ? 'bg-emerald-50/30 border-l-4 border-emerald-400' : 'bg-white'}`}>
                      <td className="px-6 py-5 text-center">
                         <label htmlFor={`select-q-${q.id}`} className="sr-only">Select question {q.id}</label>
                        <input 
                          type="checkbox"
                          id={`select-q-${q.id}`}
                          className="form-checkbox h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                          checked={selectedQuestionIds.has(q.id)}
                          onChange={() => handleSelectRow(q.id)}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <code className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono">{q.id}</code>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {q.topic}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-800">{q.subtopic}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          q.difficulty === 'Basic' ? 'bg-sky-100 text-sky-800' :
                          q.difficulty === 'Advanced' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-700">{q.type}</td>
                      <td className="px-6 py-5 max-w-md">
                        <p className="text-slate-600 truncate" title={q.questionText}>
                          {q.questionText}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleEditQuestion(q)} 
                            className="inline-flex items-center p-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            title="Edit question"
                          >
                            <EditIcon className="h-4 w-4"/>
                          </button>
                          <button 
                            onClick={() => handleDuplicateQuestion(q)} 
                            className="inline-flex items-center p-2 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-300"
                            title="Duplicate question"
                          >
                            <DuplicateIcon className="h-4 w-4"/>
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q)} 
                            className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300"
                            title="Delete question"
                          >
                            <DeleteIcon className="h-4 w-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan={8} className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-slate-500 font-medium">No questions match the current filters</p>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria</p>
                          </div>
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
      </div>
    </div>
  );
};

export default CurationView;
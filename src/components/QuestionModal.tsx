/**
 * @file components/QuestionModal.tsx
 * @description A modal dialog (overlay window that blocks interaction with the page behind it) for creating, editing, and duplicating Q&A items. It manages form state, including dynamic topic creation, and interacts with `AppContext` to persist changes.
 * @created June 9, 2025 at unknown time
 * @updated June 9, 2025 at unknown time - Applied comprehensive documentation standards, corrected date formats, completed component JSDoc, and fleshed out implementation.
 * @updated June 13, 2025. 6:34 p.m. Eastern Time - Fixed modal positioning using React Portal to prevent parent container constraints and ensure proper full-screen overlay behavior.
 * @updated June 14, 2025. 10:52 a.m. Eastern Time - Added change detection to prevent saving when no modifications are made in edit/duplicate modes
 * @updated June 16, 2025. 1:42 p.m. Eastern Time - Added notesForTutor field and duplicate mode instructions, enhanced modal concept documentation
 * 
 * @architectural-context
 * Layer: UI Component (Modal/Dialog)
 * Dependencies: react, react-dom (createPortal), ../types (Question), ../contexts/AppContext (topics, addNewQuestion, updateQuestion), ../constants (DIFFICULTIES, QUESTION_TYPES), react-hot-toast.
 * Pattern: Form-based data entry/modification within a modal using React Portal for proper overlay positioning. State management via `useState` and `useEffect`. Interaction with global context (`AppContext`).
 * 
 * @portal-rendering
 * Uses React Portal (createPortal) to render modal at document.body level, ensuring it's not constrained by parent container layouts.
 * This prevents modal cutoff issues and ensures true full-screen overlay behavior independent of parent component positioning.
 * 
 * @workflow-context  
 * User Journey: Content Curation (Adding, Editing, Duplicating Questions).
 * Sequence Position: Invoked from `CurationView` in response to user actions (e.g., clicking "Add New Question", "Edit", "Duplicate").
 * Inputs: Component props (`isOpen`, `onClose`, `questionToEdit`, `isDuplicateMode`), user interactions with form elements.
 * Outputs: Invokes `onClose` callback. Calls `addNewQuestion` or `updateQuestion` methods from `AppContext`. Displays toasts for validation failures.
 * 
 * @authentication-context
 * Auth Modes: N/A (Modal operates within an already authenticated view).
 * Security: Input validation (required fields) is performed. Relies on `AppContext` for secure data operations.
 * 
 * @mock-data-context
 * Purpose: N/A (Does not directly use mock data, but consumes `contextTopics` which might have initial/fallback values. Form data is user-entered).
 * Behavior: N/A
 * Activation: N/A
 * 
 * @duplicate-mode-context
 * Purpose: Create variations of existing questions for similar scenarios
 * Use Case: When instructors need multiple versions of a question with slight variations
 * Behavior: Pre-fills all fields from original question, assigns new ID on save
 * Example: Creating multiple WACC calculation problems with different company data
 */
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Question } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { DIFFICULTIES, QUESTION_TYPES } from '../constants';
import toast from 'react-hot-toast';

/**
 * @interface QuestionModalProps
 * @description Defines the properties accepted by the `QuestionModal` component.
 * @property {boolean} isOpen - Controls the visibility of the modal.
 * @property {() => void} onClose - Callback function invoked when the modal is closed.
 * @property {Question | null} [questionToEdit] - Optional. The question data to pre-fill the form for editing. If null or undefined, the modal is in "add new" mode.
 * @property {boolean} [isDuplicateMode] - Optional. If true and `questionToEdit` is provided, the modal is in "duplicate" mode.
 */
interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionToEdit?: Question | null;
  isDuplicateMode?: boolean; 
}

/**
 * @component QuestionModal
 * @description Renders a modal dialog for creating new questions, editing existing ones, or duplicating questions. It includes fields for topic (with an option to create a new topic), subtopic, difficulty, type, question text, and answer text. Handles form state, validation, and submission through `AppContext`.
 * @param {QuestionModalProps} props - Props for configuring the modal's behavior and initial state.
 * @returns {JSX.Element | null} The modal JSX if `isOpen` is true, otherwise null.
 * @usage
 * ```jsx
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
 * const [isDuplicating, setIsDuplicating] = useState(false);
 * 
 * // To open for new question:
 * // setIsModalOpen(true); setSelectedQuestion(null); setIsDuplicating(false);
 * 
 * // To open for editing question 'q':
 * // setIsModalOpen(true); setSelectedQuestion(q); setIsDuplicating(false);
 * 
 * // To open for duplicating question 'q':
 * // setIsModalOpen(true); setSelectedQuestion(q); setIsDuplicating(true);
 * 
 * <QuestionModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   questionToEdit={selectedQuestion}
 *   isDuplicateMode={isDuplicating}
 * />
 * ```
 */
const QuestionModal: React.FC<QuestionModalProps> = ({ isOpen, onClose, questionToEdit, isDuplicateMode }) => {
  const { topics: contextTopics, addNewQuestion, updateQuestion, isContextLoading: isAppLoading } = useAppContext();

  const [topic, setTopic] = useState('');
  const [isNewTopic, setIsNewTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [type, setType] = useState(QUESTION_TYPES[0]);
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [notesForTutor, setNotesForTutor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Store original values for change detection
  const [originalValues, setOriginalValues] = useState<{
    topic: string;
    subtopic: string;
    difficulty: string;
    type: string;
    questionText: string;
    answerText: string;
    notesForTutor: string;
  } | null>(null);

  const uniqueContextTopics = useMemo(() => Array.from(new Set(contextTopics)), [contextTopics]);

  useEffect(() => {
    if (!isOpen) return; // Don't reset form if modal is not being opened

    if (questionToEdit) {
      const topicExistsInContext = uniqueContextTopics.includes(questionToEdit.topic);
      let finalTopic: string;
      
      if (topicExistsInContext) {
        setTopic(questionToEdit.topic);
        setIsNewTopic(false);
        setNewTopicName('');
        finalTopic = questionToEdit.topic;
      } else {
        // If editing a question whose topic isn't in the current list,
        // treat it as a new topic entry, prefilling the name.
        setTopic("_new_topic_"); 
        setIsNewTopic(true);
        setNewTopicName(questionToEdit.topic);
        finalTopic = questionToEdit.topic;
      }
      
      setSubtopic(questionToEdit.subtopic);
      setDifficulty(questionToEdit.difficulty || DIFFICULTIES[0]);
      setType(questionToEdit.type || QUESTION_TYPES[0]);
      setQuestionText(questionToEdit.questionText);
      setAnswerText(questionToEdit.answerText || '');
      setNotesForTutor(questionToEdit.notesForTutor || '');
      
      // Store original values for change detection (only for edit/duplicate)
      setOriginalValues({
        topic: finalTopic,
        subtopic: questionToEdit.subtopic,
        difficulty: questionToEdit.difficulty || DIFFICULTIES[0],
        type: questionToEdit.type || QUESTION_TYPES[0],
        questionText: questionToEdit.questionText,
        answerText: questionToEdit.answerText || '',
        notesForTutor: questionToEdit.notesForTutor || ''
      });
    } else {
      // Reset form for new question
      setTopic(uniqueContextTopics.length > 0 ? uniqueContextTopics[0] : '');
      setIsNewTopic(false);
      setNewTopicName('');
      setSubtopic('');
      setDifficulty(DIFFICULTIES[0]);
      setType(QUESTION_TYPES[0]);
      setQuestionText('');
      setAnswerText('');
      setNotesForTutor('');
      setOriginalValues(null); // No change detection for new questions
    }
  }, [questionToEdit, isOpen, uniqueContextTopics]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '_new_topic_') {
      setIsNewTopic(true);
      setTopic('_new_topic_'); // Keep select value consistent
      setNewTopicName(''); // Clear new topic name input
    } else {
      setIsNewTopic(false);
      setTopic(selectedValue);
    }
  };

  /**
   * @function hasChanges
   * @description Compares current form values with original values to detect modifications
   * @returns {boolean} True if any field has been modified, false if no changes made
   * @example
   * // For edit mode: returns false if user hasn't changed anything
   * // For duplicate mode: returns false if user hasn't modified the duplicated content
   * // For new question mode: always returns true to allow creation
   */
  const hasChanges = (): boolean => {
    if (!originalValues) return true; // For new questions, always allow save
    
    const currentFinalTopic = isNewTopic ? newTopicName.trim() : topic;
    
    return (
      currentFinalTopic !== originalValues.topic ||
      subtopic.trim() !== originalValues.subtopic ||
      difficulty !== originalValues.difficulty ||
      type !== originalValues.type ||
      questionText.trim() !== originalValues.questionText ||
      answerText.trim() !== originalValues.answerText ||
      notesForTutor.trim() !== originalValues.notesForTutor
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalTopic = isNewTopic ? newTopicName.trim() : topic;

    // Check for required fields first
    if (!finalTopic || finalTopic === 'Select Topic' || (isNewTopic && !newTopicName.trim())) {
      toast.error('Topic is required.');
      setIsLoading(false);
      return;
    }
    if (!subtopic.trim()) {
      toast.error('Subtopic is required.');
      setIsLoading(false);
      return;
    }
    if (!questionText.trim()) {
      toast.error('Question text is required.');
      setIsLoading(false);
      return;
    }
    if (!answerText.trim()) {
      toast.error('Answer text is required.');
      setIsLoading(false);
      return;
    }

    // Check for changes when editing or duplicating
    if (questionToEdit && !hasChanges()) {
      if (isDuplicateMode) {
        toast.error('No changes made. Please modify the question before duplicating to avoid creating identical questions.');
      } else {
        toast.error('No changes made. Please modify the question or click Cancel.');
      }
      setIsLoading(false);
      return;
    }
    
    const questionData: Omit<Question, 'id'> = {
      topic: finalTopic,
      subtopic: subtopic.trim(),
      difficulty,
      type,
      questionText: questionText.trim(),
      answerText: answerText.trim(),
      notesForTutor: notesForTutor.trim() || undefined, // Only include if not empty
    };

    try {
      if (questionToEdit && !isDuplicateMode) {
        await updateQuestion({ ...questionData, id: questionToEdit.id });
        toast.success('Question updated successfully!');
      } else { 
        await addNewQuestion(questionData);
        toast.success(isDuplicateMode ? 'Question duplicated successfully!' : 'Question added successfully!');
      }
      onClose(); 
    } catch (error) {
      // AppContext methods should handle their own toasting for API errors.
      // If not, a generic error can be toasted here.
      console.error("Failed to save question in modal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = isDuplicateMode ? 'Duplicate Question' : questionToEdit ? 'Edit Question' : 'Add New Question';
  const submitButtonText = isLoading ? 'Saving...' : isDuplicateMode ? 'Duplicate Question' : questionToEdit ? 'Save Changes' : 'Add Question';

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 modal-overlay overflow-y-auto py-4" role="dialog" aria-modal="true" aria-labelledby="question-modal-title">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl modal-content transform transition-all mx-4 max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="question-modal-title" className="text-2xl font-bold text-slate-800">{modalTitle}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close modal"
            disabled={isLoading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Duplicate Mode Instructions */}
        {isDuplicateMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Create a Question Variation:</strong> Use this feature to create a new question 
              based on an existing one. All fields are pre-filled from the original. Make your 
              desired changes - the new question will receive its own unique ID when saved.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Selection */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
            <select 
              id="topic" 
              name="topic" 
              value={topic} 
              onChange={handleTopicChange}
              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 sm:text-sm"
              disabled={isLoading || isAppLoading}
            >
              {uniqueContextTopics.length === 0 && !isNewTopic && <option value="" disabled>No topics available</option>}
              {uniqueContextTopics.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="_new_topic_">-- Create New Topic --</option>
            </select>
          </div>

          {/* New Topic Name Input */}
          {isNewTopic && (
            <div>
              <label htmlFor="newTopicName" className="block text-sm font-medium text-slate-700 mb-1">New Topic Name</label>
              <input 
                type="text" 
                id="newTopicName" 
                name="newTopicName"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 sm:text-sm"
                placeholder="Enter the name for the new topic"
                disabled={isLoading}
                required={isNewTopic}
              />
            </div>
          )}
          
          {/* Subtopic */}
          <div>
            <label htmlFor="subtopic" className="block text-sm font-medium text-slate-700 mb-1">Subtopic</label>
            <input 
              type="text" 
              id="subtopic" 
              name="subtopic"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 sm:text-sm"
              placeholder="e.g., Calculating WACC, Perpetuity Growth"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select 
                id="difficulty" 
                name="difficulty" 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 sm:text-sm"
                disabled={isLoading}
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                id="type" 
                name="type" 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 sm:text-sm"
                disabled={isLoading}
              >
                {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label htmlFor="questionText" className="block text-sm font-medium text-slate-700 mb-1">Question</label>
            <textarea 
              id="questionText" 
              name="questionText" 
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 sm:text-sm"
              placeholder="Enter the question text..."
              disabled={isLoading}
              required
            />
          </div>

          {/* Answer Text */}
          <div>
            <label htmlFor="answerText" className="block text-sm font-medium text-slate-700 mb-1">Answer</label>
            <textarea 
              id="answerText" 
              name="answerText" 
              rows={6}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 sm:text-sm"
              placeholder="Enter the answer text..."
              disabled={isLoading}
              required
            />
          </div>

          {/* Notes for Tutor - Optional field for instructor guidance */}
          <div>
            <label htmlFor="notesForTutor" className="block text-sm font-medium text-slate-700 mb-1">
              Notes for Tutor <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea 
              id="notesForTutor" 
              name="notesForTutor" 
              rows={3}
              value={notesForTutor}
              onChange={(e) => setNotesForTutor(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 sm:text-sm"
              placeholder="Optional notes or guidance for tutors..."
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 transition-colors duration-150 ease-in-out"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-60 transition-colors duration-150 ease-in-out"
              disabled={isLoading || isAppLoading}
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default QuestionModal;

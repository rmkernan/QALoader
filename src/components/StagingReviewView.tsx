/**
 * @file components/StagingReviewView.tsx
 * @description Staging workflow view for reviewing and managing uploaded question batches before production import
 * @created June 20, 2025. 10:52 AM Eastern Time
 * @updated June 20, 2025. 12:21 PM Eastern Time - Fixed batch list to show full timestamp instead of date only
 * @updated June 20, 2025. 12:31 PM Eastern Time - Added workflow instructions panel to batch detail view
 * 
 * @architectural-context
 * Layer: UI Component (Application View/Page)
 * Dependencies: Consumes staging API endpoints, React hooks, toast notifications
 * Pattern: Multi-level view (batch list -> batch detail -> duplicate resolution)
 * 
 * @workflow-context
 * User Journey: Review uploaded questions, approve/reject content, resolve duplicates before production
 * Sequence Position: After file upload, before questions appear in production
 * Inputs: User selections, review decisions, duplicate resolutions
 * Outputs: Approved questions moved to production, rejected questions discarded
 * 
 * @authentication-context
 * Auth Requirements: Protected view requiring authentication
 * Security: All API calls include JWT token for authorization
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  UploadBatch, 
  StagedQuestion, 
  StagingDuplicate,
  View 
} from '../types';
import {
  getStagingBatches,
  getStagingBatch,
  reviewStagedQuestions,
  importBatchToProduction,
  getStagingDuplicates,
  resolveStagingDuplicate
} from '../services/api';

interface StagingReviewViewProps {
  setActiveView: (view: View) => void;
}

type ViewMode = 'list' | 'detail' | 'duplicates';

/**
 * @component BatchStatusBadge
 * @description Displays color-coded status badge for batch
 * @param {Object} props - Component props
 * @param {string} props.status - Batch status to display
 * @returns {JSX.Element} Styled status badge
 */
const BatchStatusBadge: React.FC<{ status: UploadBatch['status'] }> = ({ status }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/**
 * @component QuestionStatusBadge
 * @description Displays color-coded status badge for individual questions
 * @param {Object} props - Component props
 * @param {string} props.status - Question status to display
 * @returns {JSX.Element} Styled status badge
 */
const QuestionStatusBadge: React.FC<{ status: StagedQuestion['status'] }> = ({ status }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    duplicate: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/**
 * @component StagingReviewView
 * @description Main staging review interface with batch list, detail view, and duplicate resolution
 * @param {StagingReviewViewProps} props - View navigation props
 * @returns {JSX.Element} Complete staging review interface
 */
const StagingReviewView: React.FC<StagingReviewViewProps> = ({ setActiveView: _setActiveView }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<UploadBatch | null>(null);
  const [batchQuestions, setBatchQuestions] = useState<StagedQuestion[]>([]);
  const [duplicates, setDuplicates] = useState<StagingDuplicate[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<UploadBatch['status'] | 'all'>('all');

  const ITEMS_PER_PAGE = 20;

  /**
   * @function loadBatches
   * @description Fetches list of upload batches with pagination and filtering
   */
  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: currentPage * ITEMS_PER_PAGE
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const { batches: fetchedBatches, total } = await getStagingBatches(params);
      setBatches(fetchedBatches);
      setTotalBatches(total);
    } catch (error) {
      toast.error('Failed to load batches');
      console.error('Error loading batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function loadBatchDetail
   * @description Fetches detailed information for a specific batch
   * @param {string} batchId - ID of batch to load
   */
  const loadBatchDetail = async (batchId: string) => {
    setIsLoading(true);
    try {
      const { batch, questions } = await getStagingBatch(batchId);
      setSelectedBatch(batch);
      setBatchQuestions(questions);
      setViewMode('detail');
      
      // Check for duplicates if any exist
      if (batch.questions_duplicate > 0) {
        const dupes = await getStagingDuplicates(batchId);
        setDuplicates(dupes);
      }
    } catch (error) {
      toast.error('Failed to load batch details');
      console.error('Error loading batch detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function handleBulkReview
   * @description Approve or reject multiple selected questions
   * @param {"approve" | "reject"} action - Review action to take
   */
  const handleBulkReview = async (action: "approve" | "reject") => {
    if (selectedQuestions.size === 0) {
      toast.error('Please select questions to review');
      return;
    }

    if (!selectedBatch) return;

    setIsLoading(true);
    try {
      const { updated_count } = await reviewStagedQuestions(selectedBatch.batch_id, {
        question_ids: Array.from(selectedQuestions),
        action,
        review_notes: `Bulk ${action} via staging review interface`
      });

      toast.success(`Successfully ${action}d ${updated_count} questions`);
      setSelectedQuestions(new Set());
      
      // Reload batch detail to refresh counts
      await loadBatchDetail(selectedBatch.batch_id);
    } catch (error) {
      toast.error(`Failed to ${action} questions`);
      console.error(`Error ${action}ing questions:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function handleImportBatch
   * @description Import all approved questions to production
   */
  const handleImportBatch = async () => {
    if (!selectedBatch) return;

    if (selectedBatch.questions_approved === 0) {
      toast.error('No approved questions to import');
      return;
    }

    if (selectedBatch.questions_duplicate > 0) {
      toast.error('Please resolve all duplicates before importing');
      return;
    }

    const confirmImport = window.confirm(
      `Import ${selectedBatch.questions_approved} approved questions to production?`
    );
    if (!confirmImport) return;

    setIsLoading(true);
    try {
      const { imported_count, failed_count } = await importBatchToProduction(selectedBatch.batch_id);
      
      if (failed_count > 0) {
        toast.error(`Import completed with errors: ${imported_count} succeeded, ${failed_count} failed`);
      } else {
        toast.success(`Successfully imported ${imported_count} questions to production`);
      }
      
      // Return to batch list
      setViewMode('list');
      setSelectedBatch(null);
      await loadBatches();
    } catch (error) {
      toast.error('Failed to import batch');
      console.error('Error importing batch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function handleResolveDuplicate
   * @description Resolve a duplicate question
   * @param {string} duplicateId - ID of duplicate to resolve
   * @param {string} resolution - Resolution action
   */
  const handleResolveDuplicate = async (
    duplicateId: string, 
    resolution: "keep_existing" | "replace" | "keep_both"
  ) => {
    setIsLoading(true);
    try {
      await resolveStagingDuplicate(duplicateId, {
        resolution,
        resolution_notes: `Resolved via staging review interface`
      });
      
      toast.success('Duplicate resolved successfully');
      
      // Reload duplicates
      if (selectedBatch) {
        const dupes = await getStagingDuplicates(selectedBatch.batch_id);
        setDuplicates(dupes);
        
        // If no more duplicates, reload batch detail
        if (dupes.length === 0) {
          await loadBatchDetail(selectedBatch.batch_id);
        }
      }
    } catch (error) {
      toast.error('Failed to resolve duplicate');
      console.error('Error resolving duplicate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load batches on mount and when filters change
  useEffect(() => {
    if (viewMode === 'list') {
      loadBatches();
    }
  }, [currentPage, statusFilter, viewMode]);

  /**
   * @function renderBatchList
   * @description Renders the batch list view
   * @returns {JSX.Element} Batch list interface
   */
  const renderBatchList = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Batches</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Total: {totalBatches} batches
          </div>
        </div>
      </div>

      {/* Batch Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.batch_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {batch.file_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {batch.uploaded_by} • {new Date(batch.uploaded_at).toLocaleString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BatchStatusBadge status={batch.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {batch.total_questions} total
                  {batch.questions_duplicate > 0 && (
                    <span className="text-purple-600 ml-2">
                      ({batch.questions_duplicate} duplicates)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex text-xs gap-2">
                        <span className="text-green-600">{batch.questions_approved} approved</span>
                        <span className="text-yellow-600">{batch.questions_pending} pending</span>
                        <span className="text-red-600">{batch.questions_rejected} rejected</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="flex h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${(batch.questions_approved / batch.total_questions) * 100}%` }}
                          />
                          <div 
                            className="bg-yellow-500" 
                            style={{ width: `${(batch.questions_pending / batch.total_questions) * 100}%` }}
                          />
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${(batch.questions_rejected / batch.total_questions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => loadBatchDetail(batch.batch_id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalBatches > ITEMS_PER_PAGE && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage + 1} of {Math.ceil(totalBatches / ITEMS_PER_PAGE)}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalBatches}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  /**
   * @function renderBatchDetail
   * @description Renders the batch detail view with question list
   * @returns {JSX.Element} Batch detail interface
   */
  const renderBatchDetail = () => {
    if (!selectedBatch || !batchQuestions) return null;

    const pendingQuestions = batchQuestions.filter(q => q.status === 'pending');
    const approvedQuestions = batchQuestions.filter(q => q.status === 'approved');
    const rejectedQuestions = batchQuestions.filter(q => q.status === 'rejected');

    return (
      <div className="space-y-6">
        {/* Batch Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedBatch.file_name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Uploaded by {selectedBatch.uploaded_by} on {new Date(selectedBatch.uploaded_at).toLocaleString()}
              </p>
            </div>
            <BatchStatusBadge status={selectedBatch.status} />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{selectedBatch.total_questions}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{selectedBatch.questions_pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedBatch.questions_approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{selectedBatch.questions_rejected}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedBatch.questions_duplicate}</div>
              <div className="text-sm text-gray-500">Duplicates</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => { setViewMode('list'); setSelectedBatch(null); }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to List
            </button>
            {selectedBatch.questions_duplicate > 0 && (
              <button
                onClick={() => setViewMode('duplicates')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
              >
                Resolve Duplicates ({selectedBatch.questions_duplicate})
              </button>
            )}
            <button
              onClick={() => handleImportBatch()}
              disabled={selectedBatch.questions_approved === 0 || selectedBatch.questions_duplicate > 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import to Production ({selectedBatch.questions_approved})
            </button>
          </div>
          
          {/* Workflow Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Review Workflow</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>1. Review Questions:</strong> All uploaded questions start as "pending" - review each for quality and accuracy.</p>
              <p><strong>2. Approve/Reject:</strong> Use individual buttons or bulk actions to approve good questions and reject poor ones.</p>
              <p><strong>3. Resolve Duplicates:</strong> If any duplicates are detected, resolve them before importing.</p>
              <p><strong>4. Import:</strong> Once reviewed, click "Import to Production" to add approved questions to the main database.</p>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {pendingQuestions.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedQuestions.size} of {pendingQuestions.length} pending questions selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allPendingIds = new Set(pendingQuestions.map(q => q.question_id));
                    setSelectedQuestions(allPendingIds);
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Select All Pending
                </button>
                <button
                  onClick={() => setSelectedQuestions(new Set())}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Selection
                </button>
                <button
                  onClick={() => handleBulkReview('approve')}
                  disabled={selectedQuestions.size === 0}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => handleBulkReview('reject')}
                  disabled={selectedQuestions.size === 0}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {/* Pending Questions */}
          {pendingQuestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Pending Review ({pendingQuestions.length})
              </h3>
              <div className="space-y-2">
                {pendingQuestions.map((question) => (
                  <div key={question.question_id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.question_id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedQuestions);
                          if (e.target.checked) {
                            newSelected.add(question.question_id);
                          } else {
                            newSelected.delete(question.question_id);
                          }
                          setSelectedQuestions(newSelected);
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{question.topic}</span>
                            {question.subtopic && (
                              <span className="text-sm text-gray-500"> › {question.subtopic}</span>
                            )}
                            <span className="text-sm text-gray-500 ml-2">
                              • {question.difficulty} • {question.type}
                            </span>
                          </div>
                          <QuestionStatusBadge status={question.status} />
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>Q:</strong> {question.question}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>A:</strong> {question.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Questions */}
          {approvedQuestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Approved ({approvedQuestions.length})
              </h3>
              <div className="space-y-2">
                {approvedQuestions.map((question) => (
                  <div key={question.question_id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{question.topic}</span>
                        {question.subtopic && (
                          <span className="text-sm text-gray-500"> › {question.subtopic}</span>
                        )}
                      </div>
                      <QuestionStatusBadge status={question.status} />
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>Q:</strong> {question.question}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Questions */}
          {rejectedQuestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Rejected ({rejectedQuestions.length})
              </h3>
              <div className="space-y-2">
                {rejectedQuestions.map((question) => (
                  <div key={question.question_id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{question.topic}</span>
                        {question.subtopic && (
                          <span className="text-sm text-gray-500"> › {question.subtopic}</span>
                        )}
                      </div>
                      <QuestionStatusBadge status={question.status} />
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>Q:</strong> {question.question}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * @function renderDuplicateResolution
   * @description Renders the duplicate resolution interface
   * @returns {JSX.Element} Duplicate resolution interface
   */
  const renderDuplicateResolution = () => {
    if (!selectedBatch || duplicates.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">No duplicates to resolve</p>
          <button
            onClick={() => setViewMode('detail')}
            className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Batch Detail
          </button>
        </div>
      );
    }

    const pendingDuplicates = duplicates.filter(d => d.resolution_status === 'pending');

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resolve Duplicates</h2>
              <p className="text-sm text-gray-500 mt-1">
                {pendingDuplicates.length} of {duplicates.length} duplicates pending resolution
              </p>
            </div>
            <button
              onClick={() => setViewMode('detail')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Batch Detail
            </button>
          </div>
        </div>

        {/* Duplicate Cards */}
        <div className="space-y-6">
          {pendingDuplicates.map((duplicate) => {
            const stagedQuestion = batchQuestions.find(q => q.question_id === duplicate.staged_question_id);
            if (!stagedQuestion) return null;

            return (
              <div key={duplicate.duplicate_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-purple-50 px-6 py-3 border-b border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-900">
                      Duplicate Detected - {Math.round(duplicate.similarity_score * 100)}% Similar
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* New Question */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">New Question (Staged)</h4>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>Topic:</strong> {stagedQuestion.topic}
                          {stagedQuestion.subtopic && ` › ${stagedQuestion.subtopic}`}
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>Q:</strong> {stagedQuestion.question}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>A:</strong> {stagedQuestion.answer}
                        </div>
                      </div>
                    </div>

                    {/* Existing Question */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Existing Question (Production)</h4>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-600">
                          <em>Existing question ID: {duplicate.existing_question_id}</em>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          (Fetch and display existing question details here)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Actions */}
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={() => handleResolveDuplicate(duplicate.duplicate_id, 'keep_existing')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Keep Existing
                    </button>
                    <button
                      onClick={() => handleResolveDuplicate(duplicate.duplicate_id, 'replace')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700"
                    >
                      Replace with New
                    </button>
                    <button
                      onClick={() => handleResolveDuplicate(duplicate.duplicate_id, 'keep_both')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Keep Both
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staging Review</h1>
          <p className="text-gray-600 mt-2">
            Review and approve uploaded questions before importing to production
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {viewMode === 'list' && renderBatchList()}
            {viewMode === 'detail' && renderBatchDetail()}
            {viewMode === 'duplicates' && renderDuplicateResolution()}
          </>
        )}
      </div>
    </div>
  );
};

export default StagingReviewView;
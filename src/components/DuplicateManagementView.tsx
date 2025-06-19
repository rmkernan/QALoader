/**
 * @file src/components/DuplicateManagementView.tsx
 * @description Component for reviewing and managing duplicate questions using PostgreSQL pg_trgm similarity matching
 * @created June 19, 2025. 6:01 PM Eastern Time
 * 
 * @architectural-context
 * Layer: UI Component (Page)
 * Dependencies: DuplicateGroup API, batchDeleteDuplicates API, React hooks
 * Pattern: Data fetching with loading/error states, batch operations with confirmation
 * 
 * @workflow-context
 * User Journey: Post-upload duplicate management and cleanup
 * Sequence Position: Called after upload or from dashboard for manual duplicate review
 * Inputs: User selections for deletion, similarity threshold adjustments
 * Outputs: Duplicate removal, updated question database
 * 
 * @authentication-context
 * Auth Requirements: Protected route, requires JWT token for API calls
 * Security: Question access restricted to authenticated users
 */

import React, { useState, useEffect } from 'react';
import { DuplicateGroup, View } from '../types';
import { getDuplicates, batchDeleteDuplicates } from '../services/api';
import toast from 'react-hot-toast';
import { useAppContext } from '../contexts/AppContext';

interface DuplicateManagementViewProps {
  setActiveView?: (_view: View) => void;
}

/**
 * @component DuplicateManagementView
 * @description Main component for duplicate question management interface
 * @returns {JSX.Element} Duplicate management UI
 */
export const DuplicateManagementView: React.FC<DuplicateManagementViewProps> = ({ setActiveView }) => {
  const { fetchInitialData } = useAppContext();
  
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(0.8);
  const [error, setError] = useState<string | null>(null);

  /**
   * @function fetchDuplicates
   * @description Fetches duplicate groups from the API
   * @param {number} similarityThreshold - Threshold for similarity matching
   */
  const fetchDuplicates = async (similarityThreshold: number = threshold) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getDuplicates(similarityThreshold);
      setDuplicateGroups(result.groups || []);
      
      if (result.count === 0) {
        toast.success('🎉 No duplicates found! Your questions are unique.');
      } else {
        toast.success(`Found ${result.count} potential duplicates in ${result.groups.length} groups`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch duplicates';
      setError(errorMessage);
      toast.error(`Failed to load duplicates: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load duplicates on component mount
  useEffect(() => {
    fetchDuplicates();
  }, []);

  /**
   * @function handleThresholdChange
   * @description Updates similarity threshold and refetches duplicates
   * @param {number} newThreshold - New similarity threshold (0.1-1.0)
   */
  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    setSelectedIds(new Set()); // Clear selections when threshold changes
    fetchDuplicates(newThreshold);
  };

  /**
   * @function toggleSelection
   * @description Toggles selection state for a question ID
   * @param {string} questionId - ID of question to toggle
   */
  const toggleSelection = (questionId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedIds(newSelected);
  };

  /**
   * @function handleBatchDelete
   * @description Deletes selected duplicate questions
   */
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select questions to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} questions? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const questionIds = Array.from(selectedIds);
      const result = await batchDeleteDuplicates(questionIds);
      
      toast.success(`Deleted ${result.deleted_count} questions successfully`);
      
      if (result.failed_count > 0) {
        toast.error(`Failed to delete ${result.failed_count} questions`);
      }
      
      // Refresh data and clear selections
      await fetchInitialData();
      setSelectedIds(new Set());
      await fetchDuplicates(); // Refresh duplicate list
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete questions';
      toast.error(`Delete failed: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="view-enter-active p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-lg">Loading duplicates...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-enter-active p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Duplicates</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => fetchDuplicates()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-enter-active p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Duplicate Questions</h2>
          <button
            onClick={() => setActiveView?.(View.DASHBOARD)}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-slate-700">
                Similarity Threshold:
              </label>
              <select
                value={threshold}
                onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
                className="border border-slate-300 rounded-md px-3 py-1 text-sm"
              >
                <option value={0.9}>90% (Very Similar)</option>
                <option value={0.8}>80% (Similar)</option>
                <option value={0.7}>70% (Somewhat Similar)</option>
                <option value={0.6}>60% (Loosely Similar)</option>
              </select>
              <button
                onClick={() => fetchDuplicates()}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
              >
                Refresh
              </button>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={handleBatchDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Selected'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Duplicate Groups */}
        {duplicateGroups.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-8 text-center">
            <h3 className="text-lg font-medium text-green-800 mb-2">🎉 No Duplicates Found!</h3>
            <p className="text-green-700">
              Your questions are unique at the {Math.round(threshold * 100)}% similarity threshold.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {duplicateGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="bg-white rounded-lg shadow-md border border-slate-200">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-medium text-slate-900">
                    Duplicate Group {groupIndex + 1}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {group.duplicates.length + 1} similar questions found
                  </p>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Primary Question */}
                  <div className="border border-green-200 rounded-md p-4 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Primary
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            {group.primaryQuestion.id}
                          </span>
                          <span className="text-sm text-slate-500">
                            Topic: {group.primaryQuestion.topic}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-3">
                          {group.primaryQuestion.text}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(group.primaryQuestion.id)}
                        onChange={() => toggleSelection(group.primaryQuestion.id)}
                        className="ml-4 h-4 w-4 text-indigo-600 rounded border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Duplicate Questions */}
                  {group.duplicates.map((duplicate, dupIndex) => (
                    <div key={dupIndex} className="border border-orange-200 rounded-md p-4 bg-orange-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                              {Math.round(duplicate.similarityScore * 100)}% Similar
                            </span>
                            <span className="text-sm font-medium text-slate-700">
                              {duplicate.id}
                            </span>
                            <span className="text-sm text-slate-500">
                              Topic: {duplicate.topic}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-3">
                            {duplicate.text}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(duplicate.id)}
                          onChange={() => toggleSelection(duplicate.id)}
                          className="ml-4 h-4 w-4 text-indigo-600 rounded border-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DuplicateManagementView;
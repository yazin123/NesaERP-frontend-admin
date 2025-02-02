'use client';
import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import api from '@/api';
import toast from 'react-hot-toast';

const ProjectStatus = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(project.status);
  const [statusDescription, setStatusDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    setStatus(project.status);
    setStatusDescription('');
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!statusDescription.trim()) {
      toast.error('Please provide a description for the status change');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put('/projects/update', {
        id: project._id,
        status,
        statusDescription: statusDescription.trim()
      });
      
      toast.success('Status updated successfully');
      onUpdate();
      setIsEditing(false);
      setStatusDescription('');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      started: 'bg-blue-100 text-blue-800',
      closed: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      reopened: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Sort status history in reverse chronological order
  const sortedStatusHistory = [...(project.statusHistory || [])].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Project Status</h2>
        <div>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Check className="w-4 h-4 mr-1" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Status Display/Edit */}
        <div>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="started">Started</option>
                  <option value="closed">Closed</option>
                  <option value="reopened">Reopened</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status Change Description
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide a reason for the status change..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Status History */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Status History</h3>
          <div className="space-y-4">
            {sortedStatusHistory.length > 0 ? (
              sortedStatusHistory.map((history, index) => (
                <div 
                  key={index} 
                  className="relative pl-4 pb-4 border-l border-gray-200 last:pb-0"
                >
                  <div className="absolute -left-1.5 mt-1">
                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(history.status)}`}>
                        {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-1">
                      {history.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No status history available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatus;
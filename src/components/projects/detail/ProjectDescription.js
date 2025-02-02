'use client';
import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import api from '@/api';
import toast from 'react-hot-toast';

const ProjectDescription = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    setTitle(project.title);
    setDescription(project.description);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/projects/update`, {
        id: project._id,
        title,
        description
    });
      
      toast.success('Project details updated successfully');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update project details');
      console.log('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Project Information</h2>
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

      <div className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project title"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project description"
                disabled={isSubmitting}
              />
            </div>
          </>
        ) : (
          <div>
            <h3 className="text-xl font-medium text-gray-900">{title}</h3>
            <p className="mt-4 text-gray-600 whitespace-pre-wrap">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDescription;
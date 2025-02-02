'use client';
import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

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

const ProjectHeader = ({ project, onBack, onDelete }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6">
      <div className="flex items-start w-full">
        <button
          onClick={onBack}
          className="mr-3 sm:mr-4 text-gray-600 hover:text-gray-900 mt-1 flex-shrink-0"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {project.title}
          </h1>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)} w-fit`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              Created on {new Date(project.dateCreated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent 
                 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                 w-auto md:w-52 "
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Project
      </button>
    </div>
  );
};

export default ProjectHeader;
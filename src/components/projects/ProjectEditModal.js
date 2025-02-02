'use client';
import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Upload, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import api from '@/api';
import toast from 'react-hot-toast';

// Base EditableSection component
const EditableSection = ({ title, onSave, children, isEditing, setIsEditing }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-400 hover:text-gray-600"
        >
          {isEditing ? (
            <X className="w-5 h-5" />
          ) : (
            <Edit2 className="w-5 h-5" />
          )}
        </button>
      </div>
      {children}
      {isEditing && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="mr-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

// Basic Details Section
export const BasicDetailsSection = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);

  const handleSave = async () => {
    try {
      await api.put(`/projects/update/${project._id}`, {
        title,
        description
      });
      toast.success('Basic details updated successfully');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update basic details');
    }
  };

  return (
    <EditableSection 
      title="Basic Details" 
      onSave={handleSave}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-medium text-gray-900">{project.title}</h3>
          <p className="mt-2 text-gray-600">{project.description}</p>
        </div>
      )}
    </EditableSection>
  );
};

// Status Section
export const StatusSection = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(project.status);
  const [completionDate, setCompletionDate] = useState(
    new Date(project.completionDate)
  );

  const handleSave = async () => {
    try {
      await api.put(`/projects/update/${project._id}`, {
        status,
        completionDate: completionDate.toISOString()
      });
      toast.success('Status updated successfully');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update status');
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

  return (
    <EditableSection 
      title="Status" 
      onSave={handleSave}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="started">Started</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Completion Date</label>
            <DatePicker
              selected={completionDate}
              onChange={setCompletionDate}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              dateFormat="MM/dd/yyyy"
              minDate={new Date()}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            <span>Due: {new Date(project.completionDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </EditableSection>
  );
};

// Files Section
export const FilesSection = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(project.files || []);

  const handleFileAdd = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => ({
      file,
      customName: '',
      originalName: file.name,
    }));
    setFiles([...files, ...newFiles]);
  };

  const handleCustomNameChange = (index, name) => {
    const updatedFiles = [...files];
    updatedFiles[index].customName = name;
    setFiles(updatedFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index) => {
    setExistingFiles(existingFiles.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (files.some(f => !f.customName)) {
      toast.error('Please provide names for all new files');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('existingFiles', JSON.stringify(existingFiles));
      
      const filesMetadata = files.map(file => ({
        name: file.customName,
        filetype: file.file.type,
      }));
      formData.append('filesMetadata', JSON.stringify(filesMetadata));

      files.forEach(file => {
        formData.append('files', file.file);
      });

      await api.put(`/projects/update/${project._id}`, formData);
      toast.success('Files updated successfully');
      onUpdate();
      setIsEditing(false);
      setFiles([]);
    } catch (error) {
      toast.error('Failed to update files');
    }
  };

  return (
    <EditableSection 
      title="Files" 
      onSave={handleSave}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
    >
      <div className="space-y-4">
        {/* Existing Files */}
        <div className="space-y-2">
          {existingFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{file.name}</span>
              {isEditing && (
                <button
                  onClick={() => removeExistingFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* New File Upload */}
        {isEditing && (
          <div>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileAdd}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={file.customName}
                        onChange={(e) => handleCustomNameChange(index, e.target.value)}
                        placeholder="Enter custom name for file"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{file.originalName}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </EditableSection>
  );
};

// Main ProjectEdit component that combines all sections
export const ProjectEdit = ({ project, onUpdate }) => {
  return (
    <div className="space-y-6">
      <BasicDetailsSection project={project} onUpdate={onUpdate} />
      <StatusSection project={project} onUpdate={onUpdate} />
      <FilesSection project={project} onUpdate={onUpdate} />
    </div>
  );
};
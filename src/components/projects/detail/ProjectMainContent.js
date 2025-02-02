'use client';
import React, { useState } from 'react';
import { Edit2, X, Upload, Calendar, Check } from 'lucide-react';
import api from '@/api';
import toast from 'react-hot-toast';

// Base Section Component
const Section = ({ title, children, isEditing, onEdit, onSave, onCancel }) => (
  <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      <div>
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </button>
        )}
      </div>
    </div>
    {children}
  </div>
);

// Details Section
const DetailsSection = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);

  const handleSave = async () => {
    try {
      await api.put(`/projects/update/${project._id}`, {
        title,
        description,
      });
      toast.success('Project details updated successfully');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update project details');
    }
  };

  return (
    <Section
      title="Project Details"
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={() => {
        setTitle(project.title);
        setDescription(project.description);
        setIsEditing(false);
      }}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <p className="text-gray-600">{project.description}</p>
        </div>
      )}
    </Section>
  );
};

// Files Section
const FilesSection = ({ project, onUpdate }) => {
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
      formData.append('id', project._id);
      files.forEach(file => {
        formData.append('files', file.file);
      });

      await api.put(`/projects/update`, formData);
      toast.success('Files updated successfully');
      onUpdate();
      setIsEditing(false);
      setFiles([]);
    } catch (error) {
      toast.error('Failed to update files');
    }
  };

  return (
    <Section
      title="Project Files"
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={() => {
        setFiles([]);
        setExistingFiles(project.files || []);
        setIsEditing(false);
      }}
    >
      <div className="space-y-4">
        {existingFiles.length > 0 ? (
          <div className="space-y-3">
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
        ) : (
          <p className="text-gray-500 text-sm">No files attached</p>
        )}

        {isEditing && (
          <div>
            <div className="mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                <p className="text-xs text-gray-500">Any file up to 10MB</p>
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
    </Section>
  );
};

// Status History Section
const StatusHistorySection = ({ project }) => (
  <Section title="Status History">
    <div className="space-y-4">
      {project.statusHistory && project.statusHistory.map((status, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status.status}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(status.timestamp).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  </Section>
);

// Main Content Component
const ProjectMainContent = ({ project, onUpdate }) => {
  return (
    <div>
      <DetailsSection project={project} onUpdate={onUpdate} />
      <FilesSection project={project} onUpdate={onUpdate} />
      <StatusHistorySection project={project} />
    </div>
  );
};

export default ProjectMainContent;
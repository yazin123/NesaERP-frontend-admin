'use client';
import React, { useState } from 'react';
import { Edit2, Check, X, Upload, Download, File, FileText, Image, Eye } from 'lucide-react';
import api from '@/api';
import toast from 'react-hot-toast';

const ProjectFiles = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(project.files || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);

  const isViewableType = (filetype) => {
    const viewableTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain'
    ];
    return viewableTypes.includes(filetype);
  };

  const handleFileView = (file) => {
    if (isViewableType(file.filetype)) {
      window.open(file.filedata, '_blank');
    } else {
      // For non-viewable files, trigger download
      const link = document.createElement('a');
      link.href = file.filedata;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (filetype) => {
    if (filetype.includes('image')) return <Image className="w-5 h-5 text-gray-400" />;
    if (filetype.includes('pdf')) return <FileText className="w-5 h-5 text-gray-400" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const handleFileAdd = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error('Some files exceed the 10MB limit and were not added');
      return;
    }

    const newFiles = selectedFiles.map(file => ({
      file,
      customName: '',
      originalName: file.name,
      filetype: file.type
    }));

    setFiles([...files, ...newFiles]);
  };

  const handleCustomNameChange = (index, name) => {
    const updatedFiles = [...files];
    updatedFiles[index].customName = name;
    setFiles(updatedFiles);
  };

  const removeNewFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index) => {
    setExistingFiles(existingFiles.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setFiles([]);
    setExistingFiles(project.files || []);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (files.some(f => !f.customName.trim())) {
      toast.error('Please provide names for all new files');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id', project._id);
      formData.append('existingFiles', JSON.stringify(existingFiles));
      
      const filesMetadata = files.map(file => ({
        name: file.customName.trim(),
        filetype: file.filetype
      }));
      formData.append('filesMetadata', JSON.stringify(filesMetadata));

      files.forEach(file => {
        formData.append('files', file.file);
      });

      await api.put('/projects/update', formData);
      
      toast.success('Files updated successfully');
      onUpdate();
      setIsEditing(false);
      setFiles([]);
    } catch (error) {
      toast.error('Failed to update files');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Project Files</h2>
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
        {/* Existing Files */}
        <div className="space-y-3">
          {existingFiles.length > 0 ? (
            existingFiles.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.filetype)}
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                {!isEditing && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFileView(file)}
                      className={`text-blue-600 hover:text-blue-700 ${isViewableType(file.filetype) ? 'block' : 'hidden'}`}
                      title="View file"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleFileView(file)}
                      className="text-blue-600 hover:text-blue-700"
                      title={isViewableType(file.filetype) ? "View file" : "Download file"}
                    >
                      {isViewableType(file.filetype) ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}
                {isEditing && (
                  <button
                    onClick={() => removeExistingFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No files attached</p>
          )}
        </div>

        {/* File Upload Section */}
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
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">Up to 10MB per file</p>
              </div>
            </div>

            {/* New Files List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={file.customName}
                        onChange={(e) => handleCustomNameChange(index, e.target.value)}
                        placeholder="Enter custom name for file"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {file.originalName}
                      </span>
                      <button
                        onClick={() => removeNewFile(index)}
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
    </div>
  );
};

export default ProjectFiles;
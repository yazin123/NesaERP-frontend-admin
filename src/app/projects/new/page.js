'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '@/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';

export default function CreateProject() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [leads, setLeads] = useState([]);
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        leadId: '',
        status: 'pending',
        completionDate: new Date(),
    });

    // Fetch leads on component mount
    useEffect(() => {
        fetchLeads();
    }, []);

    // Fetch all leads from the API
    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads/all');
            setLeads(response.data);
        } catch (error) {
            toast.error('Error fetching leads');
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file uploads
    const handleFileAdd = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const newFiles = selectedFiles.map((file) => ({
            file,
            customName: '',
            originalName: file.name,
            type: getFileType(file),
        }));
        setFiles([...files, ...newFiles]);
    };

    // Determine file type based on extension
    const getFileType = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
        if (['mp4', 'mov', 'avi'].includes(extension)) return 'video';
        if (extension === 'pdf') return 'pdf';
        if (['ppt', 'pptx'].includes(extension)) return 'ppt';
        if (['doc', 'docx'].includes(extension)) return 'document';
        return 'other';
    };

    // Handle custom name changes for files
    const handleCustomNameChange = (index, name) => {
        const updatedFiles = [...files];
        updatedFiles[index].customName = name;
        setFiles(updatedFiles);
    };

    // Remove a file from the list
    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate file names
        if (files.some((f) => !f.customName)) {
            toast.error('Please provide names for all files');
            return;
        }
    
        setIsLoading(true);
        try {
            const formDataToSend = new FormData();
    
            // Append basic fields
            Object.keys(formData).forEach((key) => {
                if (key === 'completionDate') {
                    formDataToSend.append(key, formData[key].toISOString());
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });
    
            // Append files metadata
            const filesMetadata = files.map((file) => ({
                name: file.customName,
                filetype: file.type,
            }));
            formDataToSend.append('filesMetadata', JSON.stringify(filesMetadata));
    
            // Append actual files
            files.forEach((file, index) => {
                formDataToSend.append(`files`, file.file); // Use 'files' as the field name
            });
    
            // Log the payload for debugging
            for (let [key, value] of formDataToSend.entries()) {
                console.log(key, value);
            }
    
            // Send the request to create the project
            const response = await api.post('/projects', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Project created successfully');
            router.push('/projects');
        } catch (error) {
            console.log('Creation error:', error);
            if (error.response) {
                console.log('Response data:', error.response.data);
                console.log('Response status:', error.response.status);
                console.log('Response headers:', error.response.headers);
            }
            toast.error(error.response?.data?.error || 'Failed to create project');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar pageTitle="Projects" />
                <div className="lex-1 overflow-y-auto p-6">
                    <div className="mb-6 flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 ml-4">Create New Project</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Lead */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lead</label>
                            <select
                                name="leadId"
                                value={formData.leadId}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Lead</option>
                                {leads.map((lead) => (
                                    <option key={lead._id} value={lead._id}>
                                        {lead.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="started">Started</option>
                                <option value="closed">Closed</option>
                                <option value="reopened">Reopened</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>

                        {/* Completion Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Completion Date</label>
                            <DatePicker
                                selected={formData.completionDate}
                                onChange={(date) => setFormData((prev) => ({ ...prev, completionDate: date }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                dateFormat="MM/dd/yyyy"
                                minDate={new Date()}
                                required
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Project Files</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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

                            {/* File List */}
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-sm text-gray-500">{file.originalName}</span>
                                                <span className="text-sm text-gray-500">({file.type})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
}
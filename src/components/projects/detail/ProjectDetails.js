'use client';
import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import api from '@/api';
import toast from 'react-hot-toast';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60)
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [targetDate]);

  if (Object.keys(timeLeft).length === 0) {
    return (
      <div className="flex items-center text-red-600">
        <AlertTriangle className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Due date passed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <div className="flex items-center">
        <span className="font-medium text-gray-900">{timeLeft.days}</span>
        <span className="ml-1">days</span>
      </div>
      <span>:</span>
      <div className="flex items-center">
        <span className="font-medium text-gray-900">{timeLeft.hours}</span>
        <span className="ml-1">hrs</span>
      </div>
      <span>:</span>
      <div className="flex items-center">
        <span className="font-medium text-gray-900">{timeLeft.minutes}</span>
        <span className="ml-1">min</span>
      </div>
    </div>
  );
};

const ProjectDetails = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [completionDate, setCompletionDate] = useState(
    new Date(project.completionDate).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    setCompletionDate(new Date(project.completionDate).toISOString().split('T')[0]);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    // Validate date
    const selectedDate = new Date(completionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Completion date cannot be in the past');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put('/projects/update', {
        id: project._id,
        completionDate: completionDate
      });
      
      toast.success('Project details updated successfully');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update project details');
      console.error('Update error:', error);
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

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
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
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>

        {/* Due Date with Countdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Due Date</span>
            {isEditing ? (
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="block w-36 rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
                disabled={isSubmitting}
              />
            ) : (
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {new Date(project.completionDate).toLocaleDateString()}
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Time Remaining</div>
              <CountdownTimer targetDate={project.completionDate} />
            </div>
          )}
        </div>

        {/* Other Project Stats */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {project.assigned_to?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Files</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {project.files?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status Changes</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {project.statusHistory?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Days Active</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {Math.ceil((new Date() - new Date(project.dateCreated)) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
'use client';
import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, UserCircle, Search } from 'lucide-react';
import api from '@/api';
import toast from 'react-hot-toast';

const ProjectTeam = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLead, setSelectedLead] = useState(project.leadId?._id || '');
  const [selectedMembers, setSelectedMembers] = useState(
    project.assigned_to?.map(member => member._id) || []
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchUsersAndLeads();
    }
  }, [isEditing]);

  const fetchUsersAndLeads = async () => {
    // Fetch users
    setIsLoadingUsers(true);
    try {
      const usersResponse = await api.get('/users');
      const usersData = usersResponse.data.users || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }

    // Fetch leads
    setIsLoadingLeads(true);
    try {
      const leadsResponse = await api.get('/leads/all');
      setLeads(leadsResponse.data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Error fetching leads');
      setLeads([]);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleCancel = () => {
    setSelectedLead(project.leadId?._id || '');
    setSelectedMembers(project.assigned_to?.map(member => member._id) || []);
    setSearchQuery('');
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!selectedLead) {
      toast.error('Please select a project lead');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put('/projects/update', {
        id: project._id,
        leadId: selectedLead,
        assigned_to: selectedMembers
      });
      
      toast.success('Team updated successfully');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Project Team</h2>
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
        {/* Project Lead */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Lead
          </label>
          {isEditing ? (
            <select
              value={selectedLead}
              onChange={(e) => setSelectedLead(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting || isLoadingLeads}
            >
              <option value="">Select Lead</option>
              {leads.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center">
              <UserCircle className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-900">
                {project.leadId?.name || 'No lead assigned'}
              </span>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members
          </label>
          
          {isEditing ? (
            <>
              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {isLoadingUsers ? (
                  <div className="text-center py-4">
                    <span className="text-sm text-gray-500">Loading users...</span>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center">
                        <UserCircle className="w-5 h-5 text-gray-400 mr-2" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user._id)}
                        onChange={() => toggleMember(user._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isSubmitting}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <span className="text-sm text-gray-500">
                      {searchQuery ? 'No users found' : 'No users available'}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {project.assigned_to && project.assigned_to.length > 0 ? (
                project.assigned_to.map((member) => (
                  <div key={member._id} className="flex items-center">
                    <UserCircle className="w-5 h-5 text-gray-400 mr-2" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {member.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {member.email}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No team members assigned</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTeam;
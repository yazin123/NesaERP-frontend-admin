import React, { useState, useEffect } from 'react';
import { XIcon, MailIcon, PhoneIcon, BuildingIcon, TagIcon, CalendarIcon, MapPinIcon } from 'lucide-react';
import api from '@/api';

const LeadDetailModal = ({ isOpen, onClose, leadId }) => {
  const [leadDetails, setLeadDetails] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails();
      fetchFollowups();
    }
  }, [isOpen, leadId]);

  const fetchLeadDetails = async () => {
    try {
      console.log("trying to fetch lead detail",leadId)
      const response = await api.get(`/leads/${leadId}`);
      setLeadDetails(response.data);
    } catch (error) {
      console.log('Error fetching lead details', error);
    }
  };

  const fetchFollowups = async () => {
    try {
      const response = await api.get(`/leads/${leadId}/followups`);
      setFollowups(response.data);
    } catch (error) {
      console.log('Error fetching followups', error);
    }
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      cold: 'bg-blue-100 text-blue-800',
      hot: 'bg-red-100 text-red-800',
      closed: 'bg-green-100 text-green-800',
      reopened: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  if (!isOpen || !leadDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{leadDetails.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {['details', 'followups', 'documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MailIcon className="mr-3 text-gray-500" size={20} />
                    <span>{leadDetails.email}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="mr-3 text-gray-500" size={20} />
                    <span>{leadDetails.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <TagIcon className="mr-3 text-gray-500" size={20} />
                    {renderStatusBadge(leadDetails.status)}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-3 text-gray-500" size={20} />
                    <span>
                      Created on {new Date(leadDetails.dateCreated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Company Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <BuildingIcon className="mr-3 text-gray-500" size={20} />
                    <span>{leadDetails.companyName || 'No Company'}</span>
                  </div>
                  {leadDetails.companyAddress && (
                    <div className="flex items-start">
                      <MapPinIcon  className="mr-3 text-gray-500 mt-1" size={20} />
                      <span>{leadDetails.companyAddress}</span>
                    </div>
                  )}
                  {leadDetails.companyMail && (
                    <div className="flex items-center">
                      <MailIcon className="mr-3 text-gray-500" size={20} />
                      <span>{leadDetails.companyMail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'followups' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Follow-ups</h3>
              {followups.length === 0 ? (
                <p className="text-gray-500">No follow-ups yet</p>
              ) : (
                <div className="space-y-3">
                  {followups.map(followup => (
                    <div 
                      key={followup._id} 
                      className="bg-gray-50 p-4 rounded-lg border"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{followup.notes}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(followup.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Created by: {followup.createdBy?.name || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                {leadDetails.photo && (
                  <div>
                    <h4 className="font-medium mb-2">Profile Photo</h4>
                    <img 
                      src={leadDetails.photo} 
                      alt="Profile" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                {leadDetails.companyPhoto && (
                  <div>
                    <h4 className="font-medium mb-2">Company Photo</h4>
                    <img 
                      src={leadDetails.companyPhoto} 
                      alt="Company" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
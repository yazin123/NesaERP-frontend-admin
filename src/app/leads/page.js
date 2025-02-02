'use client'
import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  BarChart2,
  Loader2,
  X
} from 'lucide-react';
import api from '@/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import LeadModal from '@/components/leads/LeadModal';
import LeadDetailModal from '@/components/leads/LeadDetailModal';
import LeadReportModal from '@/components/leads/LeadReportModal';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LeadCard from '@/components/leads/LeadCard';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  // New loading states for modals
  const [isCreateModalLoading, setIsCreateModalLoading] = useState(false);
  const [isDetailModalLoading, setIsDetailModalLoading] = useState(false);
  const [isUpdateModalLoading, setIsUpdateModalLoading] = useState(false);
  const [isReportModalLoading, setIsReportModalLoading] = useState(false);


  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage]);

  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/leads?page=${page}&limit=10`);
      setLeads(response.data.leads);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalLeads(response.data.totalLeads);
    } catch (error) {
      toast.error('Error fetching leads');
      console.log('Error fetching leads', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (leadData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(leadData).forEach(key => {
        if (leadData[key]) formData.append(key, leadData[key]);
      });

      if (leadData.photo) formData.append('photo', leadData.photo);
      if (leadData.companyPhoto) formData.append('companyPhoto', leadData.companyPhoto);

      await api.post('/leads', formData);
      fetchLeads(currentPage);
      setIsCreateModalOpen(false);
      toast.success('Lead Created');
    } catch (error) {
      toast.error('Lead Creation Failed');
      console.log('Error creating lead', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLead = async (leadId, leadData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(leadData).forEach(key => {
        if (leadData[key]) formData.append(key, leadData[key]);
      });

      if (leadData.photo) formData.append('photo', leadData.photo);
      if (leadData.companyPhoto) formData.append('companyPhoto', leadData.companyPhoto);

      await api.put(`/leads/${leadId}`, formData);
      fetchLeads(currentPage);
      setIsUpdateModalOpen(false);
      toast.success('Lead Updated');
    } catch (error) {
      toast.error('Update Failed');
      console.log('Error updating lead', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    setIsLoading(true);
    try {
      await api.delete(`/leads/${leadId}`);
      fetchLeads(currentPage);
      toast.success('Lead Deleted');
    } catch (error) {
      toast.error('Deletion Failed');
      console.log('Error deleting lead', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <ProtectedRoute>
      {(isLoading || 
        isCreateModalLoading || 
        isDetailModalLoading || 
        isUpdateModalLoading || 
        isReportModalLoading) && <LoadingSpinner />}
      <div className="flex h-screen">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            setIsSidebarOpen={setIsSidebarOpen}
            pageTitle="Lead Management"
          />
          <div className="p-4 md:p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Lead Management
                </h1>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Total Leads: {totalLeads}
                </span>
              </div>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center w-full md:w-auto"
                >
                  <PlusCircle className="mr-2" /> Create Lead
                </button>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center w-full md:w-auto"
                >
                  <BarChart2 className="mr-2" /> Generate Report
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Owner</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{lead.name}</td>
                      <td className="p-3">{lead.email}</td>
                      <td className="p-3">{lead.phone}</td>
                      <td className="p-3">
                        <span className={`
                          px-2 py-1 rounded-full text-xs
                          ${lead.status === 'cold' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'hot' ? 'bg-red-100 text-red-800' :
                            lead.status === 'closed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {lead.leadOwner?.name || 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsDetailModalOpen(true);
                              setIsDetailModalLoading(true);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsUpdateModalOpen(true);
                            }}
                            className="text-green-500 hover:text-green-700"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {leads.map(lead => (
                <LeadCard 
                  key={lead._id} 
                  lead={lead}
                  onView={() => {
                    setSelectedLead(lead);
                    setIsDetailModalOpen(true);
                  }}
                  onEdit={() => {
                    setSelectedLead(lead);
                    setIsUpdateModalOpen(true);
                  }}
                  onDelete={() => handleDeleteLead(lead._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
              <div className="text-gray-600 text-sm">
                Showing {leads.length} of {totalLeads} leads
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Modals */}
            {isCreateModalOpen && (
              <LeadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateLead}
                lead={null}
                isLoading={isCreateModalLoading}
              />
            )}

            {isDetailModalOpen && selectedLead && (
              <LeadDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {setIsDetailModalOpen(false); setIsDetailModalLoading(false)}}
                leadId={selectedLead._id}
                onLoad={() => setIsDetailModalLoading(false)}
              />
            )}

            {isUpdateModalOpen && selectedLead && (
              <LeadModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={(data) => handleUpdateLead(selectedLead._id, data)}
                lead={selectedLead}
                isLoading={isUpdateModalLoading}
              />
            )}

            {isReportModalOpen && (
              <LeadReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
               
                isLoading={isReportModalLoading}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LeadManagement;
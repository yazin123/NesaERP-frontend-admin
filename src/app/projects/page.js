'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, Filter } from 'lucide-react';
import api from '@/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import FilterModal from '@/components/projects/FilterModal';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProjectManagement = () => {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage, filters]);

  const fetchProjects = async (page = 1) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...filters
      });
      const response = await api.get(`/projects?${queryParams}`);
      setProjects(response.data.projects);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error fetching projects');
    } finally {
      setIsLoading(false);
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
    <ProtectedRoute>
      {isLoading && <LoadingSpinner />}
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar pageTitle="Projects" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Filter className="w-5 h-5 mr-2" /> Filters
                  </button>
                  <button
                    onClick={() => router.push('/projects/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" /> New Project
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                  <div
                    key={project._id}
                    onClick={() => router.push(`/projects/${project._id}`)}
                    className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{project.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        <p className="truncate">Lead: {project.leadId?.name || 'N/A'}</p>
                        <p className="mt-1">Owner: {project.projectOwner?.name || 'N/A'}</p>
                        <p className="mt-1">Due: {new Date(project.completionDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3">
                      <div className="text-xs text-gray-500">
                        Created {new Date(project.dateCreated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {isFilterModalOpen && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onApplyFilters={setFilters}
        />
      )}
    </ProtectedRoute>
  );
};

export default ProjectManagement;
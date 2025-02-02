'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import api from '@/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Import components
import ProjectHeader from '@/components/projects/detail/ProjectHeader';
import ProjectDetails from '@/components/projects/detail/ProjectDetails';
import ProjectDescription from '@/components/projects/detail/ProjectDescription';
import ProjectStatus from '@/components/projects/detail/ProjectStatus';
import ProjectTeam from '@/components/projects/detail/ProjectTeam';
import ProjectFiles from '@/components/projects/detail/ProjectFiles';

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      toast.error('Error fetching project details');
      router.push('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted successfully');
        router.push('/projects');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!project) return null;

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar pageTitle="Project Details" />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <ProjectHeader 
                project={project}
                onBack={() => router.back()}
                onDelete={handleDelete}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <ProjectDescription 
                    project={project}
                    onUpdate={fetchProject}
                  />
                  <ProjectStatus 
                    project={project}
                    onUpdate={fetchProject}
                  />
                  <ProjectFiles 
                    project={project}
                    onUpdate={fetchProject}
                  />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <ProjectDetails 
                    project={project}
                    onUpdate={fetchProject}
                  />
                  <ProjectTeam 
                    project={project}
                    onUpdate={fetchProject}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectOverview } from '@/components/project/details/ProjectOverview';
import { ProjectTasks } from '@/components/project/details/ProjectTasks';
import { ProjectTeam } from '@/components/project/details/ProjectTeam';
import { ProjectReports } from '@/components/project/details/ProjectReports';
import { ProjectDocuments } from '@/components/project/details/ProjectDocuments';
import { ProjectPipeline } from '@/components/project/details/ProjectPipeline';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchProjectDetails();
    }
  }, [params.id]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.admin.getProjectById(params.id);
      
      if (response?.data?.data) {
        setProject(response.data.data);
      } else {
        throw new Error('Project not found');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to fetch project details');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch project details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-lg text-muted-foreground">{error || 'Project not found'}</p>
        <Button onClick={() => router.push('/projects')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/projects" className="text-sm text-muted-foreground hover:underline">
            <ArrowLeft className="inline-block mr-2 h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold mt-2">{project.name}</h1>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview project={project} onUpdate={fetchProjectDetails} />
        </TabsContent>

        <TabsContent value="pipeline">
          <ProjectPipeline projectId={params.id} pipeline={project.pipeline} onPipelineUpdate={fetchProjectDetails} />
        </TabsContent>

        <TabsContent value="tasks">
          <ProjectTasks projectId={params.id} />
        </TabsContent>

        <TabsContent value="team">
          <ProjectTeam projectId={params.id} onUpdate={fetchProjectDetails} />
        </TabsContent>

        <TabsContent value="reports">
          <ProjectReports projectId={params.id} />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocuments projectId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
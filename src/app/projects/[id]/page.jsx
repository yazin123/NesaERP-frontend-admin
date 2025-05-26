'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import  api  from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectOverview } from '@/components/project/details/ProjectOverview';
import { ProjectTasks } from '@/components/project/details/ProjectTasks';
import { ProjectTeam } from '@/components/project/details/ProjectTeam';
import { ProjectTimeline } from '@/components/project/details/ProjectTimeline';
import { ProjectDocuments } from '@/components/project/details/ProjectDocuments';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProjectById(id);
      setProject(data);
      setIsSubscribed(data.isSubscribed);
      setError(null);
    } catch (err) {
      setError('Failed to fetch project details');
      toast({
        title: 'Error',
        description: 'Failed to fetch project details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      if (isSubscribed) {
        await api.unsubscribeFromProject(id);
        setIsSubscribed(false);
        toast({
          title: 'Notifications Disabled',
          description: 'You will no longer receive notifications for this project.',
        });
      } else {
        await api.subscribeToProject(id);
        setIsSubscribed(true);
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive notifications for this project.',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchProjectDetails}>Retry</Button>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Link href="/project">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{project.name}</h1>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <Button
          variant="outline"
          onClick={toggleNotifications}
          className="flex items-center gap-2"
        >
          {isSubscribed ? (
            <>
              <BellOff className="h-4 w-4" />
              Disable Notifications
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              Enable Notifications
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectOverview project={project} onUpdate={fetchProjectDetails} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <ProjectTasks projectId={id} />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <ProjectTeam projectId={id} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <ProjectTimeline projectId={id} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <ProjectDocuments projectId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
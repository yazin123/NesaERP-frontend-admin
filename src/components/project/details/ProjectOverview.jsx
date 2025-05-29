'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Phone,
} from 'lucide-react';

export function ProjectOverview({ project }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on-progress': return 'bg-yellow-100 text-yellow-800';
      case 'stopped': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'created': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'active': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'on-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'stopped': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'created': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(project.expectedEndDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getPhaseProgress = () => {
    if (!project.pipeline) return { phases: [], totalProgress: 0 };
    
    const phases = [];
    let totalPhases = 0;
    let completedPhases = 0;

    // Add fixed stages
    ['requirementGathering', 'architectCreation', 'architectSubmission'].forEach(stage => {
      totalPhases++;
      if (project.pipeline[stage]?.status === 'completed') completedPhases++;
      phases.push({
        name: stage.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        status: project.pipeline[stage]?.status || 'pending'
      });
    });

    // Add development phases
    if (project.pipeline.developmentPhases) {
      project.pipeline.developmentPhases.forEach(phase => {
        totalPhases++;
        if (phase.status === 'completed') completedPhases++;
        phases.push({
          name: phase.phaseName,
          status: phase.status
        });
      });
    }

    return {
      phases,
      totalProgress: totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0
    };
  };

  const daysRemaining = calculateDaysRemaining();
  const { phases, totalProgress } = getPhaseProgress();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Project Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Project Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(project.status)}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Priority</span>
              <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Team Members</span>
              </div>
              <span className="text-sm font-medium">{project.members?.length || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Days Remaining</span>
              </div>
              <span className="text-sm font-medium">{calculateDaysRemaining()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Head */}
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={project.projectHead?.photo} />
              <AvatarFallback>
                {project.projectHead?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Project Head</p>
              <p className="text-sm text-muted-foreground">{project.projectHead?.name}</p>
              <p className="text-sm text-muted-foreground">{project.projectHead?.email}</p>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Start Date: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Expected End Date: {new Date(project.expectedEndDate).toLocaleDateString()}</span>
                </div>
                {project.actualEndDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Actual End Date: {new Date(project.actualEndDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
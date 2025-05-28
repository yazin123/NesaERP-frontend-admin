'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { ProjectPipeline } from './details/ProjectPipeline';

export function ProjectOverview({ project, onUpdate }) {
  const calculateDaysRemaining = () => {
    if (!project.endDate) return null;
    const end = new Date(project.endDate);
    const today = new Date();
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const handlePipelineUpdate = async () => {
    try {
      const response = await api.admin.getProject(project._id);
      if (response?.data?.success) {
        onUpdate(response.data.data);
      }
    } catch (error) {
      console.error('Error updating pipeline:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Timeline</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Team Size</div>
                  <div className="text-sm text-muted-foreground">
                    {project.members?.length || 0} members
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Days Remaining</div>
                  <div className="text-sm text-muted-foreground">
                    {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Phase Progress</h4>
              {phases.map((phase, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{phase.name}</span>
                    <Badge className={getStatusColor(phase.status)}>
                      {phase.status}
                    </Badge>
                  </div>
                  <Progress value={phase.progress} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <ProjectPipeline
        projectId={project._id}
        pipeline={project.pipeline}
        onPipelineUpdate={handlePipelineUpdate}
      />
    </div>
  );
} 
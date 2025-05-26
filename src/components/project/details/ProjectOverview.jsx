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
  ChevronRight,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function ProjectOverview({ project, onUpdate }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const calculateProgress = () => {
    const completedPhases = project.pipeline.phases.filter(phase => phase.status === 'completed').length;
    return Math.round((completedPhases / project.pipeline.phases.length) * 100);
  };

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
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Team Members</span>
              </div>
              <span className="text-sm font-medium">{project.members.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Completed Phases</span>
              </div>
              <span className="text-sm font-medium">
                {project.pipeline.phases.filter(phase => phase.status === 'completed').length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Days Remaining</span>
              </div>
              <span className="text-sm font-medium">
                {Math.ceil((new Date(project.dates[project.dates.length - 1].date) - new Date()) / (1000 * 60 * 60 * 24))}
              </span>
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
              <AvatarImage src={project.projectHead.avatar} />
              <AvatarFallback>{project.projectHead.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Project Head</p>
              <p className="text-sm text-muted-foreground">{project.projectHead.name}</p>
            </div>
          </div>

          {/* Point of Contact */}
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Point of Contact
            </p>
            <div className="grid gap-2">
              {project.contacts.map((contact, index) => (
                <div key={index} className="text-sm flex items-center justify-between">
                  <span>{contact.name}</span>
                  <span className="text-muted-foreground">{contact.phone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Dates */}
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Important Dates
            </p>
            <div className="grid gap-2">
              {project.dates.map((date, index) => (
                <div key={index} className="text-sm flex items-center justify-between">
                  <span>{date.name}</span>
                  <span className="text-muted-foreground">
                    {new Date(date.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary">{tech}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Progress */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="fixed-phases">
              <AccordionTrigger>Fixed Phases</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {project.pipeline.phases.slice(0, 3).map((phase, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {getStatusIcon(phase.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{phase.name}</p>
                        {phase.status === 'completed' && (
                          <p className="text-xs text-muted-foreground">
                            Completed on {new Date(phase.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(phase.status)}>
                        {phase.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="development-phases">
              <AccordionTrigger>Development Phases</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {project.pipeline.phases.slice(3).map((phase, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {getStatusIcon(phase.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{phase.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(phase.startDate).toLocaleDateString()} - 
                          {new Date(phase.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={getStatusColor(phase.status)}>
                        {phase.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
} 
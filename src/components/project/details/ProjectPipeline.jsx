'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export function ProjectPipeline({ projectId, pipeline, onPipelineUpdate }) {
  const [isAddPhaseOpen, setIsAddPhaseOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPhase, setNewPhase] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  const { toast } = useToast();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (stage, newStatus) => {
    try {
      setLoading(true);
      await api.admin.updateProjectPipeline(projectId, {
        stage,
        status: newStatus
      });
      
      onPipelineUpdate();
      toast({
        title: 'Success',
        description: 'Pipeline status updated successfully'
      });
    } catch (error) {
      console.error('Error updating pipeline status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update pipeline status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhase = async (e) => {
    e.preventDefault();
    if (!newPhase.name || !newPhase.startDate || !newPhase.endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      await api.admin.updateProjectPipeline(projectId, {
        stage: 'developmentPhase',
        phaseName: newPhase.name,
        status: 'pending',
        startDate: newPhase.startDate,
        endDate: newPhase.endDate
      });

      setNewPhase({ name: '', startDate: '', endDate: '' });
      setIsAddPhaseOpen(false);
      onPipelineUpdate();
      toast({
        title: 'Success',
        description: 'Development phase added successfully'
      });
    } catch (error) {
      console.error('Error adding development phase:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add development phase',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Project Pipeline</CardTitle>
        <Button onClick={() => setIsAddPhaseOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Phase
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Fixed Stages */}
          <div className="space-y-4">
            {['requirementGathering', 'architectCreation', 'architectSubmission'].map((stage) => (
              <div key={stage} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(pipeline?.[stage]?.status || 'pending')}
                  <div>
                    <h4 className="font-semibold">
                      {stage.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h4>
                    <Badge variant="secondary" className={getStatusColor(pipeline?.[stage]?.status || 'pending')}>
                      {pipeline?.[stage]?.status || 'pending'}
                    </Badge>
                  </div>
                </div>
                <Select
                  value={pipeline?.[stage]?.status || 'pending'}
                  onValueChange={(value) => handleStatusChange(stage, value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Development Phases */}
          {pipeline?.developmentPhases?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Development Phases</h3>
              {pipeline.developmentPhases.map((phase, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(phase.status)}
                    <div>
                      <h4 className="font-semibold">{phase.phaseName}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{new Date(phase.startDate).toLocaleDateString()}</span>
                        <span>→</span>
                        <span>{new Date(phase.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Select
                    value={phase.status}
                    onValueChange={(value) => handleStatusChange(`developmentPhase-${index}`, value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Phase Dialog */}
        <Dialog open={isAddPhaseOpen} onOpenChange={setIsAddPhaseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Development Phase</DialogTitle>
              <DialogDescription>
                Add a new phase to the project development pipeline.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPhase} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phase Name</label>
                <Input
                  value={newPhase.name}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter phase name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newPhase.startDate}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={newPhase.endDate}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddPhaseOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Phase'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MinusCircle } from 'lucide-react';
import api from '@/api';

export default function DailyReportsPage() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([{ projectId: null, content: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.getMyProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch projects',
        variant: 'destructive'
      });
    }
  };

  const handleAddReport = () => {
    setReports([...reports, { projectId: null, content: '' }]);
  };

  const handleRemoveReport = (index) => {
    const newReports = reports.filter((_, i) => i !== index);
    setReports(newReports);
  };

  const handleReportChange = (index, field, value) => {
    const newReports = [...reports];
    newReports[index] = { ...newReports[index], [field]: value };
    setReports(newReports);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate reports
    if (reports.some(report => !report.content.trim())) {
      toast({
        title: 'Error',
        description: 'Please fill in all report contents',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      // Filter out null projectIds before submitting
      const reportsToSubmit = reports.map(report => ({
        ...report,
        projectId: report.projectId || undefined
      }));
      await api.submitDailyReports({ reports: reportsToSubmit });
      
      toast({
        title: 'Success',
        description: 'Daily reports submitted successfully'
      });

      // Reset form
      setReports([{ projectId: null, content: '' }]);
    } catch (error) {
      console.error('Error submitting reports:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit reports',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Daily Reports</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {reports.map((report, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Report {index + 1}</CardTitle>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveReport(index)}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project (Optional)</label>
                <Select
                  value={report.projectId || "no-project"}
                  onValueChange={(value) => handleReportChange(index, 'projectId', value === "no-project" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-project">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Report Content</label>
                <Textarea
                  required
                  value={report.content}
                  onChange={(e) => handleReportChange(index, 'content', e.target.value)}
                  placeholder="What did you work on today?"
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddReport}
            disabled={isLoading}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Another Report
          </Button>
          <Button type="submit" disabled={isLoading}>
            Submit Reports
          </Button>
        </div>
      </form>
    </div>
  );
} 
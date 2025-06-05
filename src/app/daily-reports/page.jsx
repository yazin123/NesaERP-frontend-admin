'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reportsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function DailyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    tasks: '',
    hours: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getDailyReports({
        startDate: selectedDate,
        endDate: selectedDate
      });
      if (response.data) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch reports. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportsApi.submitDailyReport(newReport);
      toast({
        title: 'Success',
        description: 'Report submitted successfully',
      });
      setNewReport({ tasks: '', hours: '' });
      setIsDialogOpen(false);
      fetchReports();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Reports</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Daily Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tasks">Tasks Completed</Label>
                <Textarea
                  id="tasks"
                  value={newReport.tasks}
                  onChange={(e) => setNewReport({ ...newReport, tasks: e.target.value })}
                  placeholder="List your completed tasks..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Hours Worked</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={newReport.hours}
                  onChange={(e) => setNewReport({ ...newReport, hours: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report._id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{report.hours} hours</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Tasks Completed:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {report.tasks}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
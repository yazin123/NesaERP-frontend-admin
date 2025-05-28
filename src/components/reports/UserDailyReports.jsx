'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export function UserDailyReports({ userId }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [date, setDate] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [userId, date]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDailyReports({
        userId,
        startDate: format(date, 'yyyy-MM-dd'),
        endDate: format(date, 'yyyy-MM-dd')
      });
      setReports(response.data.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch reports',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedReport || !editContent.trim()) return;

    try {
      const response = await api.updateDailyReport(selectedReport._id, {
        content: editContent.trim()
      });
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Report updated successfully'
        });
        setSelectedReport(null);
        setEditContent('');
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update report',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (reportId) => {
    try {
      const response = await api.deleteDailyReport(reportId);
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Report deleted successfully'
        });
        fetchReports();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete report',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-gray-100" />
            <CardContent className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daily Reports</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {format(date, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        {reports?.map((report) => (
          <Card key={report._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(report.date), 'PPP')}
                  </p>
                  {report.project && (
                    <p className="text-sm font-medium">
                      Project: {report.project.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setEditContent(report.content);
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Report</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={5}
                          className="resize-none"
                        />
                        <Button onClick={handleEdit}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(report._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.content}</p>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No reports found for this date.
          </div>
        )}
      </div>
    </div>
  );
} 
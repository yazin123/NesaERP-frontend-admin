'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import api from '@/api';
import { useToast } from '@/hooks/use-toast';

export function ProjectReports({ projectId }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [projectId]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDailyReports({ projectId });
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
      </div>

      <div className="space-y-4">
        {reports?.map((report) => (
          <Card key={report._id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={report.user?.photo} />
                  <AvatarFallback>{report.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{report.user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(report.date), 'PPP')}
                  </p>
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
            No reports found for this project.
          </div>
        )}
      </div>
    </div>
  );
} 
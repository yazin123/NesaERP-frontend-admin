import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  FileSpreadsheet,
  FilePdf,
  Calendar,
  Users,
  Activity,
  DollarSign
} from 'lucide-react';
import { reportsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getReports(filters);
      if (response.data) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reports. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, format) => {
    try {
      const response = await reportsApi.downloadReport(reportId, format);
      // Handle the download response based on your API implementation
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to download report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      setLoading(true);
      const response = await reportsApi.generateReport({
        type,
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Report generated successfully',
        });
        fetchReports();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getReportIcon = (type) => {
    const icons = {
      employee: Users,
      project: Activity,
      financial: DollarSign,
      attendance: Calendar
    };
    return icons[type] || Activity;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reports</CardTitle>
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-40"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-40"
          />
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="employee">Employee Reports</SelectItem>
              <SelectItem value="project">Project Reports</SelectItem>
              <SelectItem value="financial">Financial Reports</SelectItem>
              <SelectItem value="attendance">Attendance Reports</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleGenerateReport('employee')}
            >
              <Users className="h-8 w-8" />
              <span>Generate Employee Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleGenerateReport('project')}
            >
              <Activity className="h-8 w-8" />
              <span>Generate Project Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleGenerateReport('financial')}
            >
              <DollarSign className="h-8 w-8" />
              <span>Generate Financial Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleGenerateReport('attendance')}
            >
              <Calendar className="h-8 w-8" />
              <span>Generate Attendance Report</span>
            </Button>
          </div>

          <div className="divide-y">
            {reports.map((report) => {
              const ReportIcon = getReportIcon(report.type);
              return (
                <div
                  key={report._id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <ReportIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Generated on {format(new Date(report.generatedAt), 'PPP')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{report.type}</Badge>
                        <Badge variant="outline">
                          {format(new Date(report.startDate), 'PP')} - {format(new Date(report.endDate), 'PP')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(report._id, 'xlsx')}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(report._id, 'pdf')}
                    >
                      <FilePdf className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(report._id, 'csv')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {reports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No reports found.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
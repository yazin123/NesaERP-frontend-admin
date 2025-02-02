import React, { useState, useEffect } from 'react';
import { XIcon, DownloadIcon, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '@/api';
import toast from 'react-hot-toast';

const LeadReportModal = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAllLeads();
    }
  }, [isOpen]);

  const fetchAllLeads = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/leads/all');
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to fetch leads for report');
      console.log('Error fetching leads', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = () => {
    const reportData = leads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Status: lead.status,
      CompanyName: lead.companyName,
      LeadOwner: lead.leadOwner?.name || 'N/A',
      CreatedAt: new Date(lead.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Report');
    XLSX.writeFile(workbook, 'LeadsReport.xlsx');
  };

  const getStatusSummary = () => {
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / leads.length) * 100).toFixed(2)
    }));
  };

  if (!isOpen) return null;

  const statusSummary = getStatusSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Lead Management Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="animate-spin mr-2" />
            <span>Loading leads report...</span>
          </div>
        ) : (
          <div className="p-6">
            {/* Overall Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-600">Total Leads</h3>
                <p className="text-2xl font-bold text-blue-600">{leads.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-600">New Leads This Month</h3>
                <p className="text-2xl font-bold text-green-600">
                  {leads.filter(lead => 
                    new Date(lead.createdAt) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  ).length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-600">Hot Leads</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {leads.filter(lead => lead.status === 'hot').length}
                </p>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Lead Status Distribution</h3>
              <div className="space-y-2">
                {statusSummary.map(({ status, count, percentage }) => (
                  <div key={status} className="flex items-center">
                    <div className="w-1/3">
                      <span className={`
                        px-2 py-1 rounded-full text-xs capitalize
                        ${status === 'cold' ? 'bg-blue-100 text-blue-800' : 
                          status === 'hot' ? 'bg-red-100 text-red-800' : 
                          status === 'closed' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {status}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`h-2.5 rounded-full
                          ${status === 'cold' ? 'bg-blue-600' : 
                            status === 'hot' ? 'bg-red-600' : 
                            status === 'closed' ? 'bg-green-600' : 
                            'bg-gray-600'}
                        `}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-1/6 text-right text-sm text-gray-600">
                      {count} ({percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={generateReport}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <DownloadIcon className="mr-2" /> Export Report
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadReportModal;
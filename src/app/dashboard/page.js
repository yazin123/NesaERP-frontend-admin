'use client'
import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import api from '@/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Mobile Card for Summary Stats
const SummaryStatsCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow-md p-4 text-center md:hidden">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

// Mobile Card for Latest Leads
const LatestLeadCard = ({ lead }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4 md:hidden">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold">{lead.name}</h3>
      <span className={`
        px-2 py-1 rounded-full text-xs
        ${lead.status === 'New' ? 'bg-green-100 text-green-800' : 
          lead.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
          'bg-gray-100 text-gray-800'}
      `}>
        {lead.status}
      </span>
    </div>
    <div className="text-sm text-gray-600">
      <p>Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
      <p>Owner: {lead.leadOwner?.name || 'Unassigned'}</p>
    </div>
  </div>
);

export default function LeadOwnerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leadsData, setLeadsData] = useState({
    statusDistribution: [],
    latestLeads: [],
    staffRoleDistribution: []
  });
  const [summaryStats, setSummaryStats] = useState({
    totalLeads: 0,
    totalStaff: 0,
    newLeadsThisMonth: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch leads status distribution
      const leadsResponse = await api.get('/leads/dashboard');
      const leads = leadsResponse.data;

      // Fetch users for role distribution
      const usersResponse = await api.get('/users');
      const users = usersResponse.data.users;

      // Prepare leads status distribution
      const statusCounts = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});

      const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ 
        name, 
        value 
      }));

      // Prepare staff role distribution
      const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      const staffRoleDistribution = Object.entries(roleCounts).map(([name, value]) => ({ 
        name, 
        value 
      }));

      // Latest 5 leads
      const latestLeads = leads
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setLeadsData({
        statusDistribution,
        latestLeads,
        staffRoleDistribution
      });

      setSummaryStats({
        totalLeads: leads.length,
        totalStaff: users.length,
        newLeadsThisMonth: leads.filter(lead => 
          new Date(lead.createdAt) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        ).length
      });
    } catch (error) {
      console.log('Error fetching dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Color palette
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderPieChart = (data, title) => (
    <div className="bg-white rounded-lg shadow-md p-4 h-80">
      <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <ProtectedRoute>
      {isLoading && <LoadingSpinner />}
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <Navbar setIsSidebarOpen={setIsSidebarOpen} pageTitle="Lead Owner Dashboard" />

          {/* Dashboard Content */}
          <main className="p-4 md:p-6 overflow-y-auto">
            {/* Mobile Summary Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:hidden">
              <SummaryStatsCard 
                title="Total Leads" 
                value={summaryStats.totalLeads} 
              />
              <SummaryStatsCard 
                title="Total Staff" 
                value={summaryStats.totalStaff} 
              />
              <SummaryStatsCard 
                title="New Leads This Month" 
                value={summaryStats.newLeadsThisMonth} 
              />
            </div>

            {/* Desktop Summary Cards */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="text-gray-500">Total Leads</h3>
                <p className="text-2xl font-bold">{summaryStats.totalLeads}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="text-gray-500">Total Staff</h3>
                <p className="text-2xl font-bold">{summaryStats.totalStaff}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="text-gray-500">New Leads This Month</h3>
                <p className="text-2xl font-bold">{summaryStats.newLeadsThisMonth}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderPieChart(leadsData.statusDistribution, 'Lead Status Distribution')}
              {renderPieChart(leadsData.staffRoleDistribution, 'Staff Role Distribution')}
            </div>

            {/* Desktop Latest Leads */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-4 hidden md:block">
              <h2 className="text-lg font-semibold mb-4">Latest Leads</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Created At</th>
                      <th className="p-2 text-left">Lead Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsData.latestLeads.map((lead, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{lead.name}</td>
                        <td className="p-2">
                          <span className={`
                            px-2 py-1 rounded-full text-xs
                            ${lead.status === 'New' ? 'bg-green-100 text-green-800' : 
                              lead.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-2">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td className="p-2">{lead.leadOwner?.name || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Latest Leads */}
            <div className="mt-6 md:hidden">
              <h2 className="text-lg font-semibold mb-4">Latest Leads</h2>
              {leadsData.latestLeads.map((lead, index) => (
                <LatestLeadCard key={index} lead={lead} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
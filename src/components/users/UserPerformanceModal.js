import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Calendar,
  Loader2,
  X,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';
import api from '@/api';
import toast from 'react-hot-toast';

const UserPerformanceModal = ({ isOpen, onClose, userId }) => {
  const [performances, setPerformances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const categoryColors = {
    task_completed: 'bg-green-100 text-green-800',
    task_not_completed: 'bg-red-100 text-red-800',
    leave: 'bg-yellow-100 text-yellow-800',
    present: 'bg-blue-100 text-blue-800',
    half_day: 'bg-orange-100 text-orange-800',
    full_day: 'bg-purple-100 text-purple-800',
    overtime: 'bg-indigo-100 text-indigo-800'
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
      fetchPerformanceData();
    }
  }, [isOpen, userId, filters]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data.user);
    } catch (error) {
      toast.error('Failed to fetch user data');
      console.log('Error fetching user data:', error);
    }
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/performance/performance-summary`, {
        params: {
          userId: userId,
          month: filters.month,
          year: filters.year
        }
      });
      if (response.data.success) {
        setPerformances(response.data.data);
        setStats(response.data.stats);
      } else {
        toast.error('Failed to fetch performance data');
      }
    } catch (error) {
      toast.error('Error loading performance data');
      console.log('Failed to fetch performance data:', error);
      setPerformances([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Performance Overview</h2>
            {userData && (
              <p className="text-gray-600 mt-1">
                {userData.name} - {userData.department.toUpperCase()} Department
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <select
              value={filters.month}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                month: parseInt(e.target.value)
              }))}
              className="border rounded-md p-2"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                year: parseInt(e.target.value)
              }))}
              className="border rounded-md p-2"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="text-blue-500 mr-2" />
                    <h3 className="font-semibold">Total Points</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {stats.totalPoints?.toFixed(1) || '0.0'}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Award className="text-green-500 mr-2" />
                    <h3 className="font-semibold">Average Points</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {stats.avgPoints?.toFixed(1) || '0.0'}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Star className="text-purple-500 mr-2" />
                    <h3 className="font-semibold">Performance Level</h3>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {stats.avgPoints >= 8 ? 'Excellent' :
                     stats.avgPoints >= 6 ? 'Good' :
                     stats.avgPoints >= 4 ? 'Average' : 'Needs Improvement'}
                  </p>
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.categoryBreakdown).map(([category, data]) => (
                    <div key={category} className={`p-3 rounded-lg ${categoryColors[category]} bg-opacity-20`}>
                      <p className="font-medium">{category.replace('_', ' ')}</p>
                      <p className="text-sm">Count: {data.count}</p>
                      <p className="text-sm">Points: {data.points.toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Points</th>
                    <th className="p-3 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {performances.map((perf) => (
                    <tr key={perf._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(perf.createdDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${categoryColors[perf.category]}`}>
                          {perf.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">{perf.points}</td>
                      <td className="p-3">{perf.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {performances.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No performance data available for the selected period
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPerformanceModal;
//src/app/users/page.js
'use client'
import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  BarChart2,
  Loader2,
  Users,
  X
} from 'lucide-react';
import { 

  Calendar,

  TrendingUp,
  Award,
  Star
} from 'lucide-react';
import api from '@/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import toast from 'react-hot-toast';
import UserPerformanceModal from '@/components/users/UserPerformanceModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';


const UserModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user = null, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    userId: user?.userId || '',
    phoneNumber: user?.phoneNumber || '',
    department: user?.department || 'web',
    position: user?.position || 'jnr',
    role: user?.role || 'staff',
    salary: user?.salary || '',
    bankDetails: user?.bankDetails || '',
    password: ''
  });

  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'photo') setPhoto(files[0]);
    if (name === 'resume') setResume(files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = { ...formData, photo, resume };
    onSubmit(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {user ? 'Update User' : 'Create User'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              >
                {['dm', 'creative', 'web', 'seo', 'hr', 'sales', 'delivery', 'accounting'].map(dept => (
                  <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              >
                {['snr', 'jnr', 'dept lead', 'intern'].map(pos => (
                  <option key={pos} value={pos}>{pos.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              >
                {['staff', 'team lead', 'admin'].map(role => (
                  <option key={role} value={role}>{role.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Details</label>
            <input
              type="text"
              name="bankDetails"
              value={formData.bankDetails}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              required
            />
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                required
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Photo</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Resume</label>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



const UserCard = ({ user, onView, onEdit, onDelete, onPerformance }) => (
  <div className="bg-white shadow-md rounded-lg p-4 mb-4 block md:hidden">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <span className={`
        px-2 py-1 rounded-full text-xs
        ${user.status === 'active' ? 'bg-green-100 text-green-800' :
        user.status === 'inactive' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'}
      `}>
        {user.status}
      </span>
    </div>
    <div className="text-sm text-gray-600 mb-2">
      <p>{user.email}</p>
      <p>{user.phoneNumber}</p>
      <p>{user.department} | {user.position}</p>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        <button onClick={() => onView(user)} className="text-blue-500 hover:text-blue-700">
          <Eye size={20} />
        </button>
        <button onClick={() => onEdit(user)} className="text-green-500 hover:text-green-700">
          <Edit2 size={20} />
        </button>
        <button onClick={() => onDelete(user._id)} className="text-red-500 hover:text-red-700">
          <Trash2 size={20} />
        </button>
        <button onClick={() => onPerformance(user._id)} className="text-purple-500 hover:text-purple-700">
          <BarChart2 size={20} />
        </button>
      </div>
    </div>
  </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Modal states
// (Previous code remains the same)
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
const [selectedPerformanceUserId, setSelectedPerformanceUserId] = useState(null);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  fetchUsers(currentPage);
}, [currentPage]);

const fetchUsers = async (page = 1) => {
  setIsLoading(true);
  try {
    const response = await api.get(`/users?page=${page}&limit=10`);
    setUsers(response.data.users);
    setCurrentPage(response.data.currentPage);
    setTotalPages(response.data.totalPages);
    setTotalUsers(response.data.total);
  } catch (error) {
    toast.error('Error fetching users',error);
    console.log('Error fetching users', error);
  } finally {
    setIsLoading(false);
  }
};

const handleCreateUser = async (userData) => {
  setIsLoading(true);
  try {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key]) formData.append(key, userData[key]);
    });

    await api.post('/users', formData);
    
    fetchUsers(currentPage);
    setIsCreateModalOpen(false);
    toast.success('User Created Successfully');
  } catch (error) {
    toast.error('User Creation Failed');
    console.log('Error creating user', error);
  } finally {
    setIsLoading(false);
  }
};

const handleUpdateUser = async (userId, userData) => {
  setIsLoading(true);
  try {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key]) formData.append(key, userData[key]);
    });

    await api.put(`/users/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    fetchUsers(currentPage);
    setIsUpdateModalOpen(false);
    toast.success('User Updated Successfully');
  } catch (error) {
    toast.error('User Update Failed');
    console.log('Error updating user', error);
  } finally {
    setIsLoading(false);
  }
};

const handleDeleteUser = async (userId) => {
  if (!window.confirm('Are you sure you want to delete this user?')) return;

  setIsLoading(true);
  try {
    await api.delete(`/users/${userId}`);
    fetchUsers(currentPage);
    toast.success('User Deleted Successfully');
  } catch (error) {
    toast.error('User Deletion Failed');
    console.log('Error deleting user', error);
  } finally {
    setIsLoading(false);
  }
};

const handleViewPerformance = (userId) => {
  setSelectedPerformanceUserId(userId);
  setIsPerformanceModalOpen(true);
};

return (
  <ProtectedRoute>
    {isLoading && <LoadingSpinner />}
    
    <div className="flex h-screen">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          setIsSidebarOpen={setIsSidebarOpen}
          pageTitle="User Management"
        />
        
        <div className="p-4 md:p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                User Management
              </h1>
              <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                Total Users: {totalUsers}
              </span>
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center w-full md:w-auto"
            >
              <PlusCircle className="mr-2" /> Create User
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Position</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.department}</td>
                    <td className="p-3">{user.position}</td>
                    <td className="p-3">
                      <span className={`
                        px-2 py-1 rounded-full text-xs
                        ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewPerformance(user._id)}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          <BarChart2 size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUpdateModalOpen(true);
                          }}
                          className="text-green-500 hover:text-green-700"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {users.map(user => (
              <UserCard 
                key={user._id} 
                user={user}
                onView={() => {
                  setSelectedUser(user);
                }}
                onEdit={() => {
                  setSelectedUser(user);
                  setIsUpdateModalOpen(true);
                }}
                onDelete={() => handleDeleteUser(user._id)}
                onPerformance={() => handleViewPerformance(user._id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
            <div className="text-gray-600 text-sm">
              Showing {users.length} of {totalUsers} users
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Modals */}
          {isCreateModalOpen && (
            <UserModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={handleCreateUser}
              isLoading={isLoading}
            />
          )}

          {isUpdateModalOpen && selectedUser && (
            <UserModal
              isOpen={isUpdateModalOpen}
              onClose={() => setIsUpdateModalOpen(false)}
              onSubmit={(data) => handleUpdateUser(selectedUser._id, data)}
              user={selectedUser}
              isLoading={isLoading}
            />
          )}

          {isPerformanceModalOpen && selectedPerformanceUserId && (
            <UserPerformanceModal
              isOpen={isPerformanceModalOpen}
              onClose={() => setIsPerformanceModalOpen(false)}
              userId={selectedPerformanceUserId}
            />
          )}
        </div>
      </div>
    </div>
  </ProtectedRoute>
);
};

export default UserManagement;
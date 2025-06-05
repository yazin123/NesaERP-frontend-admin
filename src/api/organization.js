import api from './config';

const organizationApi = {
  // Departments
  getAllDepartments: async () => {
    const response = await api.get('/admin/departments');
    return {
      data: response.data?.data?.departments || response.data?.data || response.data || []
    };
  },
  getDepartmentById: async (id) => {
    const response = await api.get(`/admin/departments/${id}`);
    return {
      data: response.data?.data?.department || response.data?.data || response.data
    };
  },
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),

  // Designations
  getAllDesignations: async () => {
    const response = await api.get('/admin/designations');
    return {
      data: response.data?.data?.designations || response.data?.data || response.data || []
    };
  },
  getDesignationById: async (id) => {
    const response = await api.get(`/admin/designations/${id}`);
    return {
      data: response.data?.data?.designation || response.data?.data || response.data
    };
  },
  createDesignation: (data) => api.post('/admin/designations', data),
  updateDesignation: (id, data) => api.put(`/admin/designations/${id}`, data),
  deleteDesignation: (id) => api.delete(`/admin/designations/${id}`),

  // Roles
  getAllRoles: () => api.get('/admin/roles'),
  getRoleById: (id) => api.get(`/admin/roles/${id}`),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),

  // Enums
  getEnums: () => api.get('/admin/enums'),
  createEnum: (data) => api.post('/admin/enums', data),
  updateEnum: (id, data) => api.put(`/admin/enums/${id}`, data),
  deleteEnum: (id) => api.delete(`/admin/enums/${id}`),
};

export default organizationApi; 
import api from './config';

export const organizationApi = {
  // Departments
  getAllDepartments: () => api.get('/admin/departments'),
  getDepartmentById: (id) => api.get(`/admin/departments/${id}`),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),

  // Designations
  getAllDesignations: () => api.get('/admin/designations'),
  getDesignationById: (id) => api.get(`/admin/designations/${id}`),
  createDesignation: (data) => api.post('/admin/designations', data),
  updateDesignation: (id, data) => api.put(`/admin/designations/${id}`, data),
  deleteDesignation: (id) => api.delete(`/admin/designations/${id}`),

  // Roles Management
  getRoles: () => api.get('/admin/roles'),
  getRoleById: (id) => api.get(`/admin/roles/${id}`),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),

  // Permissions Management
  getPermissions: () => api.get('/admin/permissions'),
  getPermissionById: (id) => api.get(`/admin/permissions/${id}`),
  createPermission: (data) => api.post('/admin/permissions', data),
  updatePermission: (id, data) => api.put(`/admin/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/admin/permissions/${id}`),

  // System Enums
  getEnums: () => api.get('/admin/enums'),
  getEnumById: (id) => api.get(`/admin/enums/${id}`),
  createEnum: (data) => api.post('/admin/enums', data),
  updateEnum: (id, data) => api.put(`/admin/enums/${id}`, data),
  deleteEnum: (id) => api.delete(`/admin/enums/${id}`),
};

export default organizationApi; 
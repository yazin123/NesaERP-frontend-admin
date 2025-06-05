import api from './config';
import authApi from './auth';
import projectsApi from './projects';
import usersApi from './users';
import organizationApi from './organization';
import monitoringApi from './monitoring';
import reportsApi from './reports';
import notificationsApi from './notifications';
import tasksApi from './tasks';
import calendarApi from './calendar';

// Export individual modules
export {
  authApi,
  projectsApi,
  usersApi,
  organizationApi,
  monitoringApi,
  reportsApi,
  notificationsApi,
  tasksApi,
  calendarApi,
};

// Export default API object with all modules combined
export default {
  auth: authApi,
  projects: projectsApi,
  users: usersApi,
  organization: organizationApi,
  monitoring: monitoringApi,
  reports: reportsApi,
  notifications: notificationsApi,
  tasks: tasksApi,
  calendar: calendarApi,
};
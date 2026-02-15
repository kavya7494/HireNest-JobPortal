import api from '../../utils/api';
import { buildQueryString } from '../../utils/helpers';

const adminApi = {
  getAllUsers: (params) => api.get(`/admin/users?${buildQueryString(params)}`),
  approveRecruiter: (id) => api.put(`/admin/users/${id}/approve`),
  toggleBlockUser: (id) => api.put(`/admin/users/${id}/block`),
  getPlatformStats: () => api.get('/admin/stats'),
  getPlatformAnalytics: () => api.get('/admin/analytics'),
};

export default adminApi;

import api from '../../utils/api';
import { buildQueryString } from '../../utils/helpers';

const applicationsApi = {
  applyToJob: (jobId, data) => api.post(`/applications/${jobId}`, data),
  getMyApplications: (params) => api.get(`/applications/my?${buildQueryString(params)}`),
  getJobApplicants: (jobId, params) => api.get(`/applications/job/${jobId}?${buildQueryString(params)}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  getStats: () => api.get('/applications/stats'),
  getRecruiterAnalytics: () => api.get('/applications/analytics'),
  downloadResume: (id) => api.get(`/applications/${id}/resume`, { responseType: 'blob' }),
};

export default applicationsApi;

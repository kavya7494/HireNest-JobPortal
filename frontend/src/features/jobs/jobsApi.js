import api from '../../utils/api';
import { buildQueryString } from '../../utils/helpers';

const jobsApi = {
  getJobs: (params) => api.get(`/jobs?${buildQueryString(params)}`),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getRecruiterJobs: (params) => api.get(`/jobs/recruiter?${buildQueryString(params)}`),
  toggleSaveJob: (id) => api.post(`/jobs/${id}/save`),
  getSavedJobs: () => api.get('/jobs/saved'),
};

export default jobsApi;

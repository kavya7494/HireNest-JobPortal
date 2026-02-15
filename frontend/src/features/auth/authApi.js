import api from '../../utils/api';

const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadResume: (formData) =>
    api.put('/auth/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadAvatar: (formData) =>
    api.put('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default authApi;

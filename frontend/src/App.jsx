import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import useSocket from './hooks/useSocket';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import Jobs from './pages/jobs/Jobs';
import JobDetail from './pages/jobs/JobDetail';

import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateApplications from './pages/candidate/CandidateApplications';
import CandidateProfile from './pages/candidate/CandidateProfile';
import CandidateSavedJobs from './pages/candidate/CandidateSavedJobs';

import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import Applicants from './pages/recruiter/Applicants';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const AuthRedirect = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (isAuthenticated && user) {
    const redirectMap = {
      candidate: '/candidate/dashboard',
      recruiter: '/recruiter/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }
  return children;
};

const App = () => {
  useSocket();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />

      <Routes>
        {/* Public with main layout */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
        </Route>

        {/* Auth layout */}
        <Route
          element={
            <AuthRedirect>
              <AuthLayout />
            </AuthRedirect>
          }
        >
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* OTP verification (no auth redirect - user isn't authenticated yet) */}
        <Route element={<AuthLayout />}>
          <Route path="verify-otp" element={<VerifyOtp />} />
        </Route>

        {/* Candidate routes */}
        <Route
          element={
            <ProtectedRoute roles={['candidate']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="candidate/applications" element={<CandidateApplications />} />
          <Route path="candidate/profile" element={<CandidateProfile />} />
          <Route path="candidate/saved" element={<CandidateSavedJobs />} />
        </Route>

        {/* Recruiter routes */}
        <Route
          element={
            <ProtectedRoute roles={['recruiter']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="recruiter/post-job" element={<PostJob />} />
          <Route path="recruiter/jobs" element={<RecruiterJobs />} />
          <Route path="recruiter/jobs/:jobId/applicants" element={<Applicants />} />
          <Route path="recruiter/analytics" element={<RecruiterAnalytics />} />
          <Route path="recruiter/profile" element={<RecruiterProfile />} />
        </Route>

        {/* Admin routes */}
        <Route
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

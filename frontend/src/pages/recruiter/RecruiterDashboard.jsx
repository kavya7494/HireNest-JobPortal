import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from 'react-icons/hi';
import { fetchRecruiterJobs } from '../../features/jobs/jobsSlice';
import { fetchRecruiterAnalytics } from '../../features/applications/applicationsSlice';
import { formatRelativeTime } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="card p-5 hover:shadow-card-hover transition-all group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="flex items-center gap-1 mt-3 text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
      View details <HiOutlineArrowRight className="w-3 h-3" />
    </div>
  </Link>
);

const RecruiterDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { recruiterJobs } = useSelector((state) => state.jobs);
  const { analytics } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchRecruiterJobs({ limit: 5 }));
    dispatch(fetchRecruiterAnalytics());
  }, [dispatch]);

  const overview = analytics?.overview || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user?.companyName ? `${user.companyName} — ` : ''}Hiring dashboard overview
          </p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary flex items-center gap-2">
          <HiOutlinePlusCircle className="w-5 h-5" />
          Post Job
        </Link>
      </div>

      {!user?.isApproved && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <HiOutlineClock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Approval</p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                Your account is awaiting admin approval. You'll be able to post jobs once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={HiOutlineBriefcase}
          label="Total Jobs"
          value={overview.totalJobs || 0}
          color="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          to="/recruiter/jobs"
        />
        <StatCard
          icon={HiOutlineCheckCircle}
          label="Active Jobs"
          value={overview.activeJobs || 0}
          color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          to="/recruiter/jobs"
        />
        <StatCard
          icon={HiOutlineUsers}
          label="Total Applicants"
          value={overview.totalApplicants || 0}
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          to="/recruiter/analytics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Hiring Funnel</h2>
          {analytics?.hiringFunnel?.length ? (
            <div className="space-y-3">
              {['applied', 'shortlisted', 'interview', 'hired', 'rejected'].map((status) => {
                const item = analytics.hiringFunnel.find((f) => f._id === status);
                const count = item?.count || 0;
                const maxCount = Math.max(...analytics.hiringFunnel.map((f) => f.count), 1);
                const pct = Math.round((count / maxCount) * 100);
                const colorMap = {
                  applied: 'bg-blue-500',
                  shortlisted: 'bg-amber-500',
                  interview: 'bg-purple-500',
                  hired: 'bg-emerald-500',
                  rejected: 'bg-red-500',
                };
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-24 capitalize">{status}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-secondary-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={`h-full rounded-full ${colorMap[status]}`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No hiring data yet</p>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white">Recent Jobs</h2>
            <Link to="/recruiter/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </div>
          {recruiterJobs.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No jobs posted yet</p>
              <Link to="/recruiter/post-job" className="btn-primary mt-3 inline-block text-sm">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recruiterJobs.slice(0, 5).map((job) => (
                <Link
                  key={job._id}
                  to={`/recruiter/jobs/${job._id}/applicants`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-secondary-800/50 hover:bg-gray-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {job.applicationsCount || 0} applicants &bull; {formatRelativeTime(job.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      job.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                    <HiOutlineArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Applications per Job */}
      {analytics?.applicationsPerJob?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Applications by Job</h2>
          <div className="space-y-3">
            {analytics.applicationsPerJob.slice(0, 8).map((item, i) => {
              const maxCount = Math.max(...analytics.applicationsPerJob.map((a) => a.count), 1);
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate w-48">{item.jobTitle}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-secondary-700 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="h-full rounded-full bg-primary-500"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;

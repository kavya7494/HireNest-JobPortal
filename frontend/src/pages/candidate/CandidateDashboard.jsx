import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineBriefcase,
  HiOutlineClipboardCheck,
  HiOutlineBookmark,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { fetchApplicationStats, fetchMyApplications } from '../../features/applications/applicationsSlice';
import { fetchSavedJobs } from '../../features/jobs/jobsSlice';
import { formatRelativeTime } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';

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

const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, myApplications, loading } = useSelector((state) => state.applications);
  const { savedJobs } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchApplicationStats());
    dispatch(fetchMyApplications());
    dispatch(fetchSavedJobs());
  }, [dispatch]);

  const recentApps = myApplications.slice(0, 5);
  const profileStrength = user?.profileStrength || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here's your job search overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HiOutlineClipboardCheck}
          label="Total Applications"
          value={stats?.totalApplications || 0}
          color="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          to="/candidate/applications"
        />
        <StatCard
          icon={HiOutlineClock}
          label="Under Review"
          value={stats?.statusBreakdown?.applied || 0}
          color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          to="/candidate/applications"
        />
        <StatCard
          icon={HiOutlineCheckCircle}
          label="Interviews"
          value={stats?.statusBreakdown?.interview || 0}
          color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          to="/candidate/applications"
        />
        <StatCard
          icon={HiOutlineBookmark}
          label="Saved Jobs"
          value={savedJobs?.length || 0}
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          to="/candidate/saved"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
              <Link to="/jobs" className="btn-primary mt-3 inline-block">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-secondary-800/50 hover:bg-gray-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-400">
                      {app.job?.company?.charAt(0) || 'J'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{app.job?.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {app.job?.company} &bull; {formatRelativeTime(app.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.matchScore > 0 && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {app.matchScore}% match
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        STATUS_COLORS[app.status]
                          ? `${STATUS_COLORS[app.status].bg} ${STATUS_COLORS[app.status].text}`
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_COLORS[app.status]?.label || app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Profile Strength</h2>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-secondary-700" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${profileStrength} 100`}
                strokeLinecap="round"
                className={`${
                  profileStrength >= 80
                    ? 'text-green-500'
                    : profileStrength >= 50
                    ? 'text-amber-500'
                    : 'text-red-500'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{profileStrength}%</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            {profileStrength >= 80
              ? 'Great profile! You stand out.'
              : profileStrength >= 50
              ? 'Good start. Add more details.'
              : 'Complete your profile to get noticed.'}
          </p>
          <Link to="/candidate/profile" className="btn-secondary w-full text-center block text-sm">
            Complete Profile
          </Link>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Status</h3>
            {[
              { label: 'Applied', count: stats?.statusBreakdown?.applied || 0, color: 'bg-blue-500' },
              { label: 'Shortlisted', count: stats?.statusBreakdown?.shortlisted || 0, color: 'bg-amber-500' },
              { label: 'Interview', count: stats?.statusBreakdown?.interview || 0, color: 'bg-green-500' },
              { label: 'Hired', count: stats?.statusBreakdown?.hired || 0, color: 'bg-emerald-500' },
              { label: 'Rejected', count: stats?.statusBreakdown?.rejected || 0, color: 'bg-red-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;

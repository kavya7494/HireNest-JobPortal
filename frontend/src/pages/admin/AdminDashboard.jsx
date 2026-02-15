import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineBan,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineChartBar,
} from 'react-icons/hi';
import { fetchPlatformStats } from '../../features/admin/adminSlice';

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

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { platformStats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchPlatformStats());
  }, [dispatch]);

  const s = platformStats?.overview || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HiOutlineUsers}
          label="Total Users"
          value={s.totalUsers || 0}
          color="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          to="/admin/users"
        />
        <StatCard
          icon={HiOutlineBriefcase}
          label="Active Jobs"
          value={s.activeJobs || 0}
          color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          to="/jobs"
        />
        <StatCard
          icon={HiOutlineDocumentText}
          label="Applications"
          value={s.totalApplications || 0}
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          to="/admin/analytics"
        />
        <StatCard
          icon={HiOutlineClock}
          label="Pending Recruiters"
          value={s.pendingRecruiters || 0}
          color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          to="/admin/users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">User Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Candidates', value: s.totalCandidates || 0, color: 'bg-blue-500', icon: HiOutlineUsers },
              { label: 'Active Recruiters', value: s.activeRecruiters || 0, color: 'bg-green-500', icon: HiOutlineShieldCheck },
              { label: 'Pending Recruiters', value: s.pendingRecruiters || 0, color: 'bg-amber-500', icon: HiOutlineClock },
              { label: 'Blocked Users', value: s.blockedUsers || 0, color: 'bg-red-500', icon: HiOutlineBan },
            ].map(({ label, value, color, icon: Icon }) => {
              const total = s.totalUsers || 1;
              const pct = Math.round((value / total) * 100);
              return (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${color}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jobs Overview */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Platform Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Jobs', value: s.totalJobs || 0, icon: HiOutlineBriefcase, bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400' },
              { label: 'Active Jobs', value: s.activeJobs || 0, icon: HiOutlineChartBar, bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
              { label: 'Total Recruiters', value: s.totalRecruiters || 0, icon: HiOutlineShieldCheck, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
              { label: 'Total Applications', value: s.totalApplications || 0, icon: HiOutlineDocumentText, bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
            ].map(({ label, value, icon: Icon, bg, text }) => (
              <div key={label} className={`p-4 rounded-xl ${bg}`}>
                <Icon className={`w-6 h-6 ${text} mb-2`} />
                <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Companies */}
      {platformStats?.topCompanies?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Top Companies</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-secondary-700">
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Company</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400 text-right">Jobs</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400 text-right">Applications</th>
                </tr>
              </thead>
              <tbody>
                {platformStats.topCompanies.map((company, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-secondary-800 last:border-0">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{company._id}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{company.jobCount}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{company.totalApplications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

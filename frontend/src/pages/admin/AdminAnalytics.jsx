import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import { fetchPlatformAnalytics, fetchPlatformStats } from '../../features/admin/adminSlice';
import { MONTHS } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { platformAnalytics, platformStats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchPlatformAnalytics());
    dispatch(fetchPlatformStats());
  }, [dispatch]);

  const overview = platformStats?.overview || {};

  // Platform Growth Line Chart
  const growthLabels = (platformAnalytics?.platformGrowth || []).map(
    (g) => `${MONTHS[(g._id.month || 1) - 1]} ${g._id.year}`
  );
  const growthData = {
    labels: growthLabels,
    datasets: [
      {
        label: 'Total',
        data: (platformAnalytics?.platformGrowth || []).map((g) => g.users),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Candidates',
        data: (platformAnalytics?.platformGrowth || []).map((g) => g.candidates),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Recruiters',
        data: (platformAnalytics?.platformGrowth || []).map((g) => g.recruiters),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Top Skills Bar Chart
  const skillsData = {
    labels: (platformAnalytics?.topIndustries || []).slice(0, 10).map((s) => s._id),
    datasets: [
      {
        label: 'Job Listings',
        data: (platformAnalytics?.topIndustries || []).slice(0, 10).map((s) => s.count),
        backgroundColor: '#6366F1',
        borderRadius: 6,
      },
    ],
  };

  // Application Trends
  const trendLabels = (platformAnalytics?.applicationTrends || []).map(
    (t) => `${MONTHS[(t._id.month || 1) - 1]} ${t._id.year}`
  );
  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Applications',
        data: (platformAnalytics?.applicationTrends || []).map((t) => t.count),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#8B5CF6',
      },
    ],
  };

  // Most Applied Roles Doughnut
  const rolesData = {
    labels: (platformAnalytics?.mostAppliedRoles || []).slice(0, 6).map((r) => r._id),
    datasets: [
      {
        data: (platformAnalytics?.mostAppliedRoles || []).slice(0, 6).map((r) => r.applicationCount),
        backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#9CA3AF', usePointStyle: true, padding: 16 } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
      y: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
    },
  };

  if (loading && !platformAnalytics) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-secondary-700 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-secondary-700 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-secondary-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Platform Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive platform performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: HiOutlineUsers, label: 'Total Users', value: overview.totalUsers || 0, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
          { icon: HiOutlineBriefcase, label: 'Total Jobs', value: overview.totalJobs || 0, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { icon: HiOutlineDocumentText, label: 'Applications', value: overview.totalApplications || 0, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { icon: HiOutlineTrendingUp, label: 'Active Jobs', value: overview.activeJobs || 0, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-xl font-display font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
            User Growth
          </h2>
          <div className="h-72">
            {platformAnalytics?.platformGrowth?.length ? (
              <Line data={growthData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { position: 'bottom', labels: { color: '#9CA3AF', usePointStyle: true, padding: 16 } } } }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">No growth data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Application Trends */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Application Trends</h2>
          <div className="h-72">
            {platformAnalytics?.applicationTrends?.length ? (
              <Line data={trendData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">No trend data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Top Skills in Demand</h2>
          <div className="h-72">
            {platformAnalytics?.topIndustries?.length ? (
              <Bar data={skillsData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">No skills data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Most Applied Roles */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Most Applied Roles</h2>
          <div className="h-72 flex items-center justify-center">
            {platformAnalytics?.mostAppliedRoles?.length ? (
              <Doughnut
                data={rolesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '60%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { padding: 12, usePointStyle: true, color: '#9CA3AF', font: { size: 11 } },
                    },
                  },
                }}
              />
            ) : (
              <p className="text-gray-400 text-sm">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

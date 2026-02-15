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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import { fetchRecruiterAnalytics } from '../../features/applications/applicationsSlice';
import { MONTHS } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const RecruiterAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchRecruiterAnalytics());
  }, [dispatch]);

  const overview = analytics?.overview || {};

  const funnelData = {
    labels: (analytics?.hiringFunnel || []).map((f) => f._id?.charAt(0)?.toUpperCase() + f._id?.slice(1)),
    datasets: [
      {
        data: (analytics?.hiringFunnel || []).map((f) => f.count),
        backgroundColor: ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const monthlyLabels = (analytics?.monthlyHiring || []).map((m) => `${MONTHS[(m._id.month || 1) - 1]} ${m._id.year}`);
  const monthlyData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Applications',
        data: (analytics?.monthlyHiring || []).map((m) => m.count),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366F1',
      },
    ],
  };

  const jobLabels = (analytics?.applicationsPerJob || []).slice(0, 8).map((a) => a.jobTitle?.substring(0, 20) || '');
  const jobData = {
    labels: jobLabels,
    datasets: [
      {
        label: 'Applications',
        data: (analytics?.applicationsPerJob || []).slice(0, 8).map((a) => a.count),
        backgroundColor: '#6366F1',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
      y: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
    },
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-secondary-700 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your recruiting performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: HiOutlineBriefcase, label: 'Total Jobs', value: overview.totalJobs || 0, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
          { icon: HiOutlineTrendingUp, label: 'Active Jobs', value: overview.activeJobs || 0, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { icon: HiOutlineUsers, label: 'Total Applicants', value: overview.totalApplicants || 0, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
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
        {/* Hiring Funnel */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
            Hiring Funnel
          </h2>
          <div className="h-64 flex items-center justify-center">
            {analytics?.hiringFunnel?.length ? (
              <Doughnut
                data={funnelData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '60%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { padding: 16, usePointStyle: true, color: '#9CA3AF' },
                    },
                  },
                }}
              />
            ) : (
              <p className="text-gray-400 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="card p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
            Monthly Application Trends
          </h2>
          <div className="h-64">
            {analytics?.monthlyHiring?.length ? (
              <Line data={monthlyData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications per Job */}
      <div className="card p-6">
        <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Applications per Job</h2>
        <div className="h-80">
          {analytics?.applicationsPerJob?.length ? (
            <Bar data={jobData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalytics;

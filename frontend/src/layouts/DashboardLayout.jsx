import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineBookmark,
  HiOutlineUser,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlinePlusCircle,
  HiOutlineShieldCheck,
  HiOutlineCog,
} from 'react-icons/hi';
import Navbar from '../components/common/Navbar';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);

  const candidateLinks = [
    { to: '/candidate/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/jobs', icon: HiOutlineBriefcase, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: HiOutlineDocumentText, label: 'My Applications' },
    { to: '/candidate/saved', icon: HiOutlineBookmark, label: 'Saved Jobs' },
    { to: '/candidate/profile', icon: HiOutlineUser, label: 'My Profile' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/recruiter/post-job', icon: HiOutlinePlusCircle, label: 'Post a Job' },
    { to: '/recruiter/jobs', icon: HiOutlineBriefcase, label: 'My Jobs' },
    { to: '/recruiter/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
    { to: '/recruiter/profile', icon: HiOutlineUser, label: 'Company Profile' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/admin/users', icon: HiOutlineUsers, label: 'Manage Users' },
    { to: '/admin/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
    { to: '/jobs', icon: HiOutlineBriefcase, label: 'All Jobs' },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'recruiter'
      ? recruiterLinks
      : candidateLinks;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      <div className="flex">
        <aside className="hidden lg:flex lg:flex-col w-64 min-h-[calc(100vh-64px)] bg-white dark:bg-secondary-800 border-r border-gray-200 dark:border-gray-700 sticky top-16 h-[calc(100vh-64px)]">
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-secondary-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-64px)]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

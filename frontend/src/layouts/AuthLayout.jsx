import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineBriefcase } from 'react-icons/hi';
import ThemeToggle from '../components/common/ThemeToggle';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-secondary-900">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 p-12 items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-lg text-white space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <HiOutlineBriefcase className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-display font-bold">HireNest Elite</span>
            </Link>

            <h1 className="text-4xl font-display font-bold leading-tight">
              Your Career,
              <br />
              <span className="text-primary-200">Elevated.</span>
            </h1>

            <p className="text-lg text-primary-100 leading-relaxed mt-4">
              Connect with top companies, discover perfect opportunities, and accelerate your professional journey with our intelligent matching platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              { number: '10K+', label: 'Active Job Listings' },
              { number: '5K+', label: 'Companies Hiring' },
              { number: '95%', label: 'Match Accuracy' },
            ].map(({ number, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="text-2xl font-display font-bold text-white">{number}</div>
                <div className="text-primary-200 text-sm">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex justify-between items-center p-6">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <HiOutlineBriefcase className="w-6 h-6 text-primary-600" />
            <span className="text-lg font-display font-bold text-gray-900 dark:text-white">HireNest Elite</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

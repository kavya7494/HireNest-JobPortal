import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineArrowRight,
} from 'react-icons/hi';

const features = [
  {
    icon: HiOutlineLightningBolt,
    title: 'Smart Matching Engine',
    description: 'AI-powered skill matching calculates compatibility scores between candidates and job requirements in real-time.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Enterprise Security',
    description: 'JWT token rotation, role-based access control, and encrypted data handling protect every interaction.',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Analytics Dashboard',
    description: 'Real-time insights into hiring funnels, application trends, and platform growth metrics.',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Multi-Role Platform',
    description: 'Tailored experiences for candidates, recruiters, and administrators with dedicated dashboards.',
  },
  {
    icon: HiOutlineSparkles,
    title: 'Real-Time Notifications',
    description: 'Instant updates via WebSocket when applications are submitted, reviewed, or interviews scheduled.',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Advanced Job Search',
    description: 'Filter by location, salary, experience, work mode, company size, and required skills.',
  },
];

const Home = () => {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-secondary-900 dark:via-secondary-900 dark:to-primary-950/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-full border border-primary-200 dark:border-primary-800">
              <HiOutlineSparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Intelligent Career Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 dark:text-white leading-tight">
              Find Your Next
              <br />
              <span className="gradient-text">Dream Opportunity</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              HireNest Elite connects exceptional talent with world-class companies through intelligent skill matching and a seamless hiring experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/register" className="btn-primary text-base !py-3 !px-8 flex items-center gap-2">
                Get Started Free
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/jobs" className="btn-secondary text-base !py-3 !px-8">
                Browse Jobs
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {[
              { number: '10K+', label: 'Active Jobs' },
              { number: '5K+', label: 'Companies' },
              { number: '50K+', label: 'Candidates' },
              { number: '95%', label: 'Match Rate' },
            ].map(({ number, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
                  {number}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-secondary-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white">
              Why Choose <span className="gradient-text">HireNest Elite</span>?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Enterprise-grade features designed for modern hiring teams and ambitious professionals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card p-8 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Ready to Elevate Your Career?
            </h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              Join thousands of professionals and companies already using HireNest Elite to build their future.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="bg-white text-primary-700 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Create Account
              </Link>
              <Link
                to="/register"
                className="text-white border-2 border-white/30 font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-all"
              >
                Post a Job
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

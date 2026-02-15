import { Link } from 'react-router-dom';
import { HiOutlineBriefcase } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-secondary-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <HiOutlineBriefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-display font-bold text-gray-900 dark:text-white">
                HireNest <span className="text-primary-600">Elite</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Connecting exceptional talent with world-class companies. Your career journey starts here.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">For Candidates</h3>
            <ul className="space-y-2.5">
              {['Browse Jobs', 'Career Resources', 'Resume Builder', 'Salary Guide'].map((item) => (
                <li key={item}>
                  <Link to="/jobs" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">For Employers</h3>
            <ul className="space-y-2.5">
              {['Post a Job', 'Talent Search', 'Recruiting Solutions', 'Pricing'].map((item) => (
                <li key={item}>
                  <Link to="/register" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2.5">
              {['About Us', 'Blog', 'Contact', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} HireNest Elite. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Built with React, Node.js & MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

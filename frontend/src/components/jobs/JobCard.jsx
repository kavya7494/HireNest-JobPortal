import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineBookmark,
  HiOutlineBookmarkAlt,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import { formatSalary, formatRelativeTime, truncateText } from '../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSaveJob } from '../../features/jobs/jobsSlice';
import toast from 'react-hot-toast';

const JobCard = ({ job, index = 0 }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isSaved = user?.savedJobs?.some((s) => (typeof s === 'string' ? s : s._id) === job._id);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save jobs');
      return;
    }
    if (user?.role !== 'candidate') return;
    try {
      const result = await dispatch(toggleSaveJob(job._id)).unwrap();
      toast.success(result.saved ? 'Job saved!' : 'Job removed from saved');
    } catch {
      toast.error('Failed to save job');
    }
  };

  const jobTypeColors = {
    'full-time': 'badge-primary',
    'part-time': 'badge-warning',
    contract: 'badge-neutral',
    internship: 'badge-success',
  };

  const workModeColors = {
    remote: 'badge-success',
    onsite: 'badge-neutral',
    hybrid: 'badge-primary',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <Link to={`/jobs/${job._id}`} className="block card-hover p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
              {job.company?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <HiOutlineOfficeBuilding className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{job.company}</span>
              </div>
            </div>
          </div>
          {isAuthenticated && user?.role === 'candidate' && (
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
            >
              {isSaved ? (
                <HiOutlineBookmarkAlt className="w-5 h-5 text-primary-600" />
              ) : (
                <HiOutlineBookmark className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
          {truncateText(job.description, 120)}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skillsRequired?.slice(0, 4).map((skill) => (
            <span key={skill} className="badge-neutral text-xs">
              {skill}
            </span>
          ))}
          {job.skillsRequired?.length > 4 && (
            <span className="badge-neutral text-xs">+{job.skillsRequired.length - 4}</span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <HiOutlineLocationMarker className="w-3.5 h-3.5" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <HiOutlineCurrencyDollar className="w-3.5 h-3.5" />
            {formatSalary(job.salary)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className={jobTypeColors[job.jobType] || 'badge-neutral'}>
              {job.jobType?.replace('-', ' ')}
            </span>
            <span className={workModeColors[job.workMode] || 'badge-neutral'}>
              {job.workMode}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <HiOutlineClock className="w-3.5 h-3.5" />
            {formatRelativeTime(job.createdAt)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default JobCard;

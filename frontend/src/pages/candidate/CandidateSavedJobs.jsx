import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineBookmark,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineTrash,
} from 'react-icons/hi';
import { fetchSavedJobs, toggleSaveJob } from '../../features/jobs/jobsSlice';
import { formatSalary, formatRelativeTime, capitalizeFirst } from '../../utils/helpers';

const CandidateSavedJobs = () => {
  const dispatch = useDispatch();
  const { savedJobs, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchSavedJobs());
  }, [dispatch]);

  const handleUnsave = async (jobId) => {
    try {
      await dispatch(toggleSaveJob(jobId)).unwrap();
      toast.success('Job removed from saved');
    } catch (err) {
      toast.error(err || 'Failed to remove job');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Saved Jobs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading && savedJobs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-secondary-700 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-secondary-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-secondary-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlineBookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved jobs</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Browse jobs and bookmark the ones you're interested in
          </p>
          <Link to="/jobs" className="btn-primary inline-block">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {savedJobs.map((job) => (
              <motion.div
                key={job._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card p-6 hover:shadow-card-hover transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link to={`/jobs/${job._id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                  </Link>
                  <button
                    onClick={() => handleUnsave(job._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                    title="Remove from saved"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <HiOutlineLocationMarker className="w-4 h-4" />
                      {job.location}
                    </span>
                  )}
                  {job.jobType && (
                    <span className="flex items-center gap-1">
                      <HiOutlineBriefcase className="w-4 h-4" />
                      {capitalizeFirst(job.jobType)}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium">
                      <HiOutlineCurrencyDollar className="w-4 h-4" />
                      {formatSalary(job.salary)}
                    </span>
                  )}
                </div>

                {job.skillsRequired?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.skillsRequired.slice(0, 5).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-secondary-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 5 && (
                      <span className="text-xs text-gray-400">+{job.skillsRequired.length - 5}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatRelativeTime(job.createdAt)}</span>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CandidateSavedJobs;

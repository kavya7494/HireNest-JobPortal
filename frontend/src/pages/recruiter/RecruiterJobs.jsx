import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlinePlusCircle,
} from 'react-icons/hi';
import { fetchRecruiterJobs, deleteJob, updateJob } from '../../features/jobs/jobsSlice';
import { formatDate, formatSalary, formatRelativeTime } from '../../utils/helpers';

const RecruiterJobs = () => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recruiterJobs, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchRecruiterJobs({}));
  }, [dispatch]);

  const handleToggleActive = async (job) => {
    try {
      await dispatch(updateJob({ id: job._id, data: { isActive: !job.isActive } })).unwrap();
      toast.success(`Job ${job.isActive ? 'deactivated' : 'activated'}`);
      dispatch(fetchRecruiterJobs({}));
    } catch (err) {
      toast.error(err || 'Failed to update job');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteJob(id)).unwrap();
      toast.success('Job deleted');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err || 'Failed to delete job');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Jobs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your job listings</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary flex items-center gap-2">
          <HiOutlinePlusCircle className="w-5 h-5" />
          Post Job
        </Link>
      </div>

      {loading && recruiterJobs.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-secondary-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-secondary-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-secondary-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : recruiterJobs.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlineBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs posted yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start by posting your first job listing</p>
          <Link to="/recruiter/post-job" className="btn-primary inline-flex items-center gap-2">
            <HiOutlinePlusCircle className="w-5 h-5" />
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {recruiterJobs.map((job) => (
              <motion.div
                key={job._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        job.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        {job.isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <HiOutlineLocationMarker className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineUsers className="w-4 h-4" />
                        {job.applicationsCount || 0} applicants
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineCalendar className="w-4 h-4" />
                        Posted {formatRelativeTime(job.createdAt)}
                      </span>
                      {job.salary && (
                        <span className="text-primary-600 dark:text-primary-400 font-medium">
                          {formatSalary(job.salary)}
                        </span>
                      )}
                    </div>
                    {job.skillsRequired?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skillsRequired.slice(0, 6).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-secondary-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                            {skill}
                          </span>
                        ))}
                        {job.skillsRequired.length > 6 && (
                          <span className="text-xs text-gray-400">+{job.skillsRequired.length - 6} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/recruiter/jobs/${job._id}/applicants`}
                      className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      title="View Applicants"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleToggleActive(job)}
                      className={`p-2 rounded-lg transition-colors ${
                        job.isActive
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                      }`}
                      title={job.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(job._id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {deleteConfirm === job._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Are you sure you want to delete "{job.title}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(job._id)} className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                        Yes, Delete
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 bg-gray-200 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineFilter,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineEye,
} from 'react-icons/hi';
import { fetchMyApplications } from '../../features/applications/applicationsSlice';
import { formatRelativeTime, formatDate, getMatchColor, getMatchLabel } from '../../utils/helpers';
import { APPLICATION_STATUS, STATUS_COLORS } from '../../utils/constants';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const CandidateApplications = () => {
  const dispatch = useDispatch();
  const { myApplications: applications, loading } = useSelector((state) => state.applications);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);
  const filtered =
    statusFilter === 'all' ? applications : applications.filter((a) => a.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {applications.length} total applications
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-secondary-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-secondary-700 hover:border-primary-300'
          }`}
        >
          All ({applications.length})
        </button>
        {Object.entries(APPLICATION_STATUS).map(([key, value]) => {
          const cnt = applications.filter((a) => a.status === value).length;
          const statusLabel = STATUS_COLORS[value]?.label || value;
          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-secondary-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-secondary-700 hover:border-primary-300'
              }`}
            >
              {statusLabel} ({cnt})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton type="card" count={3} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlineBriefcase className="w-16 h-16 text-gray-300 dark:text-secondary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No applications found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {statusFilter === 'all' ? 'Start applying to jobs' : `No ${statusFilter} applications`}
          </p>
          <Link to="/jobs" className="btn-primary mt-4 inline-block">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((app) => (
              <motion.div
                key={app._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card p-5 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center font-bold text-primary-700 dark:text-primary-400 flex-shrink-0">
                      {app.job?.company?.charAt(0) || 'J'}
                    </div>
                    <div>
                      <Link
                        to={`/jobs/${app.job?._id}`}
                        className="text-base font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {app.job?.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <HiOutlineBriefcase className="w-3.5 h-3.5" />
                          {app.job?.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                          {app.job?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineCalendar className="w-3.5 h-3.5" />
                          Applied {formatRelativeTime(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        STATUS_COLORS[app.status]
                          ? `${STATUS_COLORS[app.status].bg} ${STATUS_COLORS[app.status].text}`
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_COLORS[app.status]?.label || app.status}
                    </span>
                    {app.matchScore > 0 && (
                      <span className={`text-xs font-medium ${getMatchColor(app.matchScore).text}`}>
                        {app.matchScore}% match — {getMatchLabel(app.matchScore)}
                      </span>
                    )}
                  </div>
                </div>

                {app.interviewDate && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                      <HiOutlineCalendar className="w-4 h-4" />
                      Interview scheduled: {formatDate(app.interviewDate)}
                    </p>
                  </div>
                )}

                {app.recruiterNotes && app.status !== 'applied' && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-secondary-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Recruiter notes:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{app.recruiterNotes}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      
    </div>
  );
};

export default CandidateApplications;

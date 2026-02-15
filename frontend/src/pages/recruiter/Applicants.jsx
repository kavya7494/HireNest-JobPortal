import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineDocumentDownload,
  HiOutlineArrowLeft,
  HiOutlineFilter,
  HiOutlineStar,
  HiOutlineCalendar,
} from 'react-icons/hi';
import { fetchJobApplicants, updateApplicationStatus, clearApplicants } from '../../features/applications/applicationsSlice';
import { fetchJobById } from '../../features/jobs/jobsSlice';
import { STATUS_COLORS, APPLICATION_STATUS } from '../../utils/constants';
import { formatDate, getMatchColor, getInitials } from '../../utils/helpers';
import applicationsApi from '../../features/applications/applicationsApi';

const statusOptions = [
  { value: 'shortlisted', label: 'Shortlist', color: 'bg-amber-500 hover:bg-amber-600' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-500 hover:bg-purple-600' },
  { value: 'hired', label: 'Hire', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { value: 'rejected', label: 'Reject', color: 'bg-red-500 hover:bg-red-600' },
];

const Applicants = () => {
  const { jobId } = useParams();
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('matchScore');
  const dispatch = useDispatch();
  const { applicants, loading, meta } = useSelector((state) => state.applications);
  const { currentJob } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobById(jobId));
    return () => dispatch(clearApplicants());
  }, [dispatch, jobId]);

  useEffect(() => {
    dispatch(fetchJobApplicants({ jobId, params: { status: filterStatus, sortBy } }));
  }, [dispatch, jobId, filterStatus, sortBy]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await dispatch(updateApplicationStatus({ id: appId, data: { status } })).unwrap();
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error(err || 'Failed to update status');
    }
  };

  const handleDownloadResume = async (appId, candidateName) => {
    try {
      const response = await applicationsApi.downloadResume(appId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${candidateName.replace(/\s/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download resume');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/recruiter/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-3 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Applicants {currentJob ? `— ${currentJob.title}` : ''}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {meta.total || 0} total applicant{meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field !py-1.5 text-sm w-auto"
          >
            <option value="">All Statuses</option>
            {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
              <option key={key} value={value}>{STATUS_COLORS[value]?.label || value}</option>
            ))}
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field !py-1.5 text-sm w-auto"
        >
          <option value="matchScore">Match Score</option>
          <option value="appliedAt">Date Applied</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Applicant List */}
      {loading && applicants.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-secondary-700" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-secondary-700 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-secondary-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlineUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applicants yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Applicants will appear here once candidates apply</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {applicants.map((app) => {
              const candidate = app.candidate || {};
              const matchColor = getMatchColor(app.matchScore || 0);
              const statusStyle = STATUS_COLORS[app.status] || {};
              return (
                <motion.div
                  key={app._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {candidate.avatarUrl ? (
                        <img src={candidate.avatarUrl} alt={candidate.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                          {getInitials(candidate.name)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{candidate.name || 'Unknown'}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label || app.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <HiOutlineMail className="w-4 h-4" />
                          {candidate.email || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineCalendar className="w-4 h-4" />
                          Applied {formatDate(app.appliedAt || app.createdAt)}
                        </span>
                      </div>

                      {/* Skills */}
                      {candidate.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {candidate.skills.slice(0, 8).map((skill) => {
                            const isMatch = currentJob?.skillsRequired?.includes(skill);
                            return (
                              <span
                                key={skill}
                                className={`px-2 py-0.5 text-xs rounded-md ${
                                  isMatch
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium'
                                    : 'bg-gray-100 dark:bg-secondary-700 text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Cover Letter */}
                      {app.coverLetter && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{app.coverLetter}</p>
                      )}
                    </div>

                    {/* Match Score & Actions */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-3">
                      {app.matchScore > 0 && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${matchColor.bg}`}>
                          <HiOutlineStar className={`w-4 h-4 ${matchColor.text}`} />
                          <span className={`text-sm font-bold ${matchColor.text}`}>{app.matchScore}%</span>
                        </div>
                      )}

                      {candidate.resumeUrl && (
                        <button
                          onClick={() => handleDownloadResume(app._id, candidate.name)}
                          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors"
                        >
                          <HiOutlineDocumentDownload className="w-4 h-4" />
                          Resume
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-secondary-700">
                    {statusOptions
                      .filter((s) => s.value !== app.status)
                      .map((s) => (
                        <button
                          key={s.value}
                          onClick={() => handleStatusUpdate(app._id, s.value)}
                          className={`px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors ${s.color}`}
                        >
                          {s.label}
                        </button>
                      ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Applicants;

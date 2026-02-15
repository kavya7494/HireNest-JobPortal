import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineArrowLeft,
  HiOutlineExternalLink,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { fetchJobById, toggleSaveJob } from '../../features/jobs/jobsSlice';
import { applyToJob, fetchMyApplications } from '../../features/applications/applicationsSlice';
import { formatSalary, formatDate, formatRelativeTime, capitalizeFirst } from '../../utils/helpers';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const JobDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentJob: job, loading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);
  const { myApplications, loading: applying } = useSelector((state) => state.applications);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    dispatch(fetchJobById(id));
    if (user?.role === 'candidate') {
      dispatch(fetchMyApplications());
    }
  }, [dispatch, id, user?.role]);

  const handleSave = async () => {
    if (!user) return navigate('/login');
    try {
      await dispatch(toggleSaveJob(job._id)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to save job');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await dispatch(applyToJob({ jobId: job._id, data: { coverLetter } })).unwrap();
      toast.success('Application submitted successfully!');
      setShowApply(false);
      dispatch(fetchJobById(id));
    } catch (err) {
      toast.error(err || 'Failed to apply');
    }
  };

  if (loading || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSkeleton type="card" count={1} />
      </div>
    );
  }

  const isSaved = user?.savedJobs?.includes(job._id);
  const isOwner = user?._id === job.postedBy?._id;
  const hasApplied = myApplications?.some((app) => (app.job?._id || app.job) === job._id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center font-bold text-primary-700 dark:text-primary-400 text-lg flex-shrink-0">
                {job.company?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <HiOutlineOfficeBuilding className="w-4 h-4" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineLocationMarker className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendar className="w-4 h-4" />
                    {formatRelativeTime(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {user?.role === 'candidate' && (
              <button onClick={handleSave} className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors flex-shrink-0">
                {isSaved ? (
                  <HiBookmark className="w-6 h-6 text-primary-600" />
                ) : (
                  <HiOutlineBookmark className="w-6 h-6 text-gray-400" />
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            <span className="badge-primary">{capitalizeFirst(job.jobType)}</span>
            <span className="badge-primary">{capitalizeFirst(job.workMode)}</span>
            {job.salary?.min && (
              <span className="badge-success flex items-center gap-1">
                <HiOutlineCurrencyDollar className="w-3.5 h-3.5" />
                {formatSalary(job.salary)}
              </span>
            )}
            {job.experienceRequired && (
              <span className="badge-warning flex items-center gap-1">
                <HiOutlineBriefcase className="w-3.5 h-3.5" />
                {job.experienceRequired.min}-{job.experienceRequired.max} yrs
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 dark:bg-secondary-800/50 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Applications</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.applicationsCount || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Posted</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(job.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Deadline</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {job.deadline ? formatDate(job.deadline) : 'Open'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Work Mode</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{capitalizeFirst(job.workMode)}</p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {job.requirements?.length > 0 && (
              <div>
                <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <HiOutlineCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired?.map((skill) => {
                  const userHasSkill = user?.skills?.map((s) => s.toLowerCase()).includes(skill.toLowerCase());
                  return (
                    <span
                      key={skill}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        userHasSkill
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800'
                          : 'bg-gray-100 text-gray-700 dark:bg-secondary-800 dark:text-gray-300'
                      }`}
                    >
                      {userHasSkill ? (
                        <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <HiOutlineXCircle className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      {skill}
                    </span>
                  );
                })}
              </div>
              {user?.skills?.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  You match{' '}
                  {job.skillsRequired?.filter((s) =>
                    user.skills.map((us) => us.toLowerCase()).includes(s.toLowerCase())
                  ).length}{' '}
                  of {job.skillsRequired?.length} required skills
                </p>
              )}
            </div>

            {job.benefits?.length > 0 && (
              <div>
                <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-3">Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((b) => (
                    <span key={b} className="badge-primary">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-secondary-700">
            {isOwner ? (
              <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn-primary">
                Edit Job
              </Link>
            ) : user?.role === 'candidate' ? (
              hasApplied ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  You've already applied to this job
                </div>
              ) : showApply ? (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleApply}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="input-field h-32 resize-none"
                      placeholder="Tell the recruiter why you're a great fit for this role..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={applying} className="btn-primary flex items-center justify-center gap-2">
                      {applying ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : null}
                      Submit Application
                    </button>
                    <button type="button" onClick={() => setShowApply(false)} className="btn-ghost">
                      Cancel
                    </button>
                  </div>
                </motion.form>
              ) : (
                <button onClick={() => setShowApply(true)} className="btn-primary">
                  Apply Now
                </button>
              )
            ) : !user ? (
              <Link to="/login" className="btn-primary">
                Login to Apply
              </Link>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetail;

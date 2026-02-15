import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineX,
  HiOutlinePlus,
} from 'react-icons/hi';
import { createJob } from '../../features/jobs/jobsSlice';
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS, POPULAR_SKILLS } from '../../utils/constants';

const schema = z.object({
  title: z.string().min(3, 'Job title is required').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  company: z.string().min(2, 'Company name is required'),
  location: z.string().min(2, 'Location is required'),
  jobType: z.string().min(1, 'Select a job type'),
  workMode: z.string().min(1, 'Select a work mode'),
  experienceMin: z.coerce.number().min(0).optional(),
  experienceMax: z.coerce.number().min(0).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  salaryCurrency: z.string().optional(),
  openings: z.coerce.number().min(1, 'At least 1 opening').max(100).optional(),
  deadline: z.string().optional(),
});

const PostJob = () => {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.jobs);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      company: user?.companyName || '',
      salaryCurrency: 'USD',
      openings: 1,
    },
  });

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
    setShowSuggestions(false);
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (skillInput.trim()) addSkill(skillInput);
    }
  };

  const filteredSuggestions = POPULAR_SKILLS.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
  ).slice(0, 8);

  const onSubmit = async (data) => {
    if (skills.length === 0) {
      toast.error('Add at least one required skill');
      return;
    }

    const jobData = {
      ...data,
      skillsRequired: skills,
      salary: {
        min: data.salaryMin || undefined,
        max: data.salaryMax || undefined,
        currency: data.salaryCurrency || 'USD',
      },
      experience: {
        min: data.experienceMin || 0,
        max: data.experienceMax || undefined,
      },
    };
    delete jobData.salaryMin;
    delete jobData.salaryMax;
    delete jobData.salaryCurrency;
    delete jobData.experienceMin;
    delete jobData.experienceMax;

    try {
      await dispatch(createJob(jobData)).unwrap();
      toast.success('Job posted successfully!');
      navigate('/recruiter/jobs', { replace: true });
    } catch (err) {
      toast.error(err || 'Failed to post job');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Post a New Job</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details to create a new job listing</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input type="text" {...register('title')} className="input-field" placeholder="e.g. Senior React Developer" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company *</label>
            <input type="text" {...register('company')} className="input-field" placeholder="Company name" />
            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              {...register('description')}
              rows={6}
              className="input-field resize-none"
              placeholder="Describe the role, responsibilities, requirements, and benefits..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type *</label>
              <select {...register('jobType')} className="input-field">
                <option value="">Select type</option>
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.jobType && <p className="text-red-500 text-xs mt-1">{errors.jobType.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Mode *</label>
              <select {...register('workMode')} className="input-field">
                <option value="">Select mode</option>
                {WORK_MODES.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
              {errors.workMode && <p className="text-red-500 text-xs mt-1">{errors.workMode.message}</p>}
            </div>
          </div>
        </div>

        {/* Location & Experience */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineLocationMarker className="w-5 h-5 text-primary-500" />
            Location & Experience
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
            <input type="text" {...register('location')} className="input-field" placeholder="e.g. San Francisco, CA" />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Experience (yrs)</label>
              <input type="number" {...register('experienceMin')} className="input-field" placeholder="0" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Experience (yrs)</label>
              <input type="number" {...register('experienceMax')} className="input-field" placeholder="5" min={0} />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Required Skills *</h2>

          <div className="relative">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleSkillKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="input-field"
              placeholder="Type a skill and press Enter (e.g. React, Node.js)"
            />
            {showSuggestions && skillInput && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => addSkill(s)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-lg"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                    <HiOutlineX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 self-center">Quick add:</span>
            {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 12).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-secondary-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <HiOutlinePlus className="w-3 h-3" />
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Salary & Other */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-500" />
            Compensation & Details
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select {...register('salaryCurrency')} className="input-field">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Salary</label>
              <input type="number" {...register('salaryMin')} className="input-field" placeholder="50000" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Salary</label>
              <input type="number" {...register('salaryMax')} className="input-field" placeholder="120000" min={0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Openings</label>
              <input type="number" {...register('openings')} className="input-field" min={1} max={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline</label>
              <input type="date" {...register('deadline')} className="input-field" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center !py-3">
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'Post Job'
            )}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 !py-3">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;

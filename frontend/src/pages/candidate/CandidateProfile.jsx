import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineUpload,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { updateProfile, uploadResume, uploadAvatar } from '../../features/auth/authSlice';
import { POPULAR_SKILLS, EXPERIENCE_LEVELS } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(1000).optional(),
  experience: z.string().optional(),
  portfolio: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  linkedIn: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  github: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
});

const CandidateProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      experience: user?.experience || '',
      portfolio: user?.portfolio || '',
      linkedIn: user?.linkedIn || '',
      github: user?.github || '',
    },
  });

  const profileStrength = user?.profileStrength || 0;

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 20) {
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
    try {
      await dispatch(updateProfile({ ...data, skills })).unwrap();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await dispatch(uploadAvatar(formData)).unwrap();
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err || 'Failed to upload avatar');
      setAvatarPreview(null);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be less than 5MB');
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await dispatch(uploadResume(formData)).unwrap();
      toast.success('Resume uploaded successfully');
    } catch (err) {
      toast.error(err || 'Failed to upload resume');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete your profile to get better job matches</p>
      </div>

      {/* Profile Strength */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-secondary-700" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${profileStrength} 100`} strokeLinecap="round"
                className={profileStrength >= 80 ? 'text-green-500' : profileStrength >= 50 ? 'text-amber-500' : 'text-red-500'}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{profileStrength}%</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Profile Strength</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {profileStrength >= 80
                ? 'Great profile! You stand out to recruiters.'
                : profileStrength >= 50
                ? 'Good start. Add more details to improve your visibility.'
                : 'Complete your profile to get noticed by top recruiters.'}
            </p>
          </div>
        </div>
      </div>

      {/* Avatar & Resume */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            {avatarPreview || user?.avatarUrl ? (
              <img
                src={avatarPreview || user.avatarUrl}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-3xl font-bold text-primary-600 dark:text-primary-400">
                {getInitials(user?.name)}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <HiOutlinePhotograph className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          {/* Resume Upload */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resume / CV</h3>
            {user?.resumeUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Resume uploaded</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Replace by uploading a new file</p>
                </div>
                <label className="cursor-pointer text-xs font-medium text-green-700 dark:text-green-300 hover:underline">
                  Replace
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-secondary-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-colors group/upload">
                <HiOutlineUpload className="w-6 h-6 text-gray-400 group-hover/upload:text-primary-500 transition-colors" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload your resume</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF only, max 5MB</p>
                </div>
                <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineUser className="w-5 h-5 text-primary-500" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input type="text" {...register('name')} className="input-field" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="tel" {...register('phone')} className="input-field" placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={user?.email || ''} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <div className="relative">
                <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" {...register('location')} className="input-field pl-10" placeholder="City, Country" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
            <textarea {...register('bio')} rows={4} className="input-field resize-none" placeholder="Tell employers about yourself..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience Level</label>
            <select {...register('experience')} className="input-field">
              <option value="">Select experience</option>
              {EXPERIENCE_LEVELS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skills</h2>

          <div className="relative">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => { setSkillInput(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleSkillKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="input-field"
              placeholder="Type a skill and press Enter"
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
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 self-center">Suggestions:</span>
            {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 10).map((s) => (
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

        {/* Social Links */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Links & Portfolio</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio / Website</label>
            <input type="url" {...register('portfolio')} className="input-field" placeholder="https://yourportfolio.com" />
            {errors.portfolio && <p className="text-red-500 text-xs mt-1">{errors.portfolio.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
            <input type="url" {...register('linkedIn')} className="input-field" placeholder="https://linkedin.com/in/yourprofile" />
            {errors.linkedIn && <p className="text-red-500 text-xs mt-1">{errors.linkedIn.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub</label>
            <input type="url" {...register('github')} className="input-field" placeholder="https://github.com/yourusername" />
            {errors.github && <p className="text-red-500 text-xs mt-1">{errors.github.message}</p>}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3 flex items-center justify-center">
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Save Profile'
          )}
        </button>
      </form>
    </div>
  );
};

export default CandidateProfile;

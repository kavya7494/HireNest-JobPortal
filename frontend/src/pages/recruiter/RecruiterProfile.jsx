import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  HiOutlineOfficeBuilding,
  HiOutlineGlobe,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import { updateProfile, uploadAvatar } from '../../features/auth/authSlice';
import { COMPANY_SIZES } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required'),
  companySize: z.string().optional(),
  companyWebsite: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  bio: z.string().max(500).optional(),
});

const RecruiterProfile = () => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      companyName: user?.companyName || '',
      companySize: user?.companySize || '',
      companyWebsite: user?.companyWebsite || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Company Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your company details and profile</p>
      </div>

      {/* Avatar */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {avatarPreview || user?.avatarUrl ? (
              <img
                src={avatarPreview || user.avatarUrl}
                alt={user?.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-400">
                {getInitials(user?.name)}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <HiOutlinePhotograph className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.companyName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {user?.isApproved ? '✓ Approved' : '⏳ Pending approval'}
            </p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" {...register('name')} className="input-field" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="tel" {...register('phone')} className="input-field" placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={user?.email || ''} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineOfficeBuilding className="w-5 h-5 text-primary-500" />
            Company Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input type="text" {...register('companyName')} className="input-field" />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Size</label>
              <select {...register('companySize')} className="input-field">
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Website</label>
            <div className="relative">
              <HiOutlineGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="url" {...register('companyWebsite')} className="input-field pl-10" placeholder="https://company.com" />
            </div>
            {errors.companyWebsite && <p className="text-red-500 text-xs mt-1">{errors.companyWebsite.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio / About</label>
            <textarea {...register('bio')} rows={4} className="input-field resize-none" placeholder="Tell candidates about your company..." />
          </div>
        </div>

        <button type="submit" disabled={loading || !isDirty} className="btn-primary w-full !py-3 flex items-center justify-center">
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default RecruiterProfile;

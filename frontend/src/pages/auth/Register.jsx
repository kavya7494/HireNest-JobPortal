import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { register as registerAction } from '../../features/auth/authSlice';
import { ROLES, COMPANY_SIZES } from '../../utils/constants';

const baseSchema = {
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/\d/, 'Must include a number')
    .regex(/[@$!%*?&#]/, 'Must include a special character'),
  phone: z.string().optional(),
};

const candidateSchema = z.object({ ...baseSchema, role: z.literal('candidate') });

const recruiterSchema = z.object({
  ...baseSchema,
  role: z.literal('recruiter'),
  companyName: z.string().min(2, 'Company name is required'),
  companySize: z.string().min(1, 'Select company size'),
  companyWebsite: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('candidate');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const schema = role === 'recruiter' ? recruiterSchema : candidateSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role },
  });

  const switchRole = (newRole) => {
    setRole(newRole);
    reset({ role: newRole });
  };

  const onSubmit = async (data) => {
    try {
      await dispatch(registerAction(data)).unwrap();
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-otp', { replace: true });
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Create your account</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Start your journey with HireNest Elite</p>
      </div>

      <div className="flex bg-gray-100 dark:bg-secondary-800 rounded-lg p-1">
        {['candidate', 'recruiter'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => switchRole(r)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role === r
                ? 'bg-white dark:bg-secondary-700 text-primary-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {r === 'candidate' ? 'Job Seeker' : 'Recruiter'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('role')} value={role} />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" {...register('name')} className="input-field pl-10" placeholder="John Doe" />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="email" {...register('email')} className="input-field pl-10" placeholder="you@example.com" />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="input-field pl-10 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          <div className="flex gap-1 mt-2">
            {[/[a-z]/, /[A-Z]/, /\d/, /[@$!%*?&#]/, /.{8,}/].map((regex, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-secondary-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    regex.test('') ? 'w-full bg-green-500' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
          <div className="relative">
            <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="tel" {...register('phone')} className="input-field pl-10" placeholder="+1 234 567 8900" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {role === 'recruiter' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('companyName')}
                    className="input-field pl-10"
                    placeholder="Acme Inc."
                  />
                </div>
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Size</label>
                <select {...register('companySize')} className="input-field">
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Website (Optional)
                </label>
                <input
                  type="url"
                  {...register('companyWebsite')}
                  className="input-field"
                  placeholder="https://company.com"
                />
                {errors.companyWebsite && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyWebsite.message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 flex items-center justify-center">
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            `Create ${role === 'recruiter' ? 'Recruiter' : ''} Account`
          )}
        </button>
      </form>

      {role === 'recruiter' && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          Recruiter accounts require admin approval before you can post jobs.
        </p>
      )}

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
};

export default Register;

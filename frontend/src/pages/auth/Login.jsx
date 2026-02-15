import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { login, setOtpEmail } from '../../features/auth/authSlice';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      if (result.requiresVerification) {
        dispatch(setOtpEmail(result.email));
        toast('Please verify your email first', { icon: '📧' });
        navigate('/verify-otp', { replace: true });
        return;
      }
      toast.success(`Welcome back, ${result.user.name}!`);
      const role = result.user.role;
      if (from !== '/') {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'recruiter') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err || 'Login failed');
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
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sign in to continue to your dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              {...register('email')}
              className="input-field pl-10"
              placeholder="you@example.com"
            />
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
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 flex items-center justify-center">
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Create one
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-secondary-700 pt-5">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">Demo Accounts</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Admin', email: 'admin@hirenest.com', pass: 'Admin@1234' },
            { label: 'Recruiter', email: 'recruiter@hirenest.com', pass: 'Recruiter@1234' },
            { label: 'Candidate', email: 'candidate@hirenest.com', pass: 'Candidate@1234' },
          ].map(({ label, email, pass }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                onSubmit({ email, password: pass });
              }}
              className="text-xs py-2 px-3 rounded-lg border border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-600 dark:hover:border-primary-700 dark:hover:text-primary-400 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Login;

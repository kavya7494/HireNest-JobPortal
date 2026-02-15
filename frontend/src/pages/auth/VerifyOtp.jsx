import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineMailOpen, HiOutlineRefresh } from 'react-icons/hi';
import { verifyOtp, resendOtp, clearOtpState } from '../../features/auth/authSlice';

const OTP_LENGTH = 6;
const OTP_EXPIRY = 300; // 5 minutes
const RESEND_COOLDOWN = 60;

const VerifyOtp = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(OTP_EXPIRY);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, otpEmail, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!otpEmail) {
      navigate('/login', { replace: true });
      return;
    }
    inputRefs.current[0]?.focus();
  }, [otpEmail, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectMap = {
        candidate: '/candidate/dashboard',
        recruiter: '/recruiter/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(redirectMap[user.role] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newOtp.join('');
    if (code.length === OTP_LENGTH) {
      handleVerify(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => {
      newOtp[i] = ch;
    });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();

    if (pasted.length === OTP_LENGTH) {
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    if (!code || code.length !== OTP_LENGTH) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    try {
      const result = await dispatch(verifyOtp({ email: otpEmail, otp: code })).unwrap();
      toast.success(`Welcome, ${result.user.name}!`);
    } catch (err) {
      toast.error(err || 'Invalid OTP code');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await dispatch(resendOtp({ email: otpEmail })).unwrap();
      toast.success('A new OTP has been sent to your email');
      setTimer(OTP_EXPIRY);
      setResendTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err?.message || err || 'Failed to resend OTP');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HiOutlineMailOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-gray-900 dark:text-white">{otpEmail}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 bg-white dark:bg-secondary-800 text-gray-900 dark:text-white outline-none ${
              digit
                ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/20'
                : 'border-gray-200 dark:border-secondary-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20'
            }`}
            disabled={loading}
          />
        ))}
      </div>

      {timer > 0 ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Code expires in{' '}
          <span className={`font-medium ${timer <= 60 ? 'text-red-500' : 'text-primary-600 dark:text-primary-400'}`}>
            {formatTime(timer)}
          </span>
        </p>
      ) : (
        <p className="text-center text-sm text-red-500 font-medium">Code has expired. Please request a new one.</p>
      )}

      <button
        onClick={() => handleVerify(otp.join(''))}
        disabled={loading || otp.join('').length !== OTP_LENGTH}
        className="btn-primary w-full !py-2.5 flex items-center justify-center"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          'Verify Email'
        )}
      </button>

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={resendTimer > 0 || loading}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
        </button>
      </div>

      <button
        onClick={() => {
          dispatch(clearOtpState());
          navigate('/login');
        }}
        className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        Back to login
      </button>
    </motion.div>
  );
};

export default VerifyOtp;

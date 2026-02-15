export const APP_NAME = 'HireNest Elite';

export const ROLES = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
};

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  REJECTED: 'rejected',
  HIRED: 'hired',
};

export const STATUS_COLORS = {
  applied: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Applied' },
  shortlisted: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Shortlisted' },
  interview: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Interview' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Rejected' },
  hired: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Hired' },
};

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

export const EXPERIENCE_LEVELS = [
  { value: '0-1', label: 'Entry Level (0-1 yr)' },
  { value: '1-3', label: 'Junior (1-3 yrs)' },
  { value: '3-5', label: 'Mid Level (3-5 yrs)' },
  { value: '5-8', label: 'Senior (5-8 yrs)' },
  { value: '8+', label: 'Lead/Principal (8+ yrs)' },
];

export const SALARY_RANGES = [
  { value: '0-50000', label: '$0 - $50K' },
  { value: '50000-80000', label: '$50K - $80K' },
  { value: '80000-120000', label: '$80K - $120K' },
  { value: '120000-160000', label: '$120K - $160K' },
  { value: '160000-200000', label: '$160K - $200K' },
  { value: '200000+', label: '$200K+' },
];

export const POPULAR_SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript',
  'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
  'Java', 'Spring Boot', 'Go', 'Rust', 'GraphQL',
  'Vue.js', 'Angular', 'Next.js', 'Redux', 'Express',
  'Machine Learning', 'TensorFlow', 'Django', 'Flask', 'Redis',
  'Git', 'Linux', 'Terraform', 'SQL', 'HTML', 'CSS',
  'Tailwind CSS', 'Figma', 'React Native', 'Swift', 'Kotlin',
];

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

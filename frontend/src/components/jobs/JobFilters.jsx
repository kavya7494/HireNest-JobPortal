import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { setFilters, clearFilters } from '../../features/jobs/jobsSlice';
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS, SALARY_RANGES } from '../../utils/constants';
import useDebounce from '../../hooks/useDebounce';
import { useEffect } from 'react';

const JobFilters = ({ onFilter }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.jobs);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState(filters.search || '');
  const [locationText, setLocationText] = useState(filters.location || '');
  const debouncedSearch = useDebounce(searchText, 400);
  const debouncedLocation = useDebounce(locationText, 400);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch }));
    if (onFilter) onFilter();
  }, [debouncedSearch]);

  useEffect(() => {
    dispatch(setFilters({ location: debouncedLocation }));
    if (onFilter) onFilter();
  }, [debouncedLocation]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    if (onFilter) onFilter();
  };

  const handleClear = () => {
    dispatch(clearFilters());
    setSearchText('');
    setLocationText('');
    if (onFilter) onFilter();
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, val]) => val && !['sortBy', 'sortOrder', 'search', 'location'].includes(key)
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="input-field pl-10"
          />
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder="City, state, or remote"
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`btn-secondary flex items-center gap-2 shrink-0 ${activeFilterCount > 0 ? '!border-primary-300 !text-primary-600' : ''}`}
        >
          <HiOutlineFilter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-1.5 py-0.5 rounded-full dark:bg-primary-900/30 dark:text-primary-300">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                <button onClick={handleClear} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  <HiOutlineX className="w-3.5 h-3.5" />
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Job Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">All Types</option>
                    {JOB_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Work Mode</label>
                  <select
                    value={filters.workMode}
                    onChange={(e) => handleFilterChange('workMode', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">All Modes</option>
                    {WORK_MODES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Salary Range</label>
                  <select
                    value={filters.salaryMin ? `${filters.salaryMin}-${filters.salaryMax}` : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        handleFilterChange('salaryMin', '');
                        dispatch(setFilters({ salaryMax: '' }));
                      } else {
                        const [min, max] = val.split('-');
                        dispatch(setFilters({ salaryMin: min, salaryMax: max || '' }));
                      }
                      if (onFilter) onFilter();
                    }}
                    className="input-field text-sm"
                  >
                    <option value="">Any Salary</option>
                    {SALARY_RANGES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Experience</label>
                  <select
                    value={filters.experienceMin ? `${filters.experienceMin}-${filters.experienceMax}` : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        dispatch(setFilters({ experienceMin: '', experienceMax: '' }));
                      } else {
                        const [min, max] = val.split('-');
                        dispatch(setFilters({ experienceMin: min, experienceMax: max === '+' ? '' : max }));
                      }
                      if (onFilter) onFilter();
                    }}
                    className="input-field text-sm"
                  >
                    <option value="">Any Experience</option>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Sort By</label>
                <div className="flex gap-2">
                  {[
                    { value: 'createdAt', label: 'Newest' },
                    { value: 'salary.max', label: 'Highest Salary' },
                    { value: 'applicationsCount', label: 'Most Applied' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange('sortBy', opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filters.sortBy === opt.value
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-secondary-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-secondary-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobFilters;

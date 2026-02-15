import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineBriefcase } from 'react-icons/hi';
import { fetchJobs, setFilters, clearFilters } from '../../features/jobs/jobsSlice';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const Jobs = () => {
  const dispatch = useDispatch();
  const { jobs, loading, meta, filters } = useSelector((state) => state.jobs);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs({ ...filters, page: meta.page }));
  }, [dispatch, filters]);

  const handlePageChange = (page) => {
    dispatch(fetchJobs({ ...filters, page }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const totalPages = meta.pages || 1;
  const currentPage = meta.page || 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900">
      <div className="bg-gradient-to-r from-primary-600 to-purple-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-display font-bold text-white">Find Your Perfect Role</h1>
            <p className="mt-2 text-primary-100">
              {meta.total ? `${meta.total} jobs available` : 'Browse all open positions'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="lg:flex gap-6">
          <div className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <JobFilters />
            </div>
          </div>

          <div className="flex-1">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <HiOutlineSearch className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <JobFilters />
                </motion.div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <LoadingSkeleton key={i} type="card" count={1} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-12 text-center"
              >
                <HiOutlineBriefcase className="w-16 h-16 text-gray-300 dark:text-secondary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No jobs found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters</p>
                <button onClick={handleClearFilters} className="btn-primary mt-4">
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job, i) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pb-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn-secondary !py-2 !px-3 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)
                      )
                      .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === '...' ? (
                          <span key={`dots-${i}`} className="px-2 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              p === currentPage
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-secondary-700 border border-gray-200 dark:border-secondary-700'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn-secondary !py-2 !px-3 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;

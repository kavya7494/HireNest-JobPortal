import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineShieldCheck,
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineMail,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { fetchAllUsers, approveRecruiter, toggleBlockUser } from '../../features/admin/adminSlice';
import { formatDate, getInitials, capitalizeFirst } from '../../utils/helpers';
import useDebounce from '../../hooks/useDebounce';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const dispatch = useDispatch();
  const { users, loading, meta } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllUsers({ page, limit: 20, role: roleFilter, search: debouncedSearch, blocked: blockedFilter || undefined }));
  }, [dispatch, page, roleFilter, debouncedSearch, blockedFilter]);

  const handleApprove = async (id) => {
    try {
      await dispatch(approveRecruiter(id)).unwrap();
      toast.success('Recruiter approved');
    } catch (err) {
      toast.error(err || 'Failed to approve');
    }
  };

  const handleToggleBlock = async (id, name, isBlocked) => {
    try {
      await dispatch(toggleBlockUser(id)).unwrap();
      toast.success(`${name} ${isBlocked ? 'unblocked' : 'blocked'}`);
    } catch (err) {
      toast.error(err || 'Failed to update user');
    }
  };

  const totalPages = meta.pages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Manage Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meta.total || 0} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
            placeholder="Search by name or email..."
          />
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field !py-2 text-sm w-auto"
          >
            <option value="">All Roles</option>
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={blockedFilter}
            onChange={(e) => { setBlockedFilter(e.target.value); setPage(1); }}
            className="input-field !py-2 text-sm w-auto"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Blocked</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-secondary-800/50 text-left">
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Joined</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {loading && users.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-10 bg-gray-100 dark:bg-secondary-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-secondary-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                            {getInitials(u.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <HiOutlineMail className="w-3 h-3" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : u.role === 'recruiter'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {capitalizeFirst(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {u.isBlocked && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                            <HiOutlineBan className="w-3.5 h-3.5" /> Blocked
                          </span>
                        )}
                        {u.role === 'recruiter' && (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            u.isApproved
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {u.isApproved ? (
                              <><HiOutlineCheckCircle className="w-3.5 h-3.5" /> Approved</>
                            ) : (
                              <><HiOutlineShieldCheck className="w-3.5 h-3.5" /> Pending</>
                            )}
                          </span>
                        )}
                        {!u.isBlocked && u.role !== 'recruiter' && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === 'recruiter' && !u.isApproved && (
                          <button
                            onClick={() => handleApprove(u._id)}
                            className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlock(u._id, u.name, u.isBlocked)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              u.isBlocked
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-secondary-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-secondary-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-secondary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-secondary-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-secondary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from './adminApi';

export const fetchAllUsers = createAsyncThunk('admin/fetchAllUsers', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getAllUsers(params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const approveRecruiter = createAsyncThunk('admin/approveRecruiter', async (id, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.approveRecruiter(id);
    return data.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to approve recruiter');
  }
});

export const toggleBlockUser = createAsyncThunk('admin/toggleBlockUser', async (id, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.toggleBlockUser(id);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update user');
  }
});

export const fetchPlatformStats = createAsyncThunk('admin/fetchPlatformStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getPlatformStats();
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchPlatformAnalytics = createAsyncThunk('admin/fetchPlatformAnalytics', async (_, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getPlatformAnalytics();
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    platformStats: null,
    platformAnalytics: null,
    loading: false,
    error: null,
    meta: { page: 1, limit: 20, total: 0, pages: 0 },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveRecruiter.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx >= 0) state.users[idx] = { ...state.users[idx], ...action.payload };
      })
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload.user._id);
        if (idx >= 0) state.users[idx] = { ...state.users[idx], ...action.payload.user };
      })
      .addCase(fetchPlatformStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.loading = false;
        state.platformStats = action.payload;
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlatformAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.platformAnalytics = action.payload;
      })
      .addCase(fetchPlatformAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;

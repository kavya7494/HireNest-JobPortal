import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import applicationsApi from './applicationsApi';

export const applyToJob = createAsyncThunk('applications/apply', async ({ jobId, data }, { rejectWithValue }) => {
  try {
    const response = await applicationsApi.applyToJob(jobId, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to apply');
  }
});

export const fetchMyApplications = createAsyncThunk('applications/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const { data } = await applicationsApi.getMyApplications(params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
  }
});

export const fetchJobApplicants = createAsyncThunk('applications/fetchApplicants', async ({ jobId, params }, { rejectWithValue }) => {
  try {
    const { data } = await applicationsApi.getJobApplicants(jobId, params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch applicants');
  }
});

export const updateApplicationStatus = createAsyncThunk('applications/updateStatus', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await applicationsApi.updateStatus(id, data);
    return response.data.data.application;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update status');
  }
});

export const fetchApplicationStats = createAsyncThunk('applications/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await applicationsApi.getStats();
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchRecruiterAnalytics = createAsyncThunk('applications/fetchRecruiterAnalytics', async (_, { rejectWithValue }) => {
  try {
    const { data } = await applicationsApi.getRecruiterAnalytics();
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
  }
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    myApplications: [],
    applicants: [],
    stats: null,
    analytics: null,
    loading: false,
    error: null,
    meta: { page: 1, limit: 20, total: 0, pages: 0 },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearApplicants: (state) => {
      state.applicants = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyToJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications.unshift(action.payload.application);
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobApplicants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.applicants = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchJobApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const idx = state.applicants.findIndex((a) => a._id === action.payload._id);
        if (idx >= 0) state.applicants[idx] = { ...state.applicants[idx], ...action.payload };
      })
      .addCase(fetchApplicationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchRecruiterAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearError, clearApplicants } = applicationsSlice.actions;
export default applicationsSlice.reducer;

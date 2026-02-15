import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jobsApi from './jobsApi';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (params, { rejectWithValue }) => {
  try {
    const { data } = await jobsApi.getJobs(params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
  }
});

export const fetchJobById = createAsyncThunk('jobs/fetchJobById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await jobsApi.getJobById(id);
    return data.data.job;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch job');
  }
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData, { rejectWithValue }) => {
  try {
    const { data } = await jobsApi.createJob(jobData);
    return data.data.job;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create job');
  }
});

export const updateJob = createAsyncThunk('jobs/updateJob', async ({ id, data: jobData }, { rejectWithValue }) => {
  try {
    const { data } = await jobsApi.updateJob(id, jobData);
    return data.data.job;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update job');
  }
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (id, { rejectWithValue }) => {
  try {
    await jobsApi.deleteJob(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete job');
  }
});

export const fetchRecruiterJobs = createAsyncThunk('jobs/fetchRecruiterJobs', async (params, { rejectWithValue }) => {
  try {
    const { data } = await jobsApi.getRecruiterJobs(params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch recruiter jobs');
  }
});

export const toggleSaveJob = createAsyncThunk('jobs/toggleSaveJob', async (id, { rejectWithValue }) => {
  try {
    const { data } = await jobsApi.toggleSaveJob(id);
    return { id, saved: data.data.saved };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to save job');
  }
});

export const fetchSavedJobs = createAsyncThunk('jobs/fetchSavedJobs', async (_, { rejectWithValue }) => {
  try {
    const { data } = await jobsApi.getSavedJobs();
    return data.data.savedJobs;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch saved jobs');
  }
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    currentJob: null,
    recruiterJobs: [],
    savedJobs: [],
    loading: false,
    error: null,
    meta: { page: 1, limit: 12, total: 0, pages: 0 },
    filters: {
      search: '',
      location: '',
      jobType: '',
      workMode: '',
      salaryMin: '',
      salaryMax: '',
      experienceMin: '',
      experienceMax: '',
      skills: '',
      companySize: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        location: '',
        jobType: '',
        workMode: '',
        salaryMin: '',
        salaryMax: '',
        experienceMin: '',
        experienceMax: '',
        skills: '',
        companySize: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.recruiterJobs.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const idx = state.recruiterJobs.findIndex((j) => j._id === action.payload._id);
        if (idx >= 0) state.recruiterJobs[idx] = action.payload;
        if (state.currentJob?._id === action.payload._id) state.currentJob = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.recruiterJobs = state.recruiterJobs.filter((j) => j._id !== action.payload);
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
      })
      .addCase(fetchRecruiterJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecruiterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiterJobs = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchRecruiterJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.savedJobs = action.payload;
      })
      .addCase(toggleSaveJob.fulfilled, (state, action) => {
        if (!action.payload.saved) {
          state.savedJobs = state.savedJobs.filter((j) => j._id !== action.payload.id);
        }
      });
  },
});

export const { setFilters, clearFilters, clearCurrentJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;

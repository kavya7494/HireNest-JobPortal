import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from './authApi';

// Read from localStorage but DO NOT trust it yet — token must be verified with backend first
const tokenFromStorage = localStorage.getItem('accessToken') || null;
const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(userData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (otpData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.verifyOtp(otpData);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
  }
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async (emailData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.resendOtp(emailData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(credentials);
    if (data.data?.requiresVerification) {
      return { requiresVerification: true, email: data.data.email };
    }
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  } catch (error) {
    const errData = error.response?.data;
    if (errData?.data?.requiresVerification) {
      return { requiresVerification: true, email: errData.data.email };
    }
    return rejectWithValue(errData?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
  } catch (error) {
    /* continue regardless */
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.getMe();
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.updateProfile(userData);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

export const uploadResume = createAsyncThunk('auth/uploadResume', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.uploadResume(formData);
    const user = data.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload resume');
  }
});

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.uploadAvatar(formData);
    const user = data.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    accessToken: tokenFromStorage,
    // NEVER trust localStorage token blindly — always verify with backend first
    isAuthenticated: false,
    // true while we're checking the token with the backend on first load
    isVerifying: !!tokenFromStorage,
    loading: false,
    error: null,
    otpEmail: null,
    requiresVerification: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setOtpEmail: (state, action) => {
      state.otpEmail = action.payload;
      state.requiresVerification = true;
    },
    clearOtpState: (state) => {
      state.otpEmail = null;
      state.requiresVerification = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.otpEmail = action.payload.email;
        state.requiresVerification = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.otpEmail = null;
        state.requiresVerification = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.requiresVerification) {
          state.otpEmail = action.payload.email;
          state.requiresVerification = true;
        } else {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.requiresVerification = false;
          state.otpEmail = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.otpEmail = null;
        state.requiresVerification = false;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerifying = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        // Token was invalid/expired — clear everything so user must log in again
        state.loading = false;
        state.isVerifying = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setUser, setOtpEmail, clearOtpState } = authSlice.actions;
export default authSlice.reducer;

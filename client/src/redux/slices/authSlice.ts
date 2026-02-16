import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Async Thunks
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const user = await AuthService.getMe();
    return user;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return rejectWithValue(message);
  }
});

interface LoginData {
  email: string;
  password: string;
}

export const loginUser = createAsyncThunk('auth/login', async (data: LoginData, { rejectWithValue }) => {
  try {
    const user = await AuthService.login(data);
    return user;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return rejectWithValue(message);
  }
});

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const registerUser = createAsyncThunk('auth/register', async (data: RegisterData, { rejectWithValue }) => {
  try {
    const user = await AuthService.register(data);
    return user;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await AuthService.logout();
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Logout failed";
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Check Auth
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      toast.success('Welcome back!');
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      toast.error(action.payload as string || 'Login failed');
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      toast.success('Account created successfully!');
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      toast.error(action.payload as string || 'Registration failed');
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      toast.success('Logged out successfully');
    });
  },
});

export const { setUser, clearError } = authSlice.actions;

export default authSlice.reducer;

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import { OtpVerificationRequest, User } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null; // ✅ Added token
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  tempPhoneNumber: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"), // ✅ Load from storage
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
  otpSent: false,
  tempPhoneNumber: null,
};

// Async thunks
export const registerTransporter = createAsyncThunk(
  "auth/registerTransporter",
  async (
    userData: {
      name: string;
      phoneNumber: string;
      email: string;
      businessName: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("Register transporter thunk with data:", userData);
      const response = await authService.registerTransporter(userData);
      console.log("Register transporter response:", response);
      return { ...response, phoneNumber: userData.phoneNumber };
    } catch (error: any) {
      console.error("Register transporter error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Transporter registration failed"
      );
    }
  }
);

export const registerSeller = createAsyncThunk(
  "auth/registerSeller",
  async (
    userData: {
      name: string;
      phoneNumber: string;
      email: string;
      sellerType: "individual" | "company" | "association";
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("Register seller thunk with data:", userData);
      const response = await authService.registerSeller(userData);
      console.log("Register seller response:", response);
      return { ...response, phoneNumber: userData.phoneNumber };
    } catch (error: any) {
      console.error("Register seller error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Seller registration failed"
      );
    }
  }
);

export const loginWithPhone = createAsyncThunk(
  "auth/loginWithPhone",
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithPhone(phoneNumber);
      return { ...response, phoneNumber };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data: OtpVerificationRequest, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOtp(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null; // ✅ clear token
      state.isAuthenticated = false;
      state.error = null;
      state.otpSent = false;
      state.tempPhoneNumber = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register transporter
      .addCase(registerTransporter.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerTransporter.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.otpSent = true;
          state.tempPhoneNumber = action.payload.phoneNumber;
          console.log("Transporter registration successful:", action.payload);
        }
      )
      .addCase(registerTransporter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register seller
      .addCase(registerSeller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerSeller.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.otpSent = true;
          state.tempPhoneNumber = action.payload.phoneNumber;
          console.log("Seller registration successful:", action.payload);
        }
      )
      .addCase(registerSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Login with phone
      .addCase(loginWithPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginWithPhone.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.otpSent = true;
          state.tempPhoneNumber = action.payload.phoneNumber;
        }
      )
      .addCase(loginWithPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
        const { accessToken, user } = action.payload;
        localStorage.setItem("token", accessToken); // ✅ persist token

        state.token = accessToken; // ✅ store in Redux
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.otpSent = false;
        state.tempPhoneNumber = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.user = action.payload;
        }
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

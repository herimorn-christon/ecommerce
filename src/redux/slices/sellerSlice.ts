import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import sellerService from "../../services/sellerService";
import { SellerProfile, SellerProfileFormData } from "../../types";

interface SellerState {
  profile: SellerProfile | null;
  isLoading: boolean;
  error: string | null;
  hasCheckedProfile: boolean; // Flag to track if we've checked for a profile
}

const initialState: SellerState = {
  profile: null,
  isLoading: false,
  error: null,
  hasCheckedProfile: false,
};

// Async thunks
export const fetchSellerProfile = createAsyncThunk(
  "seller/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await sellerService.getSellerProfile();
      return response;
    } catch (error: any) {
      // We want to specifically handle 404 as "no profile exists" case
      if (error.response && error.response.status === 404) {
        return rejectWithValue("profile_not_found");
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch seller profile"
      );
    }
  }
);

export const createSellerProfile = createAsyncThunk(
  "seller/createProfile",
  async (profileData: SellerProfileFormData, { rejectWithValue }) => {
    try {
      const response = await sellerService.createSellerProfile(profileData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create seller profile"
      );
    }
  }
);

export const updateSellerProfile = createAsyncThunk(
  "seller/updateProfile",
  async (profileData: Partial<SellerProfileFormData>, { rejectWithValue }) => {
    try {
      const response = await sellerService.updateSellerProfile(profileData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update seller profile"
      );
    }
  }
);

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    resetSellerProfileStatus: (state) => {
      state.error = null;
      state.isLoading = false;
    },
    resetSellerProfileCheck: (state) => {
      state.hasCheckedProfile = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch seller profile
      .addCase(fetchSellerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchSellerProfile.fulfilled,
        (state, action: PayloadAction<SellerProfile>) => {
          state.isLoading = false;
          state.profile = action.payload;
          state.hasCheckedProfile = true;
        }
      )
      .addCase(fetchSellerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasCheckedProfile = true;

        // If specifically profile not found, we still consider it a "successful check"
        if (action.payload === "profile_not_found") {
          state.profile = null;
        }
      })

      // Create seller profile
      .addCase(createSellerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createSellerProfile.fulfilled,
        (state, action: PayloadAction<SellerProfile>) => {
          state.isLoading = false;
          state.profile = action.payload;
          state.hasCheckedProfile = true;
        }
      )
      .addCase(createSellerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update seller profile
      .addCase(updateSellerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateSellerProfile.fulfilled,
        (state, action: PayloadAction<SellerProfile>) => {
          state.isLoading = false;
          state.profile = action.payload;
        }
      )
      .addCase(updateSellerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSellerProfileStatus, resetSellerProfileCheck } =
  sellerSlice.actions;
export default sellerSlice.reducer;

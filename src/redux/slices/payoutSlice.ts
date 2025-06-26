import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import payoutService from "../../services/payoutService";
import { SellerPayout, SellerPayoutRequest } from "../../types";

// Define the state interface
interface PayoutState {
  payouts: SellerPayout[];
  selectedPayout: SellerPayout | null;
  isLoading: boolean;
  error: string | null;
  earningsSummary: {
    totalEarnings: string;
    totalPlatformFees: string;
    totalNetEarnings: string;
    totalPayouts: string;
    availableBalance: number;
    isLoading: boolean;
    error: string | null;
  };
}

// Initial state
const initialState: PayoutState = {
  payouts: [],
  selectedPayout: null,
  isLoading: false,
  error: null,
  earningsSummary: {
    totalEarnings: "0",
    totalPlatformFees: "0",
    totalNetEarnings: "0",
    totalPayouts: "0",
    availableBalance: 0,
    isLoading: false,
    error: null,
  },
};

// Async thunks
export const fetchSellerPayouts = createAsyncThunk(
  "payouts/fetchSellerPayouts",
  async (_, { rejectWithValue }) => {
    try {
      const payouts = await payoutService.getSellerPayouts();
      return payouts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payouts"
      );
    }
  }
);

export const fetchEarningsSummary = createAsyncThunk(
  "payouts/fetchEarningsSummary",
  async (_, { rejectWithValue }) => {
    try {
      const summary = await payoutService.getEarningsSummary();
      return summary;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch earnings summary"
      );
    }
  }
);

export const fetchPayoutById = createAsyncThunk(
  "payouts/fetchPayoutById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await payoutService.getPayoutById(id);
      return response.payout;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payout details"
      );
    }
  }
);

export const requestPayout = createAsyncThunk(
  "payouts/requestPayout",
  async (payoutRequest: SellerPayoutRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await payoutService.requestPayout(payoutRequest);
      // After a successful request, refresh the payout list
      dispatch(fetchSellerPayouts());
      return response.payout;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request payout"
      );
    }
  }
);

export const cancelPayout = createAsyncThunk(
  "payouts/cancelPayout",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await payoutService.cancelPayout(id);
      // After a successful cancellation, refresh the payout list
      dispatch(fetchSellerPayouts());
      return response.payout;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel payout"
      );
    }
  }
);

// Create slice
const payoutSlice = createSlice({
  name: "payouts",
  initialState,
  reducers: {
    setAvailableBalance: (state, action: PayloadAction<number>) => {
      state.earningsSummary.availableBalance = action.payload;
    },
    clearPayoutErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch seller payouts
      .addCase(fetchSellerPayouts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerPayouts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payouts = action.payload;
        state.error = null;
      })
      .addCase(fetchSellerPayouts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch earnings summary is handled below

      // Fetch payout by ID
      .addCase(fetchPayoutById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayoutById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPayout = action.payload;
        state.error = null;
      })
      .addCase(fetchPayoutById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Request payout
      .addCase(requestPayout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPayout.fulfilled, (state) => {
        state.isLoading = false;
        // The payout is added to the list via fetchSellerPayouts in the thunk
        state.error = null;
      })
      .addCase(requestPayout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Cancel payout
      .addCase(cancelPayout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelPayout.fulfilled, (state) => {
        state.isLoading = false;
        // The payout is updated in the list via fetchSellerPayouts in the thunk
        state.error = null;
      })
      .addCase(cancelPayout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch earnings summary
      .addCase(fetchEarningsSummary.pending, (state) => {
        state.earningsSummary.isLoading = true;
        state.earningsSummary.error = null;
      })
      .addCase(fetchEarningsSummary.fulfilled, (state, action) => {
        state.earningsSummary.isLoading = false;
        state.earningsSummary.totalEarnings = action.payload.totalEarnings;
        state.earningsSummary.totalPlatformFees =
          action.payload.totalPlatformFees;
        state.earningsSummary.totalNetEarnings =
          action.payload.totalNetEarnings;
        state.earningsSummary.totalPayouts = action.payload.totalPayouts;

        // Calculate available balance based on net earnings minus payouts
        const availableBalance =
          parseFloat(action.payload.totalNetEarnings) -
          parseFloat(action.payload.totalPayouts);
        state.earningsSummary.availableBalance = availableBalance;

        state.earningsSummary.error = null;
      })
      .addCase(fetchEarningsSummary.rejected, (state, action) => {
        state.earningsSummary.isLoading = false;
        state.earningsSummary.error = action.payload as string;
      });
  },
});

export const { setAvailableBalance, clearPayoutErrors } = payoutSlice.actions;
export default payoutSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import azampayService from '../../services/azampayService';

interface PaymentState {
  reference: string | null;
  status: 'idle' | 'pending' | 'success' | 'failed';
  error: string | null;
  transactionId: string | null;
  isLoading: boolean;
}

const initialState: PaymentState = {
  reference: null,
  status: 'idle',
  error: null,
  transactionId: null,
  isLoading: false
};

// Async thunks for AzamPay
export const initiateAzamPayPayment = createAsyncThunk(
  'payment/initiateAzamPay',
  async ({ 
    amount, 
    phoneNumber, 
    orderId 
  }: { 
    amount: number; 
    phoneNumber: string;
    orderId?: string;
  }, { rejectWithValue }) => {
    try {
      return await azampayService.initiatePayment(amount, phoneNumber, orderId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initiate payment');
    }
  }
);

export const checkAzamPayStatus = createAsyncThunk(
  'payment/checkAzamPayStatus',
  async (reference: string, { rejectWithValue }) => {
    try {
      return await azampayService.checkPaymentStatus(reference);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check payment status');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.reference = null;
      state.status = 'idle';
      state.error = null;
      state.transactionId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initiate payment
      .addCase(initiateAzamPayPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiateAzamPayPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reference = action.payload.reference;
        state.status = 'pending';
      })
      .addCase(initiateAzamPayPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.status = 'failed';
      })
      
      // Check payment status
      .addCase(checkAzamPayStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAzamPayStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = action.payload.status;
        if (action.payload.transactionId) {
          state.transactionId = action.payload.transactionId;
        }
      })
      .addCase(checkAzamPayStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
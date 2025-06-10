import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import addressService from '../../services/orderService';
import { Order, Address, PaymentCallback } from '../../types';

export interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  addresses: [],
  isLoading: false,
  error: null
};

// Async thunks for orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getOrders();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await orderService.getOrderById(orderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

// Update the interface to match server's expected format
interface CreateOrderData {
  items: { productId: string; quantity: number }[];
  deliveryOption: string;
  paymentMethod: string;
  paymentDetails: {
    provider: string;
    phoneNumber: string;
    transactionId: string; // Move transactionId here
  };
  addressId: string;
  notes?: string;
}

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    console.log('Creating order with data:', orderData);  
    try {
      // Validate transaction ID at root level
      if (!orderData.transactionId || typeof orderData.transactionId !== 'string') {
        throw new Error('Transaction ID must be a valid string');
      }

      // Log the validated order data
      console.log('Creating order with validated data:', orderData);

      const response = await orderService.createOrder(orderData);
      return response;
    } catch (error: any) {
      console.error('Order creation failed:', {
        error,
        orderData
      });
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      // Send status in the correct format
      const response = await orderService.cancelOrder({
        orderId,
        status: 'cancelled' // Exactly match the expected value
      });
      return response;
    } catch (error: any) {
      console.error('Order cancellation failed:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

// Address management
export const fetchAddresses = createAsyncThunk(
  'orders/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getAddresses();
      console.log('Fetched addresses:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createAddress = createAsyncThunk(
  'orders/createAddress',
  async (addressData: Omit<Address, 'id' | 'userId'>, { rejectWithValue }) => {
    try {
      const response = await addressService.createAddress(addressData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Payment processing
export const initiatePayment = createAsyncThunk(
  'orders/initiatePayment',
  async (data: { amount: number; phone: string }, { rejectWithValue }) => {
    try {
      return await paymentService.initiatePayment(data.amount, data.phone);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate payment');
    }
  }
);

export const checkPaymentStatus = createAsyncThunk(
  'orders/checkPaymentStatus',
  async (reference: string, { rejectWithValue }) => {
    try {
      return await paymentService.checkPaymentStatus(reference);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check payment status');
    }
  }
);

export const handlePaymentCallback = createAsyncThunk(
  'orders/handlePaymentCallback',
  async (callbackData: PaymentCallback, { rejectWithValue }) => {
    try {
      return await orderService.handlePaymentCallback(callbackData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment callback');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    clearPaymentData: (state) => {
      state.paymentReference = null;
      state.paymentStatus = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.selectedOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false;
        if (state.selectedOrder) {
          state.selectedOrder.status = 'cancelled';
        }
        state.orders = state.orders.map(order => 
          order.id === action.payload.id ? { ...order, status: 'cancelled' } : order
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Payment processing
      .addCase(initiatePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentReference = action.payload.reference;
        state.paymentStatus = 'pending';
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.paymentStatus = 'failed';
      })
      
      // Handle payment callback
      .addCase(handlePaymentCallback.fulfilled, (state, action) => {
        state.paymentStatus = action.payload.transactionstatus;
      })
      
      // Check payment status
      .addCase(checkPaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = action.payload.status;
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearSelectedOrder, clearPaymentData } = ordersSlice.actions;
export default ordersSlice.reducer;
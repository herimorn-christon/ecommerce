import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import transporterService from "../../services/transporterService";
import { Transporter } from "../../types";

// Define the shape of a transporter order based on the API response
interface TransporterOrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  productId: string;
  product: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
    seller: {
      id: string;
      businessName: string;
      user: {
        name: string;
        phoneNumber: string;
      };
    };
  };
}

interface TransporterOrder {
  id: string;
  orderNumber: string;
  status: string;
  deliveryOption: string;
  trackingNumber: string | null;
  createdAt: string;
  address: {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    district: string;
    postalCode?: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    userId: string;
  };
  items: TransporterOrderItem[];
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
  };
}

interface TransporterState {
  transporters: Transporter[];
  selectedTransporter: Transporter | null;
  orders: TransporterOrder[];
  ordersCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransporterState = {
  transporters: [],
  selectedTransporter: null,
  orders: [],
  ordersCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTransporters = createAsyncThunk(
  "transporters/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const transporters = await transporterService.getTransporters();
      return transporters;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transporters"
      );
    }
  }
);

export const fetchCurrentTransporter = createAsyncThunk(
  "transporters/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const transporter = await transporterService.getCurrentTransporter();
      return transporter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch current transporter details"
      );
    }
  }
);

export const fetchTransporterById = createAsyncThunk(
  "transporters/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const transporter = await transporterService.getTransporterById(id);
      return transporter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transporter details"
      );
    }
  }
);

export const fetchTransporterOrders = createAsyncThunk(
  "transporters/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await transporterService.getMyOrders();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transporter orders"
      );
    }
  }
);

const transporterSlice = createSlice({
  name: "transporter",
  initialState,
  reducers: {
    clearTransporterState: (state) => {
      state.transporters = [];
      state.selectedTransporter = null;
      state.orders = [];
      state.error = null;
    },
    setSelectedTransporter: (state, action) => {
      state.selectedTransporter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all transporters
      .addCase(fetchTransporters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransporters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transporters = action.payload;
      })
      .addCase(fetchTransporters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch current transporter
      .addCase(fetchCurrentTransporter.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentTransporter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransporter = action.payload;
      })
      .addCase(fetchCurrentTransporter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch transporter by ID
      .addCase(fetchTransporterById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransporterById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransporter = action.payload;
      })
      .addCase(fetchTransporterById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch transporter orders
      .addCase(fetchTransporterOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransporterOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.ordersCount = action.payload.count;
      })
      .addCase(fetchTransporterOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransporterState, setSelectedTransporter } =
  transporterSlice.actions;
export default transporterSlice.reducer;

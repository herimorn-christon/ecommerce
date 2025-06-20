import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import addressService from "../../services/addressService";
import { Address } from "../../types";

export interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  isLoading: false,
  error: null,
};

// Async thunks for address management
export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      return await addressService.getAddresses();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch addresses");
    }
  }
);

export const createAddress = createAsyncThunk(
  "address/createAddress",
  async (
    addressData: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      return await addressService.createAddress(addressData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create address");
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async (
    {
      addressId,
      addressData,
    }: { addressId: string; addressData: Partial<Address> },
    { rejectWithValue }
  ) => {
    try {
      return await addressService.updateAddress(addressId, addressData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (addressId: string, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(addressId);
      return addressId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete address");
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "address/setDefaultAddress",
  async (addressId: string, { rejectWithValue }) => {
    try {
      return await addressService.setDefaultAddress(addressId);
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to set as default address"
      );
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAddresses.fulfilled,
        (state, action: PayloadAction<Address[]>) => {
          state.isLoading = false;
          state.addresses = action.payload;
        }
      )
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create address
      .addCase(createAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createAddress.fulfilled,
        (state, action: PayloadAction<Address>) => {
          state.isLoading = false;
          state.addresses.push(action.payload);
        }
      )
      .addCase(createAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateAddress.fulfilled,
        (state, action: PayloadAction<Address>) => {
          state.isLoading = false;
          state.addresses = state.addresses.map((address) =>
            address.id === action.payload.id ? action.payload : address
          );
        }
      )
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteAddress.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.addresses = state.addresses.filter(
            (address) => address.id !== action.payload
          );
        }
      )
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        setDefaultAddress.fulfilled,
        (state, action: PayloadAction<Address>) => {
          state.isLoading = false;
          state.addresses = state.addresses.map((address) => ({
            ...address,
            isDefault: address.id === action.payload.id,
          }));
        }
      )
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default addressSlice.reducer;

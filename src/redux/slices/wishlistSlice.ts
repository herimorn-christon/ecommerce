import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import productService from '../../services/productService';
import { WishlistItem } from '../../types';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  count: number;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
  count: 0
};

// Async thunk to fetch wishlist
export const fetchWishlist = createAsyncThunk<WishlistItem[], void, { rejectValue: string }>(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getWishlist();
      return response; // Should be an array of WishlistItem
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

// Async thunk to add a product to wishlist
export const addProductToWishlist = createAsyncThunk<WishlistItem, string, { rejectValue: string }>(
  'wishlist/addProductToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      await productService.addToWishlist(productId);
      return { productId }; // Ensure only productId is returned
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product to wishlist');
    }
  }
);

// Change the thunk name to be more consistent with other thunk names
export const removeProductFromWishlist = createAsyncThunk(
  'wishlist/removeProductFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await productService.removeFromWishlist(productId);
      return { productId, response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.count = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.count = state.items.length;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
      })

      // Add Product
      .addCase(addProductToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addProductToWishlist.fulfilled, (state, action: PayloadAction<WishlistItem>) => {
        state.isLoading = false;
        if (!Array.isArray(state.items)) state.items = [];

        const exists = state.items.find(item => item.productId === action.payload.productId);
        if (!exists) {
          state.items.push(action.payload);
          state.count = state.items.length;
        }
      })
      .addCase(addProductToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
      })

      // Update the case to use the new thunk name
      .addCase(removeProductFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeProductFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.productId !== action.payload.productId);
        state.count = state.items.length;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(removeProductFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, WishlistItem } from "../../types";

interface WishlistState {
  items: WishlistItem[];
  count: number;
}

const initialState: WishlistState = {
  items: [],
  count: 0,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<{ product: Product }>) => {
      const { product } = action.payload;
      const existingItem = state.items.find(
        (item) => item.productId === product.id
      );

      if (!existingItem) {
        // Add new item with product info
        state.items.push({
          productId: product.id,
          product,
        });
        state.count = state.items.length;
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.productId !== productId);
      state.count = state.items.length;
    },

    clearWishlist: (state) => {
      state.items = [];
      state.count = 0;
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import productService from "../../services/productService";
import { Category, Product } from "../../types";

interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  categories: Category[];
  selectedCategory: Category | null;
  selectedProduct: Product | null;
  relatedProducts: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  categories: [],
  selectedCategory: null,
  selectedProduct: null,
  relatedProducts: [],
  isLoading: false,
  error: null,
};

// Async thunks for products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getProducts();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getCategories();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchProductsByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      return await productService.getProductsByCategory(categoryId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products by category"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId: string, { rejectWithValue }) => {
    try {
      return await productService.getProductById(productId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details"
      );
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelatedProducts",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const products = await productService.getProductsByCategory(categoryId);
      // Return only 4 random products
      return products.sort(() => Math.random() - 0.5).slice(0, 4);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch related products"
      );
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;

      if (action.payload) {
        state.filteredProducts = state.products.filter(
          (product) => product.categoryId === action.payload?.id
        );
      } else {
        state.filteredProducts = state.products;
      }
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    searchProducts: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase();

      if (searchTerm === "") {
        state.filteredProducts = state.selectedCategory
          ? state.products.filter(
              (product) => product.categoryId === state.selectedCategory?.id
            )
          : state.products;
      } else {
        const filtered = state.products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );

        state.filteredProducts = state.selectedCategory
          ? filtered.filter(
              (product) => product.categoryId === state.selectedCategory?.id
            )
          : filtered;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.isLoading = false;
          state.products = action.payload;
          state.filteredProducts = state.selectedCategory
            ? action.payload.filter(
                (product) => product.categoryId === state.selectedCategory?.id
              )
            : action.payload;
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.isLoading = false;
          state.categories = action.payload;
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch products by category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProductsByCategory.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.isLoading = false;
          state.filteredProducts = action.payload;
        }
      )
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProductById.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.isLoading = false;
          state.selectedProduct = action.payload;
        }
      )
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch related products
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relatedProducts = action.payload.filter(
          (product) => product.id !== state.selectedProduct?.id
        );
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategory, clearSelectedProduct, searchProducts } =
  productsSlice.actions;
export default productsSlice.reducer;

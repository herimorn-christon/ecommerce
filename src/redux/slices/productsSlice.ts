import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import productService from "../../services/productService";
import {
  Category,
  PaginationMeta,
  PaginationParams,
  Product,
} from "../../types";

interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  categories: Category[];
  selectedCategory: Category | null;
  selectedProduct: Product | null;
  relatedProducts: Product[];
  isLoading: boolean;
  error: string | null;
  // Pagination state
  pagination: PaginationMeta;
  currentPage: number;
  itemsPerPage: number;
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
  pagination: {
    total: 0,
    skip: 0,
    take: 10,
    hasMore: false,
  },
  currentPage: 1,
  itemsPerPage: 10,
};

// Async thunks for products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params: PaginationParams = {}, { rejectWithValue }) => {
    try {
      const result = await productService.getProducts(params);
      console.log("Fetched products:", result);
      return result;
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// Async thunk for paginated products
export const fetchProductsPaginated = createAsyncThunk(
  "products/fetchProductsPaginated",
  async (params: PaginationParams = {}, { rejectWithValue }) => {
    try {
      console.log("Fetching products with params:", params);
      const result = await productService.getProductsPaginated(params);
      console.log("Fetched products paginated:", result);
      return result;
    } catch (error: any) {
      console.error("Error fetching products paginated:", error);
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
      const result = await productService.getCategories();
      console.log("Fetched categories:", result);
      return result;
    } catch (error: any) {
      console.error("Error fetching categories:", error);
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
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing items per page
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
          console.log("Setting products to state:", action.payload);
          state.products = action.payload;
          state.filteredProducts = state.selectedCategory
            ? action.payload.filter(
                (product: Product) =>
                  product.categoryId === state.selectedCategory?.id
              )
            : action.payload;
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch paginated products
      .addCase(fetchProductsPaginated.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsPaginated.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("Setting paginated products to state:", action.payload);
        state.products = action.payload.data;
        state.pagination = action.payload.meta;
        state.currentPage =
          Math.floor(action.payload.meta.skip / action.payload.meta.take) + 1;
        state.filteredProducts = state.selectedCategory
          ? action.payload.data.filter(
              (product: Product) =>
                product.categoryId === state.selectedCategory?.id
            )
          : action.payload.data;
      })
      .addCase(fetchProductsPaginated.rejected, (state, action) => {
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
          console.log("Setting categories to state:", action.payload);
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

export const {
  setSelectedCategory,
  clearSelectedProduct,
  searchProducts,
  setCurrentPage,
  setItemsPerPage,
} = productsSlice.actions;
export default productsSlice.reducer;

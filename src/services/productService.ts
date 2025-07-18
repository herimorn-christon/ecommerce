import {
  Category,
  PaginatedResponse,
  PaginationParams,
  Product,
  ProductFormData,
} from "../types";
import api from "./api";

const productService = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get("/categories");
      console.log("Categories API response:", response.data);

      // Handle API response structure: { data: Category[], meta: { total, skip, take, hasMore } }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected categories response structure:", response.data);
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getProducts: async (params?: PaginationParams): Promise<Product[]> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.skip !== undefined) {
        queryParams.append("skip", params.skip.toString());
      }
      if (params?.take !== undefined) {
        queryParams.append("take", params.take.toString());
      }
      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.categoryId) {
        queryParams.append("categoryId", params.categoryId);
      }

      const url = `/products${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      console.log("Products API response:", response.data);

      // Handle API response structure: { data: Product[], meta: { total, skip, take, hasMore } }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected products response structure:", response.data);
      return [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get products with full pagination response
  getProductsPaginated: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Product>> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.skip !== undefined) {
        queryParams.append("skip", params.skip.toString());
      }
      if (params?.take !== undefined) {
        queryParams.append("take", params.take.toString());
      }
      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.categoryId) {
        queryParams.append("categoryId", params.categoryId);
      }

      const url = `/products${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      console.log("Products paginated API response:", response.data);

      // Return the full paginated response
      if (response.data && response.data.data && response.data.meta) {
        return {
          data: response.data.data,
          meta: response.data.meta,
        };
      }

      console.warn("Unexpected products response structure:", response.data);
      return {
        data: [],
        meta: { total: 0, skip: 0, take: 10, hasMore: false },
      };
    } catch (error) {
      console.error("Error fetching products paginated:", error);
      throw error;
    }
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      console.log("Products by category API response:", response.data);

      // Handle API response structure: { data: Product[], meta: { total, skip, take, hasMore } }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn(
        "Unexpected products by category response structure:",
        response.data
      );
      return [];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  getMyProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get("/products/me");
      console.log("My products API response:", response.data);

      // Handle API response structure: { data: Product[], meta: { total, skip, take, hasMore } }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected my products response structure:", response.data);
      return [];
    } catch (error) {
      console.error("Error fetching my products:", error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData: ProductFormData): Promise<Product> => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // Upload a product image
  uploadImage: async (file: File, folder: string = "product-images") => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/uploads/${folder}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Delete a product
  deleteProduct: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Update a product
  updateProduct: async (
    id: string,
    productData: Partial<ProductFormData>
  ): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },

  // Wishlist operations are handled locally with Redux
};

export default productService;

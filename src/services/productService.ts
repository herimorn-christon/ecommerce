import { Category, Product, ProductFormData } from "../types";
import api from "./api";

const productService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await api.get("/products");
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  getMyProducts: async (): Promise<Product[]> => {
    const response = await api.get("/products/me");
    return response.data;
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

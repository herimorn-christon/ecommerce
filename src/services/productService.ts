import api from "./api";

const productService = {
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  getCategoryById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get("/products");
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: string) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  getMyProducts: async () => {
    const response = await api.get("/products/me");
    return response.data;
  },

  // Create a new product
  createProduct: async (productData: any) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // Upload a product image
  uploadImage: async (file: File, fileName: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const response = await api.post("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Wishlist operations are handled locally with Redux
};

export default productService;

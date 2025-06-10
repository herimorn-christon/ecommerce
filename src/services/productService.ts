import api from './api';

const productService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get('/products');
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
    const response = await api.get('/products/me');
    return response.data;
  },

  // Wishlist operations
  addToWishlist: async (productId: string) => {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: string) => {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      console.log('Remove from wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;  // Make sure this returns the full array of wishlist items
  }
};

export default productService;
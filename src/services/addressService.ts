import { Address } from "../types";
import api from "./api";

const addressService = {
  getAddresses: async () => {
    try {
      const response = await api.get("/addresses");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch addresses"
      );
    }
  },

  getAddressById: async (id: string) => {
    try {
      const response = await api.get(`/addresses/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch address"
      );
    }
  },

  createAddress: async (
    addressData: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await api.post("/addresses", addressData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create address"
      );
    }
  },

  updateAddress: async (id: string, addressData: Partial<Address>) => {
    try {
      const response = await api.put(`/addresses/${id}`, addressData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update address"
      );
    }
  },

  deleteAddress: async (id: string) => {
    try {
      const response = await api.delete(`/addresses/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete address"
      );
    }
  },

  setDefaultAddress: async (id: string) => {
    try {
      const response = await api.patch(`/addresses/${id}/default`, {
        isDefault: true,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to set as default address"
      );
    }
  },
};

export default addressService;

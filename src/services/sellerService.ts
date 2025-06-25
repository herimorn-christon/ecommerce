import { SellerProfile, SellerProfileFormData } from "../types";
import api from "./api";

export const sellerService = {
  /**
   * Get the seller profile for the currently authenticated user
   * @returns The seller profile data
   */
  getSellerProfile: async (): Promise<SellerProfile> => {
    try {
      // Using v1 prefix as specified in the requirements
      const response = await api.get("/sellers/me");
      return response.data;
    } catch (error) {
      // This will bubble up to the Redux thunk to handle 404
      throw error;
    }
  },

  /**
   * Create a new seller profile for the currently authenticated user
   * @param profileData The seller profile data to create
   * @returns The created seller profile
   */
  createSellerProfile: async (
    profileData: SellerProfileFormData
  ): Promise<SellerProfile> => {
    const response = await api.post("/sellers", profileData);
    return response.data;
  },

  /**
   * Update an existing seller profile
   * @param profileData The seller profile data to update
   * @returns The updated seller profile
   */
  updateSellerProfile: async (
    profileData: Partial<SellerProfileFormData>
  ): Promise<SellerProfile> => {
    const response = await api.put("/sellers/me", profileData);
    return response.data;
  },

  /**
   * Upload a file (like ID images) to the server
   * @param file The file to upload
   * @param folder The folder to save the file in
   * @returns The file data including URL
   */
  uploadFile: async (file: File, folder: string = "seller-documents") => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/uploads/${folder}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};

export default sellerService;

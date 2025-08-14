import { Transporter, TransporterUpdateRequest } from "../types";
import api from "./api";

interface TransporterOrdersResponse {
  orders: Array<any>; // Using 'any' for now as we'll define a proper type later
  count: number;
}

// Order detail response type based on the GET /orders/{orderId}/transporter endpoint
export interface TransporterOrderDetail {
  id: string;
  orderNumber: string;
  trackingNumber: string | null;
  status: string;
  deliveryOption: string;
  paymentMethod: string;
  paymentDetails: {
    provider: string;
    phoneNumber: string;
    transactionId: string;
  };
  totalAmount: string;
  notes: string;
  addressId: string;
  userId: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: string;
    createdAt: string;
    updatedAt: string;
    orderId: string;
    productId: string;
    transporterId: string;
    product: {
      id: string;
      name: string;
      description: string;
      images: Array<{ url: string }>;
      seller: {
        id: string;
        businessName: string;
        user: {
          name: string;
          phoneNumber: string;
        };
      };
    };
  }>;
  address: {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    district: string;
    postalCode?: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    userId: string;
  };
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
  };
}

const transporterService = {
  // Get all available transporters
  getTransporters: async (): Promise<Transporter[]> => {
    try {
      const response = await api.get("/transporters");
      return response.data;
    } catch (error) {
      console.error("Error fetching transporters:", error);
      throw error;
    }
  },

  // Get current logged in transporter details
  getCurrentTransporter: async (): Promise<Transporter> => {
    try {
      const response = await api.get("/transporters/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current transporter details:", error);
      throw error;
    }
  },

  // Get a specific transporter by ID
  getTransporterById: async (transporterId: string): Promise<Transporter> => {
    try {
      const response = await api.get(`/transporters/${transporterId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching transporter with ID ${transporterId}:`,
        error
      );
      throw error;
    }
  },

  // Get orders assigned to the current transporter
  getMyOrders: async (): Promise<TransporterOrdersResponse> => {
    try {
      const response = await api.get(`/transporters/me/orders`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transporter orders:", error);
      throw error;
    }
  },

  // Get detailed information for a specific order
  getOrderDetails: async (orderId: string): Promise<TransporterOrderDetail> => {
    try {
      const response = await api.get(`/orders/${orderId}/transporter`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching order details for order ${orderId}:`,
        error
      );
      throw error;
    }
  },

  // Update the status of an order
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<TransporterOrderDetail> => {
    try {
      const response = await api.patch(
        `/orders/${orderId}/transporter/status`,
        {
          status,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating order status for order ${orderId}:`, error);
      throw error;
    }
  },

  // Update transporter profile
  updateTransporterProfile: async (
    updateData: TransporterUpdateRequest
  ): Promise<Transporter> => {
    try {
      const response = await api.put("/transporters/me", updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating transporter profile:", error);
      throw error;
    }
  },
};

export default transporterService;

export interface WishlistItem {
  productId: string;
  product: Product;
}

// User types
export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface LoginResponse {
  message: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  otpCode?: string;
}

export interface OtpVerificationRequest {
  phoneNumber: string;
  otpCode: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  unitPrice: string;
  availableQuantity: number;
  isActive: boolean;
  storageType: string;
  alertQuantity: number;
  soldQuantity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  categoryId: string;
  sellerId: string;
  category: Category;
  images: ProductImage[];
  seller: Seller;
}

export interface ProductImage {
  id: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

// Order types
export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface PaymentDetails {
  provider: string;
  phoneNumber: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  deliveryOption: string;
  paymentMethod: string;
  paymentDetails: PaymentDetails;
  addressId: string;
  notes?: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Address types
export interface Address {
  id?: string;
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
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payment types
export interface PaymentRequest {
  amount: number;
  phone: string;
}

export interface PaymentResponse {
  message: string;
  reference?: string;
}

// Add these interfaces to your existing types file

export interface AzamPayConfig {
  merchantId: string;
  appName: string;
  merchantAccountNumber: string;
}

export interface PaymentCallback {
  reference: string;
  transactionstatus: "success" | "failed" | "pending";
  externalreference?: string;
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    message?: string;
    created: string;
  };
  message?: string;
}

export interface PaymentInitiationRequest {
  amount: number;
  phone: string;
  orderId?: string;
  currency?: string;
  provider?: "MPESA" | "TIGOPESA" | "AIRTELMONEY";
  additionalData?: Record<string, string>;
}

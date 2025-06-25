export interface WishlistItem {
  productId: string;
  product: Product;
}

type Role = "admin" | "seller" | "user" | "transporter";

// User types
export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  roles: Role[];
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
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    images: Array<{
      url: string;
    }>;
  };
}

export interface PaymentDetails {
  provider: string;
  phoneNumber: string;
  transactionId: string;
}

export interface Transaction {
  id: string;
  phone: string;
  operator: string;
  provider: string;
  status: string;
  reference: string;
  thirdPartyId?: string;
  amount: string;
  metadata?: {
    transactionId: string;
    [key: string]: any;
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderUser {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string | null;
  status: string;
  deliveryOption: string;
  paymentMethod: string;
  paymentDetails: PaymentDetails;
  totalAmount: string;
  notes: string;
  addressId: string;
  userId: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: Address;
  user?: OrderUser;
  transaction?: Transaction;
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

export type TransactionStatus = "success" | "failed" | "pending";

export interface PaymentCallback {
  reference: string;
  transactionstatus: TransactionStatus;
  externalreference?: string;
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    message?: string;
    created: string;
  };
}

export interface AzampayCallbackEvent {
  message: string;
  reference: string;
  status: TransactionStatus;
  transactionId: string;
}

export interface PaymentInitiationRequest {
  amount: number;
  phone: string;
  orderId?: string;
  currency?: string;
  provider?: "MPESA" | "TIGOPESA" | "AIRTELMONEY";
  additionalData?: Record<string, string>;
}

// Pagination types
export interface PaginationMeta {
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
  search?: string;
  categoryId?: string;
}

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

// Seller types
export interface SellerProfile {
  id: string;
  businessName: string;
  sellerType: string; // "individual" | "company" | "association"
  address: string;
  backNationalId?: string;
  nationalId?: string;
  frontNationalId?: string;
  isVerified: boolean;
  licence?: string;
  country?: string;
  region?: string;
  city?: string;
  district?: string;
  createdAt?: string;
  userId: string;
}

export interface SellerProfileFormData {
  businessName: string;
  sellerType: string; // "individual" | "company" | "association"
  address: string;
  region?: string;
  city?: string;
  country?: string;
  // Additional fields for the form
  nationalId?: string;
  frontNationalId?: string;
  backNationalId?: string;
  companyId?: string;
  associateId?: string;
  district?: string;
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
  seller?: Seller;
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

// Product form data type
export interface ProductFormData {
  name: string;
  unitPrice: number;
  availableQuantity: number;
  imageUrls: string[];
  description: string;
  categoryId: string;
  storageType: string;
  alertQuantity: number;
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
  transporterId?: string; // Add transporterId field
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    images: Array<{
      url: string;
    }>;
  };
  transporter?: Transporter; // Optional transporter relationship
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

// Payout types
export interface SellerPayoutRequest {
  amount: number;
  paymentMethod: string;
  paymentDetails: {
    phone: string;
    operator: string;
  };
  note?: string;
}

export interface SellerPayout {
  id: string;
  sellerId: string;
  amount: string;
  reference: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  metadata: {
    phone: string;
    operator: string;
  };
  createdAt: string;
  updatedAt: string;
  note?: string | null;
}

export interface SellerEarningsSummary {
  totalEarnings: string;
  totalPlatformFees: string;
  totalNetEarnings: string;
  totalPayouts: string;
}

// Transporter types
export interface Transporter {
  id: string;
  businessName: string;
  licenseImage?: string;
  address?: string;
  country?: string;
  region?: string;
  district?: string;
  isVerified: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
}

// Transporter order detail type
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

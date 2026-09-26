export type ProductAvailability = 'InStock' | 'OutOfStock' | 'PreOrder';

export interface ProductVariant {
  id: string;
  name: string;
  weight: string; // e.g. "35g", "110g", "200g"
  price: number; // in INR ₹
  compareAtPrice?: number;
  originalPrice?: number;
  inStock: boolean;
  sku?: string;
}

export interface ProductSEO {
  seoTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  canonicalUrl?: string;
  imageAlt?: string;
}

export interface Product extends ProductSEO {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  description: string;
  brand: string; // e.g. "LE DAMAS"
  category: string; // e.g. "Kunafa Chocolate"
  categorySlug: string;
  images: string[];
  variants?: ProductVariant[];
  ingredients?: string[];
  allergens?: string[];
  weight: string;
  cacaoPercentage?: number;
  origin?: string;
  price: number; // base price in INR ₹
  compareAtPrice?: number;
  originalPrice?: number;
  currency: string; // e.g. "INR"
  availability: ProductAvailability;
  sku?: string;
  rating?: number;
  reviewsCount?: number;
  reviewCount?: number;
  tastingNotes?: string[];
  pairingNotes?: string[];
  dietaryBadges?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewRelease?: boolean;
  inStock: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  title: string;
  tagline: string;
  description: string;
  longDescription?: string;
  heroImage: string;
  seoTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  image: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export type AnalyticsEventType = 
  | 'PAGE_VIEW' 
  | 'PRODUCT_VIEW' 
  | 'ADD_TO_CART' 
  | 'CHECKOUT_STARTED' 
  | 'PAYMENT_ATTEMPT' 
  | 'ORDER_COMPLETED';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  path: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Bansal-nx domain types.
 * The mock layer in src/data/* is the only data source today; every shape here
 * is designed to map 1:1 onto a future REST/DB layer so components never change.
 */

export type Availability = "available" | "unavailable";

export interface ProductVariant {
  id: string;
  size: string;
  colour: string;
  availability: Availability;
}

export type ProductBadge = "new" | "bestseller" | "exclusive" | null;

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  currency: "INR";
  images: string[];
  category: string;
  collections: string[];
  tags: string[];
  badge: ProductBadge;
  shortDescription: string;
  description: string;
  details: string[];
  care: string[];
  sizes: string[];
  colours: string[];
  variants: ProductVariant[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  published: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage: string;
  bannerImage: string;
  productIds: string[];
  featured: boolean;
  published: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type CouponType = "percent" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  perUserLimit: number | null;
  newCustomerOnly: boolean;
  restrictedCollections: string[];
  active: boolean;
  timesUsed: number;
}

export type PermissionKey =
  | "products"
  | "collections"
  | "coupons"
  | "orders"
  | "payments"
  | "shipping"
  | "customers"
  | "content"
  | "settings"
  | "team";

export type AdminRole = "admin";

export interface RoleDefinition {
  key: AdminRole;
  label: string;
  description: string;
  permissions: PermissionKey[];
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string; // mock-seed-data only; a real (backend-authenticated) user never has this client-side
  role: "customer" | AdminRole;
  status: "active" | "blocked";
  createdAt: string;
  addresses: Address[];
}

export interface CartLine {
  productId: string;
  variantId: string;
  size: string;
  colour: string;
  quantity: number;
}

export type PaymentMethod = "razorpay" | "cod";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "refunded";

export type OrderStatus =
  | "confirmed"
  | "processing"
  | "packed"
  | "ready_for_pickup"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "delivery_failed"
  | "ndr"
  | "rto"
  | "lost";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "returned"
  | "refund_initiated"
  | "refund_completed";

export interface TrackingEvent {
  status: OrderStatus;
  label: string;
  location?: string;
  at: string;
  note?: string;
}

export interface Shipment {
  courier: string | null;
  awb: string | null;
  shipmentId: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  attempts: number;
  ndrReason: string | null;
  rto: boolean;
  events: TrackingEvent[];
}

export interface OrderLine {
  productId: string;
  name: string;
  image: string;
  slug: string;
  size: string;
  colour: string;
  quantity: number;
  price: number;
  mrp: number;
}

export interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  razorpayPaymentId: string | null;
  transactionId: string | null;
  paidAt: string | null;
  refundStatus: "none" | "initiated" | "completed";
  refundAmount: number;
}

export interface OrderReturn {
  status: ReturnStatus;
  reason: string;
  requestedAt: string;
  refundAmount: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  createdAt: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment: Payment;
  address: Address;
  shipment: Shipment;
  returnRequest: OrderReturn | null;
}

export interface HomepageContent {
  announcement: { enabled: boolean; text: string };
  hero: {
    eyebrow: string;
    heading: string;
    subheading: string;
    primaryCta: string;
    secondaryCta: string;
  };
  editorial: { heading: string; caption: string; cta: string };
  promo: { heading: string; caption: string; cta: string };
  story: { heading: string; body: string; cta: string };
  sections: { key: string; label: string; visible: boolean }[];
  featuredCollectionIds: string[];
  featuredProductIds: string[];
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  codEnabled: boolean;
  razorpayEnabled: boolean;
  razorpayConnected: boolean;
  freeShippingThreshold: number;
  shippingFee: number;
  codFee: number;
  codMaxOrderValue: number;
  delhiveryConnected: boolean;
  emailProviderConnected: boolean;
  allowGuestBrowsing: boolean;
}

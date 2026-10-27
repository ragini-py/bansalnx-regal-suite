import type {
  HomepageContent,
  Order,
  PermissionKey,
  RoleDefinition,
  StoreSettings,
  User,
} from "./types";

export const storeSettings: StoreSettings = {
  brandName: "Bansal-nx",
  tagline: "CRAFTED FOR THE EXTRAORDINARY YOU",
  supportEmail: "support@bansalnx.in",
  supportPhone: "+91 98110 45500",
  codEnabled: true,
  razorpayEnabled: true,
  razorpayConnected: false,
  freeShippingThreshold: 25000,
  shippingFee: 350,
  codFee: 99,
  codMaxOrderValue: 50000,
  delhiveryConnected: false,
  emailProviderConnected: false,
  allowGuestBrowsing: true,
  catalogMaterials: ["Silk", "Cotton", "Linen", "Georgette"],
  catalogColors: ["Ivory", "Gold", "Rose", "Peach"],
  catalogSizes: ["XS", "S", "M", "L", "XL"],
  catalogCategories: ["Sarees", "Lehengas", "Gowns", "Kurta Sets"],
};

export const permissionLabels: Record<PermissionKey, string> = {
  products: "Products",
  collections: "Collections",
  coupons: "Coupons",
  orders: "Orders",
  payments: "Payments",
  shipping: "Shipping",
  customers: "Customers",
  content: "Content",
  settings: "Settings",
  team: "Team & Roles",
};

export const roles: RoleDefinition[] = [
  {
    key: "admin",
    label: "Admin",
    description: "Full access to the store administration console.",
    permissions: [
      "products",
      "collections",
      "coupons",
      "orders",
      "payments",
      "shipping",
      "customers",
      "content",
      "settings",
      "team",
    ],
  },
];

export function permissionsForRole(role: User["role"]): PermissionKey[] {
  return roles.find((r) => r.key === role)?.permissions ?? [];
}

export const homepageContent: HomepageContent = {
  announcement: {
    enabled: true,
    text: "Bansal NX · 15+ Years of Manufacturing Excellence · Serving 1,000+ Retailers Across India & Overseas",
  },
  hero: {
    eyebrow: "15+ Years of Experience",
    heading: "Redefining Women's Fashion",
    subheading:
      "Direct manufacturer of premium ethnic & contemporary wear in Kolkata. Combining elegance, comfort, and evolving fashion trends.",
    primaryCta: "SHOP NOW",
    secondaryCta: "ABOUT US",
  },
  editorial: {
    heading: "CRAFTED FOR THE EXTRAORDINARY YOU",
    caption:
      "Every collection reflects confidence, individuality, and refined style — from design and manufacturing to the finished garment.",
    cta: "DISCOVER THE COLLECTION",
  },
  promo: {
    heading: "INTRODUCING CHAMAK — BY BANSAL NX",
    caption:
      "A premium women's fashion brand celebrating Indian craftsmanship with a contemporary design approach for today's modern woman.",
    cta: "EXPLORE CHAMAK",
  },
  story: {
    heading: "Over 15 Years of Craftsmanship & Timeless Design",
    body:
      "BANSAL NX has been redefining women's fashion for over 15 years with a commitment to quality, craftsmanship, and timeless design. As a manufacturer of premium ethnic and contemporary wear in Kolkata, we create collections that combine elegance, comfort, and evolving fashion trends. To extend our design philosophy to a wider audience, we introduced CHAMAK, a premium women's fashion brand celebrating Indian craftsmanship with a contemporary approach for today's modern woman.",
    cta: "ABOUT US",
  },
  sections: [
    { key: "collections", label: "Featured Collections", visible: true },
    { key: "new-arrivals", label: "New Arrivals", visible: true },
    { key: "editorial", label: "Editorial Image", visible: true },
    { key: "featured", label: "Featured Products", visible: true },
    { key: "story", label: "Brand Story", visible: true },
    { key: "promo", label: "Promotional Banner", visible: true },
    { key: "bestsellers", label: "Best Sellers", visible: true },
    { key: "newsletter", label: "Newsletter", visible: true },
  ],
  // Slugs, not ids — matched against the live (backend) catalog by slug in
  // HomePage.tsx, since real product/collection ids are DB-generated.
  featuredCollectionIds: ["the-ceremony-edit", "quiet-hours", "heritage-classics"],
  featuredProductIds: [
    "emerald-zari-anarkali",
    "royal-velvet-lehenga",
    "sapphire-silk-gown",
    "champagne-tissue-saree",
  ],
};

export const orderStatusLabels: Record<Order["status"], string> = {
  confirmed: "Order Confirmed",
  processing: "Processing",
  packed: "Packed",
  ready_for_pickup: "Ready for Pickup",
  shipped: "Shipped",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  delivery_failed: "Delivery Failed",
  ndr: "Delivery Exception (NDR)",
  rto: "Returned to Origin",
  lost: "Lost in Transit",
};

export const trackingStages: { status: Order["status"]; label: string }[] = [
  { status: "confirmed", label: "Order Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "packed", label: "Packed" },
  { status: "ready_for_pickup", label: "Ready for Pickup" },
  { status: "shipped", label: "Shipped" },
  { status: "in_transit", label: "In Transit" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

export const paymentStatusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const returnStatusLabels: Record<string, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  pickup_scheduled: "Pickup Scheduled",
  returned: "Returned",
  refund_initiated: "Refund Initiated",
  refund_completed: "Refund Completed",
};

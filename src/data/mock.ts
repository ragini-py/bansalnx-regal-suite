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
  supportEmail: "support@bansal-nx.com",
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
    text: "Complimentary shipping on orders above ₹25,000 · Made to order in India",
  },
  hero: {
    eyebrow: "Autumn Ceremony 2026",
    heading: "An heirloom in the making",
    subheading:
      "Hand-embroidered silks and handloom weaves, made to order in our Jaipur studio for the women who wear them.",
    primaryCta: "SHOP NOW",
    secondaryCta: "EXPLORE COLLECTIONS",
  },
  editorial: {
    heading: "CRAFTED FOR THE EXTRAORDINARY YOU",
    caption: "Four hundred hours of hand work in a single ceremonial piece.",
    cta: "DISCOVER THE COLLECTION",
  },
  promo: {
    heading: "MAKE AN ENTRANCE",
    caption: "The Ceremony Edit — weighted silks, ceremonial colour, hand zardozi.",
    cta: "SHOP THE EDIT",
  },
  story: {
    heading: "Made by hand, for a lifetime",
    body: "Bansal-nx began in a single room in Jaipur with three karigars and one conviction: that a garment should outlive its occasion. Every piece is drawn by hand, embroidered by the same artisans who trained under our founder, and finished only when it is right. We make in small numbers, to order, and we sign nothing we would not keep.",
    cta: "OUR STORY",
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

/**
 * Client-side application store.
 *
 * This is the single seam between the UI and its data. Everything here is
 * backed by the mock layer in src/data/* and persisted to localStorage so the
 * flows behave like a real app. Replacing this file with API/DB calls is the
 * only change needed to go live — no component reads mock data directly for
 * mutable state.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { collections as seedCollections, getProductById, products as seedProducts } from "@/data/catalog";
import {
  coupons as seedCoupons,
  homepageContent as seedContent,
  orders as seedOrders,
  permissionsForRole,
  storeSettings as seedSettings,
  users as seedUsers,
} from "@/data/mock";
import type {
  Address,
  CartLine,
  Collection,
  Coupon,
  HomepageContent,
  Order,
  OrderLine,
  PaymentMethod,
  PermissionKey,
  Product,
  StoreSettings,
  User,
} from "@/data/types";

const STORAGE_KEY = "bansal-nx-store-v1";

export interface PendingIntent {
  type: "wishlist" | "cart" | "checkout";
  productId?: string;
  variant?: { size: string; colour: string };
  returnTo: string;
}

interface PersistedState {
  users: User[];
  currentUserId: string | null;
  wishlist: string[];
  cart: CartLine[];
  orders: Order[];
  coupons: Coupon[];
  products: Product[];
  collections: Collection[];
  content: HomepageContent;
  settings: StoreSettings;
  welcomeOfferSeen: boolean;
  claimedCoupons: string[];
}

function initialState(): PersistedState {
  return {
    users: seedUsers,
    currentUserId: null,
    wishlist: [],
    cart: [],
    orders: seedOrders,
    coupons: seedCoupons,
    products: seedProducts,
    collections: seedCollections,
    content: seedContent,
    settings: seedSettings,
    welcomeOfferSeen: false,
    claimedCoupons: [],
  };
}

function load(): PersistedState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

export interface CartLineView extends CartLine {
  product: Product;
  lineTotal: number;
  available: boolean;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shippingFee: number;
  codFee: number;
  tax: number;
  total: number;
}

interface StoreValue {
  hydrated: boolean;
  /* auth */
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  permissions: PermissionKey[];
  hasPermission: (p: PermissionKey) => boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  /* intent preservation */
  pendingIntent: PendingIntent | null;
  setPendingIntent: (intent: PendingIntent | null) => void;
  /* wishlist */
  wishlist: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => "added" | "removed";
  /* cart */
  cart: CartLine[];
  cartLines: CartLineView[];
  cartCount: number;
  addToCart: (input: { productId: string; size: string; colour: string; quantity?: number }) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  /* coupon */
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { ok: boolean; error?: string };
  removeCoupon: () => void;
  totals: (paymentMethod?: PaymentMethod) => CartTotals;
  /* orders */
  orders: Order[];
  myOrders: Order[];
  placeOrder: (input: {
    address: Address;
    paymentMethod: PaymentMethod;
    email: string;
    phone: string;
  }) => Order;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  requestReturn: (id: string, reason: string) => void;
  cancelOrder: (id: string) => void;
  /* addresses */
  addAddress: (address: Omit<Address, "id">) => Address;
  removeAddress: (id: string) => void;
  /* admin data */
  products: Product[];
  collections: Collection[];
  coupons: Coupon[];
  content: HomepageContent;
  settings: StoreSettings;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveCollection: (collection: Collection) => void;
  deleteCollection: (id: string) => void;
  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  updateContent: (patch: Partial<HomepageContent>) => void;
  updateSettings: (patch: Partial<StoreSettings>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  /* welcome offer */
  welcomeOfferSeen: boolean;
  markWelcomeOfferSeen: () => void;
  claimWelcomeCoupon: () => string;
  claimedCoupons: string[];
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<PendingIntent | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — state stays in memory */
    }
  }, [state, hydrated]);

  const patch = useCallback((fn: (prev: PersistedState) => PersistedState) => {
    setState(fn);
  }, []);

  const user = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const permissions = useMemo(
    () => (user && user.role !== "customer" ? permissionsForRole(user.role) : []),
    [user],
  );

  const login = useCallback<StoreValue["login"]>(
    (email, password) => {
      const found = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) return { ok: false, error: "We couldn't find an account with that email." };
      if (found.password !== password) return { ok: false, error: "That password isn't correct." };
      if (found.status === "blocked")
        return { ok: false, error: "This account has been suspended. Please contact us." };
      patch((prev) => ({ ...prev, currentUserId: found.id }));
      return { ok: true, user: found };
    },
    [state.users, patch],
  );

  const register = useCallback<StoreValue["register"]>(
    (input) => {
      const exists = state.users.some(
        (u) => u.email.toLowerCase() === input.email.trim().toLowerCase(),
      );
      if (exists) return { ok: false, error: "An account with this email already exists." };
      const newUser: User = {
        id: `usr-${Date.now()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.trim(),
        phone: input.phone,
        password: input.password,
        role: "customer",
        status: "active",
        createdAt: new Date().toISOString(),
        addresses: [],
      };
      patch((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
        currentUserId: newUser.id,
      }));
      return { ok: true, user: newUser };
    },
    [state.users, patch],
  );

  const logout = useCallback(() => {
    patch((prev) => ({ ...prev, currentUserId: null, cart: [], wishlist: [] }));
    setAppliedCouponCode(null);
  }, [patch]);

  const toggleWishlist = useCallback<StoreValue["toggleWishlist"]>(
    (productId) => {
      const had = state.wishlist.includes(productId);
      patch((prev) => ({
        ...prev,
        wishlist: had
          ? prev.wishlist.filter((id) => id !== productId)
          : [...prev.wishlist, productId],
      }));
      return had ? "removed" : "added";
    },
    [state.wishlist, patch],
  );

  const addToCart = useCallback<StoreValue["addToCart"]>(
    ({ productId, size, colour, quantity = 1 }) => {
      const variantId = `${productId}-${colour.toLowerCase().replace(/\s+/g, "-")}-${size}`;
      patch((prev) => {
        const existing = prev.cart.find((l) => l.variantId === variantId);
        if (existing) {
          return {
            ...prev,
            cart: prev.cart.map((l) =>
              l.variantId === variantId ? { ...l, quantity: l.quantity + quantity } : l,
            ),
          };
        }
        return { ...prev, cart: [...prev.cart, { productId, variantId, size, colour, quantity }] };
      });
    },
    [patch],
  );

  const updateQuantity = useCallback<StoreValue["updateQuantity"]>(
    (variantId, quantity) => {
      patch((prev) => ({
        ...prev,
        cart:
          quantity <= 0
            ? prev.cart.filter((l) => l.variantId !== variantId)
            : prev.cart.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
      }));
    },
    [patch],
  );

  const removeFromCart = useCallback<StoreValue["removeFromCart"]>(
    (variantId) => {
      patch((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.variantId !== variantId) }));
    },
    [patch],
  );

  const clearCart = useCallback(() => {
    patch((prev) => ({ ...prev, cart: [] }));
    setAppliedCouponCode(null);
  }, [patch]);

  const cartLines = useMemo<CartLineView[]>(() => {
    return state.cart.flatMap((line) => {
      const product = state.products.find((p) => p.id === line.productId) ?? getProductById(line.productId);
      if (!product) return [];
      const variant = product.variants.find(
        (v) => v.size === line.size && v.colour === line.colour,
      );
      return [
        {
          ...line,
          product,
          lineTotal: product.price * line.quantity,
          available: variant ? variant.availability === "available" : false,
        },
      ];
    });
  }, [state.cart, state.products]);

  const appliedCoupon = useMemo(
    () => state.coupons.find((c) => c.code === appliedCouponCode) ?? null,
    [state.coupons, appliedCouponCode],
  );

  const subtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.lineTotal, 0),
    [cartLines],
  );

  const applyCoupon = useCallback<StoreValue["applyCoupon"]>(
    (code) => {
      const coupon = state.coupons.find(
        (c) => c.code.toLowerCase() === code.trim().toLowerCase(),
      );
      if (!coupon || !coupon.active) return { ok: false, error: "That code isn't valid." };
      if (new Date(coupon.expiresAt) < new Date())
        return { ok: false, error: "That code has expired." };
      if (subtotal < coupon.minOrder)
        return {
          ok: false,
          error: `This code applies to orders above ₹${coupon.minOrder.toLocaleString("en-IN")}.`,
        };
      setAppliedCouponCode(coupon.code);
      return { ok: true };
    },
    [state.coupons, subtotal],
  );

  const totals = useCallback<StoreValue["totals"]>(
    (paymentMethod) => {
      let discount = 0;
      if (appliedCoupon) {
        discount =
          appliedCoupon.type === "percent"
            ? Math.round((subtotal * appliedCoupon.value) / 100)
            : appliedCoupon.value;
        if (appliedCoupon.maxDiscount) discount = Math.min(discount, appliedCoupon.maxDiscount);
      }
      const afterDiscount = Math.max(subtotal - discount, 0);
      const shippingFee =
        afterDiscount === 0 || afterDiscount >= state.settings.freeShippingThreshold
          ? 0
          : state.settings.shippingFee;
      const codFee = paymentMethod === "cod" ? state.settings.codFee : 0;
      const tax = 0; // GST is included in listed prices; kept as an integration point
      return {
        subtotal,
        discount,
        shippingFee,
        codFee,
        tax,
        total: afterDiscount + shippingFee + codFee + tax,
      };
    },
    [appliedCoupon, subtotal, state.settings],
  );

  const placeOrder = useCallback<StoreValue["placeOrder"]>(
    ({ address, paymentMethod, email, phone }) => {
      const t = totals(paymentMethod);
      const lines: OrderLine[] = cartLines.map((line) => ({
        productId: line.productId,
        name: line.product.name,
        image: line.product.images[0] ?? "",
        slug: line.product.slug,
        size: line.size,
        colour: line.colour,
        quantity: line.quantity,
        price: line.product.price,
        mrp: line.product.mrp,
      }));
      const now = new Date();
      const eta = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
      const order: Order = {
        id: `BNX-${Math.floor(10000 + Math.random() * 89999)}`,
        userId: user?.id ?? "guest",
        customerName: user ? `${user.firstName} ${user.lastName}` : address.fullName,
        email,
        phone,
        createdAt: now.toISOString(),
        lines,
        subtotal: t.subtotal,
        discount: t.discount,
        couponCode: appliedCoupon?.code ?? null,
        shippingFee: t.shippingFee + t.codFee,
        tax: t.tax,
        total: t.total,
        status: "confirmed",
        payment: {
          method: paymentMethod,
          // Razorpay success is never asserted from the client; a real build
          // marks this paid only after server-side signature verification.
          status: paymentMethod === "cod" ? "pending" : "processing",
          amount: t.total,
          razorpayPaymentId:
            paymentMethod === "razorpay" ? `pay_MOCK${Math.random().toString(36).slice(2, 8)}` : null,
          transactionId: null,
          paidAt: null,
          refundStatus: "none",
          refundAmount: 0,
        },
        address,
        shipment: {
          courier: null,
          awb: null,
          shipmentId: null,
          trackingUrl: null,
          estimatedDelivery: eta.toISOString(),
          attempts: 0,
          ndrReason: null,
          rto: false,
          events: [{ status: "confirmed", label: "Order Confirmed", at: now.toISOString() }],
        },
        returnRequest: null,
      };
      patch((prev) => ({ ...prev, orders: [order, ...prev.orders], cart: [] }));
      setAppliedCouponCode(null);
      return order;
    },
    [cartLines, totals, appliedCoupon, user, patch],
  );

  const updateOrder = useCallback<StoreValue["updateOrder"]>(
    (id, orderPatch) => {
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, ...orderPatch } : o)),
      }));
    },
    [patch],
  );

  const requestReturn = useCallback<StoreValue["requestReturn"]>(
    (id, reason) => {
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                returnRequest: {
                  status: "requested",
                  reason,
                  requestedAt: new Date().toISOString(),
                  refundAmount: o.total,
                },
              }
            : o,
        ),
      }));
    },
    [patch],
  );

  const cancelOrder = useCallback<StoreValue["cancelOrder"]>(
    (id) => {
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "cancelled",
                payment: {
                  ...o.payment,
                  status: o.payment.status === "paid" ? "refunded" : "cancelled",
                },
                shipment: {
                  ...o.shipment,
                  events: [
                    ...o.shipment.events,
                    {
                      status: "cancelled" as const,
                      label: "Cancelled",
                      at: new Date().toISOString(),
                    },
                  ],
                },
              }
            : o,
        ),
      }));
    },
    [patch],
  );

  const addAddress = useCallback<StoreValue["addAddress"]>(
    (address) => {
      const created: Address = { ...address, id: `adr-${Date.now()}` };
      patch((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === prev.currentUserId ? { ...u, addresses: [...u.addresses, created] } : u,
        ),
      }));
      return created;
    },
    [patch],
  );

  const removeAddress = useCallback<StoreValue["removeAddress"]>(
    (id) => {
      patch((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === prev.currentUserId
            ? { ...u, addresses: u.addresses.filter((a) => a.id !== id) }
            : u,
        ),
      }));
    },
    [patch],
  );

  const value: StoreValue = {
    hydrated,
    user,
    users: state.users,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role !== "customer",
    permissions,
    hasPermission: (p) => permissions.includes(p),
    login,
    register,
    logout,
    pendingIntent,
    setPendingIntent,
    wishlist: state.wishlist,
    isWishlisted: (id) => state.wishlist.includes(id),
    toggleWishlist,
    cart: state.cart,
    cartLines,
    cartCount: state.cart.reduce((n, l) => n + l.quantity, 0),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartDrawerOpen,
    setCartDrawerOpen,
    appliedCoupon,
    applyCoupon,
    removeCoupon: () => setAppliedCouponCode(null),
    totals,
    orders: state.orders,
    myOrders: state.orders.filter((o) => o.userId === user?.id),
    placeOrder,
    updateOrder,
    requestReturn,
    cancelOrder,
    addAddress,
    removeAddress,
    products: state.products,
    collections: state.collections,
    coupons: state.coupons,
    content: state.content,
    settings: state.settings,
    saveProduct: (product) =>
      patch((prev) => ({
        ...prev,
        products: prev.products.some((p) => p.id === product.id)
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [product, ...prev.products],
      })),
    deleteProduct: (id) =>
      patch((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) })),
    saveCollection: (collection) =>
      patch((prev) => ({
        ...prev,
        collections: prev.collections.some((c) => c.id === collection.id)
          ? prev.collections.map((c) => (c.id === collection.id ? collection : c))
          : [...prev.collections, collection],
      })),
    deleteCollection: (id) =>
      patch((prev) => ({ ...prev, collections: prev.collections.filter((c) => c.id !== id) })),
    saveCoupon: (coupon) =>
      patch((prev) => ({
        ...prev,
        coupons: prev.coupons.some((c) => c.id === coupon.id)
          ? prev.coupons.map((c) => (c.id === coupon.id ? coupon : c))
          : [coupon, ...prev.coupons],
      })),
    deleteCoupon: (id) =>
      patch((prev) => ({ ...prev, coupons: prev.coupons.filter((c) => c.id !== id) })),
    updateContent: (contentPatch) =>
      patch((prev) => ({ ...prev, content: { ...prev.content, ...contentPatch } })),
    updateSettings: (settingsPatch) =>
      patch((prev) => ({ ...prev, settings: { ...prev.settings, ...settingsPatch } })),
    updateUser: (id, userPatch) =>
      patch((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, ...userPatch } : u)),
      })),
    welcomeOfferSeen: state.welcomeOfferSeen,
    markWelcomeOfferSeen: () => patch((prev) => ({ ...prev, welcomeOfferSeen: true })),
    claimWelcomeCoupon: () => {
      patch((prev) => ({
        ...prev,
        welcomeOfferSeen: true,
        claimedCoupons: Array.from(new Set([...prev.claimedCoupons, "FIRSTORDER"])),
      }));
      return "FIRSTORDER";
    },
    claimedCoupons: state.claimedCoupons,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

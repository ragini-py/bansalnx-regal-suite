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
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getProductById } from "@/data/catalog";
// storeSettings/homepageContent (aliased below) are only placeholders shown
// for the brief window before the real GET /api/settings and GET /api/content
// resolve (see the fetch effect below) — their values match the backend's
// own schema defaults, they're not "mock data" in the seed-layer sense anymore.
import {
  homepageContent as contentPlaceholder,
  permissionsForRole,
  storeSettings as settingsPlaceholder,
} from "@/data/mock";
import {
  extractApiErrorMessage,
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
} from "@/lib/api/auth";
import {
  createCollectionRequest,
  createProductRequest,
  deleteCollectionRequest,
  deleteProductRequest,
  getCollections,
  getProducts,
  updateCollectionRequest,
  updateProductRequest,
} from "@/lib/api/catalog";
import { addAddressRequest, removeAddressRequest } from "@/lib/api/users";
import {
  cancelOrderRequest,
  createOrderRequest,
  getAllOrders,
  getMyOrders,
  requestReturnRequest,
  updateOrderRequest,
} from "@/lib/api/orders";
import { createCouponRequest, deleteCouponRequest, getCoupons } from "@/lib/api/coupons";
import { getAllUsers, updateUserRequest } from "@/lib/api/admin-users";
import { getCartRequest, replaceCartRequest } from "@/lib/api/cart";
import { getWishlistRequest, replaceWishlistRequest } from "@/lib/api/wishlist";
import { getSettingsRequest, updateSettingsRequest } from "@/lib/api/settings";
import { getContentRequest, updateContentRequest } from "@/lib/api/content";
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
  wishlist: string[];
  cart: CartLine[];
  welcomeOfferSeen: boolean;
  claimedCoupons: string[];
}

function initialState(): PersistedState {
  return {
    wishlist: [],
    cart: [],
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
  /** True once the initial silent session check (against the backend) has resolved. */
  authReady: boolean;
  permissions: PermissionKey[];
  hasPermission: (p: PermissionKey) => boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; user?: User }>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string; user?: User }>;
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
  addToCart: (input: {
    productId: string;
    size: string;
    colour: string;
    quantity?: number;
  }) => void;
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
  }) => Promise<Order>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  requestReturn: (id: string, reason: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  /* addresses */
  addAddress: (address: Omit<Address, "id">) => Promise<Address>;
  removeAddress: (id: string) => Promise<void>;
  /* admin data */
  products: Product[];
  collections: Collection[];
  coupons: Coupon[];
  content: HomepageContent;
  settings: StoreSettings;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateContent: (patch: Partial<HomepageContent>) => Promise<void>;
  updateSettings: (patch: Partial<StoreSettings>) => Promise<void>;
  updateUser: (id: string, patch: Partial<User>) => Promise<void>;
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

  /* real auth (bansalnx-backend) — separate from the mock/localStorage state above */
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  /* real catalog (bansalnx-backend) — fetched fresh each session, never persisted to localStorage */
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(settingsPlaceholder);
  const [content, setContent] = useState<HomepageContent>(contentPlaceholder);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProducts(),
      getCollections(),
      getCoupons(),
      getSettingsRequest(),
      getContentRequest(),
    ])
      .then(([p, c, cp, s, ct]) => {
        if (cancelled) return;
        setProducts(p);
        setCollections(c);
        setCoupons(cp);
        setSettings(s);
        setContent(ct);
      })
      .catch((err: unknown) => {
        if (!cancelled) console.error("Failed to load catalog:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* real orders (bansalnx-backend) — `orders` is the admin-only full list, `myOrders` the caller's own */
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const authUserId = authUser?.id;
  const authUserRole = authUser?.role;

  useEffect(() => {
    if (!authUserId) {
      setOrders([]);
      setMyOrders([]);
      return;
    }
    let cancelled = false;
    getMyOrders()
      .then((o) => {
        if (!cancelled) setMyOrders(o);
      })
      .catch((err: unknown) => console.error("Failed to load orders:", err));
    if (authUserRole !== "customer") {
      getAllOrders()
        .then((o) => {
          if (!cancelled) setOrders(o);
        })
        .catch((err: unknown) => console.error("Failed to load orders:", err));
    } else {
      setOrders([]);
    }
    return () => {
      cancelled = true;
    };
  }, [authUserId, authUserRole]);

  /* real customer list (bansalnx-backend) — admin-only */
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!authUserId || authUserRole === "customer") {
      setUsers([]);
      return;
    }
    let cancelled = false;
    getAllUsers()
      .then((u) => {
        if (!cancelled) setUsers(u);
      })
      .catch((err: unknown) => console.error("Failed to load users:", err));
    return () => {
      cancelled = true;
    };
  }, [authUserId, authUserRole]);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await refreshRequest();
      if (cancelled) return;
      if (token) {
        try {
          const me = await meRequest();
          if (!cancelled) setAuthUser(me);
        } catch {
          if (!cancelled) setAuthUser(null);
        }
      }
      if (!cancelled) setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = useCallback((fn: (prev: PersistedState) => PersistedState) => {
    setState(fn);
  }, []);

  // Cart sync (bansalnx-backend) — guests keep a purely local/localStorage
  // cart exactly as before; once authenticated, it's merged with whatever
  // that account already has saved server-side (adding quantities for
  // matching variants), and every change after that is pushed to the
  // backend so the cart survives across devices/sessions.
  const cartSyncedRef = useRef(false);

  useEffect(() => {
    cartSyncedRef.current = false;
    if (!authUserId) return;
    let cancelled = false;
    getCartRequest()
      .then((serverLines) => {
        if (cancelled) return;
        patch((prev) => {
          const merged = [...serverLines];
          for (const line of prev.cart) {
            const existing = merged.find((l) => l.variantId === line.variantId);
            if (existing) {
              existing.quantity += line.quantity;
            } else {
              merged.push(line);
            }
          }
          return { ...prev, cart: merged };
        });
        cartSyncedRef.current = true;
      })
      .catch((err: unknown) => {
        console.error("Failed to sync cart:", err);
        cartSyncedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [authUserId, patch]);

  useEffect(() => {
    if (!authUserId || !cartSyncedRef.current) return;
    replaceCartRequest(state.cart).catch((err: unknown) =>
      console.error("Failed to save cart:", err),
    );
  }, [state.cart, authUserId]);

  // Wishlist sync (bansalnx-backend) — same pattern as cart above, just a
  // plain array of productIds (union instead of quantity-summed merge).
  const wishlistSyncedRef = useRef(false);

  useEffect(() => {
    wishlistSyncedRef.current = false;
    if (!authUserId) return;
    let cancelled = false;
    getWishlistRequest()
      .then((serverIds) => {
        if (cancelled) return;
        patch((prev) => ({
          ...prev,
          wishlist: Array.from(new Set([...serverIds, ...prev.wishlist])),
        }));
        wishlistSyncedRef.current = true;
      })
      .catch((err: unknown) => {
        console.error("Failed to sync wishlist:", err);
        wishlistSyncedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [authUserId, patch]);

  useEffect(() => {
    if (!authUserId || !wishlistSyncedRef.current) return;
    replaceWishlistRequest(state.wishlist).catch((err: unknown) =>
      console.error("Failed to save wishlist:", err),
    );
  }, [state.wishlist, authUserId]);

  const user = authUser;

  const permissions = useMemo(
    () => (user && user.role !== "customer" ? permissionsForRole(user.role) : []),
    [user],
  );

  const login = useCallback<StoreValue["login"]>(async (email, password) => {
    try {
      const loggedInUser = await loginRequest({ email: email.trim(), password });
      setAuthUser(loggedInUser);
      return { ok: true, user: loggedInUser };
    } catch (err) {
      return { ok: false, error: extractApiErrorMessage(err, "Unable to sign in.") };
    }
  }, []);

  const register = useCallback<StoreValue["register"]>(async (input) => {
    try {
      const newUser = await registerRequest({ ...input, email: input.email.trim() });
      setAuthUser(newUser);
      return { ok: true, user: newUser };
    } catch (err) {
      return { ok: false, error: extractApiErrorMessage(err, "Unable to create your account.") };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    void logoutRequest();
    patch((prev) => ({ ...prev, cart: [], wishlist: [] }));
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
      const product =
        products.find((p) => p.id === line.productId) ?? getProductById(line.productId);
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
  }, [state.cart, products]);

  const appliedCoupon = useMemo(
    () => coupons.find((c) => c.code === appliedCouponCode) ?? null,
    [coupons, appliedCouponCode],
  );

  const subtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.lineTotal, 0),
    [cartLines],
  );

  const applyCoupon = useCallback<StoreValue["applyCoupon"]>(
    (code) => {
      const coupon = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
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
    [coupons, subtotal],
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
        afterDiscount === 0 || afterDiscount >= settings.freeShippingThreshold
          ? 0
          : settings.shippingFee;
      const codFee = paymentMethod === "cod" ? settings.codFee : 0;
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
    [appliedCoupon, subtotal, settings],
  );

  const placeOrder = useCallback<StoreValue["placeOrder"]>(
    async ({ address, paymentMethod, email, phone }) => {
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
      const eta = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
      const order = await createOrderRequest({
        customerName: user ? `${user.firstName} ${user.lastName}` : address.fullName,
        email,
        phone,
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
            paymentMethod === "razorpay"
              ? `pay_MOCK${Math.random().toString(36).slice(2, 8)}`
              : null,
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
          events: [{ status: "confirmed", label: "Order Confirmed", at: new Date().toISOString() }],
        },
        returnRequest: null,
      });
      setMyOrders((prev) => [order, ...prev]);
      patch((prev) => ({ ...prev, cart: [] }));
      setAppliedCouponCode(null);
      return order;
    },
    [cartLines, totals, appliedCoupon, user, patch],
  );

  const updateOrder = useCallback<StoreValue["updateOrder"]>(async (id, orderPatch) => {
    const updated = await updateOrderRequest(id, orderPatch);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    setMyOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }, []);

  const requestReturn = useCallback<StoreValue["requestReturn"]>(async (id, reason) => {
    const updated = await requestReturnRequest(id, reason);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    setMyOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }, []);

  const cancelOrder = useCallback<StoreValue["cancelOrder"]>(async (id) => {
    const updated = await cancelOrderRequest(id);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    setMyOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }, []);

  const addAddress = useCallback<StoreValue["addAddress"]>(async (address) => {
    const updatedUser = await addAddressRequest(address);
    setAuthUser(updatedUser);
    // The backend always appends the new address, so it's the last entry.
    return updatedUser.addresses.at(-1)!;
  }, []);

  const removeAddress = useCallback<StoreValue["removeAddress"]>(async (id) => {
    const updatedUser = await removeAddressRequest(id);
    setAuthUser(updatedUser);
  }, []);

  const value: StoreValue = {
    hydrated,
    user,
    users,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role !== "customer",
    authReady,
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
    orders,
    myOrders,
    placeOrder,
    updateOrder,
    requestReturn,
    cancelOrder,
    addAddress,
    removeAddress,
    products,
    collections,
    coupons,
    content,
    settings,
    saveProduct: async (product) => {
      const exists = products.some((p) => p.id === product.id);
      if (exists) {
        const updated = await updateProductRequest(product);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const { id: _tempId, createdAt: _createdAt, ...input } = product;
        const created = await createProductRequest(input);
        setProducts((prev) => [created, ...prev]);
      }
    },
    deleteProduct: async (id) => {
      await deleteProductRequest(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    saveCollection: async (collection) => {
      const exists = collections.some((c) => c.id === collection.id);
      if (exists) {
        const updated = await updateCollectionRequest(collection);
        setCollections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const { id: _tempId, ...input } = collection;
        const created = await createCollectionRequest(input);
        setCollections((prev) => [...prev, created]);
      }
    },
    deleteCollection: async (id) => {
      await deleteCollectionRequest(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    },
    // AdminPage's CouponsManagerTab only ever creates (a fresh temp id that
    // never matches an existing coupon) or deletes — there's no edit-existing
    // flow, so this always creates rather than truly upserting.
    saveCoupon: async (coupon) => {
      const { id: _tempId, timesUsed: _timesUsed, ...input } = coupon;
      const created = await createCouponRequest(input);
      setCoupons((prev) => [created, ...prev]);
    },
    deleteCoupon: async (id) => {
      await deleteCouponRequest(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    },
    updateContent: async (contentPatch) => {
      const updated = await updateContentRequest(contentPatch);
      setContent(updated);
    },
    // Only freeShippingThreshold/shippingFee/codMaxOrderValue are actually
    // editable via AdminPage's SettingsManagerTab — matches the backend's
    // admin-editable field set exactly.
    updateSettings: async (settingsPatch) => {
      const updated = await updateSettingsRequest(settingsPatch);
      setSettings(updated);
    },
    updateUser: async (id, userPatch) => {
      const updated = await updateUserRequest(id, userPatch);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    },
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

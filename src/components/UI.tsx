import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import {
  AWKA_CENTER,
  DEFAULT_ALLOWED_VIEWS,
  type CartItem,
  type Order,
  type PartnerApplication,
  type PartnerPermission,
  type PartnerStaff,
  type PaymentMethod,
  type Product,
  type Rating,
  type Rider,
  type RoleView,
  type SavedAddress,
  type Shop,
} from "../utils/helpers";

// ─────────────────────────────────────────────
// Admin PIN — change this or move to env var
// ─────────────────────────────────────────────
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? "instadal2024";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type User = {
  id: string;
  name: string;
  phone: string;
  primaryRole: RoleView;
  allowedViews: RoleView[];
  locationState?: string;
  locationCity?: string;
  partnerPermissions?: PartnerPermission[];
  isStaffAccount?: boolean;
  isGuest?: boolean;
};

type AppContextValue = {
  // Auth
  user: User | null;
  session: Session | null;
  currentView: RoleView;
  authLoading: boolean;

  signUp: (
    name: string,
    phone: string,
    password: string,
    primaryRole: RoleView,
    locationState: string,
    locationCity: string
  ) => Promise<void>;
  signIn: (phone: string, password: string) => Promise<RoleView>;
  loginAsAdmin: (pin: string) => Promise<void>;
  loginAsGuest: () => void;
  loginAsStaff: (staff: PartnerStaff) => void;
  logout: () => Promise<void>;

  setCurrentView: (v: RoleView) => void;
  canView: (v: RoleView) => boolean;
  canPartner: (p: PartnerPermission) => boolean;

  // Shops
  shops: Shop[];
  shopsLoading: boolean;
  toggleShopOpen: (id: string) => Promise<void>;

  // Customer location
  customerLoc: { lat: number; lng: number };
  customerAddress: string;
  setCustomerAddress: (a: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (pid: string) => void;
  updateQty: (pid: string, qty: number) => void;
  clearCart: () => void;

  // Orders
  orders: Order[];
  ordersLoading: boolean;
  placeOrder: (address: string, lat: number, lng: number, phone: string) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order["status"], patch?: Partial<Order>) => Promise<void>;
  assignRider: (orderId: string, riderId: string) => Promise<void>;

  // Riders
  riders: Rider[];
  toggleRiderAvailability: (id: string) => Promise<void>;
  updateRiderLocation: (id: string, lat: number, lng: number) => Promise<void>;

  // Partner staff
  partnerStaff: PartnerStaff[];
  addStaff: (name: string, phone: string, permissions: PartnerPermission[]) => Promise<PartnerStaff>;
  updateStaffPermissions: (id: string, permissions: PartnerPermission[]) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;

  // Ratings
  ratings: Rating[];
  submitRating: (
    targetType: "shop" | "product",
    targetId: string,
    score: number,
    comment?: string
  ) => Promise<void>;

  // Saved addresses
  savedAddresses: SavedAddress[];
  addAddress: (a: Omit<SavedAddress, "id">) => Promise<SavedAddress>;
  updateAddress: (id: string, patch: Partial<SavedAddress>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;

  // Partner applications
  applications: PartnerApplication[];
  submitApplication: (
    a: Omit<PartnerApplication, "id" | "status" | "createdAt">
  ) => Promise<PartnerApplication>;
  approveApplication: (id: string) => Promise<void>;
  rejectApplication: (id: string, reason?: string) => Promise<void>;

  // Location selector
  selectedState: string;
  selectedCity: string;
  setLocation: (state: string, city: string) => void;

  // Payment method
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
};

// ─────────────────────────────────────────────
// DB row → app type mappers
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToShop(r: any): Shop {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    categoryId: r.category_id,
    description: r.description ?? "",
    address: r.address,
    state: r.state,
    city: r.city,
    lat: r.lat,
    lng: r.lng,
    logo: r.logo ?? "🏪",
    rating: Number(r.rating ?? 0),
    prepTime: r.prep_time ?? "20-30 min",
    isOpen: r.is_open,
    isApproved: r.is_approved,
    isMall: r.is_mall,
    itemCount: r.item_count,
    featured: r.featured,
    ownerId: r.owner_id,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(r: any): Order {
  return {
    id: r.id,
    customerId: r.customer_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    shopId: r.shop_id,
    shopName: r.shop_name,
    shopLat: r.shop_lat,
    shopLng: r.shop_lng,
    riderId: r.rider_id ?? undefined,
    riderName: r.rider_name ?? undefined,
    riderLat: r.rider_lat ?? undefined,
    riderLng: r.rider_lng ?? undefined,
    items: r.order_items?.map(rowToCartItem) ?? [],
    subtotal: Number(r.subtotal),
    serviceFee: Number(r.service_fee),
    deliveryFee: Number(r.delivery_fee),
    total: Number(r.total),
    deliveryAddress: r.delivery_address,
    deliveryLat: r.delivery_lat,
    deliveryLng: r.delivery_lng,
    status: r.status,
    paymentMethod: r.payment_method ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
    deliveredAt: r.delivered_at ? new Date(r.delivered_at).getTime() : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCartItem(r: any): CartItem {
  return {
    product: {
      id: r.product_id ?? r.id,
      shopId: "",
      name: r.name,
      description: "",
      price: Number(r.price),
      image: r.image ?? "",
      category: "",
      isAvailable: true,
    },
    quantity: r.quantity,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRider(r: any): Rider {
  return {
    id: r.id,
    name: r.profiles?.name ?? "Rider",
    phone: r.phone ?? r.profiles?.phone ?? "",
    vehicleType: r.vehicle_type,
    isAvailable: r.is_available,
    lat: r.lat ?? AWKA_CENTER.lat,
    lng: r.lng ?? AWKA_CENTER.lng,
    totalEarnings: Number(r.total_earnings ?? 0),
    deliveriesToday: r.deliveries_today ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToStaff(r: any): PartnerStaff {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    permissions: r.permissions ?? [],
    createdAt: new Date(r.created_at).getTime(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRating(r: any): Rating {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    targetType: r.target_type,
    targetId: r.target_id,
    score: r.score,
    comment: r.comment ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAddress(r: any): SavedAddress {
  return {
    id: r.id,
    label: r.label,
    address: r.address,
    mapsLink: r.maps_link ?? undefined,
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    isDefault: r.is_default,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToApplication(r: any): PartnerApplication {
  return {
    id: r.id,
    businessName: r.business_name,
    ownerName: r.owner_name,
    phone: r.phone,
    email: r.email ?? "",
    state: r.state,
    city: r.city,
    address: r.address,
    category: r.category,
    description: r.description ?? "",
    videoLink: r.video_link ?? "",
    previewProducts: r.preview_products ?? [],
    status: r.status,
    createdAt: new Date(r.created_at).getTime(),
    reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).getTime() : undefined,
    rejectionReason: r.rejection_reason ?? undefined,
  };
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

const CART_KEY = "instadal_cart";

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Auth ──────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentViewState] = useState<RoleView>("customer");

  // ── Data ──────────────────────────────────
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [partnerStaff, setPartnerStaff] = useState<PartnerStaff[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [applications, setApplications] = useState<PartnerApplication[]>([]);

  // ── Client-side only ──────────────────────
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"); }
    catch { return []; }
  });
  const customerLoc = AWKA_CENTER;
  const [customerAddress, setCustomerAddress] = useState("UNIZIK Main Gate, Awka");
  const [selectedState, setSelectedState] = useState(
    () => localStorage.getItem("instadal_state") ?? "Anambra"
  );
  const [selectedCity, setSelectedCity] = useState(
    () => localStorage.getItem("instadal_city") ?? "Awka"
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    () => (localStorage.getItem("instadal_payment") as PaymentMethod) ?? "card"
  );

  // ── Toast ─────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ─────────────────────────────────────────
  // Bootstrap auth session on mount
  // ─────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else {
        setUser(null);
        setCurrentViewState("customer");
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (data) {
      const role = data.primary_role as RoleView;
      const u: User = {
        id: data.id,
        name: data.name,
        phone: data.phone ?? "",
        primaryRole: role,
        allowedViews: DEFAULT_ALLOWED_VIEWS[role],
        locationState: data.location_state ?? undefined,
        locationCity: data.location_city ?? undefined,
      };
      setUser(u);
      setCurrentViewState(role);
      // Sync location selection to user's saved location
      if (data.location_state) setSelectedState(data.location_state);
      if (data.location_city) setSelectedCity(data.location_city);
    }
    setAuthLoading(false);
  };

  // ─────────────────────────────────────────
  // Load shops on mount
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchShops = async () => {
      setShopsLoading(true);
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("is_approved", true)
        .order("featured", { ascending: false });

      if (!error && data) setShops(data.map(rowToShop));
      setShopsLoading(false);
    };
    fetchShops();
  }, []);

  // ─────────────────────────────────────────
  // Load orders when user changes
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user || user.isGuest) return;
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (user.primaryRole === "customer") query = query.eq("customer_id", user.id);
    else if (user.primaryRole === "rider") query = query.eq("rider_id", user.id);

    const { data, error } = await query;
    if (!error && data) setOrders(data.map(rowToOrder));
    setOrdersLoading(false);
  };

  // ─────────────────────────────────────────
  // Load riders (admin / partner)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user || (user.primaryRole !== "admin" && user.primaryRole !== "partner")) return;
    supabase
      .from("riders")
      .select("*, profiles(name, phone)")
      .then(({ data }) => {
        if (data) setRiders(data.map(rowToRider));
      });
  }, [user?.primaryRole]);

  // ─────────────────────────────────────────
  // Load partner staff
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user || (user.primaryRole !== "partner" && user.primaryRole !== "admin")) return;
    supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single()
      .then(({ data: shopRow }) => {
        if (!shopRow) return;
        supabase
          .from("partner_staff")
          .select("*")
          .eq("shop_id", shopRow.id)
          .then(({ data }) => {
            if (data) setPartnerStaff(data.map(rowToStaff));
          });
      });
  }, [user?.id, user?.primaryRole]);

  // ─────────────────────────────────────────
  // Load ratings
  // ─────────────────────────────────────────
  useEffect(() => {
    supabase.from("ratings").select("*").then(({ data }) => {
      if (data) setRatings(data.map(rowToRating));
    });
  }, []);

  // ─────────────────────────────────────────
  // Load saved addresses
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user || user.isGuest) return;
    supabase
      .from("saved_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at")
      .then(({ data }) => {
        if (data) setSavedAddresses(data.map(rowToAddress));
      });
  }, [user?.id]);

  // ─────────────────────────────────────────
  // Load partner applications (admin)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (user?.primaryRole !== "admin") return;
    supabase
      .from("partner_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setApplications(data.map(rowToApplication));
      });
  }, [user?.primaryRole]);

  // ─────────────────────────────────────────
  // Realtime: orders channel
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user || user.isGuest) return;
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => { fetchOrders(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ─────────────────────────────────────────
  // Persist to localStorage
  // ─────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("instadal_state", selectedState);
  }, [selectedState]);

  useEffect(() => {
    localStorage.setItem("instadal_city", selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem("instadal_payment", paymentMethod);
  }, [paymentMethod]);

  // ═════════════════════════════════════════
  // AUTH ACTIONS
  // ═════════════════════════════════════════

  /**
   * SIGN UP
   * No OTP. Uses Supabase email/password auth with phone as the "email"
   * (formatted as phone@instadal.app) so we keep Supabase auth simple
   * without needing a real SMS provider.
   *
   * Stores name, phone, role, state, city in the profiles table via
   * the existing trigger or manual upsert below.
   *
   * If you later switch to a real email/phone provider, only this
   * function needs updating — nothing else changes.
   */
  const signUp = async (
    name: string,
    phone: string,
    password: string,
    primaryRole: RoleView,
    locationState: string,
    locationCity: string
  ) => {
    // Derive a stable fake email from the phone so Supabase can store it
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^0/, "234");
    const fakeEmail = `${normalizedPhone}@instadal.app`;
    const defaultPassword = password;

    // 1. Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fakeEmail,
      password: defaultPassword,
      options: {
        data: {
          name,
          phone,
          primary_role: primaryRole,
          location_state: locationState,
          location_city: locationCity,
        },
      },
    });

    if (authError) {
      // "User already registered" → they should sign in instead
      if (authError.message.toLowerCase().includes("already registered")) {
        throw new Error("This phone number already has an account. Please sign in.");
      }
      throw new Error(authError.message);
    }

    if (!authData.user) throw new Error("Sign up failed. Please try again.");

    // 2. Upsert profile row (handles both trigger-created and manual)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        name,
        phone,
        primary_role: primaryRole,
        location_state: locationState,
        location_city: locationCity,
      });

    if (profileError) throw new Error(profileError.message);

    // 3. Set local user state immediately (no email confirm needed in dev)
    const u: User = {
      id: authData.user.id,
      name,
      phone,
      primaryRole,
      allowedViews: DEFAULT_ALLOWED_VIEWS[primaryRole],
      locationState,
      locationCity,
    };
    setUser(u);
    setCurrentViewState(primaryRole);
    setSelectedState(locationState);
    setSelectedCity(locationCity);
  };

  /**
   * SIGN IN
   * Phone + password. Password defaults to the normalized phone number
   * set during sign-up (e.g. 2348012345678). User can update it later.
   * Returns the user's primary role so the UI can navigate correctly.
   */
  const signIn = async (phone: string, password: string): Promise<RoleView> => {
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^0/, "234");
    const fakeEmail = `${normalizedPhone}@instadal.app`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("invalid") ||
        error.message.toLowerCase().includes("credentials")
      ) {
        throw new Error("Incorrect phone number or password.");
      }
      throw new Error(error.message);
    }

    if (!data.user) throw new Error("Sign in failed. Please try again.");

    // Profile is loaded by the onAuthStateChange listener,
    // but we still need to return the role for navigation.
    const { data: profile } = await supabase
      .from("profiles")
      .select("primary_role, location_state, location_city")
      .eq("id", data.user.id)
      .single();

    const role = (profile?.primary_role as RoleView) ?? "customer";

    if (profile?.location_state) setSelectedState(profile.location_state);
    if (profile?.location_city) setSelectedCity(profile.location_city);

    showToast("Welcome back! 👋");
    return role;
  };

  /**
   * ADMIN LOGIN
   * Triggered when the user types "admin" in the phone field on the
   * sign-in tab. Checks a PIN — no Supabase session involved,
   * just a local privileged user object.
   */
  const loginAsAdmin = async (pin: string) => {
    // Simulate a short async check (replace with a real API call if needed)
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (pin !== ADMIN_PIN) throw new Error("Incorrect PIN.");

    const u: User = {
      id: "u_admin_local",
      name: "Admin",
      phone: "admin",
      primaryRole: "admin",
      allowedViews: ["customer", "partner", "rider", "admin"],
    };
    setUser(u);
    setCurrentViewState("admin");
    showToast("Admin access granted 🛠️");
  };

  const loginAsGuest = () => {
    const u: User = {
      id: "u_guest_" + Date.now(),
      name: "Guest",
      phone: "",
      primaryRole: "customer",
      allowedViews: ["customer"],
      isGuest: true,
    };
    setUser(u);
    setCurrentViewState("customer");
    showToast("Browsing as guest — sign up to place orders");
  };

  const loginAsStaff = (staff: PartnerStaff) => {
    const u: User = {
      id: "u_staff_" + staff.id,
      name: staff.name,
      phone: staff.phone,
      primaryRole: "partner",
      allowedViews: ["customer", "partner"],
      partnerPermissions: staff.permissions,
      isStaffAccount: true,
    };
    setUser(u);
    setCurrentViewState("partner");
    showToast(`Signed in as ${u.name} (staff)`);
  };

  const logout = async () => {
    // Guest and staff don't have a real Supabase session
    if (!user?.isGuest && !user?.isStaffAccount && user?.id !== "u_admin_local") {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setCurrentViewState("customer");
    setOrders([]);
    setSavedAddresses([]);
  };

  const setCurrentView = (v: RoleView) => {
    if (!user) { setCurrentViewState(v); return; }
    if (user.allowedViews.includes(v)) setCurrentViewState(v);
  };

  const canView = (v: RoleView) => {
    if (!user) return false;
    return user.allowedViews.includes(v);
  };

  const canPartner = (p: PartnerPermission) => {
    if (!user) return false;
    if (user.primaryRole === "admin") return true;
    if (user.primaryRole === "partner" && !user.isStaffAccount) return true;
    if (user.partnerPermissions) return user.partnerPermissions.includes(p);
    return false;
  };

  // ═════════════════════════════════════════
  // SHOPS
  // ═════════════════════════════════════════

  const toggleShopOpen = async (id: string) => {
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;
    const { error } = await supabase
      .from("shops")
      .update({ is_open: !shop.isOpen })
      .eq("id", id);
    if (!error)
      setShops((s) => s.map((x) => x.id === id ? { ...x, isOpen: !x.isOpen } : x));
  };

  // ═════════════════════════════════════════
  // CART
  // ═════════════════════════════════════════

  const addToCart = (p: Product) => {
    setCart((c) => {
      const ex = c.find((i) => i.product.id === p.id);
      if (ex) return c.map((i) => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { product: p, quantity: 1 }];
    });
    showToast(`Added ${p.name}`);
  };

  const removeFromCart = (pid: string) =>
    setCart((c) => c.filter((i) => i.product.id !== pid));

  const updateQty = (pid: string, qty: number) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.product.id !== pid)
        : c.map((i) => i.product.id === pid ? { ...i, quantity: qty } : i)
    );

  const clearCart = () => setCart([]);

  // ═════════════════════════════════════════
  // ORDERS
  // ═════════════════════════════════════════

  const placeOrder = async (
    address: string,
    lat: number,
    lng: number,
    phone: string
  ): Promise<Order> => {
    if (!cart.length) throw new Error("Empty cart");
    if (!user || user.isGuest) throw new Error("Sign in to place orders");

    const shop = shops.find((s) => s.id === cart[0].product.shopId);
    if (!shop) throw new Error("Shop not found");

    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const serviceFee = Math.round(subtotal * 0.07);
    const deliveryFee = 500;
    const total = subtotal + serviceFee + deliveryFee;

    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        customer_name: user.name,
        customer_phone: phone,
        shop_id: shop.id,
        shop_name: shop.name,
        shop_lat: shop.lat,
        shop_lng: shop.lng,
        subtotal,
        service_fee: serviceFee,
        delivery_fee: deliveryFee,
        total,
        delivery_address: address,
        delivery_lat: lat,
        delivery_lng: lng,
        status: "pending",
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (orderErr || !orderRow) throw new Error(orderErr?.message ?? "Failed to place order");

    const items = cart.map((i) => ({
      order_id: orderRow.id,
      product_id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      image: i.product.image,
    }));

    await supabase.from("order_items").insert(items);

    clearCart();
    showToast("Order placed! 🎉");

    // Auto-save delivery address if it's new
    const alreadySaved = savedAddresses.some(
      (a) => a.label.trim().toLowerCase() === address.trim().toLowerCase()
    );
    if (!alreadySaved && address.trim()) {
      const isFirst = savedAddresses.length === 0;
      await supabase.from("saved_addresses").insert({
        user_id: user.id,
        label: address.trim(),
        lat,
        lng,
        is_default: isFirst,
      });
      const newAddr: SavedAddress = {
        id: crypto.randomUUID(),
        label: address.trim(),
        lat,
        lng,
        isDefault: isFirst,
      };
      setSavedAddresses((prev) => [...prev, newAddr]);
    }

    const order = rowToOrder({ ...orderRow, order_items: items });
    setOrders((o) => [order, ...o]);
    return order;
  };

  const updateOrderStatus = async (
    id: string,
    status: Order["status"],
    patch?: Partial<Order>
  ) => {
    const dbPatch: Record<string, unknown> = { status };
    if (status === "delivered") dbPatch.delivered_at = new Date().toISOString();
    if (patch?.riderId) dbPatch.rider_id = patch.riderId;
    if (patch?.riderName) dbPatch.rider_name = patch.riderName;
    if (patch?.riderLat) dbPatch.rider_lat = patch.riderLat;
    if (patch?.riderLng) dbPatch.rider_lng = patch.riderLng;

    const { error } = await supabase.from("orders").update(dbPatch).eq("id", id);
    if (!error) {
      setOrders((list) =>
        list.map((o) =>
          o.id === id
            ? { ...o, ...patch, status, deliveredAt: status === "delivered" ? Date.now() : o.deliveredAt }
            : o
        )
      );
    }
  };

  const assignRider = async (orderId: string, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;
    await updateOrderStatus(orderId, "rider_assigned", {
      riderId: rider.id,
      riderName: rider.name,
      riderLat: rider.lat,
      riderLng: rider.lng,
    });
  };

  // ═════════════════════════════════════════
  // RIDERS
  // ═════════════════════════════════════════

  const toggleRiderAvailability = async (id: string) => {
    const rider = riders.find((r) => r.id === id);
    if (!rider) return;
    const { error } = await supabase
      .from("riders")
      .update({ is_available: !rider.isAvailable })
      .eq("id", id);
    if (!error)
      setRiders((rs) => rs.map((r) => r.id === id ? { ...r, isAvailable: !r.isAvailable } : r));
  };

  const updateRiderLocation = async (id: string, lat: number, lng: number) => {
    await supabase.from("riders").update({ lat, lng }).eq("id", id);
    setRiders((rs) => rs.map((r) => r.id === id ? { ...r, lat, lng } : r));
    setOrders((list) =>
      list.map((o) => o.riderId === id ? { ...o, riderLat: lat, riderLng: lng } : o)
    );
  };

  // ═════════════════════════════════════════
  // PARTNER STAFF
  // ═════════════════════════════════════════

  const addStaff = async (
    name: string,
    phone: string,
    permissions: PartnerPermission[]
  ): Promise<PartnerStaff> => {
    const { data: shopRow } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();

    if (!shopRow) throw new Error("Shop not found");

    const { data, error } = await supabase
      .from("partner_staff")
      .insert({ shop_id: shopRow.id, name, phone, permissions })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? "Failed to add staff");
    const s = rowToStaff(data);
    setPartnerStaff((list) => [...list, s]);
    return s;
  };

  const updateStaffPermissions = async (id: string, permissions: PartnerPermission[]) => {
    const { error } = await supabase
      .from("partner_staff")
      .update({ permissions })
      .eq("id", id);
    if (!error)
      setPartnerStaff((list) => list.map((s) => s.id === id ? { ...s, permissions } : s));
  };

  const removeStaff = async (id: string) => {
    const { error } = await supabase.from("partner_staff").delete().eq("id", id);
    if (!error) setPartnerStaff((list) => list.filter((s) => s.id !== id));
  };

  // ═════════════════════════════════════════
  // RATINGS
  // ═════════════════════════════════════════

  const submitRating = async (
    targetType: "shop" | "product",
    targetId: string,
    score: number,
    comment?: string
  ) => {
    if (!user || user.isGuest) { showToast("Sign in to rate"); return; }

    const payload = {
      user_id: user.id,
      user_name: user.name,
      target_type: targetType,
      target_id: targetId,
      score: Math.max(1, Math.min(5, Math.round(score))),
      comment: comment ?? null,
    };

    const { data, error } = await supabase
      .from("ratings")
      .upsert(payload, { onConflict: "user_id,target_type,target_id" })
      .select()
      .single();

    if (!error && data) {
      const r = rowToRating(data);
      setRatings((list) => {
        const filtered = list.filter(
          (x) => !(x.userId === r.userId && x.targetType === r.targetType && x.targetId === r.targetId)
        );
        return [r, ...filtered];
      });
      showToast("Thanks for your rating! ⭐");
    }
  };

  // ═════════════════════════════════════════
  // SAVED ADDRESSES
  // ═════════════════════════════════════════

  const addAddress = async (a: Omit<SavedAddress, "id">): Promise<SavedAddress> => {
    if (!user) throw new Error("Not authenticated");

    if (a.isDefault) {
      await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", user.id);
    }

    const { data, error } = await supabase
      .from("saved_addresses")
      .insert({
        user_id: user.id,
        label: a.label,
        address: a.address,
        maps_link: a.mapsLink ?? null,
        lat: a.lat ?? null,
        lng: a.lng ?? null,
        is_default: a.isDefault ?? false,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? "Failed to save address");
    const addr = rowToAddress(data);
    setSavedAddresses((list) => {
      const next = addr.isDefault ? list.map((x) => ({ ...x, isDefault: false })) : list;
      return [...next, addr];
    });
    return addr;
  };

  const updateAddress = async (id: string, patch: Partial<SavedAddress>) => {
    const { error } = await supabase
      .from("saved_addresses")
      .update({
        label: patch.label,
        address: patch.address,
        maps_link: patch.mapsLink,
        lat: patch.lat,
        lng: patch.lng,
        is_default: patch.isDefault,
      })
      .eq("id", id);
    if (!error)
      setSavedAddresses((list) => list.map((a) => a.id === id ? { ...a, ...patch } : a));
  };

  const removeAddress = async (id: string) => {
    const { error } = await supabase.from("saved_addresses").delete().eq("id", id);
    if (!error) setSavedAddresses((list) => list.filter((a) => a.id !== id));
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id);
    setSavedAddresses((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  // ═════════════════════════════════════════
  // PARTNER APPLICATIONS
  // ═════════════════════════════════════════

  const submitApplication = async (
    a: Omit<PartnerApplication, "id" | "status" | "createdAt">
  ): Promise<PartnerApplication> => {
    const { data, error } = await supabase
      .from("partner_applications")
      .insert({
        business_name: a.businessName,
        owner_name: a.ownerName,
        phone: a.phone,
        email: a.email,
        state: a.state,
        city: a.city,
        address: a.address,
        category: a.category,
        description: a.description,
        video_link: a.videoLink,
        preview_products: a.previewProducts,
        status: "pending",
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? "Failed to submit application");
    const app = rowToApplication(data);
    setApplications((list) => [app, ...list]);
    return app;
  };

  const approveApplication = async (id: string) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return;

    await supabase
      .from("partner_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", id);

    const categoryToId: Record<string, string> = {
      Restaurant: "food", "Fast Food": "fast-food",
      Grocery: "grocery", Pharmacy: "pharmacy", "Ice Cream": "ice-cream",
    };

    const { data: shopData } = await supabase
      .from("shops")
      .insert({
        owner_id: user!.id,
        name: app.businessName,
        category: app.category,
        category_id: categoryToId[app.category] ?? "others",
        description: app.description,
        address: app.address,
        state: app.state,
        city: app.city,
        lat: AWKA_CENTER.lat,
        lng: AWKA_CENTER.lng,
        logo: "🏪",
        prep_time: "30-45 min",
        is_open: false,
        is_approved: true,
      })
      .select()
      .single();

    if (shopData) setShops((list) => [...list, rowToShop(shopData)]);

    setApplications((list) =>
      list.map((a) => a.id === id ? { ...a, status: "approved", reviewedAt: Date.now() } : a)
    );
    showToast("Application approved ✓");
  };

  const rejectApplication = async (id: string, reason?: string) => {
    await supabase
      .from("partner_applications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason ?? null,
      })
      .eq("id", id);

    setApplications((list) =>
      list.map((a) =>
        a.id === id
          ? { ...a, status: "rejected", reviewedAt: Date.now(), rejectionReason: reason }
          : a
      )
    );
    showToast("Application rejected");
  };

  // ─────────────────────────────────────────
  // Location / payment
  // ─────────────────────────────────────────
  const setLocation = (state: string, city: string) => {
    setSelectedState(state);
    setSelectedCity(city);
    showToast(`Location set to ${city}, ${state}`);
  };

  // ─────────────────────────────────────────
  // Context value
  // ─────────────────────────────────────────
  const value = useMemo<AppContextValue>(
    () => ({
      user, session, currentView, authLoading,
      signUp, signIn, loginAsAdmin, loginAsGuest, loginAsStaff, logout,
      setCurrentView, canView, canPartner,
      shops, shopsLoading, toggleShopOpen,
      customerLoc, customerAddress, setCustomerAddress,
      cart, addToCart, removeFromCart, updateQty, clearCart,
      orders, ordersLoading, placeOrder, updateOrderStatus, assignRider,
      riders, toggleRiderAvailability, updateRiderLocation,
      partnerStaff, addStaff, updateStaffPermissions, removeStaff,
      ratings, submitRating,
      savedAddresses, addAddress, updateAddress, removeAddress, setDefaultAddress,
      applications, submitApplication, approveApplication, rejectApplication,
      selectedState, selectedCity, setLocation,
      paymentMethod, setPaymentMethod,
      toast, showToast,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      user, session, currentView, authLoading,
      shops, shopsLoading,
      customerAddress, cart,
      orders, ordersLoading,
      riders, partnerStaff, ratings, savedAddresses, applications,
      selectedState, selectedCity, paymentMethod, toast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { type ReactNode, useEffect, useState } from "react";
import {
  PERMISSION_LABELS,
  type RoleView,
} from "../utils/helpers";
import { useApp } from "../context/AppContext";

// ---------- Logo ----------
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-sm", md: "h-10 w-10 text-base", lg: "h-14 w-14 text-2xl" };
  return (
    <div className={`inline-flex items-center justify-center rounded-2xl bg-[#FF6B00] text-white font-extrabold shadow-lg shadow-orange-200 ${sizes[size]}`}>
      I
    </div>
  );
}

// ---------- Back button ----------
export function BackButton({ to, label = "Back" }: { to?: string; label?: string }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => (to ? nav(to) : nav(-1))}
      className="inline-flex items-center gap-1 rounded-full bg-white/90 hover:bg-white border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition"
      aria-label="Go back"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {label}
    </button>
  );
}

// ---------- Top Navbar (customer) ----------
export function Navbar() {
  const { user, cart } = useApp();
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to={user ? "/customer" : "/"} className="flex items-center gap-2">
          <Logo />
          <div className="hidden sm:block">
            <div className="font-extrabold text-[#1A1A1A] leading-none tracking-tight">INSTADAL</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Instant Delivery Always</div>
          </div>
        </Link>
        <Link
          to="/search"
          className="flex-1 max-w-md hidden md:flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <svg className="h-4 w-4 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span className="truncate">Search food, groceries, medicine...</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-orange-100 transition"
            aria-label="Search"
          >
            <svg className="h-5 w-5 text-[#1A1A1A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </Link>
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-orange-100 transition"
            aria-label="Cart"
          >
            <svg className="h-5 w-5 text-[#1A1A1A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </Link>
          <Link
            to={user?.isGuest ? "/" : user ? "/profile" : "/"}
            className="hidden sm:flex h-10 items-center gap-2 rounded-full bg-gray-100 px-3 text-sm font-medium hover:bg-orange-100"
          >
            <div className="h-6 w-6 rounded-full bg-[#FF6B00] text-white text-xs font-bold flex items-center justify-center">
              {(user?.name ?? "U").charAt(0)}
            </div>
            <span>{user?.isGuest ? "Sign up" : (user?.name ?? "Sign in")}</span>
          </Link>
        </div>
      </div>
      <RoleSwitcher />
    </header>
  );
}

// ---------- Role switcher ----------
export function RoleSwitcher() {
  const { user, currentView, setCurrentView, logout } = useApp();
  const nav = useNavigate();
  const loc = useLocation();

  if (!user) return null;

  if (user.isGuest) {
    return (
      <div className="border-t border-gray-100 bg-gradient-to-r from-orange-50 via-white to-green-50">
        <div className="mx-auto max-w-6xl px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-600">
            <span className="font-bold text-[#1A1A1A]">👀 Guest mode</span>
            <span className="ml-2 text-gray-500">Browse freely — sign up to place orders & track deliveries.</span>
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => nav("/")} className="rounded-full bg-[#FF6B00] text-white px-3 py-1 font-bold">
              Sign up free
            </button>
            <button onClick={() => { logout(); nav("/"); }} className="font-bold text-gray-500 hover:text-[#FF6B00]">
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items: { r: RoleView; label: string; to: string; icon: string }[] = [
    { r: "customer", label: "Customer", to: "/customer", icon: "🛍️" },
    { r: "partner",  label: "Partner",  to: "/partner",  icon: "🏪" },
    { r: "rider",    label: "Rider",    to: "/rider",    icon: "🛺" },
    { r: "admin",    label: "Admin",    to: "/admin",    icon: "🛠️" },
  ];
  const visible = items.filter((i) => user.allowedViews.includes(i.r));

  if (visible.length <= 1 && !user.isStaffAccount) {
    return (
      <div className="border-t border-gray-100 bg-gradient-to-r from-orange-50 via-white to-green-50">
        <div className="mx-auto max-w-6xl px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Signed in as <span className="font-bold text-[#1A1A1A] capitalize">{user.primaryRole}</span>
            {user.isStaffAccount && <span className="ml-1 text-[#FF6B00]">· Staff</span>}
          </span>
          <button onClick={() => { logout(); nav("/"); }} className="font-bold text-gray-500 hover:text-[#FF6B00]">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 bg-gradient-to-r from-orange-50 via-white to-green-50">
      <div className="mx-auto max-w-6xl px-4 py-1.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <span className="hidden sm:inline">View as:</span>
          <span className="font-bold text-[#1A1A1A] capitalize">{user.name.split(" ")[0]}</span>
          {user.isStaffAccount && (
            <span className="rounded-full bg-orange-100 text-[#FF6B00] px-2 py-0.5 font-bold">Staff</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {visible.map((it) => (
            <button
              key={it.r}
              onClick={() => {
                setCurrentView(it.r);
                if (!loc.pathname.startsWith("/" + it.r)) nav(it.to);
              }}
              className={`px-2.5 py-1 rounded-full font-semibold transition flex items-center gap-1 ${
                currentView === it.r
                  ? "bg-[#FF6B00] text-white shadow"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <span>{it.icon}</span>
              <span className="hidden sm:inline">{it.label}</span>
            </button>
          ))}
          <button
            onClick={() => { logout(); nav("/"); }}
            className="ml-1 px-2.5 py-1 rounded-full text-gray-500 hover:bg-white font-semibold"
            title="Sign out"
          >
            ⎋
          </button>
        </div>
      </div>
      {currentView === "partner" && user.isStaffAccount && user.partnerPermissions && (
        <div className="border-t border-orange-100 bg-orange-50/50">
          <div className="mx-auto max-w-6xl px-4 py-1 text-[11px] text-[#FF6B00] font-semibold">
            Staff access: {user.partnerPermissions.map((p) => PERMISSION_LABELS[p]).join(" · ")}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Bottom nav ----------
export function BottomNav() {
  const items = [
    { to: "/customer", icon: "home",    label: "Home"    },
    { to: "/search",   icon: "search",  label: "Search"  },
    { to: "/orders",   icon: "orders",  label: "Orders"  },
    { to: "/profile",  icon: "profile", label: "Profile" },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.1)]">
      <div className="grid grid-cols-4">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/customer"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                isActive ? "text-[#FF6B00]" : "text-gray-500"
              }`
            }
          >
            <BottomIcon name={it.icon} />
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function BottomIcon({ name }: { name: string }) {
  const common = "h-5 w-5";
  if (name === "home")
    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  if (name === "search")
    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if (name === "orders")
    return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

// ---------- ShopCard ----------
export function ShopCard({
  shop, distance, onClick,
}: {
  shop: { id: string; name: string; category: string; logo: string; rating: number; prepTime: string; isOpen: boolean; description: string };
  distance?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card-lift w-full text-left rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm"
    >
      <div className="relative h-32 bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 flex items-center justify-center text-6xl">
        {shop.logo}
        {!shop.isOpen && (
          <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center font-semibold">
            Closed
          </div>
        )}
        {distance !== undefined && (
          <span className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[11px] font-semibold text-gray-700">
            {distance.toFixed(1)} km
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-[15px] truncate">{shop.name}</h3>
            <p className="text-xs text-gray-500 truncate">{shop.category} · {shop.prepTime}</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
            ⭐ {shop.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">{shop.description}</p>
      </div>
    </button>
  );
}

// ---------- ProductCard ----------
export function ProductCard({
  product, onAdd, shopName,
}: {
  product: { id: string; name: string; description: string; price: number; image: string; category: string; isAvailable: boolean };
  onAdd: () => void;
  shopName?: string;
}) {
  return (
    <div className="card-lift flex gap-3 rounded-2xl bg-white border border-gray-100 p-3 shadow-sm">
      <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-3xl">
        {product.image}
      </div>
      <div className="flex-1 min-w-0">
        {shopName && <div className="text-[11px] font-bold text-[#FF6B00]">{shopName}</div>}
        <h4 className="font-bold text-sm truncate">{product.name}</h4>
        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-extrabold text-[#1A1A1A]">₦{product.price.toLocaleString()}</span>
          <button
            onClick={onAdd}
            className="rounded-full bg-[#FF6B00] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#E55A00] transition"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Modal ----------
export function Modal({
  open, onClose, title, children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl md:rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <h3 className="font-bold text-lg">{title}</h3>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center">
              ✕
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ---------- Toast ----------
export function ToastHost() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-full bg-[#1A1A1A] text-white px-4 py-2 text-sm font-medium shadow-xl">
      {toast}
    </div>
  );
}

// ---------- Auth page — no OTP ----------
export function AuthPage() {
  const {
    signUp,
    signIn,
    loginAsAdmin,
    loginAsGuest,
    loginAsStaff,
    partnerStaff,
    showToast,
  } = useApp();

  const nav = useNavigate();

  const [mode, setMode] = useState<"signup" | "signin">("signup");

  // signup
  const [primaryRole, setPrimaryRole] = useState<RoleView>("customer");
  const [name, setName] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupShowPw, setSignupShowPw] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // signin
  const [siPhone, setSiPhone] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);
  const [siLoading, setSiLoading] = useState(false);
  const [siError, setSiError] = useState("");

  // admin PIN
  const [adminPinMode, setAdminPinMode] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminShowPin, setAdminShowPin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  // staff
  const [staffPhone, setStaffPhone] = useState("");
  const [staffError, setStaffError] = useState("");

  const roleOptions: { r: Exclude<RoleView, "admin">; icon: string; title: string; sub: string; gradient: string }[] = [
    { r: "customer", icon: "🛍️", title: "Customer", sub: "Order anything, delivered fast",  gradient: "from-orange-500 to-amber-500"  },
    { r: "partner",  icon: "🏪", title: "Partner",  sub: "Grow your business on Instadal", gradient: "from-emerald-500 to-teal-500"  },
    { r: "rider",    icon: "🛺", title: "Rider",    sub: "Earn delivering on your keke",    gradient: "from-sky-500 to-blue-500"      },
  ];

  const resetSignup = () => {
    setName(""); setLocationState(""); setLocationCity("");
    setSignupPhone(""); setSignupPassword(""); setSignupError("");
  };
  const resetSignin = () => {
    setSiPhone(""); setSiPassword(""); setSiError("");
    setAdminPinMode(false); setAdminPin(""); setAdminError("");
  };

  const handleSiPhoneChange = (val: string) => {
    setSiPhone(val);
    setSiError("");
    if (val.trim().toLowerCase() === "admin") {
      setAdminPinMode(true);
      setAdminPin("");
      setAdminError("");
    } else {
      setAdminPinMode(false);
    }
  };

  const handleSignUp = async () => {
    setSignupError("");
    if (!name.trim())            { setSignupError("Please enter your name");            return; }
    if (!locationState)          { setSignupError("Please choose your location");        return; }
    if (!locationCity)           { setSignupError("Please choose your city");            return; }
    if (!signupPhone.trim())     { setSignupError("Please enter your phone number");     return; }
    if (signupPassword.trim().length < 6) { setSignupError("Password must be at least 6 characters"); return; }
    setSignupLoading(true);
    try {
      await signUp(name.trim(), signupPhone.trim(), signupPassword.trim(), primaryRole, locationState, locationCity);
      showToast(`Welcome to Instadal, ${name.split(" ")[0]}! 🎉`);
      nav("/" + primaryRole);
    } catch (e: unknown) {
      setSignupError(e instanceof Error ? e.message : "Sign up failed. Try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSignIn = async () => {
    setSiError("");
    if (!siPhone.trim())    { setSiError("Please enter your phone number"); return; }
    if (!siPassword.trim()) { setSiError("Please enter your password");     return; }
    setSiLoading(true);
    try {
      const role = await signIn(siPhone.trim(), siPassword.trim());
      nav("/" + role);
    } catch (e: unknown) {
      setSiError(e instanceof Error ? e.message : "Incorrect phone or password.");
    } finally {
      setSiLoading(false);
    }
  };

  const handleAdminPin = async () => {
    setAdminError("");
    if (!adminPin.trim()) { setAdminError("Enter your admin PIN"); return; }
    setAdminLoading(true);
    try {
      await loginAsAdmin(adminPin.trim());
      nav("/admin");
    } catch (e: unknown) {
      setAdminError(e instanceof Error ? e.message : "Incorrect PIN.");
    } finally {
      setAdminLoading(false);
    }
  };

  const staffSignIn = () => {
    const found = partnerStaff.find(
      (s) => s.phone.replace(/\s+/g, "") === staffPhone.replace(/\s+/g, "")
    );
    if (!found) { setStaffError("Phone not found. Ask your partner to add you first."); return; }
    setStaffError("");
    loginAsStaff(found);
    nav("/partner/orders");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-white to-amber-50" />
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-orange-200/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-green-200/60 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-6 text-center">
          <div className="flex justify-center mb-4"><Logo size="lg" /></div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">INSTADAL</h1>
          <p className="mt-1 text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-[#FF6B00]">
            Instant Delivery Always
          </p>
          <p className="mt-4 max-w-xl mx-auto text-gray-600">
            Food, groceries, ice cream & pharmacy — delivered across Awka in minutes.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 -mt-2 pb-16">
        <div className="rounded-3xl bg-white border border-gray-100 shadow-xl overflow-hidden">

          {/* Tab switcher */}
          <div className="grid grid-cols-2 bg-gray-50 p-1 m-3 rounded-full">
            <button
              onClick={() => { setMode("signup"); resetSignin(); }}
              className={`py-2 text-sm font-bold rounded-full transition ${mode === "signup" ? "bg-white shadow text-[#1A1A1A]" : "text-gray-500"}`}
            >
              Sign up
            </button>
            <button
              onClick={() => { setMode("signin"); resetSignup(); }}
              className={`py-2 text-sm font-bold rounded-full transition ${mode === "signin" ? "bg-white shadow text-[#1A1A1A]" : "text-gray-500"}`}
            >
              Sign in
            </button>
          </div>

          <div className="p-5">
            {mode === "signup" ? (
              <>
                <h2 className="text-lg font-extrabold">Join as...</h2>
                <p className="text-sm text-gray-500">Pick how you'll use Instadal</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {roleOptions.map((o) => (
                    <button
                      key={o.r}
                      onClick={() => setPrimaryRole(o.r)}
                      className={`text-left rounded-2xl p-3 border-2 transition ${
                        primaryRole === o.r ? "border-[#FF6B00] bg-orange-50" : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${o.gradient} text-white grid place-items-center text-xl shadow`}>
                        {o.icon}
                      </div>
                      <div className="mt-2 font-bold text-sm">{o.title}</div>
                      <div className="text-[11px] text-gray-500 leading-tight">{o.sub}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  <label className="text-xs font-bold text-gray-500">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Obi"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-xs font-bold text-gray-500">Location</label>
                  <button
                    onClick={() => setLocationOpen(true)}
                    className={`mt-1 w-full rounded-xl border p-3 text-sm text-left transition flex items-center justify-between ${
                      locationState
                        ? "border-[#FF6B00] bg-orange-50 text-[#1A1A1A] font-medium"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                  >
                    <span>{locationState && locationCity ? `📍 ${locationCity}, ${locationState}` : "Choose your state & city"}</span>
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-bold text-gray-500">Phone number</label>
                  <input
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="080xxxxxxxx"
                    inputMode="tel"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-xs font-bold text-gray-500">Password</label>
                  <div className="relative mt-1">
                    <input
                      type={signupShowPw ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pr-16 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setSignupShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-[#FF6B00]"
                    >
                      {signupShowPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {signupError && <p className="mt-2 text-xs text-red-600">{signupError}</p>}

                <button
                  onClick={handleSignUp}
                  disabled={signupLoading}
                  className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold shadow-lg shadow-orange-200 hover:bg-[#E55A00] disabled:opacity-60 transition"
                >
                  {signupLoading ? "Creating account..." : `Create ${roleOptions.find((o) => o.r === primaryRole)?.title} account →`}
                </button>

                <div className="my-3 flex items-center gap-2 text-[11px] text-gray-400">
                  <div className="flex-1 h-px bg-gray-200" /><span>or</span><div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                  onClick={() => { loginAsGuest(); nav("/customer"); }}
                  className="w-full rounded-full border-2 border-gray-200 bg-white py-3 text-sm font-extrabold text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00] transition"
                >
                  👀 Browse as guest
                </button>

                <div className="mt-3 text-center text-xs text-gray-400">
                  By continuing you agree to our Terms & Privacy Policy.
                </div>
              </>
            ) : (
              <>
                {adminPinMode ? (
                  <>
                    <div className="text-center mb-5">
                      <div className="text-3xl">🛠️</div>
                      <h2 className="text-lg font-extrabold mt-2">Admin access</h2>
                      <p className="text-sm text-gray-500 mt-1">Enter your admin PIN to continue</p>
                    </div>

                    <label className="text-xs font-bold text-gray-500">Admin PIN</label>
                    <div className="relative mt-1">
                      <input
                        value={adminPin}
                        onChange={(e) => { setAdminPin(e.target.value); setAdminError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleAdminPin()}
                        type={adminShowPin ? "text" : "password"}
                        placeholder="••••••"
                        autoFocus
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pr-16 text-sm outline-none focus:border-[#FF6B00] focus:bg-white tracking-widest font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setAdminShowPin((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                      >
                        {adminShowPin ? "Hide" : "Show"}
                      </button>
                    </div>

                    {adminError && <p className="mt-2 text-xs text-red-600">{adminError}</p>}

                    <button
                      onClick={handleAdminPin}
                      disabled={adminLoading}
                      className="mt-4 w-full rounded-full bg-[#1A1A1A] text-white py-3 font-extrabold hover:bg-[#FF6B00] transition disabled:opacity-60"
                    >
                      {adminLoading ? "Checking..." : "Enter Admin →"}
                    </button>

                    <button
                      onClick={() => { setAdminPinMode(false); setSiPhone(""); setAdminPin(""); setAdminError(""); }}
                      className="mt-3 w-full text-sm text-gray-500 hover:text-[#FF6B00] transition"
                    >
                      ← Back
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-extrabold">Welcome back</h2>
                    <p className="text-sm text-gray-500">Sign in to your account</p>

                    <div className="mt-4">
                      <label className="text-xs font-bold text-gray-500">Phone number</label>
                      <input
                        value={siPhone}
                        onChange={(e) => handleSiPhoneChange(e.target.value)}
                        placeholder="080xxxxxxxx"
                        inputMode="tel"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-bold text-gray-500">Password</label>
                      <div className="relative mt-1">
                        <input
                          value={siPassword}
                          onChange={(e) => { setSiPassword(e.target.value); setSiError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                          type={siShowPw ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pr-16 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setSiShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
                        >
                          {siShowPw ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {siError && <p className="mt-2 text-xs text-red-600">{siError}</p>}

                    <button
                      onClick={handleSignIn}
                      disabled={siLoading}
                      className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold shadow-lg shadow-orange-200 hover:bg-[#E55A00] transition disabled:opacity-60"
                    >
                      {siLoading ? "Signing in..." : "Sign in →"}
                    </button>

                    <div className="my-4 flex items-center gap-2 text-[11px] text-gray-400">
                      <div className="flex-1 h-px bg-gray-200" /><span>or</span><div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-3">
                      <div className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest">Partner staff</div>
                      <div className="text-[11px] text-gray-600 mt-0.5">Added by a partner? Sign in with the phone they registered.</div>
                      <input
                        value={staffPhone}
                        onChange={(e) => { setStaffPhone(e.target.value); setStaffError(""); }}
                        placeholder="Your registered phone"
                        className="mt-2 w-full rounded-xl border border-orange-200 bg-white p-2.5 text-sm outline-none focus:border-[#FF6B00]"
                      />
                      {staffError && <div className="text-[11px] text-red-600 mt-1">{staffError}</div>}
                      <button
                        onClick={staffSignIn}
                        className="mt-2 w-full rounded-full bg-[#1A1A1A] text-white py-2 text-xs font-bold hover:bg-[#FF6B00] transition"
                      >
                        Sign in as staff
                      </button>
                    </div>

                    <div className="mt-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-3">
                      <div className="text-xs font-bold text-gray-700 uppercase tracking-widest">👀 Just looking?</div>
                      <p className="text-[11px] text-gray-600 mt-0.5">Explore shops, menus and prices without signing up.</p>
                      <button
                        onClick={() => { loginAsGuest(); nav("/customer"); }}
                        className="mt-2 w-full rounded-full bg-[#1A1A1A] text-white py-2 text-xs font-bold hover:bg-[#FF6B00] transition"
                      >
                        Browse as guest
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-gray-500">
          <div className="rounded-xl bg-white p-3 border border-gray-100">
            <div className="text-lg">⚡</div><div className="font-bold">Fast delivery</div>
          </div>
          <div className="rounded-xl bg-white p-3 border border-gray-100">
            <div className="text-lg">🔒</div><div className="font-bold">Paystack secure</div>
          </div>
          <div className="rounded-xl bg-white p-3 border border-gray-100">
            <div className="text-lg">📍</div><div className="font-bold">Live tracking</div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-gray-400">
          © {new Date().getFullYear()} INSTADAL · Made in Awka 🇳🇬
        </div>
      </div>

      <LocationSelector
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onSelect={(s, c) => { setLocationState(s); setLocationCity(c); }}
        initialState={locationState}
        initialCity={locationCity}
      />
    </div>
  );
}

// ---------- LiveMap ----------
export function LiveMap({
  shopLat, shopLng, destLat, destLng, riderLat, riderLng, showRoute = true,
}: {
  shopLat: number; shopLng: number; destLat: number; destLng: number;
  riderLat?: number; riderLng?: number; showRoute?: boolean;
}) {
  const lats = [shopLat, destLat, riderLat ?? shopLat];
  const lngs = [shopLng, destLng, riderLng ?? shopLng];
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padLat = Math.max(0.005, (maxLat - minLat) * 0.4);
  const padLng = Math.max(0.005, (maxLng - minLng) * 0.4);
  const boxMinLat = minLat - padLat, boxMaxLat = maxLat + padLat;
  const boxMinLng = minLng - padLng, boxMaxLng = maxLng + padLng;
  const toX = (lng: number) => ((lng - boxMinLng) / (boxMaxLng - boxMinLng)) * 100;
  const toY = (lat: number) => (1 - (lat - boxMinLat) / (boxMaxLat - boxMinLat)) * 100;

  const sx = toX(shopLng), sy = toY(shopLat);
  const dx = toX(destLng), dy = toY(destLat);
  const rx = riderLng !== undefined ? toX(riderLng) : undefined;
  const ry = riderLat !== undefined ? toY(riderLat) : undefined;

  return (
    <div className="relative map-bg rounded-2xl overflow-hidden h-full min-h-[240px] border border-gray-200">
      <div className="absolute top-[30%] left-0 right-0 h-1 road opacity-60" />
      <div className="absolute top-[65%] left-0 right-0 h-1 road opacity-60" />
      <div className="absolute left-[40%] top-0 bottom-0 w-1 road opacity-60" />
      <div className="absolute left-[70%] top-0 bottom-0 w-1 road opacity-60" />

      {showRoute && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1={`${sx}%`} y1={`${sy}%`} x2={`${dx}%`} y2={`${dy}%`} stroke="#FF6B00" strokeWidth={3} strokeDasharray="6 5" strokeLinecap="round" opacity={0.8} />
        </svg>
      )}

      <Pin left={sx} top={sy} color="#22C55E" label="Shop" emoji="🏪" />
      <Pin left={dx} top={dy} color="#1A1A1A" label="You"  emoji="📍" />
      {rx !== undefined && ry !== undefined && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${rx}%`, top: `${ry}%` }}>
          <div className="relative rider-pulse">
            <div className="h-10 w-10 rounded-full bg-[#FF6B00] grid place-items-center shadow-lg border-2 border-white">
              <span className="text-lg">🛺</span>
            </div>
          </div>
          <div className="mt-1 -ml-6 w-14 text-center text-[10px] font-bold text-[#FF6B00] bg-white rounded-full px-1 py-0.5 shadow">Rider</div>
        </div>
      )}
    </div>
  );
}

function Pin({ left, top, color, label, emoji }: { left: number; top: number; color: string; label: string; emoji: string }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-full z-10" style={{ left: `${left}%`, top: `${top}%` }}>
      <div className="flex flex-col items-center">
        <div className="h-9 w-9 rounded-full grid place-items-center text-lg shadow-md border-2 border-white" style={{ background: color }}>
          <span>{emoji}</span>
        </div>
        <div className="mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow" style={{ background: color }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ---------- RatingStars ----------
export function RatingStars({
  value, onChange, size = "md", interactive = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" };
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className={`inline-flex items-center gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition`}
        >
          <span className={i <= display ? "text-[#FF6B00]" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

// ---------- LocationSelector ----------
import { NIGERIAN_STATES, NIGERIAN_LOCATIONS } from "../utils/helpers";

export function LocationSelector({
  open, onClose, onSelect, initialState, initialCity,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (state: string, city: string) => void;
  initialState?: string;
  initialCity?: string;
}) {
  const [state, setState] = useState(initialState ?? "");
  const [city, setCity]   = useState(initialCity  ?? "");
  const [q, setQ]         = useState("");

  useEffect(() => {
    if (open) { setState(initialState ?? ""); setCity(initialCity ?? ""); setQ(""); }
  }, [open, initialState, initialCity]);

  if (!open) return null;

  const query = q.trim().toLowerCase();
  const filteredStates = query ? NIGERIAN_STATES.filter((s) => s.toLowerCase().includes(query)) : NIGERIAN_STATES;
  const cities = state ? NIGERIAN_LOCATIONS[state] ?? [] : [];
  const filteredCities = query ? cities.filter((c) => c.toLowerCase().includes(query)) : cities;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg">Choose your location</h3>
            <p className="text-xs text-gray-500">We'll show you shops & items near you.</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-gray-100 grid place-items-center">✕</button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
            <span>🔍</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search state or city..." className="flex-1 bg-transparent outline-none text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-auto grid md:grid-cols-2 divide-x divide-gray-100">
          <div>
            <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 sticky top-0 bg-white">State</div>
            {filteredStates.map((s) => (
              <button key={s} onClick={() => { setState(s); setCity(""); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition ${state === s ? "bg-orange-50 text-[#FF6B00] font-bold" : "hover:bg-gray-50"}`}>
                {s}
              </button>
            ))}
          </div>
          <div>
            <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 sticky top-0 bg-white">
              {state ? `Cities in ${state}` : "Pick a state first"}
            </div>
            {filteredCities.length > 0 ? filteredCities.map((c) => (
              <button key={c} onClick={() => setCity(c)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition ${city === c ? "bg-orange-50 text-[#FF6B00] font-bold" : "hover:bg-gray-50"}`}>
                {c}
              </button>
            )) : state ? (
              <div className="px-4 py-3 text-xs text-gray-400">No cities match.</div>
            ) : (
              <div className="px-4 py-3 text-xs text-gray-400">← Select a state</div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-full bg-gray-100 py-2.5 text-sm font-bold">Cancel</button>
          <button disabled={!state || !city} onClick={() => { onSelect(state, city); onClose(); }}
            className="flex-1 rounded-full bg-[#FF6B00] text-white py-2.5 text-sm font-extrabold disabled:opacity-40">
            Confirm {city && state ? `· ${city}, ${state}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- AddressCard ----------
import type { SavedAddress } from "../utils/helpers";

export function AddressCard({
  addr, selected, onSelect, onEdit, onDelete,
}: {
  addr: SavedAddress;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl p-3 border-2 transition ${selected ? "border-[#FF6B00] bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`h-5 w-5 rounded-full border-2 grid place-items-center ${selected ? "border-[#FF6B00]" : "border-gray-300"}`}>
            {selected && <div className="h-2.5 w-2.5 rounded-full bg-[#FF6B00]" />}
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              {addr.label}
              {addr.isDefault && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">DEFAULT</span>}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">{addr.address}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
          {onEdit   && <button onClick={onEdit}   className="text-[11px] font-bold text-gray-500 hover:text-[#FF6B00]">Edit</button>}
          {onDelete && <button onClick={onDelete} className="text-[11px] font-bold text-red-500 hover:text-red-600">Delete</button>}
        </div>
      </div>
      {addr.mapsLink && (
        <a
          href={addr.mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:underline"
        >
          📍 Open in Google Maps
        </a>
      )}
    </button>
  );
}

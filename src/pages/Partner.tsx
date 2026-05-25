import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
// signIn and verifyOtp are used in PartnerLogin below
import {
  ALL_PARTNER_PERMISSIONS,
  COMMISSION_RATES,
  PERMISSION_LABELS,
  PRODUCTS,
  calculateFees,
  formatNGN,
  STATUS_LABELS,
  type PartnerPermission,
  type Product,
} from "../utils/helpers";
import { Logo, RoleSwitcher } from "../components/UI";

function PartnerShell({ children, tab }: { children: React.ReactNode; tab: string }) {
  const { logout, shops, toggleShopOpen, canPartner, user } = useApp();
  const nav = useNavigate();
  const shop = shops[0]; // Partner owns first shop in demo
  const all_items: { id: string; perm: PartnerPermission; label: string; to: string; icon: string }[] = [
    { id: "dashboard", perm: "dashboard", label: "Dashboard", to: "/partner", icon: "📊" },
    { id: "incoming", perm: "orders", label: "Orders", to: "/partner/orders", icon: "🧾" },
    { id: "menu", perm: "menu", label: "Menu", to: "/partner/menu", icon: "🍽️" },
    { id: "team", perm: "team", label: "Team", to: "/partner/team", icon: "👥" },
  ];
  const nav_items = all_items.filter((n) => canPartner(n.perm));
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/partner" className="flex items-center gap-2">
            <Logo />
            <div>
              <div className="font-extrabold leading-none">Partner</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">{shop?.name ?? "INSTADAL"}</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleShopOpen(shop.id)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                shop.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${shop.isOpen ? "bg-green-500" : "bg-gray-400"}`} />
              {shop.isOpen ? "Open" : "Closed"}
            </button>
            <button onClick={() => { logout(); nav("/"); }} className="text-xs font-bold text-gray-500 hover:text-[#FF6B00]">Sign out</button>
          </div>
        </div>
        <RoleSwitcher />
        <nav className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 flex gap-1 overflow-x-auto no-scrollbar">
            {nav_items.map((n) => (
              <NavLink
                key={n.id}
                to={n.to}
                end={n.id === "dashboard"}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                  tab === n.id ? "border-[#FF6B00] text-[#FF6B00]" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <span>{n.icon}</span> {n.label}
              </NavLink>
            ))}
            {user?.isStaffAccount && (
              <div className="ml-auto flex items-center px-2 text-[11px] text-gray-400">
                Staff account
              </div>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5">{children}</main>
    </div>
  );
}

// Partner login
export function PartnerLogin() {
  const { signIn, verifyOtp } = useApp();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setError("");
    if (!phone.trim()) { setError("Enter your phone number"); return; }
    setLoading(true);
    try { await signIn(phone.trim()); setOtpSent(true); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to send OTP"); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setError("");
    if (!otp.trim()) { setError("Enter the OTP"); return; }
    setLoading(true);
    try { await verifyOtp(phone.trim(), otp.trim()); nav("/partner"); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Invalid OTP"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 grid place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-5">
          <Logo />
          <span className="font-extrabold text-lg">INSTADAL Partner</span>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100">
          <h2 className="text-xl font-extrabold">{otpSent ? "Enter OTP" : "Partner sign in"}</h2>
          <p className="text-sm text-gray-500">{otpSent ? `Code sent to ${phone}` : "Manage your shop & receive orders."}</p>
          {!otpSent ? (
            <>
              <label className="mt-4 block text-xs font-bold text-gray-500">Phone number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080xxxxxxxx"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00]" />
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              <button onClick={handleSend} disabled={loading}
                className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold disabled:opacity-60">
                {loading ? "Sending..." : "Send OTP →"}
              </button>
            </>
          ) : (
            <>
              <label className="mt-4 block text-xs font-bold text-gray-500">6-digit OTP</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] text-center text-xl tracking-widest font-bold" />
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              <button onClick={handleVerify} disabled={loading}
                className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold disabled:opacity-60">
                {loading ? "Verifying..." : "Verify & Enter →"}
              </button>
              <button onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                className="mt-2 w-full text-sm text-gray-500 hover:text-[#FF6B00]">← Change number</button>
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">New to Instadal? <Link to="/" className="font-bold text-[#FF6B00]">Back to home</Link></p>
      </div>
    </div>
  );
}

// Partner Dashboard
export function PartnerDashboard() {
  const { orders, shops, canPartner } = useApp();
  if (!canPartner("dashboard")) {
    return <PartnerShell tab="dashboard"><Locked perm="dashboard" title="the dashboard" /></PartnerShell>;
  }
  const shop = shops[0];
  const myOrders = orders.filter((o) => o.shopId === shop.id);
  const today = new Date().toDateString();
  const todayOrders = myOrders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const revenue = todayOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => {
      const f = calculateFees(o.subtotal, 3, shop.category);
      return sum + f.shopPayout;
    }, 0);
  const active = myOrders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;

  return (
    <PartnerShell tab="dashboard">
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Today's revenue" value={formatNGN(revenue)} accent="bg-emerald-50 text-emerald-700" icon="💰" />
        <Stat label="Orders today" value={todayOrders.length.toString()} accent="bg-orange-50 text-orange-700" icon="🧾" />
        <Stat label="Active orders" value={active.toString()} accent="bg-blue-50 text-blue-700" icon="⚡" />
        <Stat label="Commission rate" value={`${(COMMISSION_RATES[shop.category] * 100).toFixed(0)}%`} accent="bg-violet-50 text-violet-700" icon="📉" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Recent orders</h3>
            <Link to="/partner/orders" className="text-xs font-bold text-[#FF6B00]">View all</Link>
          </div>
          <div className="mt-3 divide-y divide-gray-100">
            {myOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">{o.id}</div>
                  <div className="text-xs text-gray-500">{o.items.length} items · {new Date(o.createdAt).toLocaleTimeString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold">{formatNGN(o.total)}</div>
                  <div className="text-[11px] text-gray-500">{STATUS_LABELS[o.status]}</div>
                </div>
              </div>
            ))}
            {myOrders.length === 0 && <p className="py-6 text-center text-sm text-gray-500">No orders yet.</p>}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-5 shadow-md">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">Shop status</div>
          <div className="mt-1 text-xl font-extrabold">{shop.isOpen ? "We're open 🟢" : "Closed 🔴"}</div>
          <p className="text-sm mt-1 opacity-90">You'll hear a ping on every new order. Keep your device on.</p>
          <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs">
            <div className="font-bold mb-1">Today's breakdown</div>
            <div className="flex justify-between"><span>Delivered</span><span>{todayOrders.filter(o => o.status === "delivered").length}</span></div>
            <div className="flex justify-between"><span>In progress</span><span>{active}</span></div>
            <div className="flex justify-between"><span>Cancelled</span><span>{todayOrders.filter(o => o.status === "cancelled").length}</span></div>
          </div>
        </div>
      </div>
    </PartnerShell>
  );
}

function Stat({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold ${accent}`}>
        <span>{icon}</span> {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
    </div>
  );
}

// Locked screen for staff without permission
function Locked({ perm, title }: { perm: PartnerPermission; title: string }) {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-10 text-center">
      <div className="text-5xl">🔒</div>
      <h3 className="mt-3 font-extrabold">Access restricted</h3>
      <p className="text-sm text-gray-500 mt-1">Your account doesn't have permission to view {title}.</p>
      <p className="text-xs text-[#FF6B00] mt-3">
        Ask your partner to grant the <b>{perm}</b> permission from the Team tab.
      </p>
    </div>
  );
}

// Incoming orders
export function IncomingOrders() {
  const { orders, shops, updateOrderStatus, showToast, canPartner } = useApp();
  if (!canPartner("orders")) {
    return <PartnerShell tab="incoming"><Locked perm="orders" title="incoming orders" /></PartnerShell>;
  }
  const shop = shops[0];
  const [filter, setFilter] = useState<"incoming" | "active" | "done">("incoming");

  const incoming = orders.filter((o) => o.shopId === shop.id && o.status === "pending");
  const active = orders.filter((o) => o.shopId === shop.id && ["accepted", "preparing", "rider_assigned", "picked_up"].includes(o.status));
  const done = orders.filter((o) => o.shopId === shop.id && ["delivered", "cancelled"].includes(o.status));

  const list = filter === "incoming" ? incoming : filter === "active" ? active : done;

  // Audio ping simulation
  useEffect(() => {
    if (incoming.length > 0) {
      showToast(`🔔 New order from ${incoming[0].customerName}!`);
    }
  }, [incoming.length, showToast]);

  return (
    <PartnerShell tab="incoming">
      <div className="flex gap-2 mb-4">
        {(["incoming", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
              filter === f ? "bg-[#1A1A1A] text-white" : "bg-white border border-gray-200 text-gray-700"
            }`}
          >
            {f} ({(f === "incoming" ? incoming : f === "active" ? active : done).length})
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-extrabold">{o.id}</div>
                <div className="text-xs text-gray-500">{o.customerName} · {new Date(o.createdAt).toLocaleTimeString()}</div>
              </div>
              <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{STATUS_LABELS[o.status]}</span>
            </div>
            <div className="mt-3 space-y-1">
              {o.items.map((it) => (
                <div key={it.product.id} className="flex justify-between text-sm">
                  <span>{it.quantity}× {it.product.name}</span>
                  <span className="text-gray-500">{formatNGN(it.product.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="font-extrabold">{formatNGN(o.total)}</span>
              <div className="flex gap-2">
                {o.status === "pending" && (
                  <>
                    <button onClick={() => { updateOrderStatus(o.id, "accepted"); showToast("Order accepted"); }} className="rounded-full bg-green-600 text-white px-3 py-1.5 text-xs font-bold">Accept</button>
                    <button onClick={() => updateOrderStatus(o.id, "cancelled")} className="rounded-full bg-gray-100 text-gray-700 px-3 py-1.5 text-xs font-bold">Reject</button>
                  </>
                )}
                {o.status === "preparing" && (
                  <button onClick={() => { updateOrderStatus(o.id, "preparing"); showToast("Marked ready — rider notified"); }} className="rounded-full bg-[#FF6B00] text-white px-3 py-1.5 text-xs font-bold">Ready for pickup</button>
                )}
                {(o.status === "rider_assigned" || o.status === "picked_up") && (
                  <span className="text-xs text-gray-500">🛺 {o.riderName ?? "Rider"} handling it</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="col-span-full rounded-2xl bg-white border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">
            No {filter} orders.
          </div>
        )}
      </div>
    </PartnerShell>
  );
}

// Manage menu
export function ManageMenu() {
  const { shops, canPartner } = useApp();
  if (!canPartner("menu")) {
    return <PartnerShell tab="menu"><Locked perm="menu" title="the menu editor" /></PartnerShell>;
  }
  const shop = shops[0];
  const [products, setProducts] = useState<Product[]>(PRODUCTS.filter((p) => p.shopId === shop.id));
  const [editing, setEditing] = useState<Product | null>(null);

  const save = (p: Product) => {
    setProducts((arr) => {
      const ex = arr.find((x) => x.id === p.id);
      if (ex) return arr.map((x) => (x.id === p.id ? p : x));
      return [...arr, p];
    });
    setEditing(null);
  };

  const del = (id: string) => setProducts((arr) => arr.filter((p) => p.id !== id));

  return (
    <PartnerShell tab="menu">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold">Menu management</h2>
          <p className="text-sm text-gray-500">{products.length} items</p>
        </div>
        <button
          onClick={() => setEditing({ id: "new-" + Date.now(), shopId: shop.id, name: "", description: "", price: 0, image: "🍽️", category: "New", isAvailable: true })}
          className="rounded-full bg-[#FF6B00] text-white px-4 py-2 text-sm font-bold"
        >
          + Add item
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-orange-50 grid place-items-center text-2xl">{p.image}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{p.name}</div>
                <div className="text-xs text-gray-500">{p.category}</div>
                <div className="font-extrabold text-sm">{formatNGN(p.price)}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setEditing(p)} className="flex-1 rounded-full bg-gray-100 py-1.5 text-xs font-bold">Edit</button>
              <button onClick={() => del(p.id)} className="flex-1 rounded-full bg-red-50 text-red-600 py-1.5 text-xs font-bold">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg">{editing.id.startsWith("new") ? "New item" : "Edit item"}</h3>
            <div className="mt-4 space-y-3">
              <Field label="Name"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" /></Field>
              <Field label="Description"><textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input" rows={2} /></Field>
              <Field label="Price (₦)"><input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="input" /></Field>
              <Field label="Emoji / image"><input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="input" /></Field>
              <Field label="Category"><input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input" /></Field>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-full bg-gray-100 py-2.5 text-sm font-bold">Cancel</button>
              <button onClick={() => save(editing)} className="flex-1 rounded-full bg-[#FF6B00] text-white py-2.5 text-sm font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.input { width:100%; border-radius:12px; border:1px solid #e5e7eb; background:#f9fafb; padding:10px; font-size:14px; outline:none; } .input:focus { border-color:#FF6B00; background:white; }`}</style>
    </PartnerShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// ===========================================================
// MANAGE TEAM — add staff + set granular permissions
// ===========================================================
export function ManageTeam() {
  const {
    partnerStaff,
    addStaff,
    updateStaffPermissions,
    removeStaff,
    canPartner,
    showToast,
  } = useApp();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [perms, setPerms] = useState<PartnerPermission[]>(["orders"]);

  if (!canPartner("team")) {
    return (
      <PartnerShell tab="team">
        <Locked perm="team" title="the team manager" />
      </PartnerShell>
    );
  }

  const submit = () => {
    if (!name.trim() || !phone.trim()) {
      showToast("Name and phone required");
      return;
    }
    if (perms.length === 0) {
      showToast("Pick at least one permission");
      return;
    }
    addStaff(name.trim(), phone.trim(), perms);
    setName("");
    setPhone("");
    setPerms(["orders"]);
    showToast(`${name.split(" ")[0]} added to your team`);
  };

  const togglePerm = (id: string, p: PartnerPermission, current: PartnerPermission[]) => {
    const has = current.includes(p);
    const next = has ? current.filter((x) => x !== p) : [...current, p];
    if (next.length === 0) {
      showToast("Staff must have at least one permission");
      return;
    }
    updateStaffPermissions(id, next);
  };

  return (
    <PartnerShell tab="team">
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Add staff form */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <h3 className="font-extrabold text-lg">Add staff</h3>
          <p className="text-sm text-gray-500">Grant your team access to specific parts of the partner app.</p>

          <div className="mt-4 space-y-3">
            <Field label="Full name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chuka Eze" className="input" />
            </Field>
            <Field label="Phone number">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080xxxxxxxx" className="input" />
              <span className="text-[11px] text-gray-400">They'll use this phone to sign in.</span>
            </Field>
            <Field label="Permissions">
              <div className="space-y-2 mt-1">
                {ALL_PARTNER_PERMISSIONS.map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={perms.includes(p)}
                      onChange={() => setPerms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]))}
                      className="h-4 w-4 accent-[#FF6B00]"
                    />
                    <span className="text-sm">{PERMISSION_LABELS[p]}</span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="rounded-xl bg-orange-50 border border-orange-100 p-2 text-[11px] text-[#FF6B00] font-semibold">
              💡 Default: Orders only — so staff can handle incoming orders but not edit the menu.
            </div>
          </div>

          <button onClick={submit} className="mt-4 w-full rounded-full bg-[#FF6B00] text-white py-2.5 text-sm font-bold">
            + Add to team
          </button>
        </div>

        {/* Staff list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-lg">Team members</h3>
            <span className="text-xs text-gray-500">{partnerStaff.length} staff</span>
          </div>

          <div className="space-y-3">
            {partnerStaff.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white grid place-items-center font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.phone}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      removeStaff(s.id);
                      showToast(`Removed ${s.name.split(" ")[0]}`);
                    }}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 rounded-full px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ALL_PARTNER_PERMISSIONS.map((p) => {
                    const active = s.permissions.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePerm(s.id, p, s.permissions)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          active
                            ? "bg-[#FF6B00] text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {active ? "✓ " : ""}{p}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-[11px] text-gray-400">
                  Added {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {partnerStaff.length === 0 && (
              <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                No staff yet. Add someone on the left.
              </div>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">How staff sign in</div>
            <p className="text-sm mt-1 text-gray-700">
              After adding them here, staff sign in on the home page under <b>"Partner Staff"</b> using the phone you registered.
              They'll only see the tabs you allow.
            </p>
          </div>
        </div>
      </div>
      <style>{`.input { width:100%; border-radius:12px; border:1px solid #e5e7eb; background:#f9fafb; padding:10px; font-size:14px; outline:none; } .input:focus { border-color:#FF6B00; background:white; }`}</style>
    </PartnerShell>
  );
}



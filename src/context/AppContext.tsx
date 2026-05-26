import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatNGN, STATUS_LABELS, calculateFees, type OrderStatus } from "../utils/helpers";
import { Logo, RoleSwitcher } from "../components/UI";
import { useState } from "react";

function AdminShell({ children, tab }: { children: React.ReactNode; tab: string }) {
  const { user, logout } = useApp();
  const nav = useNavigate();
  const items = [
    { id: "dashboard", label: "Dashboard", to: "/admin", icon: "📊" },
    { id: "shops", label: "Shops", to: "/admin/shops", icon: "🏪" },
    { id: "riders", label: "Riders", to: "/admin/riders", icon: "🛺" },
    { id: "payouts", label: "Payouts", to: "/admin/payouts", icon: "💸" },
  ];
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <Logo />
            <div>
              <div className="font-extrabold leading-none">Admin</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">INSTADAL HQ</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-gray-500">Signed in as {user?.name}</span>
            <button onClick={() => { logout(); nav("/"); }} className="text-xs font-bold text-gray-500 hover:text-[#FF6B00]">Sign out</button>
          </div>
        </div>
        <RoleSwitcher />
        <nav className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 flex gap-1 overflow-x-auto no-scrollbar">
            {items.map((n) => (
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
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5">{children}</main>
    </div>
  );
}

export function AdminLogin() {
  const { signIn } = useApp();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!phone.trim()) { setError("Enter your phone number"); return; }
    if (!password.trim()) { setError("Enter your password"); return; }
    setLoading(true);
    try {
      const role = await signIn(phone.trim(), password.trim());
      if (role !== "admin") { setError("This account does not have admin access."); return; }
      nav("/admin");
    }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Sign in failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 grid place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-5">
          <Logo />
          <span className="font-extrabold text-lg">INSTADAL Admin</span>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100">
          <h2 className="text-xl font-extrabold">Admin sign in</h2>
          <p className="text-sm text-gray-500">Manage the platform.</p>
          <label className="mt-4 block text-xs font-bold text-gray-500">Phone number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080xxxxxxxx"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00]" />
          <label className="mt-3 block text-xs font-bold text-gray-500">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00]"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold disabled:opacity-60">
            {loading ? "Signing in..." : "Enter Admin →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { orders, shops, riders } = useApp();
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const delivered = todayOrders.filter((o) => o.status === "delivered");

  const { revenue, shopPayouts, riderPayouts } = delivered.reduce(
    (acc, o) => {
      const shop = shops.find((s) => s.id === o.shopId);
      const f = calculateFees(o.subtotal, 3, shop?.category ?? "Restaurant");
      acc.revenue += f.instadalTotal;
      acc.shopPayouts += f.shopPayout;
      acc.riderPayouts += f.riderPayout;
      return acc;
    },
    { revenue: 0, shopPayouts: 0, riderPayouts: 0 }
  );

  const activeRiders = riders.filter((r) => r.isAvailable).length;
  const openShops = shops.filter((s) => s.isOpen).length;

  return (
    <AdminShell tab="dashboard">
      <div className="grid md:grid-cols-4 gap-3">
        <Stat label="Orders today" value={todayOrders.length.toString()} icon="🧾" accent="bg-orange-50 text-orange-700" />
        <Stat label="Revenue today" value={formatNGN(revenue)} icon="💰" accent="bg-emerald-50 text-emerald-700" />
        <Stat label="Active riders" value={`${activeRiders}/${riders.length}`} icon="🛺" accent="bg-sky-50 text-sky-700" />
        <Stat label="Open shops" value={`${openShops}/${shops.length}`} icon="🏪" accent="bg-violet-50 text-violet-700" />
      </div>

      <div className="mt-5 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-bold">Recent orders</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-2">Order</th>
                  <th className="py-2 pr-2">Shop</th>
                  <th className="py-2 pr-2">Customer</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className="py-2 pr-2 font-semibold">{o.id}</td>
                    <td className="py-2 pr-2">{o.shopName}</td>
                    <td className="py-2 pr-2 text-gray-500">{o.customerName}</td>
                    <td className="py-2 pr-2 font-bold">{formatNGN(o.total)}</td>
                    <td className="py-2"><StatusChip status={o.status} /></td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-500">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white p-5 shadow-md">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">Revenue split (today)</div>
          <div className="mt-4 space-y-3 text-sm">
            <Bar label="Instadal" value={revenue} max={revenue + shopPayouts + riderPayouts || 1} color="bg-white" />
            <Bar label="Shop payouts" value={shopPayouts} max={revenue + shopPayouts + riderPayouts || 1} color="bg-white/80" />
            <Bar label="Rider payouts" value={riderPayouts} max={revenue + shopPayouts + riderPayouts || 1} color="bg-white/60" />
          </div>
          <div className="mt-5 rounded-xl bg-white/10 p-3 text-xs">
            <div className="font-bold mb-1">Formulas</div>
            <div>Shop payout = subtotal − commission</div>
            <div>Rider = 60% of delivery fee</div>
            <div>Instadal = commission + 40% delivery + 7% service</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-3 gap-3">
        <QuickLink to="/admin/shops" icon="🏪" label="Manage shops" desc="Approve, suspend, edit" />
        <QuickLink to="/admin/riders" icon="🛺" label="Manage riders" desc="Activate, view status" />
        <QuickLink to="/admin/payouts" icon="💸" label="Trigger payouts" desc="Paystack transfers" />
      </div>
    </AdminShell>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon: string; accent: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold ${accent}`}>
        <span>{icon}</span> {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-bold">{formatNGN(value)}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-white/20 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label, desc }: { to: string; icon: string; label: string; desc: string }) {
  return (
    <Link to={to} className="card-lift block rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className="text-3xl">{icon}</div>
      <div className="mt-2 font-bold">{label}</div>
      <div className="text-xs text-gray-500">{desc}</div>
      <div className="mt-2 text-xs font-bold text-[#FF6B00]">Open →</div>
    </Link>
  );
}

function StatusChip({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-amber-100 text-amber-700",
    preparing: "bg-blue-100 text-blue-700",
    rider_assigned: "bg-indigo-100 text-indigo-700",
    picked_up: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${map[status]}`}>{STATUS_LABELS[status]}</span>
  );
}

export function ManageShops() {
  const { shops, toggleShopOpen, showToast } = useApp();
  const [filter, setFilter] = useState<"all" | "open" | "closed" | "pending">("all");
  const list = shops.filter((s) => {
    if (filter === "open") return s.isOpen;
    if (filter === "closed") return !s.isOpen;
    if (filter === "pending") return !s.isApproved;
    return true;
  });
  return (
    <AdminShell tab="shops">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-extrabold">Shops ({shops.length})</h2>
        <div className="flex gap-1">
          {(["all", "open", "closed", "pending"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${filter === f ? "bg-[#1A1A1A] text-white" : "bg-white border border-gray-200"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-left px-4 py-3">Shop</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Rating</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-orange-50 grid place-items-center">{s.logo}</div>
                    <div>
                      <div className="font-bold">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.address}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{s.category}</td>
                <td className="px-4 py-3">⭐ {s.rating}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {s.isOpen ? "Open" : "Closed"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => { toggleShopOpen(s.id); showToast("Toggled"); }} className="text-xs font-bold text-[#FF6B00]">{s.isOpen ? "Close" : "Open"}</button>
                  <button onClick={() => showToast("Suspended (demo)")} className="text-xs font-bold text-red-600">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

export function ManageRiders() {
  const { riders, toggleRiderAvailability, showToast } = useApp();
  return (
    <AdminShell tab="riders">
      <h2 className="text-xl font-extrabold mb-4">Riders ({riders.length})</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {riders.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-sky-100 grid place-items-center text-xl">🛺</div>
              <div>
                <div className="font-bold">{r.name}</div>
                <div className="text-xs text-gray-500">{r.phone}</div>
              </div>
              <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${r.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {r.isAvailable ? "Online" : "Offline"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-gray-50 p-2">
                <div className="text-gray-500">Today</div>
                <div className="font-extrabold">{r.deliveriesToday}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <div className="text-gray-500">Earnings</div>
                <div className="font-extrabold">{formatNGN(r.totalEarnings)}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { toggleRiderAvailability(r.id); showToast("Toggled"); }} className="flex-1 rounded-full bg-gray-100 py-1.5 text-xs font-bold">
                Toggle availability
              </button>
              <button onClick={() => showToast("Suspended (demo)")} className="rounded-full bg-red-50 text-red-600 px-3 py-1.5 text-xs font-bold">Suspend</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function Payouts() {
  const { orders, shops, riders, showToast } = useApp();
  const delivered = orders.filter((o) => o.status === "delivered");

  const shopPayouts = shops.map((s) => {
    const mine = delivered.filter((o) => o.shopId === s.id);
    const total = mine.reduce((sum, o) => sum + calculateFees(o.subtotal, 3, s.category).shopPayout, 0);
    return { ...s, amount: total, count: mine.length };
  }).filter((x) => x.amount > 0);

  const riderPayouts = riders.map((r) => {
    const mine = delivered.filter((o) => o.riderId === r.id);
    const total = mine.reduce((sum, o) => sum + Math.round(o.deliveryFee * 0.6), 0);
    return { ...r, amount: total, count: mine.length };
  }).filter((x) => x.amount > 0);

  return (
    <AdminShell tab="payouts">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 shadow-lg">
        <div className="text-xs font-bold uppercase tracking-widest opacity-90">Weekly payout run</div>
        <div className="text-2xl font-extrabold mt-1">Paystack Transfer API</div>
        <p className="text-sm opacity-90 mt-1">Run payouts every Friday. Riders get 60% of delivery fees; shops get subtotal minus commission.</p>
        <button onClick={() => showToast("Payouts triggered ✓ (demo)")} className="mt-4 rounded-full bg-white text-emerald-700 px-5 py-2.5 text-sm font-extrabold">
          Run payouts now
        </button>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-bold">Shop payouts</h3>
          <div className="mt-3 divide-y divide-gray-100">
            {shopPayouts.map((s) => (
              <div key={s.id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.logo}</span>
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.count} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold">{formatNGN(s.amount)}</div>
                  <button onClick={() => showToast("Paid (demo)")} className="text-[11px] font-bold text-[#FF6B00]">Pay now</button>
                </div>
              </div>
            ))}
            {shopPayouts.length === 0 && <p className="py-4 text-sm text-gray-500">No payouts pending.</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-bold">Rider payouts</h3>
          <div className="mt-3 divide-y divide-gray-100">
            {riderPayouts.map((r) => (
              <div key={r.id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛺</span>
                  <div>
                    <div className="text-sm font-semibold">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.count} deliveries</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold">{formatNGN(r.amount)}</div>
                  <button onClick={() => showToast("Paid (demo)")} className="text-[11px] font-bold text-[#FF6B00]">Pay now</button>
                </div>
              </div>
            ))}
            {riderPayouts.length === 0 && <p className="py-4 text-sm text-gray-500">No payouts pending.</p>}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

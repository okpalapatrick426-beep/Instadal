import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatNGN, STATUS_LABELS, type Order } from "../utils/helpers";
import { LiveMap, Logo, RoleSwitcher } from "../components/UI";

function RiderShell({ children, tab }: { children: React.ReactNode; tab: string }) {
  const { user, logout, riders } = useApp();
  const nav = useNavigate();
  const me = riders[0];
  const items = [
    { id: "dashboard", label: "Dashboard", to: "/rider", icon: "🏠" },
    { id: "active", label: "Active", to: "/rider/active", icon: "🚚" },
    { id: "earnings", label: "Earnings", to: "/rider/earnings", icon: "💰" },
  ];
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/rider" className="flex items-center gap-2">
            <Logo />
            <div>
              <div className="font-extrabold leading-none">Rider</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">{me?.name ?? user?.name}</div>
            </div>
          </Link>
          <button onClick={() => { logout(); nav("/"); }} className="text-xs font-bold text-gray-500 hover:text-[#FF6B00]">Sign out</button>
        </div>
        <RoleSwitcher />
        <nav className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-5xl px-4 flex gap-1 overflow-x-auto no-scrollbar">
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
      <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>
    </div>
  );
}

export function RiderLogin() {
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
      if (role !== "rider") { setError("This account does not have rider access."); return; }
      nav("/rider");
    }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Sign in failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 grid place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-5">
          <Logo />
          <span className="font-extrabold text-lg">INSTADAL Rider</span>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100">
          <h2 className="text-xl font-extrabold">Rider sign in</h2>
          <p className="text-sm text-gray-500">Deliver & earn in Awka.</p>
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
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RiderDashboard() {
  const { orders, riders, toggleRiderAvailability, assignRider, updateOrderStatus, showToast } = useApp();
  const nav = useNavigate();
  const me = riders[0];
  // Offer first "preparing" order to this rider
  const offeredOrder = useMemo<Order | undefined>(() => orders.find((o) => o.status === "preparing" && !o.riderId), [orders]);
  const active = orders.find((o) => o.riderId === me.id && ["rider_assigned", "picked_up"].includes(o.status));

  return (
    <RiderShell tab="dashboard">
      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white p-5 shadow-md">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">Status</div>
          <div className="text-xl font-extrabold mt-1">{me.isAvailable ? "Online 🟢" : "Offline"}</div>
          <button
            onClick={() => { toggleRiderAvailability(me.id); showToast(me.isAvailable ? "You're offline" : "You're online"); }}
            className="mt-3 rounded-full bg-white text-[#1A1A1A] px-3 py-1.5 text-xs font-bold"
          >
            {me.isAvailable ? "Go offline" : "Go online"}
          </button>
        </div>
        <Stat label="Deliveries today" value={me.deliveriesToday.toString()} icon="📦" accent="bg-orange-50 text-orange-700" />
        <Stat label="Total earnings" value={formatNGN(me.totalEarnings)} icon="💰" accent="bg-emerald-50 text-emerald-700" />
      </div>

      {active && (
        <div className="mt-5 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Active delivery</h3>
            <button onClick={() => nav("/rider/active")} className="text-xs font-bold text-[#FF6B00]">Open</button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{active.shopName} → {active.deliveryAddress}</p>
          <p className="text-sm font-bold mt-1">Status: {STATUS_LABELS[active.status]}</p>
        </div>
      )}

      {/* Offer banner */}
      {offeredOrder && !active && me.isAvailable && (
        <div className="mt-5 rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#E55A00] text-white p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">🔔 New delivery request</div>
          <div className="text-xl font-extrabold mt-1">{offeredOrder.shopName}</div>
          <p className="text-sm mt-1 opacity-95">Pickup: {offeredOrder.shopName}</p>
          <p className="text-sm opacity-95">Drop-off: {offeredOrder.deliveryAddress}</p>
          <div className="mt-3 inline-flex items-center gap-3 bg-white/15 px-3 py-1.5 rounded-full text-sm font-bold">
            <span>💰 Est. earnings: {formatNGN(Math.round(offeredOrder.deliveryFee * 0.6))}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                assignRider(offeredOrder.id, me.id);
                showToast("Delivery accepted");
                nav("/rider/active");
              }}
              className="rounded-full bg-white text-[#FF6B00] px-5 py-2.5 text-sm font-extrabold"
            >
              Accept
            </button>
            <button
              onClick={() => { updateOrderStatus(offeredOrder.id, "preparing"); showToast("Declined"); }}
              className="rounded-full bg-black/20 text-white px-5 py-2.5 text-sm font-bold"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {!offeredOrder && !active && (
        <div className="mt-6 rounded-2xl bg-white border border-dashed border-gray-200 p-8 text-center">
          <div className="text-5xl">🛺</div>
          <h3 className="mt-2 font-extrabold">Waiting for orders</h3>
          <p className="text-sm text-gray-500 mt-1">Stay online — a request will ping here.</p>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-4">
        <h3 className="font-bold">Live GPS sharing</h3>
        <p className="text-xs text-gray-500">Your location is broadcast every 5 seconds while online.</p>
        <div className="mt-3 h-32 rounded-xl map-bg relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#FF6B00] text-white grid place-items-center shadow border-2 border-white">🛺</div>
        </div>
      </div>
    </RiderShell>
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

export function RiderActiveDelivery() {
  const { orders, riders, updateOrderStatus, updateRiderLocation, showToast } = useApp();
  const me = riders[0];
  const order = orders.find((o) => o.riderId === me.id && ["rider_assigned", "picked_up"].includes(o.status));
  // Simulate live location sharing every 2s via Socket.io
  useEffect(() => {
    if (!order) return;
    let t = 0;
    const iv = setInterval(() => {
      t += 1;
      const step = t * 0.02;
      const progress = order.status === "rider_assigned" ? Math.min(0.5, step) : 0.5 + Math.min(0.5, step - 0.5);
      const lat = order.shopLat + (order.deliveryLat - order.shopLat) * progress;
      const lng = order.shopLng + (order.deliveryLng - order.shopLng) * progress;
      updateRiderLocation(me.id, lat, lng);
    }, 2000);
    return () => clearInterval(iv);
  }, [order?.id, order?.status, me.id, updateRiderLocation]);

  if (!order) {
    return (
      <RiderShell tab="active">
        <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-10 text-center">
          <div className="text-5xl">📭</div>
          <p className="mt-3 text-sm text-gray-500">No active delivery right now.</p>
        </div>
      </RiderShell>
    );
  }

  return (
    <RiderShell tab="active">
      <div className="rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E55A00] text-white p-5 shadow-lg">
        <div className="text-xs font-bold uppercase tracking-widest opacity-90">{STATUS_LABELS[order.status]}</div>
        <div className="text-xl font-extrabold mt-1">{order.shopName}</div>
        <p className="text-sm opacity-95 mt-1">Deliver to {order.deliveryAddress}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="bg-white/20 px-2 py-1 rounded-full font-bold">📞 {order.customerPhone}</span>
          <span className="bg-white/20 px-2 py-1 rounded-full font-bold">💰 {formatNGN(Math.round(order.deliveryFee * 0.6))}</span>
        </div>
      </div>

      <div className="mt-4 h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-100">
        <LiveMap
          shopLat={order.shopLat}
          shopLng={order.shopLng}
          destLat={order.deliveryLat}
          destLng={order.deliveryLng}
          riderLat={order.riderLat}
          riderLng={order.riderLng}
        />
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-bold text-sm">Items to pick up</h3>
          <div className="mt-2 space-y-1 text-sm">
            {order.items.map((i) => (
              <div key={i.product.id} className="flex justify-between">
                <span>{i.quantity}× {i.product.name}</span>
                <span className="text-gray-500">{formatNGN(i.product.price * i.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-bold text-sm">Navigation</h3>
          <p className="text-xs text-gray-500 mt-1">Opens Google Maps with route.</p>
          <button
            onClick={() => showToast("🗺️ Opening Google Maps...")}
            className="mt-2 w-full rounded-full bg-[#1A1A1A] text-white py-2.5 text-sm font-bold"
          >
            🧭 Navigate to pickup
          </button>
          <button
            onClick={() => showToast("🗺️ Opening Google Maps...")}
            className="mt-2 w-full rounded-full bg-gray-100 py-2.5 text-sm font-bold"
          >
            🧭 Navigate to customer
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {order.status === "rider_assigned" && (
          <button
            onClick={() => { updateOrderStatus(order.id, "picked_up"); showToast("Marked picked up ✓"); }}
            className="rounded-full bg-[#FF6B00] text-white py-3 font-extrabold"
          >
            Mark Picked Up
          </button>
        )}
        {order.status === "picked_up" && (
          <button
            onClick={() => { updateOrderStatus(order.id, "delivered"); showToast("Delivered 🎉"); }}
            className="col-span-2 rounded-full bg-green-600 text-white py-3 font-extrabold"
          >
            Mark Delivered
          </button>
        )}
        <button onClick={() => showToast("Called customer")} className="rounded-full bg-gray-100 py-3 font-bold">📞 Call customer</button>
        <button onClick={() => showToast("Help chat opened")} className="rounded-full bg-gray-100 py-3 font-bold">💬 Support</button>
      </div>
    </RiderShell>
  );
}

export function RiderEarnings() {
  const { orders, riders } = useApp();
  const me = riders[0];
  const delivered = orders.filter((o) => o.riderId === me.id && o.status === "delivered");
  const earnings = delivered.reduce((s, o) => s + Math.round(o.deliveryFee * 0.6), 0);

  return (
    <RiderShell tab="earnings">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 shadow-lg">
        <div className="text-xs font-bold uppercase tracking-widest opacity-90">Total earnings</div>
        <div className="text-4xl font-extrabold mt-1">{formatNGN(me.totalEarnings + earnings)}</div>
        <div className="text-sm mt-1 opacity-90">{delivered.length} deliveries completed · 60% of delivery fees</div>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <h3 className="font-bold">Recent deliveries</h3>
        {delivered.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">Complete your first delivery to see earnings here.</p>
        ) : (
          <div className="mt-2 divide-y divide-gray-100">
            {delivered.map((o) => (
              <div key={o.id} className="py-2 flex justify-between text-sm">
                <div>
                  <div className="font-semibold">{o.id} · {o.shopName}</div>
                  <div className="text-xs text-gray-500">{new Date(o.deliveredAt ?? o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-600">+{formatNGN(Math.round(o.deliveryFee * 0.6))}</div>
                  <div className="text-[11px] text-gray-400">{STATUS_LABELS[o.status]}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <h3 className="font-bold">Payouts</h3>
        <p className="text-xs text-gray-500 mt-1">Weekly payouts via Paystack Transfer every Friday.</p>
        <button className="mt-3 w-full rounded-full bg-[#1A1A1A] text-white py-2.5 text-sm font-bold">Request early payout</button>
      </div>
    </RiderShell>
  );
}

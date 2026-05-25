import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ToastHost } from "./components/UI";
import {
  CustomerHome,
  ShopList,
  ShopPage,
  CartPage,
  CheckoutPage,
  OrderTracking,
  OrdersPage,
  ProfilePage,
  SearchPage,
} from "./pages/Customer";
import { AuthPage } from "./components/UI";
import {
  PartnerLogin,
  PartnerDashboard,
  IncomingOrders,
  ManageMenu,
  ManageTeam,
} from "./pages/Partner";
import {
  RiderLogin,
  RiderDashboard,
  RiderActiveDelivery,
  RiderEarnings,
} from "./pages/Rider";
import {
  AdminLogin,
  AdminDashboard,
  ManageShops,
  ManageRiders,
  Payouts,
} from "./pages/Admin";

// HashRouter — no SPA rewrite rules needed on Vercel/static hosts
function ProtectedRole({ allow, children }: { allow: string[]; children: React.ReactNode }) {
  const { user, authLoading, currentView } = useApp();

  // Show a simple loading screen while Supabase restores the session
  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#FF6B00] grid place-items-center text-white text-2xl font-extrabold animate-pulse">
            I
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in and trying to access a protected route
  if (!user) return <Navigate to="/" replace />;

  // Wrong role
  if (!allow.includes(currentView)) {
    return (
      <div className="min-h-screen grid place-items-center p-8 text-center">
        <div>
          <div className="text-6xl">🔒</div>
          <h1 className="mt-3 text-xl font-extrabold">Access restricted</h1>
          <p className="text-sm text-gray-500 mt-1">
            This screen is for {allow.join(" / ")} only.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />

          {/* Customer */}
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/shops" element={<ShopList />} />
          <Route path="/shop/:id" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track/:id" element={<OrderTracking />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Partner */}
          <Route path="/partner/login" element={<PartnerLogin />} />
          <Route path="/partner" element={
            <ProtectedRole allow={["partner", "admin"]}><PartnerDashboard /></ProtectedRole>
          } />
          <Route path="/partner/orders" element={
            <ProtectedRole allow={["partner", "admin"]}><IncomingOrders /></ProtectedRole>
          } />
          <Route path="/partner/menu" element={
            <ProtectedRole allow={["partner", "admin"]}><ManageMenu /></ProtectedRole>
          } />
          <Route path="/partner/team" element={
            <ProtectedRole allow={["partner", "admin"]}><ManageTeam /></ProtectedRole>
          } />

          {/* Rider */}
          <Route path="/rider/login" element={<RiderLogin />} />
          <Route path="/rider" element={
            <ProtectedRole allow={["rider", "admin"]}><RiderDashboard /></ProtectedRole>
          } />
          <Route path="/rider/active" element={
            <ProtectedRole allow={["rider", "admin"]}><RiderActiveDelivery /></ProtectedRole>
          } />
          <Route path="/rider/earnings" element={
            <ProtectedRole allow={["rider", "admin"]}><RiderEarnings /></ProtectedRole>
          } />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRole allow={["admin"]}><AdminDashboard /></ProtectedRole>
          } />
          <Route path="/admin/shops" element={
            <ProtectedRole allow={["admin"]}><ManageShops /></ProtectedRole>
          } />
          <Route path="/admin/riders" element={
            <ProtectedRole allow={["admin"]}><ManageRiders /></ProtectedRole>
          } />
          <Route path="/admin/payouts" element={
            <ProtectedRole allow={["admin"]}><Payouts /></ProtectedRole>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastHost />
      </HashRouter>
    </AppProvider>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  AWKA_CENTER,
  CATEGORIES,
  NIGERIAN_LOCATIONS,
  PAYMENT_METHODS,
  PRODUCT_CATEGORIES,
  PRODUCTS,
  avgRating,
  calculateFees,
  formatNGN,
  getDistanceKm,
  STATUS_LABELS,
  STATUS_STEPS,
  type OrderStatus,
  type PaymentMethod,
  type SavedAddress,
} from "../utils/helpers";
import {
  AddressCard,
  BackButton,
  BottomNav,
  LiveMap,
  LocationSelector,
  Modal,
  Navbar,
  ProductCard,
  RatingStars,
  ShopCard,
} from "../components/UI";

// ===========================================================
// SEARCH — universal (shops + products)
// ===========================================================
export function SearchPage() {
  const { shops, addToCart, customerLoc, setCurrentView } = useApp();
  const nav = useNavigate();
  useEffect(() => { setCurrentView("customer"); }, [setCurrentView]);

  const initial = new URLSearchParams(window.location.search).get("q") ?? "";
  const [q, setQ] = useState(initial);
  const query = q.trim().toLowerCase();

  const matchedShops = useMemo(
    () =>
      query
        ? shops
            .filter(
              (s) =>
                s.name.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query) ||
                s.description.toLowerCase().includes(query)
            )
            .map((s) => ({
              ...s,
              distance: getDistanceKm(customerLoc.lat, customerLoc.lng, s.lat, s.lng),
            }))
        : [],
    [query, shops, customerLoc]
  );

  const matchedProducts = useMemo(() => {
    if (!query) return [];
    return PRODUCTS.map((p) => {
      const shop = shops.find((s) => s.id === p.shopId)!;
      const matches =
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        shop.name.toLowerCase().includes(query);
      return matches ? { product: p, shop } : null;
    }).filter(Boolean) as { product: typeof PRODUCTS[number]; shop: typeof shops[number] }[];
  }, [query, shops]);

  const suggestions = [
    "jollof",
    "shawarma",
    "ice cream",
    "paracetamol",
    "rice",
    "suya",
    "burger",
    "tomato",
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-5">
        <div className="flex items-center gap-2">
          <BackButton to="/customer" />
          <h2 className="text-xl font-extrabold">Search</h2>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white border-2 border-[#FF6B00] px-4 py-3 shadow-md">
          <svg className="h-5 w-5 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'jollof', 'shawarma', 'paracetamol'..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-xs font-bold text-gray-500">Clear</button>
          )}
        </div>

        {!query && (
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Popular searches</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setQ(s)} className="rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-orange-50 hover:border-[#FF6B00]">
                  {s}
                </button>
              ))}
            </div>
            <h3 className="mt-6 text-xs font-bold uppercase tracking-widest text-gray-400">Browse by category</h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => nav(`/shops?cat=${c.id}`)} className="rounded-2xl bg-white border border-gray-100 p-3 text-center hover:border-[#FF6B00]">
                  <div className="text-2xl">{c.icon}</div>
                  <div className="mt-1 text-xs font-semibold">{c.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {query && (
          <div className="mt-5 space-y-6">
            {matchedProducts.length > 0 && (
              <div>
                <h3 className="font-extrabold flex items-center gap-2">
                  <span>🍽️ Items</span>
                  <span className="text-xs font-semibold text-gray-400">({matchedProducts.length})</span>
                </h3>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {matchedProducts.slice(0, 8).map(({ product, shop }) => (
                    <div key={product.id} onClick={() => nav(`/shop/${shop.id}`)} className="cursor-pointer">
                      <ProductCard product={product} shopName={shop.name} onAdd={() => addToCart(product)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchedShops.length > 0 && (
              <div>
                <h3 className="font-extrabold flex items-center gap-2">
                  <span>🏪 Shops</span>
                  <span className="text-xs font-semibold text-gray-400">({matchedShops.length})</span>
                </h3>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {matchedShops.slice(0, 6).map((s) => (
                    <ShopCard
                      key={s.id}
                      shop={s}
                      distance={s.distance}
                      onClick={() => nav(`/shop/${s.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {matchedProducts.length === 0 && matchedShops.length === 0 && (
              <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-10 text-center">
                <div className="text-5xl">🔍</div>
                <h3 className="mt-3 font-extrabold">No matches for "{q}"</h3>
                <p className="text-sm text-gray-500 mt-1">Try another keyword or browse a category.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

// ===========================================================
// CUSTOMER HOME
// ===========================================================
export function CustomerHome() {
  const { shops, customerLoc, user, setCurrentView, selectedState, selectedCity, setLocation } = useApp();
  const nav = useNavigate();
  const [showLocation, setShowLocation] = useState(false);
  useEffect(() => { setCurrentView("customer"); }, [setCurrentView]);

  // Filter shops by selected location
  const localShops = shops.filter((s) => s.state === selectedState && s.city === selectedCity);
  const displayShops = localShops.length > 0 ? localShops : shops;
  const locationLabel = localShops.length > 0
    ? `${selectedCity}, ${selectedState}`
    : (selectedCity ? `${selectedCity}, ${selectedState} · showing all` : "All Nigeria");

  const featured = displayShops.filter((s) => s.featured);
  const malls = displayShops.filter((s) => s.isMall);
  const openShops = displayShops.filter((s) => s.isOpen);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-5">
        {!user && (
          <div className="mb-3">
            <Link to="/" className="text-xs font-bold text-[#FF6B00]">← Sign in / Sign up</Link>
          </div>
        )}

        {/* Location selector — always visible */}
        <button
          onClick={() => setShowLocation(true)}
          className="w-full flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition mb-4"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] text-white grid place-items-center shadow">
            📍
          </div>
          <div className="flex-1 text-left">
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Deliver to</div>
            <div className="font-extrabold text-[15px]">{selectedCity || "Choose location"}</div>
            <div className="text-[11px] text-gray-500">{selectedState || "Pick your state & city"}</div>
          </div>
          <div className="text-xs font-bold text-[#FF6B00]">Change ›</div>
        </button>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#E55A00] text-white p-6 md:p-8 shadow-xl">
          <div className="absolute -right-10 -bottom-10 text-[180px] opacity-20 leading-none">🛺</div>
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-widest opacity-90">Now delivering in</div>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{locationLabel} 🇳🇬</h2>
            <p className="text-white/90 text-sm mt-1 max-w-md">
              {displayShops.length} shops ready · Food, groceries, ice cream & pharmacy at your fingertips.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <button onClick={() => nav("/shops")} className="rounded-full bg-white text-[#FF6B00] px-4 py-2 text-sm font-bold shadow">Browse shops</button>
              <button onClick={() => nav("/search")} className="rounded-full bg-white/20 text-white px-4 py-2 text-sm font-bold backdrop-blur">🔍 Search items</button>
            </div>
          </div>
        </div>

        <LocationSelector
          open={showLocation}
          onClose={() => setShowLocation(false)}
          onSelect={(s, c) => setLocation(s, c)}
          initialState={selectedState}
          initialCity={selectedCity}
        />

        {/* Categories */}
        <h3 className="mt-7 font-extrabold text-lg">What are you craving?</h3>
        <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => nav(`/shops?cat=${c.id}`)}
              className="card-lift rounded-2xl bg-white border border-gray-100 p-3 text-center"
            >
              <div className="text-3xl">{c.icon}</div>
              <div className="mt-1 text-xs font-semibold">{c.label}</div>
            </button>
          ))}
        </div>

        {/* Malls & Supermarkets */}
        {malls.length > 0 && (
          <div className="mt-7">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-extrabold text-lg">🏬 Malls & Supermarkets</h3>
                <p className="text-xs text-gray-500">1000+ products — use the in-shop search to find anything.</p>
              </div>
              <button onClick={() => nav("/shops?cat=grocery")} className="text-xs font-bold text-[#FF6B00]">See all</button>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {malls.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => nav(`/shop/${s.id}`)}
                  className="card-lift text-left rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex gap-3"
                >
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 grid place-items-center text-3xl flex-shrink-0">{s.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm truncate">{s.name}</h3>
                      <span className="rounded-full bg-orange-100 text-[#FF6B00] text-[10px] font-bold px-1.5 py-0.5">MALL</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{s.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className="font-bold">⭐ {s.rating}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{s.itemCount?.toLocaleString()} items</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{s.city}, {s.state}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories — routes to search with category filter */}
        <h3 className="mt-7 font-extrabold text-lg">What are you craving?</h3>
        <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => nav(`/search?cat=${c.id}`)}
              className="card-lift rounded-2xl bg-white border border-gray-100 p-3 text-center"
            >
              <div className="text-3xl">{c.icon}</div>
              <div className="mt-1 text-xs font-semibold">{c.label}</div>
            </button>
          ))}
        </div>

        {/* Featured */}
        <div className="mt-7 flex items-end justify-between">
          <h3 className="font-extrabold text-lg">Featured near you</h3>
          <button onClick={() => nav("/shops")} className="text-xs font-bold text-[#FF6B00]">See all</button>
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
          {featured.slice(0, 6).map((s) => (
            <ShopCard
              key={s.id}
              shop={s}
              distance={getDistanceKm(customerLoc.lat, customerLoc.lng, s.lat, s.lng)}
              onClick={() => nav(`/shop/${s.id}`)}
            />
          ))}
        </div>

        {/* All open */}
        {openShops.length > 0 && (
          <>
            <h3 className="mt-7 font-extrabold text-lg">Open now</h3>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              {openShops.slice(0, 9).map((s) => (
                <ShopCard
                  key={s.id}
                  shop={s}
                  distance={getDistanceKm(customerLoc.lat, customerLoc.lng, s.lat, s.lng)}
                  onClick={() => nav(`/shop/${s.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {/* Info strip */}
        <div className="mt-8 rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-100 grid place-items-center text-xl">⚡</div>
          <div>
            <div className="text-sm font-bold">Proudly built for Awka</div>
            <div className="text-xs text-gray-500">Serving Zik Avenue, UNIZIK, Amawbia, Aroma, Eke Awka & more.</div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// ===========================================================
// SHOP LIST
// ===========================================================
export function ShopList() {
  const { shops, customerLoc } = useApp();
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const params = new URLSearchParams(window.location.search);
  const initialCat = params.get("cat") ?? "";
  const [cat, setCat] = useState<string>(initialCat);

  const filtered = useMemo(() => {
    return shops
      .filter((s) => (cat ? s.categoryId === cat : true))
      .filter((s) => (search ? s.name.toLowerCase().includes(search.toLowerCase()) : true))
      .map((s) => ({
        ...s,
        distance: getDistanceKm(customerLoc.lat, customerLoc.lng, s.lat, s.lng),
      }))
      .filter((s) => s.distance <= 10)
      .sort((a, b) => a.distance - b.distance);
  }, [shops, cat, search, customerLoc]);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-5">
        <h2 className="text-2xl font-extrabold">Shops near you</h2>
        <p className="text-sm text-gray-500">Within 10 km of your location</p>

        <div className="mt-4 flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2.5 shadow-sm">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops (e.g. jollof, shawarma...)"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <CatPill active={cat === ""} onClick={() => setCat("")}>All</CatPill>
          {CATEGORIES.map((c) => (
            <CatPill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              <span className="mr-1">{c.icon}</span>{c.label}
            </CatPill>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <ShopCard
              key={s.id}
              shop={s}
              distance={s.distance}
              onClick={() => nav(`/shop/${s.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl bg-white border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No shops match your search yet.
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function CatPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-[#1A1A1A] text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

// ===========================================================
// SHOP PAGE
// ===========================================================
export function ShopPage() {
  const { id } = useParams();
  const { shops, addToCart, customerLoc } = useApp();
  const shop = shops.find((s) => s.id === id);
  const products = PRODUCTS.filter((p) => p.shopId === id);

  if (!shop) {
    return (
      <div className="min-h-screen pb-24 md:pb-10">
        <Navbar />
        <div className="mx-auto max-w-6xl p-8 text-center text-gray-500">Shop not found.</div>
      </div>
    );
  }

  const dist = getDistanceKm(customerLoc.lat, customerLoc.lng, shop.lat, shop.lng);
  const cats = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />
      <div className="relative h-40 md:h-56 bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100">
        <div className="absolute inset-0 grid place-items-center text-[110px] md:text-[140px] opacity-90">
          {shop.logo}
        </div>
        <div className="absolute top-4 left-4"><BackButton to="/shops" /></div>
      </div>
      <div className="mx-auto max-w-6xl px-4 -mt-8 relative">
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-extrabold text-xl">{shop.name}</h1>
              <p className="text-xs text-gray-500">{shop.category} · {shop.address} · {dist.toFixed(1)} km away</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-bold bg-gray-100 px-2 py-1 rounded">
              ⭐ {shop.rating}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{shop.description}</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-green-100 text-green-700 px-2 py-1 font-bold">● {shop.isOpen ? "Open" : "Closed"}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold">⏱ {shop.prepTime}</span>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {cats.map((cat) => (
            <div key={cat}>
              <h3 className="font-extrabold text-base">{cat}</h3>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {products.filter((p) => p.category === cat).map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// ===========================================================
// CART
// ===========================================================
export function CartPage() {
  const { cart, updateQty, removeFromCart, customerLoc, shops } = useApp();
  const nav = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pb-24 md:pb-10">
        <Navbar />
        <div className="mx-auto max-w-md p-10 text-center">
          <div className="text-7xl">🛒</div>
          <h2 className="mt-4 text-xl font-extrabold">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mt-1">Add something tasty from our Awka shops.</p>
          <button onClick={() => nav("/shops")} className="mt-5 rounded-full bg-[#FF6B00] text-white px-5 py-2.5 text-sm font-bold">Browse shops</button>
        </div>
      </div>
    );
  }

  const shopId = cart[0].product.shopId;
  const shop = shops.find((s) => s.id === shopId);
  const mixed = cart.some((c) => c.product.shopId !== shopId);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const distance = shop ? getDistanceKm(customerLoc.lat, customerLoc.lng, shop.lat, shop.lng) : 0;
  const fees = calculateFees(subtotal, distance, shop?.category ?? "Restaurant");

  return (
    <div className="min-h-screen pb-40 md:pb-10">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-5">
        <div className="flex items-center gap-2 mb-1"><BackButton to="/shops" /></div>
        <h2 className="text-2xl font-extrabold">Your cart</h2>
        <p className="text-sm text-gray-500">From {shop?.name ?? "—"}</p>

        {mixed && (
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">
            Items from multiple shops are grouped — checkout one shop at a time.
          </div>
        )}

        <div className="mt-4 space-y-2">
          {cart.map((it) => (
            <div key={it.product.id} className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 p-3 shadow-sm">
              <div className="h-14 w-14 rounded-xl bg-orange-50 grid place-items-center text-2xl">{it.product.image}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{it.product.name}</div>
                <div className="text-xs text-gray-500">{formatNGN(it.product.price)}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(it.product.id, it.quantity - 1)} className="h-8 w-8 rounded-full bg-gray-100 font-bold">−</button>
                <span className="w-7 text-center text-sm font-bold">{it.quantity}</span>
                <button onClick={() => updateQty(it.product.id, it.quantity + 1)} className="h-8 w-8 rounded-full bg-gray-100 font-bold">+</button>
              </div>
              <button onClick={() => removeFromCart(it.product.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-2">Price breakdown</h3>
          <Row label="Subtotal" value={formatNGN(fees.subtotal)} />
          <Row label="Service fee (7%)" value={formatNGN(fees.serviceFee)} />
          <Row label={`Delivery fee (${distance.toFixed(1)} km)`} value={formatNGN(fees.deliveryFee)} />
          <div className="border-t border-gray-100 my-2" />
          <Row label={<span className="font-extrabold">Total</span>} value={<span className="font-extrabold text-[#FF6B00]">{formatNGN(fees.total)}</span>} />
          <p className="mt-2 text-[11px] text-gray-400">Partner commission calculated at checkout.</p>
        </div>

        <button
          onClick={() => nav("/checkout")}
          className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold shadow-lg shadow-orange-200 hover:bg-[#E55A00] transition"
        >
          Go to checkout · {formatNGN(fees.total)}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ===========================================================
// CHECKOUT
// ===========================================================
export function CheckoutPage() {
  const { cart, placeOrder, customerLoc, customerAddress, setCustomerAddress, showToast, user } = useApp();
  const nav = useNavigate();
  const [address, setAddress] = useState(customerAddress);
  const [phone, setPhone] = useState("08012345678");
  const [paying, setPaying] = useState(false);

  // Guests can't checkout — nudge to sign up
  if (user?.isGuest) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-10 text-center">
          <div className="text-6xl">🔒</div>
          <h2 className="mt-3 text-xl font-extrabold">Sign up to place orders</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create a free account in seconds to pay securely and track your delivery live.
          </p>
          <p className="text-xs text-gray-400 mt-2">Your cart is saved — come back anytime.</p>
          <div className="mt-5 flex gap-2">
            <button onClick={() => nav("/shops")} className="flex-1 rounded-full bg-gray-100 py-2.5 text-sm font-bold">Keep browsing</button>
            <button onClick={() => nav("/")} className="flex-1 rounded-full bg-[#FF6B00] text-white py-2.5 text-sm font-bold">Sign up</button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shop = cart[0];
  const fees = calculateFees(subtotal, 3, "Restaurant");

  if (!cart.length) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-md p-10 text-center text-gray-500">Cart is empty.</div>
      </div>
    );
  }

  const pay = async () => {
    if (!address.trim() || !phone.trim()) {
      showToast("Add delivery address and phone");
      return;
    }
    setPaying(true);
    setCustomerAddress(address);
    // Simulate Paystack popup
    await new Promise((r) => setTimeout(r, 1200));
    try {
      const o = placeOrder(address, customerLoc.lat, customerLoc.lng, phone);
      setPaying(false);
      nav(`/track/${o.id}`);
    } catch (e) {
      setPaying(false);
      showToast("Payment failed");
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-5">
        <div className="flex items-center gap-2 mb-1"><BackButton to="/cart" /></div>
        <h2 className="text-2xl font-extrabold">Checkout</h2>
        <p className="text-sm text-gray-500">Confirm details & pay securely via Paystack.</p>

        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <label className="text-xs font-bold text-gray-500">Delivery address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
            placeholder="House number, street, landmark..."
          />
        </div>

        <div className="mt-3 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <label className="text-xs font-bold text-gray-500">Phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
            placeholder="080xxxxxxxx"
          />
        </div>

        <div className="mt-3 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <label className="text-xs font-bold text-gray-500">Payment method</label>
          <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 text-white grid place-items-center font-extrabold text-sm">₦</div>
            <div className="flex-1">
              <div className="text-sm font-bold">Paystack</div>
              <div className="text-xs text-gray-500">Card · Bank transfer · USSD</div>
            </div>
            <div className="text-green-600 text-xs font-bold">✓ Selected</div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-2">Order summary</h3>
          {cart.map((it) => (
            <div key={it.product.id} className="flex justify-between text-sm py-1">
              <span className="text-gray-600">{it.quantity}× {it.product.name}</span>
              <span>{formatNGN(it.product.price * it.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 my-2" />
          <Row label="Subtotal" value={formatNGN(fees.subtotal)} />
          <Row label="Service fee" value={formatNGN(fees.serviceFee)} />
          <Row label="Delivery fee" value={formatNGN(fees.deliveryFee)} />
          <Row label={<span className="font-extrabold">Total</span>} value={<span className="font-extrabold text-[#FF6B00]">{formatNGN(fees.total)}</span>} />
        </div>

        <button
          onClick={pay}
          disabled={paying}
          className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold shadow-lg shadow-orange-200 hover:bg-[#E55A00] transition disabled:opacity-60"
        >
          {paying ? "Processing Paystack..." : `Pay ${formatNGN(fees.total)}`}
        </button>
        <p className="text-[11px] text-center text-gray-400 mt-2">This is a demo — no real charge will occur.</p>
        {/* Hidden: show shop name so user knows which shop */}
        <p className="text-xs text-center text-gray-500 mt-1">From {shop?.product?.shopId ? "shop" : ""}</p>
      </div>
      <BottomNav />
    </div>
  );
}

// ===========================================================
// ORDER TRACKING
// ===========================================================
export function OrderTracking() {
  const { id } = useParams();
  const { orders } = useApp();
  const order = orders.find((o) => o.id === id);
  const nav = useNavigate();
  const [riderTick, setRiderTick] = useState(0);

  // Animate rider between shop and destination
  useEffect(() => {
    if (!order) return;
    if (order.status !== "rider_assigned" && order.status !== "picked_up") return;
    const iv = setInterval(() => setRiderTick((t) => t + 1), 1500);
    return () => clearInterval(iv);
  }, [order?.status, order?.id]);

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-md p-10 text-center text-gray-500">Order not found.</div>
      </div>
    );
  }

  // Interpolate rider position based on status + tick
  let riderLat = order.shopLat;
  let riderLng = order.shopLng;
  if (order.status === "rider_assigned") {
    const t = Math.min(1, riderTick * 0.12);
    riderLat = order.shopLat + (order.deliveryLat - order.shopLat) * (t * 0.5);
    riderLng = order.shopLng + (order.deliveryLng - order.shopLng) * (t * 0.5);
  } else if (order.status === "picked_up") {
    const t = Math.min(1, riderTick * 0.15);
    riderLat = order.shopLat + (order.deliveryLat - order.shopLat) * (0.5 + t * 0.5);
    riderLng = order.shopLng + (order.deliveryLng - order.shopLng) * (0.5 + t * 0.5);
  }

  const currentIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-5">
        <div className="flex items-center gap-2 mb-2"><BackButton to="/orders" /></div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold">Order {order.id}</h2>
            <p className="text-sm text-gray-500">{order.shopName}</p>
          </div>
          <Link to="/orders" className="text-xs font-bold text-[#FF6B00]">All orders</Link>
        </div>

        {/* Status card */}
        <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#E55A00] text-white p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">Status</div>
          <div className="text-2xl font-extrabold mt-1">{STATUS_LABELS[order.status]}</div>
          {order.status === "delivered" ? (
            <div className="text-sm opacity-90 mt-1">Enjoy your order! 🎉</div>
          ) : order.status === "cancelled" ? (
            <div className="text-sm opacity-90 mt-1">Sorry, this order was cancelled.</div>
          ) : (
            <div className="text-sm opacity-90 mt-1">
              {order.riderName ? `Rider: ${order.riderName} · ` : ""}
              ETA ~{order.status === "picked_up" ? "5" : order.status === "rider_assigned" ? "12" : "18"} min
            </div>
          )}

          {/* Progress steps */}
          <div className="mt-4 flex items-center gap-1.5">
            {STATUS_STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= currentIdx ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-semibold opacity-90">
            <span>Placed</span>
            <span>Accepted</span>
            <span>Preparing</span>
            <span>Rider</span>
            <span>Picked up</span>
            <span>Delivered</span>
          </div>
        </div>

        {/* Map */}
        <div className="mt-4 h-72 md:h-96 rounded-3xl overflow-hidden border border-gray-100">
          <LiveMap
            shopLat={order.shopLat}
            shopLng={order.shopLng}
            destLat={order.deliveryLat}
            destLng={order.deliveryLng}
            riderLat={["rider_assigned", "picked_up"].includes(order.status) ? riderLat : undefined}
            riderLng={["rider_assigned", "picked_up"].includes(order.status) ? riderLng : undefined}
          />
        </div>

        {/* Details */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-sm">Items</h3>
            <div className="mt-2 space-y-1">
              {order.items.map((i) => (
                <div key={i.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{i.quantity}× {i.product.name}</span>
                  <span>{formatNGN(i.product.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 my-2" />
            <Row label="Subtotal" value={formatNGN(order.subtotal)} />
            <Row label="Service fee" value={formatNGN(order.serviceFee)} />
            <Row label="Delivery" value={formatNGN(order.deliveryFee)} />
            <Row label={<span className="font-extrabold">Total</span>} value={<span className="font-extrabold">{formatNGN(order.total)}</span>} />
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-sm">Delivery details</h3>
            <div className="mt-2 text-sm space-y-1">
              <div className="text-gray-500 text-xs">Address</div>
              <div className="font-semibold">{order.deliveryAddress}</div>
              <div className="text-gray-500 text-xs mt-3">Contact</div>
              <div className="font-semibold">{order.customerPhone}</div>
              {order.riderName && (
                <>
                  <div className="text-gray-500 text-xs mt-3">Rider</div>
                  <div className="font-semibold flex items-center gap-2">🛺 {order.riderName}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {order.status === "delivered" && (
          <button onClick={() => nav("/customer")} className="mt-5 w-full rounded-full bg-[#1A1A1A] text-white py-3 font-extrabold">
            Order again
          </button>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

// ===========================================================
// ORDERS LIST
// ===========================================================
export function OrdersPage() {
  const { orders, setCurrentView } = useApp();
  const nav = useNavigate();
  useEffect(() => { setCurrentView("customer"); }, [setCurrentView]);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-5">
        <div className="flex items-center gap-2 mb-1"><BackButton to="/customer" /></div>
        <h2 className="text-2xl font-extrabold">Your orders</h2>
        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white border border-dashed border-gray-200 p-10 text-center">
            <div className="text-5xl">📭</div>
            <p className="mt-3 text-sm text-gray-500">You haven't placed any orders yet.</p>
            <button onClick={() => nav("/shops")} className="mt-4 rounded-full bg-[#FF6B00] text-white px-5 py-2 text-sm font-bold">Start shopping</button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => nav(`/track/${o.id}`)}
                className="card-lift w-full text-left rounded-2xl bg-white border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{o.shopName}</div>
                    <div className="text-xs text-gray-500">{o.id} · {new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">{o.items.length} items</div>
                  <div className="font-extrabold">{formatNGN(o.total)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
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
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${map[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ===========================================================
// PROFILE
// ===========================================================
export function ProfilePage() {
  const { user, logout, setCurrentView } = useApp();
  const nav = useNavigate();
  useEffect(() => { setCurrentView("customer"); }, [setCurrentView]);

  // Guest landing — prompt to sign up
  if (user?.isGuest) {
    return (
      <div className="min-h-screen pb-24 md:pb-10">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#E55A00] p-6 text-white text-center shadow-xl">
            <div className="text-5xl">👀</div>
            <h2 className="mt-3 text-xl font-extrabold">You're browsing as a guest</h2>
            <p className="mt-1 text-sm opacity-90">Sign up to place orders, track riders live and save addresses.</p>
            <button onClick={() => nav("/")} className="mt-4 rounded-full bg-white text-[#FF6B00] px-5 py-2.5 text-sm font-extrabold">Create free account</button>
          </div>
          <button onClick={() => { logout(); nav("/"); }} className="mt-4 w-full rounded-full bg-white border border-gray-200 py-2.5 text-sm font-bold text-gray-600">Exit guest mode</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-5">
        <div className="flex items-center gap-2 mb-2"><BackButton to="/customer" /></div>
        <div className="rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#E55A00] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-white text-[#FF6B00] grid place-items-center font-extrabold text-xl">
              {(user?.name ?? "U").charAt(0)}
            </div>
            <div>
              <div className="font-extrabold text-xl">{user?.name ?? "Guest"}</div>
              <div className="text-white/80 text-xs">{user?.phone ?? ""}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-2 shadow-sm">
          {[
            { label: "Your orders", to: "/orders", icon: "📋" },
            { label: "Saved addresses", to: "/customer", icon: "📍" },
            { label: "Payment methods", to: "/customer", icon: "💳" },
            { label: "Help & support", to: "/customer", icon: "💬" },
          ].map((m) => (
            <button
              key={m.label}
              onClick={() => nav(m.to)}
              className="w-full flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50"
            >
              <span className="text-xl">{m.icon}</span>
              <span className="flex-1 text-left text-sm font-medium">{m.label}</span>
              <span className="text-gray-300">›</span>
            </button>
          ))}
          <button
            onClick={() => { logout(); nav("/"); }}
            className="w-full flex items-center gap-3 rounded-xl p-3 hover:bg-red-50 text-red-600"
          >
            <span className="text-xl">🚪</span>
            <span className="flex-1 text-left text-sm font-medium">Sign out</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          INSTADAL · v1.0 · Made in Awka 🇳🇬
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// Suppress unused warning
void AWKA_CENTER;

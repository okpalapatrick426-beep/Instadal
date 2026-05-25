// ---------- Currency formatting ----------
export const formatNGN = (amount: number) =>
  `₦${Math.round(amount).toLocaleString("en-NG")}`;

// ---------- Distance (Haversine) in km ----------
export const getDistanceKm = (
  lat1: number, lng1: number, lat2: number, lng2: number
): number => {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// ---------- Fee calculation (Instadal revenue model) ----------
export type ShopCategory =
  | "Restaurant"
  | "Fast Food"
  | "Grocery"
  | "Pharmacy"
  | "Ice Cream";

// ---------- Access control ----------
export type RoleView = "customer" | "partner" | "rider" | "admin";
export type PartnerPermission = "dashboard" | "orders" | "menu" | "team";

/** What each primary role can see by default */
export const DEFAULT_ALLOWED_VIEWS: Record<RoleView, RoleView[]> = {
  customer: ["customer"],
  partner: ["customer", "partner"],
  rider: ["customer", "rider"],
  admin: ["customer", "partner", "rider", "admin"],
};

export const ALL_PARTNER_PERMISSIONS: PartnerPermission[] = [
  "dashboard",
  "orders",
  "menu",
  "team",
];

export const PERMISSION_LABELS: Record<PartnerPermission, string> = {
  dashboard: "Dashboard (stats & revenue)",
  orders: "Orders (incoming & active)",
  menu: "Menu (manage items)",
  team: "Team (manage staff)",
};

export type PartnerStaff = {
  id: string;
  name: string;
  phone: string;
  permissions: PartnerPermission[];
  createdAt: number;
};

export const COMMISSION_RATES: Record<ShopCategory, number> = {
  Restaurant: 0.2,
  "Fast Food": 0.22,
  Grocery: 0.15,
  Pharmacy: 0.12,
  "Ice Cream": 0.2,
};

export const getDeliveryFee = (km: number) => {
  if (km <= 2) return 300;
  if (km <= 4) return 500;
  if (km <= 7) return 700;
  return 1000;
};

export const calculateFees = (
  subtotal: number,
  distanceKm: number,
  category: ShopCategory
) => {
  const serviceFee = Math.round(subtotal * 0.07);
  const deliveryFee = getDeliveryFee(distanceKm);
  const total = subtotal + serviceFee + deliveryFee;
  const commissionRate = COMMISSION_RATES[category] ?? 0.2;
  const commission = Math.round(subtotal * commissionRate);
  const riderPayout = Math.round(deliveryFee * 0.6);
  const instadalFromDelivery = Math.round(deliveryFee * 0.4);
  const shopPayout = subtotal - commission;
  const instadalTotal = commission + instadalFromDelivery + serviceFee;
  return {
    subtotal,
    serviceFee,
    deliveryFee,
    total,
    commission,
    commissionRate,
    riderPayout,
    instadalFromDelivery,
    shopPayout,
    instadalTotal,
  };
};

// ---------- Categories ----------
export const CATEGORIES = [
  { id: "food", label: "Food", icon: "🍛" },
  { id: "fast-food", label: "Fast Food", icon: "🍔" },
  { id: "ice-cream", label: "Ice Cream", icon: "🍦" },
  { id: "grocery", label: "Grocery", icon: "🛒" },
  { id: "pharmacy", label: "Pharmacy", icon: "💊" },
  { id: "others", label: "Others", icon: "📦" },
] as const;

// ---------- Mock Awka data ----------
// Awka coordinates: roughly 6.21°N, 7.07°E
export const AWKA_CENTER = { lat: 6.2099, lng: 7.0694 };

export type Shop = {
  id: string;
  name: string;
  category: ShopCategory;
  categoryId: string;
  description: string;
  address: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  logo: string; // emoji or image url
  rating: number;
  prepTime: string; // e.g. "25-35 min"
  isOpen: boolean;
  isApproved: boolean;
  ownerId: string;
  featured?: boolean;
  /** Large shops / malls / supermarkets — enables extra discovery UI */
  isMall?: boolean;
  itemCount?: number;
};

export type Product = {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  /** Multi-category for supermarkets / malls (max 3) */
  categories?: string[];
  isAvailable: boolean;
  popularity?: number; // higher = shown first in discovery
};

export const SHOPS: Shop[] = [
  {
    id: "s1",
    name: "Mama Nkechi Kitchen",
    category: "Restaurant",
    categoryId: "food",
    description: "Authentic Igbo cuisine, jollof, egusi & pounded yam.",
    address: "Zik Avenue, Awka",
    state: "Anambra", city: "Awka",
    lat: 6.212, lng: 7.072,
    logo: "🍲", rating: 4.8, prepTime: "25-35 min",
    isOpen: true, isApproved: true, ownerId: "u_partner1", featured: true,
  },
  {
    id: "s2",
    name: "Crunchy Bites",
    category: "Fast Food",
    categoryId: "fast-food",
    description: "Burgers, shawarma, chicken & fries.",
    address: "Okofia Street, Amawbia",
    state: "Anambra", city: "Awka",
    lat: 6.201, lng: 7.085,
    logo: "🍔", rating: 4.6, prepTime: "15-25 min",
    isOpen: true, isApproved: true, ownerId: "u_partner2", featured: true,
  },
  {
    id: "s3",
    name: "Cold Stone Awka",
    category: "Ice Cream",
    categoryId: "ice-cream",
    description: "Premium hand-packed ice cream & sundaes.",
    address: " Aroma Junction",
    state: "Anambra", city: "Awka",
    lat: 6.218, lng: 7.062,
    logo: "🍦", rating: 4.9, prepTime: "10-15 min",
    isOpen: true, isApproved: true, ownerId: "u_partner3", featured: true,
  },
  {
    id: "s4",
    name: "Ifed Market Grocers",
    category: "Grocery",
    categoryId: "grocery",
    description: "Fresh produce, rice, oil & daily essentials.",
    address: "Eke Awka Market",
    state: "Anambra", city: "Awka",
    isMall: true, itemCount: 1200,
    lat: 6.206, lng: 7.078,
    logo: "🛒", rating: 4.5, prepTime: "30-45 min",
    isOpen: true, isApproved: true, ownerId: "u_partner4",
  },
  {
    id: "s5",
    name: "MedPlus Pharmacy",
    category: "Pharmacy",
    categoryId: "pharmacy",
    description: "Trusted pharmacy — OTC, prescriptions & wellness.",
    address: "Government House Rd",
    state: "Anambra", city: "Awka",
    lat: 6.215, lng: 7.075,
    logo: "💊", rating: 4.7, prepTime: "20-30 min",
    isOpen: true, isApproved: true, ownerId: "u_partner5",
  },
  {
    id: "s6",
    name: "Suya Republic",
    category: "Fast Food",
    categoryId: "fast-food",
    description: "Grilled suya, kilishi & asun, made fresh.",
    address: "Works Road, Awka",
    state: "Anambra", city: "Awka",
    lat: 6.208, lng: 7.069,
    logo: "🍢", rating: 4.7, prepTime: "15-20 min",
    isOpen: true, isApproved: true, ownerId: "u_partner6",
  },
  {
    id: "s7",
    name: "Shoprite Ikeja City Mall",
    category: "Grocery",
    categoryId: "grocery",
    description: "Lagos' biggest mall — groceries, fashion, electronics under one roof.",
    address: "Ikeja City Mall, Alausa",
    state: "Lagos", city: "Ikeja",
    isMall: true, itemCount: 5400,
    lat: 6.605, lng: 3.355,
    logo: "🏬", rating: 4.6, prepTime: "45-60 min",
    isOpen: true, isApproved: true, ownerId: "u_partner7", featured: true,
  },
  {
    id: "s8",
    name: "Spar Owerri Mall",
    category: "Grocery",
    categoryId: "grocery",
    description: "Full-service supermarket serving Owerri with fresh & packaged goods.",
    address: "World Bank Housing Estate, Owerri",
    state: "Imo", city: "Owerri",
    isMall: true, itemCount: 2800,
    lat: 5.485, lng: 7.035,
    logo: "🛍️", rating: 4.5, prepTime: "40-55 min",
    isOpen: true, isApproved: true, ownerId: "u_partner8",
  },
  {
    id: "s9",
    name: "Onitsha Main Market Express",
    category: "Grocery",
    categoryId: "grocery",
    description: "West Africa's largest market — wholesale prices delivered to you.",
    address: "Main Market Road, Onitsha",
    state: "Anambra", city: "Onitsha",
    isMall: true, itemCount: 8200,
    lat: 6.145, lng: 6.785,
    logo: "📦", rating: 4.4, prepTime: "60-90 min",
    isOpen: true, isApproved: true, ownerId: "u_partner9", featured: true,
  },
  {
    id: "s10",
    name: "ShopRite Awka",
    category: "Grocery",
    categoryId: "grocery",
    description: "International supermarket — fresh groceries, household & imported goods.",
    address: "Genesis Deluxe Cinema Plaza, Awka",
    state: "Anambra", city: "Awka",
    isMall: true, itemCount: 3200,
    lat: 6.212, lng: 7.074,
    logo: "🛒", rating: 4.7, prepTime: "45-70 min",
    isOpen: true, isApproved: true, ownerId: "u_partner10", featured: true,
  },
  {
    id: "s11",
    name: "Jendol Supermarket",
    category: "Grocery",
    categoryId: "grocery",
    description: "Your everyday supermarket — food, drinks, toiletries & baby products.",
    address: "Zik Avenue, Awka",
    state: "Anambra", city: "Awka",
    isMall: true, itemCount: 1850,
    lat: 6.210, lng: 7.072,
    logo: "🏪", rating: 4.5, prepTime: "40-60 min",
    isOpen: true, isApproved: true, ownerId: "u_partner11", featured: true,
  },
  {
    id: "s12",
    name: "Awka City Mall",
    category: "Grocery",
    categoryId: "grocery",
    description: "Phones, electronics, fashion, beauty — one mall, endless choices.",
    address: "Aroma Junction, Awka",
    state: "Anambra", city: "Awka",
    isMall: true, itemCount: 2100,
    lat: 6.218, lng: 7.063,
    logo: "🏬", rating: 4.6, prepTime: "50-75 min",
    isOpen: true, isApproved: true, ownerId: "u_partner12", featured: true,
  },
];

export const PRODUCTS: Product[] = [
  // Mama Nkechi
  { id: "p1", shopId: "s1", name: "Jollof Rice & Chicken", description: "Smoky party-style jollof with grilled chicken", price: 2500, image: "🍛", category: "Main", isAvailable: true },
  { id: "p2", shopId: "s1", name: "Pounded Yam & Egusi", description: "Smooth pounded yam with rich egusi soup", price: 3000, image: "🥘", category: "Main", isAvailable: true },
  { id: "p3", shopId: "s1", name: "Ofada Rice Special", description: "Local ofada with ayamase sauce", price: 2800, image: "🌶️", category: "Main", isAvailable: true },
  { id: "p4", shopId: "s1", name: "Chapman", description: "Chilled Chapman cocktail", price: 800, image: "🍹", category: "Drinks", isAvailable: true },

  // Crunchy Bites
  { id: "p5", shopId: "s2", name: "Classic Beef Burger", description: "Juicy beef patty, cheese, lettuce, special sauce", price: 3500, image: "🍔", category: "Burgers", isAvailable: true },
  { id: "p6", shopId: "s2", name: "Chicken Shawarma", description: "Grilled chicken, garlic mayo, fresh veggies", price: 2500, image: "🌯", category: "Wraps", isAvailable: true },
  { id: "p7", shopId: "s2", name: "Crispy Chicken & Fries", description: "3pc crispy chicken with seasoned fries", price: 4200, image: "🍗", category: "Combos", isAvailable: true },
  { id: "p8", shopId: "s2", name: "Coca-Cola 50cl", description: "Ice cold", price: 400, image: "🥤", category: "Drinks", isAvailable: true },

  // Cold Stone
  { id: "p9", shopId: "s3", name: "Vanilla Dream", description: "Classic vanilla with chocolate chips", price: 1800, image: "🍦", category: "Scoops", isAvailable: true },
  { id: "p10", shopId: "s3", name: "Strawberry Sundae", description: "Strawberry ice cream with fresh berries", price: 2200, image: "🍨", category: "Sundaes", isAvailable: true },
  { id: "p11", shopId: "s3", name: "Chocolate Brownie Blast", description: "Chocolate ice cream + brownie chunks", price: 2500, image: "🍫", category: "Specials", isAvailable: true },

  // Ifed Market
  { id: "p12", shopId: "s4", name: "Golden Penny Rice 5kg", description: "Premium long grain parboiled rice", price: 9500, image: "🍚", category: "Grains", isAvailable: true },
  { id: "p13", shopId: "s4", name: "Kings Vegetable Oil 3L", description: "Pure vegetable cooking oil", price: 7500, image: "🫒", category: "Cooking", isAvailable: true },
  { id: "p14", shopId: "s4", name: "Fresh Tomatoes (basket)", description: "Locally sourced ripe tomatoes", price: 2000, image: "🍅", category: "Produce", isAvailable: true },
  { id: "p15", shopId: "s4", name: "Indomie Carton (40pk)", description: "Chicken flavour instant noodles", price: 8800, image: "🍜", category: "Pantry", isAvailable: true },

  // MedPlus
  { id: "p16", shopId: "s5", name: "Paracetamol 500mg", description: "Pack of 10 tablets", price: 500, image: "💊", category: "Pain Relief", isAvailable: true },
  { id: "p17", shopId: "s5", name: "Vitamin C 1000mg", description: "30 effervescent tablets", price: 3500, image: "🧡", category: "Vitamins", isAvailable: true },
  { id: "p18", shopId: "s5", name: "Hand Sanitizer 500ml", description: "70% alcohol antibacterial", price: 1500, image: "🧴", category: "Wellness", isAvailable: true },

  // Suya Republic
  { id: "p19", shopId: "s6", name: "Beef Suya (large)", description: "Spicy grilled beef skewers", price: 2500, image: "🍢", category: "Grill", isAvailable: true },
  { id: "p20", shopId: "s6", name: "Kilishi Pack", description: "Dried spicy beef jerky", price: 3000, image: "🥩", category: "Snacks", isAvailable: true },
  { id: "p21", shopId: "s6", name: "Asun (Goat)", description: "Peppered grilled goat meat", price: 4500, image: "🔥", category: "Grill", isAvailable: true },
  // ShopRite Awka (s10)
  { id: "p100", shopId: "s10", name: "Royal Stallion Rice 10kg", description: "Premium long grain parboiled rice", price: 19500, image: "🍚", category: "Rice & Grains", categories: ["Rice & Grains"], popularity: 95, isAvailable: true },
  { id: "p101", shopId: "s10", name: "Golden Penny Spaghetti", description: "500g pasta pack", price: 1200, image: "🍝", category: "Noodles", categories: ["Noodles"], popularity: 88, isAvailable: true },
  { id: "p102", shopId: "s10", name: "Indomie Noodles Carton", description: "40 packs chicken flavour", price: 9800, image: "🍜", category: "Noodles", categories: ["Noodles"], popularity: 97, isAvailable: true },
  { id: "p103", shopId: "s10", name: "Devon Kings Vegetable Oil 3L", description: "Pure vegetable cooking oil", price: 8500, image: "🫒", category: "Oil & Seasoning", categories: ["Oil & Seasoning"], popularity: 90, isAvailable: true },
  { id: "p104", shopId: "s10", name: "Knorr Chicken Cubes", description: "Pack of 50 seasoning cubes", price: 1500, image: "🧂", category: "Oil & Seasoning", categories: ["Oil & Seasoning"], popularity: 85, isAvailable: true },
  { id: "p105", shopId: "s10", name: "Fresh Tomatoes", description: "1 basket of ripe tomatoes", price: 2500, image: "🍅", category: "Fruits & Vegetables", categories: ["Fruits & Vegetables"], popularity: 80, isAvailable: true },
  { id: "p106", shopId: "s10", name: "Peak Powdered Milk 400g", description: "Full cream milk sachet", price: 3200, image: "🥛", category: "Dairy", categories: ["Dairy"], popularity: 88, isAvailable: true },
  { id: "p107", shopId: "s10", name: "Coca-Cola 1.5L", description: "Chilled carbonated drink", price: 800, image: "🥤", category: "Drinks", categories: ["Drinks"], popularity: 95, isAvailable: true },
  { id: "p108", shopId: "s10", name: "Fanta Orange 50cl (pack of 12)", description: "Orange soft drinks", price: 4500, image: "🧃", category: "Drinks", categories: ["Drinks"], popularity: 82, isAvailable: true },
  { id: "p109", shopId: "s10", name: "Agege Bread (loaf)", description: "Freshly baked local bread", price: 1000, image: "🍞", category: "Bread", categories: ["Bread"], popularity: 90, isAvailable: true },
  { id: "p110", shopId: "s10", name: "Golden Morn Cereal 500g", description: "Maize & soya breakfast cereal", price: 2800, image: "🥣", category: "Cereals", categories: ["Cereals"], popularity: 85, isAvailable: true },
  { id: "p111", shopId: "s10", name: "Dettol Soap 110g (3 pack)", description: "Antibacterial bathing soap", price: 1800, image: "🧼", category: "Toiletries", categories: ["Toiletries"], popularity: 78, isAvailable: true },
  { id: "p112", shopId: "s10", name: "Harpic Toilet Cleaner 500ml", description: "Power plus disinfectant", price: 1500, image: "🧴", category: "Cleaning", categories: ["Cleaning"], popularity: 72, isAvailable: true },
  { id: "p113", shopId: "s10", name: "Pampers Premium Care (M)", description: "Pack of 60 baby diapers", price: 8500, image: "👶", category: "Baby Products", categories: ["Baby Products"], popularity: 88, isAvailable: true },
  { id: "p114", shopId: "s10", name: "Frozen Chicken (whole)", description: "1.5kg imported chicken", price: 5500, image: "🍗", category: "Frozen Foods", categories: ["Frozen Foods", "Proteins"], popularity: 92, isAvailable: true },
  { id: "p115", shopId: "s10", name: "Titus Sardines", description: "125g canned sardines in oil", price: 900, image: "🐟", category: "Canned Goods", categories: ["Canned Goods", "Proteins"], popularity: 75, isAvailable: true },
  { id: "p116", shopId: "s10", name: "Digestive Biscuits", description: "McVities pack of 8", price: 1200, image: "🍪", category: "Snacks", categories: ["Snacks"], popularity: 70, isAvailable: true },
  { id: "p117", shopId: "s10", name: "Fresh Bananas", description: "1 bunch of ripe bananas", price: 800, image: "🍌", category: "Fruits & Vegetables", categories: ["Fruits & Vegetables"], popularity: 78, isAvailable: true },
  // Jendol Supermarket (s11)
  { id: "p200", shopId: "s11", name: "Mama Gold Rice 5kg", description: "Premium Nigerian rice", price: 9800, image: "🍚", category: "Rice & Grains", categories: ["Rice & Grains"], popularity: 90, isAvailable: true },
  { id: "p201", shopId: "s11", name: "Semovita 2kg", description: "Golden semolina swallow", price: 2500, image: "🌾", category: "Swallow & Soup", categories: ["Swallow & Soup"], popularity: 85, isAvailable: true },
  { id: "p202", shopId: "s11", name: "Garri (Ijebu) 2kg", description: "White cassava flakes", price: 1800, image: "🥣", category: "Swallow & Soup", categories: ["Swallow & Soup"], popularity: 80, isAvailable: true },
  { id: "p203", shopId: "s11", name: "Smoked Fish", description: "Catfish dried & smoked", price: 3500, image: "🐠", category: "Proteins", categories: ["Proteins"], popularity: 82, isAvailable: true },
  { id: "p204", shopId: "s11", name: "Beef (1kg)", description: "Fresh beef cut", price: 4500, image: "🥩", category: "Proteins", categories: ["Proteins"], popularity: 88, isAvailable: true },
  { id: "p205", shopId: "s11", name: "Onga Seasoning (pack 50)", description: "Classic stew seasoning", price: 1250, image: "🌶️", category: "Oil & Seasoning", categories: ["Oil & Seasoning"], popularity: 78, isAvailable: true },
  { id: "p206", shopId: "s11", name: "Malt Drink 65cl (6 pack)", description: "Malta Guinness", price: 3600, image: "🍺", category: "Drinks", categories: ["Drinks"], popularity: 90, isAvailable: true },
  { id: "p207", shopId: "s11", name: "Peak Liquid Milk 1L (12pk)", description: "Evaporated milk carton", price: 6800, image: "🥛", category: "Dairy", categories: ["Dairy"], popularity: 82, isAvailable: true },
  { id: "p208", shopId: "s11", name: "Omo Detergent 1kg", description: "Multi-colour washing powder", price: 2200, image: "🧺", category: "Cleaning", categories: ["Cleaning"], popularity: 75, isAvailable: true },
  { id: "p209", shopId: "s11", name: "Colgate Toothpaste 140ml", description: "Maximum cavity protection", price: 950, image: "🪥", category: "Toiletries", categories: ["Toiletries"], popularity: 78, isAvailable: true },
  { id: "p210", shopId: "s11", name: "Cerelac Baby Food 500g", description: "Maize & milk for infants", price: 3500, image: "🍼", category: "Baby Products", categories: ["Baby Products"], popularity: 85, isAvailable: true },
  { id: "p211", shopId: "s11", name: "Digestive Crackers", description: "Yale biscuit pack", price: 600, image: "🍘", category: "Snacks", categories: ["Snacks"], popularity: 70, isAvailable: true },
  { id: "p212", shopId: "s11", name: "Fresh Watermelon", description: "Medium sized ripe watermelon", price: 1500, image: "🍉", category: "Fruits & Vegetables", categories: ["Fruits & Vegetables"], popularity: 80, isAvailable: true },
  { id: "p213", shopId: "s11", name: "Frozen Turkey (wing)", description: "1kg turkey wing", price: 3800, image: "🦃", category: "Frozen Foods", categories: ["Frozen Foods", "Proteins"], popularity: 82, isAvailable: true },
  // Awka City Mall (s12)
  { id: "p300", shopId: "s12", name: "iPhone 14 Pro Max", description: "256GB Space Black — brand new", price: 950000, image: "📱", category: "Phones & Accessories", categories: ["Phones & Accessories", "Electronics"], popularity: 99, isAvailable: true },
  { id: "p301", shopId: "s12", name: "Samsung Galaxy A24", description: "128GB, 6GB RAM", price: 220000, image: "📱", category: "Phones & Accessories", categories: ["Phones & Accessories"], popularity: 88, isAvailable: true },
  { id: "p302", shopId: "s12", name: "Oraimo FreePods 4", description: "Wireless Bluetooth earbuds", price: 18500, image: "🎧", category: "Phones & Accessories", categories: ["Phones & Accessories", "Electronics"], popularity: 92, isAvailable: true },
  { id: "p303", shopId: "s12", name: "Power Bank 20000mAh", description: "Fast charge, 2 USB ports", price: 12500, image: "🔋", category: "Phones & Accessories", categories: ["Phones & Accessories"], popularity: 85, isAvailable: true },
  { id: "p304", shopId: "s12", name: "LG 43\" Smart TV", description: "Full HD Android TV", price: 285000, image: "📺", category: "Electronics", categories: ["Electronics", "Home & Kitchen"], popularity: 80, isAvailable: true },
  { id: "p305", shopId: "s12", name: "Hisense Standing Fan", description: "18 inch, 3-speed", price: 28000, image: "🌀", category: "Electronics", categories: ["Electronics", "Home & Kitchen"], popularity: 75, isAvailable: true },
  { id: "p306", shopId: "s12", name: "Men's Ankara Shirt", description: "Tailored Nigerian print, sizes M-XXL", price: 8500, image: "👔", category: "Clothing", categories: ["Clothing"], popularity: 78, isAvailable: true },
  { id: "p307", shopId: "s12", name: "Ladies Heels", description: "Stylish block heels, sizes 37-42", price: 12500, image: "👠", category: "Clothing", categories: ["Clothing"], popularity: 75, isAvailable: true },
  { id: "p308", shopId: "s12", name: "Designer Handbag", description: "Leather ladies bag", price: 25000, image: "👜", category: "Clothing", categories: ["Clothing"], popularity: 80, isAvailable: true },
  { id: "p309", shopId: "s12", name: "Nivea Body Lotion 400ml", description: "Cocoa butter moisturising", price: 3200, image: "🧴", category: "Beauty", categories: ["Beauty"], popularity: 85, isAvailable: true },
  { id: "p310", shopId: "s12", name: "MAC Lipstick", description: "Ruby Woo matte finish", price: 15500, image: "💄", category: "Beauty", categories: ["Beauty"], popularity: 82, isAvailable: true },
  { id: "p311", shopId: "s12", name: "Perfume (Oud Wood)", description: "100ml long-lasting fragrance", price: 32000, image: "🌸", category: "Beauty", categories: ["Beauty"], popularity: 78, isAvailable: true },
  { id: "p312", shopId: "s12", name: "Non-stick Cooking Pot Set", description: "3-piece set, 20-28cm", price: 35000, image: "🍲", category: "Home & Kitchen", categories: ["Home & Kitchen"], popularity: 70, isAvailable: true },
  { id: "p313", shopId: "s12", name: "School Notebook (A4)", description: "200 leaves, hard cover", price: 1200, image: "📓", category: "Stationery", categories: ["Stationery"], popularity: 65, isAvailable: true },
  { id: "p314", shopId: "s12", name: "Ballpoint Pens (pack of 12)", description: "Black ink, smooth writing", price: 1500, image: "🖊️", category: "Stationery", categories: ["Stationery"], popularity: 60, isAvailable: true },
];

export type CartItem = { product: Product; quantity: number };
export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "rider_assigned"
  | "picked_up"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  riderId?: string;
  riderName?: string;
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  shopLat: number;
  shopLng: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  createdAt: number;
  deliveredAt?: number;
  riderLat?: number;
  riderLng?: number;
};

export type Rider = {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  isAvailable: boolean;
  lat: number;
  lng: number;
  totalEarnings: number;
  deliveriesToday: number;
};

export const MOCK_RIDERS: Rider[] = [
  { id: "r1", name: "Chidi Okafor", phone: "08031234567", vehicleType: "Keke", isAvailable: true, lat: 6.211, lng: 7.071, totalEarnings: 18400, deliveriesToday: 4 },
  { id: "r2", name: "Emeka Nwosu", phone: "08051239876", vehicleType: "Keke", isAvailable: true, lat: 6.207, lng: 7.073, totalEarnings: 12300, deliveriesToday: 3 },
  { id: "r3", name: "Ifeanyi Eze", phone: "08071112233", vehicleType: "Keke", isAvailable: false, lat: 6.214, lng: 7.066, totalEarnings: 9800, deliveriesToday: 2 },
];

// ---------- Helpers ----------
export const uid = () => Math.random().toString(36).slice(2, 10);

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order placed",
  accepted: "Shop accepted",
  preparing: "Preparing your order",
  rider_assigned: "Rider on the way",
  picked_up: "Rider picked up",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_STEPS: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "rider_assigned",
  "picked_up",
  "delivered",
];

// ===========================================================
// Ratings
// ===========================================================
export type Rating = {
  id: string;
  userId: string;
  userName: string;
  targetType: "shop" | "product";
  targetId: string;
  score: number; // 1-5
  comment?: string;
  createdAt: number;
};

export const avgRating = (ratings: Rating[], targetId: string): { avg: number; count: number } => {
  const list = ratings.filter((r) => r.targetId === targetId);
  if (list.length === 0) return { avg: 0, count: 0 };
  return {
    avg: list.reduce((s, r) => s + r.score, 0) / list.length,
    count: list.length,
  };
};

// ===========================================================
// Saved addresses
// ===========================================================
export type SavedAddress = {
  id: string;
  label: string; // "Home", "Work", custom
  address: string;
  mapsLink?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
};

// ===========================================================
// Payment methods
// ===========================================================
export type PaymentMethod = "card" | "bank_transfer" | "ussd" | "wallet";

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  sub: string;
  icon: string;
}[] = [
  { id: "card", label: "Debit / Credit Card", sub: "Paystack-secured card payment", icon: "💳" },
  { id: "bank_transfer", label: "Bank Transfer", sub: "Direct transfer from your bank app", icon: "🏦" },
  { id: "ussd", label: "USSD", sub: "Pay with your bank's USSD code", icon: "📱" },
  { id: "wallet", label: "Cash on Delivery", sub: "Pay cash when your order arrives", icon: "💵" },
];

// ===========================================================
// Partner applications (admin approval queue)
// ===========================================================
export type ApplicationStatus = "pending" | "approved" | "rejected";

export type PartnerApplication = {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  address: string;
  category: ShopCategory;
  description: string;
  videoLink: string;
  previewProducts: { name: string; price: number }[];
  status: ApplicationStatus;
  createdAt: number;
  reviewedAt?: number;
  rejectionReason?: string;
};

// ===========================================================
// Nigerian states + cities (36 + FCT)
// ===========================================================
export const NIGERIAN_LOCATIONS: Record<string, string[]> = {
  Abia: ["Aba", "Umuahia", "Ohafia", "Arochukwu", "Isiala Ngwa"],
  Adamawa: ["Yola", "Jimeta", "Numan", "Mubi"],
  "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene", "Oron"],
  Anambra: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Agulu", "Ihiala", "Otuocha", "Uga"],
  Bauchi: ["Bauchi", "Azare", "Misau", "Jama'are"],
  Bayelsa: ["Yenagoa", "Brass", "Ogbia", "Sagbama"],
  Benue: ["Makurdi", "Gboko", "Otukpo", "Vandeikya"],
  Borno: ["Maiduguri", "Biu", "Konduga", "Gwoza"],
  "Cross River": ["Calabar", "Ugep", "Ikom", "Ogoja"],
  Delta: ["Asaba", "Warri", "Sapele", "Agbor", "Ughelli"],
  Ebonyi: ["Abakaliki", "Afikpo", "Onueke", "Ishiagu"],
  Edo: ["Benin City", "Ekpoma", "Auchi", "Uromi"],
  Ekiti: ["Ado-Ekiti", "Ikere", "Ise", "Ikole"],
  Enugu: ["Enugu", "Nsukka", "Awgu", "Agbani", "Oji River"],
  "FCT": ["Abuja", "Gwagwalada", "Kuje", "Bwari", "Kubwa", "Lugbe"],
  Gombe: ["Gombe", "Kumo", "Billiri", "Kaltungo"],
  Imo: ["Owerri", "Okigwe", "Orlu", "Mbaise", "Oguta"],
  Jigawa: ["Dutse", "Hadejia", "Gumel", "Kazaure"],
  Kaduna: ["Kaduna", "Zaria", "Kafanchan", "Sabon Tasha"],
  Kano: ["Kano", "Wudil", "Gaya", "Nassarawa"],
  Katsina: ["Katsina", "Funtua", "Daura", "Malumfashi"],
  Kebbi: ["Birnin Kebbi", "Argungu", "Yelwa", "Zuru"],
  Kogi: ["Lokoja", "Okene", "Kabba", "Idah"],
  Kwara: ["Ilorin", "Offa", "Jebba", "Patigi"],
  Lagos: ["Ikeja", "Lekki", "Victoria Island", "Ikoyi", "Surulere", "Yaba", "Ajah", "Ikorodu", "Badagry", "Epe", "Gbagada", "Oshodi"],
  Nasarawa: ["Lafia", "Keffi", "Akwanga", "Karu"],
  Niger: ["Minna", "Bida", "Suleja", "Kontagora"],
  Ogun: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ota", "Ilaro"],
  Ondo: ["Akure", "Ondo", "Owo", "Ikare"],
  Osun: ["Osogbo", "Ile-Ife", "Ilesa", "Ila"],
  Oyo: ["Ibadan", "Oyo", "Ogbomoso", "Iseyin", "Iree"],
  Plateau: ["Jos", "Bukuru", "Pankshin", "Shendam"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Bonny", "Eleme", "Buguma"],
  Sokoto: ["Sokoto", "Gwadabawa", "Tambuwal", "Goronyo"],
  Taraba: ["Jalingo", "Wukari", "Bali", "Gembu"],
  Yobe: ["Damaturu", "Potiskum", "Nguru", "Gashua"],
  Zamfara: ["Gusau", "Kaura Namoda", "Talata Mafara", "Anka"],
};

export const NIGERIAN_STATES = Object.keys(NIGERIAN_LOCATIONS).sort();

// ===========================================================
// Product sub-categories (34+ across all shop types)
// ===========================================================
export const PRODUCT_CATEGORIES = [
  // Staples
  "Rice & Grains",
  "Swallow & Soup",
  "Proteins",
  "Noodles",
  "Bread",
  "Cereals",
  "Frozen Foods",
  "Canned Goods",
  // Fresh
  "Fruits & Vegetables",
  "Dairy",
  // Pantry
  "Oil & Seasoning",
  "Drinks",
  "Snacks",
  // Prepared food
  "Chicken & Wings",
  "Burgers",
  "Pizza",
  "Combo Meals",
  "Ice Cream",
  // Household
  "Toiletries",
  "Cleaning",
  "Baby Products",
  "Household",
  "Stationery",
  "Home & Kitchen",
  // Personal
  "Beauty",
  "Clothing",
  "Health",
  "Supplements",
  "Pain Relief",
  "First Aid",
  // Electronics
  "Electronics",
  "Phones & Accessories",
];



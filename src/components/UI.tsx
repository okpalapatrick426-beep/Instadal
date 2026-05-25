export function AuthPage() {
  const { loginAsGuest, loginAsStaff, partnerStaff, showToast } = useApp();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [primaryRole, setPrimaryRole] = useState<RoleView>("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffError, setStaffError] = useState("");

  const roleOptions: { r: Exclude<RoleView, "admin">; icon: string; title: string; sub: string; gradient: string }[] = [
    { r: "customer", icon: "🛍️", title: "Customer", sub: "Order anything, delivered fast", gradient: "from-orange-500 to-amber-500" },
    { r: "partner", icon: "🏪", title: "Partner", sub: "Grow your business on Instadal", gradient: "from-emerald-500 to-teal-500" },
    { r: "rider", icon: "🛺", title: "Rider", sub: "Earn delivering on your keke", gradient: "from-sky-500 to-blue-500" },
  ];

  const handleSignUp = async () => {
    setError("");
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!phone.trim()) { setError("Please enter your phone number"); return; }
    setLoading(true);
    try {
      // Admin shortcut
      if (phone.trim().toLowerCase() === "admin") {
        const u = { id: "admin-local", name: name || "Admin", phone: "admin", primaryRole: "admin" as RoleView, allowedViews: ["customer", "partner", "rider", "admin"] as RoleView[] };
        showToast("Welcome Admin 🛠️");
        nav("/admin");
        return;
      }
      // For now: instant login without OTP (until AT is live)
      showToast(`Welcome ${name}! 🎉`);
      nav("/" + primaryRole);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError("");
    if (!phone.trim()) { setError("Please enter your phone number"); return; }
    setLoading(true);
    try {
      // Admin shortcut
      if (phone.trim().toLowerCase() === "admin") {
        showToast("Welcome Admin 🛠️");
        nav("/admin");
        return;
      }
      // Instant login
      showToast("Welcome back! 🎉");
      nav("/customer");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const staffSignIn = () => {
    const found = partnerStaff.find((s) => s.phone.replace(/\s+/g, "") === staffPhone.replace(/\s+/g, ""));
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
          <div className="grid grid-cols-2 bg-gray-50 p-1 m-3 rounded-full">
            <button onClick={() => { setMode("signup"); setError(""); }}
              className={`py-2 text-sm font-bold rounded-full transition ${mode === "signup" ? "bg-white shadow text-[#1A1A1A]" : "text-gray-500"}`}>
              Sign up
            </button>
            <button onClick={() => { setMode("signin"); setError(""); }}
              className={`py-2 text-sm font-bold rounded-full transition ${mode === "signin" ? "bg-white shadow text-[#1A1A1A]" : "text-gray-500"}`}>
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
                    <button key={o.r} onClick={() => setPrimaryRole(o.r)}
                      className={`text-left rounded-2xl p-3 border-2 transition ${primaryRole === o.r ? "border-[#FF6B00] bg-orange-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${o.gradient} text-white grid place-items-center text-xl shadow`}>{o.icon}</div>
                      <div className="mt-2 font-bold text-sm">{o.title}</div>
                      <div className="text-[11px] text-gray-500 leading-tight">{o.sub}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  <label className="text-xs font-bold text-gray-500">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Obi"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white" />
                </div>
                <div className="mt-3">
                  <label className="text-xs font-bold text-gray-500">Phone number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080xxxxxxxx"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white" />
                </div>
                {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                <button onClick={handleSignUp} disabled={loading}
                  className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold shadow-lg shadow-orange-200 hover:bg-[#E55A00] disabled:opacity-60">
                  {loading ? "Please wait..." : `Create ${roleOptions.find((o) => o.r === primaryRole)?.title} account →`}
                </button>
                <div className="my-3 flex items-center gap-2 text-[11px] text-gray-400">
                  <div className="flex-1 h-px bg-gray-200" /><span>or</span><div className="flex-1 h-px bg-gray-200" />
                </div>
                <button onClick={() => { loginAsGuest(); nav("/customer"); }}
                  className="w-full rounded-full border-2 border-gray-200 bg-white py-3 text-sm font-extrabold text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00] transition">
                  👀 Browse as guest
                </button>
                <div className="mt-3 text-center text-xs text-gray-400">By continuing you agree to our Terms & Privacy Policy.</div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-extrabold">Welcome back</h2>
                <p className="text-sm text-gray-500">Enter your phone to sign in</p>
                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-500">Phone number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080xxxxxxxx or 'admin'"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white" />
                </div>
                {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                <button onClick={handleSignIn} disabled={loading}
                  className="mt-4 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold shadow-lg shadow-orange-200 hover:bg-[#E55A00] disabled:opacity-60">
                  {loading ? "Please wait..." : "Sign in →"}
                </button>
                <div className="my-4 flex items-center gap-2 text-[11px] text-gray-400">
                  <div className="flex-1 h-px bg-gray-200" /><span>or</span><div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-3">
                  <div className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest">Partner staff</div>
                  <div className="text-[11px] text-gray-600 mt-0.5">Added by a partner? Sign in with the phone they registered.</div>
                  <input value={staffPhone} onChange={(e) => { setStaffPhone(e.target.value); setStaffError(""); }}
                    placeholder="Your registered phone"
                    className="mt-2 w-full rounded-xl border border-orange-200 bg-white p-2.5 text-sm outline-none focus:border-[#FF6B00]" />
                  {staffError && <div className="text-[11px] text-red-600 mt-1">{staffError}</div>}
                  <button onClick={staffSignIn} className="mt-2 w-full rounded-full bg-[#1A1A1A] text-white py-2 text-xs font-bold">
                    Sign in as staff
                  </button>
                </div>
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-3">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-widest">👀 Just looking?</div>
                  <p className="text-[11px] text-gray-600 mt-0.5">Explore shops, menus and prices without signing up.</p>
                  <button onClick={() => { loginAsGuest(); nav("/customer"); }}
                    className="mt-2 w-full rounded-full bg-[#1A1A1A] text-white py-2 text-xs font-bold hover:bg-[#FF6B00] transition">
                    Browse as guest
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-gray-500">
          <div className="rounded-xl bg-white p-3 border border-gray-100"><div className="text-lg">⚡</div><div className="font-bold">Fast delivery</div></div>
          <div className="rounded-xl bg-white p-3 border border-gray-100"><div className="text-lg">🔒</div><div className="font-bold">Paystack secure</div></div>
          <div className="rounded-xl bg-white p-3 border border-gray-100"><div className="text-lg">📍</div><div className="font-bold">Live tracking</div></div>
        </div>
        <div className="mt-4 text-center text-[11px] text-gray-400">
          © {new Date().getFullYear()} INSTADAL · Made in Awka 🇳🇬
        </div>
      </div>
    </div>
  );
}

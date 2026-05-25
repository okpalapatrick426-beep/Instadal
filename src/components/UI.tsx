// ============================================================
// AUTH PAGE — drop-in replacement for the AuthPage function
// in src/components/UI.tsx
//
// Changes from original:
//   • Sign up:  Name → Location (state/city picker) → Phone → Done
//               No OTP, no password
//   • Sign in:  Phone + Password → Done
//               No OTP
//   • Admin:    Type "admin" in the phone field on sign-in →
//               PIN prompt appears → correct PIN logs in as admin
//   • Staff:    Unchanged
//   • Guest:    Unchanged
//   • All OTP state + verifyOtp removed from this component
// ============================================================

// ---------- CONTEXT — update AppContext to expose these: ----------
//
//  signUp(name, phone, role, state, city): Promise<void>
//    → create account, NO otp, just store and log in
//
//  signIn(phone, password): Promise<RoleView>
//    → validate phone+password, return role string, throw on fail
//
//  loginAsAdmin(pin: string): Promise<void>
//    → validate admin PIN, throw on fail
//
//  (remove verifyOtp — no longer used here)
// -----------------------------------------------------------------

export function AuthPage() {
  const {
    signUp,
    signIn,
    loginAsGuest,
    loginAsStaff,
    loginAsAdmin,   // NEW — add to AppContext
    partnerStaff,
    showToast,
  } = useApp();

  const nav = useNavigate();

  // ── tab ──
  const [mode, setMode] = useState<"signup" | "signin">("signup");

  // ── signup state ──
  const [primaryRole, setPrimaryRole] = useState<RoleView>("customer");
  const [name, setName] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [signupPhone, setSignupPhone] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // ── signin state ──
  const [siPhone, setSiPhone] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);
  const [siLoading, setSiLoading] = useState(false);
  const [siError, setSiError] = useState("");

  // ── admin PIN overlay (triggered when phone === "admin") ──
  const [adminPinMode, setAdminPinMode] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminShowPin, setAdminShowPin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  // ── staff state ──
  const [staffPhone, setStaffPhone] = useState("");
  const [staffError, setStaffError] = useState("");

  // ── role options ──
  const roleOptions: {
    r: Exclude<RoleView, "admin">;
    icon: string;
    title: string;
    sub: string;
    gradient: string;
  }[] = [
    { r: "customer", icon: "🛍️", title: "Customer",  sub: "Order anything, delivered fast",    gradient: "from-orange-500 to-amber-500"  },
    { r: "partner",  icon: "🏪", title: "Partner",   sub: "Grow your business on Instadal",    gradient: "from-emerald-500 to-teal-500"  },
    { r: "rider",    icon: "🛺", title: "Rider",     sub: "Earn delivering on your keke",       gradient: "from-sky-500 to-blue-500"      },
  ];

  // ── helpers ──
  const resetSignup = () => {
    setName(""); setLocationState(""); setLocationCity("");
    setSignupPhone(""); setSignupError("");
  };
  const resetSignin = () => {
    setSiPhone(""); setSiPassword(""); setSiError("");
    setAdminPinMode(false); setAdminPin(""); setAdminError("");
  };

  // ── sign-in: detect "admin" typed as phone ──
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

  // ── sign up submit ──
  const handleSignUp = async () => {
    setSignupError("");
    if (!name.trim())         { setSignupError("Please enter your name");     return; }
    if (!locationState)       { setSignupError("Please choose your location"); return; }
    if (!locationCity)        { setSignupError("Please choose your city");     return; }
    if (!signupPhone.trim())  { setSignupError("Please enter your phone number"); return; }
    setSignupLoading(true);
    try {
      await signUp(name.trim(), signupPhone.trim(), primaryRole, locationState, locationCity);
      showToast(`Welcome to Instadal, ${name.split(" ")[0]}! 🎉`);
      nav("/" + primaryRole);
    } catch (e: unknown) {
      setSignupError(e instanceof Error ? e.message : "Sign up failed. Try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  // ── sign in submit ──
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

  // ── admin PIN submit ──
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

  // ── staff sign in ──
  const staffSignIn = () => {
    const found = partnerStaff.find(
      (s) => s.phone.replace(/\s+/g, "") === staffPhone.replace(/\s+/g, "")
    );
    if (!found) {
      setStaffError("Phone not found. Ask your partner to add you first.");
      return;
    }
    setStaffError("");
    loginAsStaff(found);
    nav("/partner/orders");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ── Hero ── */}
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

          {/* ── Tab switcher ── */}
          <div className="grid grid-cols-2 bg-gray-50 p-1 m-3 rounded-full">
            <button
              onClick={() => { setMode("signup"); resetSignin(); }}
              className={`py-2 text-sm font-bold rounded-full transition ${
                mode === "signup" ? "bg-white shadow text-[#1A1A1A]" : "text-gray-500"
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => { setMode("signin"); resetSignup(); }}
              className={`py-2 text-sm font-bold rounded-full transition ${
                mode === "signin" ? "bg-white shadow text-[#1A1A1A]" : "text-gray-500"
              }`}
            >
              Sign in
            </button>
          </div>

          <div className="p-5">

            {/* ════════════════════════════════
                SIGN UP
            ════════════════════════════════ */}
            {mode === "signup" ? (
              <>
                <h2 className="text-lg font-extrabold">Join as...</h2>
                <p className="text-sm text-gray-500">Pick how you'll use Instadal</p>

                {/* Role picker */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {roleOptions.map((o) => (
                    <button
                      key={o.r}
                      onClick={() => setPrimaryRole(o.r)}
                      className={`text-left rounded-2xl p-3 border-2 transition ${
                        primaryRole === o.r
                          ? "border-[#FF6B00] bg-orange-50"
                          : "border-gray-100 bg-white hover:border-gray-200"
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

                {/* Name */}
                <div className="mt-5">
                  <label className="text-xs font-bold text-gray-500">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Obi"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#FF6B00] focus:bg-white"
                  />
                </div>

                {/* Location */}
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
                    <span>
                      {locationState && locationCity
                        ? `📍 ${locationCity}, ${locationState}`
                        : "Choose your state & city"}
                    </span>
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Phone */}
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

                {signupError && <p className="mt-2 text-xs text-red-600">{signupError}</p>}

                <button
                  onClick={handleSignUp}
                  disabled={signupLoading}
                  className="mt-5 w-full rounded-full bg-[#FF6B00] text-white py-3 font-extrabold shadow-lg shadow-orange-200 hover:bg-[#E55A00] disabled:opacity-60 transition"
                >
                  {signupLoading
                    ? "Creating account..."
                    : `Create ${roleOptions.find((o) => o.r === primaryRole)?.title} account →`}
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
            /* ════════════════════════════════
               SIGN IN
            ════════════════════════════════ */
              <>
                {adminPinMode ? (
                  /* ── Admin PIN overlay ── */
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
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pr-10 text-sm outline-none focus:border-[#FF6B00] focus:bg-white tracking-widest font-bold"
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
                  /* ── Normal sign-in ── */
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

                    {/* Staff sign-in */}
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-3">
                      <div className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest">Partner staff</div>
                      <div className="text-[11px] text-gray-600 mt-0.5">
                        Added by a partner? Sign in with the phone they registered.
                      </div>
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

                    {/* Guest */}
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

        {/* ── Trust badges ── */}
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

      {/* Location selector modal (reuses existing component) */}
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

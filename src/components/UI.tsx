const signUp = async (
  name: string,
  phone: string,
  password: string,
  primaryRole: RoleView,
  locationState: string,
  locationCity: string
) => {
  const normalizedPhone = phone.replace(/\s+/g, "").replace(/^0/, "234");
  const fakeEmail = `${normalizedPhone}@instadal.app`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: fakeEmail,
    password,
    options: {
      data: {
        name,
        phone: normalizedPhone,
        primary_role: primaryRole,
        location_state: locationState,
        location_city: locationCity,
      },
    },
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Sign up failed. Please try again.");

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

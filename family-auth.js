(() => {
  const config = window.NAVIGUE_SUPABASE_CONFIG || {};
  const sdk = window.supabase;
  const configured = Boolean(config.url && config.anonKey && sdk?.createClient);
  const state = {
    client: configured ? sdk.createClient(config.url, config.anonKey) : null,
    user: null,
    children: [],
    selectedChildId: "",
    activeChild: null,
    favorites: [],
    displayName: "",
    creatingAccount: false,
    loading: false
  };
  const dialog = document.getElementById("accountDialog");
  const status = document.getElementById("accountStatus");
  const setupNotice = document.getElementById("accountSetupNotice");
  const providerStatus = document.getElementById("providerStatus");
  const authPanel = document.getElementById("adultAuthPanel");
  const familyPanel = document.getElementById("familyPanel");
  const childList = document.getElementById("parentChildList");
  const parentFavoriteList = document.getElementById("parentFavoriteList");
  const favoriteForm = document.getElementById("favoriteForm");
  const favoriteList = document.getElementById("childFavoriteList");
  const childDestinations = document.getElementById("childDestinations");

  window.NavigueFamilyAuth = {
    get activeChild() { return state.activeChild; },
    get configured() { return configured; },
    get displayName() { return state.displayName; },
    get signedIn() { return Boolean(state.user); },
    get childFavorites() {
      return state.activeChild
        ? state.favorites.filter((place) => place.child_id === state.activeChild.id)
        : [];
    },
    kidMode: false,
    openAccount: openDialog,
    setAccountStatus: setStatus
  };

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  function displayNameFor(user) {
    const metadata = user?.user_metadata || {};
    const profileName = metadata.display_name || metadata.full_name || metadata.name;
    if (typeof profileName === "string" && profileName.trim()) {
      return profileName.trim().split(/\s+/)[0];
    }
    const emailName = user?.email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
    return emailName ? emailName.split(/\s+/)[0] : "vous";
  }

  function familyErrorMessage(error) {
    if (error?.code === "PGRST205" || error?.code === "42P01"
      || /child_profiles|favorite_places|schema cache/i.test(error?.message || "")) {
      return "Les tables des profils enfant ne sont pas prêtes dans Supabase. Exécutez le fichier supabase-schema.sql dans le SQL Editor du projet.";
    }
    return error?.message || "Erreur inattendue.";
  }

  function renderParentFavorites() {
    parentFavoriteList.replaceChildren();
    const places = state.favorites.filter((place) => place.child_id === state.selectedChildId);
    parentFavoriteList.hidden = !state.selectedChildId;
    places.forEach((place) => {
      const row = document.createElement("div");
      row.className = "family-row";
      const detail = document.createElement("div");
      const label = document.createElement("strong");
      label.textContent = `${relationIcon(place.relationship)} ${place.label}`;
      const address = document.createElement("small");
      address.textContent = place.address;
      detail.append(label, address);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "danger";
      remove.textContent = "Retirer";
      remove.setAttribute("aria-label", `Retirer l’adresse favorite ${place.label}`);
      remove.addEventListener("click", () => deleteFavorite(place));
      row.append(detail, remove);
      parentFavoriteList.append(row);
    });
    document.getElementById("favoriteRelation").addEventListener("change", (event) => {
      const relation = event.currentTarget.value;
      document.getElementById("favoriteLabel").value = `Chez ${relation === "autre" ? "un proche" : relation === "ami" ? "un ami" : relation[0].toUpperCase() + relation.slice(1)}`;
    });
    if (state.selectedChildId && !places.length) {
      const empty = document.createElement("p");
      empty.className = "account-note";
      empty.textContent = "Aucune adresse enregistrée pour ce profil.";
      parentFavoriteList.append(empty);
    }
  }

  function openDialog() {
    if (!dialog.open) dialog.showModal();
  }

  function requireConfigured() {
    if (!configured) {
      setStatus("Connexion indisponible : le propriétaire du site doit renseigner l’URL Supabase et la clé anon publique dans supabase-config.js.", true);
      return false;
    }
    return true;
  }

  function requireAdultConsent() {
    if (!document.getElementById("adultConsent").checked) {
      setStatus("Confirmez que vous êtes un parent ou tuteur adulte pour continuer.", true);
      return false;
    }
    return true;
  }

  function relationIcon(relation) {
    return ({ papa: "👨", maman: "👩", ami: "🧑‍🤝‍🧑", autre: "🏡" })[relation] || "🏡";
  }

  function renderKidFavorites() {
    favoriteList.replaceChildren();
    if (!state.activeChild) return;
    const places = state.favorites.filter((place) => place.child_id === state.activeChild.id);
    if (!places.length) {
      const empty = document.createElement("div");
      empty.className = "family-place-empty";
      empty.textContent = "Ton parent n’a pas encore ajouté d’adresse. Demande-lui de la préparer dans son compte adulte.";
      favoriteList.append(empty);
      return;
    }
    places.forEach((place) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "family-place";
      button.setAttribute("aria-label", `Préparer le trajet vers ${place.label}`);
      const icon = document.createElement("span");
      icon.className = "family-place-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = relationIcon(place.relationship);
      const label = document.createElement("strong");
      label.textContent = place.label;
      const note = document.createElement("small");
      note.textContent = "Touche pour préparer le trajet";
      button.append(icon, label, note);
      button.addEventListener("click", () => {
        const destination = document.getElementById("destination");
        destination.value = place.address;
        document.getElementById("routeStatus").textContent = "Destination choisie. Demande à ton adulte de vérifier le trajet, puis touche « Montre-moi le chemin ».";
        document.getElementById("journeyForm").scrollIntoView({ behavior: "smooth", block: "center" });
        document.querySelector("#journeyForm button[type='submit']").focus({ preventScroll: true });
      });
      favoriteList.append(button);
    });
  }

  function renderParentChildren() {
    childList.replaceChildren();
    if (!state.children.length) {
      const empty = document.createElement("p");
      empty.className = "account-note";
      empty.textContent = "Aucun profil enfant pour le moment. Ajoutez un profil, puis ses lieux de confiance.";
      childList.append(empty);
      favoriteForm.hidden = true;
      return;
    }
    state.children.forEach((child) => {
      const row = document.createElement("div");
      row.className = "family-row";
      const identity = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = child.child_name;
      const detail = document.createElement("small");
      const placeCount = state.favorites.filter((place) => place.child_id === child.id).length;
      detail.textContent = `${placeCount} adresse${placeCount === 1 ? "" : "s"} favorite${placeCount === 1 ? "" : "s"}`;
      identity.append(name, detail);
      const actions = document.createElement("div");
      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = "Adresses";
      edit.addEventListener("click", () => selectChildForEditing(child.id));
      const launch = document.createElement("button");
      launch.type = "button";
      launch.textContent = "Ouvrir";
      launch.addEventListener("click", () => activateChild(child.id));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "danger";
      remove.textContent = "Supprimer";
      remove.setAttribute("aria-label", `Supprimer le profil ${child.child_name} et ses adresses`);
      remove.addEventListener("click", () => deleteChild(child));
      actions.append(edit, launch, remove);
      actions.style.display = "flex";
      actions.style.gap = "6px";
      row.append(identity, actions);
      childList.append(row);
    });
  }

  async function loadFamily() {
    if (!state.user || !state.client) return;
    state.loading = true;
    setStatus("Chargement des profils et des adresses…");
    const { data: children, error: childError } = await state.client
      .from("child_profiles")
      .select("id, child_name, created_at")
      .order("created_at", { ascending: true });
    if (childError) throw childError;
    state.children = children || [];
    if (!state.children.some((child) => child.id === state.selectedChildId)) {
      state.selectedChildId = state.children[0]?.id || "";
    }
    if (state.children.length) {
      const { data: places, error: placesError } = await state.client
        .from("favorite_places")
        .select("id, child_id, relationship, label, address")
        .order("created_at", { ascending: true });
      if (placesError) throw placesError;
      state.favorites = places || [];
    } else {
      state.favorites = [];
    }
    if (state.activeChild && !state.children.some((child) => child.id === state.activeChild.id)) {
      state.activeChild = null;
      window.applyKidsMode?.(false, false);
    }
    state.displayName = displayNameFor(state.user);
    document.getElementById("signedInEmail").textContent = `Bienvenue, ${state.displayName} · ${state.user.email || "compte adulte"}`;
    document.getElementById("accountDisplayName").value = state.user.user_metadata?.display_name
      || state.user.user_metadata?.full_name
      || state.user.user_metadata?.name
      || state.displayName;
    window.setNavigueAccountGreeting?.(state.displayName);
    authPanel.hidden = true;
    familyPanel.hidden = false;
    document.getElementById("accountButton").textContent = "Mon compte";
    document.getElementById("accountButton").setAttribute("aria-label", `Espace compte de ${state.displayName}`);
    document.getElementById("kidsToggle").textContent = state.activeChild ? `Mode enfant : ${state.activeChild.child_name}` : "Choisir un profil enfant";
    renderParentChildren();
    renderParentFavorites();
    renderKidFavorites();
    setStatus("Compte adulte connecté. Gérez ici votre nom affiché, les profils enfant et leurs adresses favorites.");
    state.loading = false;
  }

  let welcomedUserId = "";
  async function refreshSession(session, eventName = "") {
    state.user = session?.user || null;
    if (!state.user) {
      welcomedUserId = "";
      state.children = [];
      state.favorites = [];
      state.selectedChildId = "";
      state.activeChild = null;
      state.displayName = "";
      window.applyKidsMode?.(false, false);
      window.setNavigueAccountGreeting?.("");
      authPanel.hidden = false;
      familyPanel.hidden = true;
      childDestinations.classList.remove("is-visible");
      document.getElementById("accountButton").textContent = "Compte adulte";
      document.getElementById("accountButton").setAttribute("aria-label", "Connexion ou compte adulte");
      document.getElementById("kidsToggle").textContent = "Mode enfant";
      document.getElementById("kidsToggle").setAttribute("aria-label", "Choisir un profil enfant");
      parentFavoriteList.hidden = true;
      favoriteForm.hidden = true;
      renderKidFavorites();
      return;
    }
    try {
      await loadFamily();
      if (eventName === "SIGNED_IN" && welcomedUserId !== state.user.id) {
        welcomedUserId = state.user.id;
        if (localStorage.getItem("navigueVoiceEnabled") === "true") {
          window.speakNavigueText?.(`Bienvenue ${state.displayName}, je suis NaVigue. Dis-moi où tu veux aller, et je t’aiderai pas à pas.`);
        }
      }
    } catch (error) {
      setStatus(`Impossible de charger les profils : ${familyErrorMessage(error)}`, true);
      state.loading = false;
    }
  }

  async function selectChildForEditing(childId) {
    state.selectedChildId = childId;
    favoriteForm.hidden = false;
    const child = state.children.find((item) => item.id === childId);
    const relation = document.getElementById("favoriteRelation").value;
    document.getElementById("favoriteLabel").value = `Chez ${relation === "autre" ? "un proche" : relation === "ami" ? "un ami" : relation[0].toUpperCase() + relation.slice(1)}`;
    setStatus(`Ajoutez ou retirez les adresses favorites de ${child?.child_name || "ce profil"}.`);
    renderParentChildren();
    renderParentFavorites();
  }

  async function activateChild(childId) {
    const child = state.children.find((item) => item.id === childId);
    if (!child) return;
    state.activeChild = child;
    state.selectedChildId = childId;
    renderKidFavorites();
    document.getElementById("kidsToggle").textContent = `Mode enfant : ${child.child_name}`;
    document.getElementById("kidsToggle").setAttribute("aria-label", `Désactiver ou changer le profil enfant ${child.child_name}`);
    window.applyKidsMode?.(true);
    dialog.close();
  }

  async function deleteFavorite(place) {
    if (!window.confirm(`Retirer « ${place.label} » des favoris de l’enfant ?`)) return;
    try {
      const { error } = await state.client.from("favorite_places").delete().eq("id", place.id);
      if (error) throw error;
      await loadFamily();
      setStatus(`Adresse favorite « ${place.label} » retirée.`);
    } catch (error) {
      setStatus(`Impossible de retirer cette adresse : ${error.message}`, true);
    }
  }

  async function deleteChild(child) {
    if (!window.confirm(`Supprimer le profil ${child.child_name} et toutes ses adresses favorites ?`)) return;
    try {
      const { error } = await state.client.from("child_profiles").delete().eq("id", child.id);
      if (error) throw error;
      await loadFamily();
      setStatus(`Profil ${child.child_name} supprimé.`);
    } catch (error) {
      setStatus(`Impossible de supprimer ce profil : ${error.message}`, true);
    }
  }

  async function handleOAuth(provider) {
    if (!requireConfigured() || !requireAdultConsent()) return;
    setStatus(`Connexion ${provider === "google" ? "Google" : "Microsoft"} en cours…`);
    const { error } = await state.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
        ...(provider === "azure" ? { scopes: "email" } : {})
      }
    });
    if (error) throw error;
  }

  async function checkAuthProviders() {
    if (!configured) {
      providerStatus.textContent = "Les connexions Google et Microsoft seront disponibles après leur configuration dans Supabase Auth.";
      providerStatus.classList.add("warning");
      document.querySelectorAll("[data-oauth-provider], #adultEmailSubmit").forEach((button) => {
        button.disabled = true;
      });
      return;
    }
    try {
      const response = await fetch(`${config.url}/auth/v1/settings`, {
        headers: { apikey: config.anonKey }
      });
      if (!response.ok) throw new Error(`Le service a répondu avec le statut ${response.status}.`);
      const settings = await response.json();
      const providerNames = { google: "Google", azure: "Microsoft" };
      let activeCount = 0;
      document.querySelectorAll("[data-oauth-provider]").forEach((button) => {
        const provider = button.dataset.oauthProvider;
        const enabled = settings.external?.[provider] === true;
        button.disabled = !enabled;
        button.title = enabled ? `Connexion avec ${providerNames[provider]}` : `${providerNames[provider]} n’est pas encore activé dans Supabase Auth.`;
        if (enabled) activeCount += 1;
      });
      const emailEnabled = settings.external?.email === true;
      document.getElementById("adultEmailSubmit").disabled = !emailEnabled;
      providerStatus.classList.toggle("warning", activeCount < 2);
      if (activeCount === 2) {
        providerStatus.textContent = "Google et Microsoft sont activés. Vous pouvez aussi utiliser le compte adulte par e-mail.";
      } else {
        const disabledNames = Object.entries(providerNames)
          .filter(([provider]) => settings.external?.[provider] !== true)
          .map(([, name]) => name);
        providerStatus.textContent = disabledNames.length
          ? `${disabledNames.join(" et ")} ${disabledNames.length > 1 ? "ne sont pas encore activés" : "n’est pas encore activé"} dans Supabase Auth. ${emailEnabled ? "La connexion par e-mail est disponible." : "Activez aussi le fournisseur e-mail."}`
          : "La connexion par e-mail est désactivée dans Supabase Auth.";
      }
    } catch (error) {
      providerStatus.textContent = `Impossible de vérifier les fournisseurs : ${error.message} Les connexions OAuth peuvent échouer tant que leur configuration n’est pas confirmée.`;
      providerStatus.classList.add("warning");
    }
  }

  async function handleEmailAuth(event) {
    event.preventDefault();
    if (!requireConfigured() || !requireAdultConsent()) return;
    const email = document.getElementById("adultEmail").value.trim();
    const password = document.getElementById("adultPassword").value;
    setStatus(state.creatingAccount ? "Création du compte adulte…" : "Connexion en cours…");
    const result = state.creatingAccount
      ? await state.client.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` } })
      : await state.client.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    if (state.creatingAccount && !result.data.session) {
      setStatus("Compte créé. Ouvrez le message de confirmation reçu par e-mail avant de vous connecter.");
    } else {
      await refreshSession(result.data.session);
    }
  }

  document.getElementById("accountButton").addEventListener("click", openDialog);
  document.getElementById("closeAccountDialog").addEventListener("click", () => dialog.close());
  document.querySelectorAll("[data-oauth-provider]").forEach((button) => {
    button.addEventListener("click", () => {
      handleOAuth(button.dataset.oauthProvider).catch((error) => setStatus(`Connexion impossible : ${error.message}`, true));
    });
  });
  document.getElementById("adultEmailForm").addEventListener("submit", (event) => {
    handleEmailAuth(event).catch((error) => setStatus(`Connexion impossible : ${error.message}`, true));
  });
  document.getElementById("accountProfileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.client || !state.user) {
      setStatus("Connectez-vous pour modifier votre compte.", true);
      return;
    }
    const displayName = document.getElementById("accountDisplayName").value.trim();
    if (!displayName) {
      setStatus("Saisissez un prénom à afficher.", true);
      return;
    }
    try {
      const { data, error } = await state.client.auth.updateUser({
        data: { display_name: displayName, full_name: displayName }
      });
      if (error) throw error;
      state.user = data.user;
      state.displayName = displayNameFor(data.user);
      document.getElementById("signedInEmail").textContent = `Bienvenue, ${state.displayName} · ${state.user.email || "compte adulte"}`;
      document.getElementById("accountDisplayName").value = displayName;
      window.setNavigueAccountGreeting?.(state.displayName);
      setStatus("Votre nom affiché a été mis à jour.");
    } catch (error) {
      setStatus(`Impossible de mettre à jour le compte : ${error.message}`, true);
    }
  });
  document.getElementById("accountModeToggle").addEventListener("click", (event) => {
    state.creatingAccount = !state.creatingAccount;
    document.getElementById("adultEmailSubmit").textContent = state.creatingAccount ? "Créer mon compte adulte" : "Se connecter";
    document.getElementById("adultPassword").autocomplete = state.creatingAccount ? "new-password" : "current-password";
    event.currentTarget.textContent = state.creatingAccount ? "J’ai déjà un compte" : "Créer un compte adulte";
    setStatus(state.creatingAccount ? "Utilisez une adresse e-mail adulte et un mot de passe robuste." : "");
  });
  document.getElementById("signOutButton").addEventListener("click", async () => {
    try {
      const { error } = await state.client.auth.signOut();
      if (error) throw error;
      setStatus("Déconnecté du compte adulte.");
      await refreshSession(null);
    } catch (error) {
      setStatus(`Déconnexion impossible : ${error.message}`, true);
    }
  });

  document.getElementById("childProfileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.client || !state.user) {
      setStatus("Connectez-vous avec un compte adulte pour créer un profil enfant.", true);
      return;
    }
    const input = document.getElementById("childProfileName");
    const childName = input.value.trim();
    if (!childName) return;
    try {
      const { data, error } = await state.client.from("child_profiles")
        .insert({ parent_id: state.user.id, child_name: childName })
        .select("id")
        .single();
      if (error) throw error;
      input.value = "";
      state.selectedChildId = data.id;
      await loadFamily();
      await selectChildForEditing(data.id);
    } catch (error) {
      setStatus(`Impossible d’ajouter ce profil : ${error.message}`, true);
    }
  });

  document.getElementById("favoriteForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.client || !state.user || !state.selectedChildId) {
      setStatus("Choisissez d’abord un profil enfant.", true);
      return;
    }
    const relationship = document.getElementById("favoriteRelation").value;
    const label = document.getElementById("favoriteLabel").value.trim();
    const address = document.getElementById("favoriteAddress").value.trim();
    try {
      const { error } = await state.client.from("favorite_places").insert({
        parent_id: state.user.id,
        child_id: state.selectedChildId,
        relationship,
        label,
        address
      });
      if (error) throw error;
      document.getElementById("favoriteAddress").value = "";
      await loadFamily();
      setStatus(`Adresse favorite enregistrée pour ${state.children.find((child) => child.id === state.selectedChildId)?.child_name || "l’enfant"}.`);
    } catch (error) {
      setStatus(`Impossible d’enregistrer cette adresse : ${error.message}`, true);
    }
  });

  if (!configured) {
    setupNotice.hidden = false;
    document.querySelectorAll("[data-oauth-provider], #adultEmailSubmit").forEach((button) => {
      button.setAttribute("aria-disabled", "true");
    });
    checkAuthProviders();
  } else {
    setupNotice.hidden = true;
    checkAuthProviders();
    state.client.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => refreshSession(session, event), 0);
    });
    state.client.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        return refreshSession(data.session, "INITIAL_SESSION");
      })
      .catch((error) => setStatus(`Impossible de vérifier la session : ${error.message}`, true));
  }
})();

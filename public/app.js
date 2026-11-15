// Cuanin Platform Main Landing Client Script

const demoSubdomainMap = {
  "tpl-kuliner": {
    subdomain: "kopisenja",
    name: "Kopi Senja Nusantara",
    url: "/toko/kopisenja",
  },
  "tpl-fashion": {
    subdomain: "butikaisyah",
    name: "Butik Aisyah Modest",
    url: "/toko/butikaisyah",
  },
  "tpl-kriya": {
    subdomain: "kriyabambu",
    name: "Kriya Bambu & Kayu",
    url: "/toko/kriyabambu",
  },
  "tpl-beauty": {
    subdomain: "naturaherbal",
    name: "Natura Herbal Skincare",
    url: "/toko/naturaherbal",
  },
  "tpl-gadget": {
    subdomain: "gadgetpedia",
    name: "GadgetPedia Aksesoris",
    url: "/toko/gadgetpedia",
  },
  "tpl-florist": {
    subdomain: "kebunkita",
    name: "Kebun Kita Florist",
    url: "/toko/kebunkita",
  },
  "tpl-fashion-modern": {
    subdomain: "zaraboutique",
    name: "Zara & Co. Modern Apparel",
    url: "/toko/zaraboutique",
  },
  "tpl-fnb-modern": {
    subdomain: "rasanusantara",
    name: "Rasa Nusantara Gourmet",
    url: "/toko/rasanusantara",
  },
  "tpl-property-modern": {
    subdomain: "griyahunian",
    name: "Griya Hunian Asri Estate",
    url: "/toko/griyahunian",
  },
  "tpl-wisata-modern": {
    subdomain: "jelajahnusantara",
    name: "Jelajah Wisata Nusantara Tour",
    url: "/toko/jelajahnusantara",
  },
  "tpl-company-profile": {
    subdomain: "sinardigital",
    name: "Sinar Digital Solusindo Studio",
    url: "/toko/sinardigital",
  },
};

// Preview lima template baru
const newTemplatePreviewMap = {
  "tpl-fashion-modern": "/templates/Fashion.html",
  "tpl-fnb-modern": "/templates/fnb.html",
  "tpl-property-modern": "/templates/properti.html",
  "tpl-wisata-modern": "/templates/wisata.html",
  "tpl-company-profile": "/templates/company.html",
};

// Escape data untuk keamanan HTML
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadTemplates() {
  const container = document.getElementById("template-catalog-grid");
  if (!container) return;

  try {
    const res = await fetch("/api/templates");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      throw new Error("Data template tidak valid");
    }

    container.innerHTML = json.data
      .map((tpl) => {
        const demo = demoSubdomainMap[tpl.id];
        const isNewTemplate = Boolean(newTemplatePreviewMap[tpl.id]);

        // Prioritaskan preview_url dari database,
        // lalu gunakan fallback map untuk template baru.
        const previewUrl =
          tpl.preview_url || newTemplatePreviewMap[tpl.id] || "";

        // Template lama tetap menggunakan demo toko.
        const demoUrl = demo?.url || previewUrl;

        const imageUrl = escapeHtml(tpl.image_url);
        const name = escapeHtml(tpl.name);
        const category = escapeHtml(tpl.category);
        const description = escapeHtml(tpl.description);
        const price = Number(tpl.price || 0).toLocaleString("id-ID");

        return `
        <div class="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-xl hover:border-brand-500 transition-all duration-300">

          <div>
            <div class="h-52 w-full bg-slate-100 overflow-hidden relative">

              <img
                src="${imageUrl}"
                alt="${name}"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              >

              <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/85 text-white">
                ${category}
              </span>

              ${
                demoUrl
                  ? `
                    <a
                      href="${escapeHtml(demoUrl)}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm hover:bg-brand-600 hover:text-white transition-all"
                    >
                      Buka Preview ↗
                    </a>
                  `
                  : ""
              }

            </div>

            <div class="p-6 sm:p-7 space-y-2">
              <h3 class="font-bold text-slate-900 text-lg leading-snug group-hover:text-brand-600 transition-colors">
                ${name}
              </h3>

              <p class="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                ${description}
              </p>
            </div>
          </div>

          <div class="p-6 sm:p-7 pt-0 border-t border-slate-100 mt-2 flex flex-col gap-3">

            <div class="flex items-center justify-between text-xs">
              <div>
                <span class="text-[11px] font-semibold text-slate-400 block">
                  ${isNewTemplate ? "Jenis Preview:" : "Format Alamat Toko:"}
                </span>

                <span class="font-mono font-bold text-brand-600">
                  ${
                    isNewTemplate
                      ? "Desain Website"
                      : escapeHtml(demo?.subdomain || "-")
                  }
                  ${!isNewTemplate && demo ? ".cuanin.com" : ""}
                </span>
              </div>
            </div>

            <div class="text-xs font-semibold text-slate-700">
              Mulai Rp ${price}
            </div>

            <a
              href="/order?template=${encodeURIComponent(tpl.id)}"
              class="btn-pill-primary text-xs py-2.5 px-4 w-full text-center block shadow-xs"
            >
              Pilih Template & Pesan Web →
            </a>

          </div>
        </div>
      `;
      })
      .join("");
  } catch (err) {
    console.error("Gagal memuat template:", err);

    container.innerHTML = `
      <div class="col-span-3 text-center py-8 text-rose-500 text-xs">
        Gagal memuat template: ${escapeHtml(err.message)}
      </div>
    `;
  }
}

// ==============================================
// AUTHENTICATION & SESSION MANAGEMENT
// ==============================================

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgColors = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-slate-900 text-white",
  };
  const color = bgColors[type] || bgColors.info;

  toast.className = `${color} px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 font-bold text-white/80 hover:text-white cursor-pointer">&times;</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function openAuthModal(tab = "login") {
  const modal = document.getElementById("modal-auth");
  if (!modal) return;
  modal.style.display = "flex";
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  switchAuthTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById("modal-auth");
  if (!modal) return;
  modal.style.display = "none";
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAuthModal();
  }
});

function switchAuthTab(tab) {
  const btnLogin = document.getElementById("tab-btn-login");
  const btnRegister = document.getElementById("tab-btn-register");
  const panelLogin = document.getElementById("auth-panel-login");
  const panelRegister = document.getElementById("auth-panel-register");

  if (!btnLogin || !btnRegister) return;

  if (tab === "login") {
    btnLogin.className = "py-2 text-xs font-bold rounded-xl transition-all text-white bg-brand-600 shadow-xs cursor-pointer";
    btnRegister.className = "py-2 text-xs font-bold rounded-xl transition-all text-slate-600 hover:text-brand-600 cursor-pointer";
    if (panelLogin) panelLogin.classList.remove("hidden");
    if (panelRegister) panelRegister.classList.add("hidden");
  } else {
    btnRegister.className = "py-2 text-xs font-bold rounded-xl transition-all text-white bg-brand-600 shadow-xs cursor-pointer";
    btnLogin.className = "py-2 text-xs font-bold rounded-xl transition-all text-slate-600 hover:text-brand-600 cursor-pointer";
    if (panelRegister) panelRegister.classList.remove("hidden");
    if (panelLogin) panelLogin.classList.add("hidden");
  }
}

function toggleUserDropdown() {
  const menu = document.getElementById("user-dropdown-menu");
  if (menu) menu.classList.toggle("hidden");
}

// Close user dropdown if clicking outside
document.addEventListener("click", (e) => {
  const menu = document.getElementById("user-dropdown-menu");
  const btn = document.getElementById("user-menu-btn");
  if (menu && !menu.classList.contains("hidden")) {
    if (btn && !btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
    }
  }
});

async function handleAuthLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const btn = document.getElementById("btn-submit-login");

  if (!email || !password) {
    showToast("Email dan password wajib diisi", "error");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = "Memverifikasi...";

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();

    if (!json.success) {
      showToast(json.error || "Login gagal", "error");
      btn.disabled = false;
      btn.innerHTML = "Masuk Sekarang &rarr;";
      return;
    }

    localStorage.setItem("cuanin_token", json.token);
    localStorage.setItem("cuanin_user", JSON.stringify(json.user));

    showToast(json.message || "Login berhasil!", "success");
    closeAuthModal();
    updateNavAuthState();
  } catch (err) {
    showToast("Gagal terhubung ke server: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Masuk Sekarang &rarr;";
  }
}

async function handleAuthRegister(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const password = document.getElementById("reg-password").value;
  const btn = document.getElementById("btn-submit-register");

  if (!name || !email || !password) {
    showToast("Nama, email, dan password wajib diisi", "error");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = "Mendaftarkan...";

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const json = await res.json();

    if (!json.success) {
      showToast(json.error || "Registrasi gagal", "error");
      btn.disabled = false;
      btn.innerHTML = "Buat Akun Sekarang &rarr;";
      return;
    }

    localStorage.setItem("cuanin_token", json.token);
    localStorage.setItem("cuanin_user", JSON.stringify(json.user));

    showToast("Registrasi berhasil! Selamat datang di Cuanin.", "success");
    closeAuthModal();
    updateNavAuthState();
  } catch (err) {
    showToast("Gagal terhubung ke server: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Buat Akun Sekarang &rarr;";
  }
}

function updateNavAuthState() {
  const token = localStorage.getItem("cuanin_token");
  const userStr = localStorage.getItem("cuanin_user");
  const guestActions = document.getElementById("nav-guest-actions");
  const userActions = document.getElementById("nav-user-actions");

  if (!guestActions || !userActions) return;

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      guestActions.classList.add("hidden");
      userActions.classList.remove("hidden");
      userActions.classList.add("flex");

      const nameEl = document.getElementById("user-display-name");
      const emailEl = document.getElementById("user-dropdown-email");
      const avatarEl = document.getElementById("user-avatar-initial");
      const roleEl = document.getElementById("user-role-badge");
      const storeItem = document.getElementById("user-store-menu-item");
      const storeLink = document.getElementById("user-store-link");

      if (nameEl) nameEl.textContent = user.name || "Member";
      if (emailEl) emailEl.textContent = user.email || "";
      if (avatarEl) avatarEl.textContent = (user.name || "U")[0].toUpperCase();
      if (roleEl) {
        roleEl.textContent = user.role === "TENANT_OWNER" ? "Owner Toko" : user.role === "ADMIN" ? "Admin" : "Member";
      }

      if (storeItem && storeLink) {
        if (user.tenant && user.tenant.subdomain) {
          storeItem.classList.remove("hidden");
          storeLink.href = `/toko/${user.tenant.subdomain}`;
        } else {
          storeItem.classList.add("hidden");
        }
      }

      const adminItem = document.getElementById("user-admin-menu-item");
      if (adminItem) {
        if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
          adminItem.classList.remove("hidden");
        } else {
          adminItem.classList.add("hidden");
        }
      }
    } catch (e) {
      guestActions.classList.remove("hidden");
      userActions.classList.add("hidden");
    }
  } else {
    guestActions.classList.remove("hidden");
    userActions.classList.add("hidden");
    userActions.classList.remove("flex");
  }
}

function performLogout() {
  localStorage.removeItem("cuanin_token");
  localStorage.removeItem("cuanin_user");
  showToast("Anda telah berhasil keluar (logout)", "info");
  updateNavAuthState();
  const menu = document.getElementById("user-dropdown-menu");
  if (menu) menu.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  loadTemplates();
  updateNavAuthState();
});

// Cuanin Profile Client Script

let currentUser = null;

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-xl text-xs font-bold transition-all transform duration-300 translate-y-2 opacity-0 ${
    type === "success"
      ? "bg-emerald-600 text-white"
      : type === "error"
      ? "bg-rose-600 text-white"
      : "bg-slate-900 text-white"
  }`;

  const iconSvg =
    type === "success"
      ? `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`
      : type === "error"
      ? `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>`
      : `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRupiah(amount) {
  return "Rp " + Number(amount || 0).toLocaleString("id-ID");
}

function formatDateIndo(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toggleDropdown() {
  const menu = document.getElementById("user-dropdown");
  if (menu) menu.classList.toggle("hidden");
}

document.addEventListener("click", (e) => {
  const btn = document.getElementById("user-nav-btn");
  const menu = document.getElementById("user-dropdown");
  if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

function handleLogout() {
  localStorage.removeItem("cuanin_token");
  localStorage.removeItem("cuanin_user");
  showToast("Anda telah keluar akun", "info");
  setTimeout(() => {
    window.location.href = "/";
  }, 600);
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-pane").forEach((p) => p.classList.add("hidden"));
  const target = document.getElementById(tabId);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("border-brand-600", "text-brand-600");
    btn.classList.add("border-transparent", "text-slate-500");
  });

  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.remove("border-transparent", "text-slate-500");
    activeBtn.classList.add("border-brand-600", "text-brand-600");
  }
}

async function loadProfile() {
  const token = localStorage.getItem("cuanin_token");
  const unauthView = document.getElementById("unauth-view");
  const authView = document.getElementById("auth-view");

  if (!token) {
    if (unauthView) unauthView.classList.remove("hidden");
    if (authView) authView.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("cuanin_token");
        localStorage.removeItem("cuanin_user");
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    currentUser = data.user;
    localStorage.setItem("cuanin_user", JSON.stringify(currentUser));

    if (unauthView) unauthView.classList.add("hidden");
    if (authView) authView.classList.remove("hidden");

    renderUserProfile(currentUser);
    loadUserStores(token);
    loadUserOrders(token);
  } catch (err) {
    if (unauthView) unauthView.classList.remove("hidden");
    if (authView) authView.classList.add("hidden");
  }
}

function renderUserProfile(user) {
  // Top nav elements
  const navName = document.getElementById("nav-user-name");
  const navRole = document.getElementById("nav-user-role");
  const navAvatar = document.getElementById("nav-user-avatar");
  const dropEmail = document.getElementById("dropdown-user-email");

  const displayName = user.name || "Member Cuanin";
  const initial = (user.name || "U")[0].toUpperCase();

  if (navName) navName.textContent = displayName;
  if (dropEmail) dropEmail.textContent = user.email || "-";
  if (navRole) {
    navRole.textContent =
      user.role === "TENANT_OWNER"
        ? "Owner Toko"
        : user.role === "ADMIN"
        ? "Admin"
        : "Member";
  }
  if (navAvatar) {
    if (user.avatar_url) {
      navAvatar.innerHTML = `<img src="${escapeHtml(user.avatar_url)}" alt="Avatar" class="w-full h-full object-cover rounded-full" onerror="this.parentElement.textContent='${initial}'" />`;
    } else {
      navAvatar.textContent = initial;
    }
  }

  // Hero card elements
  const profName = document.getElementById("profile-name");
  const profEmail = document.getElementById("profile-email");
  const profPhone = document.getElementById("profile-phone");
  const profRolePill = document.getElementById("profile-role-pill");
  const profDate = document.getElementById("profile-join-date");
  const bigAvatar = document.getElementById("profile-big-avatar");

  if (profName) profName.textContent = displayName;
  if (profEmail) profEmail.textContent = user.email || "-";
  if (profPhone) profPhone.textContent = user.phone || "Belum diatur";
  if (profDate) profDate.textContent = formatDateIndo(user.created_at);

  if (profRolePill) {
    if (user.role === "TENANT_OWNER") {
      profRolePill.textContent = "Owner Toko UMKM";
      profRolePill.className = "px-3 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200";
    } else if (user.role === "ADMIN") {
      profRolePill.textContent = "Administrator Platform";
      profRolePill.className = "px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200";
    } else {
      profRolePill.textContent = "Member Cuanin";
      profRolePill.className = "px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
  }

  if (bigAvatar) {
    if (user.avatar_url) {
      bigAvatar.innerHTML = `<img src="${escapeHtml(user.avatar_url)}" alt="Avatar" class="w-full h-full object-cover rounded-3xl" onerror="this.parentElement.textContent='${initial}'" />`;
    } else {
      bigAvatar.textContent = initial;
    }
  }

  // Populate inputs in Form
  const inputName = document.getElementById("input-name");
  const inputEmail = document.getElementById("input-email");
  const inputPhone = document.getElementById("input-phone");
  const inputAvatar = document.getElementById("input-avatar");

  if (inputName) inputName.value = user.name || "";
  if (inputEmail) inputEmail.value = user.email || "";
  if (inputPhone) inputPhone.value = user.phone || "";
  if (inputAvatar) inputAvatar.value = user.avatar_url || "";
}

async function loadUserStores(token) {
  const container = document.getElementById("stores-grid");
  const empty = document.getElementById("stores-empty");
  const countEl = document.getElementById("tab-stores-count");

  try {
    const res = await fetch("/api/auth/my-stores", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    const stores = json.stores || [];

    if (countEl) countEl.textContent = stores.length;

    if (!stores.length) {
      if (container) container.innerHTML = "";
      if (empty) empty.classList.remove("hidden");
      return;
    }

    if (empty) empty.classList.add("hidden");
    if (!container) return;

    container.innerHTML = stores
      .map(
        (store) => `
        <div class="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-3 mb-3">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Toko Aktif
              </span>
              <span class="text-[11px] text-slate-400 font-semibold">${formatDateIndo(store.created_at)}</span>
            </div>

            <h3 class="text-lg font-black text-slate-900 mb-1">${escapeHtml(store.name)}</h3>
            <p class="text-xs text-brand-600 font-bold mb-4 font-mono">
              https://${escapeHtml(store.subdomain)}.cuanin.com
            </p>

            <div class="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs mb-4">
              <div class="flex items-center justify-between">
                <span class="text-slate-500 font-medium">Kota Asal Toko:</span>
                <span class="font-bold text-slate-800">${escapeHtml(store.origin_city || "Jakarta")}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500 font-medium">Saldo Siap Ditarik:</span>
                <span class="font-extrabold text-emerald-600">${formatRupiah(store.balance_active)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500 font-medium">Saldo Escrow Tertahan:</span>
                <span class="font-extrabold text-amber-600">${formatRupiah(store.balance_held)}</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center gap-2">
            <a
              href="/toko/${escapeHtml(store.subdomain)}"
              target="_blank"
              class="flex-1 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-all shadow-xs"
            >
              Kunjungi Toko &rarr;
            </a>
          </div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    if (empty) empty.classList.remove("hidden");
  }
}

async function loadUserOrders(token) {
  const container = document.getElementById("orders-container");
  const empty = document.getElementById("orders-empty");
  const countEl = document.getElementById("tab-orders-count");

  try {
    const res = await fetch("/api/auth/my-orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    const orders = json.orders || [];

    if (countEl) countEl.textContent = orders.length;

    if (!orders.length) {
      if (container) container.innerHTML = "";
      if (empty) empty.classList.remove("hidden");
      return;
    }

    if (empty) empty.classList.add("hidden");
    if (!container) return;

    container.innerHTML = orders
      .map((order) => {
        let items = [];
        try {
          items = typeof order.items_json === "string" ? JSON.parse(order.items_json) : order.items_json;
        } catch {
          items = [];
        }

        const itemsSummary = Array.isArray(items)
          ? items.map((it) => `${it.qty || 1}x ${it.name || "Produk"}`).join(", ")
          : "Detail barang pesanan";

        let statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">Menunggu Pembayaran</span>`;
        if (order.status === "DIPROSES") {
          statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">Diproses Toko</span>`;
        } else if (order.status === "DIKIRIM") {
          statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">Sedang Dikirim (${escapeHtml(order.courier || "")})</span>`;
        } else if (order.status === "SELESAI") {
          statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Pesanan Selesai</span>`;
        }

        return `
        <div class="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="space-y-1.5 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-xs font-black text-slate-900">${escapeHtml(order.invoice_number)}</span>
              ${statusBadge}
              <span class="text-[11px] text-slate-400 font-semibold">• ${formatDateIndo(order.created_at)}</span>
            </div>

            <p class="text-xs font-bold text-slate-700">
              Toko: <a href="/toko/${escapeHtml(order.store_subdomain)}" target="_blank" class="text-brand-600 hover:underline">${escapeHtml(order.store_name)}</a>
            </p>

            <p class="text-xs text-slate-500 line-clamp-1">
              ${escapeHtml(itemsSummary)}
            </p>

            ${
              order.tracking_number
                ? `<p class="text-[11px] text-slate-600 font-semibold">No. Resi Kurir: <span class="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">${escapeHtml(order.tracking_number)}</span></p>`
                : ""
            }
          </div>

          <div class="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Total Transaksi</span>
            <span class="text-base font-black text-slate-900 block mb-2">${formatRupiah(order.total_paid)}</span>
            <a
              href="/toko/${escapeHtml(order.store_subdomain)}"
              target="_blank"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              <span>Buka Toko</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (err) {
    if (empty) empty.classList.remove("hidden");
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const token = localStorage.getItem("cuanin_token");
  if (!token) return;

  const btn = document.getElementById("btn-save-profile");
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span>Menyimpan...</span>`;

  const name = document.getElementById("input-name").value;
  const phone = document.getElementById("input-phone").value;
  const avatar_url = document.getElementById("input-avatar").value;

  try {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phone, avatar_url }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Gagal memperbarui profil");
    }

    currentUser = data.user;
    localStorage.setItem("cuanin_user", JSON.stringify(currentUser));
    renderUserProfile(currentUser);
    showToast("Biodata profil berhasil disimpan!", "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

async function handleUpdatePassword(e) {
  e.preventDefault();
  const token = localStorage.getItem("cuanin_token");
  if (!token) return;

  const curPass = document.getElementById("input-cur-password").value;
  const newPass = document.getElementById("input-new-password").value;
  const confPass = document.getElementById("input-conf-password").value;

  if (newPass !== confPass) {
    showToast("Password baru dan konfirmasi tidak cocok!", "error");
    return;
  }

  const btn = document.getElementById("btn-save-password");
  btn.disabled = true;
  btn.textContent = "Memproses...";

  try {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: curPass,
        new_password: newPass,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Gagal mengubah kata sandi");
    }

    document.getElementById("form-edit-password").reset();
    showToast("Kata sandi berhasil diperbarui!", "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Ganti Kata Sandi";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
});

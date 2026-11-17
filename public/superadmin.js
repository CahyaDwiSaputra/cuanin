// Cuanin Superadmin Client Script
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgColor =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-rose-600"
        : "bg-slate-900";
  toast.className = `${bgColor} text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 pointer-events-auto transition-all duration-200 transform translate-y-2 opacity-0 border border-white/10`;
  toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" class="text-white/70 hover:text-white font-bold text-sm">&times;</button>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

async function performSuperadminLogin(e) {
  e.preventDefault();
  const username = document.getElementById("sa-login-username").value.trim();
  const password = document.getElementById("sa-login-password").value;

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || "Login Superadmin gagal", "error");
      return;
    }

    sessionStorage.setItem("cuanin_admin_token", json.token);
    localStorage.setItem("cuanin_token", json.token);
    localStorage.setItem(
      "cuanin_user",
      JSON.stringify({
        id: json.admin.id,
        name: "Superadmin Cuanin",
        email: json.admin.email,
        role: "ADMIN",
      }),
    );
    showToast("Autentikasi Superadmin berhasil", "success");
    loadSuperadmin();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function performSuperadminLogout() {
  sessionStorage.removeItem("cuanin_admin_token");
  localStorage.removeItem("cuanin_token");
  localStorage.removeItem("cuanin_user");
  showToast("Sesi Superadmin telah diakhiri", "info");
  loadSuperadmin();
}

function renderUserActivityChart(data = []) {
  const container = document.getElementById("sa-user-activity-chart");
  if (!container) return;

  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.registers, item.logins, item.new_users]),
  );

  container.innerHTML = data
    .map((item) => {
      const registerHeight = (item.registers / maxValue) * 100;
      const loginHeight = (item.logins / maxValue) * 100;
      const newUserHeight = (item.new_users / maxValue) * 100;

      return `
      <div class="flex-1 flex flex-col items-center justify-end gap-2 min-w-[36px]">
        <div class="flex items-end justify-center gap-1 h-28 w-full">
          <span title="Register: ${item.registers}" class="block w-2 bg-emerald-400 rounded-t-md" style="height: ${Math.max(registerHeight, item.registers > 0 ? 14 : 0)}%"></span>
          <span title="Login: ${item.logins}" class="block w-2 bg-sky-400 rounded-t-md" style="height: ${Math.max(loginHeight, item.logins > 0 ? 14 : 0)}%"></span>
          <span title="User baru: ${item.new_users}" class="block w-2 bg-violet-400 rounded-t-md" style="height: ${Math.max(newUserHeight, item.new_users > 0 ? 14 : 0)}%"></span>
        </div>
        <span class="text-[10px] text-slate-400">${item.label}</span>
      </div>
    `;
    })
    .join("");
}

function renderRecentUsers(rows = []) {
  const tbody = document.getElementById("sa-users-table-body");
  if (!tbody) return;

  tbody.innerHTML =
    rows.length === 0
      ? `
    <tr>
      <td colspan="5" class="px-4 py-6 text-center text-slate-500">Belum ada user yang terdaftar</td>
    </tr>
  `
      : rows
          .map(
            (user) => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="px-4 py-3 font-mono font-bold text-slate-400">#${user.id}</td>
      <td class="px-4 py-3 font-bold text-white">${user.name}</td>
      <td class="px-4 py-3 text-slate-300">${user.email}</td>
      <td class="px-4 py-3 text-slate-200"><span class="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-700 text-slate-200 border border-slate-600">${user.role}</span></td>
      <td class="px-4 py-3 text-slate-400">${new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
    </tr>
  `,
          )
          .join("");
}

async function loadSuperadmin() {
  let adminToken = sessionStorage.getItem("cuanin_admin_token");

  // Auto-detect if already authenticated from main portal
  if (!adminToken) {
    const mainToken = localStorage.getItem("cuanin_token");
    const mainUserStr = localStorage.getItem("cuanin_user");
    if (mainToken && mainUserStr) {
      try {
        const u = JSON.parse(mainUserStr);
        if (u.role === "ADMIN" || u.role === "SUPERADMIN") {
          adminToken = mainToken;
          sessionStorage.setItem("cuanin_admin_token", adminToken);
        }
      } catch (e) {}
    }
  }

  const loginGate = document.getElementById("sa-login-gate");
  const authDash = document.getElementById("sa-authenticated-dashboard");
  const btnLogout = document.getElementById("btn-sa-logout");

  if (!adminToken) {
    if (loginGate) loginGate.classList.remove("hidden");
    if (authDash) authDash.classList.add("hidden");
    if (btnLogout) btnLogout.classList.add("hidden");
    return;
  }

  if (loginGate) loginGate.classList.add("hidden");
  if (authDash) authDash.classList.remove("hidden");
  if (btnLogout) btnLogout.classList.remove("hidden");

  try {
    const res = await fetch("/api/admin/overview", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem("cuanin_admin_token");
      if (loginGate) loginGate.classList.remove("hidden");
      if (authDash) authDash.classList.add("hidden");
      if (btnLogout) btnLogout.classList.add("hidden");
      return;
    }

    const json = await res.json();
    if (!json.success) {
      showToast(json.error || "Gagal memuat overview superadmin", "error");
      return;
    }

    const { stats, tenants } = json.data;
    document.getElementById("sa-total-escrow").textContent =
      `Rp ${Number(stats.total_escrow_held).toLocaleString("id-ID")}`;
    document.getElementById("sa-platform-revenue").textContent =
      `Rp ${Number(stats.total_platform_earnings).toLocaleString("id-ID")}`;
    document.getElementById("sa-midtrans-fees").textContent =
      `Rp ${Number(stats.total_midtrans_fees).toLocaleString("id-ID")}`;

    const tbody = document.getElementById("sa-tenants-table-body");
    tbody.innerHTML = tenants
      .map(
        (t) => `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-3 font-mono font-bold text-slate-400">#${t.id}</td>
        <td class="px-4 py-3 font-bold text-white">${t.name}</td>
        <td class="px-4 py-3 font-mono text-brand-400 font-bold">${t.subdomain}.cuanin.com</td>
        <td class="px-4 py-3 text-slate-300">${t.owner_name} (${t.phone})</td>
        <td class="px-4 py-3 text-slate-400">${t.bank_name} ${t.bank_account_number}</td>
        <td class="px-4 py-3 font-extrabold text-amber-400">Rp ${Number(t.balance_held).toLocaleString("id-ID")}</td>
        <td class="px-4 py-3 font-extrabold text-emerald-400">Rp ${Number(t.balance_active).toLocaleString("id-ID")}</td>
        <td class="px-4 py-3 text-right">
          <a href="/toko/${t.subdomain}" target="_blank" class="text-xs font-bold text-brand-400 hover:underline">
            Buka Toko &rarr;
          </a>
        </td>
      </tr>
    `,
      )
      .join("");

    const userMonitoringRes = await fetch("/api/admin/user-monitoring", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const userMonitoringJson = await userMonitoringRes.json();
    if (userMonitoringJson.success) {
      const data = userMonitoringJson.data;
      document.getElementById("sa-total-users").textContent = Number(
        data.total_users,
      ).toLocaleString("id-ID");
      document.getElementById("sa-total-admins").textContent = Number(
        data.total_admins,
      ).toLocaleString("id-ID");
      document.getElementById("sa-register-30d").textContent = Number(
        data.total_registers_30d,
      ).toLocaleString("id-ID");
      document.getElementById("sa-login-30d").textContent = Number(
        data.total_logins_30d,
      ).toLocaleString("id-ID");
      renderUserActivityChart(data.timeline || []);
      renderRecentUsers(data.recent_users || []);
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function submitCreateAdmin(event) {
  event.preventDefault();
  const token = sessionStorage.getItem("cuanin_admin_token");
  const form = event.currentTarget;
  const payload = {
    username: document.getElementById("sa-admin-username").value.trim(),
    email: document.getElementById("sa-admin-email").value.trim(),
    password: document.getElementById("sa-admin-password").value,
    role: document.getElementById("sa-admin-role").value,
  };

  try {
    const res = await fetch("/api/admin/create-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Gagal menambahkan admin");
    }
    showToast(json.message, "success");
    form.reset();
    loadSuperadmin();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function submitCreateUser(event) {
  event.preventDefault();
  const token = sessionStorage.getItem("cuanin_admin_token");
  const form = event.currentTarget;
  const payload = {
    name: document.getElementById("sa-user-name").value.trim(),
    email: document.getElementById("sa-user-email").value.trim(),
    password: document.getElementById("sa-user-password").value,
    phone: document.getElementById("sa-user-phone").value.trim(),
    role: document.getElementById("sa-user-role").value,
  };

  try {
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Gagal menambahkan user");
    }
    showToast(json.message, "success");
    form.reset();
    loadSuperadmin();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function triggerAutoConfirmWorker(force = true) {
  const adminToken = sessionStorage.getItem("cuanin_admin_token");
  if (!adminToken) {
    showToast("Autentikasi Superadmin diperlukan", "error");
    return;
  }

  try {
    const res = await fetch("/api/admin/run-escrow-worker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ forceSimulateAll: force }),
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || "Worker gagal dijalankan", "error");
      return;
    }

    showToast(json.message, "success");
    loadSuperadmin();
  } catch (err) {
    showToast(err.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const adminForm = document.getElementById("sa-create-admin-form");
  const userForm = document.getElementById("sa-create-user-form");

  if (adminForm) adminForm.addEventListener("submit", submitCreateAdmin);
  if (userForm) userForm.addEventListener("submit", submitCreateUser);

  loadSuperadmin();
});

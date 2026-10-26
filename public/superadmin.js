// Cuanin Superadmin Client Script
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900';
  toast.className = `${bgColor} text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 pointer-events-auto transition-all duration-200 transform translate-y-2 opacity-0 border border-white/10`;
  toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" class="text-white/70 hover:text-white font-bold text-sm">&times;</button>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

async function performSuperadminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('sa-login-username').value.trim();
  const password = document.getElementById('sa-login-password').value;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Login Superadmin gagal', 'error');
      return;
    }

    sessionStorage.setItem('cuanin_admin_token', json.token);
    showToast('Autentikasi Superadmin berhasil', 'success');
    loadSuperadmin();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function performSuperadminLogout() {
  sessionStorage.removeItem('cuanin_admin_token');
  showToast('Sesi Superadmin telah diakhiri', 'info');
  loadSuperadmin();
}

async function loadSuperadmin() {
  const adminToken = sessionStorage.getItem('cuanin_admin_token');
  const loginGate = document.getElementById('sa-login-gate');
  const authDash = document.getElementById('sa-authenticated-dashboard');
  const btnLogout = document.getElementById('btn-sa-logout');

  if (!adminToken) {
    if (loginGate) loginGate.classList.remove('hidden');
    if (authDash) authDash.classList.add('hidden');
    if (btnLogout) btnLogout.classList.add('hidden');
    return;
  }

  if (loginGate) loginGate.classList.add('hidden');
  if (authDash) authDash.classList.remove('hidden');
  if (btnLogout) btnLogout.classList.remove('hidden');

  try {
    const res = await fetch('/api/admin/overview', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem('cuanin_admin_token');
      if (loginGate) loginGate.classList.remove('hidden');
      if (authDash) authDash.classList.add('hidden');
      if (btnLogout) btnLogout.classList.add('hidden');
      return;
    }

    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Gagal memuat overview superadmin', 'error');
      return;
    }

    const { stats, tenants } = json.data;
    document.getElementById('sa-total-escrow').textContent = `Rp ${Number(stats.total_escrow_held).toLocaleString('id-ID')}`;
    document.getElementById('sa-platform-revenue').textContent = `Rp ${Number(stats.total_platform_earnings).toLocaleString('id-ID')}`;
    document.getElementById('sa-midtrans-fees').textContent = `Rp ${Number(stats.total_midtrans_fees).toLocaleString('id-ID')}`;

    const tbody = document.getElementById('sa-tenants-table-body');
    tbody.innerHTML = tenants.map(t => `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-3 font-mono font-bold text-slate-400">#${t.id}</td>
        <td class="px-4 py-3 font-bold text-white">${t.name}</td>
        <td class="px-4 py-3 font-mono text-brand-400 font-bold">${t.subdomain}.cuanin.com</td>
        <td class="px-4 py-3 text-slate-300">${t.owner_name} (${t.phone})</td>
        <td class="px-4 py-3 text-slate-400">${t.bank_name} ${t.bank_account_number}</td>
        <td class="px-4 py-3 font-extrabold text-amber-400">Rp ${Number(t.balance_held).toLocaleString('id-ID')}</td>
        <td class="px-4 py-3 font-extrabold text-emerald-400">Rp ${Number(t.balance_active).toLocaleString('id-ID')}</td>
        <td class="px-4 py-3 text-right">
          <a href="/toko/${t.subdomain}" target="_blank" class="text-xs font-bold text-brand-400 hover:underline">
            Buka Toko &rarr;
          </a>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function triggerAutoConfirmWorker(force = true) {
  const adminToken = sessionStorage.getItem('cuanin_admin_token');
  if (!adminToken) {
    showToast('Autentikasi Superadmin diperlukan', 'error');
    return;
  }

  try {
    const res = await fetch('/api/admin/run-escrow-worker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ forceSimulateAll: force })
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Worker gagal dijalankan', 'error');
      return;
    }

    showToast(json.message, 'success');
    loadSuperadmin();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSuperadmin();
});


let currentStoreSnapToken = null;
let currentStoreRedirectUrl = null;

function triggerStoreSnapPayment() {
  if (currentStoreSnapToken && window.snap) {
    window.snap.pay(currentStoreSnapToken, {
      onSuccess: function(result) {
        simulateMidtransWebhookPayment();
      },
      onPending: function(result) {
        showToast('Menunggu pembayaran diselesaikan', 'info');
      },
      onError: function(result) {
        showToast('Pembayaran Midtrans tidak berhasil', 'error');
      },
      onClose: function() {
        showToast('Jendela Midtrans ditutup. Anda dapat membayar via QRIS.', 'info');
      }
    });
  } else if (currentStoreRedirectUrl) {
    window.open(currentStoreRedirectUrl, '_blank');
  } else {
    showToast('Layanan Midtrans Snap siap digunakan.', 'info');
  }
}

// Cuanin Dedicated Storefront Client Logic
let currentSubdomain = 'kopisenja';
let currentCart = [];
let activeOrder = null;

// Determine subdomain from host or URL path
const host = window.location.host.split(':')[0].toLowerCase();
const hostParts = host.split('.');
if (hostParts.length > (host.includes('localhost') ? 1 : 2) && !['www', 'api', 'cuan', 'cuanin', 'localhost', '127'].includes(hostParts[0])) {
  currentSubdomain = hostParts[0];
} else {
  const match = window.location.pathname.match(/\/toko\/([^\/]+)/);
  if (match) {
    currentSubdomain = match[1];
  }
}

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

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('hidden');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('hidden');
}

function openOwnerDashboardModal() {
  openModal('modal-owner-dashboard');
  loadUmkmDashboard();
}

function switchDemoStore(newSubdomain) {
  window.location.href = `/toko/${newSubdomain}`;
}

async function loadStorefront() {
  const browserBar = document.getElementById('browser-url-bar');
  if (browserBar) browserBar.textContent = `https://${currentSubdomain}.cuanin.com`;

  const switcher = document.getElementById('quick-store-switcher');
  if (switcher) switcher.value = currentSubdomain;

  const container = document.getElementById('sf-product-list');
  if (!container) return;
  container.innerHTML = '<div class="col-span-2 text-center py-8 text-xs text-slate-400">Memuat katalog produk toko...</div>';

  try {
    const res = await fetch(`/api/store/${currentSubdomain}`);
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Toko tidak ditemukan', 'error');
      return;
    }

    const { store, products } = json.data;
    
    // Store profile
    document.getElementById('sf-store-name').textContent = store.name;
    document.getElementById('sf-store-avatar').textContent = store.name.charAt(0).toUpperCase();
    document.getElementById('sf-store-badge').textContent = store.template_category || 'Katalog UMKM';
    document.getElementById('sf-store-origin').textContent = `Pengiriman dari ${store.origin_city}`;
    document.getElementById('sf-product-count').textContent = `${products.length} Produk Siap Beli`;
    document.getElementById('sf-banner-title').textContent = `Koleksi Resmi ${store.name}`;

    // Dynamic Hero Background depending on template
    const heroBg = document.getElementById('sf-hero-bg');
    if (heroBg) {
      if (store.template_id === 'tpl-fashion') {
        heroBg.style.backgroundImage = 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80")';
        document.getElementById('sf-banner-tagline').textContent = 'Koleksi Busana Muslimah Elegan, Nyaman, dan Bersahaja Karya Desainer Lokal.';
      } else if (store.template_id === 'tpl-kriya') {
        heroBg.style.backgroundImage = 'url("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80")';
        document.getElementById('sf-banner-tagline').textContent = 'Kerajinan Tangan Estetik Berkelanjutan dari Kayu Jati & Anyaman Bambu Alami.';
      } else if (store.template_id === 'tpl-beauty') {
        heroBg.style.backgroundImage = 'url("https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80")';
        document.getElementById('sf-banner-tagline').textContent = 'Formula Perawatan Kulit Alami Berbasis Ekstrak Rempah & Kelapa Murni Bali.';
      } else if (store.template_id === 'tpl-gadget') {
        heroBg.style.backgroundImage = 'url("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80")';
        document.getElementById('sf-banner-tagline').textContent = 'Perlengkapan Gawai & Audio Berkualitas Tinggi dengan Garansi Resmi Toko.';
      } else if (store.template_id === 'tpl-florist') {
        heroBg.style.backgroundImage = 'url("https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80")';
        document.getElementById('sf-banner-tagline').textContent = 'Koleksi Tanaman Hias Hijau Segar & Rangkaian Bunga Alami untuk Ruang Hidup Anda.';
      } else {
        heroBg.style.backgroundImage = 'url("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80")';
        document.getElementById('sf-banner-tagline').textContent = 'Koleksi Biji Kopi Sangrai Artisan & Seduhan Segar Langsung dari Petani Lokal.';
      }
    }

    // Set Owner Login Email Hint
    const loginEmailInput = document.getElementById('owner-login-email');
    if (loginEmailInput) {
      loginEmailInput.value = store.email || `owner@${currentSubdomain}.com`;
    }

    if (products.length === 0) {
      container.innerHTML = '<div class="col-span-2 text-center py-8 text-xs text-slate-400">Toko ini belum menambahkan produk.</div>';
      return;
    }

    container.innerHTML = products.map((prod, idx) => {
      const isTopSeller = idx === 0 || idx === 1;
      return `
        <div class="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-brand-500 hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div class="h-48 w-full bg-slate-100 overflow-hidden relative">
              <img src="${prod.image_url}" alt="${prod.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              ${isTopSeller ? '<span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">Terlaris</span>' : ''}
              <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/75 text-white backdrop-blur-xs">
                ${prod.weight_grams}g
              </span>
            </div>
            <div class="p-5 space-y-2">
              <div class="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                ★ 4.9 <span class="text-slate-400 font-normal">(120+ Terjual)</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm leading-snug line-clamp-2">${prod.name}</h4>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">${prod.description || ''}</p>
            </div>
          </div>

          <div class="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">Harga Produk:</span>
              <span class="text-base font-extrabold text-brand-600">Rp ${Number(prod.price).toLocaleString('id-ID')}</span>
            </div>
            <button onclick="addToCart(${JSON.stringify(prod).replace(/"/g, '&quot;')})" class="btn-pill-primary text-xs py-2 px-4 shadow-xs">
              + Keranjang
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="col-span-2 text-center py-8 text-xs text-rose-500">Gagal memuat produk: ${err.message}</div>`;
  }
}

function addToCart(product) {
  const existing = currentCart.find(it => it.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    currentCart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      weight_grams: Number(product.weight_grams) || 250,
      quantity: 1
    });
  }
  renderCart();
  showToast(`"${product.name}" dimasukkan ke keranjang belanja`, 'success');
}

function updateCartQuantity(productId, delta) {
  const item = currentCart.find(it => it.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    currentCart = currentCart.filter(it => it.id !== productId);
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-item-count-badge');
  if (!container) return;

  const totalItems = currentCart.reduce((sum, it) => sum + it.quantity, 0);
  if (countBadge) countBadge.textContent = `${totalItems} Item`;

  if (currentCart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400 text-xs">
        Keranjang belanja masih kosong.
      </div>
    `;
    updateCartTotals();
    return;
  }

  container.innerHTML = currentCart.map(item => `
    <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
      <div class="flex-1 min-w-0">
        <span class="font-bold text-slate-900 block truncate">${item.name}</span>
        <span class="text-slate-500 text-[11px]">Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <button onclick="updateCartQuantity(${item.id}, -1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100">-</button>
        <span class="font-bold text-slate-900 px-1 text-xs">${item.quantity}</span>
        <button onclick="updateCartQuantity(${item.id}, 1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100">+</button>
      </div>
    </div>
  `).join('');

  updateCartTotals();
}

function updateCartTotals() {
  let subtotal = 0;
  let totalWeightGrams = 0;

  currentCart.forEach(it => {
    subtotal += it.price * it.quantity;
    totalWeightGrams += it.weight_grams * it.quantity;
  });

  const weightKg = Math.max(1, Math.ceil(totalWeightGrams / 1000));
  const courierSelect = document.getElementById('checkout-courier');
  const courier = courierSelect ? courierSelect.value : 'JNE Regular';
  const ratePerKg = courier.includes('Express') ? 22000 : 12000;
  const shippingCost = currentCart.length > 0 ? weightKg * ratePerKg : 0;

  const base = subtotal + shippingCost;
  const surcharge = Math.round(base * 0.04);
  const totalPaid = base + surcharge;

  const subtotalEl = document.getElementById('cart-subtotal');
  const weightLabelEl = document.getElementById('cart-weight-label');
  const shippingEl = document.getElementById('cart-shipping');
  const surchargeEl = document.getElementById('cart-surcharge');
  const totalPaidEl = document.getElementById('cart-total-paid');

  if (subtotalEl) subtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
  if (weightLabelEl) weightLabelEl.textContent = `Ongkos Kirim (${weightKg} kg)`;
  if (shippingEl) shippingEl.textContent = `Rp ${shippingCost.toLocaleString('id-ID')}`;
  if (surchargeEl) surchargeEl.textContent = `+ Rp ${surcharge.toLocaleString('id-ID')}`;
  if (totalPaidEl) totalPaidEl.textContent = `Rp ${totalPaid.toLocaleString('id-ID')}`;

  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) {
    btnCheckout.disabled = currentCart.length === 0;
  }
}

async function performCheckout() {
  if (currentCart.length === 0) {
    showToast('Keranjang belanja kosong', 'error');
    return;
  }

  const courier = document.getElementById('checkout-courier').value;
  const address = document.getElementById('checkout-address').value.trim() || 'Bandung, Jawa Barat';

  try {
    const res = await fetch(`/api/store/${currentSubdomain}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: null,
        items: currentCart,
        courier_name: courier,
        destination_city: address
      })
    });

    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Checkout gagal', 'error');
      return;
    }

    activeOrder = json.data.order;
    currentStoreSnapToken = json.data.snap ? json.data.snap.token : null;
    currentStoreRedirectUrl = json.data.snap ? json.data.snap.redirectUrl : null;
    currentCart = [];
    renderCart();

    // Auto-launch official Midtrans Snap pop-up only in Sandbox mode
    if (currentStoreSnapToken && window.snap && json.data.snap && json.data.snap.isSandbox) {
      setTimeout(() => {
        triggerStoreSnapPayment();
      }, 500);
    }

    document.getElementById('qris-invoice-title').textContent = json.data.qrisPayment.invoiceNumber;
    document.getElementById('qris-amount-display').textContent = `Rp ${Number(json.data.qrisPayment.totalAmount).toLocaleString('id-ID')}`;
    document.getElementById('qris-image').src = json.data.qrisPayment.qrDataUrl;
    document.getElementById('modal-qris-payment').dataset.currentInvoice = json.data.qrisPayment.invoiceNumber;

    openModal('modal-qris-payment');
    displayOrderTracking(activeOrder.invoice_number);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function simulateMidtransWebhookPayment() {
  const modal = document.getElementById('modal-qris-payment');
  const invoice = modal.dataset.currentInvoice;
  if (!invoice) return;

  try {
    const res = await fetch('/api/midtrans/simulate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_number: invoice })
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Simulasi webhook gagal', 'error');
      return;
    }

    closeModal('modal-qris-payment');
    showToast(`Pembayaran ${invoice} Berhasil! Status: Diproses Toko. Uang tertahan di escrow Cuanin.`, 'success');
    displayOrderTracking(invoice);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function displayOrderTracking(invoice) {
  const card = document.getElementById('customer-order-tracking-card');
  if (!card) return;

  try {
    const res = await fetch(`/api/orders/${invoice}`);
    const json = await res.json();
    if (!json.success) return;

    const ord = json.data;
    activeOrder = ord;
    card.classList.remove('hidden');

    document.getElementById('track-invoice').textContent = ord.invoice_number;
    document.getElementById('track-status-badge').textContent = ord.status;

    const resiEl = document.getElementById('track-resi');
    resiEl.textContent = ord.tracking_number || 'Menunggu penyerahan barang ke kurir';
    document.getElementById('track-courier').textContent = ord.courier;

    const escrowStatusEl = document.getElementById('track-escrow-status');
    const escrowAmountEl = document.getElementById('track-escrow-amount');
    const btnConfirm = document.getElementById('btn-confirm-receipt');

    const totalHeld = Number(ord.subtotal_product) + Number(ord.shipping_cost);

    // Update 4-step progress tracker
    const stepPaid = document.getElementById('step-track-paid');
    const stepProc = document.getElementById('step-track-processing');
    const stepShip = document.getElementById('step-track-shipped');
    const stepDone = document.getElementById('step-track-completed');

    if (ord.status === 'SELESAI') {
      stepPaid.className = 'space-y-1.5 text-emerald-600 font-bold';
      stepProc.className = 'space-y-1.5 text-emerald-600 font-bold';
      stepShip.className = 'space-y-1.5 text-emerald-600 font-bold';
      stepDone.className = 'space-y-1.5 text-emerald-600 font-bold';
      stepDone.querySelector('div').className = 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold';
      stepDone.querySelector('div').textContent = '✓';

      escrowStatusEl.textContent = 'DANA SUDAH DICAIRKAN (RELEASED)';
      escrowStatusEl.className = 'text-sm font-bold text-emerald-700 mt-1 block';
      escrowAmountEl.textContent = `Dana Rp ${totalHeld.toLocaleString('id-ID')} telah dicairkan ke saldo toko`;
      btnConfirm.disabled = true;
      btnConfirm.textContent = 'Pesanan Selesai';
    } else if (ord.status === 'DIKIRIM') {
      stepPaid.className = 'space-y-1.5 text-brand-600 font-bold';
      stepProc.className = 'space-y-1.5 text-brand-600 font-bold';
      stepShip.className = 'space-y-1.5 text-brand-600 font-bold';
      stepShip.querySelector('div').className = 'w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto text-xs font-bold';
      stepShip.querySelector('div').textContent = '3';
      stepDone.className = 'space-y-1.5 text-slate-400 font-bold';

      escrowStatusEl.textContent = 'DITAHAN DI ESCROW (HELD)';
      escrowStatusEl.className = 'text-sm font-bold text-brand-700 mt-1 block';
      escrowAmountEl.textContent = `Rp ${totalHeld.toLocaleString('id-ID')} aman di rekening bersama Cuanin`;
      btnConfirm.disabled = false;
      btnConfirm.textContent = 'Konfirmasi Barang Diterima';
    } else {
      stepPaid.className = 'space-y-1.5 text-brand-600 font-bold';
      stepProc.className = 'space-y-1.5 text-brand-600 font-bold';
      stepProc.querySelector('div').className = 'w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto text-xs font-bold';
      stepProc.querySelector('div').textContent = '2';
      stepShip.className = 'space-y-1.5 text-slate-400 font-bold';
      stepDone.className = 'space-y-1.5 text-slate-400 font-bold';

      escrowStatusEl.textContent = 'DITAHAN DI ESCROW (HELD)';
      escrowStatusEl.className = 'text-sm font-bold text-brand-700 mt-1 block';
      escrowAmountEl.textContent = `Rp ${totalHeld.toLocaleString('id-ID')} aman di rekening bersama Cuanin`;
      btnConfirm.disabled = true;
      btnConfirm.textContent = 'Menunggu Pengiriman Kurir';
    }
  } catch (err) {
    console.error('Tracking fetch error:', err);
  }
}

async function confirmOrderReceived() {
  if (!activeOrder) return;
  try {
    const res = await fetch(`/api/orders/${activeOrder.id}/confirm-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Gagal konfirmasi pesanan', 'error');
      return;
    }

    showToast('Barang berhasil dikonfirmasi diterima. Dana telah dicairkan ke saldo aktif pemilik toko!', 'success');
    displayOrderTracking(activeOrder.invoice_number);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function performOwnerLogin(e) {
  e.preventDefault();
  const email = document.getElementById('owner-login-email').value.trim();
  const password = document.getElementById('owner-login-password').value;

  try {
    const res = await fetch(`/api/tenant/${currentSubdomain}/owner-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Login pemilik toko gagal', 'error');
      return;
    }

    sessionStorage.setItem(`cuanin_owner_${currentSubdomain}`, json.token);
    showToast(`Selamat datang, ${json.tenant.owner_name}!`, 'success');
    loadUmkmDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function performOwnerLogout() {
  sessionStorage.removeItem(`cuanin_owner_${currentSubdomain}`);
  showToast('Sesi pemilik toko telah keluar.', 'info');
  loadUmkmDashboard();
}

async function loadUmkmDashboard() {
  const token = sessionStorage.getItem(`cuanin_owner_${currentSubdomain}`);
  const loginGate = document.getElementById('umkm-login-gate');
  const authDash = document.getElementById('umkm-authenticated-dashboard');

  if (!token) {
    if (loginGate) loginGate.classList.remove('hidden');
    if (authDash) authDash.classList.add('hidden');
    return;
  }

  if (loginGate) loginGate.classList.add('hidden');
  if (authDash) authDash.classList.remove('hidden');

  try {
    const res = await fetch(`/api/tenant/${currentSubdomain}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem(`cuanin_owner_${currentSubdomain}`);
      if (loginGate) loginGate.classList.remove('hidden');
      if (authDash) authDash.classList.add('hidden');
      return;
    }

    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Gagal memuat dashboard UMKM', 'error');
      return;
    }

    const { tenant, orders, payouts } = json.data;
    document.getElementById('umkm-store-title').textContent = tenant.name;
    document.getElementById('umkm-store-name').textContent = `Rekening Payout: ${tenant.bank_name} ${tenant.bank_account_number} (${tenant.bank_account_holder})`;
    document.getElementById('umkm-balance-held').textContent = `Rp ${Number(tenant.balance_held).toLocaleString('id-ID')}`;
    document.getElementById('umkm-balance-active').textContent = `Rp ${Number(tenant.balance_active).toLocaleString('id-ID')}`;

    const payoutStatusEl = document.getElementById('umkm-payout-status');
    if (payouts && payouts.length > 0) {
      const last = payouts[0];
      payoutStatusEl.innerHTML = `<span class="text-emerald-700 font-bold">Sukses Rp ${Number(last.amount).toLocaleString('id-ID')}</span> ke ${last.bank_name} (${last.reference_id})`;
    } else {
      payoutStatusEl.textContent = 'Belum ada riwayat penarikan';
    }

    const tbody = document.getElementById('umkm-orders-table-body');
    if (!orders || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">Belum ada pesanan masuk untuk toko ini.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(ord => {
      const netAmount = Number(ord.subtotal_product) + Number(ord.shipping_cost);
      let actionBtn = '-';
      if (ord.status === 'DIPROSES_TOKO') {
        actionBtn = `<button onclick="openShipOrderModal(${ord.id}, '${ord.courier}')" class="btn-pill-primary text-xs py-1.5 px-3">Kirim & Input Resi</button>`;
      } else if (ord.status === 'DIKIRIM') {
        actionBtn = `<span class="text-xs text-amber-700 font-bold">Dalam Pengiriman Kurir</span>`;
      } else if (ord.status === 'SELESAI') {
        actionBtn = `<span class="text-xs text-emerald-700 font-bold">Dana Cair (Selesai)</span>`;
      }

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-4 py-3 font-mono font-bold text-slate-900">${ord.invoice_number}</td>
          <td class="px-4 py-3 font-medium text-slate-900">${ord.customer_name || 'Pembeli Tamu'}</td>
          <td class="px-4 py-3 font-extrabold text-brand-600">Rp ${netAmount.toLocaleString('id-ID')}</td>
          <td class="px-4 py-3 text-slate-600">${ord.courier}</td>
          <td class="px-4 py-3">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ord.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' : ord.status === 'DIKIRIM' ? 'bg-blue-100 text-blue-800' : ord.status === 'DIPROSES_TOKO' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}">
              ${ord.status}
            </span>
          </td>
          <td class="px-4 py-3 font-mono text-slate-700">${ord.tracking_number || '-'}</td>
          <td class="px-4 py-3 text-right">${actionBtn}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openShipOrderModal(orderId, courier) {
  document.getElementById('ship-order-id').value = orderId;
  document.getElementById('ship-courier').value = courier;
  document.getElementById('ship-tracking-number').value = `RESI-${courier.split(' ')[0]}-${Date.now().toString().slice(-8)}`;
  openModal('modal-ship-order');
}

async function submitShippingOrder() {
  const orderId = document.getElementById('ship-order-id').value;
  const courier = document.getElementById('ship-courier').value.trim();
  const tracking_number = document.getElementById('ship-tracking-number').value.trim();
  const token = sessionStorage.getItem(`cuanin_owner_${currentSubdomain}`);

  if (!tracking_number) {
    showToast('Nomor resi wajib diisi', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/tenant/${currentSubdomain}/orders/${orderId}/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courier, tracking_number })
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Gagal update status resi', 'error');
      return;
    }

    closeModal('modal-ship-order');
    showToast('Pesanan diserahkan ke kurir dan nomor resi terbit.', 'success');
    loadUmkmDashboard();
    if (activeOrder && activeOrder.id == orderId) {
      displayOrderTracking(activeOrder.invoice_number);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openWithdrawModal() {
  const activeBalText = document.getElementById('umkm-balance-active').textContent;
  document.getElementById('withdraw-available-balance').textContent = activeBalText;
  document.getElementById('withdraw-amount').value = '';
  openModal('modal-withdraw');
}

async function submitWithdrawPayout() {
  const amount = Number(document.getElementById('withdraw-amount').value);
  const token = sessionStorage.getItem(`cuanin_owner_${currentSubdomain}`);

  if (!amount || amount < 10000) {
    showToast('Jumlah penarikan minimal Rp 10.000', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/tenant/${currentSubdomain}/payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Pencairan dana gagal', 'error');
      return;
    }

    closeModal('modal-withdraw');
    showToast(`Pencairan dana Rp ${amount.toLocaleString('id-ID')} via Midtrans Iris berhasil dikirimkan!`, 'success');
    loadUmkmDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddProductModal() {
  openModal('modal-add-product');
}

async function submitNewProduct(e) {
  e.preventDefault();
  const name = document.getElementById('prod-name').value.trim();
  const price = Number(document.getElementById('prod-price').value);
  const weight_grams = Number(document.getElementById('prod-weight').value) || 250;
  const description = document.getElementById('prod-desc').value.trim();
  const token = sessionStorage.getItem(`cuanin_owner_${currentSubdomain}`);

  try {
    const res = await fetch(`/api/store/${currentSubdomain}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, weight_grams, description })
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Gagal menambahkan produk', 'error');
      return;
    }

    closeModal('modal-add-product');
    showToast(`Produk "${name}" berhasil ditambahkan!`, 'success');
    document.getElementById('form-add-product').reset();
    loadStorefront();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadStorefront();
});

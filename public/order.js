
let currentSnapToken = null;
let isSnapOpen = false;

function triggerSnapPayment() {
  if (isSnapOpen) return;
  if (currentSnapToken && window.snap) {
    isSnapOpen = true;
    window.snap.pay(currentSnapToken, {
      onSuccess: function(result) {
        isSnapOpen = false;
        handleSimulatePaymentSuccess();
      },
      onPending: function(result) {
        isSnapOpen = false;
        showToast('Menunggu pembayaran diselesaikan di Midtrans', 'info');
      },
      onError: function(result) {
        isSnapOpen = false;
        showToast('Pembayaran Midtrans tidak berhasil diselesaikan', 'error');
      },
      onClose: function() {
        isSnapOpen = false;
        showToast('Jendela Midtrans ditutup. Anda dapat membayar melalui scan QRIS di layar.', 'info');
      }
    });
  } else if (currentOrderData && currentOrderData.redirectUrl) {
    window.open(currentOrderData.redirectUrl, '_blank');
  } else {
    showToast('Layanan Midtrans Snap siap digunakan.', 'info');
  }
}

// Cuanin Dedicated Order Page Logic
let selectedPackageSlug = 'pro';
let selectedPackagePrice = 349000;
let selectedPackageTitle = 'Paket Pro Toko Cuanin';

let selectedTemplateId = 'tpl-kuliner';
let selectedTemplateTitle = 'Katalog Kuliner & Kopi Artisan';
let selectedTemplateCategory = 'Kuliner & F&B';

let currentOrderData = null;

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

function selectPackage(slug, price, title) {
  selectedPackageSlug = slug;
  selectedPackagePrice = price;
  selectedPackageTitle = title;

  document.querySelectorAll('.package-option-card').forEach(card => {
    card.classList.remove('border-brand-600', 'bg-brand-50/50', 'selected-package');
    card.classList.add('border-slate-200');
    const dot = card.querySelector('.package-radio-dot');
    if (dot) {
      dot.className = 'w-4 h-4 rounded-full border-2 border-slate-300 package-radio-dot flex items-center justify-center';
      dot.innerHTML = '';
    }
  });

  const activeCard = event && event.currentTarget && event.currentTarget.classList.contains('package-option-card')
    ? event.currentTarget
    : document.querySelector(`input[value="${slug}"]`)?.closest('.package-option-card');

  if (activeCard) {
    activeCard.classList.remove('border-slate-200');
    activeCard.classList.add('border-brand-600', 'bg-brand-50/50', 'selected-package');
    const dot = activeCard.querySelector('.package-radio-dot');
    if (dot) {
      dot.className = 'w-4 h-4 rounded-full border-2 border-brand-600 bg-brand-600 package-radio-dot flex items-center justify-center';
      dot.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-white"></span>';
    }
  }

  document.getElementById('summary-package-name').textContent = title;
  document.getElementById('summary-package-cost').textContent = `Rp ${price.toLocaleString('id-ID')}`;
  document.getElementById('summary-total-due').textContent = `Rp ${price.toLocaleString('id-ID')}`;
}

function selectTemplate(templateId, title, category) {
  selectedTemplateId = templateId;
  selectedTemplateTitle = title;
  selectedTemplateCategory = category;

  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.remove('border-brand-600', 'shadow-xs', 'selected-template');
    card.classList.add('border-slate-200');
  });

  const activeCard = event && event.currentTarget && event.currentTarget.classList.contains('template-card')
    ? event.currentTarget
    : document.querySelector(`.template-card[onclick*="${templateId}"]`);

  if (activeCard) {
    activeCard.classList.remove('border-slate-200');
    activeCard.classList.add('border-brand-600', 'shadow-xs', 'selected-template');
  }

  document.getElementById('summary-template-badge').textContent = category;
}

let subdomainDebounceTimer = null;
function handleSubdomainChange(value) {
  const clean = (value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  document.getElementById('input-subdomain').value = clean;
  document.getElementById('subdomain-preview-text').textContent = clean || 'namatoko';
  document.getElementById('summary-live-subdomain').textContent = `https://${clean || 'namatoko'}.cuanin.com`;

  clearTimeout(subdomainDebounceTimer);
  subdomainDebounceTimer = setTimeout(async () => {
    if (clean.length < 3) {
      document.getElementById('subdomain-status-msg').innerHTML = `
        <span class="text-amber-600 font-semibold">Minimal 3 karakter untuk subdomain.</span>
      `;
      return;
    }

    try {
      const res = await fetch(`/api/platform/check-subdomain/${clean}`);
      const json = await res.json();
      if (json.available) {
        document.getElementById('subdomain-status-msg').innerHTML = `
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          <span class="text-emerald-700 font-semibold">Alamat https://<strong>${clean}</strong>.cuanin.com tersedia dan siap digunakan!</span>
        `;
      } else {
        document.getElementById('subdomain-status-msg').innerHTML = `
          <span class="text-rose-600 font-semibold">Subdomain "${clean}" sudah digunakan. Silakan gunakan nama lain.</span>
        `;
      }
    } catch (err) {
      // ignore
    }
  }, 350);
}

function handleStoreNameChange(value) {
  document.getElementById('summary-store-title').textContent = value.trim() || 'Toko Berkah Nusantara';
}

async function handleOrderSubmit(e) {
  e.preventDefault();

  const subdomain = document.getElementById('input-subdomain').value.trim();
  const store_name = document.getElementById('input-store-name').value.trim();
  const origin_city = document.getElementById('input-origin-city').value.trim();
  const owner_name = document.getElementById('input-owner-name').value.trim();
  const phone = document.getElementById('input-phone').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const owner_password = document.getElementById('input-password').value;
  const bank_name = document.getElementById('select-bank-name').value;
  const bank_account_number = document.getElementById('input-account-number').value.trim();

  if (!subdomain || subdomain.length < 3) {
    showToast('Subdomain minimal 3 karakter alfanumerik', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-order');
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Memproses Aktivasi Toko & Menerbitkan QRIS...';

  try {
    const res = await fetch('/api/platform/order-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: selectedTemplateId,
        package_price: selectedPackagePrice,
        subdomain,
        store_name,
        origin_city,
        owner_name,
        phone,
        email,
        owner_password,
        bank_name,
        bank_account_number,
        bank_account_holder: owner_name
      })
    });

    const json = await res.json();
    if (!json.success) {
      showToast(json.error || 'Pemesanan website gagal', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Lanjut ke Pembayaran QRIS Midtrans</span>';
      return;
    }

    currentSnapToken = json.snap ? json.snap.token : null;
    currentOrderData = {
      tenant: json.tenant,
      qrisPayment: json.qrisPayment,
      snap: json.snap,
      redirectUrl: json.snap ? json.snap.redirectUrl : null
    };

    // Auto-launch official Midtrans Snap pop-up only in Sandbox mode where channels are pre-activated
    if (currentSnapToken && window.snap && json.snap && json.snap.isSandbox) {
      setTimeout(() => {
        triggerSnapPayment();
      }, 500);
    }

    // Transition to Payment Stage
    document.getElementById('order-flow-container').classList.add('hidden');
    document.getElementById('payment-stage-container').classList.remove('hidden');

    document.getElementById('pay-invoice-number').textContent = json.qrisPayment.invoiceNumber;
    document.getElementById('pay-subdomain-target').textContent = `https://${json.tenant.subdomain}.cuanin.com`;
    document.getElementById('pay-total-amount').textContent = `Rp ${selectedPackagePrice.toLocaleString('id-ID')}`;
    document.getElementById('pay-qris-image').src = json.qrisPayment.qrDataUrl;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Pesanan berhasil dibuat. Silakan scan QRIS untuk aktivasi.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Lanjut ke Pembayaran QRIS Midtrans</span>';
  }
}

function handleSimulatePaymentSuccess() {
  if (!currentOrderData) return;

  const tenant = currentOrderData.tenant;

  // Transition to Celebration Stage
  document.getElementById('payment-stage-container').classList.add('hidden');
  document.getElementById('success-stage-container').classList.remove('hidden');

  const storeUrl = `/toko/${tenant.subdomain}`;
  const fullDomain = `https://${tenant.subdomain}.cuanin.com`;

  document.getElementById('success-store-url').textContent = fullDomain;
  document.getElementById('success-store-url').href = storeUrl;
  document.getElementById('success-owner-email').textContent = tenant.email;
  document.getElementById('btn-open-new-store').href = storeUrl;

  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast(`Pembayaran Berhasil! Website ${tenant.subdomain}.cuanin.com aktif sekarang.`, 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const pkg = params.get('package');
  const tpl = params.get('template');

  if (pkg === 'starter') {
    selectPackage('starter', 199000, 'Paket Starter UMKM');
  } else if (pkg === 'scale') {
    selectPackage('scale', 699000, 'Paket Scale & Domain');
  } else {
    selectPackage('pro', 349000, 'Paket Pro Toko Cuanin');
  }

  if (tpl === 'tpl-fashion') {
    selectTemplate('tpl-fashion', 'Butik & Fashion Muslim Modern', 'Fashion & Busana');
  } else if (tpl === 'tpl-kriya') {
    selectTemplate('tpl-kriya', 'Galeri Kriya & Kerajinan Kayu', 'Kriya & Handicraft');
  } else if (tpl === 'tpl-beauty') {
    selectTemplate('tpl-beauty', 'Skincare Alami & Herbal Nusantara', 'Kecantikan & Herbal');
  } else if (tpl === 'tpl-gadget') {
    selectTemplate('tpl-gadget', 'Elektronik & Aksesoris Gadget', 'Gadget & Elektronik');
  } else if (tpl === 'tpl-florist') {
    selectTemplate('tpl-florist', 'Toko Tanaman Hias & Florist Segar', 'Tanaman & Florist');
  } else {
    selectTemplate('tpl-kuliner', 'Katalog Kuliner & Kopi Artisan', 'Kuliner & F&B');
  }
});

// Cuanin Platform Main Landing Client Script
const demoSubdomainMap = {
  'tpl-kuliner': { subdomain: 'kopisenja', name: 'Kopi Senja Nusantara', url: '/toko/kopisenja' },
  'tpl-fashion': { subdomain: 'butikaisyah', name: 'Butik Aisyah Modest', url: '/toko/butikaisyah' },
  'tpl-kriya': { subdomain: 'kriyabambu', name: 'Kriya Bambu & Kayu', url: '/toko/kriyabambu' },
  'tpl-beauty': { subdomain: 'naturaherbal', name: 'Natura Herbal Skincare', url: '/toko/naturaherbal' },
  'tpl-gadget': { subdomain: 'gadgetpedia', name: 'GadgetPedia Aksesoris', url: '/toko/gadgetpedia' },
  'tpl-florist': { subdomain: 'kebunkita', name: 'Kebun Kita Florist', url: '/toko/kebunkita' }
};

async function loadTemplates() {
  const container = document.getElementById('template-catalog-grid');
  if (!container) return;

  try {
    const res = await fetch('/api/templates');
    const json = await res.json();
    if (!json.success || !json.data) return;

    container.innerHTML = json.data.map(tpl => {
      const demo = demoSubdomainMap[tpl.id] || { subdomain: 'kopisenja', name: 'Contoh Toko', url: '/toko/kopisenja' };

      return `
        <div class="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-xl hover:border-brand-500 transition-all duration-300">
          <div>
            <div class="h-52 w-full bg-slate-100 overflow-hidden relative">
              <img src="${tpl.image_url}" alt="${tpl.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/85 text-white backdrop-blur-xs">
                ${tpl.category}
              </span>
              <a href="${demo.url}" target="_blank" class="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm hover:bg-brand-600 hover:text-white transition-all flex items-center gap-1.5">
                <span>Buka Demo</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
            <div class="p-6 sm:p-7 space-y-2">
              <h3 class="font-bold text-slate-900 text-lg leading-snug group-hover:text-brand-600 transition-colors">${tpl.name}</h3>
              <p class="text-xs text-slate-500 line-clamp-3 leading-relaxed">${tpl.description}</p>
            </div>
          </div>

          <div class="p-6 sm:p-7 pt-0 border-t border-slate-100 mt-2 flex flex-col gap-3">
            <div class="flex items-center justify-between text-xs">
              <div>
                <span class="text-[11px] font-semibold text-slate-400 block">Format Alamat Toko:</span>
                <span class="font-mono font-bold text-brand-600">${demo.subdomain}.cuanin.com</span>
              </div>
              <a href="${demo.url}" target="_blank" class="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1">
                <span>Lihat Contoh Toko</span>
                &rarr;
              </a>
            </div>

            <a href="/order?template=${tpl.id}" class="btn-pill-primary text-xs py-2.5 px-4 w-full text-center block shadow-xs">
              Pilih Template & Pesan Web &rarr;
            </a>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="col-span-3 text-center py-8 text-rose-500 text-xs">Gagal memuat template: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTemplates();
});

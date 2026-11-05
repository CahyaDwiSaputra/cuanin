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

document.addEventListener("DOMContentLoaded", () => {
  loadTemplates();
});

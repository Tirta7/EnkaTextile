import { useState, useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface ShopProduct {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string | null;
  imageUrl: string | null;
  description: string | null;
  primaryUnit: string;
  secondaryUnit: string;
  pricePerMeter: number;
  pricePerRoll: number | null;
  rollStock: number;
  meterStock: number;
  inStock: boolean;
}

interface ShopProductDetail extends ShopProduct {
  availableSizes: { length: number; count: number }[];
  totalRolls: number;
}

interface ShopCategory {
  id: number;
  name: string;
  description: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const API_BASE = window.location.origin;

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Warna kategori yang konsisten
const CATEGORY_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
];

function getCategoryColor(id: number) {
  return CATEGORY_COLORS[id % CATEGORY_COLORS.length];
}

// ─── Image placeholder ────────────────────────────────────────────────────────
function ProductImage({ src, name, className = "" }: { src: string | null; name: string; className?: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-1 ${className}`}>
        <span className="text-3xl">🧵</span>
        <span className="text-[10px] text-slate-400 font-medium text-center px-2 leading-tight">{name}</span>
      </div>
    );
  }

  let actualSrc = src;
  if (actualSrc && actualSrc.startsWith("/uploads/")) {
    actualSrc = `/api${actualSrc}`;
  }
  if (actualSrc && !actualSrc.startsWith("http")) {
    actualSrc = `${API_BASE}${actualSrc}`;
  }

  return (
    <img
      src={actualSrc}
      alt={name}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
function BottomSheet({ product, onClose, whatsapp }: { product: ShopProductDetail | null; onClose: () => void; whatsapp: string }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  useEffect(() => {
    if (product) setSelectedSize(null);
  }, [product]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const orderMessage = () => {
    const size = selectedSize ? `${selectedSize} ${product?.primaryUnit}` : "bebas ukuran";
    return encodeURIComponent(
      `Halo EnkaTextile! 👋\n\nSaya tertarik dengan:\n*${product?.name}*\nUkuran: ${size}\nHarga: ${formatRupiah(product?.pricePerMeter ?? 0)}/${product?.primaryUnit}\n\nApakah masih tersedia?`
    );
  };

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className="w-full bg-white rounded-t-3xl overflow-hidden"
        style={{
          maxHeight: "88vh",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          animation: "slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(88vh - 28px)" }}>
          {/* Product Image */}
          <div className="relative w-full h-64 bg-slate-100 overflow-hidden">
            <ProductImage src={product.imageUrl} name={product.name} className="w-full h-full" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white/90 text-slate-700 font-bold text-sm px-4 py-1.5 rounded-full">Stok Habis</span>
              </div>
            )}
          </div>

          <div className="px-5 py-4 space-y-5">
            {/* Category & Name */}
            <div>
              {product.categoryName && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(product.categoryId)}`}>
                  {product.categoryName}
                </span>
              )}
              <h2 className="text-xl font-bold text-slate-900 mt-2 leading-tight">{product.name}</h2>
              {product.description && (
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Harga Eceran</span>
                <span className="text-xl font-bold text-rose-600">
                  {formatRupiah(product.pricePerMeter)}
                  <span className="text-sm font-medium text-slate-400">/{product.primaryUnit}</span>
                </span>
              </div>
              {product.pricePerRoll && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 mt-1">
                  <span className="text-sm text-slate-500">
                    {selectedSize ? `Total 1 Roll (${selectedSize} ${product.primaryUnit})` : "Harga Grosir (Beli Roll-an)"}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-base font-bold text-violet-600">
                      {selectedSize ? formatRupiah(product.pricePerRoll * selectedSize) : formatRupiah(product.pricePerRoll)}
                      {!selectedSize && <span className="text-xs font-medium text-slate-400">/{product.primaryUnit}</span>}
                    </span>
                    {selectedSize && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        (Harga grosir {formatRupiah(product.pricePerRoll)}/{product.primaryUnit})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Available Sizes (Roll lengths) */}
            {product.availableSizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Ukuran Tersedia
                  <span className="ml-2 text-xs text-slate-400 font-normal">({product.totalRolls} roll)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSize(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedSize === null
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    Bebas Potong
                  </button>
                  {product.availableSizes.map(size => (
                    <button
                      key={size.length}
                      onClick={() => setSelectedSize(size.length)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        selectedSize === size.length
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {size.length} {product.primaryUnit}
                      <span className="ml-1 text-xs opacity-60">×{size.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? "bg-emerald-400" : "bg-slate-300"}`} />
              <span className="text-sm text-slate-500">
                {product.inStock
                  ? `${product.rollStock} roll tersedia (${product.meterStock.toFixed(1)} ${product.primaryUnit})`
                  : "Stok habis"}
              </span>
            </div>

            {/* WhatsApp Order Button */}
            <a
              href={`https://wa.me/${whatsapp}?text=${orderMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-base transition-transform active:scale-95 ${
                product.inStock
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {product.inStock ? "Pesan via WhatsApp" : "Stok Habis"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onClick }: { product: ShopProduct; onClick: () => void }) {
  const gradientClass = "bg-gradient-to-br from-[#ffcdb2] to-[#ffb4a2]";
  
  return (
    <button
      onClick={onClick}
      className={`text-left ${gradientClass} rounded-[20px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 w-full flex flex-col`}
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
    >
      {/* Image Half */}
      <div className="relative aspect-square w-full overflow-hidden bg-white/60">
        <ProductImage src={product.imageUrl} name={product.name} className="w-full h-full mix-blend-multiply object-cover" />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-semibold text-xs bg-black/60 px-3 py-1.5 rounded-full">Stok Habis</span>
          </div>
        )}
        {product.categoryName && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#2a9d8f] text-white shadow-sm text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Info Half */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-[17px] font-black text-slate-900 leading-tight line-clamp-2">{product.name}</h3>
          
          <div className="flex gap-2 mt-3">
            <div className="flex flex-col items-center justify-center border border-white/40 rounded-lg p-1.5 min-w-[3rem] bg-white/30 backdrop-blur-sm">
              <span className="text-xs font-black text-slate-900 leading-none">{product.rollStock}</span>
              <span className="text-[9px] font-bold text-slate-700 leading-none mt-1 uppercase">Roll</span>
            </div>
            <div className="flex flex-col items-center justify-center border border-white/40 rounded-lg p-1.5 px-3 bg-white/30 backdrop-blur-sm">
              <span className="text-xs font-black text-slate-900 leading-none">{product.meterStock}</span>
              <span className="text-[9px] font-bold text-slate-700 leading-none mt-1 uppercase">{product.primaryUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Price area */}
      <div className="bg-white/40 backdrop-blur-md px-4 py-3 flex justify-between items-center border-t border-white/30">
        <div>
          <p className="text-[9px] text-slate-700 font-bold uppercase mb-0.5">Harga Grosir</p>
          <p className="text-[15px] font-black text-slate-900 leading-none">{formatRupiah(product.pricePerMeter)}<span className="text-[10px] font-bold text-slate-700 ml-0.5">/{product.primaryUnit}</span></p>
        </div>
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm text-red-500 shrink-0 ml-2">
          <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </button>
  );
}

// ─── Main Shop Page ───────────────────────────────────────────────────────────
export default function Shop() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ShopProductDetail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState({ storeName: "EnkaTextile", whatsapp: "" });

  // Load shop settings
  useEffect(() => {
    fetch(`${API_BASE}/api/settings/manifest.json`)
      .then(r => r.json())
      .then(d => {
        if (d.storeName) setShopSettings(s => ({ ...s, storeName: d.storeName }));
        if (d.whatsapp) setShopSettings(s => ({ ...s, whatsapp: d.whatsapp }));
      })
      .catch(() => {});
  }, []);

  // Load categories
  useEffect(() => {
    fetch(`${API_BASE}/api/shop/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Load products
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", String(selectedCategory));
    if (search) params.set("search", search);

    fetch(`${API_BASE}/api/shop/products?${params}`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, search]);

  // Open product detail
  const openProduct = async (product: ShopProduct) => {
    const res = await fetch(`${API_BASE}/api/shop/products/${product.id}`);
    const detail: ShopProductDetail = await res.json();
    setSelectedProduct(detail);
    setSheetOpen(true);
  };

  const inStockProducts = products.filter(p => p.inStock);
  const outOfStockProducts = products.filter(p => !p.inStock);
  const displayProducts = [...inStockProducts, ...outOfStockProducts];

  return (
    <div className="min-h-screen bg-[#fafafa] w-full flex justify-center text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* CSS Overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <div className="w-full max-w-[1440px] flex">
        
        {/* ── Left Sidebar (Desktop) ── */}
        <aside className="hidden lg:flex w-[260px] flex-col shrink-0 h-screen sticky top-0 border-r border-slate-200 bg-[#fafafa] py-6 px-5 z-30">
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500">Selamat pagi, Tamu</span>
              <a href="#" className="text-xs font-black text-rose-600 hover:underline tracking-wide">MASUK / DAFTAR</a>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 flex-1">
            <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white shadow-sm border border-slate-100 text-rose-600 font-bold">
              <span className="text-xl">🏠</span> Beranda
            </a>
            <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors">
              <span className="text-xl">🛍️</span> Katalog Kain
            </a>
            <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors">
              <span className="text-xl">🎁</span> Promo Khusus
            </a>
            <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors">
              <span className="text-xl">📞</span> Hubungi Kami
            </a>
            <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors mt-auto">
              <span className="text-xl">⚙️</span> Akun
            </a>
          </nav>
        </aside>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          
          {/* Header & Search */}
          <header className="sticky top-0 z-20 bg-[#fafafa]/90 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 py-4">
             <div className="flex items-center justify-between gap-4">
                {/* Mobile menu button */}
                <button className="lg:hidden p-2 -ml-2 rounded-lg bg-white shadow-sm">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-2xl mx-auto flex items-center">
                  <div className="absolute left-4 w-5 h-5 text-slate-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari kain katun, rayon, dll di sini..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white rounded-full text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-500/20 border border-slate-200 shadow-sm transition-all"
                  />
                  <div className="absolute right-4 w-5 h-5 text-slate-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                  </div>
                </div>

                {/* Mobile Store Icon */}
                <div className="lg:hidden w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white font-black text-sm">E</span>
                </div>
             </div>
          </header>

          <main className="flex-1 overflow-x-hidden p-4 lg:p-8 space-y-8">
             {/* Promotional Banner */}
             <div className="w-full bg-gradient-to-r from-[#2B1B54] to-[#EE4566] rounded-3xl overflow-hidden relative shadow-md">
                <div className="px-8 py-10 lg:py-16 md:w-2/3 lg:w-1/2 relative z-10">
                   <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-bold rounded-full backdrop-blur-md mb-4 uppercase tracking-widest">Penawaran Spesial</span>
                   <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight mb-4">{shopSettings.storeName}</h2>
                   <p className="text-white/90 text-sm lg:text-base font-medium mb-8 max-w-md">Koleksi kain premium untuk segala kebutuhan fashion Anda. Belanja grosir lebih murah dan mudah.</p>
                   <button className="px-6 py-3 bg-white text-rose-600 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-transform">Belanja Sekarang</button>
                </div>
                {/* Decoration */}
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             </div>

             {/* Categories */}
             {categories.length > 0 && (
               <div className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
                 <button
                   onClick={() => setSelectedCategory(null)}
                   className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                     selectedCategory === null
                       ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                       : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                   }`}
                 >
                   Semua Kain
                 </button>
                 {categories.map(cat => (
                   <button
                     key={cat.id}
                     onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                     className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                       selectedCategory === cat.id
                         ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                         : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                     }`}
                   >
                     {cat.name}
                   </button>
                 ))}
               </div>
             )}

             {/* Section Title */}
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-xl font-black text-slate-900">Koleksi Terbaru</h3>
                   <p className="text-sm font-medium text-slate-500 mt-1">{displayProducts.length} produk tersedia</p>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                   <span className="text-xs font-semibold text-slate-500">Tampilan</span>
                   <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
                      <div className="w-7 h-7 bg-white rounded text-slate-800 flex items-center justify-center shadow-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/></svg></div>
                      <div className="w-7 h-7 rounded text-slate-400 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg></div>
                   </div>
                </div>
             </div>

             {/* Product Grid */}
             {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[20px] overflow-hidden border border-slate-100 animate-pulse h-[260px]">
                      <div className="h-1/2 bg-slate-100" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-8 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
             ) : displayProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
                  {displayProducts.map(product => (
                    <ProductCard key={product.id} product={product} onClick={() => openProduct(product)} />
                  ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <span className="text-6xl mb-4">🧵</span>
                  <p className="text-xl font-bold text-slate-800">Produk tidak ditemukan</p>
                  <p className="text-slate-500 font-medium mt-2">Coba kata kunci lain atau pilih kategori berbeda</p>
                  {(search || selectedCategory) && (
                    <button
                      onClick={() => { setSearch(""); setSelectedCategory(null); }}
                      className="mt-6 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-slate-200"
                    >
                      Reset Pencarian
                    </button>
                  )}
                </div>
             )}

             {/* Footer */}
             <footer className="mt-16 pt-12 pb-8 border-t border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                   <div>
                      <h4 className="font-bold text-slate-900 mb-4">Informasi</h4>
                      <ul className="space-y-3 text-sm font-medium text-slate-500">
                         <li><a href="#" className="hover:text-rose-600 transition-colors">Tentang Kami</a></li>
                         <li><a href="#" className="hover:text-rose-600 transition-colors">Syarat & Ketentuan</a></li>
                         <li><a href="#" className="hover:text-rose-600 transition-colors">Kebijakan Privasi</a></li>
                      </ul>
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 mb-4">Bantuan</h4>
                      <ul className="space-y-3 text-sm font-medium text-slate-500">
                         <li><a href="#" className="hover:text-rose-600 transition-colors">Cara Pemesanan</a></li>
                         <li><a href="#" className="hover:text-rose-600 transition-colors">Pengiriman</a></li>
                         <li><a href="#" className="hover:text-rose-600 transition-colors">FAQ</a></li>
                      </ul>
                   </div>
                   <div className="col-span-2 md:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                           <span className="text-white font-black text-sm">E</span>
                         </div>
                         <h4 className="font-black text-xl text-slate-900">{shopSettings.storeName}</h4>
                      </div>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6 max-w-sm">
                         Pusat grosir dan eceran kain berkualitas. Melayani pengiriman ke seluruh Indonesia dengan harga terbaik.
                      </p>
                      <div className="flex items-center gap-3">
                         <a href="#" className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
                         <a href="#" className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                         <a href="#" className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                      </div>
                   </div>
                </div>
                <div className="text-center text-sm font-medium text-slate-400 pt-8 border-t border-slate-200">
                   &copy; {new Date().getFullYear()} {shopSettings.storeName}. All rights reserved.
                </div>
             </footer>
          </main>
        </div>
      </div>

      {/* ── Bottom Sheet Modal ── */}
      {sheetOpen && (
        <BottomSheet
          product={selectedProduct}
          onClose={() => { setSheetOpen(false); setSelectedProduct(null); }}
          whatsapp={shopSettings.whatsapp}
        />
      )}
    </div>
  );
}

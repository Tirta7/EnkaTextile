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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Harga Grosir (1 Roll)</span>
                  <span className="text-base font-semibold text-violet-600">
                    {formatRupiah(product.pricePerRoll)}
                    <span className="text-xs font-medium text-slate-400">/roll</span>
                  </span>
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
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-transform duration-150 w-full"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <ProductImage src={product.imageUrl} name={product.name} className="w-full h-full" />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white font-semibold text-xs bg-black/50 px-2.5 py-1 rounded-full">Habis</span>
          </div>
        )}
        {product.categoryName && (
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(product.categoryId)}`}>
              {product.categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-medium text-slate-800 leading-tight line-clamp-2 mb-2">{product.name}</p>
        <p className="text-sm font-bold text-rose-600">
          {formatRupiah(product.pricePerMeter)}
          <span className="text-[11px] font-medium text-slate-400">/{product.primaryUnit}</span>
        </p>
        {product.rollStock > 0 && (
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
            ✓ {product.rollStock} roll tersedia
          </p>
        )}
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
    <div className="min-h-screen bg-[#f7f7f9] w-full" style={{ fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-7xl mx-auto min-h-screen relative flex flex-col">
        {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── Sticky Header (Glassmorphism) ── */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Store Name Row */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">E</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">{shopSettings.storeName}</h1>
              <p className="text-[11px] text-slate-400 leading-none">Katalog Kain Premium</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-semibold">Online</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama kain..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-300 rounded-full flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === null
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="px-4 py-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
        {/* Stats Bar */}
        {!loading && displayProducts.length > 0 && (
          <p className="text-xs text-slate-400 mb-4 font-medium">
            {inStockProducts.length} produk tersedia · {displayProducts.length} total
          </p>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!loading && displayProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} onClick={() => openProduct(product)} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🧵</span>
            <p className="text-slate-600 font-semibold">Produk tidak ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau pilih kategori berbeda</p>
            {(search || selectedCategory) && (
              <button
                onClick={() => { setSearch(""); setSelectedCategory(null); }}
                className="mt-4 px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Bottom Sheet Modal ── */}
      {sheetOpen && (
        <BottomSheet
          product={selectedProduct}
          onClose={() => { setSheetOpen(false); setSelectedProduct(null); }}
          whatsapp={shopSettings.whatsapp}
        />
      )}
      </div>
    </div>
  );
}

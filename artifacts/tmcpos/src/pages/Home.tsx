import { useSettings } from "@/hooks/useSettings";
import { useLocation, Link } from "wouter";
import { 
  Tags, Package2, UserCircle2, Building2, Receipt, ShoppingBasket, 
  ArrowLeftRight, Landmark, CreditCard, BookMarked, BarChart3, TrendingDown,
  Search, Bell, Wallet, ArrowUpRight, Plus, MoreHorizontal, ChevronRight,
  TrendingUp, Store
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetDashboardSalesChart, getGetDashboardSalesChartQueryKey } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VIOLET = "#8b5cf6";

export default function Home() {
  const { data: settings } = useSettings();
  const [, setLocation] = useLocation();

  const appName = settings?.["app_name"] || "VOCpos";
  const appAddress = settings?.["app_address"] || "Alamat belum diatur (Ubah di Pengaturan)";

  const { data: chartData, isLoading: loadingChart } = useGetDashboardSalesChart({}, { query: { queryKey: getGetDashboardSalesChartQueryKey({}) } });

  // Determine today's sales for the wallet card mock
  const todaySales = chartData && chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0;

  const menuItems = [
    { name: "Kategori", href: "/kategori", icon: Tags, color: "text-blue-600", bg: "bg-blue-100", badge: "" },
    { name: "Barang", href: "/barang", icon: Package2, color: "text-amber-600", bg: "bg-amber-100", badge: "UPDATE" },
    { name: "Pelanggan", href: "/pelanggan", icon: UserCircle2, color: "text-emerald-600", bg: "bg-emerald-100", badge: "" },
    { name: "Supplier", href: "/supplier", icon: Building2, color: "text-orange-600", bg: "bg-orange-100", badge: "" },
    { name: "Penjualan", href: "/penjualan", icon: Receipt, color: "text-violet-600", bg: "bg-violet-100", badge: "HOT" },
    { name: "Pembelian", href: "/pembelian", icon: ShoppingBasket, color: "text-pink-600", bg: "bg-pink-100", badge: "" },
    { name: "Mutasi", href: "/mutasi", icon: ArrowLeftRight, color: "text-cyan-600", bg: "bg-cyan-100", badge: "" },
    { name: "Lainnya", href: "#", icon: MoreHorizontal, color: "text-slate-600", bg: "bg-slate-100", badge: "" },
  ];

  return (
    <div className="max-w-[800px] bg-slate-50 min-h-screen pb-14 -mt-4 md:-mt-6 lg:-mt-8 -mx-4 md:mx-auto md:shadow-xl md:border-x">
      
      {/* Gojek-style Top Banner */}
      <div 
        className="w-full px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-20 relative overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3rem] z-10"
        style={{ background: "linear-gradient(135deg, #4f46e5, #9333ea, #c026d3)" }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Search & Profile Row */}
        <div className="flex items-center gap-3 relative z-20 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={`Cari di ${appName}...`} 
              className="w-full pl-10 h-10 rounded-full border-none shadow-inner bg-white/95 focus-visible:ring-2 focus-visible:ring-white/50 text-sm"
            />
          </div>
          <Button size="icon" variant="ghost" className="rounded-full bg-white/20 hover:bg-white/30 text-white shrink-0 h-10 w-10">
            <UserCircle2 className="h-6 w-6" />
          </Button>
        </div>

        {/* Hero Text */}
        <div className="relative z-20 px-1">
          <h1 className="text-2xl font-extrabold text-white mb-1 drop-shadow-md">Halo, Admin! 👋</h1>
          <p className="text-white/80 text-xs font-medium max-w-[80%] line-clamp-1">{appAddress}</p>
        </div>
      </div>

      {/* Floating Summary Card (Wallet style) */}
      <div className="px-4 -mt-14 relative z-20">
        <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-0.5">Penjualan Hari Ini</p>
                  <h3 className="font-bold text-lg text-slate-800 leading-none">
                    {loadingChart ? <Skeleton className="h-5 w-24" /> : formatRupiah(todaySales)}
                  </h3>
                </div>
              </div>
            </div>
            
            {/* Quick Actions in Wallet */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50">
              <Link href="/penjualan">
                <div className="flex flex-col items-center justify-center py-3 gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><ArrowUpRight className="h-3.5 w-3.5" /></div>
                  <span className="text-[10px] font-semibold text-slate-600">Buat Nota</span>
                </div>
              </Link>
              <Link href="/barang">
                <div className="flex flex-col items-center justify-center py-3 gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Plus className="h-3.5 w-3.5" /></div>
                  <span className="text-[10px] font-semibold text-slate-600">Stok Baru</span>
                </div>
              </Link>
              <Link href="/laporan">
                <div className="flex flex-col items-center justify-center py-3 gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><TrendingUp className="h-3.5 w-3.5" /></div>
                  <span className="text-[10px] font-semibold text-slate-600">Laporan</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Icons */}
      <div className="px-4 py-6 mt-2">
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div className="flex flex-col items-center gap-2 cursor-pointer group relative">
                {item.badge && (
                  <span className="absolute -top-2 -right-1 z-10 bg-red-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm border-2 border-white">
                    {item.badge}
                  </span>
                )}
                <div className={`w-[60px] h-[60px] rounded-[18px] flex items-center justify-center ${item.bg} group-active:scale-95 transition-transform relative overflow-hidden shadow-sm`}>
                  <item.icon className={`w-7 h-7 ${item.color} relative z-10`} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 text-center tracking-tight leading-tight w-full truncate px-1">
                  {item.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Promo Banner / Info Section */}
      <div className="px-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 p-4 flex items-center justify-between shadow-md text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10"><Store className="h-32 w-32 -mt-4 -mr-4" /></div>
          <div className="relative z-10">
            <h4 className="font-bold text-sm mb-0.5">Kelola Toko Lebih Mudah</h4>
            <p className="text-xs text-white/90">Cek laporan penjualan harian Anda sekarang.</p>
          </div>
          <Link href="/laporan">
            <Button size="sm" variant="secondary" className="rounded-full text-xs font-bold px-4 h-8 relative z-10">Cek <ChevronRight className="h-3 w-3 ml-1" /></Button>
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="pl-4 pb-8">
        <div className="flex items-center justify-between pr-4 mb-3">
          <h3 className="font-bold text-slate-800 text-sm">Akses Cepat Transaksi</h3>
          <span className="text-xs font-semibold text-violet-600">Lihat Semua</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 pr-4 snap-x [&::-webkit-scrollbar]:hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[200px] w-[200px] bg-white rounded-2xl p-3 border border-slate-100 shadow-sm snap-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">A</div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Pelanggan Umum</p>
                  <p className="text-xs font-bold text-slate-800">Hari ini, 10:45</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-slate-200">
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Lunas</span>
                <span className="text-xs font-bold">Rp {150000 * i}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chart Section for Dashboard Context */}
      <div className="px-4 pb-24">
        <Card className="rounded-2xl border-none shadow-[0_4px_20px_rgb(0,0,0,0.05)] bg-white overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Grafik Penjualan Bulan Ini</h3>
            <div className="h-[200px] w-full">
              {loadingChart ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="revenueGradHome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={VIOLET} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={VIOLET} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v / 1000000}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatRupiah(value), "Pendapatan"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={VIOLET}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#revenueGradHome)"
                      activeDot={{ r: 6, fill: VIOLET, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs font-medium">
                  Belum ada data penjualan
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

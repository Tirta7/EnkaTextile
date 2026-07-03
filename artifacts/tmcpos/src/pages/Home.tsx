import { useSettings } from "@/hooks/useSettings";
import { useLocation, Link } from "wouter";
import { 
  Tags, Package2, UserCircle2, Building2, Receipt, ShoppingBasket, 
  ArrowLeftRight, Landmark, CreditCard, BookMarked, BarChart3, TrendingDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetDashboardSalesChart, getGetDashboardSalesChartQueryKey } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const VIOLET = "#8b5cf6";

export default function Home() {
  const { data: settings } = useSettings();
  const [, setLocation] = useLocation();

  const appName = settings?.["app_name"] || "VOCpos";
  const appAddress = settings?.["app_address"] || "Alamat belum diatur (Ubah di Pengaturan)";

  const { data: chartData, isLoading: loadingChart } = useGetDashboardSalesChart({}, { query: { queryKey: getGetDashboardSalesChartQueryKey({}) } });

  const menuItems = [
    { name: "Kategori", href: "/kategori", icon: Tags, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { name: "Barang", href: "/barang", icon: Package2, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { name: "Pelanggan", href: "/pelanggan", icon: UserCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { name: "Supplier", href: "/supplier", icon: Building2, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { name: "Penjualan", href: "/penjualan", icon: Receipt, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { name: "Pembelian", href: "/pembelian", icon: ShoppingBasket, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { name: "Mutasi", href: "/mutasi", icon: ArrowLeftRight, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { name: "Piutang", href: "/piutang", icon: Landmark, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { name: "Hutang", href: "/hutang", icon: CreditCard, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { name: "Buku Kas", href: "/buku-kas", icon: BookMarked, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20" },
    { name: "Laporan", href: "/laporan", icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-12 pb-14 px-2">
      
      {/* Banner */}
      <div 
        className="w-full rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(139,92,246,0.25)] border border-white/10 animate-gradient relative overflow-hidden"
        style={{ background: "linear-gradient(45deg, #1d4ed8, #8b5cf6, #1e40af, #6d28d9)" }}
      >
        {/* Subtle glass overlay inside banner */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-wider drop-shadow-lg">{appName}</h1>
          <p className="text-white/90 text-xs sm:text-sm tracking-wide font-medium drop-shadow-md">{appAddress}</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-10 max-w-[900px] mx-auto mt-8">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <div className="flex flex-col items-center gap-3.5 cursor-pointer group transition-all duration-300">
              <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-[1.25rem] flex items-center justify-center ${item.bg} border ${item.border} shadow-lg backdrop-blur-md group-hover:-translate-y-1.5 transition-transform duration-300 relative overflow-hidden`}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${item.bg}`} />
                <item.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${item.color} relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
              </div>
              <span className={`text-[10px] font-bold ${item.color} uppercase tracking-wider group-hover:scale-105 transition-transform duration-300`}>
                {item.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Chart */}
      <div className="pt-8 max-w-4xl mx-auto">
        <h2 className="text-center text-sm font-semibold tracking-wide text-foreground/90 mb-8">
          Grafik Penjualan {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
        </h2>
        
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="h-[350px] p-0">
            {loadingChart ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="revenueGradHome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={VIOLET} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={VIOLET} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000000}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatRupiah(value), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: 12,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={VIOLET}
                    strokeWidth={3}
                    fill="url(#revenueGradHome)"
                    dot={{ r: 4, fill: VIOLET, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: VIOLET, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <TrendingDown size={32} className="opacity-30" />
                <p className="text-sm">Belum ada data penjualan bulan ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

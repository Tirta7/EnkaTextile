import { useGetDashboardSummary, useGetDashboardSalesChart, useGetDashboardRecentTransactions, useGetDashboardTopProducts, useGetDashboardReceivablesSummary, getGetDashboardSummaryQueryKey, getGetDashboardSalesChartQueryKey, getGetDashboardRecentTransactionsQueryKey, getGetDashboardTopProductsQueryKey, getGetDashboardReceivablesSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn, formatRupiah } from "@/lib/utils";
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, Clock, CreditCard, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: chartData, isLoading: loadingChart } = useGetDashboardSalesChart({}, { query: { queryKey: getGetDashboardSalesChartQueryKey({}) } });
  const { data: recent, isLoading: loadingRecent } = useGetDashboardRecentTransactions({ query: { queryKey: getGetDashboardRecentTransactionsQueryKey() } });
  const { data: topProducts, isLoading: loadingTop } = useGetDashboardTopProducts({ query: { queryKey: getGetDashboardTopProductsQueryKey() } });
  const { data: receivables, isLoading: loadingReceivables } = useGetDashboardReceivablesSummary({ query: { queryKey: getGetDashboardReceivablesSummaryQueryKey() } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your textile business performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Today's Revenue" 
          value={summary?.todayRevenue ? formatRupiah(summary.todayRevenue) : "Rp 0"} 
          icon={DollarSign} 
          loading={loadingSummary} 
        />
        <MetricCard 
          title="Today's Transactions" 
          value={summary?.todayTransactions?.toString() || "0"} 
          icon={ShoppingCart} 
          loading={loadingSummary} 
        />
        <MetricCard 
          title="Cash Balance" 
          value={summary?.cashBalance ? formatRupiah(summary.cashBalance) : "Rp 0"} 
          icon={CreditCard} 
          loading={loadingSummary} 
        />
        <MetricCard 
          title="Total Receivables" 
          value={summary?.totalReceivables ? formatRupiah(summary.totalReceivables) : "Rp 0"} 
          icon={TrendingUp} 
          loading={loadingSummary} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Overdue Receivables</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loadingSummary || loadingReceivables ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">
                  {summary?.overdueReceivables || 0} Invoices
                </div>
                <p className="text-xs text-destructive/80 mt-1">
                  Value: {receivables?.overdueAmount ? formatRupiah(receivables.overdueAmount) : "Rp 0"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-500">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-500" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                {summary?.lowStockCount || 0} Items
              </div>
            )}
          </CardContent>
        </Card>
        
        <MetricCard 
          title="Total Payables" 
          value={summary?.totalPayables ? formatRupiah(summary.totalPayables) : "Rp 0"} 
          icon={ArrowDownToLine} 
          loading={loadingSummary} 
          className="lg:col-span-2"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingChart ? (
              <Skeleton className="h-full w-full" />
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `Rp ${value / 1000000}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Highest revenue generators</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTop ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="font-medium">{product.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.totalRolls} rolls / {product.totalMeters} m
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatRupiah(product.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : recent && recent.length > 0 ? (
            <div className="space-y-4">
              {recent.map((tx) => (
                <div key={`${tx.type}-${tx.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      tx.type === 'SALE' ? "bg-green-100 text-green-600" :
                      tx.type === 'PURCHASE' ? "bg-blue-100 text-blue-600" :
                      tx.type === 'PAYMENT_IN' ? "bg-emerald-100 text-emerald-600" :
                      "bg-orange-100 text-orange-600"
                    )}>
                      {tx.type.includes('PAYMENT') ? <DollarSign size={20} /> : <ShoppingCart size={20} />}
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {tx.description}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {tx.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tx.customerName ? `Client: ${tx.customerName} • ` : ''}
                        {new Date(tx.createdAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-bold text-right",
                    (tx.type === 'SALE' || tx.type === 'PAYMENT_IN') ? "text-green-600" : "text-foreground"
                  )}>
                    {(tx.type === 'SALE' || tx.type === 'PAYMENT_IN') ? '+' : '-'} {formatRupiah(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, loading, className }: { title: string, value: string, icon: any, loading?: boolean, className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[120px]" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

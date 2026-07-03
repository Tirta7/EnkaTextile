import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useGetSalesSummaryReport, useGetStockSummaryReport, getGetSalesSummaryReportQueryKey, getGetStockSummaryReportQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { LineChart as LineChartIcon, Package, TrendingUp, Download } from "lucide-react";
import { formatRupiah, formatNumber, formatDate } from "@/lib/utils";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

import { PaginationControl } from "../components/PaginationControl";

export default function Laporan() {
  const [currentSalesPage, setCurrentSalesPage] = useState(1);
  const [currentStockPage, setCurrentStockPage] = useState(1);
  const today = new Date();
  const [startDate, setStartDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const { data: salesReport, isLoading: loadingSales } = useGetSalesSummaryReport(
    { startDate, endDate },
    { query: { queryKey: getGetSalesSummaryReportQueryKey({ startDate, endDate }) } }
  );

  const { data: stockReport, isLoading: loadingStock } = useGetStockSummaryReport(
    { query: { queryKey: getGetStockSummaryReportQueryKey() } }
  );

  const exportCSV = (data: any[], filename: string) => {
    if (!data?.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan" description="Analisa performa penjualan dan inventori." />

      <Tabs defaultValue="penjualan">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="penjualan"><TrendingUp className="mr-2 h-4 w-4" />Penjualan</TabsTrigger>
          <TabsTrigger value="stok"><Package className="mr-2 h-4 w-4" />Stok</TabsTrigger>
        </TabsList>

        <TabsContent value="penjualan" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-4">
              <div className="flex-1">
                <CardTitle>Filter Periode</CardTitle>
                <CardDescription>Pilih rentang tanggal untuk laporan</CardDescription>
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-36" />
                <span className="text-muted-foreground">—</span>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full sm:w-36" />
              </div>
            </CardHeader>
          </Card>

          {loadingSales ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array(3).fill(0).map((_, i) => <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
            </div>
          ) : salesReport ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Penjualan</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{formatRupiah((salesReport as any).totalRevenue)}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Transaksi</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{(salesReport as any).totalTransactions}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata per Transaksi</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{formatRupiah((salesReport as any).averageTransaction)}</div></CardContent>
                </Card>
              </div>

              {(salesReport as any).byProduct?.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Penjualan per Produk</CardTitle>
                      <CardDescription>Top produk dalam periode ini</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => exportCSV((salesReport as any).byProduct, "laporan-produk")}>
                      <Download className="mr-2 h-4 w-4" />Export CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={(salesReport as any).byProduct?.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" tickFormatter={v => `${v / 1000000}M`} fontSize={11} />
                            <YAxis type="category" dataKey="productName" fontSize={11} width={100} />
                            <Tooltip formatter={(v: number) => formatRupiah(v)} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                            <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produk</TableHead>
                            <TableHead className="text-right">Qty (Utama)</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(salesReport as any).byProduct?.slice((currentSalesPage - 1) * 20, currentSalesPage * 20).map((p: any) => (
                            <TableRow key={p.productId}>
                              <TableCell className="font-medium">{p.productName}</TableCell>
                              <TableCell className="text-right">{formatNumber(p.totalMeters)}</TableCell>
                              <TableCell className="text-right">{formatRupiah(p.totalRevenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <PaginationControl currentPage={currentSalesPage} totalPages={Math.ceil(((salesReport as any).byProduct?.length || 0) / 20)} onPageChange={setCurrentSalesPage} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {(salesReport as any).byCategory?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Penjualan per Kategori</CardTitle>
                    <CardDescription>Kontribusi setiap kategori</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={(salesReport as any).byCategory} dataKey="totalRevenue" nameKey="categoryName" cx="50%" cy="50%" outerRadius={100} label={({ categoryName, percent }) => `${categoryName} ${(percent * 100).toFixed(0)}%`}>
                            {(salesReport as any).byCategory?.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => formatRupiah(v)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <LineChartIcon className="mx-auto mb-3 h-10 w-10 opacity-30" />
                Tidak ada data penjualan untuk periode ini
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stok" className="space-y-6 mt-4">
          {loadingStock ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : stockReport ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Produk</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{(stockReport as any).totalProducts}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Nilai Stok</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{formatRupiah((stockReport as any).totalValue)}</div></CardContent>
                </Card>
                <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-amber-700">Stok Rendah</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold text-amber-700">{(stockReport as any).lowStockCount} Produk</div></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Ringkasan Stok per Produk</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportCSV((stockReport as any).products, "laporan-stok")}>
                    <Download className="mr-2 h-4 w-4" />Export CSV
                  </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Stok Tambahan</TableHead>
                        <TableHead className="text-right">Stok Utama</TableHead>
                        <TableHead className="text-right">Min. Stok</TableHead>
                        <TableHead className="text-right">Nilai</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(stockReport as any).products?.slice((currentStockPage - 1) * 20, currentStockPage * 20).map((p: any) => (
                        <TableRow key={p.id} className={p.isLowStock ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-muted-foreground">{p.categoryName || "-"}</TableCell>
                          <TableCell className="text-right">{formatNumber(p.rollStock)} {p.secondaryUnit?.toLowerCase() || ""}</TableCell>
                          <TableCell className="text-right">{formatNumber(p.meterStock)} {p.primaryUnit?.toLowerCase() || ""}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatNumber(p.minStock)}</TableCell>
                          <TableCell className="text-right font-medium">{formatRupiah(p.stockValue)}</TableCell>
                          <TableCell>
                            {p.isLowStock ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-medium">Rendah</span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 font-medium">OK</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControl currentPage={currentStockPage} totalPages={Math.ceil(((stockReport as any).products?.length || 0) / 20)} onPageChange={setCurrentStockPage} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Package className="mx-auto mb-3 h-10 w-10 opacity-30" />
                Tidak ada data stok
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListMutations, useCreateMutation, useListProducts, getListMutationsQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ArrowLeftRight, ArrowUpFromLine, ArrowDownToLine, CheckCircle2, Clock, AlertCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate, formatNumber } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

const schema = z.object({
  productId: z.number({ required_error: "Barang wajib dipilih" }),
  type: z.enum(["in", "out", "adjustment"]),
  rolls: z.number().min(0),
  meters: z.number().min(0),
  description: z.string().optional(),
  reference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  masuk: { label: "Masuk", color: "bg-green-100 text-green-700 border-green-200", icon: ArrowDownToLine },
  keluar: { label: "Keluar", color: "bg-red-100 text-red-700 border-red-200", icon: ArrowUpFromLine },
  penyesuaian: { label: "Penyesuaian", color: "bg-blue-100 text-blue-700 border-blue-200", icon: ArrowLeftRight },
};

export default function Mutasi() {
  const [activeTab, setActiveTab] = useState<"semua" | "masuk" | "keluar" | "penyesuaian">("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: mutations, isLoading } = useListMutations({}, { query: { queryKey: getListMutationsQueryKey({}) } });
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "in", rolls: 0, meters: 0, description: "", reference: "" },
  });

  const selectedProductId = form.watch("productId");
  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const primaryUnit = selectedProduct?.primaryUnit || "Meter";
  const secondaryUnit = selectedProduct?.secondaryUnit || "Roll";

  const createMutation = useCreateMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMutationsQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) });
        setIsOpen(false);
        form.reset({ type: "in", rolls: 0, meters: 0, description: "", reference: "" });
        toast({ title: "Mutasi stok berhasil dicatat" });
      }
    }
  });

  const onSubmit = (data: FormData) => createMutation.mutate({ data: { ...data, description: data.description || "", reference: data.reference || "" } });

  const filtered = filterByDateRange(
    mutations?.filter(m => {
      const q = search.toLowerCase();
      return (m as any).productName?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
    }) ?? [],
    dateFrom,
    dateTo,
  );

  const tabFiltered = filtered.filter(m => {
    if (activeTab === "semua") return true;
    return m.type === activeTab;
  });

  return (
    <div className="flex flex-col h-full w-full">
      {/* Static Top Strip */}
      <div className="flex-none space-y-2 pb-2">
        <div className="flex items-center justify-between pt-1 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mutasi Stok</h1>
            <p className="text-sm text-slate-500">Riwayat barang masuk & keluar</p>
          </div>
          <Button onClick={() => { form.reset({ type: "in", rolls: 0, meters: 0, description: "", reference: "" }); setIsOpen(true); }} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Baru
          </Button>
        </div>
        {/* Tabs */}
        <div className="flex gap-3 border-b border-slate-200">
          {(['semua', 'masuk', 'keluar', 'penyesuaian'] as const).map((tab) => {
            const label = tab === 'masuk' ? 'Masuk' : tab === 'keluar' ? 'Keluar' : tab === 'penyesuaian' ? 'Penyesuaian' : 'Semua';
            return (
              <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`pb-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'}`}>
                {label}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-violet-600" />}
              </button>
            );
          })}
        </div>
        {/* Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari barang atau referensi..." className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); setCurrentPage(1); }} />
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
          ) : tabFiltered?.length === 0 ? (
            <div className="text-center py-16"><ArrowLeftRight className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Belum ada mutasi</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8">#</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Produk</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Meter/Yd</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Roll</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tabFiltered?.slice((currentPage - 1) * 20, currentPage * 20).map((m, idx) => {
                    const cfg = TYPE_CONFIG[m.type ?? "masuk"];
                    let badgeCls = "bg-slate-100 text-slate-700";
                    if (m.type === 'masuk') badgeCls = "bg-green-100 text-green-700";
                    else if (m.type === 'keluar') badgeCls = "bg-red-100 text-red-700";
                    else badgeCls = "bg-blue-100 text-blue-700";
                    const sign = m.type === 'keluar' ? '-' : '+';
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-xs text-slate-400 font-mono">{(currentPage - 1) * 20 + idx + 1}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(m.createdAt)}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{(m as any).productName || <span className="text-slate-400 italic">Dihapus</span>}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeCls}`}>{cfg?.label}</span>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold text-sm ${m.type === 'keluar' ? 'text-rose-600' : 'text-emerald-600'}`}>{sign}{formatNumber(m.meters)}</td>
                        <td className={`py-2.5 px-3 text-right text-xs font-medium ${m.type === 'keluar' ? 'text-rose-500' : 'text-emerald-500'}`}>{m.rolls > 0 ? `${sign}${formatNumber(m.rolls)}` : <span className="text-slate-300">—</span>}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-500 italic">{m.description || <span className="text-slate-300">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Bar */}
      {tabFiltered && tabFiltered.length > 20 && (
        <div className="flex-none border-t border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between rounded-b-2xl shadow-sm">
          <span className="text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, tabFiltered.length)} dari {tabFiltered.length} mutasi</span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(tabFiltered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Catat Mutasi Stok</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField control={form.control} name="productId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Barang</FormLabel>
                  <Select onValueChange={(v: string) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih barang" /></SelectTrigger></FormControl>
                    <SelectContent>{products?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Mutasi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="masuk">Masuk</SelectItem>
                      <SelectItem value="keluar">Keluar</SelectItem>
                      <SelectItem value="penyesuaian">Penyesuaian</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="rolls" render={({ field }) => (
                  <FormItem><FormLabel>Qty ({secondaryUnit.toLowerCase()})</FormLabel><FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="meters" render={({ field }) => (
                  <FormItem><FormLabel>Qty ({primaryUnit.toLowerCase()})</FormLabel><FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Input placeholder="Alasan mutasi" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem><FormLabel>Referensi (Opsional)</FormLabel><FormControl><Input placeholder="No. dokumen" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DrawerFooter className="px-0 pt-4 flex-row gap-2">
                <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>Simpan</Button>
              </DrawerFooter>
            </form>
          </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

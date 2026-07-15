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
  in: { label: "Masuk", color: "bg-green-100 text-green-700 border-green-200", icon: ArrowDownToLine },
  out: { label: "Keluar", color: "bg-red-100 text-red-700 border-red-200", icon: ArrowUpFromLine },
  adjustment: { label: "Penyesuaian", color: "bg-blue-100 text-blue-700 border-blue-200", icon: ArrowLeftRight },
};

export default function Mutasi() {
  const [activeTab, setActiveTab] = useState<"semua" | "in" | "out" | "adjustment">("semua");
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
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col pt-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mutasi Stok</h1>
            <p className="text-sm text-slate-500">Riwayat barang masuk & keluar</p>
          </div>
          <Button onClick={() => { form.reset({ type: "in", rolls: 0, meters: 0, description: "", reference: "" }); setIsOpen(true); }} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Baru
          </Button>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {(['semua', 'in', 'out', 'adjustment'] as const).map((tab) => {
            let label = "Semua";
            if (tab === "in") label = "Masuk";
            if (tab === "out") label = "Keluar";
            if (tab === "adjustment") label = "Penyesuaian";
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-violet-900 text-white shadow-md shadow-violet-200"
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari barang atau referensi..." 
            className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500" 
            value={search} 
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
          />
        </div>
        <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); setCurrentPage(1); }} />
      </div>

      {/* Activity Feed List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </div>
          ))
        ) : tabFiltered?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <ArrowLeftRight className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Belum ada mutasi</h3>
            <p className="text-sm text-slate-500 mt-1">Tidak ada riwayat pergerakan stok.</p>
          </div>
        ) : (
          <>
            {tabFiltered?.slice((currentPage - 1) * 20, currentPage * 20).map((m) => {
              const cfg = TYPE_CONFIG[m.type ?? "in"];
              const Icon = cfg?.icon ?? ArrowLeftRight;
              
              // Decorative Badge Class
              let badgeClass = "bg-slate-100 text-slate-700";
              let iconClass = "text-slate-500";
              let iconBgClass = "bg-slate-50 border-slate-100";
              
              if (m.type === 'in') {
                badgeClass = "bg-green-100 text-green-700";
                iconClass = "text-green-500";
                iconBgClass = "bg-green-50 border-green-100";
              } else if (m.type === 'out') {
                badgeClass = "bg-red-100 text-red-700";
                iconClass = "text-red-500";
                iconBgClass = "bg-red-50 border-red-100";
              } else {
                badgeClass = "bg-blue-100 text-blue-700";
                iconClass = "text-blue-500";
                iconBgClass = "bg-blue-50 border-blue-100";
              }

              return (
                <div key={m.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md">
                  
                  {/* Decorative side accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${badgeClass.split(' ')[0]}`} />

                  {/* Header: Waktu & Referensi */}
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                    <div className="text-right">
                      {m.reference && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-full block">
                          Ref: {m.reference}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Info Barang & Stok */}
                  <div className="flex gap-3 items-center pl-2">
                    <div className={`w-[48px] h-[48px] rounded-2xl shrink-0 flex items-center justify-center border ${iconBgClass}`}>
                      <Icon className={`w-6 h-6 ${iconClass}`} strokeWidth={2} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-[15px] truncate">
                        {(m as any).productName || "Barang Dihapus"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>
                          {cfg?.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-none">
                          {m.type === 'out' ? '-' : '+'}{formatNumber(m.meters)} <span className="text-[10px] font-normal text-slate-500">Mtr/Yd</span>
                        </span>
                        {m.rolls > 0 && (
                          <span className="text-xs font-medium text-slate-500 mt-1">
                            {m.type === 'out' ? '-' : '+'}{formatNumber(m.rolls)} <span className="text-[10px]">Roll</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer: Keterangan */}
                  {m.description && (
                    <div className="mt-2 pl-2 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-500 italic">"{m.description}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        {tabFiltered && tabFiltered.length > 20 && (
          <div className="pt-4 flex justify-center pb-8">
            <PaginationControl currentPage={currentPage} totalPages={Math.ceil(tabFiltered.length / 20)} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

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
                      <SelectItem value="in">Stok Masuk</SelectItem>
                      <SelectItem value="out">Stok Keluar</SelectItem>
                      <SelectItem value="adjustment">Penyesuaian</SelectItem>
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

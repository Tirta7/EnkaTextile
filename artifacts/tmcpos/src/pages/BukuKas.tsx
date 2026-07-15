import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListCashEntries, useGetCashBalance, useCreateCashEntry, getListCashEntriesQueryKey, getGetCashBalanceQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, BookOpen, ArrowUpFromLine, ArrowDownToLine, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(1, "Jumlah harus lebih dari 0"),
  description: z.string().min(1, "Keterangan wajib diisi"),
  reference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BukuKas() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"semua" | "income" | "expense">("semua");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: entries, isLoading } = useListCashEntries({}, { query: { queryKey: getListCashEntriesQueryKey({}) } });
  const { data: balance } = useGetCashBalance({ query: { queryKey: getGetCashBalanceQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "income", amount: 0, description: "", reference: "" },
  });

  const createMutation = useCreateCashEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCashEntriesQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getGetCashBalanceQueryKey() });
        setIsOpen(false);
        form.reset({ type: "income", amount: 0, description: "", reference: "" });
        toast({ title: "Entri kas berhasil ditambahkan" });
      }
    }
  });

  const onSubmit = (data: FormData) => createMutation.mutate({ data });

  const filteredBase = entries?.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchType = activeTab === "semua" || e.type === activeTab;
    return matchSearch && matchType;
  });
  const filtered = filterByDateRange(filteredBase ?? [], dateFrom, dateTo);

  const totalIn = entries?.filter(e => e.type === "income").reduce((sum, e) => sum + (e as any).amount, 0) ?? 0;
  const totalOut = entries?.filter(e => e.type === "expense").reduce((sum, e) => sum + (e as any).amount, 0) ?? 0;

  return (
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col pt-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buku Kas</h1>
            <p className="text-sm text-slate-500">Catat pemasukan & pengeluaran</p>
          </div>
          <Button onClick={() => setIsOpen(true)} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Baru
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-violet-50 rounded-3xl p-4 border border-violet-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <TrendingUp className="w-24 h-24" />
          </div>
          <span className="text-xs font-semibold text-violet-600 mb-1">Saldo Kas</span>
          <span className="text-lg font-bold text-violet-900">{formatRupiah((balance as any)?.balance ?? 0)}</span>
        </div>
        <div className="bg-green-50 rounded-3xl p-4 border border-green-200 flex flex-col justify-center">
          <span className="text-xs font-semibold text-green-700 mb-1">Total Pemasukan</span>
          <span className="text-lg font-bold text-green-900">{formatRupiah(totalIn)}</span>
        </div>
        <div className="bg-red-50 rounded-3xl p-4 border border-red-200 flex flex-col justify-center col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-red-700 mb-1">Total Pengeluaran</span>
          <span className="text-lg font-bold text-red-900">{formatRupiah(totalOut)}</span>
        </div>
      </div>

      {/* Scrollable Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {(['semua', 'income', 'expense'] as const).map((tab) => {
          let label = "Semua";
          if (tab === "income") label = "Pemasukan";
          if (tab === "expense") label = "Pengeluaran";
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

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari keterangan transaksi..." 
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
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Belum ada transaksi kas</h3>
            <p className="text-sm text-slate-500 mt-1">Catat pemasukan atau pengeluaran Anda.</p>
          </div>
        ) : (
          <>
            {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((e) => {
              const isIncome = e.type === "income";
              
              // Decorative Badge Class
              let badgeClass = "bg-red-100 text-red-700";
              let iconClass = "text-red-500";
              let iconBgClass = "bg-red-50 border-red-100";
              let StatusIcon = ArrowUpFromLine;
              
              if (isIncome) {
                badgeClass = "bg-green-100 text-green-700";
                iconClass = "text-green-500";
                iconBgClass = "bg-green-50 border-green-100";
                StatusIcon = ArrowDownToLine;
              }

              return (
                <div key={e.id} className={`bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md`}>
                  
                  {/* Decorative side accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${badgeClass.split(' ')[0]}`} />

                  {/* Header: Waktu */}
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {formatDate(e.createdAt)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold block ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}{formatRupiah((e as any).amount)}
                      </span>
                    </div>
                  </div>

                  {/* Body: Info Transaksi */}
                  <div className="flex gap-3 items-center pl-2">
                    <div className={`w-[48px] h-[48px] rounded-2xl shrink-0 flex items-center justify-center border ${iconBgClass}`}>
                      <StatusIcon className={`w-6 h-6 ${iconClass}`} strokeWidth={2} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-[15px] truncate">
                        {e.description}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>
                          {isIncome ? "Pemasukan" : "Pengeluaran"}
                        </span>
                        {(e as any).reference && (
                          <span className="text-xs font-medium text-slate-400 capitalize">
                            Ref: {(e as any).reference}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        {filtered && filtered.length > 20 && (
          <div className="pt-4 flex justify-center pb-8">
            <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) setIsOpen(false); }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Catat Transaksi Kas</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Transaksi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl><Input placeholder="Deskripsi transaksi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Referensi (Opsional)</FormLabel>
                  <FormControl><Input placeholder="Contoh: No. faktur, No. kwitansi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
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

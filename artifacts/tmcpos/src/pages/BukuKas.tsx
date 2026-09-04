import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListCashEntries, useGetCashBalance, useCreateCashEntry, getListCashEntriesQueryKey, getGetCashBalanceQueryKey, useListReturns, getListReturnsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, BookOpen, ArrowUpFromLine, ArrowDownToLine, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";
import { ReturnInvoiceModal } from "@/components/ReturnInvoiceModal";

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
  const [previewReturnId, setPreviewReturnId] = useState<number | null>(null);

  const { data: returns } = useListReturns();

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
    const matchType = activeTab === "semua" || 
      (activeTab === "income" && (e.type === "income" || e.type === "masuk")) || 
      (activeTab === "expense" && (e.type === "expense" || e.type === "keluar"));
    return matchSearch && matchType;
  });
  const filtered = filterByDateRange(filteredBase ?? [], dateFrom, dateTo);

  const totalIn = entries?.filter(e => e.type === "income" || e.type === "masuk").reduce((sum, e) => sum + (e as any).amount, 0) ?? 0;
  const totalOut = entries?.filter(e => e.type === "expense" || e.type === "keluar").reduce((sum, e) => sum + (e as any).amount, 0) ?? 0;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Static Top Strip */}
      <div className="flex-none space-y-2 pb-2">
        <div className="flex items-center justify-between pt-1 pb-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buku Kas</h1>
            <p className="text-sm text-slate-500">Catat pemasukan & pengeluaran</p>
          </div>
          <Button onClick={() => setIsOpen(true)} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Baru
          </Button>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-violet-50 rounded-2xl p-3 border border-violet-100 flex flex-col justify-center relative overflow-hidden">
            <span className="text-[10px] font-semibold text-violet-600 mb-0.5">Saldo Kas</span>
            <span className="text-sm font-bold text-violet-900">{formatRupiah((balance as any)?.balance ?? 0)}</span>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 border border-green-200 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-green-700 mb-0.5">Total Masuk</span>
            <span className="text-sm font-bold text-green-900">{formatRupiah(totalIn)}</span>
          </div>
          <div className="bg-red-50 rounded-2xl p-3 border border-red-200 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-red-700 mb-0.5">Total Keluar</span>
            <span className="text-sm font-bold text-red-900">{formatRupiah(totalOut)}</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-3 border-b border-slate-200">
          {(['semua', 'income', 'expense'] as const).map((tab) => {
            const label = tab === 'income' ? 'Pemasukan' : tab === 'expense' ? 'Pengeluaran' : 'Semua';
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
            <Input placeholder="Cari keterangan transaksi..." className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); setCurrentPage(1); }} />
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-16"><BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Belum ada transaksi kas</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200 shadow-sm">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8 whitespace-nowrap">#</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Keterangan</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Referensi</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tipe</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((e, idx) => {
                    const isIncome = e.type === "income" || e.type === "masuk";
                    const isRetur = (e as any).reference?.startsWith("RET-");
                    return (
                      <tr key={e.id}
                        className={`hover:bg-slate-50/80 transition-colors ${isRetur ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                          if (isRetur) {
                            const foundReturn = returns?.find(r => r.returnNumber === (e as any).reference);
                            if (foundReturn) setPreviewReturnId(foundReturn.id);
                          }
                        }}>
                        <td className="py-2.5 px-3 text-xs text-slate-400 font-mono whitespace-nowrap">{(currentPage - 1) * 20 + idx + 1}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">{e.description}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-400 font-mono whitespace-nowrap">{(e as any).reference || <span className="text-slate-200">—</span>}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {isIncome ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIncome ? '+' : '-'}{formatRupiah((e as any).amount)}
                        </td>
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
      {filtered && filtered.length > 20 && (
        <div className="flex-none border-t border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between rounded-b-2xl shadow-sm">
          <span className="text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)} dari {filtered.length} transaksi</span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) setIsOpen(false); }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl p-0 overflow-hidden">
          <DrawerTitle className="sr-only">Catat Transaksi Kas</DrawerTitle>
          <DrawerDescription className="sr-only">Form to record a cash transaction</DrawerDescription>
          
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 px-6 py-4 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Catat Transaksi Kas</h2>
              <p className="text-violet-200 text-xs">Isi formulir untuk mencatat pemasukan atau pengeluaran kas</p>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-6">
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

      <ReturnInvoiceModal 
        open={!!previewReturnId} 
        onOpenChange={(open) => !open && setPreviewReturnId(null)} 
        returnId={previewReturnId ?? undefined} 
      />
    </div>
  );
}

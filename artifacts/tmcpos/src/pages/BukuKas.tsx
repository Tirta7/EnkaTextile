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
    <div className="w-full">
      {/* Top Strip */}
      <div className="pb-3 space-y-2.5">
        {/* Row 1: Title + Tambah */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Buku Kas</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Catat pemasukan &amp; pengeluaran</p>
          </div>
          <Button onClick={() => setIsOpen(true)} size="sm" className="h-8 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Baru
          </Button>
        </div>

        {/* Row 2: Summary strip */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-violet-50 border border-violet-100 rounded-xl px-2.5 py-2">
            <p className="text-[8px] font-bold text-violet-600 uppercase tracking-wider">Saldo Kas</p>
            <p className="text-xs font-black text-violet-900 leading-tight truncate">{formatRupiah((balance as any)?.balance ?? 0)}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-2">
            <p className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Total Masuk</p>
            <p className="text-xs font-black text-emerald-900 leading-tight truncate">{formatRupiah(totalIn)}</p>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-xl px-2.5 py-2">
            <p className="text-[8px] font-bold text-rose-700 uppercase tracking-wider">Total Keluar</p>
            <p className="text-xs font-black text-rose-900 leading-tight truncate">{formatRupiah(totalOut)}</p>
          </div>
        </div>

        {/* Row 3: Tabs */}
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

        {/* Row 4: Search + Date filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Cari keterangan..." className="pl-8 h-9 rounded-xl bg-white border-slate-200 text-sm focus-visible:ring-violet-500" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); setCurrentPage(1); }} />
        </div>
      </div>

      {/* List Area */}
      <div>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-100">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full border-b border-slate-50 last:border-0" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-200" strokeWidth={1.5} />
            <h3 className="text-sm font-bold text-slate-500">Belum ada transaksi kas</h3>
          </div>
        ) : (
          <>
            {/* Mobile: seamless list */}
            <div className="md:hidden bg-white rounded-2xl border border-slate-100">
              {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((e, idx) => {
                const isIncome = e.type === "income" || e.type === "masuk";
                const isRetur = (e as any).reference?.startsWith("RET-");
                return (
                  <div key={e.id}
                    className={`px-3.5 py-3 flex items-center gap-3 transition-colors ${idx > 0 ? 'border-t border-slate-50' : ''} ${isRetur ? 'active:bg-slate-50 cursor-pointer' : ''}`}
                    onClick={() => {
                      if (isRetur) {
                        const foundReturn = returns?.find(r => r.returnNumber === (e as any).reference);
                        if (foundReturn) setPreviewReturnId(foundReturn.id);
                      }
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isIncome ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                      {isIncome ? <ArrowDownToLine className="w-5 h-5" strokeWidth={1.5} /> : <ArrowUpFromLine className="w-5 h-5" strokeWidth={1.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-sm leading-tight truncate">{e.description}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400">{formatDate(e.createdAt)}</span>
                        {(e as any).reference && (
                          <><span className="text-[10px] text-slate-200">·</span>
                          <span className="text-[10px] text-slate-400 font-mono">{(e as any).reference}</span></>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'}{formatRupiah((e as any).amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-10">#</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Tanggal</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Keterangan</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Referensi</th>
                      <th className="h-9 px-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Tipe</th>
                      <th className="h-9 px-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
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
                          <td className="py-2.5 px-4 text-[11px] text-slate-400">{(currentPage - 1) * 20 + idx + 1}</td>
                          <td className="py-2.5 px-4 text-xs text-slate-600 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                          <td className="py-2.5 px-4 font-medium text-slate-800 whitespace-nowrap">{e.description}</td>
                          <td className="py-2.5 px-4 text-xs text-slate-400 font-mono whitespace-nowrap">{(e as any).reference || <span className="text-slate-200">—</span>}</td>
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {isIncome ? 'Masuk' : 'Keluar'}
                            </span>
                          </td>
                          <td className={`py-2.5 px-4 text-right font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncome ? '+' : '-'}{formatRupiah((e as any).amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {filtered && filtered.length > 20 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-2">
          <span className="text-[10px] text-slate-400">
            {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)}
            <span className="text-slate-300 mx-1">/</span>
            {filtered.length}
          </span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) setIsOpen(false); }}>
        <DrawerContent
          className="mx-auto w-full max-w-2xl px-4 sm:px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2"
          style={{ maxHeight: 'calc(95dvh - env(safe-area-inset-top, 0px))' }}
        >
          <DrawerTitle className="sr-only">Catat Transaksi Kas</DrawerTitle>
          <DrawerDescription className="sr-only">Form pencatatan kas</DrawerDescription>
          <DrawerHeader className="pb-3 px-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-800 leading-tight">Catat Transaksi Kas</h2>
                <p className="text-xs text-slate-400">Pemasukan atau pengeluaran kas</p>
              </div>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1">
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

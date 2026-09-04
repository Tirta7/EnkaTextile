import { useState, useMemo } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListPayables, useAddPayablePayment, getListPayablesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Receipt, Plus, AlertTriangle, CheckCircle2, AlertCircle, ArrowRightCircle, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

const STATUS_COLORS: Record<string, string> = {
  lunas: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  belum_bayar: "bg-red-100 text-red-700 border-red-200",
};

export default function Hutang() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"semua" | "belum_bayar" | "partial" | "lunas">("semua");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("tunai");
  const [payNotes, setPayNotes] = useState("");

  const { data: payables, isLoading } = useListPayables({}, { query: { queryKey: getListPayablesQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const payMutation = useAddPayablePayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPayablesQueryKey({}) });
        setIsOpen(false);
        setSelectedId(null);
        setPayAmount("");
        toast({ title: "Pembayaran hutang berhasil dicatat" });
      }
    }
  });

  const openPayment = (id: number) => { setSelectedId(id); setIsOpen(true); };
  const selectedPay = payables?.find(p => p.id === selectedId);

  const handlePay = () => {
    if (!selectedId || !selectedPay) return;
    const amount = parseFloat(payAmount) || 0;
    const remaining = (selectedPay as any).remainingAmount || 0;
    
    if (amount <= 0) {
      toast({ title: "Jumlah tidak valid", description: "Jumlah bayar harus lebih dari 0", variant: "destructive" });
      return;
    }
    
    if (amount > remaining) {
      toast({ title: "Jumlah terlalu besar", description: `Maksimal pembayaran adalah ${formatRupiah(remaining)}`, variant: "destructive" });
      return;
    }
    
    payMutation.mutate({ id: selectedId, data: { amount, paymentMethod: payMethod as any, notes: payNotes || undefined } });
  };

  const filtered = filterByDateRange(
    payables?.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = (p as any).supplierName?.toLowerCase().includes(q) || (p as any).invoiceNumber?.toLowerCase().includes(q);
      const matchStatus = activeTab === "semua" || p.status === activeTab || (activeTab === "belum_bayar" && p.status === "unpaid");
      return matchSearch && matchStatus;
    }) ?? [],
    dateFrom,
    dateTo,
  );

  const groupedFiltered = useMemo(() => {
    const groups: Record<number, any[]> = {};
    filtered.forEach(p => {
      const sid = p.supplierId || 0;
      if (!groups[sid]) groups[sid] = [];
      groups[sid].push(p);
    });
    return Object.values(groups);
  }, [filtered]);

  const totalHutang = payables?.filter(p => p.status !== "lunas").reduce((sum, p) => sum + ((p as any).remainingAmount ?? 0), 0) ?? 0;
  const overdueCount = payables?.filter(p => (p as any).isOverdue).length ?? 0;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Static Top Strip */}
      <div className="flex-none space-y-2 pb-2">
        <div className="flex items-center justify-between pt-1 pb-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hutang</h1>
            <p className="text-sm text-slate-500">Kelola tagihan dari supplier</p>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-red-50 rounded-2xl p-3 border border-red-100 flex flex-col justify-center relative overflow-hidden">
            <span className="text-[10px] font-semibold text-red-600 mb-0.5">Total Aktif</span>
            <span className="text-sm font-bold text-red-900">{formatRupiah(totalHutang)}</span>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-slate-500 mb-0.5">Tagihan Aktif</span>
            <span className="text-sm font-bold text-slate-900">{payables?.filter(p => p.status !== "lunas").length ?? 0}</span>
          </div>
          <div className={`${overdueCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"} rounded-2xl p-3 border flex flex-col justify-center`}>
            <span className={`text-[10px] font-semibold mb-0.5 ${overdueCount > 0 ? "text-red-600" : "text-slate-500"}`}>Jatuh Tempo</span>
            <span className={`text-sm font-bold ${overdueCount > 0 ? "text-red-700" : "text-slate-900"}`}>{overdueCount} Tagihan</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-3 border-b border-slate-200">
          {(['semua', 'belum_bayar', 'partial', 'lunas'] as const).map((tab) => {
            const label = tab === 'belum_bayar' ? 'Belum Bayar' : tab === 'partial' ? 'Sebagian' : tab === 'lunas' ? 'Lunas' : 'Semua';
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
            <Input placeholder="Cari supplier atau invoice..." className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
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
            <div className="text-center py-16"><Receipt className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Tidak ada hutang</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200 shadow-sm">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8 whitespace-nowrap">#</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Invoice</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Supplier</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Terbayar</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Sisa</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Jatuh Tempo</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((p, idx) => {
                    const isOverdue = (p as any).isOverdue && p.status !== "lunas";
                    let badgeClass = "bg-red-100 text-red-700";
                    if (p.status === "lunas") badgeClass = "bg-green-100 text-green-700";
                    else if (p.status === "partial") badgeClass = "bg-blue-100 text-blue-700";
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${isOverdue ? 'bg-red-50/20' : ''}`}>
                        <td className="py-2.5 px-3 text-xs text-slate-400 font-mono whitespace-nowrap">{(currentPage - 1) * 20 + idx + 1}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">{formatDate((p as any).createdAt)}</td>
                        <td className="py-2.5 px-3 text-xs font-mono text-slate-500 whitespace-nowrap">{(p as any).invoiceNumber || `#${p.id}`}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">{(p as any).supplierName || "—"}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap">{formatRupiah((p as any).totalAmount ?? 0)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold whitespace-nowrap">{formatRupiah((p as any).paidAmount ?? 0)}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${(p as any).remainingAmount > 0 ? 'text-red-600' : 'text-slate-400'}`}>{(p as any).remainingAmount > 0 ? formatRupiah((p as any).remainingAmount) : '—'}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>{p.status?.replace("_", " ")}</span>
                        </td>
                        <td className={`py-2.5 px-3 text-center text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>{formatDate((p as any).dueDate)}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {p.status !== "lunas" && (
                            <button className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors mx-auto" title="Bayar" onClick={() => openPayment(p.id)}>
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
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
          <span className="text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)} dari {filtered.length} hutang</span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setSelectedId(null); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl p-0 overflow-hidden">
          <DrawerTitle className="sr-only">Bayar Hutang</DrawerTitle>
          <DrawerDescription className="sr-only">Form to pay debt to supplier</DrawerDescription>
          
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 px-6 py-4 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Bayar Hutang</h2>
              <p className="text-violet-200 text-xs">Isi formulir untuk mencatat pembayaran hutang</p>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-6">
          {selectedPay && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Supplier:</span><span className="font-medium">{(selectedPay as any).supplierName}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sisa Hutang:</span>
                  <span 
                    className="font-bold text-destructive cursor-pointer hover:underline hover:text-red-700 transition-colors"
                    onClick={() => setPayAmount(String((selectedPay as any).remainingAmount))}
                    title="Klik untuk bayar lunas"
                  >
                    {formatRupiah((selectedPay as any).remainingAmount)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Jumlah Bayar (Rp)</label>
                <Input type="number" min={0} placeholder="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={parseFloat(payAmount) > ((selectedPay as any).remainingAmount || 0) ? "border-red-500 focus-visible:ring-red-500" : ""} />
                
                {/* Real-time Validation and Formatting Preview */}
                {payAmount && (
                  <div className="mt-1.5 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-violet-600 block bg-violet-50 px-2 py-1 rounded-md border border-violet-100">
                      Preview: {formatRupiah(parseFloat(payAmount) || 0)}
                    </span>
                    {parseFloat(payAmount) <= 0 && (
                      <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Harus lebih dari 0</span>
                    )}
                    {parseFloat(payAmount) > ((selectedPay as any).remainingAmount || 0) && (
                      <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Melebihi sisa hutang ({formatRupiah((selectedPay as any).remainingAmount)})</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Metode Pembayaran</label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Catatan</label>
                <Input placeholder="Catatan opsional" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
              </div>
            </div>
          )}
          </div>
          <DrawerFooter className="px-0 pt-4 flex-row gap-2">
            <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => { setIsOpen(false); setSelectedId(null); }}>Batal</Button>
            <Button className="flex-1" onClick={handlePay} disabled={!payAmount || payMutation.isPending}>Simpan Pembayaran</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

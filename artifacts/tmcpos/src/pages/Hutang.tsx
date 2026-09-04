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
        <div className="flex items-center justify-between pt-1 pb-1 hidden md:flex">
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
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari..." className="pl-9 bg-white border-slate-200 rounded-xl h-10 shadow-sm w-full text-sm" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="shrink-0">
            <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); setCurrentPage(1); }} />
          </div>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="flex flex-col gap-3 min-h-0">
          {isLoading ? (
            <div className="p-4 space-y-3 bg-white rounded-[20px] border border-slate-100">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
          ) : filtered?.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-slate-100 text-center py-16 shadow-sm"><Receipt className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Tidak ada hutang</h3></div>
          ) : (
            <div className="flex flex-col gap-3 pb-4">
              {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((p, idx) => {
                const isOverdue = (p as any).isOverdue && p.status !== "lunas";
                let badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
                if (p.status === "lunas") badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
                else if (p.status === "partial") badgeClass = "bg-blue-50 text-blue-600 border-blue-100";
                
                return (
                  <div key={p.id} className={`bg-white rounded-[20px] p-4 sm:p-5 border shadow-sm transition-all flex flex-col gap-4 ${isOverdue ? 'border-rose-200 shadow-rose-100/50' : 'border-slate-100 shadow-slate-200/40'}`}>
                    {/* Top Section: Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">#{(currentPage - 1) * 20 + idx + 1}</span>
                          <h3 className="font-bold text-slate-800 text-[15px] sm:text-base leading-tight">{(p as any).supplierName || "—"}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{(p as any).invoiceNumber || `#${p.id}`}</span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-[11px] font-medium text-slate-500">{formatDate((p as any).createdAt)}</span>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${badgeClass}`}>
                        {p.status?.replace("_", " ")}
                      </div>
                    </div>

                    {/* Middle Section: Financial Summary */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50/50 rounded-xl p-3 border border-slate-100/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total Tagihan</span>
                        <span className="font-semibold text-slate-700 text-sm">{formatRupiah((p as any).totalAmount ?? 0)}</span>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Terbayar</span>
                        <span className="font-semibold text-emerald-600 text-sm">{formatRupiah((p as any).paidAmount ?? 0)}</span>
                      </div>
                    </div>

                    {/* Bottom Section: Due Date & Action */}
                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 border-dashed">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                            {isOverdue ? 'TERLAMBAT' : 'JATUH TEMPO'}
                          </span>
                        </div>
                        <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                          {formatDate((p as any).dueDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end text-right mr-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Sisa Hutang</span>
                          <span className={`font-bold text-sm leading-none ${(p as any).remainingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {(p as any).remainingAmount > 0 ? formatRupiah((p as any).remainingAmount) : 'LUNAS'}
                          </span>
                        </div>
                        {p.status !== "lunas" && (
                          <Button size="sm" onClick={() => openPayment(p.id)} className="h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-sm shadow-violet-200 gap-1.5 px-3">
                            <Plus className="w-3.5 h-3.5" />
                            Bayar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

      <Drawer open={isOpen} onOpenChange={(open) => { 
        if (!open) { 
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          window.scrollTo(0, 0);
          setTimeout(() => { setIsOpen(false); setSelectedId(null); }, 150);
        } else {
          setIsOpen(true);
        }
      }}>
        <DrawerContent className="max-h-[95vh] mx-auto w-full max-w-2xl p-0 overflow-hidden">
          <DrawerTitle className="sr-only">Bayar Hutang</DrawerTitle>
          <DrawerDescription className="sr-only">Form to pay debt to supplier</DrawerDescription>
          
          <div className="flex flex-col h-full" style={{ maxHeight: 'calc(95vh - 5rem)' }}>
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
            
            <div className="overflow-y-auto flex-1 p-5 bg-slate-50/50">
            {selectedPay && (
              <div className="space-y-5 pb-6">
                <div className="p-4 bg-white rounded-[16px] border border-slate-100 shadow-sm text-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Supplier:</span><span className="font-bold text-slate-800">{(selectedPay as any).supplierName}</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 border-dashed">
                    <span className="text-slate-500 font-medium">Sisa Hutang:</span>
                    <span 
                      className="font-bold text-rose-600 text-base cursor-pointer hover:underline hover:text-rose-700 transition-colors bg-rose-50 px-2 py-0.5 rounded-md"
                      onClick={() => setPayAmount(String(Math.round(Number((selectedPay as any).remainingAmount || 0))))}
                      title="Klik untuk bayar lunas"
                    >
                      {formatRupiah((selectedPay as any).remainingAmount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Jumlah Bayar (Rp)</label>
                    <Input type="number" min={0} placeholder="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={`h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500 text-base font-semibold ${parseFloat(payAmount) > ((selectedPay as any).remainingAmount || 0) ? "border-rose-500 focus-visible:ring-rose-500 bg-rose-50" : ""}`} />
                    
                    {/* Real-time Validation and Formatting Preview */}
                    {payAmount && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-violet-700 block bg-violet-100/50 px-2.5 py-1.5 rounded-lg border border-violet-100">
                          Preview: {formatRupiah(parseFloat(payAmount) || 0)}
                        </span>
                        {parseFloat(payAmount) <= 0 && (
                          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-wider"><AlertTriangle className="h-3 w-3" /> Harus lebih dari 0</span>
                        )}
                        {parseFloat(payAmount) > ((selectedPay as any).remainingAmount || 0) && (
                          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-wider"><AlertTriangle className="h-3 w-3" /> Melebihi sisa hutang</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Metode Pembayaran</label>
                    <Select value={payMethod} onValueChange={setPayMethod}>
                      <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500 font-medium text-slate-700"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="tunai" className="font-medium">Tunai</SelectItem>
                        <SelectItem value="transfer" className="font-medium">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Catatan</label>
                    <Input placeholder="Catatan opsional..." value={payNotes} onChange={e => setPayNotes(e.target.value)} className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500" />
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Fixed Footer */}
            <div className="flex-none bg-white border-t border-slate-100 px-5 py-4 flex gap-3 z-10 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
              <Button type="button" variant="ghost" className="flex-1 h-12 rounded-[14px] font-bold border border-slate-200 text-slate-600 hover:bg-slate-50" 
                onClick={() => { 
                  if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
                  window.scrollTo(0, 0);
                  setTimeout(() => { setIsOpen(false); setSelectedId(null); }, 150);
                }}>
                Batal
              </Button>
              <Button className="flex-[2] h-12 rounded-[14px] font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm" onClick={handlePay} disabled={!payAmount || payMutation.isPending}>
                {payMutation.isPending ? "Memproses..." : "Simpan Pembayaran"}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

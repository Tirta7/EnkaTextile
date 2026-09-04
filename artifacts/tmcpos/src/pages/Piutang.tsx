import React, { useState } from "react";
import { PaginationControl } from "../components/PaginationControl";
import { useListReceivables, useGetReceivable, useAddReceivablePayment, getListReceivablesQueryKey, getGetReceivableQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wallet, Plus, AlertTriangle, CheckCircle2, AlertCircle, DollarSign, ChevronDown, ChevronUp, Clock, CreditCard, Banknote, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

export default function Piutang() {
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
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [expandedDetailMap, setExpandedDetailMap] = useState<Record<number, any>>({});

  const { data: receivables, isLoading } = useListReceivables({}, { query: { queryKey: getListReceivablesQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: selectedDetail } = useGetReceivable(selectedId || 0, {
    query: { queryKey: getGetReceivableQueryKey(selectedId || 0), enabled: !!selectedId && isOpen }
  });

  const refreshExpandedDetail = (recId: number) => {
    fetch(`/api/receivables/${recId}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setExpandedDetailMap(prev => ({ ...prev, [recId]: data })));
  };

  const toggleExpand = (recId: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(recId)) { next.delete(recId); }
      else {
        next.add(recId);
        if (!expandedDetailMap[recId]) refreshExpandedDetail(recId);
      }
      return next;
    });
  };

  const payMutation = useAddReceivablePayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReceivablesQueryKey({}) });
        if (selectedId) {
          queryClient.invalidateQueries({ queryKey: getGetReceivableQueryKey(selectedId) });
          refreshExpandedDetail(selectedId);
          setExpandedIds(prev => new Set([...prev, selectedId]));
        }
        setIsOpen(false); setSelectedId(null); setPayAmount(""); setPayNotes(""); setPayDate(new Date().toISOString().split("T")[0]);
        toast({ title: "Pembayaran cicilan berhasil dicatat" });
      }
    }
  });

  const openPayment = (id: number) => { setSelectedId(id); setIsOpen(true); };
  const selectedRec = receivables?.find(r => r.id === selectedId);

  const handlePay = () => {
    if (!selectedId || !selectedRec) return;
    const amount = parseFloat(payAmount) || 0;
    const remaining = (selectedRec as any).remainingAmount || 0;
    if (amount <= 0) { toast({ title: "Jumlah tidak valid", description: "Harus lebih dari 0", variant: "destructive" }); return; }
    if (amount > remaining) { toast({ title: "Jumlah terlalu besar", description: `Maks: ${formatRupiah(remaining)}`, variant: "destructive" }); return; }
    payMutation.mutate({ id: selectedId, data: { amount, paymentMethod: payMethod as any, notes: payNotes || undefined, paidAt: payDate ? new Date(payDate).toISOString() : undefined } });
  };

  const filtered = filterByDateRange(
    receivables?.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = (r as any).customerName?.toLowerCase().includes(q) || (r as any).invoiceNumber?.toLowerCase().includes(q);
      const matchStatus = activeTab === "semua" || r.status === activeTab || (activeTab === "belum_bayar" && r.status === "unpaid");
      return matchSearch && matchStatus;
    }) ?? [], dateFrom, dateTo,
  );

  const totalPiutang = receivables?.filter(r => r.status !== "lunas").reduce((sum, r) => sum + ((r as any).remainingAmount ?? 0), 0) ?? 0;
  const overdueCount = receivables?.filter(r => (r as any).isOverdue).length ?? 0;
  const methodLabel: Record<string, string> = { tunai: "Tunai", transfer: "Transfer", cashless: "Cashless/QRIS" };
  const methodIcon = (m: string) => {
    if (m === "transfer") return <CreditCard className="w-3 h-3" />;
    if (m === "cashless") return <QrCode className="w-3 h-3" />;
    return <Banknote className="w-3 h-3" />;
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Static Top Strip */}
      <div className="flex-none space-y-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Piutang</h1>
            <p className="text-[13px] font-medium text-slate-500 mt-0.5">Kelola tagihan pelanggan Anda</p>
          </div>
        </div>
        
        {/* Premium Summary Card (iOS Wallet Style) - Compact Version */}
        <div className="bg-slate-900 rounded-[20px] p-4 text-white shadow-lg shadow-slate-900/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500 rounded-full blur-[50px] opacity-20 -mr-8 -mt-8 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-[40px] opacity-20 -ml-6 -mb-6 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col">
             <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-0.5">Total Piutang Aktif</span>
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{formatRupiah(totalPiutang)}</h2>
           </div>
           
           <div className="relative z-10 grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
             <div>
               <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest block mb-0.5">Invoice Aktif</span>
               <span className="text-xs font-semibold text-white">{receivables?.filter(r => r.status !== "lunas").length ?? 0} Tagihan</span>
             </div>
             <div>
               <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest block mb-0.5">Jatuh Tempo</span>
               <div className="flex items-center gap-1.5">
                 {overdueCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                 <span className={`text-xs font-semibold ${overdueCount > 0 ? "text-red-400" : "text-white"}`}>{overdueCount} Tagihan</span>
               </div>
             </div>
           </div>
        </div>

        {/* iOS Segmented Control Tabs */}
        <div className="bg-slate-100/80 backdrop-blur-md p-1 rounded-[14px] flex w-full">
          {(["semua", "belum_bayar", "partial", "lunas"] as const).map((tab) => {
            const labels: Record<string, string> = { semua: "Semua", belum_bayar: "Belum Lunas", partial: "Sebagian", lunas: "Lunas" };
            const isActive = activeTab === tab;
            return (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`flex-1 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-bold rounded-[10px] transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {labels[tab]}
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

      {/* Scrollable List (iOS Style Cards) */}
      <div className="flex-1 overflow-auto min-h-0 pb-4">
        {isLoading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
        ) : filtered?.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 text-center py-20 shadow-sm"><Wallet className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Tidak ada piutang</h3></div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((r, idx) => {
              const isOverdue = (r as any).isOverdue && r.status !== "lunas";
              const isExpanded = expandedIds.has(r.id);
              const detail = expandedDetailMap[r.id];
              let badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
              if (r.status === "lunas") badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
              else if (r.status === "partial") badgeClass = "bg-blue-50 text-blue-600 border-blue-100";
              
              return (
                <div key={r.id} className={`bg-white rounded-[20px] p-4 sm:p-5 border shadow-sm transition-all flex flex-col gap-4 ${isOverdue ? 'border-rose-200 shadow-rose-100/50' : 'border-slate-100 shadow-slate-200/40'}`}>
                  {/* Top Section: Header */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">#{(currentPage - 1) * 20 + idx + 1}</span>
                        <h3 className="font-bold text-slate-800 text-[15px] sm:text-base leading-tight">{(r as any).customerName || "Pelanggan Anonim"}</h3>
                      </div>
                      <p className="text-slate-500 text-[11px] sm:text-xs font-medium">{formatDate(r.createdAt)} • <span className="font-mono">{(r as any).invoiceNumber || `#${r.id}`}</span></p>
                    </div>
                    <div className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0 ${badgeClass}`}>
                      {r.status?.replace("_", " ")}
                    </div>
                  </div>
                  
                  {/* Middle Section: Amounts */}
                  <div className="flex items-center justify-between bg-slate-50/50 rounded-xl p-3 border border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Total Tagihan</span>
                      <span className="font-bold text-slate-800 text-sm sm:text-[15px]">{formatRupiah((r as any).totalAmount)}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 mx-2"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Sisa Piutang</span>
                      <span className={`font-bold text-sm sm:text-[15px] ${(r as any).remainingAmount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {(r as any).remainingAmount > 0 ? formatRupiah((r as any).remainingAmount) : 'Lunas'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2.5 mt-0.5">
                    {(r as any).paidAmount > 0 && (
                      <button className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold flex justify-center items-center gap-1.5 transition-colors" onClick={() => toggleExpand(r.id)}>
                        {isExpanded ? <><ChevronUp className="w-4 h-4"/> Tutup Cicilan</> : <><Clock className="w-4 h-4"/> Riwayat</>}
                      </button>
                    )}
                    {r.status !== "lunas" && (
                      <button className="flex-[1.5] py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-bold flex justify-center items-center gap-1.5 transition-colors shadow-md shadow-violet-200" onClick={() => openPayment(r.id)}>
                        <Plus className="w-4 h-4"/> Bayar Cicilan
                      </button>
                    )}
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="mt-2 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      {!detail ? (
                        <div className="flex gap-2"><Skeleton className="h-10 w-full rounded-xl" /></div>
                      ) : !detail.payments || detail.payments.length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-medium text-center py-3 bg-slate-50 rounded-xl">Belum ada cicilan tercatat.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {detail.payments.map((p: any, pidx: number) => {
                            const dt = new Date(p.paidAt);
                            return (
                              <div key={p.id} className="flex justify-between items-center bg-white border border-slate-100 shadow-sm p-3 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                    {methodIcon(p.paymentMethod)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-700">{dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    <span className="text-[10px] font-medium text-slate-400 capitalize">{methodLabel[p.paymentMethod] || p.paymentMethod} {p.notes ? `• ${p.notes}` : ''}</span>
                                  </div>
                                </div>
                                <span className="font-bold text-emerald-600 text-[13px]">{formatRupiah(parseFloat(p.amount))}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {filtered && filtered.length > 20 && (
        <div className="flex-none border-t border-slate-200 bg-white px-3 sm:px-4 py-1 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between rounded-b-2xl shadow-sm gap-1 sm:gap-0">
          <span className="text-[10px] sm:text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)} dari {filtered.length} piutang</span>
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
          <DrawerTitle className="sr-only">Catat Pembayaran Cicilan</DrawerTitle>
          <DrawerDescription className="sr-only">Form to record an installment payment</DrawerDescription>
          
          <div className="flex flex-col h-full" style={{ maxHeight: 'calc(95vh - 5rem)' }}>
            {/* Gradient Header */}
            <div className="bg-linear-to-r from-violet-600 via-violet-500 to-indigo-600 px-6 py-4 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">Catat Pembayaran Cicilan</h2>
                <p className="text-violet-200 text-xs">Isi formulir untuk mencatat pembayaran piutang pelanggan</p>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-5 bg-slate-50/50">
            {selectedRec && (
              <div className="space-y-5 pb-6">
                <div className="p-4 bg-white rounded-[16px] border border-slate-100 shadow-sm text-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Pelanggan:</span><span className="font-bold text-slate-800">{(selectedRec as any).customerName || "-"}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Invoice:</span><span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{(selectedRec as any).invoiceNumber}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Grand Total:</span><span className="font-semibold">{formatRupiah((selectedRec as any).totalAmount)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Sudah Dibayar:</span><span className="font-semibold text-emerald-600">{formatRupiah((selectedRec as any).paidAmount)}</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 border-dashed">
                    <span className="text-slate-500 font-medium">Sisa Piutang:</span>
                    <span className="font-bold text-rose-600 text-base cursor-pointer hover:underline hover:text-rose-700 transition-colors bg-rose-50 px-2 py-0.5 rounded-md" 
                          onClick={() => setPayAmount(String(Math.round(Number((selectedRec as any).remainingAmount || 0))))} title="Klik untuk bayar lunas">
                      {formatRupiah((selectedRec as any).remainingAmount)}
                    </span>
                  </div>
                </div>

                {selectedDetail?.payments && (selectedDetail.payments as any[]).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Cicilan Sebelumnya</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedDetail.payments as any[]).map((p: any, idx: number) => {
                        const dt = new Date(p.paidAt);
                        return (
                          <div key={p.id} className="flex items-center justify-between bg-white rounded-[14px] px-3 py-2.5 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-700">{methodLabel[p.paymentMethod] || p.paymentMethod}</span>
                                <span className="text-[9px] text-slate-400">{dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} {dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </div>
                            <span className="font-bold text-emerald-600 text-xs">{formatRupiah(parseFloat(p.amount))}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Tanggal Pembayaran</label>
                    <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Jumlah Bayar Cicilan (Rp)</label>
                    <Input type="number" min={0} max={(selectedRec as any).remainingAmount} placeholder="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={`h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500 text-base font-semibold ${parseFloat(payAmount) > ((selectedRec as any).remainingAmount || 0) ? "border-rose-500 focus-visible:ring-rose-500 bg-rose-50" : ""}`} />
                    {payAmount && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-violet-700 block bg-violet-100/50 px-2.5 py-1.5 rounded-lg border border-violet-100">
                          Preview: {formatRupiah(parseFloat(payAmount) || 0)}
                        </span>
                        {parseFloat(payAmount) <= 0 && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-wider"><AlertTriangle className="h-3 w-3" /> Harus lebih dari 0</span>}
                        {parseFloat(payAmount) > ((selectedRec as any).remainingAmount || 0) && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-wider"><AlertTriangle className="h-3 w-3" /> Melebihi sisa piutang</span>}
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
                        <SelectItem value="cashless" className="font-medium">Cashless/QRIS</SelectItem>
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
                {payMutation.isPending ? "Menyimpan..." : "Simpan Cicilan"}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

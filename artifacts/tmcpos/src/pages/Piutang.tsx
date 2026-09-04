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
        setIsOpen(false); setSelectedId(null); setPayAmount(""); setPayNotes("");
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
    payMutation.mutate({ id: selectedId, data: { amount, paymentMethod: payMethod as any, notes: payNotes || undefined } });
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
      <div className="flex-none space-y-2 pb-2">
        <div className="flex items-center justify-between pt-1 pb-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Piutang</h1>
            <p className="text-sm text-slate-500">Kelola tagihan pelanggan</p>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-violet-50 rounded-2xl p-3 border border-violet-100 flex flex-col justify-center relative overflow-hidden">
            <span className="text-[10px] font-semibold text-violet-600 mb-0.5">Total Aktif</span>
            <span className="text-sm font-bold text-violet-900">{formatRupiah(totalPiutang)}</span>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-slate-500 mb-0.5">Invoice Aktif</span>
            <span className="text-sm font-bold text-slate-900">{receivables?.filter(r => r.status !== "lunas").length ?? 0}</span>
          </div>
          <div className={`${overdueCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"} rounded-2xl p-3 border flex flex-col justify-center`}>
            <span className={`text-[10px] font-semibold mb-0.5 ${overdueCount > 0 ? "text-red-600" : "text-slate-500"}`}>Jatuh Tempo</span>
            <span className={`text-sm font-bold ${overdueCount > 0 ? "text-red-700" : "text-slate-900"}`}>{overdueCount} Invoice</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-3 border-b border-slate-200">
          {(["semua", "belum_bayar", "partial", "lunas"] as const).map((tab) => {
            const labels: Record<string, string> = { semua: "Semua", belum_bayar: "Belum Bayar", partial: "Sebagian", lunas: "Lunas" };
            return (
              <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`pb-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'}`}>
                {labels[tab]}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-violet-600" />}
              </button>
            );
          })}
        </div>
        {/* Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari pelanggan atau invoice..." className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
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
            <div className="text-center py-16"><Wallet className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Tidak ada piutang</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200 shadow-sm">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8 whitespace-nowrap">#</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Invoice</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pelanggan</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Terbayar</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Sisa</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-28 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((r, idx) => {
                    const pct = (r as any).totalAmount > 0 ? Math.round(((r as any).paidAmount / (r as any).totalAmount) * 100) : 0;
                    const isOverdue = (r as any).isOverdue && r.status !== "lunas";
                    const isExpanded = expandedIds.has(r.id);
                    const detail = expandedDetailMap[r.id];
                    let badgeClass = "bg-red-100 text-red-700";
                    if (r.status === "lunas") badgeClass = "bg-green-100 text-green-700";
                    else if (r.status === "partial") badgeClass = "bg-blue-100 text-blue-700";
                    return (
                      <React.Fragment key={r.id}>
                        <tr className={`hover:bg-slate-50/80 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
                          <td className="py-2.5 px-3 text-xs text-slate-400 font-mono whitespace-nowrap">{(currentPage - 1) * 20 + idx + 1}</td>
                          <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                          <td className="py-2.5 px-3 text-xs font-mono text-slate-500 whitespace-nowrap">{(r as any).invoiceNumber || `#${r.id}`}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">{(r as any).customerName || "—"}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap">{formatRupiah((r as any).totalAmount)}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold whitespace-nowrap">{formatRupiah((r as any).paidAmount)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${(r as any).remainingAmount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{(r as any).remainingAmount > 0 ? formatRupiah((r as any).remainingAmount) : '—'}</td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>{r.status?.replace("_", " ")}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1 justify-center">
                              {(r as any).paidAmount > 0 && (
                                <button title={isExpanded ? "Sembunyikan cicilan" : "Lihat cicilan"} className="w-7 h-7 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 flex items-center justify-center transition-colors" onClick={() => toggleExpand(r.id)}>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              {r.status !== "lunas" && (
                                <button title="Bayar" className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors" onClick={() => openPayment(r.id)}>
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${r.id}-detail`} className="bg-slate-50/70">
                            <td colSpan={9} className="px-6 py-3">
                              {!detail ? (
                                <div className="flex gap-2"><Skeleton className="h-8 w-full rounded-lg" /><Skeleton className="h-8 w-full rounded-lg" /></div>
                              ) : !detail.payments || detail.payments.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-2">Belum ada cicilan via Piutang. DP awal sudah tercatat di transaksi.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs border-collapse">
                                    <thead><tr className="border-b border-slate-200"><th className="text-left py-1.5 px-2 font-bold text-slate-500 uppercase w-8 whitespace-nowrap">Thn</th><th className="text-left py-1.5 px-2 font-bold text-slate-500 uppercase whitespace-nowrap">Tanggal</th><th className="text-left py-1.5 px-2 font-bold text-slate-500 uppercase whitespace-nowrap">Metode</th><th className="text-right py-1.5 px-2 font-bold text-slate-500 uppercase whitespace-nowrap">Nominal</th><th className="text-left py-1.5 px-2 font-bold text-slate-500 uppercase whitespace-nowrap">Catatan</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {detail.payments.map((p: any, pidx: number) => {
                                        const dt = new Date(p.paidAt);
                                        return (
                                          <tr key={p.id} className="hover:bg-white/70">
                                            <td className="py-1.5 px-2 text-slate-400 font-mono">{pidx + 1}</td>
                                            <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap">{dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} <span className="text-indigo-500 font-medium">{dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span></td>
                                            <td className="py-1.5 px-2 text-slate-600 capitalize">{methodLabel[p.paymentMethod] || p.paymentMethod}</td>
                                            <td className="py-1.5 px-2 text-right font-bold text-emerald-700">{formatRupiah(parseFloat(p.amount))}</td>
                                            <td className="py-1.5 px-2 text-slate-400 italic">{p.notes || "—"}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
          <span className="text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)} dari {filtered.length} piutang</span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setSelectedId(null); } }}>
        <DrawerContent className="max-h-[92vh] mx-auto w-full max-w-2xl p-0 overflow-hidden">
          <DrawerTitle className="sr-only">Catat Pembayaran Cicilan</DrawerTitle>
          <DrawerDescription className="sr-only">Form to record an installment payment</DrawerDescription>
          
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
          
          <div className="overflow-y-auto max-h-[calc(92vh-5rem)] p-6">
          {selectedRec && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-sm space-y-2 border border-slate-100">
                <div className="flex justify-between"><span className="text-slate-500">Pelanggan:</span><span className="font-semibold">{(selectedRec as any).customerName || "-"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Invoice:</span><span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">{(selectedRec as any).invoiceNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Grand Total:</span><span className="font-semibold">{formatRupiah((selectedRec as any).totalAmount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Sudah Dibayar:</span><span className="font-semibold text-emerald-600">{formatRupiah((selectedRec as any).paidAmount)}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-700">Sisa Piutang:</span>
                  <span className="font-bold text-violet-700 cursor-pointer hover:underline" onClick={() => setPayAmount(String((selectedRec as any).remainingAmount))} title="Klik untuk bayar lunas">{formatRupiah((selectedRec as any).remainingAmount)}</span>
                </div>
              </div>

              {selectedDetail?.payments && (selectedDetail.payments as any[]).length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Cicilan Sebelumnya</p>
                  {(selectedDetail.payments as any[]).map((p: any, idx: number) => {
                    const dt = new Date(p.paidAt);
                    return (
                      <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-600">{methodLabel[p.paymentMethod] || p.paymentMethod}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5">{dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} {dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-700 text-sm">{formatRupiah(parseFloat(p.amount))}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">Jumlah Bayar Cicilan (Rp)</label>
                <Input type="number" min={0} max={(selectedRec as any).remainingAmount} placeholder="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={parseFloat(payAmount) > ((selectedRec as any).remainingAmount || 0) ? "border-red-500 focus-visible:ring-red-500" : ""} />
                {payAmount && (
                  <div className="mt-1.5 space-y-1">
                    <span className="text-xs font-semibold text-violet-600 block bg-violet-50 px-2 py-1 rounded-md border border-violet-100">Preview: {formatRupiah(parseFloat(payAmount) || 0)}</span>
                    {parseFloat(payAmount) <= 0 && <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Harus lebih dari 0</span>}
                    {parseFloat(payAmount) > ((selectedRec as any).remainingAmount || 0) && <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Melebihi sisa piutang</span>}
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
                    <SelectItem value="cashless">Cashless/QRIS</SelectItem>
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
            <Button type="button" variant="ghost" className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => { setIsOpen(false); setSelectedId(null); }}>Batal</Button>
            <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={handlePay} disabled={!payAmount || payMutation.isPending}>
              {payMutation.isPending ? "Menyimpan..." : "Simpan Cicilan"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListReceivables, useAddReceivablePayment, getListReceivablesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wallet, Plus, AlertTriangle, CheckCircle2, AlertCircle, ArrowRightCircle, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

const STATUS_COLORS: Record<string, string> = {
  lunas: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  belum_bayar: "bg-red-100 text-red-700 border-red-200",
};

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

  const { data: receivables, isLoading } = useListReceivables({}, { query: { queryKey: getListReceivablesQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const payMutation = useAddReceivablePayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReceivablesQueryKey({}) });
        setIsOpen(false);
        setSelectedId(null);
        setPayAmount("");
        toast({ title: "Pembayaran berhasil dicatat" });
      }
    }
  });

  const openPayment = (id: number) => { setSelectedId(id); setIsOpen(true); };
  const selectedRec = receivables?.find(r => r.id === selectedId);

  const handlePay = () => {
    if (!selectedId || !payAmount) return;
    payMutation.mutate({ id: selectedId, data: { amount: parseFloat(payAmount), paymentMethod: payMethod as any, notes: payNotes || undefined } });
  };

  const filtered = filterByDateRange(
    receivables?.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = (r as any).customerName?.toLowerCase().includes(q) || (r as any).invoiceNumber?.toLowerCase().includes(q);
      const matchStatus = activeTab === "semua" || r.status === activeTab;
      return matchSearch && matchStatus;
    }) ?? [],
    dateFrom,
    dateTo,
  );

  const totalPiutang = receivables?.filter(r => r.status !== "lunas").reduce((sum, r) => sum + ((r as any).remainingAmount ?? 0), 0) ?? 0;
  const overdueCount = receivables?.filter(r => (r as any).isOverdue).length ?? 0;

  return (
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col pt-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Piutang</h1>
            <p className="text-sm text-slate-500">Kelola tagihan pelanggan</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-violet-50 rounded-3xl p-4 border border-violet-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <span className="text-xs font-semibold text-violet-600 mb-1">Total Aktif</span>
          <span className="text-lg font-bold text-violet-900">{formatRupiah(totalPiutang)}</span>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-slate-200 flex flex-col justify-center">
          <span className="text-xs font-semibold text-slate-500 mb-1">Invoice Aktif</span>
          <span className="text-lg font-bold text-slate-900">{receivables?.filter(r => r.status !== "lunas").length ?? 0}</span>
        </div>
        <div className={`${overdueCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"} rounded-3xl p-4 border flex flex-col justify-center col-span-2 md:col-span-1`}>
          <span className={`text-xs font-semibold mb-1 ${overdueCount > 0 ? "text-red-600" : "text-slate-500"}`}>Jatuh Tempo</span>
          <span className={`text-lg font-bold ${overdueCount > 0 ? "text-red-700" : "text-slate-900"}`}>{overdueCount} Invoice</span>
        </div>
      </div>

      {/* Scrollable Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {(['semua', 'belum_bayar', 'partial', 'lunas'] as const).map((tab) => {
          let label = "Semua";
          if (tab === "belum_bayar") label = "Belum Bayar";
          if (tab === "partial") label = "Sebagian";
          if (tab === "lunas") label = "Lunas";
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
            placeholder="Cari pelanggan atau invoice..." 
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
            <Wallet className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada piutang</h3>
            <p className="text-sm text-slate-500 mt-1">Belum ada tagihan untuk pelanggan.</p>
          </div>
        ) : (
          <>
            {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((r) => {
              const pct = (r as any).totalAmount > 0 ? Math.round(((r as any).paidAmount / (r as any).totalAmount) * 100) : 0;
              const isOverdue = (r as any).isOverdue && r.status !== "lunas";
              
              // Decorative Badge Class
              let badgeClass = "bg-slate-100 text-slate-700";
              let iconClass = "text-slate-500";
              let iconBgClass = "bg-slate-50 border-slate-100";
              let StatusIcon = AlertCircle;
              
              if (r.status === 'lunas') {
                badgeClass = "bg-green-100 text-green-700";
                iconClass = "text-green-500";
                iconBgClass = "bg-green-50 border-green-100";
                StatusIcon = CheckCircle2;
              } else if (r.status === 'partial') {
                badgeClass = "bg-blue-100 text-blue-700";
                iconClass = "text-blue-500";
                iconBgClass = "bg-blue-50 border-blue-100";
                StatusIcon = DollarSign;
              } else {
                badgeClass = "bg-red-100 text-red-700";
                iconClass = "text-red-500";
                iconBgClass = "bg-red-50 border-red-100";
                StatusIcon = AlertTriangle;
              }

              return (
                <div key={r.id} className={`bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border ${isOverdue ? 'border-red-200 bg-red-50/10' : 'border-slate-100'} flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md`}>
                  
                  {/* Decorative side accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? 'bg-red-500' : badgeClass.split(' ')[0]}`} />

                  {/* Header: Waktu & Invoice */}
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {formatDate(r.createdAt)}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-full inline-block mt-1">
                        {(r as any).invoiceNumber || `#${r.id}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block">
                        {formatRupiah((r as any).totalAmount)}
                      </span>
                      <span className={`text-[10px] font-medium block mt-0.5 ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                        Jatuh Tempo: {formatDate((r as any).dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Body: Info Pelanggan */}
                  <div className="flex gap-3 items-center pl-2">
                    <div className={`w-[48px] h-[48px] rounded-2xl shrink-0 flex items-center justify-center border ${iconBgClass}`}>
                      <StatusIcon className={`w-6 h-6 ${iconClass}`} strokeWidth={2} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-[15px] truncate">
                        {(r as any).customerName || "-"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>
                          {r.status?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    
                    {r.status !== "lunas" && (
                      <Button size="sm" className="h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4 shadow-sm" onClick={() => openPayment(r.id)}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Bayar
                      </Button>
                    )}
                  </div>

                  {/* Footer: Progress Pembayaran */}
                  <div className="mt-2 pl-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-500">Progress Pembayaran</span>
                      <span className="font-bold text-slate-700">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-slate-100" />
                    <div className="flex justify-between text-[11px] mt-1.5">
                      <span className="text-slate-400">Terbayar: <span className="font-medium text-slate-600">{formatRupiah((r as any).paidAmount)}</span></span>
                      {(r as any).remainingAmount > 0 && (
                        <span className="text-amber-600 font-medium">Sisa: {formatRupiah((r as any).remainingAmount)}</span>
                      )}
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

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setSelectedId(null); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Catat Pembayaran Piutang</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          {selectedRec && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Pelanggan:</span><span className="font-medium">{(selectedRec as any).customerName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sisa Piutang:</span><span className="font-bold text-primary">{formatRupiah((selectedRec as any).remainingAmount)}</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Jumlah Bayar (Rp)</label>
                <Input type="number" min={0} max={(selectedRec as any).remainingAmount} placeholder="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
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
            <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => { setIsOpen(false); setSelectedId(null); }}>Batal</Button>
            <Button className="flex-1" onClick={handlePay} disabled={!payAmount || payMutation.isPending}>Simpan Pembayaran</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

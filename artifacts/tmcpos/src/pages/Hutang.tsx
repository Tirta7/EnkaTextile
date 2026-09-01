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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
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
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col pt-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hutang</h1>
            <p className="text-sm text-slate-500">Kelola tagihan dari supplier</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-red-50 rounded-3xl p-4 border border-red-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Receipt className="w-24 h-24 text-red-500" />
          </div>
          <span className="text-xs font-semibold text-red-600 mb-1">Total Aktif</span>
          <span className="text-lg font-bold text-red-900">{formatRupiah(totalHutang)}</span>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-slate-200 flex flex-col justify-center">
          <span className="text-xs font-semibold text-slate-500 mb-1">Tagihan Aktif</span>
          <span className="text-lg font-bold text-slate-900">{payables?.filter(p => p.status !== "lunas").length ?? 0}</span>
        </div>
        <div className={`${overdueCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"} rounded-3xl p-4 border flex flex-col justify-center col-span-2 md:col-span-1`}>
          <span className={`text-xs font-semibold mb-1 ${overdueCount > 0 ? "text-red-600" : "text-slate-500"}`}>Jatuh Tempo</span>
          <span className={`text-lg font-bold ${overdueCount > 0 ? "text-red-700" : "text-slate-900"}`}>{overdueCount} Tagihan</span>
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
            placeholder="Cari supplier atau invoice..." 
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
            <Receipt className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada hutang</h3>
            <p className="text-sm text-slate-500 mt-1">Belum ada tagihan dari supplier.</p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-4">
            {groupedFiltered?.slice((currentPage - 1) * 20, currentPage * 20).map((group: any[], groupIdx: number) => {
              const supplierName = group[0].supplierName || "Umum";
              const totalGroupAmount = group.reduce((sum: number, p: any) => sum + (p.totalAmount ?? 0), 0);
              const totalGroupPaid = group.reduce((sum: number, p: any) => sum + (p.paidAmount ?? 0), 0);
              const totalGroupRemaining = group.reduce((sum: number, p: any) => sum + (p.remainingAmount ?? 0), 0);
              const hasOverdue = group.some((p: any) => p.isOverdue && p.status !== "lunas");
              const pct = totalGroupAmount > 0 ? Math.round((totalGroupPaid / totalGroupAmount) * 100) : 0;
              const hasDebt = totalGroupRemaining > 0;

              let groupBadgeClass = "bg-slate-100 text-slate-700";
              let groupIconClass = "text-slate-500";
              let groupIconBgClass = "bg-slate-50 border-slate-100";
              let GroupStatusIcon = AlertCircle;

              if (!hasDebt) {
                groupBadgeClass = "bg-green-100 text-green-700";
                groupIconClass = "text-green-500";
                groupIconBgClass = "bg-green-50 border-green-100";
                GroupStatusIcon = CheckCircle2;
              } else if (totalGroupPaid > 0) {
                groupBadgeClass = "bg-blue-100 text-blue-700";
                groupIconClass = "text-blue-500";
                groupIconBgClass = "bg-blue-50 border-blue-100";
                GroupStatusIcon = DollarSign;
              } else {
                groupBadgeClass = "bg-red-100 text-red-700";
                groupIconClass = "text-red-500";
                groupIconBgClass = "bg-red-50 border-red-100";
                GroupStatusIcon = AlertTriangle;
              }

              return (
                <AccordionItem value={`supplier-${group[0].supplierId || groupIdx}`} key={`supplier-${group[0].supplierId || groupIdx}`} className={`bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border ${hasOverdue ? 'border-red-200 bg-red-50/5' : 'border-slate-100'} overflow-hidden`}>
                  <AccordionTrigger className="p-4 hover:no-underline hover:bg-slate-50/50 transition-colors [&[data-state=open]]:border-b border-slate-100 relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasOverdue ? 'bg-red-500' : groupBadgeClass.split(' ')[0]}`} />
                    
                    <div className="flex w-full gap-3 items-center pl-2 pr-2">
                      <div className={`w-[48px] h-[48px] rounded-2xl shrink-0 flex items-center justify-center border ${groupIconBgClass}`}>
                        <GroupStatusIcon className={`w-6 h-6 ${groupIconClass}`} strokeWidth={2} />
                      </div>
                      
                      <div className="flex-1 min-w-0 text-left flex flex-col justify-center">
                        <h3 className="font-bold text-slate-800 text-[15px] truncate">
                          {supplierName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${groupBadgeClass}`}>
                        {hasDebt ? `${group.filter((p: any) => p.status !== 'lunas').length} Tagihan` : 'Lunas'}
                          </span>
                          {hasOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-100 text-red-700">
                              Jatuh Tempo
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end justify-center mr-2">
                        <span className="text-sm font-bold text-slate-900 block leading-tight mb-0.5">
                          {formatRupiah(totalGroupRemaining)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Sisa Hutang</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="p-4 pt-4 bg-slate-50/50 border-t border-slate-100">
                    <div className="space-y-3">
                      {group.map((p: any) => {
                        const total = (p as any).totalAmount ?? 0;
                        const paid = (p as any).paidAmount ?? 0;
                        const itemPct = total > 0 ? Math.round((paid / total) * 100) : 0;
                        const isOverdue = (p as any).isOverdue && p.status !== "lunas";
                        
                        let badgeClass = "bg-slate-100 text-slate-700";
                        if (p.status === 'lunas') badgeClass = "bg-green-100 text-green-700";
                        else if (p.status === 'partial') badgeClass = "bg-blue-100 text-blue-700";
                        else badgeClass = "bg-red-100 text-red-700";

                        return (
                          <div key={p.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${isOverdue ? 'border-red-200' : 'border-slate-200'} flex flex-col gap-3 relative overflow-hidden`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                  {formatDate((p as any).createdAt)}
                                </span>
                                <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-1 rounded-md inline-block">
                                  {(p as any).invoiceNumber || `#${p.id}`}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-slate-900 block mb-1">
                                  {formatRupiah(total)}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>
                                  {p.status?.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                              <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                                Tempo: {formatDate((p as any).dueDate)}
                              </span>
                              {p.status !== "lunas" && (
                                <Button size="sm" className="h-7 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-[11px] px-4 shadow-sm" onClick={() => openPayment(p.id)}>
                                  <Plus className="mr-1 h-3 w-3" /> Bayar
                                </Button>
                              )}
                            </div>
                            
                            <div className="mt-1 border-t border-slate-100 pt-3">
                              <div className="flex justify-between text-[11px] mb-1.5">
                                <span className="font-medium text-slate-500">Progress Pembayaran</span>
                                <span className="font-bold text-slate-700">{itemPct}%</span>
                              </div>
                              <Progress value={itemPct} className="h-1.5 bg-slate-100" />
                              <div className="flex justify-between text-[11px] mt-1.5">
                                <span className="text-slate-400">Terbayar: <span className="font-medium text-slate-600">{formatRupiah(paid)}</span></span>
                                {(p as any).remainingAmount > 0 && (
                                  <span className="text-red-600 font-medium">Sisa: {formatRupiah((p as any).remainingAmount)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
        {groupedFiltered && groupedFiltered.length > 20 && (
          <div className="pt-4 flex justify-center pb-8">
            <PaginationControl currentPage={currentPage} totalPages={Math.ceil(groupedFiltered.length / 20)} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setSelectedId(null); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Bayar Hutang</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
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

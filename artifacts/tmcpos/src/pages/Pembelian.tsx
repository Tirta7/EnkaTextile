import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListPurchases, useCreatePurchase, useListSuppliers, useListProducts, useListPaymentMethods, getListPurchasesQueryKey, getListSuppliersQueryKey, getListProductsQueryKey, getListPaymentMethodsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Search, ShoppingBag, PlusCircle, CheckCircle2, Clock, AlertCircle, ArrowRightCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate, generateInvoiceNumber } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

type PurchaseItem = { productId: number; productName: string; rolls: number | ""; meters: number | ""; pricePerMeter: number | ""; subtotal: number; primaryUnit?: string; secondaryUnit?: string; barcode?: string; };

const STATUS_COLORS: Record<string, string> = {
  lunas: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  kredit: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Pembelian() {
  const [activeTab, setActiveTab] = useState<"semua" | "lunas" | "kredit" | "partial">("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplierId, setSupplierId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("tunai");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: purchases, isLoading } = useListPurchases({}, { query: { queryKey: getListPurchasesQueryKey({}) } });
  const { data: suppliers } = useListSuppliers({}, { query: { queryKey: getListSuppliersQueryKey({}) } });
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey() } });
  const { data: paymentMethods = [] } = useListPaymentMethods({ query: { queryKey: getListPaymentMethodsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreatePurchase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPurchasesQueryKey({}) });
        setIsOpen(false); resetForm();
        toast({ title: "Pembelian berhasil dicatat" });
      }
    }
  });

  const resetForm = () => { setItems([]); setSupplierId(""); setPaymentType("tunai"); setDueDate(""); setNotes(""); };

  const addItem = () => setItems(prev => [...prev, { productId: 0, productName: "", rolls: "", meters: "", pricePerMeter: "", subtotal: 0, barcode: "" }]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "productId") {
        const prod = products?.find(p => p.id === parseInt(value));
        if (prod) { 
          updated[index].productName = prod.name; 
          updated[index].pricePerMeter = prod.pricePerMeter;
          updated[index].primaryUnit = prod.primaryUnit;
          updated[index].secondaryUnit = prod.secondaryUnit;
        }
      }
      const item = updated[index];
      updated[index].subtotal = (typeof item.meters === "number" ? item.meters : 0) * (typeof item.pricePerMeter === "number" ? item.pricePerMeter : 0);
      return updated;
    });
  };

  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  const handleSubmit = () => {
    if (items.length === 0) { toast({ title: "Tambahkan minimal 1 item", variant: "destructive" }); return; }
    if (items.some(i => !i.productId || (typeof i.meters === "number" ? i.meters : 0) <= 0)) { toast({ title: "Mohon lengkapi data barang", variant: "destructive" }); return; }
    if (!supplierId) { toast({ title: "Pilih supplier", variant: "destructive" }); return; }
    createMutation.mutate({
      data: {
        supplierId: parseInt(supplierId),
        paymentType: paymentType as any,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        items: items.map(i => ({ 
          productId: i.productId, 
          rolls: typeof i.rolls === "number" ? i.rolls : 0, 
          meters: typeof i.meters === "number" ? i.meters : 0, 
          pricePerMeter: typeof i.pricePerMeter === "number" ? i.pricePerMeter : 0, 
          subtotal: i.subtotal, 
          barcode: i.barcode || undefined 
        }))
      }
    });
  };

  const filtered = filterByDateRange(
    purchases?.filter(p => {
      const q = search.toLowerCase();
      return p.invoiceNumber?.toLowerCase().includes(q) || (p as any).supplierName?.toLowerCase().includes(q);
    }) ?? [],
    dateFrom,
    dateTo,
  );

  const tabFiltered = filtered.filter(p => {
    if (activeTab === "semua") return true;
    return p.status === activeTab;
  });

  return (
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col pt-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pembelian</h1>
            <p className="text-sm text-slate-500">Riwayat kulakan dari supplier</p>
          </div>
          <Button onClick={() => setIsOpen(true)} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Baru
          </Button>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {(['semua', 'lunas', 'kredit', 'partial'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-violet-900 text-white shadow-md shadow-violet-200"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari no invoice atau supplier..." 
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
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Belum ada aktivitas</h3>
            <p className="text-sm text-slate-500 mt-1">Tidak ada transaksi yang sesuai kriteria.</p>
          </div>
        ) : (
          <>
            {tabFiltered?.slice((currentPage - 1) * 20, currentPage * 20).map((p) => {
              // Menentukan Icon & Warna Status
              let StatusIcon = CheckCircle2;
              let iconColor = "text-green-500";
              let bgIconColor = "bg-green-100 border-green-200";
              let badgeBg = "bg-green-100 text-green-700";
              
              if (p.status === 'kredit') {
                StatusIcon = Clock;
                iconColor = "text-amber-500";
                bgIconColor = "bg-amber-100 border-amber-200";
                badgeBg = "bg-amber-100 text-amber-700";
              } else if (p.status === 'partial') {
                StatusIcon = AlertCircle;
                iconColor = "text-blue-500";
                bgIconColor = "bg-blue-100 border-blue-200";
                badgeBg = "bg-blue-100 text-blue-700";
              }

              return (
                <div key={p.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md">
                  
                  {/* Decorative side accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${badgeBg.split(' ')[0]}`} />

                  {/* Header: Waktu & Harga */}
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {formatDate(p.createdAt)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{p.invoiceNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block">
                        {formatRupiah(p.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Body: Info Supplier */}
                  <div className="flex gap-3 items-center pl-2">
                    <div className={`w-[48px] h-[48px] rounded-2xl shrink-0 flex items-center justify-center border ${bgIconColor}`}>
                      <StatusIcon className={`w-6 h-6 ${iconColor}`} strokeWidth={2} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-[15px] truncate">
                        {(p as any).supplierName || "Supplier Umum"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeBg}`}>
                          {p.status}
                        </span>
                        <span className="text-xs font-medium text-slate-400 capitalize">
                          Via {p.paymentType}
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="h-8 rounded-full text-violet-600 hover:text-violet-700 hover:bg-violet-50 font-semibold text-xs px-3">
                      Detail <ArrowRightCircle className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Footer: Sisa Tagihan (Khusus Kredit/Partial) */}
                  {(p.status === 'kredit' || p.status === 'partial') && (
                    <div className="mt-2 pl-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between bg-amber-50/50 p-2 rounded-xl">
                        <span className="text-xs font-medium text-amber-800">Kekurangan:</span>
                        <span className="text-xs font-bold text-amber-600">{formatRupiah(p.totalAmount - (p.paidAmount || 0))}</span>
                      </div>
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

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); resetForm(); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-4xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Buat Pembelian Baru</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Supplier</label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Metode Pembayaran</label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods.filter(m => m.isActive).length > 0
                      ? paymentMethods.filter(m => m.isActive).map(m => (
                          <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
                        ))
                      : (
                          <>
                            <SelectItem value="tunai">Tunai</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="kredit">Kredit</SelectItem>
                          </>
                        )
                    }
                  </SelectContent>
                </Select>
              </div>
              {paymentType === "kredit" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Jatuh Tempo</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              )}
              <div className={paymentType === "kredit" ? "" : "md:col-span-2"}>
                <label className="text-sm font-medium mb-1 block">Catatan</label>
                <Input placeholder="Catatan opsional" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Item Barang</span>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Item</Button>
              </div>
              {items.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">Belum ada item. Klik "Tambah Item" untuk memulai.</div>
              )}
              {items.map((item, index) => (
                <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-2 md:items-end p-3 bg-muted/30 rounded-lg">
                  <div className="md:col-span-3">
                    <label className="text-xs text-muted-foreground mb-1 block">Barang</label>
                    <Select value={item.productId ? item.productId.toString() : ""} onValueChange={(v: string) => updateItem(index, "productId", parseInt(v))}>
                      <SelectTrigger className="h-8"><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                      <SelectContent>{products?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block truncate">Barcode</label>
                    <Input className="h-8" placeholder="Opsional" value={item.barcode || ""} onChange={e => updateItem(index, "barcode", e.target.value)} />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs text-muted-foreground mb-1 block truncate">Roll</label>
                    <Input className="h-8" type="number" step="any" min={0} value={item.rolls} onChange={e => updateItem(index, "rolls", e.target.value === "" ? "" : parseFloat(e.target.value))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block truncate">Qty ({item.primaryUnit || "Meter"})</label>
                    <Input className="h-8" type="number" step="any" min={0} value={item.meters} onChange={e => updateItem(index, "meters", e.target.value === "" ? "" : parseFloat(e.target.value))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block truncate">Harga / {item.primaryUnit || "Mtr"}</label>
                    <Input className="h-8" type="number" step="any" min={0} value={item.pricePerMeter} onChange={e => updateItem(index, "pricePerMeter", e.target.value === "" ? "" : parseFloat(e.target.value))} />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Subtotal</label>
                    <div className="h-8 flex items-center text-sm font-medium">{formatRupiah(item.subtotal)}</div>
                  </div>
                  <div className="md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="flex justify-end pt-2">
                <div className="text-right">
                  <span className="text-muted-foreground mr-4">Total:</span>
                  <span className="text-xl font-bold">{formatRupiah(totalAmount)}</span>
                </div>
              </div>
            )}
          </div>
          </div>
          <DrawerFooter className="px-0 pt-4 mt-4 flex-row gap-2">
            <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => { setIsOpen(false); resetForm(); }}>Batal</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={createMutation.isPending || items.length === 0}>Simpan Pembelian</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

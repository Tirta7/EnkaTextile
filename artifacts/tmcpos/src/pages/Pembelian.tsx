import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListPurchases, useCreatePurchase, useListSuppliers, useListProducts, useListPaymentMethods, useListCategories, getListPurchasesQueryKey, getListSuppliersQueryKey, getListProductsQueryKey, getListPaymentMethodsQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PurchaseDetailModal } from "@/components/PurchaseDetailModal";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Search, ShoppingBag, PlusCircle, CheckCircle2, Clock, AlertCircle, ArrowRightCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate, generateSequentialInvoiceNumber } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

type PurchaseItem = { categoryId?: number; productId: number; productName: string; rolls: number | ""; meters: number | ""; pricePerMeter: number | ""; subtotal: number; primaryUnit?: string; secondaryUnit?: string; barcode?: string; rollLengths?: number[]; };

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
  const [viewDetailId, setViewDetailId] = useState<number | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplierId, setSupplierId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("tunai");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const { data: purchases, isLoading } = useListPurchases({}, { query: { queryKey: getListPurchasesQueryKey({}) } });
  const { data: suppliers } = useListSuppliers({}, { query: { queryKey: getListSuppliersQueryKey({}) } });
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey() } });
  const { data: categories } = useListCategories();
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

  const addItem = () => setItems(prev => [...prev, { categoryId: undefined, productId: 0, productName: "", rolls: "", meters: "", pricePerMeter: "", subtotal: 0, barcode: "", rollLengths: [] }]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof PurchaseItem | `rollLengths.${number}`, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      
      if (typeof field === 'string' && field.startsWith('rollLengths.')) {
        const lengthIndex = parseInt(field.split('.')[1]);
        if (!updated[index].rollLengths) updated[index].rollLengths = [];
        updated[index].rollLengths![lengthIndex] = value;
        // Auto calculate meters from rollLengths
        updated[index].meters = parseFloat(updated[index].rollLengths!.reduce((a: number, b: number) => a + b, 0).toFixed(3));
      } else {
        (updated[index] as any)[field] = value;
      }
      
      if (field === "productId") {
        const prod = products?.find(p => p.id === parseInt(value));
        if (prod) { 
          updated[index].productName = prod.name; 
          updated[index].pricePerMeter = prod.pricePerMeter;
          updated[index].primaryUnit = prod.primaryUnit;
          updated[index].secondaryUnit = prod.secondaryUnit;
        }
      }
      
      if (field === "rolls") {
        const val = parseInt(value) || 0;
        const currentLengths = updated[index].rollLengths || [];
        const newLengths = Array.from({ length: val }, (_, i) => currentLengths[i] || 0);
        updated[index].rollLengths = newLengths;
        updated[index].meters = parseFloat(newLengths.reduce((a: number, b: number) => a + b, 0).toFixed(3));
      }
      
      const item = updated[index];
      updated[index].subtotal = Math.round((typeof item.meters === "number" ? item.meters : 0) * (typeof item.pricePerMeter === "number" ? item.pricePerMeter : 0));
      return updated;
    });
  };

  const totalAmount = Math.round(items.reduce((sum, i) => sum + i.subtotal, 0));

  const handleSubmit = () => {
    if (items.length === 0) { toast({ title: "Tambahkan minimal 1 item", variant: "destructive" }); return; }
    if (items.some(i => !i.productId || (typeof i.meters === "number" ? i.meters : 0) <= 0)) { toast({ title: "Mohon lengkapi data barang", variant: "destructive" }); return; }
    if (!supplierId) { toast({ title: "Pilih supplier", variant: "destructive" }); return; }
    createMutation.mutate({
      data: {
        invoiceNumber,
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
          barcode: i.barcode || undefined,
          rollLengths: i.rollLengths || undefined
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
    if (activeTab === "kredit") return p.status === "unpaid";
    return p.status === activeTab;
  });

  return (
    <div className="flex flex-col h-full w-full">
      {/* Static Top Strip */}
      <div className="flex-none space-y-2 pb-2">
        <div className="flex items-center justify-between pt-1 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pembelian</h1>
            <p className="text-sm text-slate-500">Riwayat kulakan dari supplier</p>
          </div>
          <Button onClick={() => {
            const existingInvoices = purchases?.map(p => p.invoiceNumber) || [];
            setInvoiceNumber(generateSequentialInvoiceNumber("INV-IN", existingInvoices));
            setIsOpen(true);
          }} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Baru
          </Button>
        </div>
        {/* Tabs */}
        <div className="flex gap-3 border-b border-slate-200">
          {(['semua', 'lunas', 'kredit', 'partial'] as const).map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`pb-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-violet-600" />}
            </button>
          ))}
        </div>
        {/* Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari no invoice atau supplier..." className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); setCurrentPage(1); }} />
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
          ) : tabFiltered?.length === 0 ? (
            <div className="text-center py-16"><ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Belum ada aktivitas pembelian</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8">#</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kekurangan</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tabFiltered?.slice((currentPage - 1) * 20, currentPage * 20).map((p, idx) => {
                    let badgeBg = "bg-green-100 text-green-700";
                    if (p.status === 'kredit') badgeBg = "bg-amber-100 text-amber-700";
                    else if (p.status === 'partial') badgeBg = "bg-blue-100 text-blue-700";
                    const kurang = p.totalAmount - (p.paidAmount || 0);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-xs text-slate-400 font-mono">{(currentPage - 1) * 20 + idx + 1}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                        <td className="py-2.5 px-3 text-xs font-mono text-slate-500">{p.invoiceNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{(p as any).supplierName || "Supplier Umum"}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeBg}`}>{p.status}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">{formatRupiah(p.totalAmount)}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${kurang > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{kurang > 0 ? formatRupiah(kurang) : '—'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button className="w-7 h-7 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 flex items-center justify-center transition-colors mx-auto" title="Lihat Detail" onClick={() => setViewDetailId(p.id)}>
                            <ArrowRightCircle className="w-3.5 h-3.5" />
                          </button>
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
      {tabFiltered && tabFiltered.length > 20 && (
        <div className="flex-none border-t border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between rounded-b-2xl shadow-sm">
          <span className="text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, tabFiltered.length)} dari {tabFiltered.length} pembelian</span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(tabFiltered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

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
                <Combobox
                  items={paymentMethods.filter(m => m.isActive).length > 0
                    ? paymentMethods.filter(m => m.isActive).map(m => ({ value: m.code, label: m.name }))
                    : [
                        { value: "tunai", label: "Tunai" },
                        { value: "transfer", label: "Transfer" },
                        { value: "kredit", label: "Kredit" },
                      ]
                  }
                  value={paymentType}
                  onValueChange={setPaymentType}
                  placeholder="Pilih metode"
                  searchPlaceholder="Cari..."
                />
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
                <div key={index} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:items-end">
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Kategori</label>
                      <Combobox
                        items={[
                          { value: "0", label: "Semua" },
                          ...(categories?.map((c: any) => ({ value: c.id.toString(), label: c.name })) || [])
                        ]}
                        value={item.categoryId ? item.categoryId.toString() : undefined}
                        onValueChange={(v) => updateItem(index, "categoryId", parseInt(v))}
                        placeholder="Semua"
                        searchPlaceholder="Cari kategori..."
                        className="h-8"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Barang</label>
                      <Combobox
                        items={products
                          ?.filter((p: any) => !item.categoryId || item.categoryId === 0 || p.categoryId === item.categoryId)
                          .map((p: any) => ({ value: p.id.toString(), label: p.name })) || []}
                        value={item.productId ? item.productId.toString() : undefined}
                        onValueChange={(v) => updateItem(index, "productId", parseInt(v))}
                        placeholder="Pilih"
                        searchPlaceholder="Cari barang..."
                        className="h-8"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs text-muted-foreground mb-1 block truncate">Barcode</label>
                      <Input className="h-8 px-2" placeholder="Opsional" value={item.barcode || ""} onChange={e => updateItem(index, "barcode", e.target.value)} />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs text-muted-foreground mb-1 block truncate">Roll</label>
                      <Input className="h-8 px-2" type="number" step="1" min={0} value={item.rolls} onChange={e => updateItem(index, "rolls", e.target.value === "" ? "" : parseFloat(e.target.value))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block truncate">Qty ({item.primaryUnit || "Yard"})</label>
                      <Input className={`h-8 px-2 ${(item.rolls && (item.rolls as number) > 0) ? 'bg-slate-100 cursor-not-allowed font-medium' : ''}`} type="number" step="any" min={0} value={item.meters} onChange={e => updateItem(index, "meters", e.target.value === "" ? "" : parseFloat(e.target.value))} readOnly={!!(item.rolls && (item.rolls as number) > 0)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block truncate">Harga / {item.primaryUnit || "Yard"}</label>
                      <Input className="h-8 px-2" type="number" step="any" min={0} value={item.pricePerMeter} onChange={e => updateItem(index, "pricePerMeter", e.target.value === "" ? "" : parseFloat(e.target.value))} />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Subtotal</label>
                      <div className="h-8 flex items-center text-xs font-medium px-1">{formatRupiah(item.subtotal)}</div>
                    </div>
                    <div className="md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>

                  {/* Dynamic inputs for roll lengths */}
                  {item.rolls && (item.rolls as number) > 0 && (
                    <div className="mt-2 bg-white p-3 rounded-lg border border-slate-200">
                      <label className="text-xs font-semibold text-slate-700 block mb-2 border-b pb-1">Detail Panjang Tiap Roll ({item.primaryUnit || "Yard"})</label>
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {Array.from({ length: item.rolls as number }).map((_, i) => (
                          <div key={i} className="space-y-1">
                            <label className="text-[10px] font-medium text-slate-500">Roll #{i + 1}</label>
                            <Input
                              type="number" step="any" min={0}
                              placeholder="Panjang..."
                              className="h-7 text-xs px-2"
                              value={item.rollLengths?.[i] || ''}
                              onChange={e => updateItem(index, `rollLengths.${i}` as any, e.target.value === "" ? "" : parseFloat(e.target.value))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

      <PurchaseDetailModal 
        purchaseId={viewDetailId} 
        isOpen={!!viewDetailId} 
        onClose={() => setViewDetailId(null)} 
      />
    </div>
  );
}

import { useState, useMemo } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListSales, useCreateSale, useListCustomers, useListProducts, useListPaymentMethods, useGetProductRolls, useListCategories, getListSalesQueryKey, getListCustomersQueryKey, getListProductsQueryKey, getListPaymentMethodsQueryKey, getGetProductRollsQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Search, ShoppingCart, PlusCircle, Printer, CheckCircle2, Clock, XCircle, AlertCircle, Receipt as ReceiptIcon, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate, generateInvoiceNumber } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";
import { InvoicePreviewModal, InvoicePreviewData } from "@/components/InvoicePreviewModal";

type SaleItem = { productId: number; productName: string; rollId?: number; unit: "meter" | "roll"; rolls: number | ""; meters: number | ""; pricePerUnit: number | ""; subtotal: number; primaryUnit?: string; secondaryUnit?: string; targetLength?: number; };

const STATUS_COLORS: Record<string, string> = {
  lunas: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  kredit: "bg-blue-100 text-blue-700 border-blue-200",
};

function SaleItemRow({ item, index, products, categories, updateItem, removeItem }: any) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const { data: rolls } = useGetProductRolls(item.productId, {
    query: { queryKey: getGetProductRollsQueryKey(item.productId), enabled: !!item.productId }
  });

  const availableRolls = rolls?.filter(r => r.status === 'available') || [];
  const lengthGroups: Record<string, number> = {};
  availableRolls.forEach(r => {
    const len = r.currentLength.toString();
    lengthGroups[len] = (lengthGroups[len] || 0) + 1;
  });

  const maxRolls = item.unit === "roll" && item.targetLength ? lengthGroups[item.targetLength.toString()] : undefined;

  const filteredProducts = selectedCategoryId === "all" ? products : products?.filter((p: any) => p.categoryId.toString() === selectedCategoryId);

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:items-end p-3 bg-muted/30 rounded-lg">
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Kategori</label>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="h-12 py-1"><SelectValue placeholder="Semua" /></SelectTrigger>
          <SelectContent>
            <SelectGroup className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3">
              <SelectItem value="all" className="border shadow-sm hover:border-primary/50 py-3 h-auto text-sm justify-center text-center font-semibold">
                Semua Kategori
              </SelectItem>
              {categories?.map((c: any) => (
                <SelectItem key={c.id} value={c.id.toString()} className="border shadow-sm hover:border-primary/50 py-3 h-auto text-sm" title={c.description}>
                  <div className="flex flex-col items-center justify-center gap-0.5 w-full text-center">
                    <span className="font-semibold truncate w-full">{c.name}</span>
                    {c.description && <span className="text-[10px] text-muted-foreground truncate w-full">{c.description}</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Barang</label>
        <Select value={item.productId ? item.productId.toString() : ""} onValueChange={v => { updateItem(index, "productId", parseInt(v)); }}>
          <SelectTrigger className="h-12 py-1"><SelectValue placeholder="Pilih barang" /></SelectTrigger>
          <SelectContent>
            <SelectGroup className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3">
              {filteredProducts?.map((p: any) => (
                <SelectItem key={p.id} value={p.id.toString()} className="border shadow-sm hover:border-primary/50 py-3 h-auto text-sm justify-center text-center">
                   <span className="font-semibold truncate w-full" title={p.name}>{p.name}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Roll (Stiker)</label>
        <Select 
          value={item.rollId ? `r_${item.rollId}` : (item.targetLength ? `len_${item.targetLength}` : "none")} 
          onValueChange={v => { 
            if (v === "none") { 
              updateItem(index, "rollId", undefined);
              updateItem(index, "targetLength", undefined);
              return;
            }
            if (v.startsWith("len_")) {
              const targetLen = parseFloat(v.replace("len_", ""));
              updateItem(index, "rollId", undefined);
              updateItem(index, "targetLength", targetLen);
              updateItem(index, "unit", "roll");
              updateItem(index, "rolls", 1);
              updateItem(index, "meters", targetLen);
              return;
            }
            if (v.startsWith("r_")) {
              const rollId = parseInt(v.replace("r_", ""));
              updateItem(index, "rollId", rollId);
              updateItem(index, "targetLength", undefined);
              const roll = availableRolls.find(r => r.id === rollId);
              if (roll) {
                updateItem(index, "unit", "roll");
                updateItem(index, "rolls", 1);
                updateItem(index, "meters", roll.currentLength);
              }
            }
          }}
          disabled={!item.productId || !rolls || rolls.length === 0}
        >
          <SelectTrigger className="h-12 py-1"><SelectValue placeholder="Pilih roll" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="border shadow-sm hover:border-primary/50 mb-2 w-full text-base">
              Potong Bebas (Meteran)
            </SelectItem>
            {Object.keys(lengthGroups).length > 0 && (
              <SelectGroup className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-2">
                <div className="col-span-full"><SelectLabel className="pb-1">Pilih Otomatis (Per Ukuran)</SelectLabel></div>
                {Object.entries(lengthGroups).map(([len, count]) => (
                  <SelectItem key={`len_${len}`} value={`len_${len}`} className="border shadow-sm hover:border-primary/50 py-2.5 h-auto">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-semibold text-base">{len}m</span>
                      <span className="text-xs text-muted-foreground">Tersedia: {count} roll</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {availableRolls.length > 0 && (
              <SelectGroup className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                <div className="col-span-full"><SelectLabel className="pb-1">Pilih Spesifik Barcode</SelectLabel></div>
                {availableRolls.map(r => (
                  <SelectItem key={`r_${r.id}`} value={`r_${r.id}`} className="border shadow-sm hover:border-primary/50 py-2.5 h-auto">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-semibold text-base">{r.currentLength}m</span>
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">{r.barcode}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-1">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Satuan</label>
        <Select value={item.unit} onValueChange={v => updateItem(index, "unit", v)} disabled={!!item.rollId}>
          <SelectTrigger className="h-12 font-medium"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="meter">{item.primaryUnit || "Meter"}</SelectItem>
            <SelectItem value="roll">{item.secondaryUnit || "Roll"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-1">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block truncate">{item.unit === "meter" ? `Jml (${item.primaryUnit?.toLowerCase() || "m"})` : `Jml (${item.secondaryUnit?.toLowerCase() || "roll"})`}</label>
        <Input className="h-12 text-center text-lg font-medium" type="number" step="any" min={0} max={maxRolls} value={item.unit === "meter" ? item.meters : item.rolls}
          onChange={e => {
            let val: number | "" = e.target.value === "" ? "" : parseFloat(e.target.value);
            if (item.unit === "roll" && maxRolls !== undefined && typeof val === "number" && val > maxRolls) {
              val = maxRolls;
            }
            updateItem(index, item.unit === "meter" ? "meters" : "rolls", val);
          }} 
          disabled={(item.unit === "meter" && !!item.rollId) || (item.unit === "roll" && !!item.rollId)} 
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Harga/satuan</label>
        <Input className="h-12 font-medium text-base" type="number" step="any" min={0} value={item.pricePerUnit} onChange={e => updateItem(index, "pricePerUnit", e.target.value === "" ? "" : parseFloat(e.target.value))} />
      </div>
      <div className="md:col-span-1">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Subtotal</label>
        <div className="h-12 flex items-center text-base font-bold bg-muted/50 px-3 rounded-md border border-transparent">{formatRupiah(item.subtotal)}</div>
      </div>
      <div className="md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
        <Button type="button" variant="ghost" size="icon" className="h-12 w-12 hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => removeItem(index)}><Trash2 className="h-5 w-5 text-destructive" /></Button>
      </div>
    </div>
  );
}

export default function Penjualan() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("tunai");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<InvoicePreviewData | null>(null);
  const [previewSaleId, setPreviewSaleId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<string>("Semua");

  const { data: sales, isLoading } = useListSales({}, { query: { queryKey: getListSalesQueryKey({}) } });
  const { data: customers } = useListCustomers({}, { query: { queryKey: getListCustomersQueryKey({}) } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey() } });
  const { data: paymentMethods = [] } = useListPaymentMethods({ query: { queryKey: getListPaymentMethodsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateSale({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({}) });
        setIsOpen(false);
        resetForm();
        toast({ title: "Penjualan berhasil dicatat" });
      }
    }
  });

  const resetForm = () => {
    setInvoiceNumber("");
    setItems([]);
    setCustomerId("");
    setPaymentType("tunai");
    setDueDate("");
    setNotes("");
  };

  const addItem = () => {
    setItems(prev => [...prev, { productId: 0, productName: "", unit: "meter", rolls: "", meters: "", pricePerUnit: "", subtotal: 0 }]);
  };

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      const item = updated[index];
      if (field === "productId") {
        const prod = products?.find(p => p.id === parseInt(value));
        if (prod) {
          item.productName = prod.name;
          item.pricePerUnit = parseFloat(String(prod.pricePerMeter));
          item.primaryUnit = prod.primaryUnit || undefined;
          item.secondaryUnit = prod.secondaryUnit || undefined;
        }
      }
      
      // Auto update meters when rolls change and targetLength is known
      if (field === "rolls" && item.unit === "roll" && item.targetLength && !item.rollId) {
        item.meters = (typeof item.rolls === "number" ? item.rolls : 0) * item.targetLength;
      }

      item.subtotal = (typeof item.meters === "number" ? item.meters : 0) * (typeof item.pricePerUnit === "number" ? item.pricePerUnit : 0);
      return updated;
    });
  };

  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  const handlePreview = () => {
    let customerName = "Umum";
    if (customerId) {
      const cust = customers?.find(c => c.id.toString() === customerId);
      if (cust) customerName = cust.name;
    }
    const paidAmount = (paymentType !== "kredit" && paymentType !== "tempo") ? totalAmount : 0;
    
    setPreviewSaleId(undefined);
    setPreviewData({
      invoiceNumber,
      customerName,
      createdAt: new Date().toISOString(),
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
      items: items.map(i => {
        const prod = products?.find(p => p.id === i.productId);
        const cat = categories?.find(c => c.id === prod?.categoryId);
        return {
          categoryName: cat?.name,
          productName: i.productName,
          meters: typeof i.meters === "number" ? i.meters : 0,
          rolls: typeof i.rolls === "number" ? i.rolls : 0,
          pricePerMeter: typeof i.pricePerUnit === "number" ? i.pricePerUnit : 0,
          subtotal: i.subtotal
        };
      })
    });
    setPreviewOpen(true);
  };

  const handleSubmit = () => {
    if (items.length === 0) { toast({ title: "Tambahkan minimal 1 item", variant: "destructive" }); return; }
    if (items.some(i => !i.productId || (typeof i.meters === "number" ? i.meters : 0) <= 0)) { toast({ title: "Mohon lengkapi data barang", variant: "destructive" }); return; }
    
    createMutation.mutate({
      data: {
        invoiceNumber,
        customerId: customerId ? parseInt(customerId) : undefined,
        paymentType: paymentType as any,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        items: items.map(i => ({ 
          productId: i.productId, 
          rollId: i.rollId || undefined, 
          rolls: typeof i.rolls === "number" ? i.rolls : 0, 
          meters: typeof i.meters === "number" ? i.meters : 0, 
          pricePerMeter: typeof i.pricePerUnit === "number" ? i.pricePerUnit : 0, 
          subtotal: i.subtotal 
        }))
      }
    });
  };

  const baseFiltered = filterByDateRange(
    sales?.filter(s => {
      const q = search.toLowerCase();
      return s.invoiceNumber?.toLowerCase().includes(q) || (s as any).customerName?.toLowerCase().includes(q);
    }) ?? [],
    dateFrom,
    dateTo,
  );

  const filtered = useMemo(() => {
    if (activeTab === "Semua") return baseFiltered;
    return baseFiltered.filter(s => s.status?.toLowerCase() === activeTab.toLowerCase());
  }, [baseFiltered, activeTab]);

  return (
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-20">
      
      {/* Mobile-optimized Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Aktivitas</h1>
          <p className="text-sm text-slate-500">Riwayat penjualan Anda</p>
        </div>
        <Button onClick={() => { setInvoiceNumber(generateInvoiceNumber()); setIsOpen(true); }} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
          <Plus className="mr-2 h-4 w-4" /> Buat Nota
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {["Semua", "Lunas", "Kredit", "Partial"].map(tab => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-green-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Filter Chips & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari pelanggan atau invoice..." 
            className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-green-500" 
            value={search} 
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
          />
        </div>
        <div className="flex gap-2">
           {/* Replace standard date filter with simpler or keep as is, but styled */}
           <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); }} />
        </div>
      </div>

      {/* Activity Feed List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-full mt-4" />
              </div>
            </div>
          ))
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <ReceiptIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Belum ada aktivitas</h3>
            <p className="text-sm text-slate-500 mt-1">Transaksi penjualan Anda akan muncul di sini.</p>
          </div>
        ) : (
          <>
            {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((s) => {
              const isLunas = s.status === 'lunas';
              const isKredit = s.status === 'kredit';
              const customerName = (s as any).customerName || "Pelanggan Umum";
              
              return (
                <div key={s.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3">
                  
                  {/* Top Row: Date & Price */}
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-500">
                      {formatDate(s.createdAt)}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatRupiah(s.totalAmount)}
                    </span>
                  </div>

                  {/* Main Content: Avatar, Title, Status */}
                  <div className="flex gap-3">
                    <div className="w-[60px] h-[60px] rounded-2xl flex-shrink-0 bg-violet-50 flex items-center justify-center border border-violet-100">
                      <UserIcon className="w-8 h-8 text-violet-300" strokeWidth={1.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-slate-900 text-[15px] truncate leading-tight">
                        {customerName}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {isLunas ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 fill-green-100" />
                        ) : isKredit ? (
                          <Clock className="w-4 h-4 text-orange-500 fill-orange-50" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-blue-500 fill-blue-50" />
                        )}
                        <span className="text-xs font-medium text-slate-600 capitalize">
                          {isLunas ? "Pembayaran selesai" : isKredit ? "Menunggu pelunasan" : s.status}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        1 [INV] {s.invoiceNumber} • {s.paymentType}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-end justify-end ml-2">
                      <Button 
                        size="sm" 
                        className="rounded-full bg-green-600 hover:bg-green-700 font-bold h-8 px-4 shadow-sm"
                        onClick={() => { setPreviewData(null); setPreviewSaleId(s.id); setPreviewOpen(true); }}
                      >
                        Cetak
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bottom Bar: Additional Info (Optional) */}
                  <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span>Kasir: Admin</span>
                    <div className="flex gap-0.5 text-slate-200">
                      {/* Decorative stars mimicking Gojek rating */}
                      {[1,2,3,4,5].map(star => <svg key={star} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
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

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); resetForm(); } }}>
        <DrawerContent className="max-h-[96vh] mx-auto w-full max-w-[95vw] xl:max-w-7xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle className="text-xl">Buat Penjualan Baru</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(96vh-6rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 bg-muted/50 p-3 rounded-md">
              <span className="text-sm font-medium text-muted-foreground">No. Invoice:</span>
              <span className="text-base font-mono font-bold break-all">{invoiceNumber}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium mb-1 block">Pelanggan</label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Pilih pelanggan (opsional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Pelanggan Umum</SelectItem>
                    {customers?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
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
                <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                  Belum ada item. Klik "Tambah Item" untuk memulai.
                </div>
              )}
                {items.map((item, index) => (
                  <SaleItemRow key={index} item={item} index={index} products={products} categories={categories} updateItem={updateItem} removeItem={removeItem} />
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
          <DrawerFooter className="mt-4 px-0 flex flex-row gap-2">
            <Button type="button" variant="outline" size="icon" onClick={handlePreview} title="Preview & Cetak Nota" className="mr-auto">
              <Printer className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => { setIsOpen(false); resetForm(); }}>Batal</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={createMutation.isPending || items.length === 0}>Simpan Penjualan</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      <InvoicePreviewModal open={previewOpen} onOpenChange={setPreviewOpen} data={previewData} saleId={previewSaleId} />
    </div>
  );
}

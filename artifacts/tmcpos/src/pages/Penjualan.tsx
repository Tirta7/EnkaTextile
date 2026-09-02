import { useState, useMemo, useRef, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListSales, useCreateSale, useListCustomers, useListProducts, useListPaymentMethods, useGetProductRolls, useListCategories, useGetSale, getListSalesQueryKey, getListCustomersQueryKey, getListProductsQueryKey, getListPaymentMethodsQueryKey, getGetProductRollsQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Combobox, ComboboxItem } from "@/components/ui/combobox";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Search, ShoppingCart, PlusCircle, Printer, CheckCircle2, Clock, XCircle, AlertCircle, Receipt as ReceiptIcon, User as UserIcon, ChevronDown, CreditCard, Pencil, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";
import { InvoicePreviewModal, InvoicePreviewData } from "@/components/InvoicePreviewModal";
import { OtpDialog } from "@/components/OtpDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// ─── API Helpers ─────────────────────────────────────────────────────────────
const API_BASE = window.location.origin;

type SaleItem = { categoryId?: number; productId: number; productName: string; rollId?: number; selectedRolls?: {id: number, currentLength: number}[]; unit: "meter" | "roll"; rolls: number | ""; meters: number | ""; pricePerUnit: number | ""; subtotal: number; primaryUnit?: string; secondaryUnit?: string; targetLength?: number; };

const STATUS_COLORS: Record<string, string> = {
  lunas: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  kredit: "bg-blue-100 text-blue-700 border-blue-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-500 border-red-200",
};

function SaleItemRow({ item, index, products, categories, updateItem, updateItemFields, removeItem, allItems }: any) {
  if (!products || !categories) {
    return <div className="h-24 w-full flex items-center justify-center bg-slate-50 animate-pulse rounded-lg border border-slate-100 mb-2"><div className="text-sm font-medium text-slate-400">Memuat baris...</div></div>;
  }

  const getCatIdStr = () => {
    if (!item.categoryId || item.categoryId === 0 || item.categoryId === "0") return "all";
    return item.categoryId.toString();
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(getCatIdStr());
  
  // Sync selectedCategoryId if item.categoryId changes from parent (e.g. during Edit load)
  useEffect(() => {
    setSelectedCategoryId(getCatIdStr());
  }, [item.categoryId]);

  // Self-heal categoryId and units if products loaded late
  useEffect(() => {
    if (item.productId && products?.length > 0) {
      const prod = products.find((p: any) => p.id?.toString() === item.productId?.toString());
      if (prod) {
        if (!item.categoryId || item.categoryId === 0 || item.categoryId === "0") {
          if (prod.categoryId) updateItem(index, "categoryId", prod.categoryId);
        }
        if (!item.primaryUnit) {
          updateItem(index, "primaryUnit", prod.primaryUnit);
        }
        if (!item.secondaryUnit) {
          updateItem(index, "secondaryUnit", prod.secondaryUnit);
        }
      }
    }
  }, [item.productId, item.categoryId, item.primaryUnit, item.secondaryUnit, products, index, updateItem]);
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [rollSearch, setRollSearch] = useState("");
  const [rollPage, setRollPage] = useState(1);
  const itemsPerPage = 100; // Increased to 100 for grid layout
  
  const { data: rollsData } = useGetProductRolls(item.productId, {
    query: { queryKey: getGetProductRollsQueryKey(item.productId), enabled: !!item.productId }
  });
  
  const rolls = Array.isArray(rollsData) ? rollsData : (rollsData as any)?.rolls ?? [];
  
  const drawerContainer = typeof document !== 'undefined' ? document.getElementById("drawer-portal-target") : null;

  // Kumpulkan semua roll ID yang sudah dipilih di baris lain (mode Pilih Spesifik Barcode)
  const usedRollIds = new Set<number>(
    (allItems as any[] || []).flatMap((otherItem: any, i: number) => {
      if (i === index) return []; // skip baris ini sendiri
      return (otherItem.selectedRolls || []).map((sr: any) => sr.id);
    })
  );

  // Kumpulkan berapa roll per panjang yang sudah dikonsumsi baris lain (mode Pilih Otomatis Per Ukuran)
  const usedLengthCounts: Record<string, number> = {};
  (allItems as any[] || []).forEach((otherItem: any, i: number) => {
    if (i === index) return; // skip baris ini sendiri
    if (otherItem.targetLength && typeof otherItem.rolls === "number" && otherItem.rolls > 0) {
      const key = otherItem.targetLength.toString();
      usedLengthCounts[key] = (usedLengthCounts[key] || 0) + otherItem.rolls;
    }
  });

  // Reservasi virtual: roll yang diklaim mode Otomatis di baris lain → sembunyikan juga dari Barcode Spesifik
  const reservedRollIds = new Set<number>();
  if (rolls) {
    // Kelompokkan roll berdasarkan panjang (kecuali yang sudah dipakai selectedRolls)
    const rollsByLength: Record<string, any[]> = {};
    rolls.filter((r: any) => r.status === 'available' && !usedRollIds.has(r.id)).forEach((r: any) => {
      const len = r.currentLength.toString();
      if (!rollsByLength[len]) rollsByLength[len] = [];
      rollsByLength[len].push(r);
    });
    // Tandai N roll pertama per panjang sebagai "reserved" sesuai klaim baris lain
    Object.entries(usedLengthCounts).forEach(([len, count]) => {
      (rollsByLength[len] || []).slice(0, count).forEach((r: any) => reservedRollIds.add(r.id));
    });
  }

  // Roll yang tersedia = tidak dipakai barcode spesifik DAN tidak direservasi mode Otomatis
  const availableRolls = rolls?.filter((r: any) => r.status === 'available' && !usedRollIds.has(r.id) && !reservedRollIds.has(r.id)) || [];
  const lengthGroups: Record<string, number> = {};
  availableRolls.forEach((r: any) => {
    const len = r.currentLength.toString();
    lengthGroups[len] = (lengthGroups[len] || 0) + 1;
  });

  const maxRolls = item.unit === "roll" && item.targetLength ? lengthGroups[item.targetLength.toString()] ?? 0 : undefined;

  // Auto-zero subtotal saat stok habis diklaim baris lain (mode Pilih Otomatis)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (item.targetLength !== undefined && maxRolls === 0) {
      // Reset ke 0 agar subtotal tidak terhitung ke total
      if (typeof item.rolls === "number" && item.rolls > 0) {
        updateItem(index, "rolls", 0);
      }
      if (typeof item.meters === "number" && item.meters > 0) {
        updateItem(index, "meters", 0);
      }
    }
  }, [maxRolls, item.targetLength]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProducts = selectedCategoryId === "all" ? products : products?.filter((p: any) => p.categoryId.toString() === selectedCategoryId);

  // Filter available rolls by search (currentLength)
  const searchFilteredRolls = availableRolls.filter((r: any) => 
    r.currentLength.toString().includes(rollSearch)
  );
  
  const paginatedRolls = searchFilteredRolls.slice((rollPage - 1) * itemsPerPage, rollPage * itemsPerPage);
  const totalPages = Math.ceil(searchFilteredRolls.length / itemsPerPage);

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:items-end p-3 bg-muted/30 rounded-lg">
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Kategori</label>
        <Combobox 
          items={[
            { value: "all", label: "Semua Kategori" },
            ...(categories?.map((c: any) => ({ value: c.id.toString(), label: c.name })) || [])
          ]}
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
          placeholder="Semua"
          searchPlaceholder="Cari kategori..."
          className="h-12"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Barang</label>
        <Combobox
          items={filteredProducts?.map((p: any) => ({ value: p.id.toString(), label: p.name })) || []}
          value={item.productId ? item.productId.toString() : undefined}
          onValueChange={(v) => updateItem(index, "productId", parseInt(v))}
          placeholder="Pilih barang"
          searchPlaceholder="Cari barang..."
          className="h-12"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Roll (Stiker)</label>
        <Dialog open={isRollModalOpen} onOpenChange={setIsRollModalOpen}>
          <DialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 justify-between font-normal px-3 bg-white" 
                disabled={!item.productId}
              >
              <span className="truncate">
                {item.selectedRolls && item.selectedRolls.length > 0 
                   ? `${item.selectedRolls.length} Roll Terpilih`
                   : item.targetLength 
                     ? `${String(item.targetLength).replace('.', ',')} ${item.primaryUnit || 'unit'} (Auto)`
                     : "Potong Bebas / Manual"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50 border-0 rounded-2xl shadow-2xl" onInteractOutside={(e) => { e.preventDefault(); }}>
            <DialogHeader className="pb-2 border-b">
              <DialogTitle className="text-center font-bold text-base">
                {item.productName || "Pilih Roll / Potongan"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 min-h-0">
              
              <div className="flex flex-col">
                <label className="flex items-center gap-3 rounded-md px-4 py-3 border hover:bg-slate-50 cursor-pointer w-full sm:w-1/2 mx-auto justify-center bg-white shadow-sm">
                  <Checkbox 
                    checked={!item.targetLength && (!item.selectedRolls || item.selectedRolls.length === 0)}
                    className="h-5 w-5"
                    onCheckedChange={() => {
                      updateItemFields(index, {
                        selectedRolls: [],
                        targetLength: undefined
                      });
                    }}
                  />
                  <span className="text-base font-medium">Potong Bebas</span>
                </label>
              </div>
              
              {Object.keys(lengthGroups).length > 0 && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-semibold text-slate-700 text-center mb-1">Pilih Otomatis (Per Ukuran)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(lengthGroups).map(([len, count]) => (
                      <label key={`len_${len}`} className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 bg-slate-50 border hover:border-primary/50 hover:bg-primary/5 cursor-pointer text-center transition-colors">
                        <Checkbox 
                          checked={item.targetLength === parseFloat(len)}
                          className="h-4 w-4"
                          onCheckedChange={() => {
                            updateItemFields(index, {
                              selectedRolls: [],
                              targetLength: parseFloat(len),
                              unit: "roll",
                              rolls: 1,
                              meters: parseFloat(len)
                            });
                          }}
                        />
                        <span className="text-sm font-medium">{String(len).replace('.', ',')} <span className="text-[10px] text-slate-500 font-normal ml-0.5">({count})</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {availableRolls.length > 0 && (
                <div className="flex-1 flex flex-col min-h-0 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <div className="text-sm font-semibold text-slate-700">Pilih Spesifik Barcode</div>
                    <div className="relative w-full sm:w-[200px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Cari barcode..." 
                        className="pl-8 h-9 text-sm bg-slate-50" 
                        value={rollSearch}
                        onChange={e => { setRollSearch(e.target.value); setRollPage(1); }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                    {paginatedRolls.length === 0 ? (
                      <div className="text-center py-6 text-sm text-slate-500">Tidak ada roll ditemukan</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {paginatedRolls.map((r: any) => {
                          const isChecked = item.selectedRolls?.some((sr: any) => sr.id === r.id);
                          return (
                            <label key={r.id} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 border cursor-pointer transition-colors shadow-sm ${isChecked ? 'bg-primary/10 border-primary' : 'bg-white hover:border-primary/50'}`} title={r.barcode || r.id}>
                              <Checkbox 
                                checked={isChecked}
                                className="h-4 w-4 shrink-0"
                                onCheckedChange={(checked) => {
                                  let newSelected = [...(item.selectedRolls || [])];
                                  if (checked) {
                                    newSelected.push({ id: r.id, currentLength: parseFloat(r.currentLength as unknown as string) });
                                  } else {
                                    newSelected = newSelected.filter((sr: any) => sr.id !== r.id);
                                  }
                                  if (newSelected.length > 0) {
                                    const sumMeters = newSelected.reduce((sum, sr) => sum + sr.currentLength, 0);
                                    updateItemFields(index, {
                                      targetLength: undefined,
                                      selectedRolls: newSelected,
                                      unit: "roll",
                                      rolls: newSelected.length,
                                      meters: sumMeters
                                    });
                                  } else {
                                    updateItemFields(index, {
                                      targetLength: undefined,
                                      selectedRolls: newSelected,
                                      rolls: "",
                                      meters: ""
                                    });
                                  }
                                }}
                              />
                              <span className="text-sm font-semibold text-slate-700">{String(r.currentLength).replace('.', ',')}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={rollPage === 1} 
                        onClick={() => setRollPage(p => Math.max(1, p - 1))}
                      >
                        Sebelumnya
                      </Button>
                      <span className="text-sm text-slate-500 font-medium">
                        Halaman {rollPage} dari {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={rollPage === totalPages} 
                        onClick={() => setRollPage(p => Math.min(totalPages, p + 1))}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end p-4 border-t bg-slate-50">
              <Button onClick={() => setIsRollModalOpen(false)} className="w-full sm:w-auto px-8">Selesai</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="md:col-span-1">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Satuan</label>
        <Combobox
          items={[
            {
              value: "meter",
              label: (item.primaryUnit?.trim() || "Satuan Utama") + (item.primaryUnit && item.secondaryUnit && item.primaryUnit === item.secondaryUnit ? " (Potongan)" : "")
            },
            {
              value: "roll",
              label: (item.secondaryUnit?.trim() || "Satuan Grosir") + (item.primaryUnit && item.secondaryUnit && item.primaryUnit === item.secondaryUnit ? " (Gulungan)" : "")
            }
          ]}
          value={item.unit}
          onValueChange={(v) => updateItem(index, "unit", v)}
          disabled={!!item.rollId}
          placeholder="Pilih"
          searchPlaceholder="Cari satuan..."
          className="h-12 font-medium"
        />
      </div>
      <div className="md:col-span-1">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block truncate">{item.unit === "meter" ? `Jml (${item.primaryUnit?.toLowerCase() || "satuan"})` : `Jml (${item.secondaryUnit?.toLowerCase() || "satuan"})`}</label>
        <Input 
          className={`h-12 text-center text-lg font-medium ${item.unit === "roll" && item.targetLength && maxRolls === 0 ? "border-destructive bg-destructive/10 text-destructive" : ""} ${item.selectedRolls && item.selectedRolls.length > 0 ? "bg-muted/50 cursor-not-allowed" : ""}`} 
          type="number" step="any" min={0} max={maxRolls} 
          value={
            // Saat Pilih Spesifik Barcode aktif → tampilkan total panjang (meters), bukan jumlah roll
            (item.selectedRolls && item.selectedRolls.length > 0)
              ? item.meters
              : item.unit === "meter" ? item.meters : item.rolls
          }
          onChange={e => {
            // Jika selectedRolls aktif, input terkunci — tolak perubahan
            if (item.selectedRolls && item.selectedRolls.length > 0) return;
            let val: number | "" = e.target.value === "" ? "" : parseFloat(e.target.value);
            if (item.unit === "roll" && maxRolls !== undefined && typeof val === "number" && val > maxRolls) {
              val = maxRolls;
            }
            updateItem(index, item.unit === "meter" ? "meters" : "rolls", val);
          }} 
          readOnly={!!(item.selectedRolls && item.selectedRolls.length > 0)}
          disabled={(item.unit === "meter" && !!item.rollId) || (item.unit === "roll" && !!item.rollId) || (item.unit === "roll" && !!item.targetLength && maxRolls === 0)} 
        />
        {item.selectedRolls && item.selectedRolls.length > 0 && (
          <p className="text-[10px] text-slate-400 mt-1">{item.selectedRolls.length} roll • {item.meters} {item.primaryUnit || 'unit'} total</p>
        )}
        {item.unit === "roll" && item.targetLength && maxRolls === 0 && (
          <p className="text-[10px] text-destructive mt-1">Stok habis dipakai baris lain</p>
        )}
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
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("tunai");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [payDialogSaleId, setPayDialogSaleId] = useState<number | null>(null);
  const [payPaymentType, setPayPaymentType] = useState<string>("tunai");
  const [payProcessing, setPayProcessing] = useState(false);
  const [cancelProcessing, setCancelProcessing] = useState<number | null>(null);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<InvoicePreviewData | null>(null);
  const [previewSaleId, setPreviewSaleId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<string>("Semua");

  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpAction, setOtpAction] = useState<"edit" | "cancel" | null>(null);
  const [otpTargetId, setOtpTargetId] = useState<number | null>(null);

  const { data: sales, isLoading } = useListSales({}, { query: { queryKey: getListSalesQueryKey({}) } });
  const { data: customers } = useListCustomers({}, { query: { queryKey: getListCustomersQueryKey({}) } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey() } });
  const { data: paymentMethods = [] } = useListPaymentMethods({ query: { queryKey: getListPaymentMethodsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateSale({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({}) });
        setIsOpen(false);
        resetForm();
        toast({ title: editingSaleId ? "Penjualan berhasil diperbarui" : "Penjualan berhasil dicatat" });
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
    setEditingSaleId(null);
  };

  const handleEditClick = (saleId: number) => {
    setOtpTargetId(saleId);
    setOtpAction("edit");
    setOtpDialogOpen(true);
  };

  const openEditMode = async (saleId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/sales/${saleId}`);
      const data = await res.json();
      
      let currentProducts = products;
      if (!currentProducts || currentProducts.length === 0) {
        try {
          const prodRes = await fetch(`${API_BASE}/api/products`);
          if (prodRes.ok) currentProducts = await prodRes.json();
        } catch (e) {
          console.error("Failed to fetch products fallback", e);
        }
      }

      setEditingSaleId(saleId);
      setInvoiceNumber(data.invoiceNumber || "");
      setCustomerId(data.customerId ? String(data.customerId) : "");
      setPaymentType(data.paymentType || "tunai");
      setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
      setNotes(data.notes || "");
      // Convert API items back to SaleItem format and GROUP them!
      const mergedItems: SaleItem[] = [];
      const dataItems = data.items || [];
      
      dataItems.forEach((i: any) => {
        const prod = currentProducts?.find((p: any) => p.id?.toString() === i.productId?.toString());
        
        if (i.rollId) {
          // Find existing merged item for this product that is ALSO using selectedRolls
          const existing = mergedItems.find(m => m.productId === i.productId && m.pricePerUnit === i.pricePerMeter && m.selectedRolls);
          if (existing && existing.selectedRolls) {
            existing.selectedRolls.push({ id: i.rollId, currentLength: parseFloat(i.meters) });
            existing.rolls = (typeof existing.rolls === "number" ? existing.rolls : 0) + (i.rolls || 1);
            existing.meters = (typeof existing.meters === "number" ? existing.meters : 0) + parseFloat(i.meters || 0);
            existing.subtotal += parseFloat(i.subtotal || 0);
            return;
          }
          
          // Create new merged item
          mergedItems.push({
            categoryId: i.categoryId || prod?.categoryId || 0,
            productId: i.productId,
            productName: i.productName || prod?.name || "",
            selectedRolls: [{ id: i.rollId, currentLength: parseFloat(i.meters) }],
            unit: "roll",
            rolls: i.rolls || 1,
            meters: parseFloat(i.meters || 0),
            pricePerUnit: parseFloat(i.pricePerMeter || 0),
            subtotal: parseFloat(i.subtotal || 0),
            primaryUnit: i.primaryUnit || prod?.primaryUnit,
            secondaryUnit: i.secondaryUnit || prod?.secondaryUnit,
          });
        } else {
          // Regular item without specific roll (bisa Potong Bebas atau Auto Roll)
          const isAutoRoll = i.rolls > 0 && i.meters > 0;
          const targetLen = isAutoRoll ? (parseFloat(i.meters) / parseFloat(i.rolls)) : undefined;
          
          mergedItems.push({
            categoryId: i.categoryId || prod?.categoryId || 0,
            productId: i.productId,
            productName: i.productName || prod?.name || "",
            unit: i.rolls > 0 ? "roll" : "meter",
            rolls: parseFloat(i.rolls || 0),
            meters: parseFloat(i.meters || 0),
            pricePerUnit: parseFloat(i.pricePerMeter || 0),
            subtotal: parseFloat(i.subtotal || 0),
            targetLength: targetLen,
            primaryUnit: i.primaryUnit || prod?.primaryUnit,
            secondaryUnit: i.secondaryUnit || prod?.secondaryUnit,
          });
        }
      });
      
      setItems(mergedItems);
      setIsOpen(true);
    } catch {
      toast({ title: "Gagal memuat data nota", variant: "destructive" });
    }
  };

  // Pay a draft sale
  const handlePay = async (saleId: number) => {
    setPayProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/sales/${saleId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentType: payPaymentType }),
      });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({}) });
      setPayDialogSaleId(null);
      toast({ title: "✅ Pembayaran berhasil diterima!" });
    } catch (e: any) {
      toast({ title: "Gagal memproses pembayaran", variant: "destructive" });
    } finally {
      setPayProcessing(false);
    }
  };

  // Cancel a sale
  const handleCancelClick = (saleId: number) => {
    if (!confirm("Yakin ingin membatalkan nota ini? Stok akan dikembalikan jika sudah dibayar.")) return;
    setOtpTargetId(saleId);
    setOtpAction("cancel");
    setOtpDialogOpen(true);
  };

  const handleCancel = async (saleId: number) => {
    setCancelProcessing(saleId);
    try {
      const res = await fetch(`${API_BASE}/api/sales/${saleId}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({}) });
      toast({ title: "Nota berhasil dibatalkan" });
    } catch {
      toast({ title: "Gagal membatalkan nota", variant: "destructive" });
    } finally {
      setCancelProcessing(null);
    }
  };


  const addItem = () => {
    setItems(prev => [...prev, { productId: 0, productName: "", unit: "meter", rolls: "", meters: "", pricePerUnit: "", subtotal: 0 }]);
  };

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const updateItemFields = (index: number, fields: Partial<SaleItem>) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...fields };
      const item = updated[index];
      
      // Calculate derived state
      if (item.unit === "roll" && item.targetLength && !item.rollId) {
        item.meters = (typeof item.rolls === "number" ? item.rolls : 0) * item.targetLength;
      }
      item.subtotal = (typeof item.meters === "number" ? item.meters : 0) * (typeof item.pricePerUnit === "number" ? item.pricePerUnit : 0);
      
      return updated;
    });
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    updateItemFields(index, { [field]: value });
    
    // Auto populate productName etc when productId changes
    if (field === "productId") {
      const prod = products?.find(p => p.id === parseInt(value));
      if (prod) {
        updateItemFields(index, {
          productName: prod.name,
          pricePerUnit: parseFloat(String(prod.pricePerMeter)),
          primaryUnit: prod.primaryUnit || undefined,
          secondaryUnit: prod.secondaryUnit || undefined,
          categoryId: prod.categoryId
        });
      }
    }
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
      status: 'draft',
      items: items.map(i => {
        const prod = products?.find(p => p.id === i.productId);
        const cat = categories?.find(c => c.id === prod?.categoryId);
        return {
          productId: i.productId,
          rollId: i.rollId,
          categoryName: cat?.name,
          productName: i.productName,
          meters: typeof i.meters === "number" ? i.meters : 0,
          rolls: typeof i.rolls === "number" ? i.rolls : 0,
          pricePerMeter: typeof i.pricePerUnit === "number" ? i.pricePerUnit : 0,
          subtotal: i.subtotal,
          primaryUnit: i.primaryUnit || prod?.primaryUnit,
          secondaryUnit: i.secondaryUnit || prod?.secondaryUnit,
        };
      })
    });
    setPreviewOpen(true);
  };

  const buildItemsPayload = () => items.flatMap(i => {
    if (i.selectedRolls && i.selectedRolls.length > 0) {
      return i.selectedRolls.map(r => {
        const metersNum = typeof r.currentLength === "string" ? parseFloat(r.currentLength) : (r.currentLength || 0);
        const priceNum = typeof i.pricePerUnit === "number" ? i.pricePerUnit : (typeof i.pricePerUnit === "string" ? parseFloat(i.pricePerUnit) || 0 : 0);
        return { productId: i.productId, rollId: r.id, rolls: 1, meters: metersNum || 0, pricePerMeter: priceNum, subtotal: (metersNum || 0) * priceNum };
      });
    }
    const metersNum = typeof i.meters === "number" ? i.meters : (typeof i.meters === "string" ? parseFloat(i.meters) : 0);
    const rollsNum = typeof i.rolls === "number" ? i.rolls : (typeof i.rolls === "string" ? parseFloat(i.rolls) : 0);
    const priceNum = typeof i.pricePerUnit === "number" ? i.pricePerUnit : (typeof i.pricePerUnit === "string" ? parseFloat(i.pricePerUnit) || 0 : 0);
    const fallbackSubtotal = (typeof i.subtotal === "number" ? i.subtotal : (metersNum * priceNum));
    return [{ productId: i.productId, rollId: i.rollId || undefined, rolls: rollsNum || 0, meters: metersNum || 0, pricePerMeter: priceNum, subtotal: fallbackSubtotal }];
  });

  const handleSubmit = async (isDraft = false) => {
    if (items.length === 0) { toast({ title: "Tambahkan minimal 1 item", variant: "destructive" }); return; }
    if (items.some(i => !i.productId || (typeof i.meters === "number" ? i.meters : 0) <= 0)) { toast({ title: "Mohon lengkapi data barang", variant: "destructive" }); return; }

    const payload = {
      invoiceNumber: editingSaleId ? invoiceNumber : undefined,
      isDraft,
      customerId: (customerId && customerId !== "0") ? parseInt(customerId) : undefined,
      paymentType: paymentType as any,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
      items: buildItemsPayload(),
    };

    if (editingSaleId) {
      // Edit mode: call PUT
      try {
        const res = await fetch(`${API_BASE}/api/sales/${editingSaleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({}) });
        setIsOpen(false);
        resetForm();
        toast({ title: "Nota berhasil diperbarui" });
      } catch {
        toast({ title: "Gagal menyimpan perubahan", variant: "destructive" });
      }
    } else {
      createMutation.mutate({ data: payload });
    }
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
    if (activeTab === "Semua") return baseFiltered.filter(s => s.status !== 'cancelled');
    if (activeTab === "Draft") return baseFiltered.filter(s => s.status === 'draft');
    if (activeTab === "Kredit") return baseFiltered.filter(s => s.status?.toLowerCase() === "unpaid" || s.status === 'tempo');
    if (activeTab === "Dibatalkan") return baseFiltered.filter(s => s.status === 'cancelled');
    return baseFiltered.filter(s => s.status?.toLowerCase() === activeTab.toLowerCase());
  }, [baseFiltered, activeTab]);

  const summaryData = useMemo(() => {
    if (!filtered) return { subTotal: 0, diBayar: 0, sisaBayar: 0, kembalian: 0, totalRefund: 0 };
    // Exclude draft and cancelled from financial summary
    return filtered.filter(s => s.status !== 'draft' && s.status !== 'cancelled').reduce((acc, s: any) => {
      const baseTotal = parseFloat(s.totalAmount || "0");
      const diffTotal = s.returnDifference ? parseFloat(s.returnDifference) : 0;
      const grandTotal = baseTotal + diffTotal;
      
      const basePaid = parseFloat(s.paidAmount || "0");
      const diffPaid = (s as any).returnDifferencePaid ? parseFloat((s as any).returnDifferencePaid) : 0;
      const actualPaid = basePaid + diffPaid;
      
      const rem = grandTotal - actualPaid;
      
      acc.subTotal += grandTotal;
      acc.diBayar += actualPaid;
      
      if (rem > 0) {
        acc.sisaBayar += rem;
      } else if (rem < 0) {
        acc.kembalian += Math.abs(rem);
      }
      const refundAmt = s.returnDifference ? parseFloat(s.returnDifference) : 0;
      if (refundAmt < 0) {
        acc.totalRefund += Math.abs(refundAmt);
      }
      
      return acc;
    }, { subTotal: 0, diBayar: 0, sisaBayar: 0, kembalian: 0, totalRefund: 0 });
  }, [filtered]);

  return (
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      
      {/* Mobile-optimized Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Aktivitas</h1>
          <p className="text-sm text-slate-500">Riwayat penjualan Anda</p>
        </div>
        <Button onClick={() => { resetForm(); setIsOpen(true); }} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
          <Plus className="mr-2 h-4 w-4" /> Buat Nota
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {["Semua", "Lunas", "Kredit", "Partial", "Draft", "Dibatalkan"].map(tab => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
              activeTab === tab 
                ? tab === "Draft" ? 'text-slate-600' : tab === "Dibatalkan" ? 'text-red-500' : 'text-green-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
            {activeTab === tab && <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full ${
              tab === "Draft" ? 'bg-slate-500' : tab === "Dibatalkan" ? 'bg-red-500' : 'bg-green-600'
            }`} />}
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
           {/* Replace standard date filter with simpler or keep as is, but styled */}
           <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); }} />
      </div>

      {/* Rekap Summary (Moved to Top) */}
      {filtered && filtered.length > 0 && (
        <div className="bg-white p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
              <ReceiptIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Rekap Penjualan</h2>
              <p className="text-xs text-slate-500">{filtered.length} Transaksi Ditemukan</p>
            </div>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 sm:gap-8 justify-end">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Sub Total</span>
              <span className="font-bold text-slate-800">{formatRupiah(summaryData.subTotal)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Di Bayar</span>
              <span className="font-bold text-slate-800">{formatRupiah(summaryData.diBayar)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Sisa Bayar</span>
              <span className="font-bold text-rose-600">{formatRupiah(summaryData.sisaBayar)}</span>
            </div>
            {summaryData.totalRefund > 0 && (
              <div className="flex flex-col border-l border-slate-200 pl-4 sm:pl-8 ml-0 sm:ml-0">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Total Refund Kas</span>
                <span className="font-bold text-emerald-600">{formatRupiah(summaryData.totalRefund)}</span>
              </div>
            )}
            {summaryData.kembalian > 0 && (
              <div className="flex flex-col border-l border-slate-200 pl-4 sm:pl-8 ml-0 sm:ml-0">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Lebih Bayar</span>
                <span className="font-bold text-emerald-600">{formatRupiah(summaryData.kembalian)}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                  <div className="flex justify-between items-center bg-background px-4 py-2 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-500">
                      {formatDate(s.createdAt)}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatRupiah(s.totalAmount)}
                    </span>
                  </div>

                  {/* Main Content: Avatar, Title, Status */}
                  <div className="flex gap-3">
                    <div className="w-15 h-15 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
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
                      
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-[11px] text-slate-400 truncate">
                          1 [INV] {s.invoiceNumber} • {s.paymentType}
                        </p>
                        {(s as any).hasReturns && (
                          <div className="flex flex-col gap-1 mt-1.5">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[9px] h-4 py-0 px-1.5 border-amber-200 text-amber-700 bg-amber-50 uppercase tracking-widest font-bold">
                                Ada Retur/Tukar
                              </Badge>
                              {((s as any).returnDifference !== undefined && (s as any).returnDifference !== 0) && (
                                <span className={`text-[10px] font-bold ${(s as any).returnDifference > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {(s as any).returnDifference > 0 
                                    ? `(Selisih Tukar: Kurang Bayar Rp ${new Intl.NumberFormat('id-ID').format((s as any).returnDifference)}${isLunas ? ' - LUNAS' : ''})` 
                                    : `(Selisih Tukar: Lebih Bayar Rp ${new Intl.NumberFormat('id-ID').format(Math.abs((s as any).returnDifference))}${isLunas ? ' - SELESAI' : ''})`}
                                </span>
                              )}
                            </div>
                            {((s as any).totalReturnedValue > 0 || (s as any).totalExchangedValue > 0) && (
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium ml-0.5">
                                <span className="text-rose-600">Retur: -Rp {new Intl.NumberFormat('id-ID').format((s as any).totalReturnedValue || 0)}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-emerald-600">Tukar: +Rp {new Intl.NumberFormat('id-ID').format((s as any).totalExchangedValue || 0)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons — contextual based on status */}
                    <div className="flex items-end justify-end ml-2">
                      {s.status === 'cancelled' ? (
                        <span className="text-[10px] text-red-400 font-semibold px-2 py-1 bg-red-50 rounded-full">Dibatalkan</span>
                      ) : s.status === 'draft' ? (
                        <div className="flex flex-col gap-1.5">
                          <Button 
                            size="sm" 
                            className="rounded-full bg-blue-600 hover:bg-blue-700 font-bold h-8 px-3 shadow-sm text-xs"
                            onClick={() => { setPayPaymentType("tunai"); setPayDialogSaleId(s.id); }}
                          >
                            <CreditCard className="w-3 h-3 mr-1" /> Bayar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="rounded-full h-8 px-3 text-xs"
                            onClick={() => handleEditClick(s.id)}
                          >
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="rounded-full h-8 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                            disabled={cancelProcessing === s.id}
                            onClick={() => handleCancelClick(s.id)}
                          >
                            <Ban className="w-3 h-3 mr-1" /> Hapus
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <Button 
                            size="sm" 
                            className="rounded-full bg-green-600 hover:bg-green-700 font-bold h-8 px-4 shadow-sm text-xs"
                            onClick={() => { setPreviewData(null); setPreviewSaleId(s.id); setPreviewOpen(true); }}
                          >
                            <Printer className="w-3 h-3 mr-1" /> Cetak
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="rounded-full h-8 px-3 text-xs"
                            onClick={() => handleEditClick(s.id)}
                          >
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="rounded-full h-8 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                            disabled={cancelProcessing === s.id}
                            onClick={() => handleCancelClick(s.id)}
                          >
                            <Ban className="w-3 h-3 mr-1" /> Hapus
                          </Button>
                        </div>
                      )}
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
          <div className="pt-4 flex justify-center pb-2">
            <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Pay Dialog */}
      {payDialogSaleId !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setPayDialogSaleId(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Proses Pembayaran</h2>
            <p className="text-sm text-slate-500 mb-4">Pilih metode pembayaran untuk nota ini</p>
            <Select value={payPaymentType} onValueChange={setPayPaymentType}>
              <SelectTrigger className="mb-4"><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethods.filter(m => m.isActive).length > 0
                  ? paymentMethods.filter(m => m.isActive).map(m => <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>)
                  : <><SelectItem value="tunai">Tunai</SelectItem><SelectItem value="transfer">Transfer</SelectItem><SelectItem value="kredit">Kredit</SelectItem></>
                }
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setPayDialogSaleId(null)}>Batal</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={payProcessing} onClick={() => handlePay(payDialogSaleId!)}>
                {payProcessing ? "Memproses..." : "✅ Konfirmasi Bayar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); resetForm(); } }}>
        <DrawerContent className="max-h-[96vh] mx-auto w-full max-w-[95vw] xl:max-w-7xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle className="text-xl">{editingSaleId ? `Edit Nota — ${invoiceNumber}` : "Buat Penjualan Baru"}</DrawerTitle></DrawerHeader>
          <div id="drawer-portal-target" />
          <div className="overflow-y-auto max-h-[calc(96vh-6rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 bg-muted/50 p-3 rounded-md">
              <span className="text-sm font-medium text-muted-foreground">No. Invoice:</span>
              {editingSaleId ? (
                <span className="text-base font-mono font-bold break-all">{invoiceNumber}</span>
              ) : (
                <span className="text-sm text-slate-400 italic">Akan ditetapkan saat pembayaran dikonfirmasi</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium mb-1 block">Pelanggan</label>
                <Combobox
                  items={[
                    { value: "0", label: "Pelanggan Umum" },
                    ...(customers?.map((c: any) => ({ value: c.id.toString(), label: c.name })) || [])
                  ]}
                  value={customerId}
                  onValueChange={setCustomerId}
                  placeholder="Pilih pelanggan (opsional)"
                  searchPlaceholder="Cari pelanggan..."
                />
              </div>
              <div className="space-y-2">
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
                <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm font-medium">Belum ada item. Klik "Tambah Item" untuk memulai.</div>
              )}
              <div className="space-y-2">
                {items.map((item, index) => (
                  <SaleItemRow 
                    key={`item-${index}`} 
                    item={item} 
                    index={index} 
                    products={products} 
                    categories={categories} 
                    updateItem={updateItem} 
                    updateItemFields={updateItemFields}
                    removeItem={removeItem} 
                    allItems={items} 
                  />
                ))}
              </div>
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
          <DrawerFooter className="mt-4 px-0 flex flex-col gap-2">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={handlePreview} title="Preview & Cetak Nota">
                <Printer className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => { setIsOpen(false); resetForm(); }}>Batal</Button>
              {editingSaleId ? (
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleSubmit(false)} disabled={createMutation.isPending || items.length === 0}>
                  Simpan Perubahan
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-400 text-slate-700" 
                    onClick={() => handleSubmit(true)} 
                    disabled={createMutation.isPending || items.length === 0}
                  >
                    🕐 Simpan & Tahan
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700" 
                    onClick={() => handleSubmit(false)} 
                    disabled={createMutation.isPending || items.length === 0}
                  >
                    💳 Simpan & Bayar
                  </Button>
                </>
              )}
            </div>
          </DrawerFooter>

        </DrawerContent>
      </Drawer>
      
      <InvoicePreviewModal 
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        saleId={previewSaleId}
      />
      <OtpDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        onSuccess={(token) => {
          setOtpDialogOpen(false);
          if (otpAction === "edit" && otpTargetId) {
            openEditMode(otpTargetId);
          } else if (otpAction === "cancel" && otpTargetId) {
            handleCancel(otpTargetId);
          }
        }}
      />
    </div>
  );
}

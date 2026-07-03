import { useState } from "react";
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
import { Plus, Trash2, Search, ShoppingCart, PlusCircle, Printer } from "lucide-react";
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
        <label className="text-xs text-muted-foreground mb-1 block">Kategori</label>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="h-8"><SelectValue placeholder="Semua" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories?.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name} {c.description ? `- ${c.description}` : ''}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-muted-foreground mb-1 block">Barang</label>
        <Select value={item.productId ? item.productId.toString() : ""} onValueChange={v => { updateItem(index, "productId", parseInt(v)); }}>
          <SelectTrigger className="h-8"><SelectValue placeholder="Pilih barang" /></SelectTrigger>
          <SelectContent>
            {filteredProducts?.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-muted-foreground mb-1 block">Roll (Stiker)</label>
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
          <SelectTrigger className="h-8"><SelectValue placeholder="Pilih roll (opsional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Potong Bebas (Meteran)</SelectItem>
            {Object.keys(lengthGroups).length > 0 && (
              <SelectGroup>
                <SelectLabel>Pilih Otomatis (Per Ukuran)</SelectLabel>
                {Object.entries(lengthGroups).map(([len, count]) => (
                  <SelectItem key={`len_${len}`} value={`len_${len}`}>
                    Ukuran {len}m (Tersedia: {count} roll)
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {availableRolls.length > 0 && (
              <SelectGroup>
                <SelectLabel>Pilih Spesifik Barcode</SelectLabel>
                {availableRolls.map(r => (
                  <SelectItem key={`r_${r.id}`} value={`r_${r.id}`}>
                    {r.barcode} ({r.currentLength}m)
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-1">
        <label className="text-xs text-muted-foreground mb-1 block">Satuan</label>
        <Select value={item.unit} onValueChange={v => updateItem(index, "unit", v)} disabled={!!item.rollId}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="meter">{item.primaryUnit || "Meter"}</SelectItem>
            <SelectItem value="roll">{item.secondaryUnit || "Roll"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-1">
        <label className="text-xs text-muted-foreground mb-1 block truncate">{item.unit === "meter" ? `Jml (${item.primaryUnit?.toLowerCase() || "m"})` : `Jml (${item.secondaryUnit?.toLowerCase() || "roll"})`}</label>
        <Input className="h-8" type="number" step="any" min={0} max={maxRolls} value={item.unit === "meter" ? item.meters : item.rolls}
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
        <label className="text-xs text-muted-foreground mb-1 block">Harga/satuan</label>
        <Input className="h-8" type="number" step="any" min={0} value={item.pricePerUnit} onChange={e => updateItem(index, "pricePerUnit", e.target.value === "" ? "" : parseFloat(e.target.value))} />
      </div>
      <div className="md:col-span-1">
        <label className="text-xs text-muted-foreground mb-1 block">Subtotal</label>
        <div className="h-8 flex items-center text-sm font-medium">{formatRupiah(item.subtotal)}</div>
      </div>
      <div className="md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    </div>
  );
}

export default function Penjualan() {
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

  const filtered = filterByDateRange(
    sales?.filter(s => {
      const q = search.toLowerCase();
      return s.invoiceNumber?.toLowerCase().includes(q) || (s as any).customerName?.toLowerCase().includes(q);
    }) ?? [],
    dateFrom,
    dateTo,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penjualan</h1>
          <p className="text-muted-foreground mt-1">Catat dan kelola transaksi penjualan.</p>
        </div>
        <Button onClick={() => { setInvoiceNumber(generateInvoiceNumber()); setIsOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Buat Penjualan</Button>
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CardTitle className="text-lg font-medium flex-1">Daftar Penjualan</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari invoice / pelanggan..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); }} />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="hidden md:table-cell">Tgl. Transaksi</TableHead>
                <TableHead className="hidden md:table-cell">Pembayaran</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right hidden md:table-cell">Terbayar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <TableRow key={i}>{Array(8).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>)
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Belum ada penjualan
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono font-medium">{s.invoiceNumber}</TableCell>
                    <TableCell>{(s as any).customerName || <span className="text-muted-foreground">Umum</span>}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{formatDate(s.createdAt)}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline" className="capitalize">{s.paymentType}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{formatRupiah(s.totalAmount)}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{formatRupiah(s.paidAmount ?? 0)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[s.status ?? "kredit"] || "bg-gray-100 text-gray-700"}`}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => { setPreviewData(null); setPreviewSaleId(s.id); setPreviewOpen(true); }} title="Cetak Nota">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); resetForm(); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-4xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Buat Penjualan Baru</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
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

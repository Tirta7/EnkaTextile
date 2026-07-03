import { useState } from "react";
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
import { Plus, Trash2, Search, ShoppingBag, PlusCircle } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pembelian</h1>
          <p className="text-muted-foreground mt-1">Catat dan kelola pembelian dari supplier.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat Pembelian</Button>
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CardTitle className="text-lg font-medium flex-1">Daftar Pembelian</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari invoice / supplier..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); }} />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. PO</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Tgl. Pembelian</TableHead>
                <TableHead>Pembayaran</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Terbayar</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <TableRow key={i}>{Array(7).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>)
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <ShoppingBag className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Belum ada pembelian
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-medium">{p.invoiceNumber}</TableCell>
                    <TableCell>{(p as any).supplierName || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.paymentType}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{formatRupiah(p.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(p.paidAmount ?? 0)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[p.status ?? "kredit"] || "bg-gray-100 text-gray-700"}`}>{p.status}</span>
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
                    <Select value={item.productId ? item.productId.toString() : ""} onValueChange={v => updateItem(index, "productId", parseInt(v))}>
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

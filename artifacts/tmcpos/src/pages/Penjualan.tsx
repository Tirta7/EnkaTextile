import { useState } from "react";
import { useListSales, useCreateSale, useListCustomers, useListProducts, getListSalesQueryKey, getListCustomersQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Search, ShoppingCart, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate, generateInvoiceNumber } from "@/lib/utils";

type SaleItem = { productId: number; productName: string; unit: "meter" | "roll"; rolls: number; meters: number; pricePerUnit: number; subtotal: number; };

const STATUS_COLORS: Record<string, string> = {
  lunas: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  kredit: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Penjualan() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("tunai");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: sales, isLoading } = useListSales({}, { query: { queryKey: getListSalesQueryKey({}) } });
  const { data: customers } = useListCustomers({}, { query: { queryKey: getListCustomersQueryKey({}) } });
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateSale({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({}) });
        setIsOpen(false);
        resetForm();
        toast({ title: "Penjualan berhasil dicatat" });
      }
    }
  });

  const resetForm = () => {
    setItems([]);
    setCustomerId("");
    setPaymentType("tunai");
    setDueDate("");
    setNotes("");
  };

  const addItem = () => {
    setItems(prev => [...prev, { productId: 0, productName: "", unit: "meter", rolls: 0, meters: 0, pricePerUnit: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "productId") {
        const prod = products?.find(p => p.id === parseInt(value));
        if (prod) {
          updated[index].productName = prod.name;
          updated[index].pricePerUnit = prod.pricePerMeter;
        }
      }
      const item = updated[index];
      if (item.unit === "meter") {
        updated[index].subtotal = item.meters * item.pricePerUnit;
      } else {
        updated[index].subtotal = item.rolls * item.pricePerUnit;
      }
      return updated;
    });
  };

  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  const handleSubmit = () => {
    if (items.length === 0) { toast({ title: "Tambahkan minimal 1 item", variant: "destructive" }); return; }
    if (items.some(i => !i.productId)) { toast({ title: "Pilih produk untuk semua item", variant: "destructive" }); return; }
    createMutation.mutate({
      data: {
        invoiceNumber: generateInvoiceNumber("INV"),
        customerId: customerId ? parseInt(customerId) : undefined,
        paymentType: paymentType as any,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        items: items.map(i => ({
          productId: i.productId,
          unit: i.unit,
          rolls: i.rolls,
          meters: i.meters,
          pricePerUnit: i.pricePerUnit,
          subtotal: i.subtotal,
        }))
      }
    });
  };

  const filtered = sales?.filter(s => {
    const q = search.toLowerCase();
    return s.invoiceNumber?.toLowerCase().includes(q) || (s as any).customerName?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penjualan</h1>
          <p className="text-muted-foreground mt-1">Catat dan kelola transaksi penjualan.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat Penjualan</Button>
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <CardTitle className="text-lg font-medium flex-1">Daftar Penjualan</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari invoice / pelanggan..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tgl. Transaksi</TableHead>
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
                    <ShoppingCart className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Belum ada penjualan
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono font-medium">{s.invoiceNumber}</TableCell>
                    <TableCell>{(s as any).customerName || <span className="text-muted-foreground">Umum</span>}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{s.paymentType}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{formatRupiah(s.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(s.paidAmount ?? 0)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[s.status ?? "kredit"] || "bg-gray-100 text-gray-700"}`}>
                        {s.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Buat Penjualan Baru</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
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
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="cashless">Cashless/QRIS</SelectItem>
                    <SelectItem value="kredit">Kredit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentType === "kredit" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Jatuh Tempo</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              )}
              <div className={paymentType === "kredit" ? "" : "col-span-2"}>
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
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/30 rounded-lg">
                  <div className="col-span-4">
                    <label className="text-xs text-muted-foreground mb-1 block">Barang</label>
                    <Select value={item.productId ? item.productId.toString() : ""} onValueChange={v => { updateItem(index, "productId", parseInt(v)); }}>
                      <SelectTrigger className="h-8"><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                      <SelectContent>
                        {products?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Satuan</label>
                    <Select value={item.unit} onValueChange={v => updateItem(index, "unit", v)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meter">Meter</SelectItem>
                        <SelectItem value="roll">Roll</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">{item.unit === "meter" ? "Jumlah (m)" : "Jumlah (roll)"}</label>
                    <Input className="h-8" type="number" min={0} value={item.unit === "meter" ? item.meters : item.rolls}
                      onChange={e => updateItem(index, item.unit === "meter" ? "meters" : "rolls", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Harga/satuan</label>
                    <Input className="h-8" type="number" min={0} value={item.pricePerUnit} onChange={e => updateItem(index, "pricePerUnit", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Subtotal</label>
                    <div className="h-8 flex items-center text-sm font-medium">{formatRupiah(item.subtotal)}</div>
                  </div>
                  <div className="col-span-1 flex justify-end">
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
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>Batal</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || items.length === 0}>Simpan Penjualan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

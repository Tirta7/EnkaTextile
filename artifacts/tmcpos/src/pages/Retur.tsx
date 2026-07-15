import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListReturns, useCreateReturn, useListProducts, getListReturnsQueryKey, useListSales, useListPurchases, useGetSale, useGetPurchase, getGetSaleQueryKey, getGetPurchaseQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCcw, Trash2, Search, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";
import { ReturnInvoiceModal } from "@/components/ReturnInvoiceModal";

type ReturnItemForm = { productId: number; productName: string; rolls: number | ""; meters: number | ""; pricePerMeter: number | ""; subtotal: number; };

function ReturItemRow({ item, index, products, updateItem, removeItem, label }: any) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:items-end p-4 bg-white/50 dark:bg-slate-950/50 rounded-xl border border-border/50 shadow-sm mb-3">
      <div className="md:col-span-4">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Pilih Barang {label}</label>
        <Select 
          key={item.productId ? `select-${item.productId}` : `select-empty`}
          value={item.productId ? item.productId.toString() : undefined} 
          onValueChange={(val: string) => {
            const p = products?.find((p: any) => p.id.toString() === val);
            if (p) {
              updateItem(index, { productId: p.id, productName: p.name, pricePerMeter: p.pricePerMeter || 0 });
            }
          }}
        >
          <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-900/80">
            <SelectValue placeholder={item.productName || "Pilih barang..."} />
          </SelectTrigger>
          <SelectContent>
            {products?.map((p: any) => (
              <SelectItem key={p.id} value={p.id.toString()} className="py-2.5">{p.name}</SelectItem>
            ))}
            {item.productId && (!products || !products.some((p: any) => p.id.toString() === item.productId.toString())) && (
              <SelectItem value={item.productId.toString()} className="py-2.5">{item.productName || `Barang Tidak Diketahui`}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block truncate">Jml (Roll)</label>
        <Input type="number" value={item.rolls} onChange={(e) => updateItem(index, { rolls: e.target.value ? Number(e.target.value) : "" })} className="h-12 bg-white/80 dark:bg-slate-900/80 text-center font-medium" min="0" placeholder="0" />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block truncate">Jml (Meter)</label>
        <Input type="number" value={item.meters} onChange={(e) => updateItem(index, { meters: e.target.value ? Number(e.target.value) : "" })} className="h-12 bg-white/80 dark:bg-slate-900/80 text-center font-medium" min="0" step="0.1" placeholder="0" />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Harga/m</label>
        <Input type="number" value={item.pricePerMeter} onChange={(e) => updateItem(index, { pricePerMeter: e.target.value ? Number(e.target.value) : "" })} className="h-12 bg-white/80 dark:bg-slate-900/80 font-medium" min="0" />
      </div>
      <div className="md:col-span-2 flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Subtotal</label>
          <div className="h-12 flex items-center px-3 text-base font-bold bg-muted/50 rounded-md border border-transparent">{formatRupiah(item.subtotal)}</div>
        </div>
        <div className="pt-5 shrink-0">
          <Button variant="destructive" size="icon" onClick={() => removeItem(index)} className="h-12 w-12 shrink-0 shadow-sm hover:shadow-md transition-all"><Trash2 className="w-5 h-5" /></Button>
        </div>
      </div>
    </div>
  );
}

export default function Retur() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: returns, isLoading } = useListReturns();
  const { data: products } = useListProducts();
  const { data: sales } = useListSales();
  const { data: purchases } = useListPurchases();
  
  const createReturn = useCreateReturn();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [previewReturnId, setPreviewReturnId] = useState<number | null>(null);
  
  // Form State
  const [type, setType] = useState<"penjualan" | "pembelian">("penjualan");
  const [paymentStatus, setPaymentStatus] = useState<"lunas" | "tempo">("lunas");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [returnedItems, setReturnedItems] = useState<ReturnItemForm[]>([]);
  const [exchangedItems, setExchangedItems] = useState<ReturnItemForm[]>([]);
  
  const saleQuery = useGetSale(parseInt(selectedInvoiceId || "0"), {
    query: { 
      enabled: type === 'penjualan' && !!selectedInvoiceId && isDrawerOpen,
      queryKey: getGetSaleQueryKey(parseInt(selectedInvoiceId || "0"))
    }
  });
  
  const purchaseQuery = useGetPurchase(parseInt(selectedInvoiceId || "0"), {
    query: { 
      enabled: type === 'pembelian' && !!selectedInvoiceId && isDrawerOpen,
      queryKey: getGetPurchaseQueryKey(parseInt(selectedInvoiceId || "0"))
    }
  });

  useEffect(() => {
    if (type === 'penjualan' && saleQuery.data && saleQuery.data.id.toString() === selectedInvoiceId) {
      if (returnedItems.length === 0) { // Only auto-fill if empty to prevent overriding manual edits
        setReturnedItems(saleQuery.data.items.map((i: any) => ({
          productId: i.productId,
          productName: i.productName || "",
          rolls: Number(i.rolls) || "",
          meters: Number(i.meters) || "",
          pricePerMeter: Number(i.pricePerMeter) || 0,
          subtotal: Number(i.subtotal) || 0
        })));
      }
    }
  }, [type, selectedInvoiceId, saleQuery.data]);

  useEffect(() => {
    if (type === 'pembelian' && purchaseQuery.data && purchaseQuery.data.id.toString() === selectedInvoiceId) {
      if (returnedItems.length === 0) { // Only auto-fill if empty
        setReturnedItems(purchaseQuery.data.items.map((i: any) => ({
          productId: i.productId,
          productName: i.productName || "",
          rolls: Number(i.rolls) || "",
          meters: Number(i.meters) || "",
          pricePerMeter: Number(i.pricePerMeter) || 0,
          subtotal: Number(i.subtotal) || 0
        })));
      }
    }
  }, [type, selectedInvoiceId, purchaseQuery.data]);
  
  const addReturnedItem = () => setReturnedItems([...returnedItems, { productId: 0, productName: "", rolls: 0, meters: 0, pricePerMeter: 0, subtotal: 0 }]);
  const addExchangedItem = () => setExchangedItems([...exchangedItems, { productId: 0, productName: "", rolls: 0, meters: 0, pricePerMeter: 0, subtotal: 0 }]);
  
  const updateItem = (list: any[], setList: any) => (index: number, changes: Partial<ReturnItemForm>) => {
    const newList = [...list];
    newList[index] = { ...newList[index], ...changes };
    const it = newList[index];
    it.subtotal = (Number(it.meters) || 0) * (Number(it.pricePerMeter) || 0); // Simple meter-based subtotal
    setList(newList);
  };
  const removeItem = (list: any[], setList: any) => (index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const totalReturned = returnedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalExchanged = exchangedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const difference = totalExchanged - totalReturned;

  const handleSubmit = () => {
    if (returnedItems.length === 0 && exchangedItems.length === 0) {
      toast({ title: "Error", description: "Tambahkan setidaknya 1 barang retur/tukar", variant: "destructive" });
      return;
    }
    
    createReturn.mutate({
      data: {
        type,
        paymentStatus,
        saleId: type === 'penjualan' && selectedInvoiceId ? parseInt(selectedInvoiceId) : undefined,
        purchaseId: type === 'pembelian' && selectedInvoiceId ? parseInt(selectedInvoiceId) : undefined,
        customerId: type === 'penjualan' && selectedInvoiceId ? sales?.find(s => s.id === parseInt(selectedInvoiceId))?.customerId : undefined,
        supplierId: type === 'pembelian' && selectedInvoiceId ? purchases?.find(p => p.id === parseInt(selectedInvoiceId))?.supplierId : undefined,
        returnedItems: returnedItems.filter(i => i.productId).map(i => ({
          productId: i.productId,
          rolls: Number(i.rolls) || 0,
          meters: Number(i.meters) || 0,
          pricePerMeter: Number(i.pricePerMeter) || 0,
          subtotal: i.subtotal
        })),
        exchangedItems: exchangedItems.filter(i => i.productId).map(i => ({
          productId: i.productId,
          rolls: Number(i.rolls) || 0,
          meters: Number(i.meters) || 0,
          pricePerMeter: Number(i.pricePerMeter) || 0,
          subtotal: i.subtotal
        }))
      }
    }, {
      onSuccess: () => {
        toast({ title: "Sukses", description: "Retur/Tukar berhasil dicatat" });
        setIsDrawerOpen(false);
        setReturnedItems([]);
        setExchangedItems([]);
        setSelectedInvoiceId("");
        queryClient.invalidateQueries({ queryKey: getListReturnsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Gagal", description: err.response?.data?.error || "Gagal mencatat retur", variant: "destructive" });
      }
    });
  };

  const filteredReturns = useMemo(() => {
    let result = (returns || []) as any[];
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.returnNumber?.toLowerCase().includes(q) || r.customerName?.toLowerCase().includes(q) || r.supplierName?.toLowerCase().includes(q));
    }
    
    result = filterByDateRange(result, dateFrom, dateTo);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [returns, search, dateFrom, dateTo]);

  return (
    <div className="p-4 md:p-8 pt-6">
      <PageHeader title="Retur Barang" description="Kelola pengembalian dan penukaran barang" />
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Cari nota retur..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 bg-white/50 border-primary/20 focus-visible:ring-primary shadow-sm" />
              </div>
              <DateRangeFilter onFilter={(f, t) => { setDateFrom(f); setDateTo(t); }} />
            </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
          <Plus className="h-5 w-5 mr-2" /> Catat Retur Baru
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl">
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="py-4">No. Retur</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Nilai Kembali</TableHead>
                  <TableHead className="text-right">Nilai Pengganti</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.returnNumber}</TableCell>
                    <TableCell>
                      <Badge variant={r.type === 'penjualan' ? 'default' : 'secondary'}>{r.type === 'penjualan' ? 'Penjualan' : 'Pembelian'}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(Number(r.totalReturnedValue))}</TableCell>
                    <TableCell className="text-right">{formatRupiah(Number(r.totalExchangedValue))}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatRupiah(Number(r.differenceAmount))}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{r.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => setPreviewReturnId(r.id)}>
                        <Printer className="h-3.5 w-3.5" /> Cetak
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!returns?.length && !isLoading && (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Tidak ada data retur.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PaginationControl 
        currentPage={page} 
        totalPages={Math.ceil(filteredReturns.length / itemsPerPage) || 1} 
        onPageChange={setPage} 
      />

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[95vh] max-h-screen border-t border-primary/20">
          <DrawerHeader className="border-b bg-muted/20 pb-6">
            <DrawerTitle className="text-2xl font-bold flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><RefreshCcw className="h-7 w-7" /></div> 
              <div>
                <div className="text-2xl font-black">Transaksi Retur & Tukar Barang</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">Selesaikan pengembalian atau penukaran barang dari pelanggan.</div>
              </div>
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipe Retur</label>
                <Select value={type} onValueChange={(val: any) => { setType(val); setSelectedInvoiceId(""); setReturnedItems([]); setExchangedItems([]); }}>
                  <SelectTrigger className="h-12 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="penjualan">Retur Penjualan (Dari Pelanggan)</SelectItem>
                    <SelectItem value="pembelian">Retur Pembelian (Ke Supplier)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Pilih {type === "penjualan" ? "Nota Penjualan" : "Nota Pembelian"} (Opsional)
                </label>
                <Select value={selectedInvoiceId} onValueChange={(val: string) => { setSelectedInvoiceId(val); setReturnedItems([]); setExchangedItems([]); }}>
                  <SelectTrigger className="h-12 bg-white"><SelectValue placeholder="Tanpa Referensi" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- Tanpa Referensi --</SelectItem>
                    {type === "penjualan" ? (
                      sales?.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.invoiceNumber} - {s.customerName || "Umum"}</SelectItem>
                      ))
                    ) : (
                      purchases?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.invoiceNumber} - {p.supplierName || "Umum"}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Penyelesaian Kas</label>
                <Select value={paymentStatus} onValueChange={(val: any) => setPaymentStatus(val)}>
                  <SelectTrigger className="h-12 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunas">Kas Tunai (Lunas/Uang Kembali)</SelectItem>
                    <SelectItem value="tempo">Potong Saldo (Piutang/Hutang)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bagian Kiri: Barang yang Dikembalikan */}
            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20">
              <h3 className="font-bold text-lg text-red-600 mb-4 flex justify-between items-center">
                <span>Barang Kembali (Masuk Toko)</span>
                <Badge variant="destructive">Nilai Deposit: {formatRupiah(totalReturned)}</Badge>
              </h3>
              
              {returnedItems.map((item, i) => (
                <ReturItemRow key={i} item={item} index={i} products={products} updateItem={updateItem(returnedItems, setReturnedItems)} removeItem={removeItem(returnedItems, setReturnedItems)} label="Kembali" />
              ))}
              
              <Button variant="outline" onClick={addReturnedItem} className="w-full mt-4 border-dashed"><Plus className="w-4 h-4 mr-2"/> Tambah Barang Retur</Button>
            </div>

            {/* Bagian Kanan: Barang Pengganti */}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
              <h3 className="font-bold text-lg text-primary mb-4 flex justify-between items-center">
                <span>Barang Pengganti (Keluar Toko)</span>
                <Badge>Nilai Tagihan: {formatRupiah(totalExchanged)}</Badge>
              </h3>
              
              {exchangedItems.map((item, i) => (
                <ReturItemRow key={i} item={item} index={i} products={products} updateItem={updateItem(exchangedItems, setExchangedItems)} removeItem={removeItem(exchangedItems, setExchangedItems)} label="Pengganti" />
              ))}
              
              <Button variant="outline" onClick={addExchangedItem} className="w-full mt-4 border-dashed text-primary hover:text-primary"><Plus className="w-4 h-4 mr-2"/> Tambah Barang Pengganti</Button>
            </div>
          </div>
          </div>
          
          <div className="p-6 border-t bg-muted/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-right w-full md:w-auto justify-between md:justify-end">
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Total Selisih</div>
                <div className={`text-3xl font-black tracking-tight ${difference > 0 ? 'text-primary' : difference < 0 ? 'text-red-500' : 'text-foreground'}`}>
                  {difference > 0 ? '+' : ''}{formatRupiah(difference)}
                </div>
              </div>
              <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" onClick={handleSubmit} disabled={createReturn.isPending}>
                Simpan Retur
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <ReturnInvoiceModal 
        open={previewReturnId !== null} 
        onOpenChange={(open) => !open && setPreviewReturnId(null)} 
        returnId={previewReturnId || undefined} 
      />
    </div>
  );
}

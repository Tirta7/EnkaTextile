import { useState } from "react";
import { useListProducts, useListCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah, formatNumber } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  categoryId: z.number({ required_error: "Kategori wajib dipilih" }),
  lotNumber: z.string().optional(),
  rackLocation: z.string().optional(),
  pricePerMeter: z.number().min(0, "Harga tidak boleh negatif"),
  pricePerRoll: z.number().optional(),
  rollStock: z.number().min(0),
  meterStock: z.number().min(0),
  minStock: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

export default function Barang() {
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: products, isLoading } = useListProducts({}, { query: { queryKey: getListProductsQueryKey({}) } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", lotNumber: "", rackLocation: "", pricePerMeter: 0, rollStock: 0, meterStock: 0, minStock: 0 },
  });

  const createMutation = useCreateProduct({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) }); setIsOpen(false); toast({ title: "Barang berhasil ditambahkan" }); }
    }
  });

  const updateMutation = useUpdateProduct({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) }); setIsOpen(false); setEditingId(null); toast({ title: "Barang berhasil diperbarui" }); }
    }
  });

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) }); toast({ title: "Barang berhasil dihapus" }); }
    }
  });

  const onSubmit = (data: FormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  const openCreate = () => {
    form.reset({ name: "", lotNumber: "", rackLocation: "", pricePerMeter: 0, rollStock: 0, meterStock: 0, minStock: 0 });
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (p: any) => {
    form.reset({
      name: p.name,
      categoryId: p.categoryId,
      lotNumber: p.lotNumber || "",
      rackLocation: p.rackLocation || "",
      pricePerMeter: p.pricePerMeter,
      pricePerRoll: p.pricePerRoll ?? undefined,
      rollStock: p.rollStock,
      meterStock: p.meterStock,
      minStock: p.minStock,
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const filtered = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.lotNumber && p.lotNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesLowStock = !showLowStock || p.isLowStock;
    return matchesSearch && matchesLowStock;
  });

  const lowStockCount = products?.filter(p => p.isLowStock).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barang</h1>
          <p className="text-muted-foreground mt-1">Kelola inventori barang tekstil.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Tambah Barang</Button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-200">{lowStockCount} barang memiliki stok rendah</span>
          <Button variant="link" size="sm" className="text-amber-700 p-0 h-auto" onClick={() => setShowLowStock(!showLowStock)}>
            {showLowStock ? "Tampilkan semua" : "Lihat barang stok rendah"}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <CardTitle className="text-lg font-medium flex-1">Daftar Barang</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama / no lot..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>No. Lot / Rak</TableHead>
                <TableHead className="text-right">Harga/Meter</TableHead>
                <TableHead className="text-right">Stok Roll</TableHead>
                <TableHead className="text-right">Stok Meter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[80px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(8).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Package className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Tidak ada barang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((p) => (
                  <TableRow key={p.id} className={p.isLowStock ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary">{p.categoryName || "-"}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.lotNumber || "-"} {p.rackLocation ? `• ${p.rackLocation}` : ""}</TableCell>
                    <TableCell className="text-right font-medium">{formatRupiah(p.pricePerMeter)}</TableCell>
                    <TableCell className="text-right">{formatNumber(p.rollStock)} roll</TableCell>
                    <TableCell className="text-right">{formatNumber(p.meterStock)} m</TableCell>
                    <TableCell>
                      {p.isLowStock ? (
                        <Badge variant="destructive" className="text-xs">Stok Rendah</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Hapus barang ini?')) deleteMutation.mutate({ id: p.id }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setEditingId(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Barang" : "Tambah Barang"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nama Barang</FormLabel>
                    <FormControl><Input placeholder="Contoh: Katun Premium 100cm" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={v => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lotNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Lot</FormLabel>
                    <FormControl><Input placeholder="Opsional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rackLocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi Rak</FormLabel>
                    <FormControl><Input placeholder="Contoh: A-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pricePerMeter" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga/Meter (Rp)</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pricePerRoll" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga/Roll (Rp)</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="Opsional" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rollStock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok (Roll)</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="meterStock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok (Meter)</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="minStock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Stok (Meter)</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); setEditingId(null); }}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

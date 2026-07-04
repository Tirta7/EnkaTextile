import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListProducts, useListCategories, useListUnits, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey, getListCategoriesQueryKey, getListUnitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { ProductRollsModal } from "@/components/ProductRollsModal";const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  categoryId: z.number({ required_error: "Kategori wajib dipilih" }),
  barcode: z.string().optional(),
  primaryUnit: z.string().optional(),
  secondaryUnit: z.string().optional(),
  lotNumber: z.string().optional(),
  rackLocation: z.string().optional(),
  costPricePerMeter: z.number().min(0, "Harga beli tidak boleh negatif"),
  costPricePerRoll: z.number().optional(),
  pricePerMeter: z.number().min(0, "Harga jual tidak boleh negatif"),
  pricePerRoll: z.number().optional(),
  rollStock: z.number().min(0).optional(),
  meterStock: z.number().min(0).optional(),
  minStock: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

export default function Barang() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewRollsId, setViewRollsId] = useState<number | null>(null);
  const [viewRollsName, setViewRollsName] = useState("");
  const [calcPerRoll, setCalcPerRoll] = useState<number | ''>('');

  const { data: products, isLoading } = useListProducts({}, { query: { queryKey: getListProductsQueryKey({}) } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const { data: units } = useListUnits({ query: { queryKey: getListUnitsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", barcode: "", primaryUnit: "METER", secondaryUnit: "ROLL", lotNumber: "", rackLocation: "", costPricePerMeter: 0, pricePerMeter: 0, minStock: 0, rollStock: 0, meterStock: 0 },
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
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) }); toast({ title: "Barang berhasil dihapus" }); },
      onError: (error: any) => { toast({ title: "Gagal menghapus", description: error.data?.error || "Terjadi kesalahan", variant: "destructive" }); }
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync({ data });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openCreate = () => {
    form.reset({ name: "", barcode: "", primaryUnit: "METER", secondaryUnit: "ROLL", lotNumber: "", rackLocation: "", costPricePerMeter: 0, pricePerMeter: 0, minStock: 0, rollStock: 0, meterStock: 0 });
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (p: any) => {
    form.reset({
      name: p.name,
      categoryId: p.categoryId,
      barcode: p.barcode || "",
      primaryUnit: p.primaryUnit || "METER",
      secondaryUnit: p.secondaryUnit || "ROLL",
      lotNumber: p.lotNumber || "",
      rackLocation: p.rackLocation || "",
      costPricePerMeter: p.costPricePerMeter ?? 0,
      costPricePerRoll: p.costPricePerRoll ?? undefined,
      pricePerMeter: p.pricePerMeter,
      pricePerRoll: p.pricePerRoll ?? undefined,
      rollStock: p.rollStock ?? 0,
      meterStock: p.meterStock ?? 0,
      minStock: p.minStock,
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const openViewRolls = (p: any) => {
    setViewRollsId(p.id);
    setViewRollsName(p.name);
  };

  const filtered = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.lotNumber && p.lotNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesLowStock = !showLowStock || p.isLowStock;
    const matchesCategory = selectedCategoryId === null || p.categoryId === selectedCategoryId;
    return matchesSearch && matchesLowStock && matchesCategory;
  });

  const lowStockCount = products?.filter(p => p.isLowStock).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barang"
        description="Kelola inventori barang tekstil."
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Tambah Barang</Button>}
      />

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-200">{lowStockCount} barang memiliki stok rendah</span>
          <Button variant="link" size="sm" className="text-amber-700 p-0 h-auto" onClick={() => setShowLowStock(!showLowStock)}>
            {showLowStock ? "Tampilkan semua" : "Lihat barang stok rendah"}
          </Button>
        </div>
      )}

      {/* Premium Category Cloud */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-8">
        <button 
          onClick={() => { setSelectedCategoryId(null); setCurrentPage(1); }}
          className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm border ${
            selectedCategoryId === null 
              ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:shadow-md hover:-translate-y-0.5"
          }`}
        >
          Semua Kategori
          <span className={`flex items-center justify-center rounded-full text-[10px] px-2 py-0.5 font-bold ${
            selectedCategoryId === null ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          }`}>
            {products?.length || 0}
          </span>
        </button>
        {categories?.map(c => {
          const count = products?.filter(p => p.categoryId === c.id).length || 0;
          const isActive = selectedCategoryId === c.id;
          return (
            <button 
              key={c.id}
              onClick={() => { setSelectedCategoryId(c.id); setCurrentPage(1); }}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm border ${
                isActive 
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105 z-10" 
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {c.name}
              <span className={`flex items-center justify-center rounded-full text-[10px] px-2 py-0.5 font-bold ${
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <CardTitle className="text-lg font-medium flex-1">Daftar Barang</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama / no lot..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kode/Barcode</TableHead>
                <TableHead>No. Lot / Rak</TableHead>
                <TableHead className="text-right">Harga Utama</TableHead>
                <TableHead className="text-right">Stok (Tambahan)</TableHead>
                <TableHead className="text-right">Stok (Utama)</TableHead>
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
                filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((p) => (
                  <TableRow key={p.id} className={p.isLowStock ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary">{p.categoryName || "-"}</Badge></TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{p.barcode || "-"}</code></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.lotNumber || "-"} {p.rackLocation ? `• ${p.rackLocation}` : ""}</TableCell>
                    <TableCell className="text-right font-medium">{formatRupiah(p.pricePerMeter)}</TableCell>
                    <TableCell className="text-right">{formatNumber(p.rollStock)} {p.secondaryUnit?.toLowerCase()}</TableCell>
                    <TableCell className="text-right">{formatNumber(p.meterStock)} {p.primaryUnit?.toLowerCase()}</TableCell>
                    <TableCell>
                      {p.isLowStock ? (
                        <Badge variant="destructive" className="text-xs">Stok Rendah</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Lihat Roll" onClick={() => openViewRolls(p)}><Package className="h-4 w-4 text-primary" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Hapus barang ini?')) deleteMutation.mutate({ id: p.id }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil((filtered?.length || 0) / 20)} onPageChange={setCurrentPage} />
        </CardContent>
      </Card>

      <Drawer 
        open={isOpen} 
        onOpenChange={(open) => { if (!open) { setIsOpen(false); setEditingId(null); } }}
      >
        <DrawerContent 
          className="max-h-[90vh] mx-auto w-full max-w-4xl px-4 sm:px-6 pb-6 pt-2"
        >
          <DrawerHeader>
            <DrawerTitle>{editingId ? "Edit Barang" : "Tambah Barang"}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
              
              {/* Informasi Dasar */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Informasi Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="md:col-span-2 tour-name">
                      <FormLabel>Nama Barang (Beda Warna = Beda Barang)</FormLabel>
                      <FormControl><Input placeholder="Contoh: Rayon Twill Abu Tua" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem className="tour-category">
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={v => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name} {c.description ? `- ${c.description}` : ''}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="barcode" render={({ field }) => (
                    <FormItem className="tour-barcode">
                      <FormLabel>Kode / Barcode</FormLabel>
                      <FormControl><Input placeholder="Opsional (Otomatis jika kosong)" {...field} /></FormControl>
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
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Satuan & Harga */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Satuan & Harga</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* Kolom Ecer */}
                  <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 tour-ecer">
                    <h4 className="font-medium text-sm text-center mb-2">Eceran (Potongan)</h4>
                    <FormField control={form.control} name="primaryUnit" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Satuan Utama</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Pilih satuan" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {units?.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="costPricePerMeter" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Beli (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerMeter" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Jual (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  {/* Kolom Gulungan */}
                  <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 tour-grosir">
                    <h4 className="font-medium text-sm text-center mb-2">Grosir (Gulungan utuh)</h4>
                    <FormField control={form.control} name="secondaryUnit" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Satuan Tambahan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Pilih satuan" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {units?.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="costPricePerRoll" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Beli (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} placeholder="Opsional" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerRoll" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Jual (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} placeholder="Opsional" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Pengaturan Stok */}
              <div className="space-y-4 tour-stok">
                <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Pengaturan Stok Awal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <FormField control={form.control} name="rollStock" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stok Awal Gulungan (Roll)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" step="any" min={0} 
                          {...field} 
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            field.onChange(val);
                            if (calcPerRoll !== '') {
                              form.setValue('meterStock', parseFloat((val * calcPerRoll).toFixed(3)));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="space-y-2 pt-1">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Isi per Roll (Yard/Meter)</label>
                    <Input 
                      type="number" step="any" min={0}
                      placeholder="Kalkulator..."
                      value={calcPerRoll}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setCalcPerRoll(val);
                        if (val !== '') {
                          const rolls = form.getValues('rollStock') || 0;
                          form.setValue('meterStock', parseFloat((rolls * val).toFixed(3)));
                        }
                      }}
                    />
                  </div>

                  <FormField control={form.control} name="meterStock" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stok Awal Ecer (Yard/Meter)</FormLabel>
                      <FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="minStock" render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Peringatan Min. Stok (Ecer)</FormLabel>
                      <FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

                <DrawerFooter className="px-0 pt-4 flex-row gap-2">
                  <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => { setIsOpen(false); setEditingId(null); }}>Batal</Button>
                  <Button type="submit" className="tour-submit w-full" disabled={form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>Simpan</Button>
                </DrawerFooter>
            </form>
          </Form>
          </div>
        </DrawerContent>
      </Drawer>

      <ProductRollsModal 
        productId={viewRollsId} 
        productName={viewRollsName} 
        isOpen={!!viewRollsId} 
        onClose={() => setViewRollsId(null)} 
      />
    </div>
  );
}

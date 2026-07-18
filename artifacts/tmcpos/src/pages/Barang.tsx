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
import { Plus, Pencil, Trash2, Search, Package, PlusCircle, LayoutGrid, Download, SlidersHorizontal, MoreVertical, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { ProductRollsModal } from "@/components/ProductRollsModal";

const API_BASE = window.location.origin;

const schema = z.object({
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/product-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingImage(false);
    }
  };

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
      const payload = { ...data, imageUrl: imageUrl ?? undefined };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      } else {
        await createMutation.mutateAsync({ data: payload });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openCreate = () => {
    form.reset({ name: "", barcode: "", primaryUnit: "METER", secondaryUnit: "ROLL", lotNumber: "", rackLocation: "", costPricePerMeter: 0, pricePerMeter: 0, minStock: 0, rollStock: 0, meterStock: 0 });
    setEditingId(null);
    setImageUrl(null);
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
    setImageUrl(p.imageUrl || null);
    setIsOpen(true);
  };

  const openViewRolls = (p: any) => {
    setViewRollsId(p.id);
    setViewRollsName(p.name);
  };

  const filtered = selectedCategoryId === null ? [] : products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.lotNumber && p.lotNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesLowStock = !showLowStock || p.isLowStock;
    const matchesCategory = p.categoryId === selectedCategoryId;
    return matchesSearch && matchesLowStock && matchesCategory;
  });

  const lowStockCount = products?.filter(p => p.isLowStock).length ?? 0;

  return (
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Barang</h1>
          <p className="text-sm text-slate-500">Kelola inventaris dan stok</p>
        </div>
        <Button onClick={openCreate} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-200">{lowStockCount} barang memiliki stok rendah</span>
          <Button variant="link" size="sm" className="text-amber-700 p-0 h-auto" onClick={() => setShowLowStock(!showLowStock)}>
            {showLowStock ? "Tampilkan semua" : "Lihat barang stok rendah"}
          </Button>
        </div>
      )}

      {/* Premium Category Grid */}
      <div className="flex flex-wrap gap-2 pb-4 pt-2 mb-4 w-full">
        {categories?.map(c => {
          const count = products?.filter(p => p.categoryId === c.id).length || 0;
          const isActive = selectedCategoryId === c.id;
          return (
            <button 
              key={c.id}
              onClick={() => { setSelectedCategoryId(c.id); setCurrentPage(1); }}
              className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm border ${
                isActive 
                  ? "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20 ring-offset-1" 
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              <span className="text-left leading-snug whitespace-normal">{c.name}</span>
              <span className={`shrink-0 flex items-center justify-center rounded-full text-[10px] px-2 py-0.5 font-bold ${
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari nama barang atau no lot..." 
            className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500" 
            value={search} 
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
          />
        </div>
      </div>

      {/* Activity Feed List */}
      <div className="space-y-4">
        {selectedCategoryId === null ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Pilih Kategori</h3>
            <p className="text-sm text-slate-500 mt-1">Pilih kategori di atas untuk menampilkan barang.</p>
          </div>
        ) : isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada barang</h3>
            <p className="text-sm text-slate-500 mt-1">Belum ada barang pada kategori ini.</p>
          </div>
        ) : (
          <>
            {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3">
                {/* Top Row */}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {p.barcode || "NO BARCODE"}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatRupiah(p.pricePerMeter)}
                  </span>
                </div>

                {/* Main Content */}
                <div className="flex gap-3">
                  <div className={`w-[60px] h-[60px] rounded-2xl shrink-0 flex items-center justify-center border ${p.isLowStock ? 'bg-amber-50 border-amber-100' : 'bg-violet-50 border-violet-100'}`}>
                    <Package className={`w-8 h-8 ${p.isLowStock ? 'text-amber-400' : 'text-violet-300'}`} strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-900 text-[15px] truncate leading-tight">
                      {p.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {p.isLowStock ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 fill-amber-50" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600 fill-green-100" />
                      )}
                      <span className={`text-xs font-medium capitalize ${p.isLowStock ? 'text-amber-600' : 'text-slate-600'}`}>
                        {p.isLowStock ? "Stok Rendah" : "Stok Aman"}
                      </span>
                    </div>
                    
                    <p className="text-[12px] text-slate-400 mt-1 truncate font-medium">
                      Lot/Rak: {p.lotNumber || "-"} {p.rackLocation ? `• ${p.rackLocation}` : ""}
                    </p>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="flex items-start justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => openViewRolls(p)} className="gap-2 cursor-pointer">
                          <Package className="h-4 w-4 text-slate-500" /> Lihat Roll
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(p)} className="gap-2 cursor-pointer">
                          <Pencil className="h-4 w-4 text-slate-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-red-600 focus:text-red-700 cursor-pointer"
                          onClick={() => { if (confirm('Hapus barang ini?')) deleteMutation.mutate({ id: p.id }); }}
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Bottom Bar: Stock Info */}
                <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                    <span className="text-slate-500">Total Stok:</span>
                    <span className="text-slate-700 font-bold">{formatNumber(p.meterStock)} {p.primaryUnit?.toLowerCase()}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-700 font-bold">{formatNumber(p.rollStock)} {p.secondaryUnit?.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {filtered && filtered.length > 20 && (
          <div className="pt-4 flex justify-center pb-8">
            <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

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

                {/* Upload Foto Produk */}
                <div className="flex items-start gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:border-primary/50 transition-colors">
                  <div className="relative flex-shrink-0">
                    {imageUrl ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100">
                        <img 
                          src={imageUrl.startsWith("http") ? imageUrl : (imageUrl.startsWith("/uploads/") ? `${API_BASE}/api${imageUrl}` : `${API_BASE}${imageUrl}`)} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl(null)}
                          className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow text-slate-500 hover:text-red-500"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 rounded-xl bg-slate-100 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors gap-1">
                        {uploadingImage ? (
                          <svg className="w-6 h-6 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        ) : (
                          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">Upload Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">Foto Produk</p>
                    <p className="text-xs text-slate-400 mt-0.5">Akan ditampilkan di katalog online. Format JPG/PNG, max 5MB.</p>
                    {imageUrl && <p className="text-xs text-emerald-600 mt-1 font-medium">✓ Foto berhasil diupload</p>}
                  </div>
                </div>
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
                      <Select onValueChange={(v: string) => field.onChange(parseInt(v))} value={field.value?.toString()}>
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
                        <FormLabel>Harga Beli / Satuan Utama (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerMeter" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Jual / Satuan Utama (Rp)</FormLabel>
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
                        <FormLabel>Harga Beli Grosir / Satuan Utama (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} placeholder="Opsional" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerRoll" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Jual Grosir / Satuan Utama (Rp)</FormLabel>
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

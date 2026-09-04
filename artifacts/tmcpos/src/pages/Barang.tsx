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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  rollLengths: z.array(z.any()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function Barang() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryAlphabetFilter, setCategoryAlphabetFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewRollsId, setViewRollsId] = useState<number | null>(null);
  const [viewRollsName, setViewRollsName] = useState<string>("");
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
      const parsedRollLengths = data.rollLengths?.map(r => {
        if (typeof r === 'string') {
          return parseFloat(r.replace(',', '.')) || 0;
        }
        return r || 0;
      });
      const payload = { ...data, imageUrl: imageUrl ?? undefined, rollLengths: parsedRollLengths };
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
    form.reset({ name: "", barcode: "", primaryUnit: "METER", secondaryUnit: "ROLL", lotNumber: "", rackLocation: "", costPricePerMeter: 0, pricePerMeter: 0, minStock: 0, rollStock: 0, meterStock: 0, rollLengths: [] });
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
    <div className="flex flex-col h-full w-full">
      {/* Static Top Strip */}
      <div className="flex-none space-y-2 pb-2">
        <div className="flex items-center justify-between pt-1 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Barang</h1>
            <p className="text-sm text-slate-500">Kelola inventaris dan stok</p>
          </div>
          <Button onClick={openCreate} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Tambah
          </Button>
        </div>

        {lowStockCount > 0 && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span className="text-sm text-amber-800 flex-1">{lowStockCount} barang memiliki stok rendah</span>
            <Button variant="link" size="sm" className="text-amber-700 p-0 h-auto" onClick={() => setShowLowStock(!showLowStock)}>
              {showLowStock ? "Semua" : "Lihat"}
            </Button>
          </div>
        )}

        {/* Alphabet Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <button onClick={() => setCategoryAlphabetFilter(null)}
            className={`shrink-0 flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-bold transition-colors border ${categoryAlphabetFilter === null ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
            Semua
          </button>
          {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => {
            const has = categories?.some(c => c.name.toUpperCase().startsWith(letter));
            if (!has && categoryAlphabetFilter !== letter) return null;
            return (
              <button key={letter} onClick={() => setCategoryAlphabetFilter(categoryAlphabetFilter === letter ? null : letter)}
                className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all border ${categoryAlphabetFilter === letter ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-500 border-slate-200 hover:bg-violet-50 hover:text-violet-600"}`}>
                {letter}
              </button>
            );
          })}
        </div>

        {/* Category Grid */}
        <div className="flex flex-wrap gap-1.5">
          {categories?.filter(c => !categoryAlphabetFilter || c.name.toUpperCase().startsWith(categoryAlphabetFilter)).map(c => {
            const count = products?.filter(p => p.categoryId === c.id).length || 0;
            const isActive = selectedCategoryId === c.id;
            return (
              <button key={c.id} onClick={() => { setSelectedCategoryId(isActive ? null : c.id); setCurrentPage(1); }}
                className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border ${isActive ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-primary"}`}>
                <span>{c.name}</span>
                <span className={`shrink-0 rounded-full text-[10px] px-1.5 py-0.5 font-bold ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-slate-100 text-slate-500"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Cari nama barang atau no lot..." className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {selectedCategoryId === null ? (
            <div className="text-center py-16"><Package className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Pilih Kategori</h3><p className="text-sm text-slate-500 mt-1">Pilih kategori di atas untuk menampilkan barang.</p></div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-16"><Package className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Tidak ada barang</h3><p className="text-sm text-slate-500 mt-1">Belum ada barang pada kategori ini.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8">#</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Barang</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Barcode / Lot</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Harga Jual</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Stok Meter</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Stok Roll</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((p, idx) => (
                    <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${p.isLowStock ? 'bg-amber-50/20' : ''}`}>
                      <td className="py-2.5 px-3 text-xs text-slate-400 font-mono">{(currentPage - 1) * 20 + idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${p.isLowStock ? 'bg-amber-50 border-amber-100' : 'bg-violet-50 border-violet-100'}`}>
                            <Package className={`w-3.5 h-3.5 ${p.isLowStock ? 'text-amber-400' : 'text-violet-400'}`} strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{p.name}</div>
                            {p.rackLocation && <div className="text-[10px] text-slate-400">Rak: {p.rackLocation}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500 font-mono">{p.barcode || p.lotNumber || <span className="text-slate-300">â€”</span>}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">{formatRupiah(p.pricePerMeter)}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${p.isLowStock ? 'text-amber-600' : 'text-slate-700'}`}>{formatNumber(p.meterStock)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatNumber(p.rollStock)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${p.isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {p.isLowStock ? 'Stok Rendah' : 'Aman'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button title="Lihat Roll" className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors" onClick={() => openViewRolls(p)}><Package className="w-3.5 h-3.5" /></button>
                          <button title="Edit" className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></button>
                          <button title="Hapus" className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors" onClick={() => { if (confirm('Hapus barang ini?')) deleteMutation.mutate({ id: p.id }); }}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Bar */}
      {filtered && filtered.length > 20 && (
        <div className="flex-none border-t border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between rounded-b-2xl shadow-sm">
          <span className="text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}â€“{Math.min(currentPage * 20, filtered.length)} dari {filtered.length} barang</span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      <Drawer 
        open={isOpen} 
        onOpenChange={(open) => { if (!open) { setIsOpen(false); setEditingId(null); } }}
      >
        <DrawerContent className="max-h-[95vh] mx-auto w-full max-w-4xl p-0 overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 px-6 py-4 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {editingId ? "Edit Barang" : "Tambah Barang Baru"}
              </h2>
              <p className="text-violet-200 text-xs">
                {editingId ? "Perbarui informasi produk" : "Masukkan detail produk inventaris"}
              </p>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(95vh - 9rem)' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="divide-y divide-slate-100">
              
              {/* â”€â”€ INFORMASI DASAR â”€â”€ */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block"></span>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500">Informasi Dasar</h3>
                </div>

                {/* Upload Foto */}
                <div className="flex items-center gap-4 p-3.5 bg-gradient-to-r from-slate-50 to-violet-50/30 border border-slate-200 rounded-2xl">
                  <div className="shrink-0">
                    {imageUrl ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                        <img
                          src={imageUrl.startsWith("http") ? imageUrl : (imageUrl.startsWith("/uploads/") ? `${API_BASE}/api${imageUrl}` : `${API_BASE}${imageUrl}`)}
                          alt="Preview" className="w-full h-full object-cover"
                        />
                        <button type="button" onClick={() => setImageUrl(null)}
                          className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white shadow">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <label className="w-16 h-16 rounded-xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors gap-1 group">
                        {uploadingImage ? (
                          <svg className="w-5 h-5 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        ) : (
                          <svg className="w-6 h-6 text-slate-300 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                        <span className="text-[9px] text-slate-400 font-semibold group-hover:text-violet-400">FOTO</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} disabled={uploadingImage} />
                      </label>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Foto Produk <span className="text-slate-400 font-normal">(opsional)</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">Format JPG/PNG, maks 5MB</p>
                    {imageUrl && <p className="text-xs text-emerald-600 mt-1 font-semibold">âœ“ Berhasil diupload</p>}
                  </div>
                </div>

                {/* Nama Barang full-width */}
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-600">Nama Barang <span className="text-slate-400 font-normal">(Beda Warna = Beda Barang)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Rayon Twill Abu Tua" className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Grid 2 kolom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">Kategori <span className="text-red-400">*</span></FormLabel>
                      <Select onValueChange={(v: string) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="h-10 bg-white border-slate-200 rounded-xl"><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="barcode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">Kode / Barcode</FormLabel>
                      <FormControl><Input placeholder="Otomatis jika kosong" className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lotNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">No. Lot</FormLabel>
                      <FormControl><Input placeholder="Opsional" className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rackLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">Lokasi Rak</FormLabel>
                      <FormControl><Input placeholder="Contoh: A-12" className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* â”€â”€ SATUAN & HARGA â”€â”€ */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block"></span>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500">Satuan & Harga</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Eceran */}
                  <div className="bg-gradient-to-b from-violet-50 to-white border border-violet-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-violet-600 text-white px-2 py-0.5 rounded-full">Eceran</span>
                      <span className="text-[10px] text-slate-400">(Per Potongan)</span>
                    </div>
                    <FormField control={form.control} name="primaryUnit" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Satuan Utama</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-9 bg-white border-slate-200 rounded-xl text-sm"><SelectValue placeholder="Pilih satuan" /></SelectTrigger></FormControl>
                          <SelectContent>{units?.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="costPricePerMeter" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Harga Beli (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} className="h-9 bg-white border-slate-200 rounded-xl text-sm" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerMeter" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Harga Jual (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} className="h-9 bg-white border-slate-200 rounded-xl text-sm" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Grosir */}
                  <div className="bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 text-white px-2 py-0.5 rounded-full">Grosir</span>
                      <span className="text-[10px] text-slate-400">(Gulungan Utuh)</span>
                    </div>
                    <FormField control={form.control} name="secondaryUnit" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Satuan Tambahan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-9 bg-white border-slate-200 rounded-xl text-sm"><SelectValue placeholder="Pilih satuan" /></SelectTrigger></FormControl>
                          <SelectContent>{units?.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="costPricePerRoll" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Harga Beli Grosir (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} placeholder="Opsional" className="h-9 bg-white border-slate-200 rounded-xl text-sm" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerRoll" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Harga Jual Grosir (Rp)</FormLabel>
                        <FormControl><Input type="number" step="any" min={0} placeholder="Opsional" className="h-9 bg-white border-slate-200 rounded-xl text-sm" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* â”€â”€ STOK AWAL â”€â”€ */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-5 rounded-full bg-amber-500 inline-block"></span>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500">Pengaturan Stok Awal</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField control={form.control} name="rollStock" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">Jumlah Roll Fisik</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min={0} className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500"
                          {...field}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            field.onChange(val);
                            const currentLengths = form.getValues('rollLengths') || [];
                            const newLengths = Array.from({ length: val }, (_, i) => currentLengths[i] !== undefined ? currentLengths[i] : "");
                            form.setValue('rollLengths', newLengths);
                            const total = newLengths.reduce((a, b) => {
                              const bNum = typeof b === 'string' ? parseFloat(b.replace(',', '.')) : b;
                              return a + (bNum || 0);
                            }, 0);
                            form.setValue('meterStock', parseFloat(total.toFixed(3)));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="meterStock" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">Total Stok Ecer (Yard/Meter)</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" min={0} readOnly
                          className="h-10 bg-violet-50 border-violet-200 rounded-xl font-bold text-violet-700 cursor-not-allowed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="minStock" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">Min. Stok Peringatan</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" min={0} className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-violet-500"
                          {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Roll lengths grid */}
                {(form.watch('rollStock') || 0) > 0 && !editingId && (() => {
                  const currentLengths = form.watch('rollLengths') || [];
                  return (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Detail Panjang Tiap Roll (Yard/Meter)</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {Array.from({ length: form.watch('rollStock') || 0 }).map((_, i) => (
                          <div key={i} className="space-y-1">
                            <label className="text-[10px] font-bold text-amber-600">Roll #{i + 1}</label>
                            <Input
                              type="text" inputMode="decimal" placeholder="0"
                              className="h-8 text-sm text-center bg-white border-amber-200 rounded-lg focus-visible:ring-amber-400"
                              value={currentLengths[i] !== undefined ? currentLengths[i] : ''}
                              onChange={e => {
                                const val = e.target.value;
                                const newLengths = [...(form.getValues('rollLengths') || [])];
                                newLengths[i] = val;
                                form.setValue('rollLengths', newLengths, { shouldValidate: true, shouldDirty: true });
                                const total = newLengths.reduce((a, b) => {
                                  const bNum = typeof b === 'string' ? parseFloat(b.replace(',', '.')) : b;
                                  return a + (bNum || 0);
                                }, 0);
                                form.setValue('meterStock', parseFloat(total.toFixed(3)), { shouldValidate: true, shouldDirty: true });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3 flex gap-3">
                <Button type="button" variant="ghost"
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={() => { setIsOpen(false); setEditingId(null); }}>
                  Batal
                </Button>
                <Button type="submit"
                  className="flex-[2] h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold shadow-sm"
                  disabled={form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
                  {(form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending)
                    ? <><svg className="animate-spin w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Menyimpan...</>
                    : (editingId ? "Simpan Perubahan" : "Tambah Barang")}
                </Button>
              </div>
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


import { useState, useRef } from "react";
import { PaginationControl } from "../components/PaginationControl";
import { useListCategories, useListUnits, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey, getListUnitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Tags, Download, Upload, FileSpreadsheet, X as XIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@workspace/api-client-react";
import { formatRupiah } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional(),
  primaryUnit: z.string().default("METER"),
  secondaryUnit: z.string().default("ROLL"),
  costPricePerMeter: z.number().min(0).default(0),
  pricePerMeter: z.number().min(0).default(0),
  costPricePerRoll: z.number().min(0).optional(),
  pricePerRoll: z.number().min(0).optional(),
});

type FormData = z.infer<typeof schema>;

export default function Kategori() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: categories, isLoading } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const { data: units } = useListUnits({ query: { queryKey: getListUnitsQueryKey() } });
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // ─── Export & Import state ───
  const [isExporting, setIsExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setIsCreateOpen(false);
        toast({ title: "Kategori berhasil ditambahkan" });
      }
    }
  });

  const updateMutation = useUpdateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setEditingCategory(null);
        toast({ title: "Kategori berhasil diperbarui" });
      }
    }
  });

  const deleteMutation = useDeleteCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        toast({ title: "Kategori berhasil dihapus" });
      },
      onError: (error: any) => {
        toast({ title: "Gagal menghapus", description: error.data?.error || "Terjadi kesalahan", variant: "destructive" });
      }
    }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      primaryUnit: "METER",
      secondaryUnit: "ROLL",
      costPricePerMeter: 0,
      pricePerMeter: 0,
      costPricePerRoll: undefined,
      pricePerRoll: undefined,
    }
  });

  const onSubmit = (data: FormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  const openCreate = () => {
    form.reset({
      name: "",
      description: "",
      primaryUnit: "METER",
      secondaryUnit: "ROLL",
      costPricePerMeter: 0,
      pricePerMeter: 0,
      costPricePerRoll: undefined,
      pricePerRoll: undefined,
    });
    setIsCreateOpen(true);
  };

  const openEdit = (cat: Category) => {
    form.reset({
      name: cat.name,
      description: cat.description || "",
      primaryUnit: (cat as any).primaryUnit || "METER",
      secondaryUnit: (cat as any).secondaryUnit || "ROLL",
      costPricePerMeter: (cat as any).costPricePerMeter !== undefined ? Number((cat as any).costPricePerMeter) : 0,
      pricePerMeter: (cat as any).pricePerMeter !== undefined ? Number((cat as any).pricePerMeter) : 0,
      costPricePerRoll: (cat as any).costPricePerRoll !== null && (cat as any).costPricePerRoll !== undefined ? Number((cat as any).costPricePerRoll) : undefined,
      pricePerRoll: (cat as any).pricePerRoll !== null && (cat as any).pricePerRoll !== undefined ? Number((cat as any).pricePerRoll) : undefined,
    });
    setEditingCategory(cat);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/categories/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export gagal");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `Data_Kategori_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      toast({ title: "Export berhasil", description: "File data kategori telah diunduh." });
    } catch (err: any) {
      toast({ title: "Gagal export", description: err.message || "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleStartImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    try {
      const form = new FormData();
      form.append("file", importFile);
      const res = await fetch("/api/categories/import", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import gagal");
      setImportResult(data);
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      toast({
        title: "Import selesai",
        description: `${data.created || 0} baru, ${data.updated || 0} diperbarui.`,
      });
    } catch (err: any) {
      toast({ title: "Gagal import", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const filtered = categories?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full">
      {/* Top Strip */}
      <div className="pb-3 space-y-2.5">
        {/* Row 1: Title + Action buttons */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Kategori</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Kelola kategori barang</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {isExporting ? (
                <span className="h-3.5 w-3.5 sm:mr-1.5 rounded-full border-2 border-slate-600 border-t-transparent animate-spin inline-block" />
              ) : (
                <Download className="h-3.5 w-3.5 sm:mr-1.5" />
              )}
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={() => {
                setImportResult(null);
                setImportFile(null);
                setImportOpen(true);
              }}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Upload className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button onClick={openCreate} size="sm" className="h-8 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold shadow-sm">
              <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
            </Button>
          </div>
        </div>

        {/* Row 2: Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Cari kategori..."
            className="pl-8 h-9 rounded-xl bg-white border-slate-200 text-sm focus-visible:ring-violet-500"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* List Area */}
      <div>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full border-b border-slate-50 last:border-0" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16">
            <Tags className="mx-auto mb-3 h-10 w-10 text-slate-200" strokeWidth={1.5} />
            <h3 className="text-sm font-bold text-slate-500">Tidak ada kategori</h3>
            <p className="text-xs text-slate-400 mt-1">Belum ada kategori yang ditambahkan.</p>
          </div>
        ) : (
          <>
            {/* Mobile: seamless divider list */}
            <div className="md:hidden bg-white rounded-2xl border border-slate-100">
              {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((cat, idx) => {
                const isYard = ((cat as any).primaryUnit || "").toUpperCase() === "YARD";
                return (
                  <div
                    key={cat.id}
                    className={`px-3.5 py-3 flex items-start gap-3 active:bg-slate-50 transition-colors ${idx > 0 ? 'border-t border-slate-50' : ''}`}
                  >
                    <span className="text-[10px] text-slate-300 font-bold w-5 shrink-0 text-center pt-1">{(currentPage - 1) * 20 + idx + 1}</span>
                    <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Tags className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">{cat.name}</span>
                        <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0 ${isYard ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {(cat as any).primaryUnit || "METER"} / {(cat as any).secondaryUnit || "ROLL"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Beli: <strong className="text-slate-700">{formatRupiah(Number((cat as any).costPricePerMeter || 0))}</strong></span>
                        <span>•</span>
                        <span>Jual: <strong className="text-slate-700">{formatRupiah(Number((cat as any).pricePerMeter || 0))}</strong></span>
                      </div>
                      {cat.description && <div className="text-[10px] text-slate-400 truncate">{cat.description}</div>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">{cat.productCount || 0} item</span>
                      <button onClick={() => openEdit(cat)} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center active:scale-95">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if (confirm('Hapus kategori ini?')) deleteMutation.mutate({ id: cat.id }); }} className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center active:scale-95">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-10">#</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Nama Kategori</th>
                      <th className="h-9 px-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-36">Satuan Patokan</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-56">Harga Default (Beli / Jual)</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Deskripsi</th>
                      <th className="h-9 px-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-24">Produk</th>
                      <th className="h-9 px-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((cat, idx) => {
                      const isYard = ((cat as any).primaryUnit || "").toUpperCase() === "YARD";
                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 text-[11px] text-slate-400 font-mono">{(currentPage - 1) * 20 + idx + 1}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center border border-violet-100 shrink-0">
                                <Tags className="w-3.5 h-3.5 text-violet-500" strokeWidth={1.5} />
                              </div>
                              <span className="font-semibold text-slate-800 text-xs">{cat.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${isYard ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {(cat as any).primaryUnit || "METER"} / {(cat as any).secondaryUnit || "ROLL"}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="text-xs space-y-0.5">
                              <div className="flex items-center justify-between text-slate-600 gap-2">
                                <span className="text-[10px] text-slate-400">Beli:</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(Number((cat as any).costPricePerMeter || 0))}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600 gap-2">
                                <span className="text-[10px] text-slate-400">Jual:</span>
                                <span className="font-bold text-violet-700">{formatRupiah(Number((cat as any).pricePerMeter || 0))}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-xs">{cat.description || <span className="text-slate-300">—</span>}</td>
                          <td className="py-2.5 px-4 text-center"><span className="font-bold text-slate-700 text-xs">{cat.productCount || 0}</span></td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1 justify-center">
                              <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center" title="Edit Kategori" onClick={() => openEdit(cat)}><Pencil className="w-3.5 h-3.5" /></button>
                              <button className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center" title="Hapus Kategori" onClick={() => { if (confirm('Hapus kategori ini?')) deleteMutation.mutate({ id: cat.id }); }}><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {filtered && filtered.length > 20 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-2">
          <span className="text-[10px] text-slate-400">
            {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)}
            <span className="text-slate-300 mx-1">/</span>
            {filtered.length}
          </span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Drawer */}
      <Drawer open={isCreateOpen || !!editingCategory} onOpenChange={(open) => {
        if (!open) { setIsCreateOpen(false); setEditingCategory(null); }
      }}>
        <DrawerContent
          className="mx-auto w-full max-w-2xl px-4 sm:px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2"
          style={{ maxHeight: 'calc(95dvh - env(safe-area-inset-top, 0px))' }}
        >
          <DrawerTitle className="sr-only">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DrawerTitle>
          <DrawerDescription className="sr-only">Form kategori dengan pengaturan satuan dan harga default</DrawerDescription>
          <DrawerHeader className="pb-3 px-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <Tags className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-800 leading-tight">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                <p className="text-xs text-slate-400">Atur satuan patokan & harga default agar pengisian barang otomatis</p>
              </div>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 pr-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
                <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Informasi Kategori
                  </h3>
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">Nama Kategori <span className="text-rose-500">*</span></FormLabel>
                      <FormControl><Input placeholder="Contoh: Katun Combed / Rayon Twill" className="bg-white rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-600">Deskripsi / Catatan</FormLabel>
                      <FormControl><Input placeholder="Deskripsi opsional (misal: Bahan rajut/woven)" className="bg-white rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Section Satuan & Harga Patokan */}
                <div className="bg-linear-to-b from-violet-50/50 to-white border border-violet-100 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                      Satuan & Harga Patokan (Otomatis untuk Barang Baru)
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Satuan Utama */}
                    <FormField control={form.control} name="primaryUnit" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Satuan Utama Patokan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white rounded-xl h-9 text-xs">
                              <SelectValue placeholder="Pilih Satuan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="METER">METER</SelectItem>
                            <SelectItem value="YARD">YARD</SelectItem>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="PCS">PCS</SelectItem>
                            {units?.filter(u => !["METER", "YARD", "KG", "PCS"].includes(u.name.toUpperCase())).map(u => (
                              <SelectItem key={u.id} value={u.name.toUpperCase()}>{u.name.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Satuan Roll / Grosir */}
                    <FormField control={form.control} name="secondaryUnit" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Satuan Roll / Grosir</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white rounded-xl h-9 text-xs">
                              <SelectValue placeholder="Pilih Satuan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ROLL">ROLL</SelectItem>
                            <SelectItem value="BAL">BAL</SelectItem>
                            <SelectItem value="DUS">DUS</SelectItem>
                            {units?.filter(u => !["ROLL", "BAL", "DUS"].includes(u.name.toUpperCase())).map(u => (
                              <SelectItem key={u.id} value={u.name.toUpperCase()}>{u.name.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Harga Beli Satuan Utama */}
                    <FormField control={form.control} name="costPricePerMeter" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">
                          Harga Beli Patokan / {form.watch("primaryUnit") || "Satuan"} (Rp)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min={0}
                            placeholder="0"
                            className="bg-white rounded-xl h-9 text-xs"
                            value={field.value ?? 0}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Harga Jual Satuan Utama */}
                    <FormField control={form.control} name="pricePerMeter" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">
                          Harga Jual Patokan / {form.watch("primaryUnit") || "Satuan"} (Rp)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min={0}
                            placeholder="0"
                            className="bg-white rounded-xl h-9 text-xs"
                            value={field.value ?? 0}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Harga Beli Grosir (Roll) - Opsional */}
                    <FormField control={form.control} name="costPricePerRoll" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500">
                          Harga Beli Grosir / Roll (Rp, opsional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min={0}
                            placeholder="Opsional"
                            className="bg-white rounded-xl h-9 text-xs"
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Harga Jual Grosir (Roll) - Opsional */}
                    <FormField control={form.control} name="pricePerRoll" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500">
                          Harga Jual Grosir / Roll (Rp, opsional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min={0}
                            placeholder="Opsional"
                            className="bg-white rounded-xl h-9 text-xs"
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <p className="text-[11px] text-violet-700 bg-white/70 border border-violet-100 rounded-xl p-2.5 leading-relaxed">
                    💡 <em>Saat menambah barang baru dan memilih kategori ini, satuan dan harga di atas otomatis terisi sehingga Anda tidak perlu input berulang-ulang, dan data Excel Export/Import tetap seragam.</em>
                  </p>
                </div>

                <DrawerFooter className="px-0 pt-2 flex-row gap-2">
                  <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => { setIsCreateOpen(false); setEditingCategory(null); }}>Batal</Button>
                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl font-bold" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Kategori"}
                  </Button>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ─── Modal Import Kategori ─────────────────────────────────── */}
      <Dialog
        open={importOpen}
        onOpenChange={(o) => {
          if (!isImporting) {
            setImportOpen(o);
            if (!o) {
              setImportFile(null);
              setImportResult(null);
            }
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileSpreadsheet className="w-5 h-5 text-violet-600" />
              Import Data Kategori dari Excel
            </DialogTitle>
          </DialogHeader>

          {!importResult ? (
            <div className="space-y-4">
              <div className="bg-violet-50/70 border border-violet-100 rounded-xl p-3 text-xs text-violet-900 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5 text-violet-800">
                  📋 Panduan Format Excel:
                </p>
                <p className="text-slate-600">
                  Gunakan file hasil <strong>Export</strong> sebagai template data, atau buat file Excel dengan kolom:
                </p>
                <ul className="list-disc ml-4 space-y-0.5 text-slate-600">
                  <li><strong>Nama Kategori</strong> — wajib diisi</li>
                  <li><strong>Satuan Utama</strong> — METER / YARD / KG (default: METER)</li>
                  <li><strong>Satuan Roll</strong> — ROLL / BAL / DUS (default: ROLL)</li>
                  <li><strong>Harga Beli</strong> & <strong>Harga Jual</strong> — patokan harga beli & jual satuan utama</li>
                  <li><strong>Harga Beli (Roll)</strong> & <strong>Harga Jual (Roll)</strong> — patokan harga grosir roll</li>
                  <li><strong>Deskripsi</strong> — keterangan kategori (opsional)</li>
                </ul>
                <p className="text-[11px] text-violet-700 pt-0.5">
                  💡 <em>Kategori dengan nama yang sudah ada otomatis diperbarui datanya.</em>
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/20 transition-all"
                onClick={() => importFileRef.current?.click()}
              >
                {importFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileSpreadsheet className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{importFile.name}</p>
                      <p className="text-xs text-slate-400">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImportFile(null);
                      }}
                      className="ml-2 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700">Klik untuk memilih file Excel</p>
                    <p className="text-xs text-slate-400 mt-0.5">Mendukung format .xlsx dan .xls (maks. 10MB)</p>
                  </div>
                )}
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setImportFile(f);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setImportOpen(false)}>
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
                  disabled={!importFile || isImporting}
                  onClick={handleStartImport}
                >
                  {isImporting ? (
                    <>
                      <span className="h-3.5 w-3.5 mr-1.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                      Mengimpor...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      Mulai Import
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-emerald-700">{importResult.created ?? 0}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Kategori Baru</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-blue-700">{importResult.updated ?? 0}</p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Diperbarui</p>
                </div>
                <div className={`rounded-xl p-3 text-center border ${importResult.failed > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-2xl font-black ${importResult.failed > 0 ? 'text-rose-700' : 'text-slate-500'}`}>{importResult.failed ?? 0}</p>
                  <p className={`text-[11px] font-semibold mt-0.5 ${importResult.failed > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Gagal / Error</p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1">
                  <p className="text-xs font-bold text-rose-800">Detail Kendala:</p>
                  {importResult.errors.map((err: string, idx: number) => (
                    <p key={idx} className="text-[11px] text-rose-700">{err}</p>
                  ))}
                </div>
              )}

              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
                onClick={() => {
                  setImportOpen(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
              >
                Selesai
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

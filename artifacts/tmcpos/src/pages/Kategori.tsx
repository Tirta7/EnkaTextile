import { useState } from "react";
import { PaginationControl } from "../components/PaginationControl";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, Tags } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@workspace/api-client-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Kategori() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: categories, isLoading } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
    defaultValues: { name: "", description: "" }
  });

  const onSubmit = (data: FormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  const openCreate = () => {
    form.reset({ name: "", description: "" });
    setIsCreateOpen(true);
  };

  const openEdit = (cat: Category) => {
    form.reset({ name: cat.name, description: cat.description || "" });
    setEditingCategory(cat);
  };

  const filtered = categories?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full">
      {/* Top Strip */}
      <div className="pb-3 space-y-2.5">
        {/* Row 1: Title + Tambah */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Kategori</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Kelola kategori barang</p>
          </div>
          <Button onClick={openCreate} size="sm" className="h-8 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
          </Button>
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
              {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((cat, idx) => (
                <div
                  key={cat.id}
                  className={`px-3.5 py-3 flex items-center gap-3 active:bg-slate-50 transition-colors ${idx > 0 ? 'border-t border-slate-50' : ''}`}
                >
                  <span className="text-[10px] text-slate-300 font-bold w-5 shrink-0 text-center">{(currentPage - 1) * 20 + idx + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <Tags className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{cat.description || '—'}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">{cat.productCount || 0} item</span>
                    <button onClick={() => openEdit(cat)} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center active:scale-95">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (confirm('Hapus kategori ini?')) deleteMutation.mutate({ id: cat.id }); }} className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center active:scale-95">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-10">#</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Nama Kategori</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Deskripsi</th>
                      <th className="h-9 px-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-24">Produk</th>
                      <th className="h-9 px-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((cat, idx) => (
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
                        <td className="py-2.5 px-4 text-slate-500 text-xs">{cat.description || <span className="text-slate-300">—</span>}</td>
                        <td className="py-2.5 px-4 text-center"><span className="font-bold text-slate-700 text-xs">{cat.productCount || 0}</span></td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1 justify-center">
                            <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center" onClick={() => openEdit(cat)}><Pencil className="w-3.5 h-3.5" /></button>
                            <button className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center" onClick={() => { if (confirm('Hapus?')) deleteMutation.mutate({ id: cat.id }); }}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
          <DrawerDescription className="sr-only">Form kategori</DrawerDescription>
          <DrawerHeader className="pb-3 px-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <Tags className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-800 leading-tight">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                <p className="text-xs text-slate-400">Kelola data kategori produk</p>
              </div>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nama Kategori</FormLabel><FormControl><Input placeholder="Contoh: Katun" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Input placeholder="Deskripsi opsional" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DrawerFooter className="px-0 pt-4 flex-row gap-2">
                  <Button type="button" variant="outline" className="w-full" onClick={() => { setIsCreateOpen(false); setEditingCategory(null); }}>Batal</Button>
                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

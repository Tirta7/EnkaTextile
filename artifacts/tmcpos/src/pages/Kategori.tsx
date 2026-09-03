import { useState } from "react";
import { PaginationControl } from "../components/PaginationControl";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, Tags, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  const filteredCategories = categories?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Static Top Strip ── */}
      <div className="flex-none space-y-2 pb-2">
        <div className="flex items-center justify-between pt-1 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kategori</h1>
            <p className="text-sm text-slate-500">Kelola kategori barang Anda</p>
          </div>
          <Button onClick={openCreate} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Kategori
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari kategori..."
            className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* ── Scrollable Table ── */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : filteredCategories?.length === 0 ? (
            <div className="text-center py-16">
              <Tags className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
              <h3 className="text-lg font-bold text-slate-700">Tidak ada kategori</h3>
              <p className="text-sm text-slate-500 mt-1">Belum ada kategori yang ditambahkan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8">#</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Kategori</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24">Produk</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories?.slice((currentPage - 1) * 20, currentPage * 20).map((cat, idx) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-xs text-slate-400 font-mono">{(currentPage - 1) * 20 + idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center border border-violet-100 shrink-0">
                            <Tags className="w-3.5 h-3.5 text-violet-500" strokeWidth={1.5} />
                          </div>
                          <span className="font-semibold text-slate-800">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-xs">{cat.description || <span className="text-slate-300">—</span>}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-slate-700">{cat.productCount || 0}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button title="Edit" className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors" onClick={() => openEdit(cat)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button title="Hapus" className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors" onClick={() => { if (confirm('Hapus kategori ini?')) deleteMutation.mutate({ id: cat.id }); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ── Pagination Bar ── */}
      {filteredCategories && filteredCategories.length > 20 && (
        <div className="flex-none border-t border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between rounded-b-2xl shadow-sm">
          <span className="text-xs text-slate-400">
            Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filteredCategories.length)} dari {filteredCategories.length} kategori
          </span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filteredCategories.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      <Drawer open={isCreateOpen || !!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingCategory(null);
        }
      }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader>
            <DrawerTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kategori</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Katun" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Input placeholder="Deskripsi opsional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DrawerFooter className="px-0 pt-4 flex-row gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => { setIsCreateOpen(false); setEditingCategory(null); }}>
                  Batal
                </Button>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  Simpan
                </Button>
              </DrawerFooter>
            </form>
          </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

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
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kategori</h1>
          <p className="text-sm text-slate-500">Kelola kategori barang Anda</p>
        </div>
        <Button onClick={openCreate} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
          <Plus className="mr-2 h-4 w-4" /> Kategori
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari kategori..." 
            className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500" 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
          />
        </div>
      </div>

      {/* Activity Feed List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : filteredCategories?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Tags className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada kategori</h3>
            <p className="text-sm text-slate-500 mt-1">Belum ada kategori yang ditambahkan.</p>
          </div>
        ) : (
          <>
            {filteredCategories?.slice((currentPage - 1) * 20, currentPage * 20).map((cat) => (
              <div key={cat.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex gap-4 items-center group">
                <div className="w-[52px] h-[52px] rounded-2xl shrink-0 bg-violet-50 flex items-center justify-center border border-violet-100">
                  <Tags className="w-6 h-6 text-violet-500" strokeWidth={1.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-[15px] truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-0.5 truncate">
                    {cat.description || "Tidak ada deskripsi"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Barang</span>
                    <span className="text-sm font-bold text-slate-700">{cat.productCount || 0}</span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem onClick={() => openEdit(cat)} className="gap-2 cursor-pointer">
                        <Pencil className="h-4 w-4 text-slate-500" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-red-600 focus:text-red-700 cursor-pointer"
                        onClick={() => { if (confirm('Hapus kategori ini?')) deleteMutation.mutate({ id: cat.id }); }}
                      >
                        <Trash2 className="h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </>
        )}
        {filteredCategories && filteredCategories.length > 20 && (
          <div className="pt-4 flex justify-center pb-8">
            <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filteredCategories.length / 20)} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

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

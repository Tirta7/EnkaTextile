import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, Users, User, MoreVertical, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

export default function Pelanggan() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: customers, isLoading } = useListCustomers({}, { query: { queryKey: getListCustomersQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", address: "", creditLimit: 0 },
  });

  const createMutation = useCreateCustomer({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey({}) }); setIsOpen(false); toast({ title: "Pelanggan berhasil ditambahkan" }); } } });
  const updateMutation = useUpdateCustomer({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey({}) }); setIsOpen(false); setEditingId(null); toast({ title: "Pelanggan berhasil diperbarui" }); } } });
  const deleteMutation = useDeleteCustomer({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey({}) }); toast({ title: "Pelanggan berhasil dihapus" }); }, onError: (error: any) => { toast({ title: "Gagal menghapus", description: error.data?.error || "Terjadi kesalahan", variant: "destructive" }); } } });

  const onSubmit = (data: FormData) => {
    const payload = { ...data, creditLimit: data.creditLimit };
    if (editingId) updateMutation.mutate({ id: editingId, data: payload });
    else createMutation.mutate({ data: payload });
  };

  const openCreate = () => { form.reset({ name: "", phone: "", address: "", creditLimit: 0 }); setEditingId(null); setIsOpen(true); };
  const openEdit = (c: any) => { form.reset({ name: c.name, phone: c.phone || "", address: c.address || "", creditLimit: c.creditLimit }); setEditingId(c.id); setIsOpen(true); };

  const filtered = customers?.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search)));

  return (
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pelanggan</h1>
          <p className="text-sm text-slate-500">Daftar buku tamu dan limit</p>
        </div>
        <Button onClick={openCreate} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari nama atau telepon..." 
            className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500" 
            value={search} 
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
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
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada pelanggan</h3>
            <p className="text-sm text-slate-500 mt-1">Belum ada data pelanggan yang ditambahkan.</p>
          </div>
        ) : (
          <>
            {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((c) => (
              <div key={c.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3">
                {/* Top Row */}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {c.phone || "Tanpa No. HP"}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block mb-0.5">Hutang Saat Ini</span>
                    <span className={`text-sm font-bold ${c.isOverLimit ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatRupiah(c.currentDebt ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-3">
                  <div className={`w-[60px] h-[60px] rounded-2xl shrink-0 flex items-center justify-center border ${c.isOverLimit ? 'bg-red-50 border-red-100' : 'bg-violet-50 border-violet-100'}`}>
                    <User className={`w-8 h-8 ${c.isOverLimit ? 'text-red-400' : 'text-violet-300'}`} strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-900 text-[15px] truncate leading-tight">
                      {c.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {c.isOverLimit ? (
                        <AlertCircle className="w-4 h-4 text-red-500 fill-red-50" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600 fill-green-100" />
                      )}
                      <span className={`text-xs font-medium capitalize ${c.isOverLimit ? 'text-red-600' : 'text-slate-600'}`}>
                        {c.isOverLimit ? "Over Limit Kredit" : "Status Aman"}
                      </span>
                    </div>
                    
                    <p className="text-[12px] text-slate-400 mt-1 truncate font-medium">
                      Limit: {formatRupiah(c.creditLimit)}
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
                        <DropdownMenuItem onClick={() => openEdit(c)} className="gap-2 cursor-pointer">
                          <Pencil className="h-4 w-4 text-slate-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-red-600 focus:text-red-700 cursor-pointer"
                          onClick={() => { if (confirm('Hapus pelanggan ini?')) deleteMutation.mutate({ id: c.id }); }}
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Bottom Bar: Address Info */}
                {c.address && (
                  <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span className="truncate pr-4 flex-1">Alamat: {c.address}</span>
                  </div>
                )}
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

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setEditingId(null); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>{editingId ? "Edit Pelanggan" : "Tambah Pelanggan"}</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nama Pelanggan</FormLabel><FormControl><Input placeholder="Nama lengkap" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Telepon</FormLabel><FormControl><Input placeholder="08xxxxxxxxxx" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Alamat</FormLabel><FormControl><Input placeholder="Alamat lengkap" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="creditLimit" render={({ field }) => (
                <FormItem><FormLabel>Limit Kredit (Rp)</FormLabel><FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <DrawerFooter className="px-0 pt-4 flex-row gap-2">
                <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => { setIsOpen(false); setEditingId(null); }}>Batal</Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
              </DrawerFooter>
            </form>
          </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

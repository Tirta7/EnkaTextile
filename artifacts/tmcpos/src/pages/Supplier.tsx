import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, getListSuppliersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { SupplierDebtDrawer } from "@/components/SupplierDebtDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, Truck, Store, MoreVertical, AlertCircle, CheckCircle2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Supplier() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [viewDebtSupplierId, setViewDebtSupplierId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: suppliers, isLoading } = useListSuppliers({}, { query: { queryKey: getListSuppliersQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", address: "", contactPerson: "" },
  });

  const createMutation = useCreateSupplier({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey({}) }); setIsOpen(false); toast({ title: "Supplier berhasil ditambahkan" }); } } });
  const updateMutation = useUpdateSupplier({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey({}) }); setIsOpen(false); setEditingId(null); toast({ title: "Supplier berhasil diperbarui" }); } } });
  const deleteMutation = useDeleteSupplier({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey({}) }); toast({ title: "Supplier berhasil dihapus" }); }, onError: (error: any) => { toast({ title: "Gagal menghapus", description: error.data?.error || "Terjadi kesalahan", variant: "destructive" }); } } });

  const onSubmit = (data: FormData) => {
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else createMutation.mutate({ data });
  };

  const openCreate = () => { form.reset({ name: "", phone: "", address: "", contactPerson: "" }); setEditingId(null); setIsOpen(true); };
  const openEdit = (s: any) => { form.reset({ name: s.name, phone: s.phone || "", address: s.address || "", contactPerson: s.contactPerson || "" }); setEditingId(s.id); setIsOpen(true); };

  const filtered = suppliers?.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.phone && s.phone.includes(search)));

  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Static Top Strip ── */}
      <div className="flex-none space-y-2 pb-2">
        <div className="flex items-center justify-between pt-1 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Supplier</h1>
            <p className="text-sm text-slate-500">Kelola daftar pemasok</p>
          </div>
          <Button onClick={openCreate} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> Tambah
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Cari nama supplier..." className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      {/* ── Scrollable Table ── */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-16"><Truck className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Tidak ada supplier</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-8">#</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kontak</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Telepon</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alamat</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Hutang</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((s, idx) => {
                    const currentDebt = (s as any).currentDebt ?? 0;
                    const hasDebt = currentDebt > 0;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-xs text-slate-400 font-mono">{(currentPage - 1) * 20 + idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${hasDebt ? 'bg-red-50 border-red-100' : 'bg-violet-50 border-violet-100'}`}>
                              <Store className={`w-3.5 h-3.5 ${hasDebt ? 'text-red-400' : 'text-violet-400'}`} strokeWidth={1.5} />
                            </div>
                            <span className="font-semibold text-slate-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-xs">{(s as any).contactPerson || <span className="text-slate-300">—</span>}</td>
                        <td className="py-2.5 px-3 text-slate-500 text-xs">{s.phone || <span className="text-slate-300">—</span>}</td>
                        <td className="py-2.5 px-3 text-slate-500 text-xs max-w-[140px] truncate">{s.address || <span className="text-slate-300">—</span>}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`text-sm font-bold ${hasDebt ? 'text-red-600 cursor-pointer hover:underline' : 'text-slate-800'}`}
                            onClick={() => { if (hasDebt) setViewDebtSupplierId(s.id); }}
                          >{formatRupiah(currentDebt)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${hasDebt ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            {hasDebt ? 'Ada Hutang' : 'Lunas'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 justify-center">
                            <button title="Edit" className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></button>
                            <button title="Hapus" className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors" onClick={() => { if (confirm('Hapus supplier ini?')) deleteMutation.mutate({ id: s.id }); }}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Pagination Bar ── */}
      {filtered && filtered.length > 20 && (
        <div className="flex-none border-t border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between rounded-b-2xl shadow-sm">
          <span className="text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)} dari {filtered.length} supplier</span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
        </div>
      )}

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setEditingId(null); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>{editingId ? "Edit Supplier" : "Tambah Supplier"}</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nama Supplier</FormLabel><FormControl><Input placeholder="Nama perusahaan/toko" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contactPerson" render={({ field }) => (
                <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="Nama kontak" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Telepon</FormLabel><FormControl><Input placeholder="08xxxxxxxxxx" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Alamat</FormLabel><FormControl><Input placeholder="Alamat lengkap" {...field} /></FormControl><FormMessage /></FormItem>
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

      <SupplierDebtDrawer 
        supplierId={viewDebtSupplierId} 
        supplierName={suppliers?.find(s => s.id === viewDebtSupplierId)?.name || ""}
        isOpen={!!viewDebtSupplierId} 
        onClose={() => setViewDebtSupplierId(null)} 
      />
    </div>
  );
}

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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
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

  const totalPelanggan = customers?.length ?? 0;
  const totalHutang = customers?.reduce((acc, c) => acc + (c.currentDebt ?? 0), 0) ?? 0;
  const overLimitCount = customers?.filter(c => c.isOverLimit).length ?? 0;

  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Static Top Strip ── */}
      {/* ── Static Top Strip ── */}
      <div className="flex-none space-y-3 pb-3 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">Pelanggan</h1>
            <p className="text-xs font-medium text-slate-500 mt-1">Kelola daftar pelanggan dan batas kredit</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input 
                placeholder="Cari nama atau telepon..." 
                className="pl-7 w-48 h-8 rounded-lg border-slate-200 bg-slate-50 text-xs focus-visible:ring-violet-500"
                value={search} 
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
              />
            </div>
            
            <Button onClick={openCreate} className="h-8 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-bold shadow-sm">
              <Plus className="mr-1.5 h-3 w-3" /> Tambah
            </Button>
          </div>
        </div>

        {/* Rekap Summary (Ultra Compact Strip) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white border border-slate-100 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                <Users className="w-3 h-3" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Total Pelanggan</span>
                <span className="text-xs font-black text-slate-900 leading-tight">{totalPelanggan} Orang</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 flex flex-col justify-center">
              <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-wider">Tagihan Berjalan</span>
              <span className="text-xs font-black text-blue-700 leading-tight">{formatRupiah(totalHutang)}</span>
            </div>
            <div className={`border rounded-lg px-3 py-1.5 flex flex-col justify-center ${overLimitCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
              <span className={`text-[9px] font-semibold uppercase tracking-wider ${overLimitCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>Over Limit</span>
              <span className={`text-xs font-black leading-tight ${overLimitCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>{overLimitCount} Orang</span>
            </div>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-auto min-h-0 pb-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-16"><Users className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Tidak ada pelanggan</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="h-8 px-4 text-left align-middle font-semibold text-slate-600 text-[11px] whitespace-nowrap border-b border-slate-100 w-10">#</th>
                    <th className="h-8 px-4 text-left align-middle font-semibold text-slate-600 text-[11px] whitespace-nowrap border-b border-slate-100">Pelanggan</th>
                    <th className="h-8 px-4 text-left align-middle font-semibold text-slate-600 text-[11px] whitespace-nowrap border-b border-slate-100">Kontak</th>
                    <th className="h-8 px-4 text-right align-middle font-semibold text-slate-600 text-[11px] whitespace-nowrap border-b border-slate-100">Limit Kredit</th>
                    <th className="h-8 px-4 text-right align-middle font-semibold text-slate-600 text-[11px] whitespace-nowrap border-b border-slate-100">Tagihan Berjalan</th>
                    <th className="h-8 px-4 text-center align-middle font-semibold text-slate-600 text-[11px] whitespace-nowrap border-b border-slate-100">Status</th>
                    <th className="h-8 px-4 text-center align-middle font-semibold text-slate-600 text-[11px] whitespace-nowrap border-b border-slate-100">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((c, idx) => {
                    const badgeClass = c.isOverLimit ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-2 px-4 border-b border-slate-50 align-middle text-[11px] text-slate-400 font-medium whitespace-nowrap">{(currentPage - 1) * 20 + idx + 1}</td>
                        <td className="py-2 px-4 border-b border-slate-50 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${c.isOverLimit ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-[12px]">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[150px]">{c.address || "-"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b border-slate-50 align-middle whitespace-nowrap">
                          <span className="font-semibold text-slate-600 text-[11px]">{c.phone || "-"}</span>
                        </td>
                        <td className="py-2 px-4 border-b border-slate-50 align-middle whitespace-nowrap text-right">
                          <span className="font-semibold text-slate-600 text-xs">{formatRupiah(c.creditLimit)}</span>
                        </td>
                        <td className="py-2 px-4 border-b border-slate-50 align-middle whitespace-nowrap text-right">
                          <span className={`font-bold text-xs ${(c.currentDebt ?? 0) > 0 ? (c.isOverLimit ? 'text-rose-600' : 'text-amber-600') : 'text-slate-400'}`}>
                            {(c.currentDebt ?? 0) > 0 ? formatRupiah(c.currentDebt ?? 0) : 'Rp 0'}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-slate-50 align-middle whitespace-nowrap text-center">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${badgeClass}`}>
                            {c.isOverLimit ? 'Over Limit' : 'Aman'}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-slate-50 align-middle whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md" onClick={() => openEdit(c)} title="Edit Profil">
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md" onClick={() => { if (confirm('Hapus pelanggan ini?')) deleteMutation.mutate({ id: c.id }); }} title="Hapus Pelanggan">
                              <Trash2 className="h-3 w-3" />
                            </Button>
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

      {/* Pagination Bar */}
      {filtered && filtered.length > 20 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-slate-200/60 rounded-full px-3 py-0.5 flex items-center justify-center gap-3 pointer-events-auto">
            <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
              {filtered.length} pelanggan
            </span>
            <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
          </div>
        </div>
      )}


      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setEditingId(null); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl p-0 overflow-hidden">
          <DrawerTitle className="sr-only">{editingId ? "Edit Pelanggan" : "Tambah Pelanggan"}</DrawerTitle>
          <DrawerDescription className="sr-only">Form for adding or editing a customer</DrawerDescription>
          
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 px-6 py-4 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Users className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {editingId ? "Edit Pelanggan" : "Tambah Pelanggan"}
              </h2>
              <p className="text-violet-200 text-xs">Isi formulir di bawah untuk menyimpan data pelanggan</p>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-6">
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

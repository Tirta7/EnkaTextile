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
      <div className="flex-none space-y-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pelanggan</h1>
            <p className="text-[13px] font-medium text-slate-500 mt-0.5">Kelola daftar pelanggan dan batas kredit</p>
          </div>
        </div>

        {/* Premium Summary Card (iOS Wallet Style) - Compact Version */}
        <div className="bg-slate-900 rounded-[20px] p-4 text-white shadow-lg shadow-slate-900/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500 rounded-full blur-[50px] opacity-20 -mr-8 -mt-8 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-[40px] opacity-20 -ml-6 -mb-6 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col">
             <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-0.5">Total Tagihan Pelanggan</span>
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{formatRupiah(totalHutang)}</h2>
           </div>
           
           <div className="relative z-10 grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
             <div>
               <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest block mb-0.5">Total Pelanggan</span>
               <span className="text-xs font-semibold text-white">{totalPelanggan} Orang</span>
             </div>
             <div>
               <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest block mb-0.5">Over Limit</span>
               <div className="flex items-center gap-1.5">
                 {overLimitCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>}
                 <span className={`text-xs font-semibold ${overLimitCount > 0 ? "text-rose-400" : "text-white"}`}>{overLimitCount} Orang</span>
               </div>
             </div>
           </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari nama atau telepon..." className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button onClick={openCreate} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700 shrink-0 h-10 px-5">
            <Plus className="mr-1.5 h-4 w-4" /> Tambah
          </Button>
        </div>
      </div>

      {/* ── Scrollable List (iOS Style Cards) ── */}
      <div className="flex-1 overflow-auto min-h-0 pb-4">
        {isLoading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
        ) : filtered?.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 text-center py-20 shadow-sm"><Users className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} /><h3 className="text-lg font-bold text-slate-700">Tidak ada pelanggan</h3></div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((c, idx) => {
              const badgeClass = c.isOverLimit ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100';
              
              return (
                <div key={c.id} className={`bg-white rounded-[20px] p-4 sm:p-5 border shadow-sm transition-all flex flex-col gap-4 ${c.isOverLimit ? 'border-rose-200 shadow-rose-100/50' : 'border-slate-100 shadow-slate-200/40'}`}>
                  {/* Top Section: Header */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center border shrink-0 ${c.isOverLimit ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200'}`}>
                        <User className={`w-5 h-5 ${c.isOverLimit ? 'text-rose-400' : 'text-slate-400'}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-slate-800 text-[15px] sm:text-base leading-tight">{c.name}</h3>
                        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-0.5">{c.phone || "Tidak ada no. telp"}</p>
                      </div>
                    </div>
                    <div className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0 ${badgeClass}`}>
                      {c.isOverLimit ? 'Over Limit' : 'Aman'}
                    </div>
                  </div>
                  
                  {/* Middle Section: Amounts */}
                  <div className="flex items-center justify-between bg-slate-50/50 rounded-xl p-3 border border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Limit Kredit</span>
                      <span className="font-bold text-slate-800 text-sm sm:text-[15px]">{formatRupiah(c.creditLimit)}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 mx-2"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Tagihan Berjalan</span>
                      <span className={`font-bold text-sm sm:text-[15px] ${(c.currentDebt ?? 0) > 0 ? (c.isOverLimit ? 'text-rose-600' : 'text-amber-600') : 'text-slate-400'}`}>
                        {(c.currentDebt ?? 0) > 0 ? formatRupiah(c.currentDebt ?? 0) : 'Rp 0'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <button className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold flex justify-center items-center gap-1.5 transition-colors" onClick={() => openEdit(c)}>
                      <Pencil className="w-4 h-4"/> Edit Profil
                    </button>
                    <button className="flex-none w-12 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 text-[12px] font-bold flex justify-center items-center gap-1.5 transition-colors" onClick={() => { if (confirm('Hapus pelanggan ini?')) deleteMutation.mutate({ id: c.id }); }}>
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination Bar ── */}
      {filtered && filtered.length > 20 && (
        <div className="flex-none border-t border-slate-200 bg-white px-3 sm:px-4 py-1 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between rounded-b-2xl shadow-sm gap-1 sm:gap-0">
          <span className="text-[10px] sm:text-xs text-slate-400">Menampilkan {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)} dari {filtered.length} pelanggan</span>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filtered.length / 20)} onPageChange={setCurrentPage} />
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

import { useState } from "react";
import { PaginationControl } from "../components/PaginationControl";
import { useListSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, getListSuppliersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { SupplierDebtDrawer } from "@/components/SupplierDebtDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, Truck, Store, MoreVertical, Receipt } from "lucide-react";
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

  const totalHutang = suppliers?.reduce((acc, s) => acc + ((s as any).currentDebt ?? 0), 0) ?? 0;
  const hutangCount = suppliers?.filter(s => ((s as any).currentDebt ?? 0) > 0).length ?? 0;

  return (
    <div className="w-full">
      {/* Top Strip */}
      <div className="pb-3 space-y-2.5">
        {/* Row 1: Title + Tambah */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Supplier</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Kelola daftar pemasok</p>
          </div>
          <Button onClick={openCreate} size="sm" className="h-8 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
          </Button>
        </div>

        {/* Row 2: Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Cari nama supplier..."
            className="pl-8 h-9 rounded-xl bg-white border-slate-200 text-sm focus-visible:ring-violet-500"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Row 3: Summary */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-white border border-slate-100 rounded-xl px-2.5 py-2 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Supplier</p>
              <p className="text-xs font-black text-slate-800 leading-tight">{suppliers?.length ?? 0}</p>
            </div>
          </div>
          <div className={`border rounded-xl px-2.5 py-2 ${hutangCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-[8px] font-bold uppercase tracking-wider ${hutangCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>Ada Hutang</p>
            <p className={`text-xs font-black leading-tight ${hutangCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>{hutangCount} supplier</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl px-2.5 py-2">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total Hutang</p>
            <p className="text-xs font-black text-slate-800 leading-tight truncate">{formatRupiah(totalHutang)}</p>
          </div>
        </div>
      </div>

      {/* List Area */}
      <div>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-100">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[60px] w-full border-b border-slate-50 last:border-0" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="mx-auto mb-3 h-10 w-10 text-slate-200" strokeWidth={1.5} />
            <h3 className="text-sm font-bold text-slate-500">Tidak ada supplier</h3>
          </div>
        ) : (
          <>
            {/* Mobile: seamless list */}
            <div className="md:hidden bg-white rounded-2xl border border-slate-100">
              {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((s, idx) => {
                const currentDebt = (s as any).currentDebt ?? 0;
                const hasDebt = currentDebt > 0;
                return (
                  <div key={s.id} className={`px-3.5 py-3 flex items-center gap-3 active:bg-slate-50 transition-colors ${idx > 0 ? 'border-t border-slate-50' : ''}`}>
                    <span className="text-[10px] text-slate-300 font-bold w-5 shrink-0 text-center">{(currentPage - 1) * 20 + idx + 1}</span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${hasDebt ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-violet-50 border-violet-100 text-violet-400'}`}>
                      <Store className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm leading-tight truncate">{s.name}</span>
                        {hasDebt && <span className="shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 uppercase">Hutang</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400">{s.phone || '—'}</span>
                        {hasDebt && (
                          <>
                            <span className="text-[10px] text-slate-200">·</span>
                            <span className="text-[10px] font-bold text-rose-600">{formatRupiah(currentDebt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setViewDebtSupplierId(s.id)} className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center active:scale-95">
                        <Receipt className="h-4 w-4" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center active:scale-95">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => openEdit(s)} className="text-sm gap-2"><Pencil className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { if (confirm('Hapus supplier ini?')) deleteMutation.mutate({ id: s.id }); }} className="text-sm gap-2 text-rose-600 focus:text-rose-600"><Trash2 className="h-3.5 w-3.5" /> Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Nama</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Kontak</th>
                      <th className="h-9 px-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Telepon</th>
                      <th className="h-9 px-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Total Hutang</th>
                      <th className="h-9 px-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                      <th className="h-9 px-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((s, idx) => {
                      const currentDebt = (s as any).currentDebt ?? 0;
                      const hasDebt = currentDebt > 0;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 text-[11px] text-slate-400">{(currentPage - 1) * 20 + idx + 1}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${hasDebt ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-violet-50 border-violet-100 text-violet-400'}`}>
                                <Store className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </div>
                              <span className="font-semibold text-slate-800 text-xs">{s.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-slate-500">{(s as any).contactPerson || '—'}</td>
                          <td className="py-2.5 px-4 text-xs text-slate-500">{s.phone || '—'}</td>
                          <td className="py-2.5 px-4 text-right"><span className={`text-xs font-bold ${hasDebt ? 'text-rose-600' : 'text-slate-400'}`}>{formatRupiah(currentDebt)}</span></td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${hasDebt ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                              {hasDebt ? 'Ada Hutang' : 'Lunas'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1 justify-center">
                              <button className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center" onClick={() => setViewDebtSupplierId(s.id)}><Receipt className="w-3.5 h-3.5" /></button>
                              <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></button>
                              <button className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center" onClick={() => { if (confirm('Hapus supplier ini?')) deleteMutation.mutate({ id: s.id }); }}><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* Drawer Form */}
      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setEditingId(null); } }}>
        <DrawerContent
          className="mx-auto w-full max-w-2xl px-4 sm:px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2"
          style={{ maxHeight: 'calc(95dvh - env(safe-area-inset-top, 0px))' }}
        >
          <DrawerTitle className="sr-only">{editingId ? "Edit Supplier" : "Tambah Supplier"}</DrawerTitle>
          <DrawerDescription className="sr-only">Form supplier</DrawerDescription>
          <DrawerHeader className="pb-3 px-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-800 leading-tight">{editingId ? "Edit Supplier" : "Tambah Supplier"}</h2>
                <p className="text-xs text-slate-400">Kelola data mitra penyuplai</p>
              </div>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1">
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
                  <Button type="button" variant="outline" className="w-full" onClick={() => { setIsOpen(false); setEditingId(null); }}>Batal</Button>
                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
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

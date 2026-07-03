import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListMutations, useCreateMutation, useListProducts, getListMutationsQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ArrowLeftRight, ArrowUpFromLine, ArrowDownToLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate, formatNumber } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

const schema = z.object({
  productId: z.number({ required_error: "Barang wajib dipilih" }),
  type: z.enum(["in", "out", "adjustment"]),
  rolls: z.number().min(0),
  meters: z.number().min(0),
  description: z.string().optional(),
  reference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  in: { label: "Masuk", color: "bg-green-100 text-green-700 border-green-200", icon: ArrowDownToLine },
  out: { label: "Keluar", color: "bg-red-100 text-red-700 border-red-200", icon: ArrowUpFromLine },
  adjustment: { label: "Penyesuaian", color: "bg-blue-100 text-blue-700 border-blue-200", icon: ArrowLeftRight },
};

export default function Mutasi() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: mutations, isLoading } = useListMutations({}, { query: { queryKey: getListMutationsQueryKey({}) } });
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "in", rolls: 0, meters: 0, description: "", reference: "" },
  });

  const selectedProductId = form.watch("productId");
  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const primaryUnit = selectedProduct?.primaryUnit || "Meter";
  const secondaryUnit = selectedProduct?.secondaryUnit || "Roll";

  const createMutation = useCreateMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMutationsQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) });
        setIsOpen(false);
        form.reset({ type: "in", rolls: 0, meters: 0, description: "", reference: "" });
        toast({ title: "Mutasi stok berhasil dicatat" });
      }
    }
  });

  const onSubmit = (data: FormData) => createMutation.mutate({ data: { ...data, description: data.description || "", reference: data.reference || "" } });

  const filtered = filterByDateRange(
    mutations?.filter(m => {
      const q = search.toLowerCase();
      return (m as any).productName?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
    }) ?? [],
    dateFrom,
    dateTo,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mutasi Stok"
        description="Catat pergerakan stok barang."
        actions={<Button onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" /> Catat Mutasi</Button>}
      />

      <Card>
        <CardHeader className="py-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CardTitle className="text-lg font-medium flex-1">Riwayat Mutasi</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari barang..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); }} />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Stok Tambahan</TableHead>
                <TableHead className="text-right">Stok Utama</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Referensi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <TableRow key={i}>{Array(7).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>)
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <ArrowLeftRight className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Belum ada mutasi stok
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.slice((currentPage - 1) * 20, currentPage * 20).map((m) => {
                  const cfg = TYPE_CONFIG[m.type ?? "in"];
                  const Icon = cfg?.icon ?? ArrowLeftRight;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground">{formatDate(m.createdAt)}</TableCell>
                      <TableCell className="font-medium">{(m as any).productName || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium ${cfg?.color}`}>
                          <Icon size={12} />{cfg?.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(m.rolls)}</TableCell>
                      <TableCell className="text-right">{formatNumber(m.meters)}</TableCell>
                      <TableCell className="text-muted-foreground">{m.description || "-"}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{m.reference || "-"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <PaginationControl currentPage={currentPage} totalPages={Math.ceil((filtered?.length || 0) / 20)} onPageChange={setCurrentPage} />
        </CardContent>
      </Card>

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) setIsOpen(false); }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Catat Mutasi Stok</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField control={form.control} name="productId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Barang</FormLabel>
                  <Select onValueChange={v => field.onChange(parseInt(v))} value={field.value?.toString()}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih barang" /></SelectTrigger></FormControl>
                    <SelectContent>{products?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Mutasi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="in">Stok Masuk</SelectItem>
                      <SelectItem value="out">Stok Keluar</SelectItem>
                      <SelectItem value="adjustment">Penyesuaian</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="rolls" render={({ field }) => (
                  <FormItem><FormLabel>Qty ({secondaryUnit.toLowerCase()})</FormLabel><FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="meters" render={({ field }) => (
                  <FormItem><FormLabel>Qty ({primaryUnit.toLowerCase()})</FormLabel><FormControl><Input type="number" step="any" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Input placeholder="Alasan mutasi" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem><FormLabel>Referensi (Opsional)</FormLabel><FormControl><Input placeholder="No. dokumen" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DrawerFooter className="px-0 pt-4 flex-row gap-2">
                <Button type="button" variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>Simpan</Button>
              </DrawerFooter>
            </form>
          </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

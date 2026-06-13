import { useState } from "react";
import { useListMutations, useCreateMutation, useListProducts, getListMutationsQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ArrowLeftRight, ArrowUpFromLine, ArrowDownToLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate, formatNumber } from "@/lib/utils";

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
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: mutations, isLoading } = useListMutations({}, { query: { queryKey: getListMutationsQueryKey({}) } });
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "in", rolls: 0, meters: 0, description: "", reference: "" },
  });

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

  const onSubmit = (data: FormData) => createMutation.mutate({ data });

  const filtered = mutations?.filter(m => {
    const q = search.toLowerCase();
    return (m as any).productName?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mutasi Stok</h1>
          <p className="text-muted-foreground mt-1">Catat pergerakan stok barang.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" /> Catat Mutasi</Button>
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <CardTitle className="text-lg font-medium flex-1">Riwayat Mutasi</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari barang..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Roll</TableHead>
                <TableHead className="text-right">Meter</TableHead>
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
                filtered?.map((m) => {
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
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setIsOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Catat Mutasi Stok</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="rolls" render={({ field }) => (
                  <FormItem><FormLabel>Roll</FormLabel><FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="meters" render={({ field }) => (
                  <FormItem><FormLabel>Meter</FormLabel><FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Input placeholder="Alasan mutasi" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem><FormLabel>Referensi (Opsional)</FormLabel><FormControl><Input placeholder="No. dokumen" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending}>Simpan</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

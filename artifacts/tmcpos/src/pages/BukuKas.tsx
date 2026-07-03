import { useState } from "react";
import { useListCashEntries, useGetCashBalance, useCreateCashEntry, getListCashEntriesQueryKey, getGetCashBalanceQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, BookOpen, ArrowUpFromLine, ArrowDownToLine, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(1, "Jumlah harus lebih dari 0"),
  description: z.string().min(1, "Keterangan wajib diisi"),
  reference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BukuKas() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: entries, isLoading } = useListCashEntries({}, { query: { queryKey: getListCashEntriesQueryKey({}) } });
  const { data: balance } = useGetCashBalance({ query: { queryKey: getGetCashBalanceQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "income", amount: 0, description: "", reference: "" },
  });

  const createMutation = useCreateCashEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCashEntriesQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getGetCashBalanceQueryKey() });
        setIsOpen(false);
        form.reset({ type: "income", amount: 0, description: "", reference: "" });
        toast({ title: "Entri kas berhasil ditambahkan" });
      }
    }
  });

  const onSubmit = (data: FormData) => createMutation.mutate({ data });

  const filteredBase = entries?.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || e.type === filterType;
    return matchSearch && matchType;
  });
  const filtered = filterByDateRange(filteredBase ?? [], dateFrom, dateTo);

  const totalIn = entries?.filter(e => e.type === "income").reduce((sum, e) => sum + (e as any).amount, 0) ?? 0;
  const totalOut = entries?.filter(e => e.type === "expense").reduce((sum, e) => sum + (e as any).amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buku Kas</h1>
          <p className="text-muted-foreground mt-1">Catat pemasukan dan pengeluaran kas.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" /> Catat Transaksi</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><TrendingUp size={16} /> Saldo Kas</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{formatRupiah((balance as any)?.balance ?? 0)}</div></CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2"><ArrowDownToLine size={16} /> Total Pemasukan</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatRupiah(totalIn)}</div></CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2"><ArrowUpFromLine size={16} /> Total Pengeluaran</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-700 dark:text-red-400">{formatRupiah(totalOut)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CardTitle className="text-lg font-medium flex-1">Riwayat Transaksi</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari keterangan..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); }} />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <TableRow key={i}>{Array(5).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>)
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Belum ada transaksi kas
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-muted-foreground">{formatDate(e.createdAt)}</TableCell>
                    <TableCell className="font-medium">{e.description}</TableCell>
                    <TableCell className="text-muted-foreground">{(e as any).reference || "-"}</TableCell>
                    <TableCell>
                      {e.type === "income" ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 font-medium">
                          <ArrowDownToLine size={12} /> Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">
                          <ArrowUpFromLine size={12} /> Pengeluaran
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${e.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {e.type === "income" ? "+" : "-"}{formatRupiah((e as any).amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) setIsOpen(false); }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Catat Transaksi Kas</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Transaksi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl><Input placeholder="Deskripsi transaksi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Referensi (Opsional)</FormLabel>
                  <FormControl><Input placeholder="Contoh: No. faktur, No. kwitansi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DrawerFooter className="px-0 pt-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>Simpan</Button>
              </DrawerFooter>
            </form>
          </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

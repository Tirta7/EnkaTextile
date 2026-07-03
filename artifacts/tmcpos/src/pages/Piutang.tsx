import { useState } from "react";
import { useListReceivables, useAddReceivablePayment, getListReceivablesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wallet, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DateRangeFilter, filterByDateRange } from "@/components/DateRangeFilter";

const STATUS_COLORS: Record<string, string> = {
  lunas: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  belum_bayar: "bg-red-100 text-red-700 border-red-200",
};

export default function Piutang() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("tunai");
  const [payNotes, setPayNotes] = useState("");

  const { data: receivables, isLoading } = useListReceivables({}, { query: { queryKey: getListReceivablesQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const payMutation = useAddReceivablePayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReceivablesQueryKey({}) });
        setIsOpen(false);
        setSelectedId(null);
        setPayAmount("");
        toast({ title: "Pembayaran berhasil dicatat" });
      }
    }
  });

  const openPayment = (id: number) => { setSelectedId(id); setIsOpen(true); };
  const selectedRec = receivables?.find(r => r.id === selectedId);

  const handlePay = () => {
    if (!selectedId || !payAmount) return;
    payMutation.mutate({ id: selectedId, data: { amount: parseFloat(payAmount), paymentMethod: payMethod as any, notes: payNotes || undefined } });
  };

  const filtered = filterByDateRange(
    receivables?.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = (r as any).customerName?.toLowerCase().includes(q) || (r as any).invoiceNumber?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchSearch && matchStatus;
    }) ?? [],
    dateFrom,
    dateTo,
  );

  const totalPiutang = receivables?.filter(r => r.status !== "lunas").reduce((sum, r) => sum + ((r as any).remainingAmount ?? 0), 0) ?? 0;
  const overdueCount = receivables?.filter(r => (r as any).isOverdue).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Piutang</h1>
        <p className="text-muted-foreground mt-1">Kelola tagihan dan pembayaran piutang pelanggan.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Piutang Aktif</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{formatRupiah(totalPiutang)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Invoice Aktif</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{receivables?.filter(r => r.status !== "lunas").length ?? 0}</div></CardContent>
        </Card>
        <Card className={overdueCount > 0 ? "bg-destructive/10 border-destructive/30" : ""}>
          <CardHeader className="pb-2"><CardTitle className={`text-sm font-medium ${overdueCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>Jatuh Tempo</CardTitle></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${overdueCount > 0 ? "text-destructive" : ""}`}>{overdueCount} Invoice</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CardTitle className="text-lg font-medium flex-1">Daftar Piutang</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                  <SelectItem value="partial">Sebagian</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari pelanggan / invoice..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to); }} />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tgl. Transaksi</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <TableRow key={i}>{Array(8).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>)
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Wallet className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Tidak ada piutang
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((r) => {
                  const pct = (r as any).totalAmount > 0 ? Math.round(((r as any).paidAmount / (r as any).totalAmount) * 100) : 0;
                  return (
                    <TableRow key={r.id} className={(r as any).isOverdue && r.status !== "lunas" ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
                      <TableCell className="font-mono text-sm">{(r as any).invoiceNumber || `#${r.id}`}</TableCell>
                      <TableCell className="font-medium">{(r as any).customerName || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                      <TableCell className={`text-sm ${(r as any).isOverdue && r.status !== "lunas" ? "text-destructive font-medium" : "text-muted-foreground"}`}>{formatDate((r as any).dueDate)}</TableCell>
                      <TableCell className="text-right font-medium">{formatRupiah((r as any).totalAmount)}</TableCell>
                      <TableCell className="w-[120px]">
                        <div className="space-y-1">
                          <Progress value={pct} className="h-2" />
                          <div className="text-xs text-muted-foreground">{pct}% ({formatRupiah((r as any).paidAmount)})</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[r.status ?? "belum_bayar"] || "bg-gray-100 text-gray-700"}`}>{r.status?.replace("_", " ")}</span>
                      </TableCell>
                      <TableCell>
                        {r.status !== "lunas" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openPayment(r.id)}>
                            <Plus className="mr-1 h-3 w-3" /> Bayar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); setSelectedId(null); } }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader><DrawerTitle>Catat Pembayaran Piutang</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          {selectedRec && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Pelanggan:</span><span className="font-medium">{(selectedRec as any).customerName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sisa Piutang:</span><span className="font-bold text-primary">{formatRupiah((selectedRec as any).remainingAmount)}</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Jumlah Bayar (Rp)</label>
                <Input type="number" min={0} max={(selectedRec as any).remainingAmount} placeholder="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Metode Pembayaran</label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="cashless">Cashless/QRIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Catatan</label>
                <Input placeholder="Catatan opsional" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
              </div>
            </div>
          )}
          </div>
          <DrawerFooter className="px-0 pt-4">
            <Button type="button" variant="outline" className="w-full" onClick={() => { setIsOpen(false); setSelectedId(null); }}>Batal</Button>
            <Button className="w-full" onClick={handlePay} disabled={!payAmount || payMutation.isPending}>Simpan Pembayaran</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

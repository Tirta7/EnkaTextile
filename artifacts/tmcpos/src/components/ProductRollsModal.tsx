import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  useGetProductRolls, 
  useCreateProductRoll, 
  useUpdateProductRoll, 
  useDeleteProductRoll,
  getGetProductRollsQueryKey,
  getListProductsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageX, Pencil, Trash2, Plus, Check, X, ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface ProductRollsModalProps {
  productId: number | null;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

type Roll = {
  id: number;
  barcode: string;
  originalLength: number;
  currentLength: number;
  status: string;
  createdAt: string;
};

export function ProductRollsModal({ productId, productName, isOpen, onClose }: ProductRollsModalProps) {
  const queryClient = useQueryClient();
  const { data: rolls, isLoading } = useGetProductRolls(productId ?? 0, {
    query: {
      queryKey: getGetProductRollsQueryKey(productId ?? 0),
      enabled: !!productId && isOpen,
    }
  });

  const createMutation = useCreateProductRoll({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductRollsQueryKey(productId ?? 0) });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setIsAdding(false);
        setNewBarcode("");
        setNewLength("");
      }
    }
  });

  const updateMutation = useUpdateProductRoll({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductRollsQueryKey(productId ?? 0) });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setEditingRollId(null);
      }
    }
  });

  const deleteMutation = useDeleteProductRoll({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductRollsQueryKey(productId ?? 0) });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      }
    }
  });

  // State for inline editing (via detail panel)
  const [editingRollId, setEditingRollId] = useState<number | null>(null);
  const [editOriginalLength, setEditOriginalLength] = useState<string>("");
  const [editCurrentLength, setEditCurrentLength] = useState<string>("");

  // State for adding new
  const [isAdding, setIsAdding] = useState(false);
  const [newBarcode, setNewBarcode] = useState("");
  const [newLength, setNewLength] = useState("");

  // State for sort & filter
  type SortOrder = "default" | "asc" | "desc";
  type StatusFilter = "all" | "available" | "empty";
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const startEdit = (roll: Roll) => {
    setEditingRollId(roll.id);
    setEditOriginalLength(String(roll.originalLength));
    setEditCurrentLength(String(roll.currentLength));
  };

  const cancelEdit = () => setEditingRollId(null);

  const saveEdit = (rollId: number) => {
    if (!productId) return;
    updateMutation.mutate({
      id: productId,
      rollId: rollId,
      data: {
        originalLength: parseFloat(editOriginalLength) || 0,
        currentLength: parseFloat(editCurrentLength) || 0
      }
    });
  };

  const saveNew = () => {
    if (!productId) return;
    const len = parseFloat(newLength) || 0;
    createMutation.mutate({
      id: productId,
      data: {
        barcode: newBarcode || undefined,
        originalLength: len,
        currentLength: len
      }
    });
  };

  const editingRoll = rolls?.find((r: Roll) => r.id === editingRollId);

  // Total & summary
  const totalYds = rolls?.reduce((acc: number, r: Roll) => acc + (r.currentLength || 0), 0) ?? 0;
  const totalRolls = rolls?.length ?? 0;

  // Filtered + sorted rolls
  const sortedRolls: Roll[] = (() => {
    if (!rolls) return [];
    let result = [...rolls] as Roll[];
    // filter status
    if (statusFilter === "available") result = result.filter(r => r.status === "available");
    else if (statusFilter === "empty") result = result.filter(r => r.status !== "available");
    // sort
    if (sortOrder === "asc") result.sort((a, b) => a.currentLength - b.currentLength);
    else if (sortOrder === "desc") result.sort((a, b) => b.currentLength - a.currentLength);
    return result;
  })();

  const cycleSortOrder = () => {
    setSortOrder(prev =>
      prev === "default" ? "asc" : prev === "asc" ? "desc" : "default"
    );
  };

  const sortLabel = sortOrder === "asc" ? "Terkecil → Terbesar" : sortOrder === "desc" ? "Terbesar → Terkecil" : "Urut Masuk";
  const SortIcon = sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh] mx-auto w-full max-w-3xl px-4 sm:px-6 pb-6 pt-2">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base">Daftar Roll/Gulungan - {productName}</DrawerTitle>
          {/* Summary row */}
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span>Total Roll: <span className="font-semibold text-foreground">{totalRolls}</span></span>
            <span>|</span>
            <span>Total Sisa: <span className="font-semibold text-foreground">{formatNumber(totalYds)}</span> yds</span>
            <Button
              size="sm"
              onClick={() => { setIsAdding(true); setEditingRollId(null); }}
              className="ml-auto h-7 text-xs px-3"
              disabled={isAdding}
            >
              <Plus className="h-3 w-3 mr-1" /> Tambah Roll
            </Button>
          </div>

          {/* Sort & Filter toolbar */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Sort toggle */}
            <button
              onClick={cycleSortOrder}
              className={[
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                sortOrder !== "default"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary",
              ].join(" ")}
            >
              <SortIcon className="h-3 w-3" />
              Yard: {sortLabel}
            </button>

            {/* Status filter */}
            <div className="flex items-center gap-1">
              {(["all", "available", "empty"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={[
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                    statusFilter === f
                      ? f === "available"
                        ? "bg-green-500 text-white border-green-500"
                        : f === "empty"
                        ? "bg-gray-400 text-white border-gray-400"
                        : "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary",
                  ].join(" ")}
                >
                  {f === "all" ? "Semua" : f === "available" ? "Tersedia" : "Habis"}
                </button>
              ))}
            </div>

            {/* Tampilkan jumlah hasil filter */}
            {(sortOrder !== "default" || statusFilter !== "all") && (
              <span className="text-xs text-muted-foreground ml-auto">
                Menampilkan {sortedRolls.length} dari {totalRolls} roll
              </span>
            )}
          </div>
        </DrawerHeader>

        {/* Add new roll form */}
        {isAdding && (
          <div className="flex items-center gap-2 mb-3 p-3 rounded-lg border border-dashed border-primary/40 bg-primary/5">
            <Input
              placeholder="Barcode (Auto)"
              value={newBarcode}
              onChange={e => setNewBarcode(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Input
              type="number"
              placeholder="Panjang (yds)"
              value={newLength}
              onChange={e => setNewLength(e.target.value)}
              className="h-8 text-xs w-36 text-right"
            />
            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 shrink-0" onClick={saveNew} disabled={createMutation.isPending}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground shrink-0" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Edit panel (shown when a roll is selected) */}
        {editingRoll && (
          <div className="flex flex-col gap-2 mb-3 p-3.5 rounded-xl border-2 border-blue-200 bg-blue-50/80 dark:bg-blue-900/20 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                ✏️ Edit Roll #{editingRoll.id}
                <span className="text-xs font-normal text-muted-foreground ml-2">(Kode: {editingRoll.barcode || '-'})</span>
              </span>
              <div className="flex items-center gap-1 -mt-1 -mr-1">
                <Button size="sm" variant="ghost" className="h-8 px-2 text-green-700 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 font-medium" onClick={() => saveEdit(editingRoll.id)} disabled={updateMutation.isPending}>
                  <Check className="h-4 w-4 mr-1" /> Simpan
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => {
                  if (confirm("Hapus roll ini?")) deleteMutation.mutate({ id: productId!, rollId: editingRoll.id });
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Panjang Awal <span className="font-normal text-muted-foreground">(yds)</span>
                </label>
                <Input
                  type="number"
                  placeholder="Pjg. Awal"
                  value={editOriginalLength}
                  onChange={e => setEditOriginalLength(e.target.value)}
                  className="h-9 text-sm font-medium w-full text-right bg-white dark:bg-slate-950 border-slate-300"
                />
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
                  Ukuran total utuh saat roll baru masuk ke gudang.
                </p>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Sisa Saat Ini <span className="font-normal text-muted-foreground">(yds)</span>
                </label>
                <Input
                  type="number"
                  placeholder="Sisa Saat Ini"
                  value={editCurrentLength}
                  onChange={e => setEditCurrentLength(e.target.value)}
                  className="h-9 text-sm font-bold w-full text-right bg-white dark:bg-slate-950 border-blue-300 ring-offset-blue-50 focus-visible:ring-blue-500"
                />
                <p className="text-[10px] text-blue-600/80 dark:text-blue-400 mt-1.5 leading-tight">
                  Sisa ukuran aktual saat ini setelah terpotong / terjual.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compact grid of rolls */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {Array(12).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : !rolls || rolls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <PackageX className="mb-2 h-10 w-10 opacity-25" />
              <span className="text-sm">Tidak ada roll tersedia</span>
            </div>
          ) : (
            <div
              className="border border-primary/40 rounded-lg overflow-hidden"
              style={{ maxHeight: "46vh", overflowY: "auto" }}
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 divide-x divide-y divide-border">
                {sortedRolls.length === 0 ? (
                  <div className="col-span-4 flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Filter className="mb-2 h-6 w-6 opacity-30" />
                    <span className="text-xs">Tidak ada roll yang cocok dengan filter</span>
                  </div>
                ) : sortedRolls.map((r: Roll, idx: number) => {
                  const isEditing = editingRollId === r.id;
                  const isAvailable = r.status === "available";
                  // Shorten barcode: show last 8 chars
                  const shortBarcode = r.barcode
                    ? r.barcode.length > 10
                      ? "…" + r.barcode.slice(-9)
                      : r.barcode
                    : "-";
                  const tglMasuk = r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" })
                    : "-";
                  const pemakaian = r.originalLength > 0
                    ? Math.max(0, r.originalLength - r.currentLength)
                    : 0;
                  const persen = r.originalLength > 0
                    ? Math.round((r.currentLength / r.originalLength) * 100)
                    : 100;

                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        if (isEditing) {
                          cancelEdit();
                        } else {
                          setIsAdding(false);
                          startEdit(r);
                        }
                      }}
                      className={[
                        "flex flex-col gap-0.5 text-left px-2.5 py-2 text-xs transition-all relative group",
                        "hover:bg-primary/5",
                        isEditing
                          ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-400"
                          : "",
                      ].join(" ")}
                    >
                      {/* Row 1: Nomor + Status badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className={[
                          "font-bold text-[11px]",
                          isEditing ? "text-blue-600" : isAvailable ? "text-primary" : "text-muted-foreground",
                        ].join(" ")}>
                          Roll #{idx + 1}
                        </span>
                        <span className={[
                          "text-[9px] font-semibold px-1 py-0.5 rounded-full leading-none",
                          isAvailable
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                        ].join(" ")}>
                          {isAvailable ? "Ada" : "Habis"}
                        </span>
                      </div>

                      {/* Row 2: Barcode */}
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-[9px] text-muted-foreground shrink-0">Kode:</span>
                        <code className={[
                          "text-[9px] font-mono truncate max-w-full",
                          isAvailable ? "text-foreground" : "text-muted-foreground line-through",
                        ].join(" ")}>
                          {shortBarcode}
                        </code>
                      </div>

                      {/* Row 3: Panjang Awal */}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] text-muted-foreground">Awal:</span>
                        <span className="text-[10px] font-medium text-foreground">
                          {formatNumber(r.originalLength)} <span className="text-muted-foreground font-normal">yds</span>
                        </span>
                      </div>

                      {/* Row 4: Sisa saat ini — highlighted */}
                      <div className={[
                        "flex items-center justify-between w-full rounded px-1 -mx-1",
                        isAvailable ? "bg-primary/8" : "",
                      ].join(" ")}>
                        <span className="text-[9px] text-muted-foreground">Sisa:</span>
                        <span className={[
                          "text-[11px] font-bold",
                          isAvailable ? "text-primary" : "text-muted-foreground line-through",
                        ].join(" ")}>
                          {formatNumber(r.currentLength)} <span className="text-[9px] font-normal">yds</span>
                        </span>
                      </div>

                      {/* Row 5: Pemakaian & Tgl */}
                      <div className="flex items-center justify-between w-full mt-0.5">
                        <span className="text-[9px] text-orange-500 dark:text-orange-400 font-medium">
                          {pemakaian > 0 ? `Terpakai: ${formatNumber(pemakaian)} yds` : "Belum terpakai"}
                        </span>
                        <span className="text-[9px] text-muted-foreground">{tglMasuk}</span>
                      </div>

                      {/* Progress bar sisa */}
                      <div className="w-full h-1 rounded-full bg-muted mt-0.5 overflow-hidden">
                        <div
                          className={[
                            "h-full rounded-full transition-all",
                            persen > 60 ? "bg-green-500" : persen > 30 ? "bg-yellow-400" : "bg-red-400",
                          ].join(" ")}
                          style={{ width: `${persen}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          {rolls && rolls.length > 0 && (
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                Sisa &gt; 60%
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400" />
                Sisa 30–60%
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" />
                Sisa &lt; 30%
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300" />
                Habis
              </span>
              <span className="ml-auto italic">Klik card untuk edit / hapus</span>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

import { useState } from "react";
import {
  useListPaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
  getListPaymentMethodsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, CreditCard, GripVertical, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pengaturan() {
  const { data: methods = [], isLoading } = useListPaymentMethods(
    {},
    { query: { queryKey: getListPaymentMethodsQueryKey({}) } }
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; name: string; isActive: boolean; sortOrder: number } | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSortOrder, setNewSortOrder] = useState("99");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey({}) });

  const createMutation = useCreatePaymentMethod({
    mutation: {
      onSuccess: () => {
        invalidate();
        setIsAddOpen(false);
        setNewCode(""); setNewName(""); setNewSortOrder("99");
        toast({ title: "Metode pembayaran ditambahkan" });
      },
      onError: (err: any) => {
        toast({ title: "Gagal menambahkan", description: err?.message, variant: "destructive" });
      },
    },
  });

  const updateMutation = useUpdatePaymentMethod({
    mutation: {
      onSuccess: () => {
        invalidate();
        setEditItem(null);
        toast({ title: "Metode pembayaran diperbarui" });
      },
    },
  });

  const deleteMutation = useDeletePaymentMethod({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Metode pembayaran dihapus" });
      },
    },
  });

  const handleAdd = () => {
    if (!newCode.trim() || !newName.trim()) return;
    createMutation.mutate({
      data: { code: newCode.trim(), name: newName.trim(), isActive: true, sortOrder: parseInt(newSortOrder) || 99 },
    });
  };

  const handleToggleActive = (item: typeof methods[0]) => {
    updateMutation.mutate({ id: item.id, data: { isActive: !item.isActive } });
  };

  const handleEditSave = () => {
    if (!editItem) return;
    updateMutation.mutate({
      id: editItem.id,
      data: { name: editItem.name, isActive: editItem.isActive, sortOrder: editItem.sortOrder },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Hapus metode pembayaran ini?")) return;
    deleteMutation.mutate({ id });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" }}
        >
          <Settings size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">Konfigurasi sistem VOCpos</p>
        </div>
      </div>

      {/* Payment Methods Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard size={16} className="text-violet-500" />
                Metode Pembayaran
              </CardTitle>
              <CardDescription className="mt-1">
                Kelola metode pembayaran yang tersedia di transaksi penjualan dan pembelian
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={14} />
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 pl-6"></TableHead>
                <TableHead className="pl-2">Nama</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead className="w-24 text-center">Urutan</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-28 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : methods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Belum ada metode pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                methods.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-6">
                      <GripVertical size={14} className="text-muted-foreground/40" />
                    </TableCell>
                    <TableCell className="pl-2 font-medium">{m.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{m.code}</code>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">{m.sortOrder}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={m.isActive}
                        onCheckedChange={() => handleToggleActive(m)}
                        className="scale-90"
                      />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditItem({ id: m.id, name: m.name, isActive: m.isActive, sortOrder: m.sortOrder })}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Metode Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kode <span className="text-muted-foreground text-xs">(unik, otomatis lowercase)</span></Label>
              <Input
                placeholder="mis: gopay, ovo, dana"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Tampil</Label>
              <Input
                placeholder="mis: GoPay / OVO / DANA"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Urutan <span className="text-muted-foreground text-xs">(angka lebih kecil tampil lebih atas)</span></Label>
              <Input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button
              onClick={handleAdd}
              disabled={!newCode.trim() || !newName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Metode Pembayaran</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Nama Tampil</Label>
                <Input
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={editItem.sortOrder}
                  onChange={(e) => setEditItem({ ...editItem, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editItem.isActive}
                  onCheckedChange={(v) => setEditItem({ ...editItem, isActive: v })}
                />
                <Label>{editItem.isActive ? "Aktif" : "Nonaktif"}</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Batal</Button>
            <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

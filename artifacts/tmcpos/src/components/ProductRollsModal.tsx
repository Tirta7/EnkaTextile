import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { PackageX, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface ProductRollsModalProps {
  productId: number | null;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

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

  // State for inline editing
  const [editingRollId, setEditingRollId] = useState<number | null>(null);
  const [editOriginalLength, setEditOriginalLength] = useState<string>("");
  const [editCurrentLength, setEditCurrentLength] = useState<string>("");

  // State for adding new
  const [isAdding, setIsAdding] = useState(false);
  const [newBarcode, setNewBarcode] = useState("");
  const [newLength, setNewLength] = useState("");

  const startEdit = (roll: any) => {
    setEditingRollId(roll.id);
    setEditOriginalLength(String(roll.originalLength));
    setEditCurrentLength(String(roll.currentLength));
  };

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

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-4xl px-4 sm:px-6 pb-6 pt-2">
        <DrawerHeader>
          <DrawerTitle>Daftar Roll/Gulungan - {productName}</DrawerTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)} className="mr-8 w-fit ml-auto">
              <Plus className="h-4 w-4 mr-2" /> Tambah Roll Baru
            </Button>
          )}
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode / Stiker</TableHead>
                <TableHead className="text-right">Pjg. Awal</TableHead>
                <TableHead className="text-right">Sisa Saat Ini</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tgl Masuk</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Input 
                      placeholder="Auto Generate..." 
                      value={newBarcode} 
                      onChange={e => setNewBarcode(e.target.value)} 
                      className="h-8 w-full text-xs" 
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input 
                      type="number"
                      placeholder="Pjg..." 
                      value={newLength} 
                      onChange={e => setNewLength(e.target.value)} 
                      className="h-8 w-full text-right" 
                    />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    Otomatis
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600 border-green-200">Tersedia</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">Hari ini</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={saveNew} disabled={createMutation.isPending}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setIsAdding(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(6).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : rolls?.length === 0 && !isAdding ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <PackageX className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Tidak ada roll tersedia untuk produk ini
                  </TableCell>
                </TableRow>
              ) : (
                rolls?.map((r) => {
                  const isEditing = editingRollId === r.id;
                  
                  return (
                    <TableRow key={r.id}>
                      <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{r.barcode}</code></TableCell>
                      
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={editOriginalLength}
                            onChange={e => setEditOriginalLength(e.target.value)}
                            className="h-8 w-24 ml-auto text-right"
                          />
                        ) : (
                          formatNumber(r.originalLength)
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right font-medium">
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={editCurrentLength}
                            onChange={e => setEditCurrentLength(e.target.value)}
                            className="h-8 w-24 ml-auto text-right font-medium"
                          />
                        ) : (
                          formatNumber(r.currentLength)
                        )}
                      </TableCell>

                      <TableCell>
                        {r.status === "available" ? (
                          <Badge variant="outline" className="text-green-600 border-green-200">Tersedia</Badge>
                        ) : (
                          <Badge variant="secondary">Habis</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveEdit(r.id)} disabled={updateMutation.isPending}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingRollId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => startEdit(r)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { if(confirm('Hapus roll ini?')) deleteMutation.mutate({ id: productId!, rollId: r.id }) }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

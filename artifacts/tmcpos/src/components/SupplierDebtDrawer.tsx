import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Receipt, AlertCircle, CheckCircle2, DollarSign, ArrowRightCircle } from "lucide-react";
import { useListPayables, getListPayablesQueryKey } from "@workspace/api-client-react";
import { PurchaseDetailModal } from "./PurchaseDetailModal";

interface SupplierDebtDrawerProps {
  supplierId: number | null;
  supplierName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SupplierDebtDrawer({ supplierId, supplierName, isOpen, onClose }: SupplierDebtDrawerProps) {
  const [viewPurchaseId, setViewPurchaseId] = useState<number | null>(null);

  const { data: payables, isLoading } = useListPayables(
    { supplierId: supplierId || undefined },
    { query: { enabled: !!supplierId && isOpen, queryKey: getListPayablesQueryKey({ supplierId: supplierId || undefined }) } }
  );

  const debts = payables || [];
  const activeDebts = debts.filter(p => p.status !== "lunas");

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-3xl px-4 sm:px-6 pb-6 pt-2 flex flex-col">
          <DrawerHeader className="px-0 pt-0 pb-4 border-b">
            <DrawerTitle className="text-xl font-bold flex flex-col gap-1">
              <span>Riwayat Tagihan {supplierName}</span>
              <span className="text-sm text-slate-500 font-normal">
                {activeDebts.length} tagihan belum lunas dari total {debts.length} tagihan
              </span>
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto mt-4 px-1 custom-scrollbar">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : debts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                <Receipt className="mx-auto mb-3 h-10 w-10 text-slate-300" strokeWidth={1.5} />
                <h3 className="text-base font-bold text-slate-700">Tidak Ada Riwayat Tagihan</h3>
                <p className="text-sm text-slate-500 mt-1">Belum ada transaksi pembelian berstatus kredit/tempo untuk supplier ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {debts.map((p) => {
                  const total = (p as any).totalAmount ?? 0;
                  const paid = (p as any).paidAmount ?? 0;
                  const isOverdue = (p as any).isOverdue;
                  
                  let badgeClass = "bg-slate-100 text-slate-700";
                  
                  if (p.status === 'partial') {
                    badgeClass = "bg-blue-100 text-blue-700";
                  } else if (p.status === 'lunas') {
                    badgeClass = "bg-green-100 text-green-700";
                  } else {
                    badgeClass = "bg-red-100 text-red-700";
                  }

                  return (
                    <div key={p.id} className={`bg-white rounded-2xl p-4 border ${isOverdue ? 'border-red-200 bg-red-50/10' : (p.status === 'lunas' ? 'border-green-100 bg-green-50/30' : 'border-slate-200')} flex flex-col sm:flex-row gap-4 items-start sm:items-center relative transition-all hover:shadow-md`}>
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md">
                            {(p as any).invoiceNumber || `#${p.purchaseId}`}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}`}>
                            {p.status?.replace("_", " ")}
                          </span>
                          {isOverdue && p.status !== 'lunas' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-100 text-red-700">
                              Jatuh Tempo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-slate-900">{formatRupiah(total)}</span>
                          <span className="text-slate-300">•</span>
                          {p.status === 'lunas' ? (
                            <span className="text-green-600 text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Sudah Lunas</span>
                          ) : (
                            <span className="text-slate-500 text-xs">Sisa: <span className="font-semibold text-red-600">{formatRupiah((p as any).remainingAmount)}</span></span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Tgl: {formatDate((p as any).createdAt)} {p.dueDate && `| Tempo: ${formatDate((p as any).dueDate)}`}
                        </div>
                      </div>
                      
                      <div className="shrink-0 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full text-violet-700 border-violet-200 hover:bg-violet-50 hover:text-violet-800" onClick={() => setViewPurchaseId(p.purchaseId)}>
                          Lihat Detail Item <ArrowRightCircle className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DrawerFooter className="px-0 pt-4 mt-4 border-t border-border">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
              Tutup
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <PurchaseDetailModal 
        purchaseId={viewPurchaseId} 
        isOpen={!!viewPurchaseId} 
        onClose={() => setViewPurchaseId(null)} 
      />
    </>
  );
}

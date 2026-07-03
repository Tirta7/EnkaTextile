import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { Printer, Loader2 } from "lucide-react";
import { useGetSale, getGetSaleQueryKey } from "@workspace/api-client-react";

export type InvoicePreviewData = {
  invoiceNumber: string;
  customerName?: string | null;
  createdAt?: string;
  items: Array<{
    categoryName?: string;
    productName: string;
    meters: number | string;
    rolls: number | string;
    pricePerMeter: number | string;
    subtotal: number | string;
  }>;
  totalAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
};

interface InvoicePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: InvoicePreviewData | null;
  saleId?: number;
}

export function InvoicePreviewModal({ open, onOpenChange, data, saleId }: InvoicePreviewModalProps) {
  const { data: settings } = useSettings();
  const { data: fetchedSale, isLoading } = useGetSale(saleId || 0, {
    query: { queryKey: getGetSaleQueryKey(saleId || 0), enabled: !!saleId && open }
  });

  const appName = settings?.["app_name"] || "ENKA TEXTILE";
  const appAddress = settings?.["app_address"] || "Jl. Raya Jrebengkembang, Kedolon Gang Griya Azzahra, Karangdadap Kab. Pekalongan";

  const displayData = data || fetchedSale;

  const handlePrint = () => {
    window.print();
  };

  const totalYds = displayData?.items.reduce((sum: number, item: any) => sum + parseFloat(item.meters as string || "0"), 0) || 0;
  const totalRolls = displayData?.items.reduce((sum: number, item: any) => sum + parseFloat(item.rolls as string || "0"), 0) || 0;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          @page { margin: 0.5cm; }
        }
      `}</style>
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* Note: sr-only DialogTitle added to resolve accessibility warnings */}
        <DialogTitle className="sr-only">Preview Invoice</DialogTitle>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-white">
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-4 border-b flex justify-between items-center z-10">
            <h2 className="text-lg font-semibold text-black">Preview Invoice</h2>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="w-4 h-4 mr-2" /> Cetak Sekarang
            </Button>
          </div>
          
          <div id="printable-invoice" className="p-8 text-black bg-white min-h-[400px]" style={{ fontFamily: "Arial, sans-serif" }}>
            {isLoading && !data ? (
              <div className="flex justify-center items-center h-full pt-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !displayData ? (
              <div className="text-center pt-12 text-muted-foreground">Data tidak tersedia</div>
            ) : (
            <div className="max-w-4xl mx-auto text-[13px] leading-tight">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-[30%] text-center">
                  <h1 className="font-bold text-[15px]">{appName}</h1>
                  <p className="whitespace-pre-line">{appAddress.replace(/, /g, ",\n")}</p>
                </div>
                
                <div className="w-[30%] text-center">
                  <h2 className="font-bold text-[15px] underline underline-offset-2">NOTA PENJUALAN</h2>
                  <p className="mt-1">No. {displayData.invoiceNumber || "DRAFT"}</p>
                </div>
                
                <div className="w-[30%] text-center">
                  <p>Pekalongan, {formatDate(displayData.createdAt || new Date().toISOString())}</p>
                  <p className="mt-1">KEPADA YTH</p>
                  <p className="font-bold">{displayData.customerName || "UMUM"}</p>
                </div>
              </div>
              
              {/* Table */}
              <table className="w-full mb-2 border-y-2 border-black border-collapse">
                <thead>
                  <tr className="border-b border-black">
                    <th className="py-2 text-left font-normal w-12">NO</th>
                    <th className="py-2 text-left font-normal">NAMA BARANG</th>
                    <th className="py-2 text-right font-normal">JUMLAH</th>
                    <th className="py-2 text-right font-normal">HARGA</th>
                    <th className="py-2 text-right font-normal">JUMLAH</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.items.map((item: any, index: number) => {
                    const meters = parseFloat(item.meters as string || "0");
                    const rolls = parseFloat(item.rolls as string || "0");
                    const categoryPrefix = item.categoryName ? `${item.categoryName.toUpperCase()} / ` : "";
                    const productName = item.productName?.toUpperCase() || "";
                    
                    return (
                      <tr key={index} className="align-top border-b border-gray-100 last:border-0">
                        <td className="py-2 text-left">{index + 1}</td>
                        <td className="py-2 text-left font-medium">
                          {categoryPrefix}{productName}
                        </td>
                        <td className="py-2 text-right whitespace-nowrap">
                          {meters.toFixed(2)} M / {rolls} ROLL
                        </td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat('id-ID').format(parseFloat(item.pricePerMeter as string || item.pricePerUnit as string || "0"))}
                        </td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat('id-ID').format(parseFloat(item.subtotal as string || "0"))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-black">
                    <td colSpan={2} className="py-2"></td>
                    <td className="py-2 text-right font-semibold">
                      {totalYds.toFixed(2)} M / {totalRolls} ROLL
                    </td>
                    <td className="py-2 text-right">Grand Total</td>
                    <td className="py-2 text-right font-semibold">{new Intl.NumberFormat('id-ID').format(parseFloat(displayData.totalAmount as string || "0"))}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-1"></td>
                    <td className="py-1 text-right">Di Bayar</td>
                    <td className="py-1 text-right">{new Intl.NumberFormat('id-ID').format(parseFloat(displayData.paidAmount as string || "0"))}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-1"></td>
                    <td className="py-1 text-right">Sisa Bayar</td>
                    <td className="py-1 text-right">{new Intl.NumberFormat('id-ID').format(parseFloat(displayData.remainingAmount as string || "0"))}</td>
                  </tr>
                </tfoot>
              </table>
              
              {/* Footer Signatures & Info */}
              <div className="flex justify-between items-start mt-8">
                <div className="flex gap-24">
                  <div className="text-center w-32">
                    <p className="mb-16">Tanda Terima</p>
                    <p className="border-b border-black border-dotted">&nbsp;</p>
                  </div>
                  <div className="text-center w-32">
                    <p className="mb-16">Hormat Kami</p>
                    <p className="border-b border-black border-dotted">&nbsp;</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-[12px]">
                <p>Transfer :</p>
                <p>BCA-2384564444 An. Spectra Jaya Fashion PT</p>
              </div>
              
            </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

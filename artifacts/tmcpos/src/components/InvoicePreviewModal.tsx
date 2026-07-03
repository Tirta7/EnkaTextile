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
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
          
          <div id="printable-invoice" className="p-8 md:p-12 text-slate-800 bg-white min-h-[400px]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isLoading && !data ? (
              <div className="flex justify-center items-center h-full pt-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !displayData ? (
              <div className="text-center pt-12 text-muted-foreground">Data tidak tersedia</div>
            ) : (
            <div className="max-w-4xl mx-auto text-[13px] leading-relaxed">
              {/* Header */}
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
                <div className="w-[35%]">
                  <h1 className="font-extrabold text-xl tracking-tight text-slate-900 mb-1">{appName}</h1>
                  <p className="text-slate-500 whitespace-pre-line text-xs">{appAddress.replace(/, /g, ",\n")}</p>
                </div>
                
                <div className="w-[30%] text-center flex flex-col items-center">
                  <div className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full font-bold text-xs tracking-widest mb-2 uppercase">
                    Nota Penjualan
                  </div>
                  <p className="text-slate-900 font-semibold text-[15px]">No. {displayData.invoiceNumber || "DRAFT"}</p>
                </div>
                
                <div className="w-[35%] text-right text-xs">
                  <p className="text-slate-500 mb-2">Pekalongan, <span className="text-slate-900 font-medium">{formatDate(displayData.createdAt || new Date().toISOString())}</span></p>
                  <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mb-0.5">Kepada Yth</p>
                  <p className="font-bold text-slate-900 text-sm">{displayData.customerName || "UMUM"}</p>
                </div>
              </div>
              
              {/* Table */}
              <div className="rounded-lg border border-slate-200 overflow-hidden mb-6">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider w-12 text-center">No</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Nama Barang</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">Kuantitas</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">Harga</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                <tbody>
                  {displayData.items.map((item: any, index: number) => {
                    const meters = parseFloat(item.meters as string || "0");
                    const rolls = parseFloat(item.rolls as string || "0");
                    const categoryPrefix = item.categoryName ? `${item.categoryName.toUpperCase()} / ` : "";
                    const productName = item.productName?.toUpperCase() || "";
                    
                    return (
                      <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            {item.categoryName && <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">{item.categoryName}</span>}
                            <span className="font-semibold text-slate-800">{productName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="font-medium text-slate-700">{meters.toFixed(2)} M</span>
                          <span className="text-slate-400 ml-1 text-xs">/ {rolls} Roll</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          {new Intl.NumberFormat('id-ID').format(parseFloat(item.pricePerMeter as string || item.pricePerUnit as string || "0"))}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {new Intl.NumberFormat('id-ID').format(parseFloat(item.subtotal as string || "0"))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
              {/* Totals Section */}
              <div className="flex justify-between items-start">
                {/* Left side info (Payment / Transfer) */}
                <div className="w-[45%]">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                    <p className="text-blue-900 font-semibold mb-1 text-xs">Informasi Pembayaran (Transfer)</p>
                    <p className="text-blue-800 text-[13px] font-medium font-mono">BCA - 2384564444</p>
                    <p className="text-blue-700 text-xs mt-0.5">A.n Spectra Jaya Fashion PT</p>
                  </div>
                </div>

                {/* Right side totals */}
                <div className="w-[45%] bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="flex justify-between items-center mb-2 text-slate-600">
                    <span>Total Kuantitas</span>
                    <span className="font-semibold text-slate-800">{totalYds.toFixed(2)} M / {totalRolls} Roll</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 text-slate-600 pb-4 border-b border-slate-200">
                    <span>Grand Total</span>
                    <span className="font-bold text-slate-900 text-base">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.totalAmount as string || "0"))}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-slate-600">
                    <span>Di Bayar</span>
                    <span className="font-medium text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.paidAmount as string || "0"))}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Sisa Bayar</span>
                    <span className="font-medium text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.remainingAmount as string || "0"))}</span>
                  </div>
                </div>
              </div>
              
              {/* Footer Signatures */}
              <div className="flex justify-end gap-16 mt-12 pr-4">
                <div className="text-center w-32 flex flex-col items-center">
                  <p className="text-slate-500 text-xs mb-16">Tanda Terima</p>
                  <div className="border-b border-slate-300 w-full"></div>
                </div>
                <div className="text-center w-32 flex flex-col items-center">
                  <p className="text-slate-500 text-xs mb-16">Hormat Kami</p>
                  <div className="border-b border-slate-300 w-full"></div>
                  <p className="text-slate-400 text-[10px] mt-1">{appName}</p>
                </div>
              </div>
              
            </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

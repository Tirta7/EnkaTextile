import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate, formatDateTime } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { useState } from "react";
import * as htmlToImage from "html-to-image";
import { Printer, Loader2, QrCode, Download } from "lucide-react";
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
  
  const invoiceBankName = settings?.["invoice_bank_name"] || "A.n Spectra Jaya Fashion PT";
  const invoiceBankAccount = settings?.["invoice_bank_account"] || "BCA - 2384564444";
  const invoiceNotes = settings?.["invoice_notes"] || "";

  const displayData = data || fetchedSale;

  const handlePrint = () => {
    const printContent = document.getElementById("printable-invoice");
    if (!printContent) return;
    
    // Create a temporary div for printing
    const printContainer = document.createElement("div");
    printContainer.id = "print-container-temp";
    printContainer.appendChild(printContent.cloneNode(true));
    document.body.appendChild(printContainer);
    
    // Add a style to hide everything else
    const style = document.createElement("style");
    style.id = "print-style-temp";
    style.innerHTML = `
      @media print {
        body > *:not(#print-container-temp) {
          display: none !important;
        }
        body {
          background: white;
        }
        #print-container-temp {
          display: block !important;
          width: 100%;
          position: absolute;
          left: 0;
          top: 0;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Dot Matrix / 3-Ply Optimizations */
        #print-container-temp * {
          color: #000 !important;
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        
        /* Remove unnecessary box borders */
        #print-container-temp .border,
        #print-container-temp .border-[1.5px] {
          border: none !important;
        }
        
        /* Keep and crisp horizontal separators and table rows */
        #print-container-temp .border-b,
        #print-container-temp .border-b-2,
        #print-container-temp .border-t {
          border-color: #000 !important;
        }
        
        /* Specific borders to keep */
        #print-container-temp .lunas-stamp {
          border: 2px solid #000 !important;
        }

        /* Hide giant watermark for dot matrix so it doesn't obstruct text */
        #print-container-temp .lunas-watermark {
          display: none !important;
        }
        
        @page { 
          margin: 1cm 0.5cm; /* Adjust for continuous form tractor feed */
        }
      }
      
      /* Mobile Zoom for exact PC layout preview */
      @media screen and (max-width: 640px) {
        #printable-invoice {
          zoom: 0.45; /* Scales the entire layout down to fit mobile screens perfectly */
        }
      }
    `;
    document.head.appendChild(style);
    
    // Small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
      // Cleanup
      document.body.removeChild(printContainer);
      document.head.removeChild(style);
    }, 100);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadJPG = async () => {
    const element = document.getElementById("printable-invoice");
    if (!element) return;
    
    setIsDownloading(true);
    try {
      // Temporarily remove zoom for high-res download
      element.style.setProperty('zoom', '1', 'important');
      
      // Small delay to ensure all fonts/styles are loaded before rendering
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const dataUrl = await htmlToImage.toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2, // High resolution
        backgroundColor: "#ffffff",
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Invoice-${displayData?.invoiceNumber || "Draft"}.jpg`;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
    } finally {
      element.style.removeProperty('zoom');
      setIsDownloading(false);
    }
  };

  const totalYds = displayData?.items.reduce((sum: number, item: any) => sum + parseFloat(item.meters as string || "0"), 0) || 0;
  const totalRolls = displayData?.items.reduce((sum: number, item: any) => sum + parseFloat(item.rolls as string || "0"), 0) || 0;
  
  const isPaid = parseFloat(displayData?.remainingAmount as string || "0") <= 0 && parseFloat(displayData?.totalAmount as string || "0") > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* Note: sr-only DialogTitle added to resolve accessibility warnings */}
        <DialogTitle className="sr-only">Preview Invoice</DialogTitle>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-white">
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-4 pt-12 sm:pt-4 border-b flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between items-center z-50">
            <h2 className="text-lg font-semibold text-black">Preview Invoice</h2>
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button onClick={handleDownloadJPG} variant="outline" disabled={isDownloading} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Download JPG
              </Button>
              <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Printer className="w-4 h-4 mr-2" /> Cetak Sekarang
              </Button>
            </div>
          </div>
          
          <div id="printable-invoice" className="p-8 md:p-12 text-slate-800 bg-white min-h-[400px]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isLoading && !data ? (
              <div className="flex justify-center items-center h-full pt-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !displayData ? (
              <div className="text-center pt-12 text-muted-foreground">Data tidak tersedia</div>
            ) : (
            <div className="max-w-4xl mx-auto text-[13px] leading-relaxed relative">
              {/* Watermark for Paid */}
              {isPaid && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                  <div className="lunas-watermark text-[150px] font-black text-green-500/10 rotate-[-30deg] select-none border-8 border-green-500/10 p-8 rounded-3xl tracking-widest uppercase">
                    LUNAS
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-indigo-100 relative z-10">
                <div className="w-[35%]">
                  <h1 className="font-black text-2xl tracking-tighter text-indigo-900 mb-2 uppercase">{appName}</h1>
                  <p className="text-slate-500 whitespace-pre-line text-xs leading-relaxed">{appAddress.replace(/, /g, ",\n")}</p>
                </div>
                
                <div className="w-[30%] text-center flex flex-col items-center">
                  <div className="bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full font-bold text-[10px] tracking-widest mb-3 uppercase border border-indigo-100 shadow-sm">
                    Nota Penjualan
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-400" />
                      <p className="text-slate-900 font-bold text-base tracking-tight">{displayData.invoiceNumber || "DRAFT"}</p>
                    </div>
                    {isPaid && (
                      <div className="lunas-stamp mt-2 inline-block border-[1.5px] border-green-600 text-green-600 px-3 py-1 font-black text-[10px] tracking-widest uppercase rounded">
                        LUNAS
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-[35%] text-right text-xs">
                  <p className="text-slate-500 mb-3 text-[11px]">Tanggal: <span className="text-slate-900 font-semibold">{formatDateTime(displayData.createdAt || new Date().toISOString()).replace(/\./g, ":")}</span></p>
                  <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-1">Kepada Yth.</p>
                  <p className="font-extrabold text-slate-900 text-[15px]">{displayData.customerName || "UMUM"}</p>
                </div>
              </div>
              
              {/* Table */}
              <div className="rounded-xl border border-indigo-100 shadow-sm overflow-hidden mb-8 relative z-10 w-full min-w-[700px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-linear-to-r from-indigo-50 to-indigo-50/30 border-b border-indigo-100">
                    <tr>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest w-10 text-center">No</th>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest">Nama Barang</th>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest text-right">Kuantitas</th>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest text-right">Harga</th>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest text-right">Total</th>
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
                        <td className="py-1.5 px-3 text-center text-slate-500 text-xs font-medium">{index + 1}</td>
                        <td className="py-1.5 px-3">
                          <div className="flex flex-col">
                            {item.categoryName && <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest leading-none">{item.categoryName}</span>}
                            <span className="font-bold text-slate-800 text-xs">{productName}</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-3 text-right whitespace-nowrap">
                          <span className="font-semibold text-slate-800 text-xs">{meters.toFixed(2)} M</span>
                          <span className="text-slate-400 ml-1 text-[10px]">/ {rolls} Roll</span>
                        </td>
                        <td className="py-1.5 px-3 text-right font-semibold text-slate-600 text-xs">
                          {new Intl.NumberFormat('id-ID').format(parseFloat(item.pricePerMeter as string || item.pricePerUnit as string || "0"))}
                        </td>
                        <td className="py-1.5 px-3 text-right font-black text-slate-900 text-xs">
                          {new Intl.NumberFormat('id-ID').format(parseFloat(item.subtotal as string || "0"))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
              {/* Totals Section */}
              <div className="flex justify-between items-start relative z-10 min-w-[700px]">
                {/* Left side info (Payment / Transfer) */}
                <div className="w-[45%]">
                  <div className="bg-linear-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-[10px]">Rp</div>
                      <p className="text-indigo-900 font-bold text-xs uppercase tracking-wider">Informasi Transfer</p>
                    </div>
                    <p className="text-indigo-800 text-[14px] font-bold font-mono tracking-wider mt-2">{invoiceBankAccount}</p>
                    <p className="text-indigo-600 text-xs mt-1 font-medium">{invoiceBankName}</p>
                  </div>
                  
                  {invoiceNotes && (
                    <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Catatan</p>
                      <p className="text-slate-700 text-xs italic">{invoiceNotes}</p>
                    </div>
                  )}
                </div>

                {/* Right side totals */}
                <div className="w-[45%] bg-white rounded-xl border border-slate-200 p-0 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Kuantitas</span>
                      <span className="font-bold text-slate-800">{totalYds.toFixed(2)} M / {totalRolls} Roll</span>
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-inner">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Grand Total</span>
                    <span className="font-black text-xl tracking-tight">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.totalAmount as string || "0"))}</span>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500 font-medium text-xs">Di Bayar</span>
                      <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.paidAmount as string || "0"))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium text-xs">Sisa Bayar</span>
                      <span className="font-bold text-rose-600">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.remainingAmount as string || "0"))}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Signatures */}
              <div className="flex justify-end gap-16 mt-12 pr-4 min-w-[700px]">
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

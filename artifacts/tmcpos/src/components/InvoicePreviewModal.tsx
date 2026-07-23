import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, formatDateTime } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { useState, useRef, useEffect, useMemo } from "react";
import * as htmlToImage from "html-to-image";
import { Printer, Loader2, QrCode, Download, RefreshCcw, CornerDownRight } from "lucide-react";
import React from "react";
import { useGetSale, getGetSaleQueryKey, useListProducts, getListProductsQueryKey, useGetProductRolls, getGetProductRollsQueryKey, useListCategories, getListCategoriesQueryKey, useCreateReturn, getListSalesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export type InvoicePreviewData = {
  invoiceNumber: string;
  customerName?: string | null;
  createdAt?: string;
  items: Array<{
    productId: number;
    rollId?: number;
    categoryName?: string;
    productName: string;
    meters: number | string;
    rolls: number | string;
    pricePerMeter: number | string;
    subtotal: number | string;
    isReturned?: boolean;
  }>;
  exchangedItems?: Array<{
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

  const displayData = data || fetchedSale;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | 'auto'>('auto');

  // Exchange Dialog State
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [itemToExchange, setItemToExchange] = useState<any>(null);
  const [replacementProductId, setReplacementProductId] = useState<string>("");
  const [replacementRollId, setReplacementRollId] = useState<string>("none");
  const [replacementMeters, setReplacementMeters] = useState<number | "">("");
  const [replacementRolls, setReplacementRolls] = useState<number | "">(1);
  const [replacementPrice, setReplacementPrice] = useState<number | "">("");
  
  const { data: products } = useListProducts({}, { query: { queryKey: getListProductsQueryKey(), enabled: exchangeOpen } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey(), enabled: exchangeOpen } });
  const { data: rolls } = useGetProductRolls(parseInt(replacementProductId) || 0, {
    query: { queryKey: getGetProductRollsQueryKey(parseInt(replacementProductId) || 0), enabled: !!replacementProductId && exchangeOpen }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createReturnMutation = useCreateReturn({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSaleQueryKey(saleId || 0) });
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey({}) });
        setExchangeOpen(false);
        toast({ title: "Retur / Tukar Barang Berhasil" });
      },
      onError: (err) => {
        toast({ title: "Gagal memproses retur", variant: "destructive" });
      }
    }
  });

  useEffect(() => {
    if (!open) return;
    
    const updateDimensions = () => {
      if (containerRef.current && invoiceRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const invoiceWidth = 800;
        if (containerWidth > 0 && containerWidth < invoiceWidth) {
          const newScale = containerWidth / invoiceWidth;
          setScale(newScale);
          setScaledHeight(invoiceRef.current.offsetHeight * newScale);
        } else {
          setScale(1);
          setScaledHeight('auto');
        }
      }
    };

    const timeoutId = setTimeout(updateDimensions, 50);
    const resizeObserver = new ResizeObserver(() => updateDimensions());
    
    if (invoiceRef.current) resizeObserver.observe(invoiceRef.current);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [open, displayData]);

  const appName = (settings?.["app_name"] || "ENKA TEXTILE").replace(/ENKATEXTILE/gi, "ENKA TEXTILE").replace(/EnkaTextile/gi, "ENKA TEXTILE");
  const appAddress = settings?.["app_address"] || "Jl. Raya Jrebengkembang, Kedolon Gang Griya Azzahra, Karangdadap Kab. Pekalongan";
  const invoiceBankName = settings?.["invoice_bank_name"] || "A.n Spectra Jaya Fashion PT";
  const invoiceBankAccount = settings?.["invoice_bank_account"] || "BCA - 2384564444";
  const invoiceNotes = settings?.["invoice_notes"] || "";

  const handlePrint = () => {
    const printContent = document.getElementById("printable-invoice");
    if (!printContent) return;
    const printContainer = document.createElement("div");
    printContainer.id = "print-container-temp";
    printContainer.appendChild(printContent.cloneNode(true));
    document.body.appendChild(printContainer);
    
    const style = document.createElement("style");
    style.id = "print-style-temp";
    style.innerHTML = `
      @media print {
        body > *:not(#print-container-temp) { display: none !important; }
        body { background: white; }
        #print-container-temp {
          display: block !important; width: 100%; position: absolute; left: 0; top: 0; margin: 0; padding: 0;
          -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
        }
        #print-container-temp * { color: #000 !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }
        #print-container-temp .border, #print-container-temp .border-[1.5px] { border: none !important; }
        #print-container-temp .border-b, #print-container-temp .border-b-2, #print-container-temp .border-t { border-color: #000 !important; }
        #print-container-temp .lunas-stamp { border: 2px solid #000 !important; }
        #print-container-temp .lunas-watermark { display: none !important; }
        #print-container-temp .no-print { display: none !important; }
        @page { margin: 1cm 0.5cm; }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      window.print();
      document.body.removeChild(printContainer);
      document.head.removeChild(style);
    }, 100);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadJPG = async () => {
    const element = document.getElementById("printable-invoice");
    if (!element) return;
    
    const hideBeforePrint = element.querySelectorAll('.no-print');
    hideBeforePrint.forEach(el => (el as HTMLElement).style.display = 'none');
    
    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const dataUrl = await htmlToImage.toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Invoice-${displayData?.invoiceNumber || "Draft"}.jpg`;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
    } finally {
      setIsDownloading(false);
      hideBeforePrint.forEach(el => (el as HTMLElement).style.display = '');
    }
  };

  const handleExchangeSubmit = () => {
    if (!itemToExchange) return;
    if (!replacementProductId) {
      toast({ title: "Pilih barang pengganti", variant: "destructive" });
      return;
    }
    
    const returnedSubtotal = parseFloat(itemToExchange.subtotal as string || "0");
    const exchangeSubtotal = (typeof replacementMeters === "number" ? replacementMeters : 0) * (typeof replacementPrice === "number" ? replacementPrice : 0);
    
    const paymentStatus = displayData?.remainingAmount && parseFloat(displayData.remainingAmount as string) > 0 ? "tempo" : "lunas";
    
    createReturnMutation.mutate({
      data: {
        type: "penjualan",
        saleId: saleId,
        customerId: fetchedSale?.customerId || undefined,
        paymentStatus,
        returnedItems: [{
          productId: itemToExchange.productId,
          rollId: itemToExchange.rollId || undefined,
          rolls: parseFloat(itemToExchange.rolls as string || "0"),
          meters: parseFloat(itemToExchange.meters as string || "0"),
          pricePerMeter: parseFloat(itemToExchange.pricePerMeter as string || "0"),
          subtotal: returnedSubtotal
        }],
        exchangedItems: [{
          productId: parseInt(replacementProductId),
          rollId: replacementRollId !== "none" ? parseInt(replacementRollId.replace("r_", "")) : undefined,
          rolls: typeof replacementRolls === "number" ? replacementRolls : 0,
          meters: typeof replacementMeters === "number" ? replacementMeters : 0,
          pricePerMeter: typeof replacementPrice === "number" ? replacementPrice : 0,
          subtotal: exchangeSubtotal
        }]
      }
    });
  };

  const totalYds = displayData?.items.reduce((sum: number, item: any) => sum + parseFloat(item.meters as string || "0"), 0) || 0;
  const totalRolls = displayData?.items.reduce((sum: number, item: any) => sum + parseFloat(item.rolls as string || "0"), 0) || 0;
  
  const isPaid = parseFloat(displayData?.remainingAmount as string || "0") <= 0 && parseFloat(displayData?.totalAmount as string || "0") > 0;
  const availableRolls = rolls?.filter(r => r.status === 'available') || [];

  const uniqueReturns = useMemo(() => {
    if (!displayData?.items) return [];
    const retMap = new Map();
    displayData.items.forEach((item: any) => {
      if (item.returns && item.returns.length > 0) {
        item.returns.forEach((r: any) => {
          retMap.set(r.id, r);
        });
      }
    });
    return Array.from(retMap.values());
  }, [displayData]);

  const groupedItems = useMemo(() => {
    if (!displayData?.items) return [];
    const groups: Record<string, any> = {};
    
    displayData.items.forEach((item: any) => {
      const key = `${item.productId}_${parseFloat(item.pricePerMeter || item.pricePerUnit || "0")}`;
      if (!groups[key]) {
        groups[key] = {
          ...item,
          isGroup: true,
          groupedRolls: [{
             meters: parseFloat(item.meters as string || "0"),
             rolls: parseFloat(item.rolls as string || "0"),
             isReturned: item.isReturned,
             originalItem: item
          }],
          totalMeters: parseFloat(item.meters as string || "0"),
          totalRolls: parseFloat(item.rolls as string || "0"),
          totalSubtotal: parseFloat(item.subtotal as string || "0"),
          hasReturned: item.isReturned,
          allReturns: [...(item.returns || [])]
        };
      } else {
        groups[key].groupedRolls.push({
           meters: parseFloat(item.meters as string || "0"),
           rolls: parseFloat(item.rolls as string || "0"),
           isReturned: item.isReturned,
           originalItem: item
        });
        groups[key].totalMeters += parseFloat(item.meters as string || "0");
        groups[key].totalRolls += parseFloat(item.rolls as string || "0");
        groups[key].totalSubtotal += parseFloat(item.subtotal as string || "0");
        if (item.isReturned) groups[key].hasReturned = true;
        if (item.returns && item.returns.length > 0) {
          groups[key].allReturns.push(...item.returns);
        }
      }
    });
    
    // Deduplicate allReturns by return id
    return Object.values(groups).map((g: any) => {
      g.allReturns = Array.from(new Map(g.allReturns.map((r: any) => [r.id, r])).values());
      return g;
    });
  }, [displayData]);

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTitle className="sr-only">Preview Invoice</DrawerTitle>
        <DrawerContent className="max-w-4xl mx-auto w-full max-h-[90vh] overflow-y-auto p-0 bg-white">
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-4 pt-6 sm:pt-4 border-b flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between items-center z-50">
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
          
          <div className="w-full overflow-hidden pb-6" ref={containerRef} style={{ height: scaledHeight === 'auto' ? 'auto' : `${scaledHeight}px` }}>
            <div id="printable-invoice" ref={invoiceRef} className="p-8 md:p-12 text-slate-800 bg-white min-h-[400px] origin-top-left" style={{ fontFamily: "'Inter', sans-serif", width: '800px', minWidth: '800px', transform: `scale(${scale})` }}>
              {isLoading && !data ? (
              <div className="flex justify-center items-center h-full pt-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !displayData ? (
              <div className="text-center pt-12 text-muted-foreground">Data tidak tersedia</div>
            ) : (
            <div className="max-w-4xl mx-auto text-[13px] leading-relaxed relative">
              {isPaid && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                  <div className="lunas-watermark text-[150px] font-black text-green-500/10 rotate-[-30deg] select-none border-8 border-green-500/10 p-8 rounded-3xl tracking-widest uppercase">LUNAS</div>
                </div>
              )}

              <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-indigo-100 relative z-10">
                <div className="w-[38%]">
                  <div className="inline-flex flex-col items-center text-center mb-2">
                    <h1 className="font-black text-[24px] leading-tight tracking-tighter text-indigo-900 mb-0.5 uppercase">{appName}</h1>
                    <p className="text-slate-800 font-bold text-[11px] tracking-tight uppercase">PT. Spectra Jaya Fashion</p>
                  </div>
                  <p className="text-slate-500 whitespace-pre-line text-xs leading-relaxed">{appAddress.replace(/, /g, ",\n")}</p>
                </div>
                
                <div className="w-[30%] text-center flex flex-col items-center">
                  <div className="bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full font-bold text-[10px] tracking-widest mb-3 uppercase border border-indigo-100">Nota Penjualan</div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-400" />
                      <p className="text-slate-900 font-bold text-base tracking-tight">{displayData.invoiceNumber || "DRAFT"}</p>
                    </div>
                    {isPaid && <div className="lunas-stamp mt-2 inline-block border-[1.5px] border-green-600 text-green-600 px-3 py-1 font-black text-[10px] tracking-widest uppercase rounded">LUNAS</div>}
                  </div>
                </div>
                
                <div className="w-[35%] text-right text-xs">
                  <p className="text-slate-500 mb-3 text-[11px]">Tanggal: <span className="text-slate-900 font-semibold">{formatDateTime(displayData.createdAt || new Date().toISOString()).replace(/\./g, ":")}</span></p>
                  <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-1">Kepada Yth.</p>
                  <p className="font-extrabold text-slate-900 text-[15px]">{displayData.customerName || "UMUM"}</p>
                </div>
              </div>
              
              <div className="rounded-xl border border-indigo-100 overflow-hidden mb-8 relative z-10 w-full min-w-[700px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-linear-to-r from-indigo-50 to-indigo-50/30 border-b border-indigo-100">
                    <tr>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest w-10 text-center">No</th>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest">Nama Barang</th>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest text-right">Kuantitas</th>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest text-right">Harga</th>
                      <th className="py-2 px-3 font-bold text-indigo-800 text-[10px] uppercase tracking-widest text-right">Total</th>
                      {saleId && <th className="no-print w-10"></th>}
                    </tr>
                  </thead>
                <tbody>
                  {groupedItems.map((item: any, index: number) => {
                    const productName = item.productName?.toUpperCase() || "";
                    
                    return (
                      <React.Fragment key={index}>
                      <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-1.5 px-3 text-center text-slate-500 text-xs font-medium align-top">{index + 1}</td>
                        <td className="py-1.5 px-3 align-top">
                          <div className="flex flex-col items-start gap-1">
                            {item.categoryName && <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest leading-none">{item.categoryName}</span>}
                            <span className={`font-bold text-slate-800 text-xs ${item.hasReturned ? 'text-slate-600' : ''}`}>{productName}</span>
                            
                            <div className="flex flex-wrap gap-1 mt-0.5 max-w-[280px]">
                              {item.groupedRolls.map((gr: any, gIdx: number) => (
                                 <div key={gIdx} className="flex items-center">
                                   <span className={`text-[9px] px-1 py-0.5 bg-slate-100 rounded text-slate-500 font-mono ${gr.isReturned ? 'line-through opacity-50' : ''}`}>
                                     [{gr.meters.toFixed(2)}]
                                   </span>
                                   {!gr.isReturned && saleId && (
                                     <Button 
                                       variant="ghost" size="icon" className="h-4 w-4 ml-0.5 text-orange-400 hover:text-orange-600 no-print" 
                                       onClick={() => {
                                         setItemToExchange(gr.originalItem);
                                         setReplacementProductId("");
                                         setReplacementRollId("none");
                                         setReplacementMeters("");
                                         setReplacementRolls(1);
                                         setReplacementPrice("");
                                         setExchangeOpen(true);
                                       }}
                                       title="Tukar Roll Ini"
                                     >
                                       <RefreshCcw className="h-2.5 w-2.5" />
                                     </Button>
                                   )}
                                 </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-1.5 px-3 text-right whitespace-nowrap align-top">
                          <span className="font-semibold text-slate-800 text-xs">{item.totalMeters.toFixed(2)} M</span>
                          <span className="text-slate-400 ml-1 text-[10px]">/ {item.totalRolls} Roll</span>
                        </td>
                        <td className="py-1.5 px-3 text-right font-semibold text-slate-600 text-xs align-top">
                          {new Intl.NumberFormat('id-ID').format(parseFloat(item.pricePerMeter as string || item.pricePerUnit as string || "0"))}
                        </td>
                        <td className="py-1.5 px-3 text-right font-black text-slate-900 text-xs align-top">
                          {new Intl.NumberFormat('id-ID').format(item.totalSubtotal)}
                        </td>
                        {saleId && (
                          <td className="no-print text-center px-2"></td>
                        )}
                      </tr>
                      {item.allReturns && item.allReturns.length > 0 && item.allReturns.map((ret: any, retIdx: number) => {
                        const diff = parseFloat(ret.differenceAmount || "0");
                        const pStatus = ret.paymentStatus === 'lunas' ? 'LUNAS' : ret.paymentStatus === 'tempo' ? 'MASUK PIUTANG' : '';
                        const statusTxt = pStatus ? ` [${pStatus}]` : '';
                        let diffText = "TIDAK ADA PENAMBAHAN HARGA";
                        let diffClass = "text-slate-500";
                        if (diff > 0) {
                          diffText = `KURANG PEMBAYARAN${statusTxt}: RP ${new Intl.NumberFormat('id-ID').format(diff)}`;
                          diffClass = "text-rose-600";
                        } else if (diff < 0) {
                          diffText = `KEMBALIAN / REFUND${statusTxt}: RP ${new Intl.NumberFormat('id-ID').format(Math.abs(diff))}`;
                          diffClass = "text-emerald-600";
                        }

                        return (
                          <React.Fragment key={`ret_${index}_${retIdx}`}>
                            {ret.exchangedItems && ret.exchangedItems.length > 0 ? ret.exchangedItems.map((exc: any, excIdx: number) => (
                              <tr key={`exc_${index}_${retIdx}_${excIdx}`} className="bg-green-50/30 border-b border-slate-100 last:border-0">
                                <td className="py-1 px-3"></td>
                                <td className="py-1 px-3">
                                  <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <CornerDownRight className="w-3 h-3 text-green-500" />
                                      <Badge variant="outline" className="text-[8px] py-0 px-1 h-3 border-green-200 text-green-700 bg-green-50 uppercase">TUKAR</Badge>
                                    </div>
                                    <span className="font-bold text-slate-700 text-xs ml-4">{exc.productName?.toUpperCase()}</span>
                                  </div>
                                </td>
                                <td className="py-1 px-3 text-right whitespace-nowrap">
                                  <span className="font-semibold text-slate-700 text-xs">{parseFloat(exc.meters || "0").toFixed(2)} M</span>
                                  <span className="text-slate-400 ml-1 text-[10px]">/ {exc.rolls} Roll</span>
                                </td>
                                <td className="py-1 px-3 text-right font-semibold text-slate-600 text-xs">
                                  {new Intl.NumberFormat('id-ID').format(parseFloat(exc.pricePerMeter as string || "0"))}
                                </td>
                                <td className="py-1 px-3 text-right font-black text-slate-800 text-xs">
                                  {new Intl.NumberFormat('id-ID').format(parseFloat(exc.subtotal as string || "0"))}
                                </td>
                                {saleId && <td className="no-print"></td>}
                              </tr>
                            )) : (
                              <tr key={`exc_none_${index}_${retIdx}`} className="bg-amber-50/30 border-b border-slate-100 last:border-0">
                                <td className="py-1 px-3"></td>
                                <td colSpan={saleId ? 5 : 4} className="py-1 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <CornerDownRight className="w-3 h-3 text-amber-500" />
                                    <Badge variant="outline" className="text-[8px] py-0 px-1 h-3 border-amber-200 text-amber-700 bg-amber-50 uppercase">HANYA RETUR</Badge>
                                  </div>
                                </td>
                              </tr>
                            )}
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                              <td></td>
                              <td colSpan={saleId ? 5 : 4} className="py-1 px-3 border-l-2 border-indigo-200">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Selisih Tukar:</span>
                                  <span className={`text-[10px] uppercase font-black tracking-wider ${diffClass}`}>{diffText}</span>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                </tbody>
                </table>
              </div>

              <div className="flex justify-between items-start relative z-10 min-w-[700px]">
                <div className="w-[45%]">
                  <div className="bg-linear-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-xl p-5">
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

                <div className="w-[45%] bg-white rounded-xl border border-slate-200 p-0 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Kuantitas Awal</span>
                      <span className="font-bold text-slate-800">{totalYds.toFixed(2)} M / {totalRolls} Roll</span>
                    </div>
                    {uniqueReturns.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60">
                        {uniqueReturns.map((ret: any) => {
                          const diff = parseFloat(ret.differenceAmount || "0");
                          if (diff === 0) return null;
                          const isOwed = diff > 0;
                          const pStatus = ret.paymentStatus === 'lunas' ? '(Lunas)' : ret.paymentStatus === 'tempo' ? '(Masuk Piutang)' : '';
                          return (
                            <div key={`ret_sum_${ret.id}`} className="flex justify-between items-center mt-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                {isOwed ? `Kurang Bayar (Tukar) ${pStatus}` : `Kembalian (Retur) ${pStatus}`}
                              </span>
                              <span className={`text-[10px] font-bold ${isOwed ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {isOwed ? '+' : '-'} Rp {new Intl.NumberFormat('id-ID').format(Math.abs(diff))}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {uniqueReturns.length > 0 ? (
                    <>
                      <div className="p-4 bg-slate-100 text-slate-500 flex justify-between items-center border-b border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Grand Total Awal</span>
                        <span className="font-bold text-sm">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.totalAmount as string || "0"))}</span>
                      </div>
                      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Grand Total Akhir</span>
                        <span className="font-black text-xl tracking-tight">
                          Rp {new Intl.NumberFormat('id-ID').format(
                            parseFloat(displayData.totalAmount as string || "0") + 
                            uniqueReturns.reduce((sum, ret) => sum + parseFloat(ret.differenceAmount || "0"), 0)
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Grand Total Awal</span>
                      <span className="font-black text-xl tracking-tight">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.totalAmount as string || "0"))}</span>
                    </div>
                  )}
                  
                  <div className="p-4 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500 font-medium text-xs">Di Bayar Awal</span>
                      <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.paidAmount as string || "0"))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium text-xs">Sisa Bayar Awal</span>
                      <span className="font-bold text-rose-600">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(displayData.remainingAmount as string || "0"))}</span>
                    </div>
                    
                    {uniqueReturns.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Penyesuaian</span>
                          <span className="font-bold text-xs">
                            {(() => {
                              const totalAdjust = uniqueReturns.reduce((sum, ret) => {
                                const diff = parseFloat(ret.differenceAmount || "0");
                                if (ret.paymentStatus === 'lunas') return sum + diff;
                                return sum;
                              }, 0);
                              return totalAdjust > 0 
                                ? `+ Rp ${new Intl.NumberFormat('id-ID').format(totalAdjust)}`
                                : totalAdjust < 0 
                                  ? `- Rp ${new Intl.NumberFormat('id-ID').format(Math.abs(totalAdjust))}`
                                  : 'Rp 0';
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-16 mt-12 pr-4 min-w-[700px]">
                <div className="text-center w-48 flex flex-col items-center">
                  <p className="text-slate-500 text-xs mb-16 font-medium">Tanda Terima,</p>
                  <div className="border-b border-slate-400 w-full"></div>
                  <p className="text-slate-500 text-[11px] mt-2 uppercase">Pelanggan</p>
                </div>
                <div className="text-center w-48 flex flex-col items-center">
                  <p className="text-slate-500 text-xs mb-16 font-medium">Hormat Kami,</p>
                  <div className="border-b border-slate-400 w-full"></div>
                  <p className="text-slate-900 font-bold text-xs mt-2 uppercase">{appName}</p>
                  <p className="text-slate-600 font-semibold text-[7px] mt-0.5 uppercase tracking-tight">PT. Spectra Jaya Fashion</p>
                </div>
              </div>
            </div>
            )}
          </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Exchange / Retur Dialog */}
      <Dialog open={exchangeOpen} onOpenChange={setExchangeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tukar Barang (Retur)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex flex-col gap-1">
              <span className="text-xs font-semibold text-orange-800 uppercase tracking-wider">Barang yang dikembalikan</span>
              <span className="font-bold text-sm">{itemToExchange?.productName}</span>
              <span className="text-xs text-orange-700">
                {parseFloat(itemToExchange?.meters || 0)} M / {parseFloat(itemToExchange?.rolls || 0)} Roll (Rp {new Intl.NumberFormat('id-ID').format(parseFloat(itemToExchange?.pricePerMeter || itemToExchange?.pricePerUnit || 0))})
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Barang Pengganti</label>
              <Select value={replacementProductId} onValueChange={(val: string) => {
                setReplacementProductId(val);
                setReplacementRollId("none");
                const prod = products?.find(p => p.id === parseInt(val));
                if (prod) setReplacementPrice(parseFloat(String(prod.pricePerMeter)));
              }}>
                <SelectTrigger><SelectValue placeholder="Pilih barang..." /></SelectTrigger>
                <SelectContent className="z-[400]">
                  <SelectGroup className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 2xl:grid-cols-16 gap-3 p-2">
                    {products?.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()} className="border shadow-sm hover:border-primary/50 py-3 h-auto text-sm justify-center text-center">
                        <span className="font-semibold truncate w-full" title={p.name}>{p.name}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Roll (Opsional)</label>
              <Select value={replacementRollId} onValueChange={(val: string) => {
                setReplacementRollId(val);
                if (val !== "none") {
                  const roll = availableRolls.find(r => r.id === parseInt(val.replace("r_", "")));
                  if (roll) {
                    setReplacementMeters(parseFloat(String(roll.currentLength)));
                    setReplacementRolls(1);
                  }
                }
              }} disabled={!replacementProductId || availableRolls.length === 0}>
                <SelectTrigger><SelectValue placeholder="Bebas Meteran" /></SelectTrigger>
                <SelectContent className="z-[400]">
                  <SelectItem value="none" className="border shadow-sm hover:border-primary/50 mb-2 w-full text-base justify-center">Bebas Meteran</SelectItem>
                  {availableRolls.length > 0 && (
                    <SelectGroup className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-3 p-2">
                      {availableRolls.map(r => (
                        <SelectItem key={`r_${r.id}`} value={`r_${r.id}`} className="border shadow-sm hover:border-primary/50 py-2.5 h-auto justify-center text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-semibold text-base">{r.currentLength}m</span>
                            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{r.barcode}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Jml Meter</label>
                <Input type="number" step="any" value={replacementMeters} onChange={e => setReplacementMeters(e.target.value === "" ? "" : parseFloat(e.target.value))} disabled={!!replacementRollId && replacementRollId !== "none"} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jml Roll</label>
                <Input type="number" step="any" value={replacementRolls} onChange={e => setReplacementRolls(e.target.value === "" ? "" : parseFloat(e.target.value))} disabled={!!replacementRollId && replacementRollId !== "none"} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Harga/Meter Pengganti</label>
              <Input type="number" step="any" value={replacementPrice} onChange={e => setReplacementPrice(e.target.value === "" ? "" : parseFloat(e.target.value))} />
            </div>

          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setExchangeOpen(false)}>Batal</Button>
            <Button onClick={handleExchangeSubmit} disabled={createReturnMutation.isPending || !replacementProductId || !replacementMeters}>
              {createReturnMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Retur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

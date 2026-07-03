import { useParams } from "wouter";
import { useGetSale, getGetSaleQueryKey } from "@workspace/api-client-react";
import { useSettings } from "@/hooks/useSettings";
import { useEffect } from "react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function PrintInvoice() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  
  const { data: sale, isLoading } = useGetSale(id, {
    query: { queryKey: getGetSaleQueryKey(id), enabled: !!id }
  });
  
  const { data: settings } = useSettings();
  const appName = settings?.["app_name"] || "ENKA TEXTILE";
  const appAddress = settings?.["app_address"] || "Jl. Raya Jrebengkembang, Kedolon Gang Griya Azzahra, Karangdadap Kab. Pekalongan";

  useEffect(() => {
    if (sale) {
      // Auto print after a short delay to ensure rendering
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [sale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin" />
        <span className="ml-2">Memuat nota...</span>
      </div>
    );
  }

  if (!sale) return <div className="p-8">Nota tidak ditemukan</div>;

  const totalYds = sale.items?.reduce((sum: number, item: any) => sum + parseFloat(item.meters || 0), 0) || 0;
  const totalRolls = sale.items?.reduce((sum: number, item: any) => sum + parseFloat(item.rolls || 0), 0) || 0;

  return (
    <div className="bg-white text-black min-h-screen p-4 md:p-8" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Hide this wrapper on print if needed, but we want the background white */}
      <style>{`
        @media print {
          body { background: white; margin: 0; padding: 0; }
          @page { margin: 0.5cm; }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto text-[13px] leading-tight">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="w-[30%] text-center">
            <h1 className="font-bold text-[15px]">{appName}</h1>
            <p className="whitespace-pre-line">{appAddress.replace(/, /g, ",\n")}</p>
          </div>
          
          <div className="w-[30%] text-center">
            <h2 className="font-bold text-[15px] underline underline-offset-2">NOTA PENJUALAN</h2>
            <p className="mt-1">No. {sale.invoiceNumber}</p>
          </div>
          
          <div className="w-[30%] text-center">
            <p>Pekalongan, {formatDate(sale.createdAt || new Date().toISOString())}</p>
            <p className="mt-1">KEPADA YTH</p>
            <p className="font-bold">{sale.customerName || "UMUM"}</p>
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
            {sale.items?.map((item: any, index: number) => (
              <tr key={index} className="align-top">
                <td className="py-1 text-left">{index + 1}</td>
                <td className="py-1 text-left">
                  {item.productName?.toUpperCase()}
                </td>
                <td className="py-1 text-right whitespace-nowrap">
                  {parseFloat(item.meters).toFixed(2)} M / {item.rolls} ROLL
                </td>
                <td className="py-1 text-right">
                  {new Intl.NumberFormat('id-ID').format(item.pricePerMeter)}
                </td>
                <td className="py-1 text-right">
                  {new Intl.NumberFormat('id-ID').format(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-black">
              <td colSpan={2} className="py-2"></td>
              <td className="py-2 text-right font-semibold">
                {totalYds.toFixed(2)} M / {totalRolls} ROLL
              </td>
              <td className="py-2 text-right">Grand Total</td>
              <td className="py-2 text-right font-semibold">{new Intl.NumberFormat('id-ID').format(sale.totalAmount)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="py-1"></td>
              <td className="py-1 text-right">Di Bayar</td>
              <td className="py-1 text-right">{new Intl.NumberFormat('id-ID').format(sale.paidAmount)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="py-1"></td>
              <td className="py-1 text-right">Sisa Bayar</td>
              <td className="py-1 text-right">{new Intl.NumberFormat('id-ID').format(sale.remainingAmount)}</td>
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
    </div>
  );
}

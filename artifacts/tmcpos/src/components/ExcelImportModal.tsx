import React, { useState, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Search,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck,
} from "lucide-react";

export type ImportType = "purchases" | "products" | "categories" | "suppliers" | "customers";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  type: ImportType;
  title: string;
  descriptionNode: React.ReactNode;
  previewUrl: string;
  importUrl: string;
}

export function ExcelImportModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  title,
  descriptionNode,
  previewUrl,
  importUrl,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<"all" | "warning" | "ready" | "skip" | "error">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAll = () => {
    setFile(null);
    setIsLoadingPreview(false);
    setPreviewData(null);
    setPreviewError(null);
    setActiveFilter("all");
    setSearchQuery("");
    setIsImporting(false);
    setImportResult(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewError(null);
    setPreviewData(null);
    setImportResult(null);
    setIsLoadingPreview(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(previewUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membaca file Excel.");
      }

      setPreviewData(data);
    } catch (err: any) {
      setPreviewError(err.message || "Terjadi kesalahan saat memproses preview.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(importUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengimpor file.");
      }

      setImportResult(data);
      onSuccess(data);
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat mengimpor.");
    } finally {
      setIsImporting(false);
    }
  };

  // Filter rows for interactive preview table
  const filteredRows = useMemo(() => {
    if (!previewData?.rows) return [];
    let list = previewData.rows as any[];

    if (activeFilter === "warning") {
      list = list.filter((r) => r.status === "warning");
    } else if (activeFilter === "ready") {
      list = list.filter((r) => r.status === "ready");
    } else if (activeFilter === "skip") {
      list = list.filter((r) => r.status === "skip");
    } else if (activeFilter === "error") {
      list = list.filter((r) => r.status === "error");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const rowStr = [
          r.invoiceNumber,
          r.supplierName,
          r.name,
          r.productName,
          r.categoryName,
          r.barcode,
          ...(r.keterangan || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return rowStr.includes(q);
      });
    }

    return list;
  }, [previewData, activeFilter, searchQuery]);

  const summary = previewData?.summary;
  const countWarning = previewData?.rows?.filter((r: any) => r.status === "warning").length || 0;
  const countReady = previewData?.rows?.filter((r: any) => r.status === "ready").length || 0;
  const countSkip = previewData?.rows?.filter((r: any) => r.status === "skip").length || 0;
  const countError = previewData?.rows?.filter((r: any) => r.status === "error").length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className={`transition-all duration-200 overflow-hidden flex flex-col p-0 gap-0 ${
          previewData ? "max-w-5xl h-[88vh]" : "max-w-xl"
        }`}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">{title}</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  {previewData
                    ? `Periksa data Excel sebelum dimasukkan ke database`
                    : "Pilih file spreadsheet (.xlsx / .xls) untuk memulai"}
                </DialogDescription>
              </div>
            </div>
            {previewData && !importResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreviewData(null);
                  setFile(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Ganti File
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* STEP 4: Hasil Selesai Import */}
          {importResult ? (
            <div className="py-8 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Import Selesai!</h3>
                <p className="text-xs text-slate-500 mt-1">Data dari Excel telah berhasil diproses ke database.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-left shadow-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Berhasil Masuk:</span>
                  <span className="font-bold text-emerald-600">
                    {importResult.success ?? importResult.created ?? 0} data
                  </span>
                </div>
                {importResult.updated !== undefined && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Diperbarui:</span>
                    <span className="font-semibold text-blue-600">{importResult.updated} data</span>
                  </div>
                )}
                {importResult.skipped !== undefined && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Dilewati (Sudah Ada):</span>
                    <span className="font-semibold text-slate-600">{importResult.skipped} data</span>
                  </div>
                )}
                {importResult.failed > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Gagal:</span>
                    <span className="font-semibold text-rose-600">{importResult.failed} data</span>
                  </div>
                )}
              </div>

              <Button onClick={handleClose} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                Selesai & Tutup
              </Button>
            </div>
          ) : previewData ? (
            /* STEP 2: Preview Screen with Detailed Table & KPI */
            <div className="space-y-4">
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div
                  onClick={() => setActiveFilter("all")}
                  className={`cursor-pointer bg-white p-3 rounded-xl border transition-all ${
                    activeFilter === "all"
                      ? "border-violet-500 ring-2 ring-violet-100 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-500">Total Baris Excel</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{summary?.totalRows ?? 0}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Semua data terdeteksi</div>
                </div>

                <div
                  onClick={() => setActiveFilter("ready")}
                  className={`cursor-pointer bg-white p-3 rounded-xl border transition-all ${
                    activeFilter === "ready"
                      ? "border-emerald-500 ring-2 ring-emerald-100 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Siap Diimpor
                  </div>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">{countReady}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Data lengkap & valid</div>
                </div>

                <div
                  onClick={() => setActiveFilter("warning")}
                  className={`cursor-pointer bg-white p-3 rounded-xl border transition-all ${
                    activeFilter === "warning"
                      ? "border-amber-500 ring-2 ring-amber-100 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Perlu Perhatian
                  </div>
                  <div className="text-lg font-bold text-amber-600 mt-0.5">{countWarning}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kategori baru / harga 0</div>
                </div>

                <div
                  onClick={() => setActiveFilter("skip")}
                  className={`cursor-pointer bg-white p-3 rounded-xl border transition-all ${
                    activeFilter === "skip"
                      ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Akan Dilewati
                  </div>
                  <div className="text-lg font-bold text-blue-600 mt-0.5">{countSkip}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Sudah ada di sistem</div>
                </div>
              </div>

              {/* Warning Notice Banner if unknown categories or zero prices exist */}
              {(summary?.unknownCategories > 0 || summary?.zeroPriceItems > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Peringatan Validasi Data Excel:
                  </div>
                  <ul className="list-disc ml-5 space-y-0.5 text-[11px] text-amber-800">
                    {summary?.unknownCategories > 0 && (
                      <li>
                        Terdapat <strong>{summary.unknownCategories} barang</strong> dengan kategori yang belum
                        terdaftar di Master Kategori. Sistem akan otomatis mendaftarkannya dengan harga default Rp 0.
                      </li>
                    )}
                    {summary?.zeroPriceItems > 0 && (
                      <li>
                        Terdapat <strong>{summary.zeroPriceItems} barang</strong> dengan harga beli/jual bernilai{" "}
                        <strong>Rp 0</strong>. Pastikan memeriksa kembali harga sebelum melanjutkan.
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Table Toolbar: Search + Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua ({summary?.totalRows ?? 0})
                  </button>
                  <button
                    onClick={() => setActiveFilter("warning")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeFilter === "warning"
                        ? "bg-amber-100 text-amber-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ⚠️ Peringatan ({countWarning})
                  </button>
                  <button
                    onClick={() => setActiveFilter("ready")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeFilter === "ready"
                        ? "bg-emerald-100 text-emerald-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ✅ Siap ({countReady})
                  </button>
                  {countSkip > 0 && (
                    <button
                      onClick={() => setActiveFilter("skip")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        activeFilter === "skip"
                          ? "bg-blue-100 text-blue-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ℹ️ Dilewati ({countSkip})
                    </button>
                  )}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input
                    placeholder="Cari dalam hasil preview..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-white border-slate-200 rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto max-h-[42vh] divide-y divide-slate-100">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-bold text-slate-600 border-b border-slate-200 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3">Status</th>
                        {type === "purchases" && (
                          <>
                            <th className="py-2.5 px-3">Invoice & Tanggal</th>
                            <th className="py-2.5 px-3">Supplier</th>
                            <th className="py-2.5 px-3">Kategori</th>
                            <th className="py-2.5 px-3">Produk / Barang</th>
                            <th className="py-2.5 px-3 text-right">Stok Roll & Qty</th>
                            <th className="py-2.5 px-3 text-right">Harga / Satuan</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                          </>
                        )}
                        {type === "products" && (
                          <>
                            <th className="py-2.5 px-3">Barang / Produk</th>
                            <th className="py-2.5 px-3">Kategori</th>
                            <th className="py-2.5 px-3">Satuan</th>
                            <th className="py-2.5 px-3 text-right">Stok Roll & Qty</th>
                            <th className="py-2.5 px-3 text-right">Harga Beli</th>
                            <th className="py-2.5 px-3 text-right">Harga Jual</th>
                          </>
                        )}
                        {type === "categories" && (
                          <>
                            <th className="py-2.5 px-3">Nama Kategori</th>
                            <th className="py-2.5 px-3">Satuan Utama / Roll</th>
                            <th className="py-2.5 px-3 text-right">Harga Modal</th>
                            <th className="py-2.5 px-3 text-right">Harga Jual</th>
                          </>
                        )}
                        {type === "suppliers" && (
                          <>
                            <th className="py-2.5 px-3">Nama Supplier</th>
                            <th className="py-2.5 px-3">Kontak Person</th>
                            <th className="py-2.5 px-3">No. Telepon</th>
                            <th className="py-2.5 px-3">Alamat</th>
                          </>
                        )}
                        {type === "customers" && (
                          <>
                            <th className="py-2.5 px-3">Nama Pelanggan</th>
                            <th className="py-2.5 px-3">No. Telepon</th>
                            <th className="py-2.5 px-3">Alamat</th>
                          </>
                        )}
                        <th className="py-2.5 px-3 min-w-[200px]">Keterangan Validasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400">
                            Tidak ada data yang sesuai filter / pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((r, idx) => {
                          const isWarning = r.status === "warning";
                          const isError = r.status === "error";
                          const isSkip = r.status === "skip";

                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                isError
                                  ? "bg-rose-50/30"
                                  : isWarning
                                  ? "bg-amber-50/20"
                                  : isSkip
                                  ? "bg-slate-50/50 opacity-75"
                                  : ""
                              }`}
                            >
                              <td className="py-2 px-3 text-center text-slate-400 font-medium">
                                {r.rowNumber ?? idx + 1}
                              </td>

                              <td className="py-2 px-3 whitespace-nowrap">
                                {isError ? (
                                  <Badge variant="destructive" className="text-[10px] gap-1 py-0.5">
                                    <XCircle className="w-3 h-3" /> Error
                                  </Badge>
                                ) : isSkip ? (
                                  <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 text-[10px] gap-1 py-0.5">
                                    <Info className="w-3 h-3" /> Lewati
                                  </Badge>
                                ) : isWarning ? (
                                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 text-[10px] gap-1 py-0.5">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Periksa
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 text-[10px] gap-1 py-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Siap
                                  </Badge>
                                )}
                              </td>

                              {type === "purchases" && (
                                <>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <div className="font-semibold text-slate-800">{r.invoiceNumber}</div>
                                    <div className="text-[10px] text-slate-400">{r.date}</div>
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span className="font-medium text-slate-700">{r.supplierName}</span>
                                    {r.supplierIsNew && (
                                      <span className="ml-1 text-[9px] bg-blue-50 text-blue-600 border border-blue-200 px-1 py-0.2 rounded">
                                        Baru
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    {r.categoryStatus === "not_found" ? (
                                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                                        {r.categoryName || r.name || "(Kosong)"}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                                        {r.categoryName || r.name}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div>
                                      <span className="font-semibold text-slate-900">{r.productName || r.name}</span>
                                      {r.productExists === false && (
                                        <span className="ml-1.5 text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                                          Barang Baru
                                        </span>
                                      )}
                                      {r.barcode && (
                                        <div className="text-[10px] text-slate-400 font-mono">{r.barcode}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-right whitespace-nowrap">
                                    <div className="font-bold text-slate-800">
                                      {r.meters?.toLocaleString("id-ID") ?? 0}{" "}
                                      <span className="text-[10px] font-normal text-slate-500">{r.unit}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {r.rolls ?? 0} Roll
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-right whitespace-nowrap">
                                    {r.pricePerMeter === 0 ? (
                                      <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                        Rp 0
                                      </span>
                                    ) : (
                                      <span className="font-semibold text-slate-800">
                                        Rp {(r.pricePerMeter ?? 0).toLocaleString("id-ID")}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                                    Rp {(r.subtotal ?? 0).toLocaleString("id-ID")}
                                  </td>
                                </>
                              )}

                              {type === "products" && (
                                <>
                                  <td className="py-2 px-3">
                                    <div>
                                      <span className="font-semibold text-slate-900">{r.name || r.productName}</span>
                                      {r.productExists === false && (
                                        <span className="ml-1.5 text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                                          Barang Baru
                                        </span>
                                      )}
                                      {r.barcode && (
                                        <div className="text-[10px] text-slate-400 font-mono">{r.barcode}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    {r.categoryStatus === "not_found" ? (
                                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                                        {r.categoryName || r.name || "(Kosong)"}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                                        {r.categoryName || r.name}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span className="font-medium text-slate-700">{r.unit}</span>
                                  </td>
                                  <td className="py-2 px-3 text-right whitespace-nowrap">
                                    <div className="font-bold text-slate-800">
                                      {r.meterStock?.toLocaleString("id-ID") ?? 0}{" "}
                                      <span className="text-[10px] font-normal text-slate-500">{r.unit}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {r.rollStock ?? 0} Roll
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-right whitespace-nowrap font-semibold">
                                    Rp {(r.costPrice ?? 0).toLocaleString("id-ID")}
                                  </td>
                                  <td className="py-2 px-3 text-right whitespace-nowrap font-semibold">
                                    Rp {(r.sellPrice ?? 0).toLocaleString("id-ID")}
                                  </td>
                                </>
                              )}

                              {type === "categories" && (
                                <>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span className="font-bold text-slate-900 text-sm">
                                      {r.categoryName || r.name}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span className="font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200">
                                      {r.primaryUnit} / {r.secondaryUnit}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-right whitespace-nowrap font-semibold text-slate-800">
                                    Rp {(r.costPricePerMeter ?? 0).toLocaleString("id-ID")}
                                  </td>
                                  <td className="py-2 px-3 text-right whitespace-nowrap font-semibold text-slate-800">
                                    Rp {(r.pricePerMeter ?? 0).toLocaleString("id-ID")}
                                  </td>
                                </>
                              )}

                              {type === "suppliers" && (
                                <>
                                  <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-900">
                                    {r.name}
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap text-slate-700">
                                    {r.contactPerson || "-"}
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap text-slate-700">
                                    {r.phone || "-"}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500">
                                    {r.address || "-"}
                                  </td>
                                </>
                              )}

                              {type === "customers" && (
                                <>
                                  <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-900">
                                    {r.name}
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap text-slate-700">
                                    {r.phone || "-"}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500">
                                    {r.address || "-"}
                                  </td>
                                </>
                              )}

                              {/* Keterangan */}
                              <td className="py-2 px-3">
                                <div className="space-y-0.5">
                                  {r.keterangan && r.keterangan.length > 0 ? (
                                    r.keterangan.map((k: string, kIdx: number) => {
                                      const isWarn = k.includes("tidak ada") || k.includes("Rp 0") || k.includes("Kategori");
                                      const isSkp = k.includes("dilewati") || k.includes("sudah ada");
                                      return (
                                        <div
                                          key={kIdx}
                                          className={`text-[10px] leading-tight flex items-start gap-1 ${
                                            isWarn
                                              ? "text-amber-700 font-medium"
                                              : isSkp
                                              ? "text-blue-700"
                                              : "text-slate-500"
                                          }`}
                                        >
                                          <span className="shrink-0">•</span>
                                          <span>{k}</span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Data lengkap
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 1: Upload Dropzone & Instructions */
            <div className="space-y-4">
              {descriptionNode}

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isLoadingPreview
                    ? "border-violet-300 bg-violet-50/50 pointer-events-none"
                    : "border-slate-200 hover:border-violet-400 hover:bg-violet-50/30"
                }`}
              >
                {isLoadingPreview ? (
                  <div className="py-6 space-y-3">
                    <span className="w-8 h-8 rounded-full border-3 border-violet-600 border-t-transparent animate-spin inline-block" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Membaca & Memvalidasi File Excel...</p>
                      <p className="text-xs text-slate-400 mt-0.5">Mengecek kecocokan kategori, stok, dan harga</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Pilih atau Tarik File Excel ke Sini</p>
                    <p className="text-xs text-slate-400">Mendukung format .xlsx dan .xls (maks. 10MB)</p>
                    <div className="pt-2">
                      <span className="inline-flex items-center text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors">
                        Pilih File
                      </span>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                    e.target.value = "";
                  }}
                />
              </div>

              {previewError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Gagal memvalidasi file: </span>
                    {previewError}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isImporting} className="rounded-xl">
            {importResult ? "Tutup" : "Batal"}
          </Button>

          {previewData && !importResult && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviewData(null);
                  setFile(null);
                }}
                disabled={isImporting}
                className="rounded-xl text-xs"
              >
                Pilih File Lain
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteImport}
                disabled={isImporting || (countReady === 0 && countWarning === 0)}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
              >
                {isImporting ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                    Sedang Mengimpor...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    Konfirmasi & Mulai Import ({countReady + countWarning} Data)
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

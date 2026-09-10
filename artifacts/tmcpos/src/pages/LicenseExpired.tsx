import { useState } from "react";
import { useLicense } from "@/hooks/useLicense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Key, Loader2, RefreshCw } from "lucide-react";

export default function LicenseExpired() {
  const { activateLicense, expiresAt } = useLicense();
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError("Masukkan License Key terlebih dahulu");
      return;
    }
    setError("");
    setIsLoading(true);
    const result = await activateLicense(licenseKey.trim());
    setIsLoading(false);
    if (!result.ok) {
      setError(result.error || "Gagal mengaktifkan lisensi. Pastikan key benar.");
    } else {
      setSuccess(true);
    }
  };

  const formattedExpiry = expiresAt
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(expiresAt)
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090f] p-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Red top bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-red-600" />

          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Lisensi Habis</h1>
            <p className="text-white/50 text-sm mt-2 leading-relaxed">
              {formattedExpiry
                ? <>Masa aktif berakhir pada <span className="text-white/80 font-medium">{formattedExpiry}</span>.</>
                : "Lisensi Anda tidak aktif."}
              <br />
              Masukkan License Key baru di bawah untuk melanjutkan.
            </p>
          </div>

          {/* Form Input Key */}
          <form onSubmit={handleActivate} className="px-8 pb-8 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest">
                License Key Baru
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  autoFocus
                  type="text"
                  placeholder="VOC-XXXX-YYMMDD-XXXX"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value.toUpperCase());
                    setError("");
                  }}
                  className="pl-9 bg-white/5 border-white/15 text-center text-base tracking-widest font-mono uppercase h-12 text-white placeholder:text-white/20 focus-visible:ring-orange-500 focus-visible:border-orange-500/50"
                />
              </div>
              <p className="text-xs text-white/30 text-center">
                Dapatkan License Key dari Administrator Anda
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/25 rounded-xl flex items-center gap-2 text-green-400 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <p>Berhasil! Memuat ulang aplikasi...</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold text-base rounded-xl transition-all"
              disabled={isLoading || !licenseKey.trim() || success}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "🔑 Aktifkan License Key"
              )}
            </Button>

            {/* WA contact */}
            <button
              type="button"
              onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
              className="w-full text-xs text-white/30 hover:text-white/50 transition-colors py-1"
            >
              Belum punya key? Hubungi Admin via WhatsApp →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useLicense } from "@/hooks/useLicense";
import LicenseActivation from "@/pages/LicenseActivation";
import LicenseExpired from "@/pages/LicenseExpired";
import EmergencyLock from "@/pages/EmergencyLock";
import { Loader2, AlertTriangle, X } from "lucide-react";

// Banner peringatan lisensi akan berakhir (muncul jika sisa <= 7 hari)
function LicenseExpiryBanner({
  daysLeft,
  onClose,
}: {
  daysLeft: number;
  onClose: () => void;
}) {
  if (daysLeft > 7 || daysLeft <= 0) return null;

  const urgency =
    daysLeft <= 2
      ? { bg: "bg-red-600", text: "text-white", icon: "text-white" }
      : daysLeft <= 4
      ? { bg: "bg-orange-500", text: "text-white", icon: "text-white" }
      : { bg: "bg-amber-400", text: "text-amber-950", icon: "text-amber-950" };

  return (
    <div
      className={`w-full ${urgency.bg} px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between shadow-sm shrink-0 z-50 transition-all duration-300`}
    >
      <div
        className={`flex items-center gap-2 ${urgency.text} text-xs sm:text-sm font-semibold min-w-0 pr-2`}
      >
        <AlertTriangle className={`w-4 h-4 shrink-0 ${urgency.icon}`} />
        <p className="truncate sm:whitespace-normal">
          ⚠️ Lisensi akan berakhir dalam{" "}
          <span className="underline font-black">{daysLeft} hari</span>.{" "}
          <span className="hidden xs:inline">Segera hubungi Admin untuk perpanjangan.</span>
        </p>
      </div>
      <button
        onClick={onClose}
        className={`p-1 rounded-md hover:bg-black/10 active:scale-90 transition-all shrink-0 ${urgency.text}`}
        aria-label="Tutup notifikasi"
        title="Tutup pemberitahuan"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function LicenseGate({ children }: { children: React.ReactNode }) {
  const { status, daysLeft, isValid, reason } = useLicense();
  const [dismissed, setDismissed] = useState(() => {
    try {
      const stored = sessionStorage.getItem("license_banner_dismissed_day");
      return stored !== null && parseInt(stored, 10) === daysLeft;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("license_banner_dismissed_day");
      if (stored !== null && parseInt(stored, 10) !== daysLeft) {
        setDismissed(false);
      }
    } catch {}
  }, [daysLeft]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("license_banner_dismissed_day", String(daysLeft));
    } catch {}
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090f]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-violet-400" />
          <p className="text-white/40 text-sm">Memverifikasi lisensi...</p>
        </div>
      </div>
    );
  }

  if (status === "not_activated") {
    return <LicenseActivation />;
  }

  if (status === "expired") {
    return <LicenseExpired />;
  }

  if (status === "locked") {
    return <EmergencyLock reason={reason} />;
  }

  // Fallback pengamanan ekstra: Jika status tidak dikenali tapi lisensi tidak valid, paksa tampilkan aktivasi
  if (!isValid) {
    return <LicenseActivation />;
  }

  const showBanner = !dismissed && daysLeft > 0 && daysLeft <= 7;

  // "active" or "offline_cached" — tampilkan banner jika sisa <= 7 hari tanpa celah saat diclose
  return (
    <div className="h-full w-full flex flex-col min-h-0 overflow-hidden">
      {showBanner && (
        <LicenseExpiryBanner daysLeft={daysLeft} onClose={handleDismiss} />
      )}
      <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

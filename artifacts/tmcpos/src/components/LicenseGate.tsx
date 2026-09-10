import React, { useEffect, useRef } from "react";
import { useLicense } from "@/hooks/useLicense";
import LicenseActivation from "@/pages/LicenseActivation";
import LicenseExpired from "@/pages/LicenseExpired";
import EmergencyLock from "@/pages/EmergencyLock";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

// Banner peringatan lisensi akan berakhir (muncul jika sisa <= 7 hari)
function LicenseExpiryBanner({ daysLeft }: { daysLeft: number }) {
  const [dismissed, setDismissed] = useState(false);
  const shownDayRef = useRef<number | null>(null);

  // Reset dismissed setiap hari (sehingga notifikasi muncul kembali keesokan harinya)
  useEffect(() => {
    if (shownDayRef.current !== daysLeft) {
      setDismissed(false);
      shownDayRef.current = daysLeft;
    }
  }, [daysLeft]);

  if (dismissed || daysLeft > 7 || daysLeft <= 0) return null;

  const urgency = daysLeft <= 2
    ? { bg: "bg-red-600", text: "text-white", icon: "text-white" }
    : daysLeft <= 4
    ? { bg: "bg-orange-500", text: "text-white", icon: "text-white" }
    : { bg: "bg-amber-400", text: "text-amber-900", icon: "text-amber-900" };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${urgency.bg} px-4 py-2.5 flex items-center justify-between shadow-lg`}>
      <div className={`flex items-center gap-2 ${urgency.text}`}>
        <AlertTriangle className={`w-4 h-4 shrink-0 ${urgency.icon}`} />
        <p className="text-sm font-semibold">
          ⚠️ Lisensi akan berakhir dalam{" "}
          <span className="underline font-black">{daysLeft} hari</span>.{" "}
          Segera hubungi Admin untuk perpanjangan.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className={`ml-4 p-1 rounded hover:bg-black/10 transition-colors ${urgency.text}`}
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function LicenseGate({ children }: { children: React.ReactNode }) {
  const { status, daysLeft } = useLicense();

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
    return <EmergencyLock />;
  }

  // "active" or "offline_cached" — tampilkan banner jika sisa <= 7 hari
  return (
    <>
      <LicenseExpiryBanner daysLeft={daysLeft} />
      <div style={daysLeft > 0 && daysLeft <= 7 ? { paddingTop: "42px" } : {}}>
        {children}
      </div>
    </>
  );
}

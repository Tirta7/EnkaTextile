import React from "react";
import { useLicense } from "@/hooks/useLicense";
import LicenseActivation from "@/pages/LicenseActivation";
import LicenseExpired from "@/pages/LicenseExpired";
import EmergencyLock from "@/pages/EmergencyLock";
import { Loader2 } from "lucide-react";

export function LicenseGate({ children }: { children: React.ReactNode }) {
  const { status } = useLicense();

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

  // "active" or "offline_cached"
  return <>{children}</>;
}

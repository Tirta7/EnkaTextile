import { useState, useEffect, useCallback } from "react";

export type LicenseStatus = "checking" | "active" | "expired" | "not_activated" | "offline_cached" | "locked";

interface LicenseData {
  status: LicenseStatus;
  isValid: boolean;
  expiresAt: string | null;
  daysLeft: number;
  storeName?: string;
}

export function useLicense() {
  const [data, setData] = useState<LicenseData>({
    status: "checking",
    isValid: false,
    expiresAt: null,
    daysLeft: 0,
  });

  const checkLicense = useCallback(async () => {
    try {
      const response = await fetch("/api/license/status");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setData(prev => ({ ...prev, status: "not_activated" }));
      }
    } catch (error) {
      setData(prev => ({ ...prev, status: "not_activated" }));
    }
  }, []);

  useEffect(() => {
    checkLicense();
    // Poll every 10 seconds for real-time lock updates
    const interval = setInterval(() => {
      checkLicense();
    }, 10000);
    return () => clearInterval(interval);
  }, [checkLicense]);

  const activateLicense = async (licenseKey: string) => {
    try {
      const response = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey }),
      });
      
      const result = await response.json();
      if (response.ok && result.valid) {
        await checkLicense();
        return { ok: true };
      }
      return { ok: false, error: result.error || "Gagal mengaktifkan lisensi" };
    } catch (error) {
      return { ok: false, error: "Tidak dapat terhubung ke server lisensi" };
    }
  };

  return {
    status: data.status,
    isValid: data.isValid,
    daysLeft: data.daysLeft,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    storeName: data.storeName,
    activateLicense,
    refreshLicense: checkLicense,
  };
}

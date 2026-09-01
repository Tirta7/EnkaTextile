import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Bell, Loader2 } from "lucide-react";

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (token: string) => void;
}

export function OtpDialog({ open, onOpenChange, onSuccess }: OtpDialogProps) {
  const [step, setStep] = useState<"requesting" | "entering">("requesting");
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      requestOtp();
    } else {
      setStep("requesting");
      setOtpInput("");
      setError("");
      setCountdown(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [open]);

  const requestOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/notifications/request-return-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengirim OTP");
        setLoading(false);
        return;
      }
      startCountdown(data.expiresInMinutes);
      setStep("entering");
    } catch {
      setError("Gagal terhubung ke server");
    }
    setLoading(false);
  };

  const startCountdown = (minutes: number) => {
    setCountdown(minutes * 60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setError("OTP Expired, silakan request ulang.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleVerify = async () => {
    if (!otpInput || otpInput.length !== 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/notifications/verify-return-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.error || "Kode OTP tidak valid");
        setLoading(false);
        return;
      }
      onSuccess(data.token);
      onOpenChange(false);
    } catch {
      setError("Gagal terhubung ke server");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-6 pt-6 pb-5 text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Otorisasi Retur Barang</h2>
              <p className="text-violet-200 text-xs">Diperlukan persetujuan owner</p>
            </div>
          </div>
        </div>

        {step === "requesting" ? (
          <div className="px-6 py-6 space-y-4">
            <div className="text-center space-y-2">
              <Bell className="w-10 h-10 mx-auto text-violet-400" />
              <p className="text-sm font-medium text-slate-700">Kirim permintaan otorisasi ke owner</p>
              <p className="text-xs text-slate-500">
                Sistem akan mengirim <strong>kode OTP 6 digit</strong> ke HP/browser owner melalui notifikasi.
                Owner akan memberikan kode tersebut kepada Anda.
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button className="w-full" onClick={requestOtp} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Memproses..." : "Request Ulang OTP"}
            </Button>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-5">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Masukkan 6-digit kode OTP</p>
              <p className="text-xs text-slate-400">Kode telah dikirim ke owner via Push Notifikasi</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Input 
                  type="text" 
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-40 text-center text-3xl font-bold tracking-widest h-14 bg-slate-50 border-slate-200 focus-visible:ring-violet-500 rounded-xl"
                  placeholder="------"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-base font-semibold rounded-xl" onClick={handleVerify} disabled={loading || countdown <= 0}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Verifikasi OTP"}
                </Button>
                
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className={countdown <= 0 ? "text-red-500 font-medium" : "text-slate-500"}>
                    {countdown > 0 ? `Berlaku: ${formatTime(countdown)}` : "OTP Expired"}
                  </span>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-violet-600 hover:text-violet-700 hover:bg-transparent font-semibold" onClick={requestOtp} disabled={loading}>
                    Kirim Ulang OTP
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

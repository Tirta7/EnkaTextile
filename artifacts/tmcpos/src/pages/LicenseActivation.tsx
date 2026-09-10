import { useState, useEffect } from "react";
import { useLicense } from "@/hooks/useLicense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, AlertCircle, Loader2 } from "lucide-react";

export default function LicenseActivation() {
  const { activateLicense } = useLicense();
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [machineId, setMachineId] = useState("");

  useEffect(() => {
    fetch("/api/license/machine-id")
      .then(r => r.json())
      .then(d => setMachineId(d.machineId || ""))
      .catch(console.error);
  }, []);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError("Masukkan License Key");
      return;
    }
    setError("");
    setIsLoading(true);
    
    const result = await activateLicense(licenseKey);
    
    if (!result.ok) {
      setError(result.error || "Gagal mengaktifkan lisensi");
      setIsLoading(false);
    } else {
      // Refresh browser agar LicenseGate mendapatkan status terbaru
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090f]">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-white/5 border-white/10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
        
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <Key className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Aktivasi Lisensi</CardTitle>
            <CardDescription className="text-white/60 mt-2">
              Masukkan License Key Anda untuk menggunakan TMC POS.
            </CardDescription>
            {machineId && (
              <div className="mt-4 p-2 bg-black/20 rounded border border-white/5 inline-block mx-auto text-sm">
                <span className="text-white/40 block text-[10px] uppercase mb-1">Machine ID Anda</span>
                <code className="text-violet-300 font-mono select-all font-semibold">{machineId}</code>
              </div>
            )}
          </div>
        </CardHeader>
        
        <form onSubmit={handleActivate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="VOC-ENKA-202610-A3B7"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="bg-black/20 border-white/10 text-center text-lg tracking-widest font-mono uppercase h-12 text-white placeholder:text-white/20"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pb-8">
            <Button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12"
              disabled={isLoading || !licenseKey}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Aktifkan Aplikasi"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

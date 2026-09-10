import { useState } from "react";
import { useLicense } from "@/hooks/useLicense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Key, Loader2, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function LicenseExpired() {
  const { activateLicense, expiresAt } = useLicense();
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInput, setShowInput] = useState(false);

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
      setError(result.error || "Gagal memperpanjang lisensi");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090f]">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-white/5 border-white/10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Lisensi Habis</CardTitle>
            <CardDescription className="text-white/60 mt-2">
              Masa aktif aplikasi Anda telah berakhir pada <strong className="text-white">{formatDate(expiresAt)}</strong>.
              <br />
              Silakan hubungi administrator untuk memperpanjang lisensi.
            </CardDescription>
          </div>
        </CardHeader>
        
        {!showInput ? (
          <CardContent className="space-y-4 pb-8">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
              onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
            >
              Hubungi Admin via WhatsApp
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white/20 hover:bg-white/10 h-12 text-black"
              onClick={() => setShowInput(true)}
            >
              Masukkan Key Baru <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        ) : (
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
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pb-8 flex gap-3">
              <Button 
                type="button"
                variant="outline"
                className="w-1/3 border-white/20 hover:bg-white/10 h-12 text-black"
                onClick={() => setShowInput(false)}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="w-2/3 bg-orange-600 hover:bg-orange-700 text-white h-12"
                disabled={isLoading || !licenseKey}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Perpanjang Lisensi"
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

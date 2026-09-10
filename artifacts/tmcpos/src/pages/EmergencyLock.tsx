import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmergencyLock() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090f]">
      <div className="absolute inset-0 bg-red-900/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-black/40 border-red-500/20 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
        
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black tracking-tight text-red-500">SYSTEM LOCKED</CardTitle>
            <CardDescription className="text-red-200 mt-2 font-medium">
              Akses aplikasi dihentikan sementara
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pb-10 text-center">
          <p className="text-white/80 leading-relaxed text-sm">
            Sistem mendeteksi status darurat pada lisensi ini. 
            Seluruh fungsi kasir dinonaktifkan untuk mengamankan data dan sistem.
          </p>

          <div className="p-4 bg-red-950/40 rounded-xl border border-red-500/20">
            <p className="text-xs text-red-300 font-mono">
              Silakan hubungi Administrator (Master Pusat) untuk mencabut status darurat ini.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

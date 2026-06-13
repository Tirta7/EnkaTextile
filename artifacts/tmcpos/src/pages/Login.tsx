import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.ok) {
      navigate("/");
    } else {
      setError(result.error ?? "Login gagal");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0d0a1f 0%, #0a0d1e 50%, #07090f 100%)",
      }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
            style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" }}
          >
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">VOCpos</h1>
          <p className="text-white/35 text-xs tracking-[0.18em] uppercase mt-1">Virtual Operational Control</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h2 className="text-white text-xl font-semibold mb-1">Masuk ke Sistem</h2>
          <p className="text-white/40 text-sm mb-7">Masukkan kredensial Anda untuk melanjutkan</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Username
              </Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                className="h-11 text-white placeholder:text-white/25 border-white/10 focus:border-violet-500/60 focus:ring-violet-500/20"
                style={{
                  background: "rgba(255,255,255,0.07)",
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11 pr-10 text-white placeholder:text-white/25 border-white/10 focus:border-violet-500/60 focus:ring-violet-500/20"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-red-300 border border-red-500/20"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-white shadow-lg"
              style={{
                background: loading
                  ? "rgba(139,92,246,0.5)"
                  : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
              }}
            >
              {loading ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Memverifikasi...</>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6">
            Default: <span className="text-white/40 font-mono">admin</span> / <span className="text-white/40 font-mono">vocpos2026</span>
          </p>
        </div>

        <p className="text-center text-white/15 text-xs mt-6">
          &copy; {new Date().getFullYear()} Enka Textile · VOCpos
        </p>
      </div>
    </div>
  );
}

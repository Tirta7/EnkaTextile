import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Kategori from "@/pages/Kategori";
import Barang from "@/pages/Barang";
import Pelanggan from "@/pages/Pelanggan";
import Supplier from "@/pages/Supplier";
import Penjualan from "@/pages/Penjualan";
import Pembelian from "@/pages/Pembelian";
import Mutasi from "@/pages/Mutasi";
import Piutang from "@/pages/Piutang";
import Hutang from "@/pages/Hutang";
import BukuKas from "@/pages/BukuKas";
import Laporan from "@/pages/Laporan";
import Pengaturan from "@/pages/Pengaturan";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0d0a1f 0%, #07090f 100%)" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-violet-400" />
          <p className="text-white/40 text-sm">Memuat sistem...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/kategori" component={Kategori} />
        <Route path="/barang" component={Barang} />
        <Route path="/pelanggan" component={Pelanggan} />
        <Route path="/supplier" component={Supplier} />
        <Route path="/penjualan" component={Penjualan} />
        <Route path="/pembelian" component={Pembelian} />
        <Route path="/mutasi" component={Mutasi} />
        <Route path="/piutang" component={Piutang} />
        <Route path="/hutang" component={Hutang} />
        <Route path="/buku-kas" component={BukuKas} />
        <Route path="/laporan" component={Laporan} />
        <Route path="/pengaturan" component={Pengaturan} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthGate>
            <Router />
          </AuthGate>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

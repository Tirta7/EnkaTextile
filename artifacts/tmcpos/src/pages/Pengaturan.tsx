import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import {
  useListPaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
  getListPaymentMethodsQueryKey,
  useListUnits,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
  getListUnitsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, CreditCard, GripVertical, Settings, Box, BellRing, MonitorSmartphone, Save, Image as ImageIcon, Receipt, Moon, Sun, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerAndSubscribePush } from "../lib/pushNotification";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";

export default function Pengaturan() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { data: methods = [], isLoading } = useListPaymentMethods(
    { query: { queryKey: getListPaymentMethodsQueryKey() } }
  );
  const { data: units = [], isLoading: isLoadingUnits } = useListUnits(
    { query: { queryKey: getListUnitsQueryKey() } }
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; name: string; isActive: boolean; sortOrder: number } | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSortOrder, setNewSortOrder] = useState("99");

  // Unit State
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [editUnitItem, setEditUnitItem] = useState<{ id: number; name: string; symbol: string } | null>(null);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitSymbol, setNewUnitSymbol] = useState("");

  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [appNameInput, setAppNameInput] = useState("");
  const [appAddressInput, setAppAddressInput] = useState("");
  const [appLogoInput, setAppLogoInput] = useState("");
  
  const [invoiceBankNameInput, setInvoiceBankNameInput] = useState("");
  const [invoiceBankAccountInput, setInvoiceBankAccountInput] = useState("");
  const [invoiceNotesInput, setInvoiceNotesInput] = useState("");
  
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (settings && !isInitialized) {
      if (settings["app_name"]) {
        setAppNameInput(settings["app_name"]);
      }
      if (settings["app_address"]) {
        setAppAddressInput(settings["app_address"]);
      }
      if (settings["app_logo"]) {
        setAppLogoInput(settings["app_logo"]);
      }
      if (settings["invoice_bank_name"]) {
        setInvoiceBankNameInput(settings["invoice_bank_name"]);
      }
      if (settings["invoice_bank_account"]) {
        setInvoiceBankAccountInput(settings["invoice_bank_account"]);
      }
      if (settings["invoice_notes"]) {
        setInvoiceNotesInput(settings["invoice_notes"]);
      }
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() });
  const invalidateUnits = () => queryClient.invalidateQueries({ queryKey: getListUnitsQueryKey() });

  const handleEnableNotification = async () => {
    setIsEnablingPush(true);
    try {
      await registerAndSubscribePush();
      toast({ title: "Notifikasi diaktifkan!", description: "Perangkat ini akan menerima notifikasi transaksi." });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsEnablingPush(false);
    }
  };

  const handleSaveSettings = () => {
    if (!appNameInput.trim()) return;
    updateSettingsMutation.mutate(
      { app_name: appNameInput.trim(), app_address: appAddressInput.trim(), app_logo: appLogoInput },
      {
        onSuccess: () => toast({ title: "Pengaturan Utama disimpan!" }),
        onError: (err: any) => toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleSaveInvoiceSettings = () => {
    updateSettingsMutation.mutate(
      { 
        invoice_bank_name: invoiceBankNameInput.trim(), 
        invoice_bank_account: invoiceBankAccountInput.trim(), 
        invoice_notes: invoiceNotesInput.trim() 
      },
      {
        onSuccess: () => toast({ title: "Pengaturan Nota disimpan!" }),
        onError: (err: any) => toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File terlalu besar", description: "Ukuran maksimal 2MB", variant: "destructive" });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        const MAX_SIZE = 512;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL("image/png", 0.9);
        setAppLogoInput(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const createMutation = useCreatePaymentMethod({
    mutation: {
      onSuccess: () => {
        invalidate();
        setIsAddOpen(false);
        setNewCode(""); setNewName(""); setNewSortOrder("99");
        toast({ title: "Metode pembayaran ditambahkan" });
      },
      onError: (err: any) => {
        toast({ title: "Gagal menambahkan", description: err?.message, variant: "destructive" });
      },
    },
  });

  const updateMutation = useUpdatePaymentMethod({
    mutation: {
      onSuccess: () => {
        invalidate();
        setEditItem(null);
        toast({ title: "Metode pembayaran diperbarui" });
      },
    },
  });

  const deleteMutation = useDeletePaymentMethod({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Metode pembayaran dihapus" });
      },
    },
  });

  const handleAdd = () => {
    if (!newCode.trim() || !newName.trim()) return;
    createMutation.mutate({
      data: { code: newCode.trim(), name: newName.trim(), isActive: true, sortOrder: parseInt(newSortOrder) || 99 },
    });
  };

  const handleToggleActive = (item: typeof methods[0]) => {
    updateMutation.mutate({ id: item.id, data: { isActive: !item.isActive } });
  };

  const handleEditSave = () => {
    if (!editItem) return;
    updateMutation.mutate({
      id: editItem.id,
      data: { name: editItem.name, isActive: editItem.isActive, sortOrder: editItem.sortOrder },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Hapus metode pembayaran ini?")) return;
    deleteMutation.mutate({ id });
  };

  // Unit Mutations
  const createUnitMutation = useCreateUnit({
    mutation: {
      onSuccess: () => {
        invalidateUnits();
        setIsAddUnitOpen(false);
        setNewUnitName(""); setNewUnitSymbol("");
        toast({ title: "Satuan ditambahkan" });
      },
      onError: (err: any) => {
        toast({ title: "Gagal menambahkan satuan", description: err?.message, variant: "destructive" });
      },
    },
  });

  const updateUnitMutation = useUpdateUnit({
    mutation: {
      onSuccess: () => {
        invalidateUnits();
        setEditUnitItem(null);
        toast({ title: "Satuan diperbarui" });
      },
    },
  });

  const deleteUnitMutation = useDeleteUnit({
    mutation: {
      onSuccess: () => {
        invalidateUnits();
        toast({ title: "Satuan dihapus" });
      },
    },
  });

  const handleAddUnit = () => {
    if (!newUnitName.trim() || !newUnitSymbol.trim()) return;
    createUnitMutation.mutate({
      data: { name: newUnitName.trim(), symbol: newUnitSymbol.trim() },
    });
  };

  const handleEditUnitSave = () => {
    if (!editUnitItem) return;
    updateUnitMutation.mutate({
      id: editUnitItem.id,
      data: { name: editUnitItem.name, symbol: editUnitItem.symbol },
    });
  };

  const handleDeleteUnit = (id: number) => {
    if (!confirm("Hapus satuan ini? Satuan yang sedang digunakan mungkin akan mengalami error pada tampilan.")) return;
    deleteUnitMutation.mutate({ id });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" }}
        >
          <Settings size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">Konfigurasi sistem VOCpos</p>
        </div>
      </div>

      {/* App Appearance Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette size={16} className="text-violet-500" />
            Tampilan Aplikasi
          </CardTitle>
          <CardDescription className="mt-1">
            Sesuaikan mode warna aplikasi sesuai dengan kenyamanan mata Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-background border shadow-sm">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Mode Gelap (Dark Mode)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {theme === "dark" ? "Mode gelap sedang aktif" : "Gunakan mode gelap untuk malam hari"}
                </p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* General Settings Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MonitorSmartphone size={16} className="text-violet-500" />
            Pengaturan Utama
          </CardTitle>
          <CardDescription className="mt-1">
            Ubah nama aplikasi yang akan ditampilkan di layar dan notifikasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="space-y-1.5 w-full sm:max-w-sm">
              <Label>Nama Aplikasi</Label>
              <Input 
                value={appNameInput} 
                onChange={(e) => setAppNameInput(e.target.value)} 
                placeholder="mis: Enka Textile POS" 
                disabled={isLoadingSettings}
              />
            </div>
            
            <div className="space-y-1.5 w-full sm:max-w-sm">
              <Label>Alamat Toko</Label>
              <Input 
                value={appAddressInput} 
                onChange={(e) => setAppAddressInput(e.target.value)} 
                placeholder="mis: Jl. Jend. Sudirman No. 1" 
                disabled={isLoadingSettings}
              />
            </div>
            
            <div className="space-y-1.5 w-full sm:w-auto">
              <Label>Logo Aplikasi (Opsional)</Label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden shrink-0">
                  {appLogoInput ? (
                    <img src={appLogoInput} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={16} className="text-muted-foreground" />
                  )}
                </div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="h-10 px-3 border rounded-md hover:bg-muted/50 transition-colors flex items-center text-sm">
                    Pilih Gambar
                  </div>
                </Label>
                <input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                  disabled={isLoadingSettings}
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveSettings}
              disabled={isLoadingSettings || updateSettingsMutation.isPending || !appNameInput.trim()}
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <Save size={16} />
              {updateSettingsMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Settings Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt size={16} className="text-violet-500" />
            Pengaturan Nota / Invoice
          </CardTitle>
          <CardDescription className="mt-1">
            Ubah detail informasi bank dan keterangan tambahan yang dicetak pada nota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="space-y-1.5 w-full sm:max-w-[200px]">
              <Label>Nama Rekening</Label>
              <Input 
                value={invoiceBankNameInput} 
                onChange={(e) => setInvoiceBankNameInput(e.target.value)} 
                placeholder="mis: A.n PT XYZ" 
                disabled={isLoadingSettings}
              />
            </div>
            
            <div className="space-y-1.5 w-full sm:max-w-[200px]">
              <Label>Nomor Rekening</Label>
              <Input 
                value={invoiceBankAccountInput} 
                onChange={(e) => setInvoiceBankAccountInput(e.target.value)} 
                placeholder="mis: BCA - 12345" 
                disabled={isLoadingSettings}
              />
            </div>
            
            <div className="space-y-1.5 w-full">
              <Label>Keterangan / Pesan Tambahan</Label>
              <Input 
                value={invoiceNotesInput} 
                onChange={(e) => setInvoiceNotesInput(e.target.value)} 
                placeholder="mis: Barang yang dibeli tidak dapat ditukar" 
                disabled={isLoadingSettings}
              />
            </div>

            <Button 
              onClick={handleSaveInvoiceSettings}
              disabled={isLoadingSettings || updateSettingsMutation.isPending}
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              className="w-full sm:w-auto flex items-center gap-2 shrink-0"
            >
              <Save size={16} />
              {updateSettingsMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellRing size={16} className="text-violet-500" />
            Notifikasi Transaksi
          </CardTitle>
          <CardDescription className="mt-1">
            Aktifkan fitur ini agar perangkat Anda menerima Push Notification seketika dari sistem setiap kali ada penjualan baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleEnableNotification} 
            disabled={isEnablingPush}
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
          >
            {isEnablingPush ? "Memproses..." : "Aktifkan Perangkat Ini"}
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard size={16} className="text-violet-500" />
                Metode Pembayaran
              </CardTitle>
              <CardDescription className="mt-1">
                Kelola metode pembayaran yang tersedia di transaksi penjualan dan pembelian
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={14} />
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 pl-6"></TableHead>
                <TableHead className="pl-2">Nama</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead className="w-24 text-center">Urutan</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-28 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : methods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Belum ada metode pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                methods.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-6">
                      <GripVertical size={14} className="text-muted-foreground/40" />
                    </TableCell>
                    <TableCell className="pl-2 font-medium">{m.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{m.code}</code>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">{m.sortOrder}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={m.isActive}
                        onCheckedChange={() => handleToggleActive(m)}
                        className="scale-90"
                      />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditItem({ id: m.id, name: m.name, isActive: m.isActive, sortOrder: m.sortOrder })}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Units Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Box size={16} className="text-violet-500" />
                Satuan Barang
              </CardTitle>
              <CardDescription className="mt-1">
                Kelola jenis satuan utama dan tambahan untuk data barang
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              onClick={() => setIsAddUnitOpen(true)}
            >
              <Plus size={14} />
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 pl-6"></TableHead>
                <TableHead>Nama Satuan</TableHead>
                <TableHead>Simbol</TableHead>
                <TableHead className="w-28 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUnits ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Belum ada satuan
                  </TableCell>
                </TableRow>
              ) : (
                units.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="pl-6">
                      <GripVertical size={14} className="text-muted-foreground/40" />
                    </TableCell>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.symbol}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditUnitItem({ id: u.id, name: u.name, symbol: u.symbol })}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteUnit(u.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-sm px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader>
            <DrawerTitle>Tambah Metode Pembayaran</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kode <span className="text-muted-foreground text-xs">(unik, otomatis lowercase)</span></Label>
              <Input
                placeholder="mis: gopay, ovo, dana"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Tampil</Label>
              <Input
                placeholder="mis: GoPay / OVO / DANA"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Urutan <span className="text-muted-foreground text-xs">(angka lebih kecil tampil lebih atas)</span></Label>
              <Input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(e.target.value)}
              />
            </div>
          </div>
          <DrawerFooter className="px-0 pt-4 flex-row gap-2">
            <Button variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={!newCode.trim() || !newName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Dialog */}
      <Drawer open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-sm px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader>
            <DrawerTitle>Edit Metode Pembayaran</DrawerTitle>
          </DrawerHeader>
          {editItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Nama Tampil</Label>
                <Input
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={editItem.sortOrder}
                  onChange={(e) => setEditItem({ ...editItem, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editItem.isActive}
                  onCheckedChange={(v) => setEditItem({ ...editItem, isActive: v })}
                />
                <Label>{editItem.isActive ? "Aktif" : "Nonaktif"}</Label>
              </div>
            </div>
          )}
          <DrawerFooter className="px-0 pt-4 flex-row gap-2">
            <Button variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => setEditItem(null)}>Batal</Button>
            <Button className="w-full" onClick={handleEditSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Add Unit Dialog */}
      <Drawer open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-sm px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader>
            <DrawerTitle>Tambah Satuan</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama Satuan</Label>
              <Input
                placeholder="mis: METER, YARD, KILOGRAM"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Simbol</Label>
              <Input
                placeholder="mis: m, yds, kg"
                value={newUnitSymbol}
                onChange={(e) => setNewUnitSymbol(e.target.value)}
              />
            </div>
          </div>
          <DrawerFooter className="px-0 pt-4 flex-row gap-2">
            <Button variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => setIsAddUnitOpen(false)}>Batal</Button>
            <Button
              className="w-full"
              onClick={handleAddUnit}
              disabled={!newUnitName.trim() || !newUnitSymbol.trim() || createUnitMutation.isPending}
            >
              {createUnitMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Unit Dialog */}
      <Drawer open={!!editUnitItem} onOpenChange={() => setEditUnitItem(null)}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-sm px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader>
            <DrawerTitle>Edit Satuan</DrawerTitle>
          </DrawerHeader>
          {editUnitItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Nama Satuan</Label>
                <Input
                  value={editUnitItem.name}
                  onChange={(e) => setEditUnitItem({ ...editUnitItem, name: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Simbol</Label>
                <Input
                  value={editUnitItem.symbol}
                  onChange={(e) => setEditUnitItem({ ...editUnitItem, symbol: e.target.value })}
                />
              </div>
            </div>
          )}
          <DrawerFooter className="px-0 pt-4 flex-row gap-2">
            <Button variant="ghost" className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => setEditUnitItem(null)}>Batal</Button>
            <Button className="w-full" onClick={handleEditUnitSave} disabled={updateUnitMutation.isPending}>
              {updateUnitMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PaginationControl } from "../components/PaginationControl";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, User as UserIcon, Shield, ShieldCheck, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal('')),
  fullName: z.string().min(2, "Nama lengkap wajib diisi"),
  role: z.enum(["admin", "kasir"]),
});

type FormData = z.infer<typeof schema>;

export default function Karyawan() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const createMutation = useCreateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setIsCreateOpen(false);
        toast({ title: "Karyawan berhasil ditambahkan" });
      },
      onError: (err: any) => {
        toast({ title: "Gagal menambahkan karyawan", description: err.response?.data?.error, variant: "destructive" });
      }
    }
  });

  const updateMutation = useUpdateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setEditingUser(null);
        toast({ title: "Karyawan berhasil diperbarui" });
      },
      onError: (err: any) => {
        toast({ title: "Gagal memperbarui karyawan", description: err.response?.data?.error, variant: "destructive" });
      }
    }
  });

  const deleteMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "Karyawan berhasil dihapus" });
      },
      onError: (err: any) => {
        toast({ title: "Gagal menghapus karyawan", description: err.response?.data?.error, variant: "destructive" });
      }
    }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", fullName: "", role: "kasir" }
  });

  const onSubmit = (data: FormData) => {
    // For creation, password is required
    if (!editingUser && !data.password) {
      form.setError("password", { message: "Password wajib diisi untuk pengguna baru" });
      return;
    }

    const payload = {
      ...data,
      password: data.password || undefined,
    };

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: payload as any });
    } else {
      createMutation.mutate({ data: payload as any });
    }
  };

  const openCreate = () => {
    form.reset({ username: "", password: "", fullName: "", role: "kasir" });
    setIsCreateOpen(true);
  };

  const openEdit = (user: User) => {
    form.reset({ username: user.username, password: "", fullName: user.fullName, role: user.role as any });
    setEditingUser(user);
  };

  const filteredUsers = users?.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 max-w-[800px] mx-auto pb-4">
      {/* Mobile-optimized Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Karyawan</h1>
          <p className="text-sm text-slate-500">Kelola akses akun dan role</p>
        </div>
        <Button onClick={openCreate} className="rounded-full shadow-sm bg-violet-600 hover:bg-violet-700">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari nama atau username..." 
            className="pl-9 bg-white border-slate-200 rounded-full h-10 shadow-sm focus-visible:ring-violet-500" 
            value={search} 
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
          />
        </div>
      </div>

      {/* Activity Feed List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : filteredUsers?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <UserIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada karyawan</h3>
            <p className="text-sm text-slate-500 mt-1">Belum ada data karyawan yang ditambahkan.</p>
          </div>
        ) : (
          <>
            {filteredUsers?.slice((currentPage - 1) * 20, currentPage * 20).map((u) => {
              const isAdmin = u.role === 'admin';
              const isCurrentUser = u.id === currentUser?.id;
              
              return (
                <div key={u.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3 relative overflow-hidden">
                  {/* Current User Highlight */}
                  {isCurrentUser && (
                    <div className="absolute top-0 right-0 bg-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                      ANDA
                    </div>
                  )}
                  
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      @{u.username}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="flex gap-3">
                    <div className={`w-[60px] h-[60px] rounded-2xl shrink-0 flex items-center justify-center border ${isAdmin ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      {isAdmin ? (
                        <ShieldCheck className={`w-8 h-8 text-amber-500`} strokeWidth={1.5} />
                      ) : (
                        <UserIcon className={`w-8 h-8 text-emerald-500`} strokeWidth={1.5} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-slate-900 text-[15px] truncate leading-tight">
                        {u.fullName}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isAdmin ? 'Admin' : 'Kasir'}
                        </span>
                      </div>
                      
                      <p className="text-[12px] text-slate-400 mt-2 truncate font-medium">
                        Bergabung: {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="flex items-start justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(u)} className="gap-2 cursor-pointer">
                            <Pencil className="h-4 w-4 text-slate-500" /> Edit
                          </DropdownMenuItem>
                          {!isCurrentUser && (
                            <DropdownMenuItem 
                              className="gap-2 text-red-600 focus:text-red-700 cursor-pointer"
                              onClick={() => { if (confirm('Hapus karyawan ini?')) deleteMutation.mutate({ id: u.id }); }}
                            >
                              <Trash2 className="h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        {filteredUsers && filteredUsers.length > 20 && (
          <div className="pt-4 flex justify-center pb-8">
            <PaginationControl currentPage={currentPage} totalPages={Math.ceil(filteredUsers.length / 20)} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <Drawer open={isCreateOpen || !!editingUser} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingUser(null);
        }
      }}>
        <DrawerContent className="max-h-[90vh] mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 pt-2">
          <DrawerHeader>
            <DrawerTitle>{editingUser ? 'Edit Karyawan' : 'Tambah Karyawan'}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-4 sm:px-2 -mx-4 sm:mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Budi Santoso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Untuk login" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password {editingUser && <span className="text-muted-foreground font-normal">(Kosongkan jika tidak ingin mengubah)</span>}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role (Hak Akses)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kasir">Kasir (Transaksi Saja)</SelectItem>
                        <SelectItem value="admin">Admin (Akses Penuh)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DrawerFooter className="px-0 pt-4 flex-row gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => { setIsCreateOpen(false); setEditingUser(null); }}>
                  Batal
                </Button>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  Simpan
                </Button>
              </DrawerFooter>
            </form>
          </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

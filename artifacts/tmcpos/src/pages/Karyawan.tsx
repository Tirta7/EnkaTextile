import { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Karyawan</h1>
          <p className="text-muted-foreground mt-1">Kelola akses akun dan role karyawan.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Daftar Karyawan</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama/username..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead className="text-right w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Tidak ada karyawan ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <UserIcon size={14} className="text-muted-foreground" />
                      </div>
                      {u.fullName} {u.id === currentUser?.id && <span className="text-xs text-muted-foreground">(Anda)</span>}
                    </TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Kasir'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={u.id === currentUser?.id} onClick={() => {
                          if (confirm('Hapus karyawan ini?')) deleteMutation.mutate({ id: u.id });
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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
              <DrawerFooter className="px-0 pt-4">
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

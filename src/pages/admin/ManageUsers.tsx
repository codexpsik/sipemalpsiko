import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Filter,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  user_id: string;
  nama: string;
  nim: string | null;
  email?: string;
  nomor_whatsapp: string;
  jenis_kelamin: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState<{
    nama: string;
    nim: string;
    email: string;
    nomor_whatsapp: string;
    jenis_kelamin: string;
    role: 'dosen' | 'mahasiswa' | 'admin';
    password: string;
  }>({
    nama: "",
    nim: "",
    email: "",
    nomor_whatsapp: "",
    jenis_kelamin: "",
    role: "mahasiswa",
    password: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Get auth users emails
      const usersWithEmails = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
          return {
            ...profile,
            email: authUser.user?.email || ""
          };
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.nim && user.nim.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    if (!newUser.nama || !newUser.nim || !newUser.email || !newUser.password) {
      toast({
        title: "Validasi Error",
        description: "Mohon lengkapi semua field yang wajib diisi!",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: authData.user.id,
          username: newUser.email.split('@')[0],
          nama: newUser.nama,
          nim: newUser.nim,
          nomor_whatsapp: newUser.nomor_whatsapp,
          jenis_kelamin: newUser.jenis_kelamin as "laki-laki" | "perempuan",
          role: newUser.role as "admin" | "dosen" | "mahasiswa"
        }]);

      if (profileError) throw profileError;

      toast({
        title: "Berhasil",
        description: "User berhasil ditambahkan",
      });

      setNewUser({ nama: "", nim: "", email: "", nomor_whatsapp: "", jenis_kelamin: "", role: "mahasiswa", password: "" });
      setIsAddDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nama: selectedUser.nama,
          nim: selectedUser.nim,
          nomor_whatsapp: selectedUser.nomor_whatsapp,
          jenis_kelamin: selectedUser.jenis_kelamin as "laki-laki" | "perempuan",
          role: selectedUser.role as "admin" | "dosen" | "mahasiswa"
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "User berhasil diperbarui",
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, authUserId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        // Delete profile first
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileError) throw profileError;

        // Delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(authUserId);
        if (authError) throw authError;

        toast({
          title: "Berhasil",
          description: "User berhasil dihapus",
        });

        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Gagal menghapus user",
          variant: "destructive",
        });
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge>;
      case 'dosen':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Dosen</Badge>;
      case 'mahasiswa':
        return <Badge variant="secondary">Mahasiswa</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getJenisKelaminDisplay = (jenis_kelamin: string) => {
    switch (jenis_kelamin) {
      case 'laki_laki':
        return 'Laki-laki';
      case 'perempuan':
        return 'Perempuan';
      default:
        return jenis_kelamin;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat data user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Manajemen User
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola data dosen dan mahasiswa yang terdaftar
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah User Baru</DialogTitle>
                <DialogDescription>
                  Isi form di bawah untuk menambahkan user baru
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input
                    id="nama"
                    value={newUser.nama}
                    onChange={(e) => setNewUser({...newUser, nama: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nim">NIM/NID *</Label>
                  <Input
                    id="nim"
                    value={newUser.nim}
                    onChange={(e) => setNewUser({...newUser, nim: e.target.value})}
                    placeholder="Masukkan NIM/NID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="nama@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={newUser.nomor_whatsapp}
                    onChange={(e) => setNewUser({...newUser, nomor_whatsapp: e.target.value})}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Select value={newUser.jenis_kelamin} onValueChange={(value) => setNewUser({...newUser, jenis_kelamin: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as "dosen" | "mahasiswa" | "admin"})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="dosen">Dosen</SelectItem>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="password">Password Default</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Masukkan password default"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddUser}>
                  Tambah User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NIM, atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="dosen">Dosen</SelectItem>
                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Daftar User ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Kelola semua user yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIM/NID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tgl Gabung</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nama}</TableCell>
                    <TableCell>{user.nim}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.nomor_whatsapp}</TableCell>
                    <TableCell>{getJenisKelaminDisplay(user.jenis_kelamin)}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id, user.user_id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update informasi user yang dipilih
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  value={selectedUser.nama}
                  onChange={(e) => setSelectedUser({...selectedUser, nama: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>NIM/NID</Label>
                <Input
                  value={selectedUser.nim || ""}
                  onChange={(e) => setSelectedUser({...selectedUser, nim: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={selectedUser.nomor_whatsapp}
                  onChange={(e) => setSelectedUser({...selectedUser, nomor_whatsapp: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={selectedUser.jenis_kelamin} onValueChange={(value) => setSelectedUser({...selectedUser, jenis_kelamin: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedUser.role} onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="dosen">Dosen</SelectItem>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditUser}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
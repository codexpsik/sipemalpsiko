import { useState } from "react";
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

interface User {
  id: string;
  nama: string;
  nim: string;
  email: string;
  whatsapp: string;
  jenisKelamin: string;
  role: 'dosen' | 'mahasiswa';
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Demo data
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      nama: "Dr. Sarah Wilson",
      nim: "DOC001",
      email: "sarah.wilson@university.edu",
      whatsapp: "081234567890",
      jenisKelamin: "Perempuan",
      role: "dosen",
      status: "active",
      joinDate: "2023-01-15"
    },
    {
      id: "2",
      nama: "Prof. Michael Lee",
      nim: "DOC002",
      email: "michael.lee@university.edu",
      whatsapp: "081234567891",
      jenisKelamin: "Laki-laki",
      role: "dosen",
      status: "active",
      joinDate: "2022-08-20"
    },
    {
      id: "3",
      nama: "Ahmad Rizki",
      nim: "2021001",
      email: "ahmad.rizki@student.edu",
      whatsapp: "081234567892",
      jenisKelamin: "Laki-laki",
      role: "mahasiswa",
      status: "active",
      joinDate: "2023-09-01"
    },
    {
      id: "4",
      nama: "Siti Nurhaliza",
      nim: "2021002",
      email: "siti.nur@student.edu",
      whatsapp: "081234567893",
      jenisKelamin: "Perempuan",
      role: "mahasiswa",
      status: "active",
      joinDate: "2023-09-01"
    },
    {
      id: "5",
      nama: "Budi Santoso",
      nim: "2020055",
      email: "budi.santoso@student.edu",
      whatsapp: "081234567894",
      jenisKelamin: "Laki-laki",
      role: "mahasiswa",
      status: "inactive",
      joinDate: "2023-02-10"
    }
  ]);

  const [newUser, setNewUser] = useState({
    nama: "",
    nim: "",
    email: "",
    whatsapp: "",
    jenisKelamin: "",
    role: "mahasiswa" as const,
    password: ""
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.nama || !newUser.nim || !newUser.email) {
      alert("Mohon lengkapi semua field yang wajib diisi!");
      return;
    }

    const user: User = {
      id: (users.length + 1).toString(),
      ...newUser,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, user]);
    setNewUser({ nama: "", nim: "", email: "", whatsapp: "", jenisKelamin: "", role: "mahasiswa", password: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setUsers(users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    ));
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const getRoleBadge = (role: string) => {
    return role === 'dosen' 
      ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Dosen</Badge>
      : <Badge variant="secondary">Mahasiswa</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
      : <Badge variant="outline" className="text-red-600 border-red-300">Nonaktif</Badge>;
  };

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
                    value={newUser.whatsapp}
                    onChange={(e) => setNewUser({...newUser, whatsapp: e.target.value})}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Select value={newUser.jenisKelamin} onValueChange={(value) => setNewUser({...newUser, jenisKelamin: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as "dosen" | "mahasiswa"})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SelectItem value="dosen">Dosen</SelectItem>
                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
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
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{user.whatsapp}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString('id-ID')}</TableCell>
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
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.status === 'active' ? (
                            <UserX className="h-4 w-4 text-red-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
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
                  value={selectedUser.nim}
                  onChange={(e) => setSelectedUser({...selectedUser, nim: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={selectedUser.whatsapp}
                  onChange={(e) => setSelectedUser({...selectedUser, whatsapp: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={selectedUser.jenisKelamin} onValueChange={(value) => setSelectedUser({...selectedUser, jenisKelamin: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedUser.role} onValueChange={(value: "dosen" | "mahasiswa") => setSelectedUser({...selectedUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
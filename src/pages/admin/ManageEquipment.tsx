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
import { Textarea } from "@/components/ui/textarea";
import { 
  TestTube, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Equipment {
  id: string;
  nama: string;
  deskripsi: string | null;
  kategori_id: string;
  kategori_nama?: string;
  stok: number;
  kondisi: string | null;
  gambar_url: string | null;
  created_at: string;
}

interface Category {
  id: string;
  nama: string;
  tipe: string;
}

export default function ManageEquipment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [kondisiFilter, setKondisiFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newEquipment, setNewEquipment] = useState({
    nama: "",
    deskripsi: "",
    kategori_id: "",
    stok: 1,
    kondisi: "baik"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      // Fetch equipment with category names
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select(`
          *,
          categories!inner(nama)
        `);

      if (equipmentError) throw equipmentError;

      const equipmentWithCategoryNames = equipmentData.map(item => ({
        ...item,
        kategori_nama: item.categories.nama
      }));

      setEquipment(equipmentWithCategoryNames);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data equipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || item.kategori_id === categoryFilter;
    const matchesKondisi = kondisiFilter === "all" || item.kondisi === kondisiFilter;
    
    return matchesSearch && matchesCategory && matchesKondisi;
  });

  const handleAddEquipment = async () => {
    if (!newEquipment.nama || !newEquipment.kategori_id) {
      toast({
        title: "Validasi Error",
        description: "Mohon lengkapi nama dan kategori alat!",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('equipment')
        .insert([{
          nama: newEquipment.nama,
          deskripsi: newEquipment.deskripsi,
          kategori_id: newEquipment.kategori_id,
          stok: newEquipment.stok,
          kondisi: newEquipment.kondisi
        }]);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Equipment berhasil ditambahkan",
      });

      setNewEquipment({ nama: "", deskripsi: "", kategori_id: "", stok: 1, kondisi: "baik" });
      setIsAddDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan equipment",
        variant: "destructive",
      });
    }
  };

  const handleEditEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          nama: selectedEquipment.nama,
          deskripsi: selectedEquipment.deskripsi,
          kategori_id: selectedEquipment.kategori_id,
          stok: selectedEquipment.stok,
          kondisi: selectedEquipment.kondisi
        })
        .eq('id', selectedEquipment.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Equipment berhasil diperbarui",
      });

      setIsEditDialogOpen(false);
      setSelectedEquipment(null);
      fetchData();
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui equipment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus alat ini?")) {
      try {
        const { error } = await supabase
          .from('equipment')
          .delete()
          .eq('id', equipmentId);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Equipment berhasil dihapus",
        });

        fetchData();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        toast({
          title: "Error",
          description: "Gagal menghapus equipment",
          variant: "destructive",
        });
      }
    }
  };

  const getKategoriBadge = (categoryName: string) => {
    return <Badge variant="secondary">{categoryName}</Badge>;
  };

  const getKondisiBadge = (kondisi: string | null) => {
    switch (kondisi) {
      case "baik":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Baik</Badge>;
      case "rusak":
        return <Badge variant="destructive">Rusak</Badge>;
      case "hilang":
        return <Badge variant="outline" className="text-red-600 border-red-300">Hilang</Badge>;
      default:
        return <Badge variant="secondary">{kondisi || "Tidak Diketahui"}</Badge>;
    }
  };

  const getStokStatus = (stok: number, categoryName: string) => {
    if (categoryName.includes("Copy 1") || categoryName.includes("copy_1")) {
      return stok > 0 ? (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Tersedia</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Dipinjam</span>
        </div>
      );
    }

    if (stok === 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Habis</span>
        </div>
      );
    }

    if (stok <= 5) {
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Stok Rendah</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Tersedia</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat data equipment...</p>
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
            <TestTube className="h-8 w-8" />
            Manajemen Alat
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola alat test psikologi dan inventaris
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Import Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Alat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Alat Baru</DialogTitle>
                <DialogDescription>
                  Isi form di bawah untuk menambahkan alat test baru
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Alat *</Label>
                  <Input
                    id="nama"
                    value={newEquipment.nama}
                    onChange={(e) => setNewEquipment({...newEquipment, nama: e.target.value})}
                    placeholder="Masukkan nama alat test"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={newEquipment.deskripsi}
                    onChange={(e) => setNewEquipment({...newEquipment, deskripsi: e.target.value})}
                    placeholder="Jelaskan fungsi dan kegunaan alat ini..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategori *</Label>
                    <Select value={newEquipment.kategori_id} onValueChange={(value) => setNewEquipment({...newEquipment, kategori_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stok">Jumlah Stok</Label>
                    <Input
                      id="stok"
                      type="number"
                      min="1"
                      value={newEquipment.stok}
                      onChange={(e) => setNewEquipment({...newEquipment, stok: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Kondisi</Label>
                  <Select value={newEquipment.kondisi} onValueChange={(value) => setNewEquipment({...newEquipment, kondisi: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baik">Baik</SelectItem>
                      <SelectItem value="rusak">Rusak</SelectItem>
                      <SelectItem value="hilang">Hilang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddEquipment}>
                  Tambah Alat
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
                  placeholder="Cari nama atau deskripsi alat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={kondisiFilter} onValueChange={setKondisiFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Kondisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kondisi</SelectItem>
                <SelectItem value="baik">Baik</SelectItem>
                <SelectItem value="rusak">Rusak</SelectItem>
                <SelectItem value="hilang">Hilang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Alat ({filteredEquipment.length})</CardTitle>
              <CardDescription>
                Kelola semua alat test yang tersedia
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Total: {equipment.reduce((sum, item) => sum + item.stok, 0)} unit
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Alat</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.nama}</div>
                        {item.deskripsi && (
                          <div className="text-sm text-muted-foreground mt-1 max-w-xs truncate">
                            {item.deskripsi}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getKategoriBadge(item.kategori_nama || "")}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{item.stok}</div>
                        <div className="text-muted-foreground">unit</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStokStatus(item.stok, item.kategori_nama || "")}</TableCell>
                    <TableCell>{getKondisiBadge(item.kondisi)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEquipment(item);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEquipment(item.id)}
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
      {selectedEquipment && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Alat</DialogTitle>
              <DialogDescription>
                Update informasi alat yang dipilih
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Alat</Label>
                <Input
                  value={selectedEquipment.nama}
                  onChange={(e) => setSelectedEquipment({...selectedEquipment, nama: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={selectedEquipment.deskripsi || ""}
                  onChange={(e) => setSelectedEquipment({...selectedEquipment, deskripsi: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={selectedEquipment.kategori_id} onValueChange={(value) => setSelectedEquipment({...selectedEquipment, kategori_id: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Jumlah Stok</Label>
                  <Input
                    type="number"
                    min="0"
                    value={selectedEquipment.stok}
                    onChange={(e) => setSelectedEquipment({...selectedEquipment, stok: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Kondisi</Label>
                <Select value={selectedEquipment.kondisi || ""} onValueChange={(value) => setSelectedEquipment({...selectedEquipment, kondisi: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baik">Baik</SelectItem>
                    <SelectItem value="rusak">Rusak</SelectItem>
                    <SelectItem value="hilang">Hilang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditEquipment}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
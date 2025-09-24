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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Filter
} from "lucide-react";

interface Category {
  id: string;
  nama: string;
  deskripsi: string;
  aturan: string;
  totalAlat: number;
  createdDate: string;
}

export default function ManageCategories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Demo data
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      nama: "Harus Dikembalikan",
      deskripsi: "Alat test yang wajib dikembalikan setelah penggunaan dengan kondisi yang sama",
      aturan: "Maksimal peminjaman 7 hari. Harus dikembalikan dalam kondisi baik. Dikenakan denda jika terlambat.",
      totalAlat: 25,
      createdDate: "2023-01-15"
    },
    {
      id: "2", 
      nama: "Habis Pakai",
      deskripsi: "Alat test yang dapat digunakan sekali pakai dan tidak perlu dikembalikan",
      aturan: "Sekali ambil langsung habis. Tidak ada pengembalian. Terbatas per user per hari.",
      totalAlat: 150,
      createdDate: "2023-01-15"
    },
    {
      id: "3",
      nama: "Copy 1",
      deskripsi: "Alat test dengan stok terbatas yang memerlukan sistem antrian",
      aturan: "Hanya 1 exemplar. Sistem antrian jika sedang dipinjam. Maksimal 3 hari peminjaman.",
      totalAlat: 8,
      createdDate: "2023-01-15"
    }
  ]);

  const [newCategory, setNewCategory] = useState({
    nama: "",
    deskripsi: "",
    aturan: ""
  });

  const filteredCategories = categories.filter(category =>
    category.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = () => {
    if (!newCategory.nama || !newCategory.deskripsi) {
      alert("Mohon lengkapi nama dan deskripsi kategori!");
      return;
    }

    const category: Category = {
      id: (categories.length + 1).toString(),
      ...newCategory,
      totalAlat: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setCategories([...categories, category]);
    setNewCategory({ nama: "", deskripsi: "", aturan: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;

    setCategories(categories.map(category => 
      category.id === selectedCategory.id ? selectedCategory : category
    ));
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.totalAlat > 0) {
      alert("Tidak dapat menghapus kategori yang masih memiliki alat!");
      return;
    }

    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      setCategories(categories.filter(category => category.id !== categoryId));
    }
  };

  const getCategoryBadge = (nama: string) => {
    switch (nama) {
      case "Harus Dikembalikan":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Harus Dikembalikan</Badge>;
      case "Habis Pakai":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Habis Pakai</Badge>;
      case "Copy 1":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Copy 1</Badge>;
      default:
        return <Badge variant="secondary">{nama}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            Manajemen Kategori
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola kategori alat test psikologi
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
              <DialogDescription>
                Isi form di bawah untuk menambahkan kategori baru
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Kategori *</Label>
                <Input
                  id="nama"
                  value={newCategory.nama}
                  onChange={(e) => setNewCategory({...newCategory, nama: e.target.value})}
                  placeholder="Masukkan nama kategori"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi *</Label>
                <Textarea
                  id="deskripsi"
                  value={newCategory.deskripsi}
                  onChange={(e) => setNewCategory({...newCategory, deskripsi: e.target.value})}
                  placeholder="Jelaskan kategori ini..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aturan">Aturan Peminjaman</Label>
                <Textarea
                  id="aturan"
                  value={newCategory.aturan}
                  onChange={(e) => setNewCategory({...newCategory, aturan: e.target.value})}
                  placeholder="Aturan dan kebijakan peminjaman untuk kategori ini..."
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddCategory}>
                Tambah Kategori
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Pencarian Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau deskripsi kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="shadow-card border-0 hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  {getCategoryBadge(category.nama)}
                  <CardTitle className="text-xl">{category.nama}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Deskripsi:</h4>
                <p className="text-sm text-muted-foreground">{category.deskripsi}</p>
              </div>
              
              {category.aturan && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Aturan Peminjaman:</h4>
                  <p className="text-sm text-muted-foreground">{category.aturan}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <div className="text-sm">
                  <span className="font-semibold">{category.totalAlat}</span>
                  <span className="text-muted-foreground"> alat terdaftar</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Dibuat: {new Date(category.createdDate).toLocaleDateString('id-ID')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {selectedCategory && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Kategori</DialogTitle>
              <DialogDescription>
                Update informasi kategori yang dipilih
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Kategori</Label>
                <Input
                  value={selectedCategory.nama}
                  onChange={(e) => setSelectedCategory({...selectedCategory, nama: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={selectedCategory.deskripsi}
                  onChange={(e) => setSelectedCategory({...selectedCategory, deskripsi: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Aturan Peminjaman</Label>
                <Textarea
                  value={selectedCategory.aturan}
                  onChange={(e) => setSelectedCategory({...selectedCategory, aturan: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditCategory}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  nama: string;
  deskripsi: string | null;
  tipe: string;
  totalAlat: number;
  created_at: string;
}

export default function ManageCategories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newCategory, setNewCategory] = useState<{
    nama: string;
    deskripsi: string;
    tipe: "harus_dikembalikan" | "habis_pakai" | "copy_1";
  }>({
    nama: "",
    deskripsi: "",
    tipe: "harus_dikembalikan"
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*');

      if (error) throw error;

      // Count equipment for each category
      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          const { count } = await supabase
            .from('equipment')
            .select('*', { count: 'exact' })
            .eq('kategori_id', category.id);

          return {
            ...category,
            totalAlat: count || 0
          };
        })
      );

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kategori",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.deskripsi && category.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddCategory = async () => {
    if (!newCategory.nama || !newCategory.deskripsi) {
      toast({
        title: "Validasi Error",
        description: "Mohon lengkapi nama dan deskripsi kategori!",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{
          nama: newCategory.nama,
          deskripsi: newCategory.deskripsi,
          tipe: newCategory.tipe
        }]);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan",
      });

      setNewCategory({ nama: "", deskripsi: "", tipe: "harus_dikembalikan" });
      setIsAddDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan kategori",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          nama: selectedCategory.nama,
          deskripsi: selectedCategory.deskripsi,
          tipe: selectedCategory.tipe as "harus_dikembalikan" | "habis_pakai" | "copy_1"
        })
        .eq('id', selectedCategory.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui",
      });

      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui kategori",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.totalAlat > 0) {
      toast({
        title: "Tidak dapat menghapus",
        description: "Tidak dapat menghapus kategori yang masih memiliki alat!",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Kategori berhasil dihapus",
        });

        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Error",
          description: "Gagal menghapus kategori",
          variant: "destructive",
        });
      }
    }
  };

  const getCategoryBadge = (tipe: string) => {
    switch (tipe) {
      case "harus_dikembalikan":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Harus Dikembalikan</Badge>;
      case "habis_pakai":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Habis Pakai</Badge>;
      case "copy_1":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Copy 1</Badge>;
      default:
        return <Badge variant="secondary">{tipe}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat data kategori...</p>
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
                <Label htmlFor="tipe">Tipe Kategori *</Label>
                <select
                  id="tipe"
                  value={newCategory.tipe}
                  onChange={(e) => setNewCategory({...newCategory, tipe: e.target.value as "harus_dikembalikan" | "habis_pakai" | "copy_1"})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="harus_dikembalikan">Harus Dikembalikan</option>
                  <option value="habis_pakai">Habis Pakai</option>
                  <option value="copy_1">Copy 1</option>
                </select>
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
                  {getCategoryBadge(category.tipe)}
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
              {category.deskripsi && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Deskripsi:</h4>
                  <p className="text-sm text-muted-foreground">{category.deskripsi}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <div className="text-sm">
                  <span className="font-semibold">{category.totalAlat}</span>
                  <span className="text-muted-foreground"> alat terdaftar</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Dibuat: {new Date(category.created_at).toLocaleDateString('id-ID')}
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
                  value={selectedCategory.deskripsi || ""}
                  onChange={(e) => setSelectedCategory({...selectedCategory, deskripsi: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipe Kategori</Label>
                <select
                  value={selectedCategory.tipe}
                  onChange={(e) => setSelectedCategory({...selectedCategory, tipe: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="harus_dikembalikan">Harus Dikembalikan</option>
                  <option value="habis_pakai">Habis Pakai</option>
                  <option value="copy_1">Copy 1</option>
                </select>
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
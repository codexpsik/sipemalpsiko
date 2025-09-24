import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { 
  TestTube, 
  Search, 
  Filter,
  BookOpen,
  Star,
  ShoppingCart,
  Users,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tool {
  id: string;
  nama: string;
  deskripsi: string;
  stok: number;
  kondisi: string;
  kategori: {
    id: string;
    nama: string;
    tipe: string;
  };
}

export default function Katalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('nama');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Fetch equipment with categories
      const { data: toolsData, error: toolsError } = await supabase
        .from('equipment')
        .select(`
          *,
          kategori:categories (
            id,
            nama,
            tipe
          )
        `)
        .order('nama');

      if (toolsError) {
        console.error('Error fetching tools:', toolsError);
      } else {
        setTools(toolsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || tool.kategori.id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleBorrowClick = (tool: Tool) => {
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu untuk melakukan peminjaman.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Redirect to peminjaman page with selected tool
    navigate('/peminjaman', { state: { selectedTool: tool } });
  };

  const getCategoryIcon = (tipe: string) => {
    switch (tipe) {
      case 'harus_dikembalikan':
        return BookOpen;
      case 'habis_pakai':
        return TestTube;
      case 'copy_1':
        return Star;
      default:
        return Package;
    }
  };

  const getCategoryBadge = (kategori: any) => {
    const colors = {
      'harus_dikembalikan': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      'habis_pakai': 'bg-green-100 text-green-800 hover:bg-green-100',
      'copy_1': 'bg-orange-100 text-orange-800 hover:bg-orange-100'
    };
    
    return (
      <Badge className={colors[kategori.tipe as keyof typeof colors] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
        {kategori.nama}
      </Badge>
    );
  };

  const getAvailabilityBadge = (stok: number) => {
    if (stok > 10) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Tersedia</Badge>;
    } else if (stok > 0) {
      return <Badge variant="outline" className="text-orange-600 border-orange-300">Stok Terbatas</Badge>;
    } else {
      return <Badge variant="destructive">Habis</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat katalog...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <TestTube className="h-10 w-10 text-primary" />
            Katalog Alat Test Psikologi
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Jelajahi koleksi alat test psikologi yang tersedia. 
            {!user && " Silakan login untuk melakukan peminjaman."}
          </p>
        </div>

        {/* Search & Filter */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Cari & Filter Alat Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama alat atau deskripsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alat</p>
                  <p className="text-2xl font-bold">{tools.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tersedia</p>
                  <p className="text-2xl font-bold">{tools.filter(t => t.stok > 0).length}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kategori</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Daftar Alat Test ({filteredTools.length})
          </h2>
          
          {filteredTools.length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="p-12 text-center">
                <TestTube className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tidak Ada Alat Ditemukan</h3>
                <p className="text-muted-foreground">
                  Coba ubah kata kunci pencarian atau filter kategori.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => {
                const CategoryIcon = getCategoryIcon(tool.kategori.tipe);
                
                return (
                  <Card key={tool.id} className="shadow-card border-0 hover:shadow-hover transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg line-clamp-2">{tool.nama}</CardTitle>
                        </div>
                        {getAvailabilityBadge(tool.stok)}
                      </div>
                      <div className="space-y-2">
                        {getCategoryBadge(tool.kategori)}
                        <CardDescription className="line-clamp-3">
                          {tool.deskripsi || "Tidak ada deskripsi"}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Stok:</span>
                          <span className="font-medium">{tool.stok} unit</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Kondisi:</span>
                          <span className="font-medium">{tool.kondisi || "Baik"}</span>
                        </div>
                        
                        <Button 
                          onClick={() => handleBorrowClick(tool)}
                          disabled={tool.stok === 0}
                          className="w-full gap-2"
                          variant={tool.stok === 0 ? "outline" : "default"}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {tool.stok === 0 ? "Stok Habis" : user ? "Pinjam Sekarang" : "Login untuk Pinjam"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA Section */}
        {!user && (
          <Card className="shadow-card border-0 bg-gradient-hero text-white">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-4">Siap Melakukan Peminjaman?</h3>
              <p className="text-lg mb-6 opacity-90">
                Daftar atau login untuk mulai meminjam alat test psikologi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" onClick={() => navigate('/auth')}>
                  Login Sekarang
                </Button>
                <Button variant="glass" size="lg" onClick={() => navigate('/auth')} className="border-white/30">
                  Daftar Akun Baru
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
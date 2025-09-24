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

interface Tool {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: string;
  stok: number;
  stokAwal: number;
  kondisi: 'baik' | 'rusak' | 'hilang';
  lokasi: string;
  createdDate: string;
}

export default function ManageTools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [kondisiFilter, setKondisiFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Demo data
  const [tools, setTools] = useState<Tool[]>([
    {
      id: "1",
      nama: "MMPI-2 (Minnesota Multiphasic Personality Inventory)",
      deskripsi: "Tes kepribadian komprehensif untuk asesmen psikologis dewasa",
      kategori: "Harus Dikembalikan",
      stok: 3,
      stokAwal: 5,
      kondisi: "baik",
      lokasi: "Rak A1",
      createdDate: "2023-01-15"
    },
    {
      id: "2",
      nama: "WAIS-IV (Wechsler Adult Intelligence Scale)",
      deskripsi: "Tes intelegensi dewasa untuk mengukur kemampuan kognitif",
      kategori: "Harus Dikembalikan",
      stok: 2,
      stokAwal: 3,
      kondisi: "baik",
      lokasi: "Rak A2",
      createdDate: "2023-01-20"
    },
    {
      id: "3",
      nama: "Beck Depression Inventory (BDI-II)",
      deskripsi: "Kuesioner untuk mengukur tingkat depresi",
      kategori: "Habis Pakai",
      stok: 25,
      stokAwal: 50,
      kondisi: "baik",
      lokasi: "Rak B1",
      createdDate: "2023-02-01"
    },
    {
      id: "4",
      nama: "TAT (Thematic Apperception Test)",
      deskripsi: "Tes proyektif menggunakan gambar untuk asesmen kepribadian",
      kategori: "Copy 1",
      stok: 0,
      stokAwal: 1,
      kondisi: "baik",
      lokasi: "Rak C1",
      createdDate: "2023-02-05"
    },
    {
      id: "5",
      nama: "Rorschach Inkblot Test",
      deskripsi: "Tes proyektif menggunakan noda tinta",
      kategori: "Copy 1",
      stok: 1,
      stokAwal: 1,
      kondisi: "baik",
      lokasi: "Rak C2",
      createdDate: "2023-02-10"
    },
    {
      id: "6",
      nama: "Form Observasi Kelas",
      deskripsi: "Lembar observasi untuk penelitian di kelas",
      kategori: "Habis Pakai",
      stok: 100,
      stokAwal: 100,
      kondisi: "baik",
      lokasi: "Rak B2",
      createdDate: "2023-02-15"
    }
  ]);

  const [newTool, setNewTool] = useState({
    nama: "",
    deskripsi: "",
    kategori: "",
    stok: 1,
    lokasi: ""
  });

  const categories = ["Harus Dikembalikan", "Habis Pakai", "Copy 1"];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || tool.kategori === categoryFilter;
    const matchesKondisi = kondisiFilter === "all" || tool.kondisi === kondisiFilter;
    
    return matchesSearch && matchesCategory && matchesKondisi;
  });

  const handleAddTool = () => {
    if (!newTool.nama || !newTool.kategori) {
      alert("Mohon lengkapi nama dan kategori alat!");
      return;
    }

    const tool: Tool = {
      id: (tools.length + 1).toString(),
      ...newTool,
      stokAwal: newTool.stok,
      kondisi: "baik",
      createdDate: new Date().toISOString().split('T')[0]
    };

    setTools([...tools, tool]);
    setNewTool({ nama: "", deskripsi: "", kategori: "", stok: 1, lokasi: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditTool = () => {
    if (!selectedTool) return;

    setTools(tools.map(tool => 
      tool.id === selectedTool.id ? selectedTool : tool
    ));
    setIsEditDialogOpen(false);
    setSelectedTool(null);
  };

  const handleDeleteTool = (toolId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus alat ini?")) {
      setTools(tools.filter(tool => tool.id !== toolId));
    }
  };

  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case "Harus Dikembalikan":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Harus Dikembalikan</Badge>;
      case "Habis Pakai":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Habis Pakai</Badge>;
      case "Copy 1":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Copy 1</Badge>;
      default:
        return <Badge variant="secondary">{kategori}</Badge>;
    }
  };

  const getKondisiBadge = (kondisi: string) => {
    switch (kondisi) {
      case "baik":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Baik</Badge>;
      case "rusak":
        return <Badge variant="destructive">Rusak</Badge>;
      case "hilang":
        return <Badge variant="outline" className="text-red-600 border-red-300">Hilang</Badge>;
      default:
        return <Badge variant="secondary">{kondisi}</Badge>;
    }
  };

  const getStokStatus = (stok: number, kategori: string) => {
    if (kategori === "Copy 1") {
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

    if (stok <= 5 && kategori !== "Copy 1") {
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
                  value={newTool.nama}
                  onChange={(e) => setNewTool({...newTool, nama: e.target.value})}
                  placeholder="Masukkan nama alat test"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={newTool.deskripsi}
                  onChange={(e) => setNewTool({...newTool, deskripsi: e.target.value})}
                  placeholder="Jelaskan fungsi dan kegunaan alat ini..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <Select value={newTool.kategori} onValueChange={(value) => setNewTool({...newTool, kategori: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
                    value={newTool.stok}
                    onChange={(e) => setNewTool({...newTool, stok: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lokasi">Lokasi Penyimpanan</Label>
                <Input
                  id="lokasi"
                  value={newTool.lokasi}
                  onChange={(e) => setNewTool({...newTool, lokasi: e.target.value})}
                  placeholder="Contoh: Rak A1, Lemari B2"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddTool}>
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
                  <SelectItem key={category} value={category}>{category}</SelectItem>
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

      {/* Tools Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Alat ({filteredTools.length})</CardTitle>
              <CardDescription>
                Kelola semua alat test yang tersedia
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Total: {tools.reduce((sum, tool) => sum + tool.stok, 0)} unit
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
                  <TableHead>Lokasi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tool.nama}</div>
                        {tool.deskripsi && (
                          <div className="text-sm text-muted-foreground mt-1 max-w-xs truncate">
                            {tool.deskripsi}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getKategoriBadge(tool.kategori)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{tool.stok} / {tool.stokAwal}</div>
                        <div className="text-muted-foreground">unit</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStokStatus(tool.stok, tool.kategori)}</TableCell>
                    <TableCell>{getKondisiBadge(tool.kondisi)}</TableCell>
                    <TableCell>{tool.lokasi}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedTool(tool);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTool(tool.id)}
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
      {selectedTool && (
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
                  value={selectedTool.nama}
                  onChange={(e) => setSelectedTool({...selectedTool, nama: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={selectedTool.deskripsi}
                  onChange={(e) => setSelectedTool({...selectedTool, deskripsi: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={selectedTool.kategori} onValueChange={(value) => setSelectedTool({...selectedTool, kategori: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Kondisi</Label>
                  <Select value={selectedTool.kondisi} onValueChange={(value: "baik" | "rusak" | "hilang") => setSelectedTool({...selectedTool, kondisi: value})}>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stok Saat Ini</Label>
                  <Input
                    type="number"
                    min="0"
                    value={selectedTool.stok}
                    onChange={(e) => setSelectedTool({...selectedTool, stok: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input
                    value={selectedTool.lokasi}
                    onChange={(e) => setSelectedTool({...selectedTool, lokasi: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditTool}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
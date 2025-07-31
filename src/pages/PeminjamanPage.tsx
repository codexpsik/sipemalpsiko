import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  TestTube, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  BookOpen,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Tool {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: string;
  stok: number;
  stokAwal: number;
  kondisi: 'baik' | 'rusak' | 'hilang';
  lokasi: string;
  tersedia: boolean;
  queueLength?: number;
  estimatedAvailable?: string;
}

export default function PeminjamanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [purpose, setPurpose] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Demo data
  const tools: Tool[] = [
    {
      id: "1",
      nama: "MMPI-2 (Minnesota Multiphasic Personality Inventory)",
      deskripsi: "Tes kepribadian komprehensif untuk asesmen psikologis dewasa",
      kategori: "Harus Dikembalikan",
      stok: 3,
      stokAwal: 5,
      kondisi: "baik",
      lokasi: "Rak A1",
      tersedia: true
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
      tersedia: true
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
      tersedia: true
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
      tersedia: false,
      queueLength: 2,
      estimatedAvailable: "2024-01-28"
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
      tersedia: true
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
      tersedia: true
    },
    {
      id: "7",
      nama: "Stanford-Binet Intelligence Scales",
      deskripsi: "Tes intelegensi individual untuk berbagai usia",
      kategori: "Copy 1",
      stok: 0,
      stokAwal: 1,
      kondisi: "baik",
      lokasi: "Rak C3",
      tersedia: false,
      queueLength: 1,
      estimatedAvailable: "2024-01-25"
    }
  ];

  const categories = ["Harus Dikembalikan", "Habis Pakai", "Copy 1"];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || tool.kategori === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleBorrowRequest = () => {
    if (!selectedTool || !startDate || !purpose.trim()) {
      alert("Mohon lengkapi semua field yang diperlukan!");
      return;
    }

    if (selectedTool.kategori === "Harus Dikembalikan" && !endDate) {
      alert("Tanggal selesai wajib diisi untuk kategori Harus Dikembalikan!");
      return;
    }

    // Demo submit
    alert(`Permintaan peminjaman "${selectedTool.nama}" berhasil dikirim!\n\nDetail:\n- Tanggal mulai: ${format(startDate, "dd MMMM yyyy", { locale: id })}\n- Tanggal selesai: ${endDate ? format(endDate, "dd MMMM yyyy", { locale: id }) : "-"}\n- Tujuan: ${purpose}\n- Quantity: ${quantity}\n\nStatus: Menunggu persetujuan admin`);
    
    setIsRequestDialogOpen(false);
    setSelectedTool(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setPurpose("");
    setQuantity(1);
  };

  const handleQueueRequest = () => {
    if (!selectedTool || !startDate || !endDate || !purpose.trim()) {
      alert("Mohon lengkapi semua field untuk bergabung dalam antrian!");
      return;
    }

    alert(`Berhasil bergabung dalam antrian untuk "${selectedTool.nama}"!\n\nPosisi antrian: ${(selectedTool.queueLength || 0) + 1}\nTanggal yang diinginkan: ${format(startDate, "dd MMMM yyyy", { locale: id })} - ${format(endDate, "dd MMMM yyyy", { locale: id })}\n\nAnda akan dihubungi ketika alat tersedia.`);
    
    setIsRequestDialogOpen(false);
    setSelectedTool(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setPurpose("");
  };

  const getCategoryBadge = (kategori: string) => {
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

  const getAvailabilityStatus = (tool: Tool) => {
    if (tool.kategori === "Copy 1") {
      if (tool.tersedia) {
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Tersedia</span>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-1 text-red-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Sedang Dipinjam</span>
          </div>
        );
      }
    }

    if (tool.stok === 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Stok Habis</span>
        </div>
      );
    }

    if (tool.stok <= 5 && tool.kategori !== "Copy 1") {
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Stok Terbatas</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Tersedia</span>
      </div>
    );
  };

  const getActionButton = (tool: Tool) => {
    if (tool.kategori === "Copy 1" && !tool.tersedia) {
      return (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            setSelectedTool(tool);
            setIsRequestDialogOpen(true);
          }}
        >
          <Clock className="h-4 w-4" />
          Gabung Antrian
        </Button>
      );
    }

    if (tool.stok === 0) {
      return (
        <Button variant="outline" disabled className="w-full">
          Tidak Tersedia
        </Button>
      );
    }

    return (
      <Button
        className="w-full gap-2"
        onClick={() => {
          setSelectedTool(tool);
          setIsRequestDialogOpen(true);
        }}
      >
        <Plus className="h-4 w-4" />
        Pinjam Sekarang
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} userRole="mahasiswa" userName="Ahmad Rizki" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <TestTube className="h-8 w-8" />
            Peminjaman Alat Test
          </h1>
          <p className="text-muted-foreground">Pilih alat test psikologi yang ingin Anda pinjam</p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8 shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Pencarian & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari alat test..."
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
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="shadow-card border-0 hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    {getCategoryBadge(tool.kategori)}
                    <CardTitle className="text-lg mt-2 line-clamp-2">{tool.nama}</CardTitle>
                  </div>
                  {tool.kategori === "Copy 1" && (
                    <Star className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  )}
                </div>
                <CardDescription className="line-clamp-3">
                  {tool.deskripsi}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Status:</div>
                    {getAvailabilityStatus(tool)}
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">Stok:</div>
                    <div className="text-lg font-bold">
                      {tool.kategori === "Copy 1" ? (tool.tersedia ? "1" : "0") : tool.stok}
                      {tool.kategori !== "Copy 1" && (
                        <span className="text-sm text-muted-foreground">/{tool.stokAwal}</span>
                      )}
                    </div>
                  </div>
                </div>

                {tool.kategori === "Copy 1" && !tool.tersedia && tool.queueLength && tool.queueLength > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Informasi Antrian</span>
                    </div>
                    <div className="text-xs text-orange-700 space-y-1">
                      <div>Antrian saat ini: {tool.queueLength} orang</div>
                      {tool.estimatedAvailable && (
                        <div>Estimasi tersedia: {new Date(tool.estimatedAvailable).toLocaleDateString('id-ID')}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>📍 Lokasi: {tool.lokasi}</div>
                  <div>✅ Kondisi: {tool.kondisi}</div>
                </div>

                {getActionButton(tool)}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <TestTube className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Tidak ada alat yang ditemukan</h3>
            <p className="text-muted-foreground">Coba ubah kata kunci pencarian atau filter kategori</p>
          </div>
        )}

        {/* Request Dialog */}
        {selectedTool && (
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedTool.kategori === "Copy 1" && !selectedTool.tersedia ? "Gabung Antrian" : "Request Peminjaman"}
                </DialogTitle>
                <DialogDescription>
                  {selectedTool.nama} - {selectedTool.kategori}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Informasi Alat:</h4>
                  <div className="text-sm space-y-1">
                    <div>📍 Lokasi: {selectedTool.lokasi}</div>
                    <div>📊 Stok: {selectedTool.kategori === "Copy 1" ? (selectedTool.tersedia ? "1 (Tersedia)" : "0 (Sedang dipinjam)") : `${selectedTool.stok}/${selectedTool.stokAwal}`}</div>
                    {selectedTool.kategori === "Copy 1" && !selectedTool.tersedia && (
                      <div>⏳ Antrian: {selectedTool.queueLength} orang</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Mulai *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {(selectedTool.kategori === "Harus Dikembalikan" || selectedTool.kategori === "Copy 1") && (
                    <div className="space-y-2">
                      <Label>Tanggal Selesai *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => !startDate || date <= startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                {selectedTool.kategori !== "Copy 1" && (
                  <div className="space-y-2">
                    <Label>Jumlah</Label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedTool.stok}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Tujuan Peminjaman *</Label>
                  <Textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Jelaskan tujuan dan kebutuhan peminjaman alat ini..."
                    rows={3}
                  />
                </div>

                {selectedTool.kategori === "Copy 1" && !selectedTool.tersedia && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Informasi Antrian</span>
                    </div>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <div>Alat sedang dipinjam oleh user lain</div>
                      <div>Posisi Anda dalam antrian: #{(selectedTool.queueLength || 0) + 1}</div>
                      <div>Anda akan dihubungi ketika alat tersedia</div>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={selectedTool.kategori === "Copy 1" && !selectedTool.tersedia ? handleQueueRequest : handleBorrowRequest}
                >
                  {selectedTool.kategori === "Copy 1" && !selectedTool.tersedia ? "Gabung Antrian" : "Kirim Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
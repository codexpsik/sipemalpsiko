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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { 
  History, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Eye,
  FileText,
  Calendar,
  User
} from "lucide-react";

interface BorrowingHistory {
  id: string;
  toolName: string;
  category: string;
  quantity: number;
  requestDate: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'returned' | 'overdue';
  condition?: 'baik' | 'rusak' | 'hilang';
  penalty?: number;
  adminNotes?: string;
  userNotes?: string;
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedHistory, setSelectedHistory] = useState<BorrowingHistory | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Demo data - in real app this would come from Supabase
  const [borrowingHistory] = useState<BorrowingHistory[]>([
    {
      id: "1",
      toolName: "MMPI-2 (Minnesota Multiphasic Personality Inventory)",
      category: "Harus Dikembalikan",
      quantity: 1,
      requestDate: "2024-01-15",
      startDate: "2024-01-20",
      endDate: "2024-01-27",
      actualReturnDate: "2024-01-26",
      purpose: "Penelitian kepribadian mahasiswa untuk thesis",
      status: "returned",
      condition: "baik",
      userNotes: "Alat dalam kondisi baik, sudah selesai digunakan untuk penelitian",
      adminNotes: "Dikembalikan tepat waktu dalam kondisi baik"
    },
    {
      id: "2",
      toolName: "Beck Depression Inventory (BDI-II)",
      category: "Habis Pakai",
      quantity: 5,
      requestDate: "2024-01-14",
      startDate: "2024-01-16",
      endDate: "2024-01-16",
      actualReturnDate: "2024-01-16",
      purpose: "Tugas akhir tentang tingkat depresi mahasiswa",
      status: "returned",
      condition: "baik"
    },
    {
      id: "3",
      toolName: "WAIS-IV (Wechsler Adult Intelligence Scale)",
      category: "Harus Dikembalikan",
      quantity: 1,
      requestDate: "2024-01-20",
      startDate: "2024-01-25",
      endDate: "2024-02-01",
      purpose: "Penelitian skripsi tentang intelegensi",
      status: "active",
      userNotes: "Sedang digunakan untuk penelitian skripsi"
    },
    {
      id: "4",
      toolName: "TAT (Thematic Apperception Test)",
      category: "Copy 1",
      quantity: 1,
      requestDate: "2024-01-10",
      startDate: "2024-01-15",
      endDate: "2024-01-18",
      actualReturnDate: "2024-01-22",
      purpose: "Praktikum asesmen proyektif",
      status: "returned",
      condition: "baik",
      penalty: 15000,
      adminNotes: "Dikembalikan terlambat 4 hari, dikenakan denda"
    },
    {
      id: "5",
      toolName: "Rorschach Inkblot Test",
      category: "Copy 1",
      quantity: 1,
      requestDate: "2024-01-08",
      startDate: "2024-01-12",
      endDate: "2024-01-15",
      purpose: "Asesmen kepribadian untuk penelitian",
      status: "rejected",
      adminNotes: "Alat sedang dipinjam untuk periode yang diminta"
    },
    {
      id: "6",
      toolName: "Form Observasi Kelas",
      category: "Habis Pakai",
      quantity: 20,
      requestDate: "2023-12-20",
      startDate: "2023-12-22",
      endDate: "2023-12-22",
      actualReturnDate: "2023-12-22",
      purpose: "Observasi perilaku siswa di kelas",
      status: "returned",
      condition: "baik"
    }
  ]);

  const categories = ["Harus Dikembalikan", "Habis Pakai", "Copy 1"];

  const filteredHistory = borrowingHistory.filter(item => {
    const matchesSearch = item.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Menunggu</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aktif</Badge>;
      case "returned":
        return <Badge variant="secondary">Dikembalikan</Badge>;
      case "overdue":
        return <Badge variant="destructive">Terlambat</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Harus Dikembalikan":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Harus Dikembalikan</Badge>;
      case "Habis Pakai":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Habis Pakai</Badge>;
      case "Copy 1":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Copy 1</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const getConditionBadge = (condition?: string) => {
    if (!condition) return null;
    
    switch (condition) {
      case "baik":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Baik</Badge>;
      case "rusak":
        return <Badge variant="destructive">Rusak</Badge>;
      case "hilang":
        return <Badge variant="outline" className="text-red-600 border-red-300">Hilang</Badge>;
      default:
        return <Badge variant="secondary">{condition}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "returned":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "active":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "rejected":
        return <X className="h-4 w-4 text-red-600" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <History className="h-8 w-8" />
            Riwayat Peminjaman
          </h1>
          <p className="text-muted-foreground">Lihat semua riwayat peminjaman alat test Anda</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Peminjaman</p>
                  <p className="text-2xl font-bold">{borrowingHistory.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Berhasil Dikembalikan</p>
                  <p className="text-2xl font-bold">{borrowingHistory.filter(h => h.status === 'returned').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sedang Aktif</p>
                  <p className="text-2xl font-bold">{borrowingHistory.filter(h => h.status === 'active').length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Denda</p>
                  <p className="text-2xl font-bold">
                    Rp {borrowingHistory.reduce((total, h) => total + (h.penalty || 0), 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="shadow-card border-0 mb-6">
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
                    placeholder="Cari nama alat atau tujuan peminjaman..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="returned">Dikembalikan</SelectItem>
                </SelectContent>
              </Select>
              
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
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Riwayat Peminjaman ({filteredHistory.length})</CardTitle>
            <CardDescription>
              Klik pada baris untuk melihat detail peminjaman
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alat</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kondisi</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((history) => (
                    <TableRow 
                      key={history.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => {
                        setSelectedHistory(history);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(history.status)}
                            <span className="font-medium max-w-xs truncate">{history.toolName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Qty: {history.quantity}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(history.category)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatDate(history.startDate)} - {formatDate(history.endDate)}
                          </div>
                          {history.actualReturnDate && (
                            <div className="text-xs text-muted-foreground">
                              Dikembalikan: {formatDate(history.actualReturnDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {calculateDuration(history.startDate, history.endDate)} hari
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(history.status)}</TableCell>
                      <TableCell>{getConditionBadge(history.condition)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedHistory(history);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
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

        {/* Detail Dialog */}
        {selectedHistory && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detail Peminjaman</DialogTitle>
                <DialogDescription>
                  Informasi lengkap tentang peminjaman alat test
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Alat</label>
                    <div className="text-sm">{selectedHistory.toolName}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <div>{getCategoryBadge(selectedHistory.category)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jumlah</label>
                    <div className="text-sm">{selectedHistory.quantity} unit</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div>{getStatusBadge(selectedHistory.status)}</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline Peminjaman
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tanggal Permintaan</label>
                      <div className="text-sm">{formatDate(selectedHistory.requestDate)}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Periode Peminjaman</label>
                      <div className="text-sm">
                        {formatDate(selectedHistory.startDate)} - {formatDate(selectedHistory.endDate)}
                      </div>
                    </div>
                  </div>

                  {selectedHistory.actualReturnDate && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tanggal Pengembalian</label>
                        <div className="text-sm">{formatDate(selectedHistory.actualReturnDate)}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Durasi Aktual</label>
                        <div className="text-sm">
                          {calculateDuration(selectedHistory.startDate, selectedHistory.actualReturnDate)} hari
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tujuan Peminjaman</label>
                  <div className="text-sm p-3 bg-muted/30 rounded-lg">
                    {selectedHistory.purpose}
                  </div>
                </div>

                {/* Condition and Penalty */}
                {(selectedHistory.condition || selectedHistory.penalty) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedHistory.condition && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Kondisi Saat Dikembalikan</label>
                        <div>{getConditionBadge(selectedHistory.condition)}</div>
                      </div>
                    )}
                    {selectedHistory.penalty && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Denda</label>
                        <div className="text-sm font-medium text-red-600">
                          Rp {selectedHistory.penalty.toLocaleString('id-ID')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {(selectedHistory.userNotes || selectedHistory.adminNotes) && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Catatan
                    </h4>
                    
                    {selectedHistory.userNotes && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Catatan Peminjam
                        </label>
                        <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          {selectedHistory.userNotes}
                        </div>
                      </div>
                    )}

                    {selectedHistory.adminNotes && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Catatan Admin</label>
                        <div className="text-sm p-3 bg-muted/30 rounded-lg">
                          {selectedHistory.adminNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  RotateCcw, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Eye
} from "lucide-react";

interface ReturnRequest {
  id: string;
  borrowId: string;
  userName: string;
  userRole: 'dosen' | 'mahasiswa';
  userNim: string;
  toolName: string;
  category: string;
  quantity: number;
  borrowDate: string;
  dueDate: string;
  returnRequestDate: string;
  stage: 'tahap_awal' | 'tahap_akhir' | 'completed';
  status: 'pending' | 'approved_stage1' | 'approved_final' | 'rejected';
  condition: 'baik' | 'rusak' | 'hilang';
  userNotes?: string;
  adminNotes?: string;
  penalty?: number;
}

export default function ManageReturning() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  // Demo data
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([
    {
      id: "1",
      borrowId: "B001",
      userName: "Dr. Sarah Wilson",
      userRole: "dosen",
      userNim: "DOC001",
      toolName: "MMPI-2 (Minnesota Multiphasic Personality Inventory)",
      category: "Harus Dikembalikan",
      quantity: 1,
      borrowDate: "2024-01-15",
      dueDate: "2024-01-22",
      returnRequestDate: "2024-01-21",
      stage: "tahap_awal",
      status: "pending",
      condition: "baik",
      userNotes: "Alat dalam kondisi baik, sudah selesai digunakan untuk penelitian"
    },
    {
      id: "2",
      borrowId: "B002",
      userName: "Ahmad Rizki",
      userRole: "mahasiswa",
      userNim: "2021001",
      toolName: "WAIS-IV (Wechsler Adult Intelligence Scale)",
      category: "Harus Dikembalikan",
      quantity: 1,
      borrowDate: "2024-01-10",
      dueDate: "2024-01-17",
      returnRequestDate: "2024-01-18",
      stage: "tahap_akhir",
      status: "approved_stage1",
      condition: "baik",
      userNotes: "Penelitian telah selesai, alat siap dikembalikan",
      adminNotes: "Tahap awal approved, menunggu konfirmasi fisik",
      penalty: 5000
    },
    {
      id: "3",
      borrowId: "B003",
      userName: "Prof. Michael Lee",
      userRole: "dosen",
      userNim: "DOC002",
      toolName: "TAT (Thematic Apperception Test)",
      category: "Copy 1",
      quantity: 1,
      borrowDate: "2024-01-08",
      dueDate: "2024-01-15",
      returnRequestDate: "2024-01-14",
      stage: "completed",
      status: "approved_final",
      condition: "baik",
      userNotes: "Asesmen klinis telah selesai",
      adminNotes: "Alat dikembalikan dalam kondisi baik, proses selesai"
    },
    {
      id: "4",
      borrowId: "B004",
      userName: "Siti Nurhaliza",
      userRole: "mahasiswa",
      userNim: "2021002",
      toolName: "Beck Depression Inventory (BDI-II)",
      category: "Harus Dikembalikan",
      quantity: 1,
      borrowDate: "2024-01-05",
      dueDate: "2024-01-12",
      returnRequestDate: "2024-01-16",
      stage: "tahap_awal",
      status: "rejected",
      condition: "rusak",
      userNotes: "Beberapa halaman robek, mohon maaf atas kerusakan",
      adminNotes: "Alat mengalami kerusakan, dikenakan denda",
      penalty: 50000
    }
  ]);

  const filteredReturns = returnRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.userNim.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesStage = stageFilter === "all" || request.stage === stageFilter;
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  const handleApproveStage1 = (returnId: string) => {
    setReturnRequests(requests =>
      requests.map(request =>
        request.id === returnId
          ? { 
              ...request, 
              status: "approved_stage1" as const, 
              stage: "tahap_akhir" as const,
              adminNotes 
            }
          : request
      )
    );
    setAdminNotes("");
    setIsDetailDialogOpen(false);
  };

  const handleApproveFinal = (returnId: string) => {
    setReturnRequests(requests =>
      requests.map(request =>
        request.id === returnId
          ? { 
              ...request, 
              status: "approved_final" as const, 
              stage: "completed" as const,
              adminNotes 
            }
          : request
      )
    );
    setAdminNotes("");
    setIsDetailDialogOpen(false);
  };

  const handleReject = (returnId: string) => {
    if (!adminNotes.trim()) {
      alert("Mohon berikan alasan penolakan!");
      return;
    }

    setReturnRequests(requests =>
      requests.map(request =>
        request.id === returnId
          ? { ...request, status: "rejected" as const, adminNotes }
          : request
      )
    );
    setAdminNotes("");
    setIsDetailDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Menunggu</Badge>;
      case "approved_stage1":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Tahap 1 OK</Badge>;
      case "approved_final":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "tahap_awal":
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Tahap Awal</Badge>;
      case "tahap_akhir":
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Tahap Akhir</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
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

  const getRoleBadge = (role: string) => {
    return role === 'dosen' 
      ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Dosen</Badge>
      : <Badge variant="secondary">Mahasiswa</Badge>;
  };

  const isOverdue = (dueDate: string, returnRequestDate: string) => {
    return new Date(returnRequestDate) > new Date(dueDate);
  };

  const getLateDays = (dueDate: string, returnRequestDate: string) => {
    const due = new Date(dueDate);
    const returned = new Date(returnRequestDate);
    const diffTime = returned.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <RotateCcw className="h-8 w-8" />
            Manajemen Pengembalian
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola proses pengembalian alat test (2 tahap)
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Export Excel
        </Button>
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
                  placeholder="Cari nama peminjam, alat, atau NIM..."
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
                <SelectItem value="approved_stage1">Tahap 1 OK</SelectItem>
                <SelectItem value="approved_final">Selesai</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Tahap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahap</SelectItem>
                <SelectItem value="tahap_awal">Tahap Awal</SelectItem>
                <SelectItem value="tahap_akhir">Tahap Akhir</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tahap Awal</p>
                <p className="text-2xl font-bold">{returnRequests.filter(r => r.stage === 'tahap_awal').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tahap Akhir</p>
                <p className="text-2xl font-bold">{returnRequests.filter(r => r.stage === 'tahap_akhir').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-2xl font-bold">{returnRequests.filter(r => r.stage === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terlambat</p>
                <p className="text-2xl font-bold">{returnRequests.filter(r => isOverdue(r.dueDate, r.returnRequestDate)).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Returns Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Daftar Pengembalian ({filteredReturns.length})</CardTitle>
          <CardDescription>
            Kelola proses pengembalian alat dalam 2 tahap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Alat</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Tahap</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{request.userName}</span>
                          {getRoleBadge(request.userRole)}
                        </div>
                        <div className="text-sm text-muted-foreground">{request.userNim}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium max-w-xs truncate">{request.toolName}</div>
                        <div className="text-sm text-muted-foreground">Qty: {request.quantity}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <div>Pinjam: {new Date(request.borrowDate).toLocaleDateString('id-ID')}</div>
                          <div className={isOverdue(request.dueDate, request.returnRequestDate) ? "text-red-600 font-medium" : ""}>
                            Batas: {new Date(request.dueDate).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        {isOverdue(request.dueDate, request.returnRequestDate) && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Terlambat {getLateDays(request.dueDate, request.returnRequestDate)} hari</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStageBadge(request.stage)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{getConditionBadge(request.condition)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedReturn(request);
                            setAdminNotes(request.adminNotes || "");
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {request.status === 'pending' && request.stage === 'tahap_awal' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedReturn(request);
                              setAdminNotes("");
                              handleApproveStage1(request.id);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {request.status === 'approved_stage1' && request.stage === 'tahap_akhir' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedReturn(request);
                              setAdminNotes("");
                              handleApproveFinal(request.id);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
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
      {selectedReturn && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Pengembalian</DialogTitle>
              <DialogDescription>
                Review dan kelola proses pengembalian alat
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Peminjam</label>
                  <div className="flex items-center gap-2">
                    <span>{selectedReturn.userName}</span>
                    {getRoleBadge(selectedReturn.userRole)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIM/NID</label>
                  <div>{selectedReturn.userNim}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Alat yang Dikembalikan</label>
                <div className="space-y-1">
                  <div className="font-medium">{selectedReturn.toolName}</div>
                  <div className="text-sm text-muted-foreground">Quantity: {selectedReturn.quantity}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Pinjam</label>
                  <div>{new Date(selectedReturn.borrowDate).toLocaleDateString('id-ID')}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batas Kembali</label>
                  <div className={isOverdue(selectedReturn.dueDate, selectedReturn.returnRequestDate) ? "text-red-600 font-medium" : ""}>
                    {new Date(selectedReturn.dueDate).toLocaleDateString('id-ID')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Kembali</label>
                  <div>{new Date(selectedReturn.returnRequestDate).toLocaleDateString('id-ID')}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tahap</label>
                  <div>{getStageBadge(selectedReturn.stage)}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div>{getStatusBadge(selectedReturn.status)}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kondisi</label>
                  <div>{getConditionBadge(selectedReturn.condition)}</div>
                </div>
              </div>
              
              {selectedReturn.penalty && selectedReturn.penalty > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Denda</label>
                  <div className="text-red-600 font-medium">
                    Rp {selectedReturn.penalty.toLocaleString('id-ID')}
                  </div>
                </div>
              )}
              
              {selectedReturn.userNotes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan Peminjam</label>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    {selectedReturn.userNotes}
                  </div>
                </div>
              )}
              
              {(selectedReturn.status === 'pending' || selectedReturn.status === 'approved_stage1') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan Admin</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan untuk proses pengembalian..."
                    rows={3}
                  />
                </div>
              )}
              
              {selectedReturn.adminNotes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan Admin</label>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    {selectedReturn.adminNotes}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Tutup
              </Button>
              
              {selectedReturn.status === 'pending' && selectedReturn.stage === 'tahap_awal' && (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedReturn.id)}
                  >
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleApproveStage1(selectedReturn.id)}
                  >
                    Approve Tahap 1
                  </Button>
                </div>
              )}
              
              {selectedReturn.status === 'approved_stage1' && selectedReturn.stage === 'tahap_akhir' && (
                <Button
                  onClick={() => handleApproveFinal(selectedReturn.id)}
                >
                  Selesaikan Pengembalian
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
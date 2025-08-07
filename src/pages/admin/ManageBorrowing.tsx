import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  ClipboardList, 
  Search, 
  Filter,
  CheckCircle,
  X,
  Eye,
  Clock,
  AlertTriangle,
  FileText
} from "lucide-react";

interface BorrowRequest {
  id: string;
  userName: string;
  userRole: 'dosen' | 'mahasiswa';
  userNim: string;
  toolName: string;
  category: string;
  quantity: number;
  requestDate: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'returned';
  adminNotes?: string;
  user_id: string;
  equipment_id: string;
  approved_by?: string;
}

export default function ManageBorrowing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBorrowingRequests();
    fetchCategories();
  }, []);

  const fetchBorrowingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select(`
          *,
          profiles(nama, role, nim),
          equipment(nama, categories(nama))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: BorrowRequest[] = data?.map(borrowing => ({
        id: borrowing.id,
        userName: borrowing.profiles?.nama || 'Unknown',
        userRole: borrowing.profiles?.role || 'mahasiswa',
        userNim: borrowing.profiles?.nim || 'N/A',
        toolName: borrowing.equipment?.nama || 'Unknown Equipment',
        category: borrowing.equipment?.categories?.nama || 'Unknown Category',
        quantity: borrowing.jumlah,
        requestDate: borrowing.created_at,
        startDate: borrowing.tanggal_pinjam,
        endDate: borrowing.tanggal_kembali,
        purpose: borrowing.catatan || '',
        status: borrowing.status,
        adminNotes: '',
        user_id: borrowing.user_id,
        equipment_id: borrowing.equipment_id,
        approved_by: borrowing.approved_by
      })) || [];

      setBorrowRequests(formattedData);
    } catch (error) {
      console.error('Error fetching borrowing requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch borrowing requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('nama')
        .order('nama');

      if (error) throw error;

      const categoryNames = data?.map(cat => cat.nama) || [];
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredRequests = borrowRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.userNim.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('borrowings')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      setBorrowRequests(requests =>
        requests.map(request =>
          request.id === requestId
            ? { ...request, status: "approved" as const, adminNotes }
            : request
        )
      );

      toast({
        title: "Success",
        description: "Borrowing request approved successfully",
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    }
    setAdminNotes("");
    setIsDetailDialogOpen(false);
  };

  const handleReject = async (requestId: string) => {
    if (!adminNotes.trim()) {
      toast({
        title: "Error",
        description: "Mohon berikan alasan penolakan!",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('borrowings')
        .update({ 
          status: 'rejected'
        })
        .eq('id', requestId);

      if (error) throw error;

      setBorrowRequests(requests =>
        requests.map(request =>
          request.id === requestId
            ? { ...request, status: "rejected" as const, adminNotes }
            : request
        )
      );

      toast({
        title: "Success", 
        description: "Borrowing request rejected",
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
    setAdminNotes("");
    setIsDetailDialogOpen(false);
  };

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
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'dosen' 
      ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Dosen</Badge>
      : <Badge variant="secondary">Mahasiswa</Badge>;
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

  const getPriorityIcon = (status: string, endDate: string) => {
    if (status === "active") {
      const today = new Date();
      const returnDate = new Date(endDate);
      const daysDiff = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff <= 1) {
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      } else if (daysDiff <= 3) {
        return <Clock className="h-4 w-4 text-yellow-600" />;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8" />
            Manajemen Peminjaman
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola permintaan peminjaman alat test
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold">{borrowRequests.filter(r => r.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sedang Dipinjam</p>
                <p className="text-2xl font-bold">{borrowRequests.filter(r => r.status === 'active').length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold">{borrowRequests.filter(r => r.status === 'approved').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dikembalikan</p>
                <p className="text-2xl font-bold">{borrowRequests.filter(r => r.status === 'returned').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Daftar Permintaan Peminjaman ({filteredRequests.length})</CardTitle>
          <CardDescription>
            Kelola semua permintaan peminjaman alat test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Alat</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
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
                    <TableCell>{getCategoryBadge(request.category)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {new Date(request.startDate).toLocaleDateString('id-ID')} - 
                          {new Date(request.endDate).toLocaleDateString('id-ID')}
                        </div>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(request.status, request.endDate)}
                          <span className="text-xs text-muted-foreground">
                            {Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 3600 * 24))} hari
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminNotes(request.adminNotes || "");
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedRequest(request);
                                setAdminNotes("");
                                handleApprove(request.id);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedRequest(request);
                                setAdminNotes("");
                                setIsDetailDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
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
      {selectedRequest && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Permintaan Peminjaman</DialogTitle>
              <DialogDescription>
                Review dan kelola permintaan peminjaman
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Peminjam</label>
                  <div className="flex items-center gap-2">
                    <span>{selectedRequest.userName}</span>
                    {getRoleBadge(selectedRequest.userRole)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIM/NID</label>
                  <div>{selectedRequest.userNim}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Alat yang Dipinjam</label>
                <div className="space-y-1">
                  <div className="font-medium">{selectedRequest.toolName}</div>
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(selectedRequest.category)}
                    <span className="text-sm text-muted-foreground">Qty: {selectedRequest.quantity}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Mulai</label>
                  <div>{new Date(selectedRequest.startDate).toLocaleDateString('id-ID')}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Selesai</label>
                  <div>{new Date(selectedRequest.endDate).toLocaleDateString('id-ID')}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tujuan Peminjaman</label>
                <div className="p-3 bg-muted/30 rounded-lg">
                  {selectedRequest.purpose}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Saat Ini</label>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
              
              {selectedRequest.status === 'pending' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan Admin</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan (opsional untuk persetujuan, wajib untuk penolakan)"
                    rows={3}
                  />
                </div>
              )}
              
              {selectedRequest.adminNotes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan Admin</label>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    {selectedRequest.adminNotes}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Tutup
              </Button>
              
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedRequest.id)}
                  >
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    Setujui
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
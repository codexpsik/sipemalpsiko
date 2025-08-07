import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeData } from "@/hooks/useRealtimeData";
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
  stage: 'initial' | 'final' | 'completed';
  status: 'initial' | 'final' | 'completed';
  condition: string;
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
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  // Real-time updates for returns
  useRealtimeData({
    table: 'returns',
    onInsert: () => {
      fetchReturnRequests(); // Refresh data when new return is added
    },
    onUpdate: () => {
      fetchReturnRequests(); // Refresh data when return is updated
    },
    onDelete: () => {
      fetchReturnRequests(); // Refresh data when return is deleted
    }
  });

  const fetchReturnRequests = async () => {
    try {
      // First get returns with borrowings and equipment info
      const { data: returnsData, error: returnsError } = await supabase
        .from('returns')
        .select(`
          *,
          borrowings(
            *,
            equipment(nama, categories(nama))
          )
        `)
        .order('created_at', { ascending: false });

      if (returnsError) throw returnsError;

      // Then get profiles for each user
      const userIds = returnsData?.map(r => r.borrowings?.user_id).filter(Boolean) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, nama, role, nim')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      const formattedData: ReturnRequest[] = returnsData?.map(returnReq => {
        const profile = profilesMap.get(returnReq.borrowings?.user_id);
        return {
          id: returnReq.id,
          borrowId: returnReq.borrowing_id,
          userName: profile?.nama || 'Unknown',
          userRole: profile?.role || 'mahasiswa',
          userNim: profile?.nim || 'N/A',
          toolName: returnReq.borrowings?.equipment?.nama || 'Unknown Equipment',
          category: returnReq.borrowings?.equipment?.categories?.nama || 'Unknown Category',
          quantity: returnReq.borrowings?.jumlah || 1,
          borrowDate: returnReq.borrowings?.tanggal_pinjam || '',
          dueDate: returnReq.borrowings?.tanggal_kembali || '',
          returnRequestDate: returnReq.created_at,
          stage: returnReq.status === 'initial' ? 'initial' : returnReq.status === 'final' ? 'final' : 'completed',
          status: returnReq.status,
          condition: returnReq.kondisi_alat || 'baik',
          userNotes: returnReq.catatan_tahap_awal || '',
          adminNotes: returnReq.catatan_tahap_akhir || '',
          penalty: 0
        };
      }) || [];

      setReturnRequests(formattedData);
    } catch (error) {
      console.error('Error fetching return requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch return requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returnRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.userNim.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesStage = stageFilter === "all" || request.stage === stageFilter;
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  const handleApproveStage1 = async (returnId: string) => {
    try {
      const { error } = await supabase
        .from('returns')
        .update({ 
          status: 'final',
          catatan_tahap_akhir: adminNotes,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', returnId);

      if (error) throw error;

      setReturnRequests(requests =>
        requests.map(request =>
          request.id === returnId
            ? { 
                ...request, 
                status: "final" as const, 
                stage: "final" as const,
                adminNotes 
              }
            : request
        )
      );

      toast({
        title: "Success",
        description: "Stage 1 approved successfully",
      });
    } catch (error) {
      console.error('Error approving stage 1:', error);
      toast({
        title: "Error",
        description: "Failed to approve stage 1",
        variant: "destructive",
      });
    }
    setAdminNotes("");
    setIsDetailDialogOpen(false);
  };

  const handleApproveFinal = async (returnId: string) => {
    try {
      const { error } = await supabase
        .from('returns')
        .update({ 
          status: 'completed',
          catatan_tahap_akhir: adminNotes,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', returnId);

      if (error) throw error;

      setReturnRequests(requests =>
        requests.map(request =>
          request.id === returnId
            ? { 
                ...request, 
                status: "completed" as const, 
                stage: "completed" as const,
                adminNotes 
              }
            : request
        )
      );

      toast({
        title: "Success",
        description: "Return completed successfully",
      });
    } catch (error) {
      console.error('Error completing return:', error);
      toast({
        title: "Error",
        description: "Failed to complete return",
        variant: "destructive",
      });
    }
    setAdminNotes("");
    setIsDetailDialogOpen(false);
  };

  const handleReject = async (returnId: string) => {
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
        .from('returns')
        .update({ 
          status: 'initial',
          catatan_tahap_akhir: adminNotes
        })
        .eq('id', returnId);

      if (error) throw error;

      setReturnRequests(requests =>
        requests.map(request =>
          request.id === returnId
            ? { ...request, status: "initial" as const, adminNotes }
            : request
        )
      );

      toast({
        title: "Success",
        description: "Return request rejected",
      });
    } catch (error) {
      console.error('Error rejecting return:', error);
      toast({
        title: "Error",
        description: "Failed to reject return",
        variant: "destructive",
      });
    }
    setAdminNotes("");
    setIsDetailDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "initial":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Menunggu</Badge>;
      case "final":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Tahap Final</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "initial":
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Tahap Awal</Badge>;
      case "final":
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
                <SelectItem value="initial">Menunggu</SelectItem>
                <SelectItem value="final">Tahap Final</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Tahap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahap</SelectItem>
                <SelectItem value="initial">Tahap Awal</SelectItem>
                <SelectItem value="final">Tahap Akhir</SelectItem>
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
                <p className="text-2xl font-bold">{returnRequests.filter(r => r.stage === 'initial').length}</p>
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
                <p className="text-2xl font-bold">{returnRequests.filter(r => r.stage === 'final').length}</p>
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
                        
                        {request.status === 'initial' && request.stage === 'initial' && (
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
                        
                        {request.status === 'final' && request.stage === 'final' && (
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
              
              {(selectedReturn.status === 'initial' || selectedReturn.status === 'final') && (
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
              
              {selectedReturn.status === 'initial' && selectedReturn.stage === 'initial' && (
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
              
              {selectedReturn.status === 'final' && selectedReturn.stage === 'final' && (
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
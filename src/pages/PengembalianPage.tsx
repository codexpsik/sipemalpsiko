import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, FileText, Package, AlertCircle, Upload, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

interface BorrowingRecord {
  id: string;
  equipment_id: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  jumlah: number;
  status: string;
  catatan: string;
  equipment: {
    nama: string;
    kategori_id: string;
    kondisi: string;
  };
}

export default function PengembalianPage() {
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [selectedBorrowing, setSelectedBorrowing] = useState<BorrowingRecord | null>(null);
  const [kondisiAlat, setKondisiAlat] = useState("");
  const [catatanPengembalian, setCatatanPengembalian] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveBorrowings();
  }, []);

  const fetchActiveBorrowings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('borrowings')
        .select(`
          *,
          equipment (
            nama,
            kategori_id,
            kondisi
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('tanggal_kembali', { ascending: true });

      if (error) throw error;
      setBorrowings(data || []);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data peminjaman",
        variant: "destructive",
      });
    }
  };

  const isOverdue = (returnDate: string) => {
    return new Date(returnDate) < new Date();
  };

  const getDaysLate = (returnDate: string) => {
    const today = new Date();
    const returnDay = new Date(returnDate);
    const diffTime = today.getTime() - returnDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculatePenalty = (returnDate: string) => {
    const daysLate = getDaysLate(returnDate);
    const penaltyPerDay = 5000; // Rp 5,000 per hari
    return daysLate * penaltyPerDay;
  };

  const handleReturnSubmit = async () => {
    if (!selectedBorrowing || !kondisiAlat.trim()) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create return record
      const { error } = await supabase
        .from('returns')
        .insert({
          borrowing_id: selectedBorrowing.id,
          kondisi_alat: kondisiAlat,
          catatan_tahap_awal: catatanPengembalian,
          status: 'initial'
        });

      if (error) throw error;

      // If overdue, create penalty record
      if (isOverdue(selectedBorrowing.tanggal_kembali)) {
        const penaltyAmount = calculatePenalty(selectedBorrowing.tanggal_kembali);
        await supabase
          .from('penalties')
          .insert({
            borrowing_id: selectedBorrowing.id,
            amount: penaltyAmount,
            reason: `Keterlambatan ${getDaysLate(selectedBorrowing.tanggal_kembali)} hari`,
            status: 'pending'
          });
      }

      toast({
        title: "Berhasil",
        description: "Permintaan pengembalian telah disubmit. Menunggu konfirmasi admin.",
      });

      setIsDialogOpen(false);
      setSelectedBorrowing(null);
      setKondisiAlat("");
      setCatatanPengembalian("");
      fetchActiveBorrowings();
    } catch (error) {
      console.error('Error submitting return:', error);
      toast({
        title: "Error",
        description: "Gagal submit pengembalian",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: "secondary", label: "Menunggu Persetujuan", icon: Clock },
      approved: { variant: "default", label: "Dipinjam", icon: Package },
      rejected: { variant: "destructive", label: "Ditolak", icon: AlertCircle },
    } as const;

    const statusInfo = statusMap[status as keyof typeof statusMap];
    if (!statusInfo) return null;

    const Icon = statusInfo.icon;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pengembalian Alat</h1>
          <p className="text-muted-foreground">
            Kelola pengembalian alat yang sedang Anda pinjam
          </p>
        </div>

        {borrowings.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Peminjaman Aktif</h3>
              <p className="text-muted-foreground">
                Anda belum memiliki alat yang perlu dikembalikan
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {borrowings.map((borrowing) => (
              <Card key={borrowing.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{borrowing.equipment.nama}</CardTitle>
                      <CardDescription>
                        Dipinjam: {new Date(borrowing.tanggal_pinjam).toLocaleDateString('id-ID')}
                      </CardDescription>
                    </div>
                    {getStatusBadge(borrowing.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Batas Kembali: {new Date(borrowing.tanggal_kembali).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>Jumlah: {borrowing.jumlah} unit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Kondisi: {borrowing.equipment.kondisi}</span>
                    </div>
                  </div>

                  {isOverdue(borrowing.tanggal_kembali) && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Terlambat {getDaysLate(borrowing.tanggal_kembali)} hari
                      </div>
                      <p className="text-sm text-destructive/80 mt-1">
                        Denda: Rp {calculatePenalty(borrowing.tanggal_kembali).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-end">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedBorrowing(borrowing)}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Kembalikan Alat
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Pengembalian Alat</DialogTitle>
                          <DialogDescription>
                            Mohon isi detail kondisi alat saat pengembalian
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="kondisi">Kondisi Alat Saat Dikembalikan *</Label>
                            <Input
                              id="kondisi"
                              placeholder="Contoh: Baik, Rusak ringan, dll."
                              value={kondisiAlat}
                              onChange={(e) => setKondisiAlat(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="catatan">Catatan Tambahan</Label>
                            <Textarea
                              id="catatan"
                              placeholder="Catatan tambahan mengenai kondisi alat atau masalah yang ditemui..."
                              value={catatanPengembalian}
                              onChange={(e) => setCatatanPengembalian(e.target.value)}
                              className="mt-1"
                              rows={3}
                            />
                          </div>

                          {selectedBorrowing && isOverdue(selectedBorrowing.tanggal_kembali) && (
                            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                              <p className="text-sm text-warning-foreground font-medium">
                                ⚠️ Pengembalian terlambat
                              </p>
                              <p className="text-sm text-warning-foreground/80 mt-1">
                                Denda: Rp {calculatePenalty(selectedBorrowing.tanggal_kembali).toLocaleString('id-ID')}
                              </p>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false);
                              setSelectedBorrowing(null);
                              setKondisiAlat("");
                              setCatatanPengembalian("");
                            }}
                          >
                            Batal
                          </Button>
                          <Button
                            onClick={handleReturnSubmit}
                            disabled={isSubmitting || !kondisiAlat.trim()}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Memproses...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Submit Pengembalian
                              </div>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
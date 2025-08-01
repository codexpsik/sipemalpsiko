import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { 
  BookOpen, 
  TestTube, 
  Clock,
  CheckCircle,
  Star,
  Calendar,
  TrendingUp,
  AlertTriangle,
  FileText,
  User,
  GraduationCap,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  activeBorrowings: number;
  totalBorrowings: number;
  queueCount: number;
  completedBorrowings: number;
}

export default function MahasiswaDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeBorrowings: 0,
    totalBorrowings: 0,
    queueCount: 0,
    completedBorrowings: 0
  });
  const [currentBorrows, setCurrentBorrows] = useState<any[]>([]);
  const [queueStatus, setQueueStatus] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Fetch user's borrowings stats
      const { count: totalBorrowings } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: activeBorrowings } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'approved');

      const { count: completedBorrowings } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending'); // Tidak ada status 'returned' saat ini

      // Fetch queue count (assuming queue table exists)
      const { count: queueCount } = await supabase
        .from('equipment_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        activeBorrowings: activeBorrowings || 0,
        totalBorrowings: totalBorrowings || 0,
        queueCount: queueCount || 0,
        completedBorrowings: completedBorrowings || 0
      });

      // Fetch current active borrowings
      const { data: borrowingsData } = await supabase
        .from('borrowings')
        .select(`
          id,
          tanggal_pinjam,
          tanggal_kembali,
          jumlah,
          catatan,
          status,
          equipment!equipment_id (nama),
          categories!inner(nama)
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (borrowingsData) {
        const formattedBorrows = borrowingsData.map((borrow: any) => ({
          id: borrow.id,
          toolName: borrow.equipment?.nama || 'Unknown Equipment',
          category: 'Alat Test', // Simplified category name
          startDate: borrow.tanggal_pinjam,
          dueDate: borrow.tanggal_kembali,
          status: 'active',
          purpose: borrow.catatan || 'Tidak ada catatan',
          daysLeft: Math.ceil((new Date(borrow.tanggal_kembali).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        }));
        setCurrentBorrows(formattedBorrows);
        
        // Set upcoming deadlines from active borrows
        const deadlines = formattedBorrows
          .filter(borrow => borrow.daysLeft <= 7)
          .map(borrow => ({
            id: borrow.id,
            toolName: borrow.toolName,
            dueDate: borrow.dueDate,
            daysLeft: borrow.daysLeft,
            category: borrow.category
          }));
        setUpcomingDeadlines(deadlines);
      }

      // Fetch queue status
      const { data: queueData } = await supabase
        .from('equipment_queue')
        .select(`
          id,
          tanggal_mulai,
          tanggal_selesai,
          equipment!equipment_id (nama)
        `)
        .eq('user_id', user.id)
        .eq('status', 'waiting');

      if (queueData) {
        const formattedQueue = queueData.map((queue: any, index: number) => ({
          id: queue.id,
          toolName: queue.equipment?.nama || 'Unknown Equipment',
          category: 'Copy 1',
          position: index + 1,
          estimatedDate: queue.tanggal_mulai,
          currentUser: 'Admin'
        }));
        setQueueStatus(formattedQueue);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: "Sedang Dipinjam",
      value: stats.activeBorrowings.toString(),
      description: "Alat aktif",
      icon: TestTube,
      trend: "+1%",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Peminjaman", 
      value: stats.totalBorrowings.toString(),
      description: "Semester ini",
      icon: BookOpen,
      trend: "+3%",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Dalam Antrian",
      value: stats.queueCount.toString(),
      description: "Copy 1",
      icon: Clock,
      trend: "=",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Selesai",
      value: stats.completedBorrowings.toString(),
      description: "Dikembalikan",
      icon: CheckCircle,
      trend: "+2%",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aktif</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>;
      case "queue":
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Antrian</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUrgencyIcon = (daysLeft: number) => {
    if (daysLeft <= 1) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    } else if (daysLeft <= 3) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <GraduationCap className="h-8 w-8" />
            Dashboard Mahasiswa
          </h1>
          <p className="text-muted-foreground">
            Selamat datang kembali, {profile?.nama || 'Mahasiswa'}! 
            {profile?.nim && ` NIM: ${profile.nim}`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="hover:shadow-hover transition-all duration-300 border-0 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <div className={`text-xs font-medium ${
                    stat.trend.startsWith('+') ? 'text-green-600' : 
                    stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.trend !== '=' && (
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                    )}
                    {stat.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 shadow-card border-0">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Fitur yang sering digunakan untuk mahasiswa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="gap-2" 
                onClick={() => navigate('/peminjaman')}
              >
                <TestTube className="h-4 w-4" />
                Pinjam Alat Test
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate('/pengembalian')}
              >
                <CheckCircle className="h-4 w-4" />
                Kembalikan Alat
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate('/history')}
              >
                <FileText className="h-4 w-4" />
                Riwayat Peminjaman
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate('/queue')}
              >
                <Clock className="h-4 w-4" />
                Status Antrian
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Current Borrows */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Sedang Dipinjam
              </CardTitle>
              <CardDescription>
                Alat yang sedang Anda pinjam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentBorrows.filter(b => b.status === 'active').map((borrow) => (
                  <div 
                    key={borrow.id} 
                    className="p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate('/pengembalian')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{borrow.toolName}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{borrow.category}</p>
                        <p className="text-xs text-muted-foreground mt-1">Tujuan: {borrow.purpose}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {borrow.daysLeft && getUrgencyIcon(borrow.daysLeft)}
                        <span className="text-xs font-medium">
                          {borrow.daysLeft && borrow.daysLeft > 0 ? `${borrow.daysLeft} hari` : 'Hari ini'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Deadline: {new Date(borrow.dueDate).toLocaleDateString('id-ID')}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(borrow.status)}
                        <span className="text-xs text-muted-foreground">Klik untuk kembalikan</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {currentBorrows.filter(b => b.status === 'active').length === 0 && (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada alat yang sedang dipinjam</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/peminjaman')}
                    >
                      Pinjam Alat Sekarang
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Queue Status */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status Antrian
              </CardTitle>
              <CardDescription>
                Antrian alat kategori Copy 1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueStatus.map((queue) => (
                  <div 
                    key={queue.id} 
                    className="p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate('/queue')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{queue.toolName}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{queue.category}</p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Posisi #{queue.position}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Sedang dipinjam: {queue.currentUser}</div>
                      <div>Estimasi tersedia: {new Date(queue.estimatedDate).toLocaleDateString('id-ID')}</div>
                      <div className="text-xs text-primary mt-2">Klik untuk detail antrian</div>
                    </div>
                  </div>
                ))}
                
                {queueStatus.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada antrian saat ini</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Deadline Terdekat
            </CardTitle>
            <CardDescription>
              Alat yang harus segera dikembalikan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div 
                  key={deadline.id} 
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => navigate('/history')}
                >
                  <div className="flex items-center gap-3">
                    {getUrgencyIcon(deadline.daysLeft)}
                    <div>
                      <h4 className="font-medium text-sm">{deadline.toolName}</h4>
                      <p className="text-xs text-muted-foreground">{deadline.category}</p>
                      <p className="text-xs text-primary">Klik untuk lihat riwayat</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      {deadline.daysLeft > 0 ? `${deadline.daysLeft} hari lagi` : 'Hari ini'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(deadline.dueDate).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">Tidak ada deadline mendesak</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
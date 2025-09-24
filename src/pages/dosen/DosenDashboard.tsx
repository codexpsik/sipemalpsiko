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
  Calendar,
  TrendingUp,
  AlertTriangle,
  FileText,
  User,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  activeBorrowings: number;
  totalBorrowings: number;
  pendingApprovals: number;
  completedBorrowings: number;
}

export default function DosenDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeBorrowings: 0,
    totalBorrowings: 0,
    pendingApprovals: 0,
    completedBorrowings: 0
  });
  const [currentBorrows, setCurrentBorrows] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
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

      // Fetch dosen's borrowings stats
      const { count: totalBorrowings } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: activeBorrowings } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'approved');

      const { count: pendingApprovals } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      setStats({
        activeBorrowings: activeBorrowings || 0,
        totalBorrowings: totalBorrowings || 0,
        pendingApprovals: pendingApprovals || 0,
        completedBorrowings: 0
      });

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
      description: "Bulan ini",
      icon: BookOpen,
      trend: "+5%",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Menunggu Approval",
      value: stats.pendingApprovals.toString(),
      description: "Pending request",
      icon: Clock,
      trend: "=",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Selesai Bulan Ini",
      value: stats.completedBorrowings.toString(),
      description: "Dikembalikan",
      icon: CheckCircle,
      trend: "+3%",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

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
            <User className="h-8 w-8" />
            Dashboard Dosen
          </h1>
          <p className="text-muted-foreground">
            Selamat datang kembali, {profile?.nama || 'Dosen'}!
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
            <CardDescription>Fitur yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button className="gap-2" onClick={() => navigate('/peminjaman')}>
                <TestTube className="h-4 w-4" />
                Pinjam Alat Baru
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/pengembalian')}>
                <CheckCircle className="h-4 w-4" />
                Kembalikan Alat
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/history')}>
                <FileText className="h-4 w-4" />
                Riwayat Peminjaman
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
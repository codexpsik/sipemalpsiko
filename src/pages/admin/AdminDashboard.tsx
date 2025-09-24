import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TestTube, 
  ClipboardList, 
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalUsers: number;
  activeBorrowings: number;
  availableEquipment: number;
  todayReturns: number;
}

interface RecentActivity {
  id: string;
  user_name: string;
  action: string;
  equipment_name: string;
  created_at: string;
  status: string;
  type: string;
}

export default function AdminDashboard() {
  const [filterPeriod, setFilterPeriod] = useState("minggu");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeBorrowings: 0,
    availableEquipment: 0,
    todayReturns: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active borrowings
      const { count: activeBorrowings } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch available equipment (total stok)
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('stok');
      
      const availableEquipment = equipmentData?.reduce((sum, eq) => sum + eq.stok, 0) || 0;

      // Fetch today's returns
      const today = new Date().toISOString().split('T')[0];
      const { count: todayReturns } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('tanggal_kembali', today)
        .eq('status', 'approved');

      setStats({
        totalUsers: totalUsers || 0,
        activeBorrowings: activeBorrowings || 0,
        availableEquipment,
        todayReturns: todayReturns || 0
      });

      // Fetch recent activities (borrowings with user and equipment info)
      const { data: activitiesData } = await supabase
        .from('borrowings')
        .select(`
          id,
          status,
          created_at,
          profiles:user_id (nama),
          equipment:equipment_id (nama)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesData) {
        const formattedActivities = activitiesData.map((activity: any) => ({
          id: activity.id,
          user_name: activity.profiles?.nama || 'Unknown User',
          action: activity.status === 'pending' ? 'Mengajukan Peminjaman' : 
                 activity.status === 'approved' ? 'Peminjaman Disetujui' :
                 activity.status === 'active' ? 'Sedang Meminjam' :
                 activity.status === 'returned' ? 'Mengembalikan' : 'Update Status',
          equipment_name: activity.equipment?.nama || 'Unknown Equipment',
          created_at: activity.created_at,
          status: activity.status,
          type: 'borrow'
        }));
        setRecentActivities(formattedActivities);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} jam yang lalu`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} hari yang lalu`;
    }
  };

  const statsData = [
    {
      title: "Total User",
      value: stats.totalUsers.toString(),
      description: "Dosen & Mahasiswa",
      icon: Users,
      trend: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Peminjaman Aktif", 
      value: stats.activeBorrowings.toString(),
      description: "Sedang dipinjam",
      icon: ClipboardList,
      trend: "+5%",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Alat Tersedia",
      value: stats.availableEquipment.toString(),
      description: "Total stok",
      icon: TestTube,
      trend: "-3%",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Deadline Hari Ini",
      value: stats.todayReturns.toString(),
      description: "Harus dikembalikan",
      icon: Calendar,
      trend: "=",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const getStatusIcon = (status: string, type: string) => {
    if (type === "borrow") {
      switch (status) {
        case "pending":
          return <Clock className="h-4 w-4 text-yellow-600" />;
        case "approved":
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        case "active":
          return <ClipboardList className="h-4 w-4 text-blue-600" />;
        case "returned":
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        default:
          return <ClipboardList className="h-4 w-4 text-gray-600" />;
      }
    }
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>;
      case "returned":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Returned</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali! Berikut ringkasan sistem SIPEMAL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hari">Hari Ini</SelectItem>
                <SelectItem value="minggu">Minggu Ini</SelectItem>
                <SelectItem value="bulan">Bulan Ini</SelectItem>
                <SelectItem value="tahun">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Recent Activities */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Update terbaru dari sistem peminjaman
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(activity.status, activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">{activity.user_name}</h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.action} • {activity.equipment_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
            
            {recentActivities.length === 0 && (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada aktivitas terbaru</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
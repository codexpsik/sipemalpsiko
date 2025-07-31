import { useState } from "react";
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
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DosenDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Sedang Dipinjam",
      value: "3",
      description: "Alat aktif",
      icon: TestTube,
      trend: "+1",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Peminjaman", 
      value: "28",
      description: "Bulan ini",
      icon: BookOpen,
      trend: "+5",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Menunggu Approval",
      value: "2",
      description: "Pending request",
      icon: Clock,
      trend: "=",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Selesai Bulan Ini",
      value: "15",
      description: "Dikembalikan",
      icon: CheckCircle,
      trend: "+3",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const currentBorrows = [
    {
      id: "1",
      toolName: "MMPI-2 (Minnesota Multiphasic Personality Inventory)",
      category: "Harus Dikembalikan",
      startDate: "2024-01-20",
      dueDate: "2024-01-27",
      status: "active",
      daysLeft: 3
    },
    {
      id: "2",
      toolName: "WAIS-IV (Wechsler Adult Intelligence Scale)",
      category: "Harus Dikembalikan", 
      startDate: "2024-01-18",
      dueDate: "2024-01-25",
      status: "active",
      daysLeft: 1
    },
    {
      id: "3",
      toolName: "Beck Depression Inventory (BDI-II)",
      category: "Habis Pakai",
      startDate: "2024-01-22",
      dueDate: "2024-01-22",
      status: "completed",
      daysLeft: 0
    }
  ];

  const recentActivity = [
    {
      id: "1",
      action: "Peminjaman Disetujui",
      item: "TAT (Thematic Apperception Test)",
      date: "2024-01-22",
      status: "approved"
    },
    {
      id: "2", 
      action: "Pengembalian Selesai",
      item: "Rorschach Inkblot Test",
      date: "2024-01-21",
      status: "completed"
    },
    {
      id: "3",
      action: "Request Submitted",
      item: "Stanford-Binet Intelligence Scales",
      date: "2024-01-20",
      status: "pending"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aktif</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disetujui</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Menunggu</Badge>;
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Dosen</h1>
          <p className="text-muted-foreground">Selamat datang kembali, Dr. Sarah Wilson!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-hover transition-all duration-300 border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                  <span className="text-xs text-muted-foreground ml-1">dari bulan lalu</span>
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
              <Button 
                className="gap-2" 
                onClick={() => navigate('/peminjaman')}
              >
                <TestTube className="h-4 w-4" />
                Pinjam Alat Baru
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
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
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
                  <div key={borrow.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{borrow.toolName}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{borrow.category}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {getUrgencyIcon(borrow.daysLeft)}
                        <span className="text-xs font-medium">
                          {borrow.daysLeft > 0 ? `${borrow.daysLeft} hari` : 'Hari ini'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Deadline: {new Date(borrow.dueDate).toLocaleDateString('id-ID')}
                      </div>
                      {getStatusBadge(borrow.status)}
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

          {/* Recent Activity */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>
                Riwayat aktivitas peminjaman
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {activity.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : activity.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{activity.item}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/history')}
                >
                  Lihat Semua Aktivitas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
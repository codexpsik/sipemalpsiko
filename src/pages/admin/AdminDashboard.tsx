import { useState } from "react";
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
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const [filterPeriod, setFilterPeriod] = useState("minggu");

  const stats = [
    {
      title: "Total User",
      value: "142",
      description: "Dosen & Mahasiswa",
      icon: Users,
      trend: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Peminjaman Aktif", 
      value: "28",
      description: "Sedang dipinjam",
      icon: ClipboardList,
      trend: "+5%",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Alat Tersedia",
      value: "89",
      description: "Siap dipinjam",
      icon: TestTube,
      trend: "-3%",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Pengembalian Hari Ini",
      value: "7",
      description: "Harus dikembalikan",
      icon: Calendar,
      trend: "=",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      user: "Dr. Sarah Wilson",
      action: "Meminjam",
      item: "MMPI-2 Test Kit",
      time: "2 jam yang lalu",
      status: "pending",
      type: "borrow"
    },
    {
      id: 2,
      user: "Ahmad Rizki",
      action: "Mengembalikan",
      item: "Beck Depression Inventory",
      time: "3 jam yang lalu",
      status: "completed",
      type: "return"
    },
    {
      id: 3,
      user: "Prof. Michael Lee",
      action: "Meminjam",
      item: "Rorschach Test",
      time: "5 jam yang lalu",
      status: "approved",
      type: "borrow"
    },
    {
      id: 4,
      user: "Siti Nurhaliza",
      action: "Antrian",
      item: "TAT Cards",
      time: "1 hari yang lalu",
      status: "waiting",
      type: "queue"
    },
    {
      id: 5,
      user: "Dr. James Bond",
      action: "Mengembalikan",
      item: "WAIS-IV Kit",
      time: "1 hari yang lalu",
      status: "completed",
      type: "return"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Menunggu</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disetujui</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Selesai</Badge>;
      case "waiting":
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Antrian</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "borrow":
        return <ClipboardList className="h-4 w-4 text-blue-600" />;
      case "return":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "queue":
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Admin</h1>
        <p className="text-muted-foreground">Selamat datang kembali! Berikut ringkasan aktivitas SIPEMAL.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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

      {/* Filter & Activities */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Filter Section */}
        <Card className="lg:col-span-1 shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Data
            </CardTitle>
            <CardDescription>
              Sesuaikan tampilan data dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Periode Waktu</label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
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
            
            <div>
              <label className="text-sm font-medium mb-2 block">Kategori Alat</label>
              <Select defaultValue="semua">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  <SelectItem value="kembali">Harus Dikembalikan</SelectItem>
                  <SelectItem value="habis">Habis Pakai</SelectItem>
                  <SelectItem value="copy">Copy 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full">
              Terapkan Filter
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 shadow-card border-0">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Peminjaman dan pengembalian terkini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getActionIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.user}
                        </p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.action} <span className="font-medium">{activity.item}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full">
                Lihat Semua Aktivitas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
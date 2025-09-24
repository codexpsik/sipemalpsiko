import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Filter,
  Activity,
  Users,
  Eye,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  created_at: string;
  user?: {
    nama: string;
    role: string;
    username: string;
  };
}

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: "Error",
          description: "Gagal memuat log aktivitas",
          variant: "destructive",
        });
      } else {
        // Fetch user profiles for each unique user_id
        const userIds = [...new Set(data?.map(log => log.user_id).filter(Boolean))];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, nama, role, username')
            .in('user_id', userIds);

          // Merge profile data with audit logs
          const logsWithProfiles = data?.map(log => ({
            ...log,
            user: profilesData?.find(profile => profile.user_id === log.user_id)
          })) || [];

          setAuditLogs(logsWithProfiles);
        } else {
          setAuditLogs(data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesTable = tableFilter === "all" || log.table_name === tableFilter;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Tambah</Badge>;
      case "UPDATE":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ubah</Badge>;
      case "DELETE":
        return <Badge variant="destructive">Hapus</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getTableBadge = (tableName: string) => {
    const tableLabels: { [key: string]: { label: string; color: string } } = {
      'profiles': { label: 'Pengguna', color: 'bg-purple-100 text-purple-800' },
      'categories': { label: 'Kategori', color: 'bg-orange-100 text-orange-800' },
      'equipment': { label: 'Alat', color: 'bg-blue-100 text-blue-800' },
      'borrowings': { label: 'Peminjaman', color: 'bg-green-100 text-green-800' },
      'returns': { label: 'Pengembalian', color: 'bg-red-100 text-red-800' },
      'equipment_queue': { label: 'Antrian', color: 'bg-yellow-100 text-yellow-800' },
    };

    const config = tableLabels[tableName] || { label: tableName, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={`${config.color} hover:${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'dosen': 'bg-blue-100 text-blue-800',
      'mahasiswa': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={`${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'} hover:${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueActions = () => {
    const actions = [...new Set(auditLogs.map(log => log.action))];
    return actions.sort();
  };

  const getUniqueTables = () => {
    const tables = [...new Set(auditLogs.map(log => log.table_name))];
    return tables.sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat log aktivitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8" />
          Log Aktivitas Sistem
        </h1>
        <p className="text-muted-foreground mt-1">
          Pantau semua aktivitas pengguna dalam sistem
        </p>
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
                  placeholder="Cari nama pengguna, aksi, atau tabel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                {getUniqueActions().map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === 'CREATE' ? 'Tambah' : action === 'UPDATE' ? 'Ubah' : action === 'DELETE' ? 'Hapus' : action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Tabel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tabel</SelectItem>
                {getUniqueTables().map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
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
                <p className="text-sm text-muted-foreground">Total Log</p>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hari Ini</p>
                <p className="text-2xl font-bold">
                  {auditLogs.filter(log => 
                    new Date(log.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
                <p className="text-2xl font-bold">
                  {new Set(auditLogs.map(log => log.user_id)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tabel Teraktif</p>
                <p className="text-lg font-bold">
                  {auditLogs.length > 0 ? 
                    Object.entries(
                      auditLogs.reduce((acc: any, log) => {
                        acc[log.table_name] = (acc[log.table_name] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '-'
                    : '-'
                  }
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Log Aktivitas ({filteredLogs.length})</CardTitle>
          <CardDescription>
            Riwayat aktivitas sistem dalam 100 entri terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Tabel</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {log.user?.nama || 'System'}
                          </span>
                          {log.user?.role && getRoleBadge(log.user.role)}
                        </div>
                        {log.user?.username && (
                          <div className="text-sm text-muted-foreground">
                            @{log.user.username}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>{getTableBadge(log.table_name)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {log.record_id && (
                          <div>ID: {log.record_id.slice(0, 8)}...</div>
                        )}
                        {log.action === 'CREATE' && log.new_data && (
                          <div>Dibuat: {Object.keys(log.new_data).length} field</div>
                        )}
                        {log.action === 'UPDATE' && log.old_data && log.new_data && (
                          <div>Diubah: {Object.keys(log.new_data).filter(key => 
                            JSON.stringify(log.old_data[key]) !== JSON.stringify(log.new_data[key])
                          ).length} field</div>
                        )}
                        {log.action === 'DELETE' && log.old_data && (
                          <div>Dihapus: {Object.keys(log.old_data).length} field</div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredLogs.length === 0 && (
              <div className="p-12 text-center">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tidak Ada Log Ditemukan</h3>
                <p className="text-muted-foreground">
                  Coba ubah filter atau kata kunci pencarian.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
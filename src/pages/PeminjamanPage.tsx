import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BorrowingService, type BorrowingRequest } from "@/lib/borrowingService";
import { BUSINESS_RULES } from "@/lib/businessRules";
import { format } from "date-fns";
import { CalendarIcon, ShoppingCart, Search, Filter, AlertTriangle } from "lucide-react";

interface Equipment {
  id: string;
  nama: string;
  deskripsi: string;
  stok: number;
  gambar_url: string;
  kondisi: string;
  categories: {
    nama: string;
    tipe: string;
  };
}

export default function PeminjamanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Equipment catalog
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Borrowing form
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    purpose: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchEquipment();
    fetchCategories();
  }, [user, navigate]);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchQuery, categoryFilter]);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          categories(nama, tipe)
        `)
        .gt('stok', 0) // Only show available equipment
        .order('nama');

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to load equipment catalog",
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
      setCategories(data?.map(cat => cat.nama) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.categories?.nama === categoryFilter);
    }

    setFilteredEquipment(filtered);
  };

  const calculateMaxEndDate = (equipment: Equipment, startDate: Date): Date => {
    const categoryName = equipment.categories?.nama;
    const maxDays = BUSINESS_RULES.MAX_BORROWING_DURATION[categoryName as keyof typeof BUSINESS_RULES.MAX_BORROWING_DURATION] || 14;
    
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + maxDays);
    return maxEndDate;
  };

  const handleBorrowRequest = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      quantity: 1,
      startDate: undefined,
      endDate: undefined,
      purpose: ""
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !user || !formData.startDate || !formData.endDate) return;

    setSubmitting(true);

    try {
      const request: BorrowingRequest = {
        equipment_id: selectedEquipment.id,
        user_id: user.id,
        tanggal_pinjam: formData.startDate.toISOString().split('T')[0],
        tanggal_kembali: formData.endDate.toISOString().split('T')[0],
        jumlah: formData.quantity,
        catatan: formData.purpose
      };

      const result = await BorrowingService.createBorrowingRequest(request);

      if (result.success) {
        toast({
          title: "Success",
          description: "Borrowing request submitted successfully",
        });
        setIsFormOpen(false);
        setSelectedEquipment(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit borrowing request",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit borrowing request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailabilityBadge = (equipment: Equipment) => {
    if (equipment.stok > 0) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Tersedia ({equipment.stok})</Badge>;
    } else {
      return <Badge variant="destructive">Tidak Tersedia</Badge>;
    }
  };

  const getCategoryBadge = (categoryName: string) => {
    switch (categoryName) {
      case "Harus Dikembalikan":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Harus Dikembalikan</Badge>;
      case "Habis Pakai":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Habis Pakai</Badge>;
      case "Copy 1":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Copy 1</Badge>;
      default:
        return <Badge variant="secondary">{categoryName}</Badge>;
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading equipment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Peminjaman Alat Test
          </h1>
          <p className="text-muted-foreground mt-1">
            Pilih alat test yang ingin dipinjam dan ajukan permintaan peminjaman
          </p>
        </div>

        {/* Filters & Search */}
        <Card className="shadow-card border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama alat atau deskripsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
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

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <Card key={item.id} className="shadow-card border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.nama}</CardTitle>
                  {getAvailabilityBadge(item)}
                </div>
                <CardDescription className="text-sm">{item.deskripsi}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Kategori:</span>
                    {getCategoryBadge(item.categories?.nama || 'Unknown')}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Kondisi:</span>
                    <Badge variant="outline">{item.kondisi || 'Baik'}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Max Duration:</span>
                    <span className="text-sm font-medium">
                      {BUSINESS_RULES.MAX_BORROWING_DURATION[item.categories?.nama as keyof typeof BUSINESS_RULES.MAX_BORROWING_DURATION] || 14} hari
                    </span>
                  </div>

                  <Button 
                    onClick={() => handleBorrowRequest(item)}
                    disabled={item.stok === 0}
                    className="w-full"
                  >
                    {item.stok > 0 ? 'Ajukan Peminjaman' : 'Tidak Tersedia'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Tidak ada alat ditemukan</h3>
            <p className="text-muted-foreground">Coba ubah kata kunci pencarian atau filter kategori</p>
          </div>
        )}

        {/* Borrowing Form Modal */}
        {isFormOpen && selectedEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Ajukan Peminjaman</CardTitle>
                <CardDescription>
                  {selectedEquipment.nama}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Jumlah</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedEquipment.stok}
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label>Kategori</Label>
                      <div className="pt-2">
                        {getCategoryBadge(selectedEquipment.categories?.nama || 'Unknown')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tanggal Mulai</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? format(formData.startDate, "PPP") : "Pilih tanggal"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => {
                              setFormData(prev => ({ ...prev, startDate: date, endDate: undefined }));
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Tanggal Selesai</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-left font-normal"
                            disabled={!formData.startDate}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, "PPP") : "Pilih tanggal"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                            disabled={(date) => {
                              if (!formData.startDate) return true;
                              const maxEndDate = calculateMaxEndDate(selectedEquipment, formData.startDate);
                              return date < formData.startDate || date > maxEndDate;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Tujuan Peminjaman</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Jelaskan tujuan penggunaan alat test..."
                      value={formData.purpose}
                      onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                      required
                      rows={3}
                    />
                  </div>

                  {formData.startDate && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900">Informasi Peminjaman:</h4>
                      <ul className="text-sm text-blue-800 mt-1 space-y-1">
                        <li>• Maksimal durasi: {BUSINESS_RULES.MAX_BORROWING_DURATION[selectedEquipment.categories?.nama as keyof typeof BUSINESS_RULES.MAX_BORROWING_DURATION] || 14} hari</li>
                        <li>• Denda keterlambatan: Rp {(BUSINESS_RULES.PENALTY_RATES[selectedEquipment.categories?.nama as keyof typeof BUSINESS_RULES.PENALTY_RATES] || 5000).toLocaleString()}/hari</li>
                        <li>• Proses persetujuan: 1-2 hari kerja</li>
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !formData.startDate || !formData.endDate || !formData.purpose.trim()}
                      className="flex-1"
                    >
                      {submitting ? 'Mengajukan...' : 'Ajukan Peminjaman'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
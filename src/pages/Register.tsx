import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { 
  GraduationCap, 
  UserPlus, 
  Eye, 
  EyeOff,
  User,
  Mail,
  Phone,
  IdCard,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    nomor_whatsapp: "",
    email: "",
    jenis_kelamin: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Password dan konfirmasi password tidak sama!");
      return;
    }

    if (!formData.jenis_kelamin) {
      alert("Silakan pilih jenis kelamin!");
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        nama: formData.nama,
        username: formData.username,
        role: 'mahasiswa' as const, // Default role for registration
        nim: formData.nim,
        nomor_whatsapp: formData.nomor_whatsapp,
        jenis_kelamin: formData.jenis_kelamin as 'laki-laki' | 'perempuan',
      };

      const { error } = await signUp(formData.email, formData.password, profileData);
      
      if (!error) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card border-0">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-gradient-primary p-3 rounded-full">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Daftar Akun SIPEMAL</CardTitle>
                <CardDescription>
                  Isi form di bawah untuk membuat akun mahasiswa baru
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nama" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nama Lengkap
                    </Label>
                    <Input
                      id="nama"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.nama}
                      onChange={(e) => setFormData({...formData, nama: e.target.value})}
                      required
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nim" className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      NIM
                    </Label>
                    <Input
                      id="nim"
                      type="text"
                      placeholder="Masukkan NIM"
                      value={formData.nim}
                      onChange={(e) => setFormData({...formData, nim: e.target.value})}
                      required
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nomor_whatsapp" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Nomor WhatsApp
                    </Label>
                    <Input
                      id="nomor_whatsapp"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.nomor_whatsapp}
                      onChange={(e) => setFormData({...formData, nomor_whatsapp: e.target.value})}
                      required
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                    <Select 
                      value={formData.jenis_kelamin} 
                      onValueChange={(value) => setFormData({...formData, jenis_kelamin: value})}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Masukkan username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        className="h-11 pr-10"
                        disabled={isLoading}
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Konfirmasi password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                      className="h-11"
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Sudah punya akun?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Login di sini
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
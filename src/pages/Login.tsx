import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { GraduationCap, LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo login logic - in real app this would connect to backend
    const { username, password } = formData;
    
    // Demo users for testing
    if (username === "admin" && password === "admin123") {
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Administrator');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/admin');
    } else if (username === "dosen" && password === "dosen123") {
      localStorage.setItem('userRole', 'dosen');
      localStorage.setItem('userName', 'Dr. John Doe');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dosen');
    } else if (username === "mahasiswa" && password === "mahasiswa123") {
      localStorage.setItem('userRole', 'mahasiswa');
      localStorage.setItem('userName', 'Jane Student');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/mahasiswa');
    } else {
      alert('Username atau password salah!\n\nDemo accounts:\n- admin/admin123 (Admin)\n- dosen/dosen123 (Dosen)\n- mahasiswa/mahasiswa123 (Mahasiswa)');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-card border-0">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-gradient-primary p-3 rounded-full">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Masuk ke SIPEMAL</CardTitle>
                <CardDescription>
                  Masukkan username dan password untuk mengakses akun Anda
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  />
                </div>
                
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
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" size="lg">
                  <LogIn className="h-4 w-4" />
                  Masuk
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Belum punya akun?{" "}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Daftar di sini
                  </Link>
                </p>

                {/* Demo Information */}
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-sm mb-2 text-center">Demo Accounts:</h4>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>👨‍💼 <strong>Admin:</strong> admin / admin123</div>
                    <div>👨‍🏫 <strong>Dosen:</strong> dosen / dosen123</div>
                    <div>👨‍🎓 <strong>Mahasiswa:</strong> mahasiswa / mahasiswa123</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { GraduationCap, LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, profile, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user && profile) {
      switch (profile.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'dosen':
          navigate('/dosen');
          break;
        case 'mahasiswa':
          navigate('/mahasiswa');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (!error) {
        // Navigation will be handled by useEffect
      }
    } catch (error) {
      console.error('Login error:', error);
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
                  Masukkan email dan password untuk mengakses akun Anda
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="h-11"
                    disabled={isLoading}
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
                      disabled={isLoading}
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

                <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {isLoading ? 'Memproses...' : 'Masuk'}
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
                    <div>👨‍💼 <strong>Admin:</strong> admin@sipemal.com / admin123</div>
                    <div>👨‍🏫 <strong>Dosen:</strong> dosen@sipemal.com / dosen123</div>
                    <div>👨‍🎓 <strong>Mahasiswa:</strong> mahasiswa@sipemal.com / mahasiswa123</div>
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
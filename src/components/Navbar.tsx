import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Menu, 
  X, 
  User, 
  BookOpen, 
  TestTube,
  LogIn,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'dosen' | 'mahasiswa';
  userName?: string;
}

export function Navbar({ isAuthenticated = false, userRole, userName }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handlePeminjamanClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/peminjaman');
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
  };

  const getDashboardRoute = () => {
    switch (userRole) {
      case 'admin': return '/admin';
      case 'dosen': return '/dosen';
      case 'mahasiswa': return '/mahasiswa';
      default: return '/';
    }
  };

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SIPEMAL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Beranda
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  Peminjaman
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={handlePeminjamanClick}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Harus Dikembalikan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePeminjamanClick}>
                  <TestTube className="mr-2 h-4 w-4" />
                  Habis Pakai
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/pengembalian')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Pengembalian Alat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(getDashboardRoute())}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary-foreground font-medium">
                          {userName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden lg:inline">{userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogIn className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button variant="hero" onClick={() => navigate('/register')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Daftar
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border/20">
            <Link 
              to="/" 
              className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Beranda
            </Link>
            
            <Button 
              variant="ghost" 
              onClick={() => {
                handlePeminjamanClick();
                setIsOpen(false);
              }}
              className="w-full justify-start gap-2"
            >
              <TestTube className="h-4 w-4" />
              Peminjaman Alat
            </Button>

            {isAuthenticated ? (
              <div className="space-y-2 pt-2 border-t border-border/20">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate(getDashboardRoute());
                    setIsOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/profile');
                    setIsOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <User className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-destructive"
                >
                  <LogIn className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-border/20">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
                <Button 
                  variant="hero" 
                  onClick={() => {
                    navigate('/register');
                    setIsOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Daftar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { 
  TestTube, 
  BookOpen, 
  Users, 
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Harus Dikembalikan",
      description: "Alat test yang perlu dikembalikan setelah penggunaan",
      icon: BookOpen,
      color: "bg-blue-500",
      items: ["Minnesota Multiphasic Personality Inventory", "Wechsler Adult Intelligence Scale", "Beck Depression Inventory"]
    },
    {
      title: "Habis Pakai",
      description: "Alat test yang dapat digunakan sekali pakai",
      icon: TestTube,
      color: "bg-green-500", 
      items: ["Lembar Jawaban Tes", "Form Assessment", "Protokol Observasi"]
    },
    {
      title: "Copy 1",
      description: "Alat test dengan stok terbatas dan sistem antrian",
      icon: Star,
      color: "bg-orange-500",
      items: ["Thematic Apperception Test", "Rorschach Inkblot Test", "Stanford-Binet Intelligence Scales"]
    }
  ];

  const features = [
    {
      title: "Mudah Digunakan",
      description: "Interface yang intuitif untuk semua kalangan",
      icon: CheckCircle
    },
    {
      title: "Sistem Antrian",
      description: "Antrian otomatis untuk alat dengan stok terbatas",
      icon: Clock
    },
    {
      title: "Multi Role",
      description: "Mendukung Admin, Dosen, dan Mahasiswa",
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="gradient-text">SIPEMAL</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Sistem Peminjaman Alat Test Psikologi
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Platform modern untuk mengelola peminjaman alat test psikologi dengan mudah, 
                efisien, dan terintegrasi untuk kebutuhan akademik Anda.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => navigate('/auth')}
                className="gap-3"
              >
                <GraduationCap className="h-5 w-5" />
                Mulai Sekarang
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => navigate('/katalog')}
                className="gap-3"
              >
                <TestTube className="h-5 w-5" />
                Lihat Alat Test
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Kategori Alat Test</h3>
            <p className="text-muted-foreground text-lg">
              Tiga kategori alat test yang tersedia untuk dipinjam
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-hover transition-all duration-300 border-0 shadow-card animate-fade-up">
                <CardHeader className="text-center">
                  <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Contoh Alat:
                    </h4>
                    <ul className="space-y-2">
                      {category.items.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-6 gap-2"
                    onClick={() => navigate('/katalog')}
                  >
                    Lihat Semua
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Mengapa Memilih SIPEMAL?</h3>
            <p className="text-muted-foreground text-lg">
              Fitur-fitur unggulan yang memudahkan proses peminjaman
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-hover transition-all duration-300 border-0 shadow-card">
                <CardHeader>
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Memulai Peminjaman Alat Test?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Bergabunglah dengan ribuan mahasiswa dan dosen yang telah menggunakan SIPEMAL
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="gap-3"
            >
              <GraduationCap className="h-5 w-5" />
              Daftar Sekarang
            </Button>
            <Button 
              variant="glass" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="gap-3 text-white border-white/30"
            >
              Sudah Punya Akun? Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">SIPEMAL</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Sistem Peminjaman Alat Test Psikologi
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 SIPEMAL. Semua hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
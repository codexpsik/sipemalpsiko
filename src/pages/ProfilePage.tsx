import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { 
  User, 
  Camera, 
  Edit, 
  Save,
  Eye,
  EyeOff,
  Upload,
  Mail,
  Phone,
  IdCard,
  Calendar,
  MapPin
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // User data (would come from auth context in real app)
  const [userData, setUserData] = useState({
    nama: "Ahmad Rizki",
    nim: "2021001",
    email: "ahmad.rizki@student.edu",
    whatsapp: "081234567892",
    jenisKelamin: "Laki-laki",
    role: "mahasiswa",
    joinDate: "2023-09-01",
    profileImage: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&fit=crop&crop=face"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Ukuran file maksimal 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert("File harus berupa gambar");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdateProfile = () => {
    if (selectedFile) {
      // Simulate upload
      setUserData({
        ...userData,
        profileImage: previewUrl || userData.profileImage
      });
    }
    
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    alert("Profil berhasil diperbarui!");
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Mohon lengkapi semua field password!");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    // Simulate password change
    alert("Password berhasil diubah!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const currentImageUrl = previewUrl || userData.profileImage;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <User className="h-8 w-8" />
            Profil Saya
          </h1>
          <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Photo Card */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto Profil
              </CardTitle>
              <CardDescription>
                Upload foto profil Anda (Maks. 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {currentImageUrl ? (
                      <img 
                        src={currentImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {selectedFile && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">File dipilih:</p>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {!isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Foto
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2 shadow-card border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IdCard className="h-5 w-5" />
                    Informasi Profil
                  </CardTitle>
                  <CardDescription>
                    Data pribadi Anda (hanya foto dan password yang dapat diubah)
                  </CardDescription>
                </div>
                
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleUpdateProfile} className="gap-2">
                      <Save className="h-4 w-4" />
                      Simpan
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Foto
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nama Lengkap
                  </Label>
                  <Input 
                    value={userData.nama} 
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Tidak dapat diubah</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <IdCard className="h-4 w-4" />
                    NIM
                  </Label>
                  <Input 
                    value={userData.nim} 
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Tidak dapat diubah</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input 
                    value={userData.email} 
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Tidak dapat diubah</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </Label>
                  <Input 
                    value={userData.whatsapp} 
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Tidak dapat diubah</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Input 
                    value={userData.jenisKelamin} 
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Tidak dapat diubah</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Bergabung Sejak
                  </Label>
                  <Input 
                    value={new Date(userData.joinDate).toLocaleDateString('id-ID')} 
                    disabled 
                    className="bg-muted/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Change Password Card */}
        <Card className="mt-8 shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Ubah Password
            </CardTitle>
            <CardDescription>
              Perbarui password Anda untuk keamanan akun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label>Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Masukkan password saat ini"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Masukkan password baru"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
              </div>
              
              <div className="space-y-2">
                <Label>Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Konfirmasi password baru"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button onClick={handleChangePassword} className="gap-2">
                <Save className="h-4 w-4" />
                Ubah Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
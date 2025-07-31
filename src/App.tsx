import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageTools from "./pages/admin/ManageTools";
import ManageBorrowing from "./pages/admin/ManageBorrowing";
import ManageReturning from "./pages/admin/ManageReturning";
import DosenDashboard from "./pages/dosen/DosenDashboard";
import MahasiswaDashboard from "./pages/mahasiswa/MahasiswaDashboard";
import PengembalianPage from "./pages/PengembalianPage";
import PeminjamanPage from "./pages/PeminjamanPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="tools" element={<ManageTools />} />
            <Route path="borrowing" element={<ManageBorrowing />} />
            <Route path="returning" element={<ManageReturning />} />
          </Route>

          {/* User Routes */}
          <Route path="/dosen" element={<DosenDashboard />} />
          <Route path="/mahasiswa" element={<MahasiswaDashboard />} />
          <Route path="/peminjaman" element={<PeminjamanPage />} />
          <Route path="/pengembalian" element={<PengembalianPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

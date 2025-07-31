import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import Katalog from "./pages/Katalog";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageTools from "./pages/admin/ManageTools";
import ManageBorrowing from "./pages/admin/ManageBorrowing";
import ManageReturning from "./pages/admin/ManageReturning";
import AuditLogs from "./pages/admin/AuditLogs";
import DosenDashboard from "./pages/dosen/DosenDashboard";
import MahasiswaDashboard from "./pages/mahasiswa/MahasiswaDashboard";
import PeminjamanPage from "./pages/PeminjamanPage";
import PengembalianPage from "./pages/PengembalianPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/katalog" element={<Katalog />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="tools" element={<ManageTools />} />
              <Route path="borrowing" element={<ManageBorrowing />} />
              <Route path="returning" element={<ManageReturning />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>

            {/* Protected User Routes */}
            <Route path="/dosen" element={
              <ProtectedRoute requiredRole="dosen">
                <DosenDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/mahasiswa" element={
              <ProtectedRoute requiredRole="mahasiswa">
                <MahasiswaDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/peminjaman" element={
              <ProtectedRoute>
                <PeminjamanPage />
              </ProtectedRoute>
            } />
            
            <Route path="/pengembalian" element={
              <ProtectedRoute>
                <PengembalianPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
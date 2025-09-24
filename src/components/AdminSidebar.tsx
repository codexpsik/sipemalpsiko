import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  TestTube,
  BookOpen,
  ClipboardList,
  RotateCcw,
  Settings,
  GraduationCap
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manajemen User",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Manajemen Kategori",
    url: "/admin/categories",
    icon: BookOpen,
  },
  {
    title: "Manajemen Alat",
    url: "/admin/tools",
    icon: TestTube,
  },
  {
    title: "Manajemen Peminjaman",
    url: "/admin/borrowing",
    icon: ClipboardList,
  },
  {
    title: "Manajemen Pengembalian",
    url: "/admin/returning",
    icon: RotateCcw,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    const baseClasses = "transition-all duration-200 rounded-lg";
    return isActive(path) 
      ? `${baseClasses} bg-sidebar-primary text-sidebar-primary-foreground shadow-soft` 
      : `${baseClasses} hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`;
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="bg-sidebar-primary p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">SIPEMAL</h2>
                <p className="text-xs text-sidebar-foreground/70">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-sidebar-primary p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "text-sidebar-foreground/70 mb-2"}>
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(item.url)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          {!collapsed ? (
            <div className="text-xs text-sidebar-foreground/50 text-center">
              © 2024 SIPEMAL
            </div>
          ) : (
            <div className="flex justify-center">
              <Settings className="h-4 w-4 text-sidebar-foreground/50" />
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
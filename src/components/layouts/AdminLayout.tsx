import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Shield, LayoutDashboard, Users, UserCheck, Building2,
  FolderTree, HelpCircle, ClipboardList, LinkIcon, FileText,
  ScrollText, LogOut, Menu, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/agents", icon: UserCheck, label: "Agents" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/providers", icon: Building2, label: "Insurance Providers" },
  { to: "/admin/compartments", icon: FolderTree, label: "Compartments" },
  { to: "/admin/questions", icon: HelpCircle, label: "Question Bank" },
  { to: "/admin/assessments", icon: ClipboardList, label: "Assessments" },
  { to: "/admin/links", icon: LinkIcon, label: "Assessment Links" },
  { to: "/admin/responses", icon: FileText, label: "Responses" },
  { to: "/admin/audit", icon: ScrollText, label: "Audit Logs" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">X-Cyber</span>
          <span className="ml-auto rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.to, item.end)
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="mb-3 truncate text-sm text-muted-foreground">
            {user?.email}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

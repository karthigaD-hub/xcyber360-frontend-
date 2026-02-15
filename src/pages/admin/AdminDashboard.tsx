import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Building2, ClipboardList, Clock, Loader2, CheckCircle2, LinkIcon } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { adminService } from "@/services/admin.service";
import type { AdminDashboardStats, DashboardUser } from "@/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const UserListDialog = ({ title, users }: { title: string; users: DashboardUser[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="p-0 h-auto text-xs">View list →</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users</p>
          ) : users.map(u => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.getDashboardStats(),
  });

  const stats: AdminDashboardStats = data?.data || {
    total_customers: 0, total_agents: 0, total_providers: 0,
    total_assessments: 0, total_links: 0,
    yet_to_start: 0, in_progress: 0, submitted: 0,
    yet_to_start_users: [], in_progress_users: [], submitted_users: [],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your cyber risk assessments</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Customers" value={stats.total_customers} icon={Users} />
        <KpiCard title="Agents" value={stats.total_agents} icon={UserCheck} />
        <KpiCard title="Providers" value={stats.total_providers} icon={Building2} />
        <KpiCard title="Assessments" value={stats.total_assessments} icon={ClipboardList} />
        <KpiCard title="Links Created" value={stats.total_links} icon={LinkIcon} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-l-muted-foreground">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Yet To Start</p>
              <p className="mt-1 text-3xl font-bold text-card-foreground">{stats.yet_to_start}</p>
              <UserListDialog title="Yet To Start Users" users={stats.yet_to_start_users} />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-l-warning">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="mt-1 text-3xl font-bold text-card-foreground">{stats.in_progress}</p>
              <UserListDialog title="In Progress Users" users={stats.in_progress_users} />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Loader2 className="h-5 w-5 text-warning" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-l-success">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submitted</p>
              <p className="mt-1 text-3xl font-bold text-card-foreground">{stats.submitted}</p>
              <UserListDialog title="Submitted Users" users={stats.submitted_users} />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

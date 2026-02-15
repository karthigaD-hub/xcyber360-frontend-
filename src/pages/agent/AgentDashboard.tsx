import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Clock, Loader2, CheckCircle2, ClipboardList } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { agentService } from "@/services/agent.service";
import type { AgentDashboardStats, DashboardUser } from "@/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

const AgentDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["agent-dashboard"],
    queryFn: () => agentService.getDashboardStats(),
  });

  const stats: AgentDashboardStats = data?.data || {
    assigned_customers: 0, total_assessments: 0, total_links: 0,
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
        <h1 className="text-2xl font-bold text-foreground">Agent Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your assigned assessments overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Customers" value={stats.assigned_customers} icon={Users} />
        <KpiCard title="Assessments" value={stats.total_assessments} icon={ClipboardList} />
        <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-l-muted-foreground">
          <p className="text-sm font-medium text-muted-foreground">Yet To Start</p>
          <p className="mt-1 text-3xl font-bold text-card-foreground">{stats.yet_to_start}</p>
          <UserListDialog title="Yet To Start" users={stats.yet_to_start_users} />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-l-warning">
          <p className="text-sm font-medium text-muted-foreground">In Progress</p>
          <p className="mt-1 text-3xl font-bold text-card-foreground">{stats.in_progress}</p>
          <UserListDialog title="In Progress" users={stats.in_progress_users} />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-l-success">
          <p className="text-sm font-medium text-muted-foreground">Submitted</p>
          <p className="mt-1 text-3xl font-bold text-card-foreground">{stats.submitted}</p>
          <UserListDialog title="Submitted" users={stats.submitted_users} />
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;

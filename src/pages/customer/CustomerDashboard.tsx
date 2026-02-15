import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { customerService } from "@/services/customer.service";
import type { CustomerDashboardStats, CustomerDashboardLink } from "@/types";

const CustomerDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: () => customerService.getDashboard(),
  });

  const stats: CustomerDashboardStats = data?.data || {
    total_links: 0, yet_to_start: 0, in_progress: 0, submitted: 0, links: [],
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
        <h1 className="text-2xl font-bold text-foreground">My Assessments</h1>
        <p className="text-sm text-muted-foreground">Your assigned cyber security assessments</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard title="Total Links" value={stats.total_links} icon={ClipboardList} />
        <KpiCard title="Yet To Start" value={stats.yet_to_start} icon={Clock} />
        <KpiCard title="In Progress" value={stats.in_progress} icon={Loader2} />
        <KpiCard title="Submitted" value={stats.submitted} icon={CheckCircle2} />
      </div>

      <div className="space-y-4">
        {stats.links.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No assessment links assigned yet.</p>
          </div>
        ) : (
          stats.links.map((link: CustomerDashboardLink) => (
            <div key={link.id} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-card-foreground">{link.assessment_name}</h3>
                  <p className="text-sm text-muted-foreground">{link.insurance_provider_name}</p>
                  {link.agent_name && (
                    <p className="text-xs text-muted-foreground">Agent: {link.agent_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={link.status} />
                  <div className="w-32">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{link.progress_percent}%</span>
                    </div>
                    <Progress value={link.progress_percent} className="h-2" />
                  </div>
                  {link.status !== "SUBMITTED" && (
                    <Button size="sm" asChild className="gap-1">
                      <a href={link.link_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {link.status === "YET_TO_START" ? "Start" : "Continue"}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;

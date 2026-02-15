import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

const KpiCard = ({ title, value, icon: Icon, trend, className }: KpiCardProps) => (
  <div className={cn("rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md", className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-bold text-card-foreground">{value}</p>
        {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);

export default KpiCard;

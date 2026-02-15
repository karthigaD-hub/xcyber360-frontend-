import { cn } from "@/lib/utils";
import type { LinkStatus } from "@/types";

const statusConfig: Record<LinkStatus, { label: string; className: string }> = {
  YET_TO_START: {
    label: "Yet To Start",
    className: "bg-muted text-muted-foreground",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-warning/15 text-warning",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-success/15 text-success",
  },
};

const StatusBadge = ({ status }: { status: LinkStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

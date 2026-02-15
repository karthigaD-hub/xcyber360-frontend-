import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/DataTable";
import { Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { AuditLog } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const AdminAudit = () => {
  // ✅ NEVER use empty string with Radix Select
  const [filterEntity, setFilterEntity] = useState("ALL");
  const [filterAction, setFilterAction] = useState("ALL");

  const queryParams: Record<string, string> = {};

  if (filterEntity !== "ALL") {
    queryParams.entity_type = filterEntity;
  }

  if (filterAction !== "ALL") {
    queryParams.action = filterAction;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit", filterEntity, filterAction],
    queryFn: () =>
      adminService.getAuditLogs(
        Object.keys(queryParams).length ? queryParams : undefined
      ),
  });

  const columns = [
    { key: "action", header: "Action" },
    { key: "entity_type", header: "Entity" },
    { key: "performer_role", header: "Role" },
    { key: "ip_address", header: "IP Address" },
    {
      key: "created_at",
      header: "Timestamp",
      render: (l: AuditLog) =>
        new Date(l.created_at).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete trail of system actions
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Entity" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All Entities</SelectItem>
            <SelectItem value="AGENT">Agent</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="QUESTION">Question</SelectItem>
            <SelectItem value="ASSESSMENT">Assessment</SelectItem>
            <SelectItem value="ASSESSMENT_LINK">Link</SelectItem>
            <SelectItem value="RESPONSE">Response</SelectItem>
            <SelectItem value="AUTH">Auth</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Action" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
            <SelectItem value="SUBMIT">Submit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="action"
          searchPlaceholder="Search logs..."
        />
      )}
    </div>
  );
};

export default AdminAudit;

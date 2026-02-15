import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/DataTable";
import { Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { Customer } from "@/types";

// Admin can ONLY view customers — cannot create (only Agents can create customers)
const AdminCustomers = () => {
  const { data, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: () => adminService.getCustomers() });

  const columns = [
    { key: "name", header: "Name" },
    { key: "company_name", header: "Organisation" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Mobile" },
    { key: "agent_name", header: "Created By (Agent)" },
    { key: "created_at", header: "Created" },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">View all customers (created by agents)</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} searchKey="name" searchPlaceholder="Search customers..." />
      )}
    </div>
  );
};

export default AdminCustomers;

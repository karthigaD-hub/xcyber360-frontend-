import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import type { Agent } from "@/types";
import { adminService } from "@/services/admin.service";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AdminAgents = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: () => adminService.getAgents(),
  });

  const createMut = useMutation({
    mutationFn: (d: { name: string; email: string; phone?: string; designation?: string; emp_id?: string }) =>
      adminService.createAgent(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-agents"] });
      setOpen(false);
      toast({ title: res.message || "Agent created", description: `Temp password sent via email.` });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || undefined,
      designation: (fd.get("designation") as string) || undefined,
      emp_id: (fd.get("emp_id") as string) || undefined,
    });
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Mobile" },
    { key: "designation", header: "Designation" },
    { key: "emp_id", header: "Emp ID" },
    {
      key: "is_active", header: "Status",
      render: (a: Agent) => (
        <span className={a.is_active ? "text-success" : "text-destructive"}>
          {a.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    { key: "assigned_customers_count", header: "Customers" },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground">Manage broker employees</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Agent</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2"><Label>Name *</Label><Input name="name" placeholder="Agent name" required /></div>
              <div className="space-y-2"><Label>Email *</Label><Input name="email" type="email" placeholder="agent@company.com" required /></div>
              <div className="space-y-2"><Label>Mobile</Label><Input name="phone" placeholder="+91 98765 43210" /></div>
              <div className="space-y-2"><Label>Designation</Label><Input name="designation" placeholder="Senior Broker" /></div>
              <div className="space-y-2"><Label>Employee ID</Label><Input name="emp_id" placeholder="EMP-001" /></div>
              <p className="text-xs text-muted-foreground">A temporary password will be generated and emailed to the agent.</p>
              <Button type="submit" className="w-full" disabled={createMut.isPending}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Agent
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} searchKey="name" searchPlaceholder="Search agents..." />
      )}
    </div>
  );
};

export default AdminAgents;

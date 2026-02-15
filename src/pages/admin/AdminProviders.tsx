import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import type { InsuranceProvider } from "@/types";
import { adminService } from "@/services/admin.service";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AdminProviders = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin-providers"], queryFn: () => adminService.getProviders() });

  const createMut = useMutation({
    mutationFn: (d: Partial<InsuranceProvider>) => adminService.createProvider(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-providers"] });
      setOpen(false);
      toast({ title: res.message || "Provider created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      name: fd.get("name") as string,
      code: fd.get("code") as string,
      contact_email: (fd.get("contact_email") as string) || undefined,
      contact_phone: (fd.get("contact_phone") as string) || undefined,
    });
  };

  const columns = [
    { key: "name", header: "Provider Name" },
    { key: "code", header: "Code" },
    { key: "contact_email", header: "Email" },
    { key: "contact_phone", header: "Phone" },
    {
      key: "is_active", header: "Status",
      render: (p: InsuranceProvider) => (
        <span className={p.is_active ? "text-success" : "text-destructive"}>
          {p.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insurance Providers</h1>
          <p className="text-sm text-muted-foreground">Manage insurance provider profiles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Provider</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Insurance Provider</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2"><Label>Name *</Label><Input name="name" placeholder="Provider name" required /></div>
              <div className="space-y-2"><Label>Code *</Label><Input name="code" placeholder="e.g. PROV-001" required /></div>
              <div className="space-y-2"><Label>Contact Email</Label><Input name="contact_email" type="email" placeholder="contact@provider.com" /></div>
              <div className="space-y-2"><Label>Contact Phone</Label><Input name="contact_phone" placeholder="+91 98765 43210" /></div>
              <Button type="submit" className="w-full" disabled={createMut.isPending}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Provider
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} searchKey="name" searchPlaceholder="Search providers..." />
      )}
    </div>
  );
};

export default AdminProviders;

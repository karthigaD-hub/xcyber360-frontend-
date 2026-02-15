import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import type { Compartment } from "@/types";
import { adminService } from "@/services/admin.service";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AdminCompartments = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin-compartments"], queryFn: () => adminService.getCompartments() });

  const createMut = useMutation({
    mutationFn: (d: { name: string; description?: string; order?: number; question_range?: string }) =>
      adminService.createCompartment(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-compartments"] });
      setOpen(false);
      toast({ title: res.message || "Compartment created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      order: parseInt(fd.get("order") as string) || 0,
      question_range: (fd.get("question_range") as string) || undefined,
    });
  };

  const columns = [
    { key: "name", header: "Section Name" },
    { key: "description", header: "Description" },
    { key: "question_range", header: "Question Range" },
    { key: "question_count", header: "Questions", render: (c: Compartment) => c.question_count ?? 0 },
    { key: "order", header: "Order" },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compartments / Sections</h1>
          <p className="text-sm text-muted-foreground">Name sections and define question ranges (e.g., 1-12, 13-20)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Compartment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Compartment</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2"><Label>Section Name *</Label><Input name="name" placeholder="e.g. Network Security" required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" placeholder="Describe this section..." /></div>
              <div className="space-y-2">
                <Label>Question Range</Label>
                <Input name="question_range" placeholder="e.g. 1-15" />
                <p className="text-xs text-muted-foreground">Define which question numbers belong to this section</p>
              </div>
              <div className="space-y-2"><Label>Display Order</Label><Input name="order" type="number" placeholder="1" /></div>
              <Button type="submit" className="w-full" disabled={createMut.isPending}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Compartment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} searchKey="name" searchPlaceholder="Search compartments..." />
      )}
    </div>
  );
};

export default AdminCompartments;

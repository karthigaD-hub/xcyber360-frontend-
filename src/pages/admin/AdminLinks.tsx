import { useState } from "react";
import { Plus, Copy, ExternalLink, Loader2, Share2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import type { AssessmentLink } from "@/types";
import { adminService } from "@/services/admin.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AdminLinks = () => {
  const [open, setOpen] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | undefined>();
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [providerId, setProviderId] = useState<string | undefined>();
  const [agentId, setAgentId] = useState<string | undefined>();

  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-links"],
    queryFn: () => adminService.getAssessmentLinks(),
  });

  const { data: assessments } = useQuery({
    queryKey: ["admin-assessments"],
    queryFn: () => adminService.getAssessments(),
  });

  const { data: customers } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => adminService.getCustomers(),
  });

  const { data: providers } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: () => adminService.getProviders(),
  });

  const { data: agents } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: () => adminService.getAgents(),
  });

  const createMut = useMutation({
    mutationFn: adminService.createAssessmentLink,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-links"] });
      setOpen(false);
      toast({ title: res.message || "Link generated successfully" });

      // Reset selections
      setAssessmentId(undefined);
      setCustomerId(undefined);
      setProviderId(undefined);
      setAgentId(undefined);
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assessmentId || !customerId || !providerId) return;

    createMut.mutate({
      assessment_id: assessmentId,
      customer_id: customerId,
      insurance_provider_id: providerId,
      agent_id: agentId, // optional
    });
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  const shareWhatsApp = (url: string, customerName: string) => {
    const text = encodeURIComponent(
      `Hi ${customerName}, please complete your cyber security assessment: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const columns = [
    { key: "customer_name", header: "Customer" },
    { key: "assessment_name", header: "Assessment" },
    { key: "insurance_provider_name", header: "Insurance Provider" },
    { key: "agent_name", header: "Agent" },
    {
      key: "status",
      header: "Status",
      render: (l: AssessmentLink) => <StatusBadge status={l.status} />,
    },
    {
      key: "progress_percent",
      header: "Progress",
      render: (l: AssessmentLink) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${l.progress_percent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {l.progress_percent}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Assessment Links
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate, copy, and share assessment links
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Link
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Assessment Link</DialogTitle>
              <DialogDescription>
                Select customer, assessment and provider to generate a secure link.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleCreate}>
              {/* Customer */}
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Select
                  value={customerId}
                  onValueChange={(v) => setCustomerId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers?.data || []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assessment */}
              <div className="space-y-2">
                <Label>Assessment *</Label>
                <Select
                  value={assessmentId}
                  onValueChange={(v) => setAssessmentId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {(assessments?.data || [])
                      .filter((a) => a.status === "ACTIVE")
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.question_count} questions)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Provider */}
              <div className="space-y-2">
                <Label>Insurance Provider *</Label>
                <Select
                  value={providerId}
                  onValueChange={(v) => setProviderId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {(providers?.data || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code === "CONSOLIDATION" ? "📋 " : ""}
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Agent (Optional) */}
              <div className="space-y-2">
                <Label>Assign Agent (Optional)</Label>
                <Select
                  value={agentId}
                  onValueChange={(v) =>
                    setAgentId(v === "NO_AGENT" ? undefined : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO_AGENT">No agent</SelectItem>
                    {(agents?.data || []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  createMut.isPending ||
                  !assessmentId ||
                  !customerId ||
                  !providerId
                }
              >
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Generate Link
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="customer_name"
          searchPlaceholder="Search links..."
          actions={(link) => (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyLink(link.link_url)}
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  shareWhatsApp(
                    link.link_url,
                    link.customer_name || ""
                  )
                }
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" asChild>
                <a
                  href={link.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default AdminLinks;

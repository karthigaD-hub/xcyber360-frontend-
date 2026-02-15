import { useState } from "react";
import { Copy, ExternalLink, Loader2, Eye, Plus, Share2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import type { AssessmentLink, ResponseAnswer } from "@/types";
import { agentService } from "@/services/agent.service";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AgentCustomers = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewLinkId, setViewLinkId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["agent-links"],
    queryFn: () => agentService.getAssignedLinks(),
  });

  const createCustMut = useMutation({
    mutationFn: (d: { name: string; company_name: string; email: string; phone?: string; industry?: string }) =>
      agentService.createCustomer(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["agent-links"] });
      qc.invalidateQueries({ queryKey: ["agent-dashboard"] });
      setCreateOpen(false);
      toast({ title: res.message || "Customer created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resendMut = useMutation({
    mutationFn: (linkId: string) => agentService.resendLink(linkId),
    onSuccess: (res) => toast({ title: res.message || "Link resent" }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const { data: responseDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["agent-response", viewLinkId],
    queryFn: () => viewLinkId ? agentService.getResponse(viewLinkId) : null,
    enabled: !!viewLinkId,
  });

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  const shareWhatsApp = (url: string, customerName: string) => {
    const text = encodeURIComponent(`Hi ${customerName}, please complete your assessment: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCreateCust = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createCustMut.mutate({
      name: fd.get("name") as string,
      company_name: fd.get("company_name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || undefined,
      industry: (fd.get("industry") as string) || undefined,
    });
  };

  const columns = [
    { key: "customer_name", header: "Customer" },
    { key: "assessment_name", header: "Assessment" },
    { key: "insurance_provider_name", header: "Insurance Provider" },
    { key: "status", header: "Status", render: (l: AssessmentLink) => <StatusBadge status={l.status} /> },
    { key: "progress_percent", header: "Progress", render: (l: AssessmentLink) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-20 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${l.progress_percent}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">{l.progress_percent}%</span>
      </div>
    )},
  ];

  const detail = responseDetail?.data;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Customers & Assessments</h1>
          <p className="text-sm text-muted-foreground">Track, assist, and manage assigned assessments</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Customer</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateCust}>
              <div className="space-y-2"><Label>Name *</Label><Input name="name" required placeholder="Customer name" /></div>
              <div className="space-y-2"><Label>Organisation *</Label><Input name="company_name" required placeholder="Company name" /></div>
              <div className="space-y-2"><Label>Email *</Label><Input name="email" type="email" required placeholder="customer@company.com" /></div>
              <div className="space-y-2"><Label>Mobile</Label><Input name="phone" placeholder="+91 98765 43210" /></div>
              <div className="space-y-2"><Label>Industry</Label><Input name="industry" placeholder="e.g. Finance" /></div>
              <Button type="submit" className="w-full" disabled={createCustMut.isPending}>
                {createCustMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Customer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="customer_name"
          searchPlaceholder="Search customers..."
          actions={(link) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => copyLink(link.link_url)} title="Copy link">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => shareWhatsApp(link.link_url, link.customer_name || '')} title="WhatsApp">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setViewLinkId(link.id)} title="View responses">
                <Eye className="h-4 w-4" />
              </Button>
              {link.status !== 'SUBMITTED' && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={`${link.link_url}?mode=agent`} target="_blank" rel="noopener noreferrer" title="Fill as agent">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => resendMut.mutate(link.id)}
                disabled={resendMut.isPending}
              >
                Resend
              </Button>
            </div>
          )}
        />
      )}

      {/* Response view dialog */}
      <Dialog open={!!viewLinkId} onOpenChange={(o) => !o && setViewLinkId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Response Details</DialogTitle></DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : detail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {detail.customer_name}</div>
                <div><span className="text-muted-foreground">Provider:</span> {detail.insurance_provider_name}</div>
                <div><span className="text-muted-foreground">Status:</span> {detail.status}</div>
                <div><span className="text-muted-foreground">Progress:</span> {detail.progress_percent}%</div>
              </div>
              {(detail.answers || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No answers yet.</p>
              ) : (
                <div className="space-y-3">
                  {detail.answers.map((a: ResponseAnswer, i: number) => (
                    <div key={i} className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">{a.compartment_name} — {a.question_type}</p>
                      <p className="text-sm font-medium">{i + 1}. {a.question_text}</p>
                      <p className="text-sm mt-1 text-primary font-semibold">
                        Answer: {typeof a.answer === 'object' ? JSON.stringify(a.answer) : String(a.answer)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No response data</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentCustomers;

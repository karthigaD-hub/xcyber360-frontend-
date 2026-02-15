import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { AssessmentResponse, ResponseAnswer } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminResponses = () => {
  const [viewLinkId, setViewLinkId] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>("ALL");

  /* ================= FILTER PARAMS ================= */

  const queryParams: Record<string, string> = {};
  if (filterProvider !== "ALL") {
    queryParams.provider_id = filterProvider;
  }

  /* ================= FETCH ================= */

  const { data, isLoading } = useQuery({
    queryKey: ["admin-responses", filterProvider],
    queryFn: () =>
      adminService.getAllResponses(
        Object.keys(queryParams).length ? queryParams : undefined
      ),
  });

  const { data: providers } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: () => adminService.getProviders(),
  });

  const { data: responseDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin-response-detail", viewLinkId],
    queryFn: () =>
      viewLinkId ? adminService.getResponse(viewLinkId) : Promise.resolve(null),
    enabled: !!viewLinkId,
  });

  const responses: AssessmentResponse[] = data?.data ?? [];
  const providerList = providers?.data ?? [];
  const detail = responseDetail?.data;

  /* ================= TABLE ================= */

  const columns = [
    { key: "customer_name", header: "Customer" },
    { key: "assessment_name", header: "Assessment" },
    { key: "insurance_provider_name", header: "Insurance Provider" },
    { key: "agent_name", header: "Agent" },
    { key: "filled_by", header: "Filled By" },
    { key: "submitted_by", header: "Submitted By" },
    { key: "submitted_at", header: "Submitted At" },
    {
      key: "status",
      header: "Status",
      render: (r: AssessmentResponse) => (
        <StatusBadge status={r.status || "SUBMITTED"} />
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Responses</h1>
        <p className="text-sm text-muted-foreground">
          View submitted assessment responses (read-only)
        </p>
      </div>

      {/* FILTER */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterProvider} onValueChange={setFilterProvider}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by Provider" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All Providers</SelectItem>
            {providerList.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
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
          data={responses}
          searchKey="customer_name"
          searchPlaceholder="Search responses..."
          actions={(r: AssessmentResponse) => (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewLinkId(r.assessment_link_id)}
              >
                <Eye className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  adminService.exportResponses(
                    r.assessment_link_id,
                    "excel"
                  )
                }
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      )}

      {/* DETAIL DIALOG */}
      <Dialog
        open={!!viewLinkId}
        onOpenChange={(open) => !open && setViewLinkId(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
            <DialogDescription>
              Read-only submitted assessment response.
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : detail ? (
            <div className="space-y-4">
              {/* META */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>{" "}
                  {detail.customer_name}
                </div>
                <div>
                  <span className="text-muted-foreground">Provider:</span>{" "}
                  {detail.insurance_provider_name}
                </div>
                <div>
                  <span className="text-muted-foreground">Filled By:</span>{" "}
                  {detail.filled_by}
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  {detail.submitted_at}
                </div>
              </div>

              {/* ANSWERS */}
              <div className="space-y-3">
                {(detail.answers || []).map(
                  (a: ResponseAnswer, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border p-3"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {a.compartment_name} — {a.question_type}
                      </p>

                      <p className="text-sm font-medium">
                        {i + 1}. {a.question_text}
                      </p>

                      <p className="text-sm mt-1 text-primary font-semibold">
                        Answer:{" "}
                        {typeof a.answer === "object"
                          ? JSON.stringify(a.answer)
                          : String(a.answer)}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* EXPORT */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    viewLinkId &&
                    adminService.exportResponses(viewLinkId, "excel")
                  }
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Excel
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    viewLinkId &&
                    adminService.exportResponses(viewLinkId, "pdf")
                  }
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No response data available
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResponses;

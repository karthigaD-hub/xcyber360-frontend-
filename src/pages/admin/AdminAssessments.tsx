import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import type { Assessment, Question, AssessmentStatus } from "@/types";
import { adminService } from "@/services/admin.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AdminAssessments = () => {
  const [open, setOpen] = useState(false);
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [filterComp, setFilterComp] = useState("");

  const { toast } = useToast();
  const qc = useQueryClient();

  /* ================= FETCH ================= */

  const { data, isLoading } = useQuery({
    queryKey: ["admin-assessments"],
    queryFn: () => adminService.getAssessments(),
  });

  const { data: questionsData } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: () => adminService.getQuestions(),
  });

  const { data: compartments } = useQuery({
    queryKey: ["admin-compartments"],
    queryFn: () => adminService.getCompartments(),
  });

  const allQuestions: Question[] = questionsData?.data ?? [];
  const allCompartments = compartments?.data ?? [];
  const assessments: Assessment[] = data?.data ?? [];

  const filteredQ: Question[] =
    filterComp && filterComp !== "ALL"
      ? allQuestions.filter((q) => q.compartment_id === filterComp)
      : allQuestions;

  /* ================= MUTATIONS ================= */

  const createMut = useMutation({
    mutationFn: (d: {
      name: string;
      description?: string;
      question_ids: string[];
    }) => adminService.createAssessment(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-assessments"] });
      setOpen(false);
      setSelectedQIds([]);
      toast({ title: "Assessment created successfully" });
    },
  });

  const statusMut = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: AssessmentStatus;
    }) => adminService.updateAssessment(id, { status }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-assessments"] }),
  });

  /* ================= HANDLERS ================= */

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedQIds.length === 0) {
      toast({
        title: "Select at least one question",
        variant: "destructive",
      });
      return;
    }

    const fd = new FormData(e.currentTarget);

    createMut.mutate({
      name: (fd.get("name") as string).trim(),
      description:
        (fd.get("description") as string)?.trim() || undefined,
      question_ids: selectedQIds,
    });
  };

  const toggleQ = (id: string) => {
    setSelectedQIds((prev) =>
      prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id]
    );
  };

  /* ================= TABLE ================= */

  const columns = [
    { key: "name", header: "Assessment Name" },
    { key: "description", header: "Description" },
    { key: "question_count", header: "Questions" },
    {
      key: "status",
      header: "Status",
      render: (a: Assessment) => (
        <Select
          value={a.status}
          onValueChange={(v) =>
            statusMut.mutate({
              id: a.id,
              status: v as AssessmentStatus,
            })
          }
        >
          <SelectTrigger className="w-28 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    { key: "created_at", header: "Created" },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Assessments
          </h1>
          <p className="text-sm text-muted-foreground">
            Build assessments by selecting questions
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Assessment
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Assessment</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input name="name" required />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" />
              </div>

              <div className="space-y-2">
                <Label>
                  Select Questions ({selectedQIds.length})
                </Label>

                <Select
                  value={filterComp}
                  onValueChange={setFilterComp}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">
                      All Sections
                    </SelectItem>
                    {allCompartments.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {filteredQ.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No questions available.
                    </p>
                  ) : (
                    filteredQ.map((q) => (
                      <div key={q.id} className="flex gap-2">
                        <Checkbox
                          checked={selectedQIds.includes(q.id)}
                          onCheckedChange={() =>
                            toggleQ(q.id)
                          }
                        />
                        <Label className="text-xs">
                          [{q.compartment_name}]{" "}
                          {q.question_text}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMut.isPending}
              >
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Create Assessment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={assessments}
          searchKey="name"
          searchPlaceholder="Search assessments..."
        />
      )}
    </div>
  );
};

export default AdminAssessments;

import { useState } from "react";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import type { Question, QuestionType } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const AdminQuestions = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [questionType, setQuestionType] =
    useState<QuestionType>("YES_NO");

  const [selectedProviders, setSelectedProviders] =
    useState<string[]>([]);

  const [compartmentId, setCompartmentId] = useState("");

  // Filters
  const [filterProvider, setFilterProvider] =
    useState<string>("ALL");

  const [filterCompartment, setFilterCompartment] =
    useState<string>("ALL");

  const [bulkFile, setBulkFile] = useState<File | null>(null);

  /* ------------------ Query Params ------------------ */

  const queryParams: Record<string, string> = {};

  if (filterProvider !== "ALL")
    queryParams.provider_id = filterProvider;

  if (filterCompartment !== "ALL")
    queryParams.compartment_id = filterCompartment;

  /* ------------------ Queries ------------------ */

  const { data, isLoading } = useQuery({
    queryKey: ["admin-questions", queryParams],
    queryFn: () =>
      adminService.getQuestions(
        Object.keys(queryParams).length
          ? queryParams
          : undefined
      ),
  });

  const { data: compartments } = useQuery({
    queryKey: ["admin-compartments"],
    queryFn: () => adminService.getCompartments(),
  });

  const { data: providers } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: () => adminService.getProviders(),
  });

  /* ------------------ Mutations ------------------ */

  const createMut = useMutation({
    mutationFn: adminService.createQuestion,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      setOpen(false);
      setSelectedProviders([]);
      setCompartmentId("");
      toast({
        title: res.message || "Question created successfully",
      });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      }),
  });

  const bulkMut = useMutation({
    mutationFn: (file: File) =>
      adminService.bulkUploadQuestions(file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      qc.invalidateQueries({
        queryKey: ["admin-compartments"],
      });
      setOpen(false);
      setBulkFile(null);
      toast({
        title: res.message || "Bulk upload complete",
      });
    },
    onError: (e: any) =>
      toast({
        title: "Upload failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  /* ------------------ Handlers ------------------ */

  const handleCreate = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const optionsRaw = fd.get("options") as string;

    createMut.mutate({
      question_text: fd.get("question_text") as string,
      question_type: questionType,
      options:
        questionType === "MCQ"
          ? optionsRaw
              ?.split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      compartment_id: compartmentId,
      risk_weight:
        parseInt(fd.get("risk_weight") as string) || 5,
      applicable_providers: selectedProviders,
      order: parseInt(fd.get("order") as string) || 0,
    });
  };

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  /* ------------------ Table Columns ------------------ */

  const columns = [
    {
      key: "order",
      header: "#",
      render: (q: Question) => q.order || "-",
    },
    {
      key: "question_text",
      header: "Question",
      render: (q: Question) => (
        <span className="line-clamp-2 max-w-xs">
          {q.question_text}
        </span>
      ),
    },
    { key: "question_type", header: "Type" },
    { key: "compartment_name", header: "Section" },
    { key: "risk_weight", header: "Risk" },
    {
      key: "applicable_provider_names",
      header: "Providers",
      render: (q: Question) => (
        <span className="text-xs">
          {(q.applicable_provider_names || []).join(
            ", "
          ) || "—"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (q: Question) => (
        <span
          className={
            q.is_active
              ? "text-success"
              : "text-destructive"
          }
        >
          {q.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  /* ------------------ UI ------------------ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Question Bank
          </h1>
          <p className="text-sm text-muted-foreground">
            Central repository — filter by provider or
            section
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filterProvider}
          onValueChange={setFilterProvider}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              All Providers
            </SelectItem>
            {(providers?.data || []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterCompartment}
          onValueChange={setFilterCompartment}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              All Sections
            </SelectItem>
            {(compartments?.data || []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="question_text"
          searchPlaceholder="Search questions..."
        />
      )}
    </div>
  );
};

export default AdminQuestions;

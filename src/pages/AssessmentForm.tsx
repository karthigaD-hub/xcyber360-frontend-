import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Shield, ChevronLeft, ChevronRight, Save, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { assessmentService } from "@/services/assessment.service";
import type { AssessmentFormData } from "@/services/assessment.service";

const AssessmentForm = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const isAgentMode = searchParams.get("mode") === "agent";
  const { toast } = useToast();

  const [form, setForm] = useState<AssessmentFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    assessmentService.getFormByToken(token)
      .then((res) => {
        const data = res.data;
        setForm(data);
        if (data.is_submitted) {
          setSubmitted(true);
        }
        // Load draft answers
        if (data.draft_answers && data.draft_answers.length > 0) {
          const draftMap: Record<string, any> = {};
          data.draft_answers.forEach((d) => { draftMap[d.question_id] = d.answer; });
          setAnswers(draftMap);
        }
      })
      .catch((err) => setError(err.message || "Failed to load assessment"))
      .finally(() => setLoading(false));
  }, [token]);

  const setAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const buildAnswersArray = useCallback(() => {
    return Object.entries(answers)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([question_id, answer]) => ({ question_id, answer }));
  }, [answers]);

  const handleSaveDraft = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const result = await assessmentService.saveDraft(token, buildAnswersArray(), isAgentMode ? "AGENT" : "USER");
      toast({ title: "Draft saved", description: `Progress: ${result.progress_percent}%` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      await assessmentService.submit(token, buildAnswersArray(), isAgentMode ? "AGENT" : "USER", consent);
      setSubmitted(true);
      toast({ title: "Assessment submitted successfully" });
    } catch (err: any) {
      toast({ title: "Submit failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Assessment Submitted</h1>
          <p className="max-w-md text-muted-foreground">
            Your cyber security assessment has been submitted successfully. Responses are now locked and cannot be changed.
          </p>
        </div>
      </div>
    );
  }

  const totalSections = form.compartments.length;
  const section = form.compartments[currentSection];

  // Calculate real progress based on answered questions
  const totalQ = form.total_questions || form.compartments.reduce((s, c) => s + c.questions.length, 0);
  const answeredQ = Object.values(answers).filter((v) => v !== null && v !== undefined && v !== "").length;
  const progress = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground">{form.assessment_name}</h1>
            <p className="text-sm text-muted-foreground">
              {form.customer_name} — {form.insurance_provider_name}
              {isAgentMode && <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-xs font-semibold text-accent">Agent Assisted</span>}
            </p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Section {currentSection + 1} of {totalSections} — {section?.name}</span>
            <span>{progress}% ({answeredQ}/{totalQ} answered)</span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>
      </div>

      {/* Form body */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        {section && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">{section.name}</h2>
              <p className="text-sm text-muted-foreground">Please answer all questions in this section</p>
            </div>

            <div className="space-y-8">
              {section.questions.map((q, i) => (
                <div key={q.id} className="rounded-lg border border-border bg-card p-5">
                  <Label className="mb-3 block text-sm font-semibold text-card-foreground">
                    {i + 1}. {q.question_text}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(Risk: {q.risk_weight})</span>
                  </Label>

                  {q.question_type === "YES_NO" && (
                    <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswer(q.id, v)} className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                        <Label htmlFor={`${q.id}-yes`}>Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id={`${q.id}-no`} />
                        <Label htmlFor={`${q.id}-no`}>No</Label>
                      </div>
                    </RadioGroup>
                  )}

                  {q.question_type === "MCQ" && q.options && (
                    <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswer(q.id, v)} className="space-y-2">
                      {q.options.map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                          <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {(q.question_type === "TEXT" || q.question_type === "REFLEXIVE") && (
                    <Textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Enter your answer..."
                      className="min-h-[80px]"
                    />
                  )}

                  {q.question_type === "NUMBER" && (
                    <Input
                      type="number"
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Enter a number"
                      className="max-w-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" disabled={currentSection === 0} onClick={() => setCurrentSection((s) => s - 1)} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <Button variant="outline" className="gap-2" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>

          {currentSection < totalSections - 1 ? (
            <Button onClick={() => setCurrentSection((s) => s + 1)} className="gap-2">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
                <Label htmlFor="consent" className="text-xs text-muted-foreground">
                  I confirm the information is accurate
                </Label>
              </div>
              <Button onClick={handleSubmit} disabled={!consent || submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;

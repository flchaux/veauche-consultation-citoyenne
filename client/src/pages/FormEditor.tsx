import { useState } from "react";
import { useRoute, Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, Trash2, GripVertical, ArrowLeft, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type QuestionType = "text" | "textarea" | "radio" | "checkbox" | "select";

export default function FormEditor() {
  const [, params] = useRoute("/admin/form/:formId");
  const formId = params?.formId ? parseInt(params.formId) : 0;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("text");
  const [options, setOptions] = useState("");
  const [isRequired, setIsRequired] = useState(true);

  const utils = trpc.useUtils();
  const { data: form } = trpc.forms.getById.useQuery({ formId });
  const { data: questions = [] } = trpc.questions.listByForm.useQuery({ formId });
  const createQuestionMutation = trpc.questions.create.useMutation();
  const deleteQuestionMutation = trpc.questions.delete.useMutation();

  const handleCreateQuestion = async () => {
    if (!questionText.trim()) {
      toast.error("La question est obligatoire");
      return;
    }

    if (["radio", "checkbox", "select"].includes(questionType) && !options.trim()) {
      toast.error("Les options sont obligatoires pour ce type de question");
      return;
    }

    try {
      const optionsArray = options
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o);
      
      await createQuestionMutation.mutateAsync({
        formId,
        questionText,
        questionType,
        options: ["radio", "checkbox", "select"].includes(questionType)
          ? JSON.stringify(optionsArray)
          : undefined,
        isRequired: isRequired ? 1 : 0,
        orderIndex: questions.length,
      });

      toast.success("Question ajoutée");
      setIsCreateDialogOpen(false);
      setQuestionText("");
      setQuestionType("text");
      setOptions("");
      setIsRequired(true);
      utils.questions.listByForm.invalidate({ formId });
    } catch (error) {
      toast.error("Erreur lors de la création de la question");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      return;
    }

    try {
      await deleteQuestionMutation.mutateAsync({ questionId });
      toast.success("Question supprimée");
      utils.questions.listByForm.invalidate({ formId });
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Texte court",
      textarea: "Texte long",
      radio: "Choix unique",
      checkbox: "Choix multiples",
      select: "Liste déroulante",
    };
    return labels[type] || type;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{form?.title}</h1>
            <p className="text-muted-foreground mt-1">{form?.description}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/admin/analytics/${formId}`}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Voir les statistiques
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter une question</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle question pour votre formulaire
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Quelle est votre question ?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de réponse *</Label>
                  <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texte court</SelectItem>
                      <SelectItem value="textarea">Texte long</SelectItem>
                      <SelectItem value="radio">Choix unique</SelectItem>
                      <SelectItem value="checkbox">Choix multiples</SelectItem>
                      <SelectItem value="select">Liste déroulante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {["radio", "checkbox", "select"].includes(questionType) && (
                  <div className="space-y-2">
                    <Label htmlFor="options">Options (une par ligne) *</Label>
                    <Textarea
                      id="options"
                      value={options}
                      onChange={(e) => setOptions(e.target.value)}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={5}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="required" className="cursor-pointer">
                    Question obligatoire
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateQuestion} disabled={createQuestionMutation.isPending}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                Ce formulaire ne contient aucune question.
                <br />
                Cliquez sur "Ajouter une question" pour commencer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-muted-foreground">Q{index + 1}.</span>
                        {question.questionText}
                        {question.isRequired === 1 && (
                          <span className="text-destructive text-sm">*</span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Type: {getQuestionTypeLabel(question.questionType)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuestion(question.id)}
                      disabled={deleteQuestionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                {question.options && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">Options:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {JSON.parse(question.options).map((opt: string, idx: number) => (
                        <li key={idx} className="text-sm">
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-center">
                <strong>Lien du formulaire:</strong>{" "}
                <a
                  href={`/form/${formId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {window.location.origin}/form/{formId}
                </a>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

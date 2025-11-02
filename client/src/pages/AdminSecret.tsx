import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function AdminSecret() {
  const { user, loading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "text" as "text" | "textarea" | "radio" | "checkbox" | "select",
    options: "",
    isRequired: 0,
  });

  const { data: questions = [], refetch } = trpc.questions.list.useQuery();
  const createMutation = trpc.questions.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      setNewQuestion({
        questionText: "",
        questionType: "text",
        options: "",
        isRequired: 0,
      });
      toast.success("Question ajoutée avec succès");
    },
  });
  const deleteMutation = trpc.questions.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Question supprimée");
    },
  });

  const handleCreateQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      toast.error("Le texte de la question est requis");
      return;
    }

    const orderIndex = questions.length;
    createMutation.mutate({
      ...newQuestion,
      orderIndex,
    });
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Accès restreint</CardTitle>
            <CardDescription>Vous devez être connecté pour accéder au back-office.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-[#0D6EB2] hover:bg-[#0a5a94]">
              <a href={getLoginUrl()}>Se connecter avec Google</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du formulaire</h1>
            <p className="text-gray-600 mt-2">Créez et gérez les questions de votre consultation citoyenne</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0D6EB2] hover:bg-[#0a5a94] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter une question</DialogTitle>
                <DialogDescription>Créez une nouvelle question pour votre formulaire</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="questionText">Question *</Label>
                  <Textarea
                    id="questionText"
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                    placeholder="Entrez votre question..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="questionType">Type de réponse *</Label>
                  <Select
                    value={newQuestion.questionType}
                    onValueChange={(value: any) => setNewQuestion({ ...newQuestion, questionType: value })}
                  >
                    <SelectTrigger className="mt-1">
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

                {["radio", "checkbox", "select"].includes(newQuestion.questionType) && (
                  <div>
                    <Label htmlFor="options">Options (une par ligne) *</Label>
                    <Textarea
                      id="options"
                      value={newQuestion.options}
                      onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRequired"
                    checked={newQuestion.isRequired === 1}
                    onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, isRequired: checked ? 1 : 0 })}
                  />
                  <Label htmlFor="isRequired" className="cursor-pointer">
                    Question obligatoire
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateQuestion} className="bg-[#0D6EB2] hover:bg-[#0a5a94]">
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Questions ({questions.length})</h2>
          {questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Aucune question pour le moment.</p>
                <p className="text-sm text-gray-500 mt-2">Cliquez sur "Ajouter une question" pour commencer.</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question, index) => {
              const options = question.options ? JSON.parse(question.options) : [];
              return (
                <Card key={question.id} className="border-l-4 border-l-[#0D6EB2]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Q{index + 1}. {question.questionText}
                            {question.isRequired === 1 && <span className="text-red-500 ml-1">*</span>}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Type: {
                              question.questionType === "text" ? "Texte court" :
                              question.questionType === "textarea" ? "Texte long" :
                              question.questionType === "radio" ? "Choix unique" :
                              question.questionType === "checkbox" ? "Choix multiples" :
                              "Liste déroulante"
                            }
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {options.length > 0 && (
                    <CardContent>
                      <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {options.map((option: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600">{option}</li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

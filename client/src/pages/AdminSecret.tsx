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
import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { SortableQuestion } from "@/components/SortableQuestion";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function AdminSecret() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Vérifier l'authentification par mot de passe
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      setLocation("/admin-login");
    }
  }, [setLocation]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "text" as "text" | "textarea" | "radio" | "checkbox" | "select",
    options: "",
    isRequired: 0,
  });

  const { data: questions = [], refetch } = trpc.questions.list.useQuery();
  const [localQuestions, setLocalQuestions] = useState(questions);
  
  // Mettre à jour localQuestions quand questions change
  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
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
  
  const reorderMutation = trpc.questions.reorder.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Questions réorganisées");
    },
  });

  const handleCreateQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      toast.error("Le texte de la question est requis");
      return;
    }

    const orderIndex = questions.length;
    
    // Convertir les options en JSON si nécessaire
    let optionsJson = newQuestion.options;
    if (["radio", "checkbox", "select"].includes(newQuestion.questionType) && newQuestion.options) {
      const optionsArray = newQuestion.options.split("\n").map(opt => opt.trim()).filter(opt => opt.length > 0);
      optionsJson = JSON.stringify(optionsArray);
    }
    
    createMutation.mutate({
      ...newQuestion,
      options: optionsJson,
      orderIndex,
    });
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const oldIndex = localQuestions.findIndex((q) => q.id === active.id);
    const newIndex = localQuestions.findIndex((q) => q.id === over.id);
    
    const newQuestions = arrayMove(localQuestions, oldIndex, newIndex);
    setLocalQuestions(newQuestions);
    
    // Mettre à jour les orderIndex
    const updates = newQuestions.map((q, index) => ({
      id: q.id,
      orderIndex: index,
    }));
    
    reorderMutation.mutate({ questions: updates });
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
          <h2 className="text-xl font-semibold text-gray-800">Questions ({localQuestions.length})</h2>
          {localQuestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Aucune question pour le moment.</p>
                <p className="text-sm text-gray-500 mt-2">Cliquez sur "Ajouter une question" pour commencer.</p>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localQuestions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {localQuestions.map((question, index) => (
                    <SortableQuestion
                      key={question.id}
                      question={question}
                      index={index}
                      onDelete={handleDeleteQuestion}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function FormView() {
  const [, params] = useRoute("/form/:formId");
  const formId = params?.formId ? parseInt(params.formId) : 0;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [responseId, setResponseId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: form } = trpc.forms.getById.useQuery({ formId });
  const { data: questions = [] } = trpc.questions.listByForm.useQuery({ formId });
  const createResponseMutation = trpc.responses.create.useMutation();
  const saveAnswerMutation = trpc.answers.save.useMutation();
  const completeResponseMutation = trpc.responses.updateCompletion.useMutation();

  useEffect(() => {
    // Generate session ID on mount
    const sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sid);
  }, []);

  useEffect(() => {
    // Create response when session ID is ready
    if (sessionId && formId && !responseId) {
      createResponseMutation.mutate(
        { formId, sessionId },
        {
          onSuccess: (data) => {
            setResponseId(data.responseId);
          },
        }
      );
    }
  }, [sessionId, formId, responseId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = async () => {
    if (!currentQuestion || !responseId) return;

    const answer = answers[currentQuestion.id];
    
    // Validate required fields
    if (currentQuestion.isRequired && !answer) {
      toast.error("Cette question est obligatoire");
      return;
    }

    // Save answer
    try {
      await saveAnswerMutation.mutateAsync({
        responseId,
        questionId: currentQuestion.id,
        answerText: answer || "",
      });

      // Check if this is the last question
      if (currentQuestionIndex === questions.length - 1) {
        // Mark as completed
        await completeResponseMutation.mutateAsync({
          responseId,
          isCompleted: 1,
        });
        setIsCompleted(true);
        toast.success("Formulaire soumis avec succès !");
      } else {
        // Move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de la réponse");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const currentAnswer = answers[currentQuestion.id] || "";

    switch (currentQuestion.questionType) {
      case "text":
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Votre réponse..."
            className="text-lg"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Votre réponse..."
            className="text-lg min-h-32"
          />
        );

      case "radio":
        const radioOptions = currentQuestion.options ? JSON.parse(currentQuestion.options) : [];
        return (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
            {radioOptions.map((option: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="text-lg cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        const checkboxOptions = currentQuestion.options ? JSON.parse(currentQuestion.options) : [];
        const selectedOptions = currentAnswer ? currentAnswer.split(",") : [];
        
        const handleCheckboxChange = (option: string, checked: boolean) => {
          let newSelected = [...selectedOptions];
          if (checked) {
            newSelected.push(option);
          } else {
            newSelected = newSelected.filter((o) => o !== option);
          }
          handleAnswerChange(newSelected.join(","));
        };

        return (
          <div>
            {checkboxOptions.map((option: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id={`checkbox-${idx}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                />
                <Label htmlFor={`checkbox-${idx}`} className="text-lg cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "select":
        const selectOptions = currentQuestion.options ? JSON.parse(currentQuestion.options) : [];
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full p-3 border border-input rounded-md text-lg bg-background"
          >
            <option value="">Sélectionnez une option...</option>
            {selectOptions.map((option: string, idx: number) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="max-w-2xl w-full animate-slide-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">Merci !</CardTitle>
            <CardDescription className="text-lg">
              Votre réponse a été enregistrée avec succès.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <p className="text-lg text-muted-foreground">Ce formulaire ne contient aucune question.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="max-w-2xl w-full animate-slide-in">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <CardTitle className="text-2xl">
            {currentQuestion?.questionText}
            {currentQuestion?.isRequired === 1 && <span className="text-destructive ml-1">*</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestionInput()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={handleNext} disabled={saveAnswerMutation.isPending}>
            {currentQuestionIndex === questions.length - 1 ? "Terminer" : "Suivant"}
            {currentQuestionIndex < questions.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

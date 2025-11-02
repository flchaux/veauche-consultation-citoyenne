import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: questions = [] } = trpc.questions.list.useQuery();
  const { data: response } = trpc.responses.getOrCreate.useQuery({ sessionId });
  const saveAnswerMutation = trpc.answers.save.useMutation();
  const completeResponseMutation = trpc.responses.complete.useMutation();

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion || !response) return;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    // Sauvegarde automatique
    saveAnswerMutation.mutate({
      responseId: response.id,
      questionId: currentQuestion.id,
      answerText: value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!response) return;
    
    await completeResponseMutation.mutateAsync({ responseId: response.id });
    setIsSubmitted(true);
  };

  const canGoNext = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.isRequired === 1) {
      return !!answers[currentQuestion.id];
    }
    return true;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-12 text-center border-t-4 border-[#0D6EB2]">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-[#0D6EB2]" />
          </div>
          <h1 className="text-3xl font-bold text-[#0D6EB2] mb-4">Merci !</h1>
          <p className="text-gray-600 text-lg">
            Votre réponse a été enregistrée avec succès.
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 border-t-4 border-[#0D6EB2]">
          <div className="mb-8">
            <img src="/logo-veauche.png" alt="Veauche Mérite Mieux" className="h-24 mx-auto mb-6" />
            <img src="/header-consultation.png" alt="Consultation citoyenne" className="w-full rounded-lg shadow-md" />
          </div>
          <p className="text-center text-gray-600">
            Aucune question disponible pour le moment.
          </p>
        </div>
      </div>
    );
  }

  const renderQuestionInput = () => {
    const currentAnswer = answers[currentQuestion.id] || "";
    const options = currentQuestion.options ? JSON.parse(currentQuestion.options) : [];

    switch (currentQuestion.questionType) {
      case "text":
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full text-lg p-4 border-2 border-gray-300 focus:border-[#0D6EB2] rounded"
            placeholder="Votre réponse..."
          />
        );

      case "textarea":
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full text-lg p-4 border-2 border-gray-300 focus:border-[#0D6EB2] rounded min-h-[150px]"
            placeholder="Votre réponse..."
          />
        );

      case "radio":
        return (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange} className="space-y-4">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded hover:bg-gray-50 border border-gray-200">
                <RadioGroupItem value={option} id={`option-${index}`} className="border-[#0D6EB2]" />
                <Label htmlFor={`option-${index}`} className="text-lg cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        const selectedOptions = currentAnswer ? currentAnswer.split(",") : [];
        return (
          <div className="space-y-4">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded hover:bg-gray-50 border border-gray-200">
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    let newSelected = [...selectedOptions];
                    if (checked) {
                      newSelected.push(option);
                    } else {
                      newSelected = newSelected.filter(o => o !== option);
                    }
                    handleAnswerChange(newSelected.join(","));
                  }}
                  className="border-[#0D6EB2]"
                />
                <Label htmlFor={`checkbox-${index}`} className="text-lg cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "select":
        return (
          <Select value={currentAnswer} onValueChange={handleAnswerChange}>
            <SelectTrigger className="w-full text-lg p-4 border-2 border-gray-300 focus:border-[#0D6EB2]">
              <SelectValue placeholder="Sélectionnez une option..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string, index: number) => (
                <SelectItem key={index} value={option} className="text-lg">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 border-t-4 border-[#0D6EB2]">
        {/* Header avec logo et image */}
        <div className="mb-8">
          <img src="/logo-veauche.png" alt="Veauche Mérite Mieux" className="h-24 mx-auto mb-6" />
          <img src="/header-consultation.png" alt="Consultation citoyenne" className="w-full rounded-lg shadow-md mb-6" />
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} sur {totalQuestions}
            </span>
            <span className="text-sm font-medium text-[#0D6EB2]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0D6EB2] to-[#DF9F14] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.questionText}
            {currentQuestion.isRequired === 1 && <span className="text-red-500 ml-1">*</span>}
          </h2>
          {renderQuestionInput()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex items-center gap-2 border-[#0D6EB2] text-[#0D6EB2] hover:bg-[#0D6EB2] hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext()}
              className="flex items-center gap-2 bg-[#DF9F14] hover:bg-[#c88a10] text-white disabled:opacity-50"
            >
              Terminer
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2 bg-[#0D6EB2] hover:bg-[#0a5a94] text-white disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

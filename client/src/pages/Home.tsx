import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

export default function Home() {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: questions = [], isLoading } = trpc.questions.list.useQuery();
  const { data: response } = trpc.responses.getOrCreate.useQuery({ sessionId });
  const saveAnswerMutation = trpc.answers.save.useMutation();
  const completeResponseMutation = trpc.responses.complete.useMutation();
  const recordPageViewMutation = trpc.pageViews.record.useMutation();

  // Enregistrer la visite de la page (une seule fois au chargement)
  useEffect(() => {
    recordPageViewMutation.mutate();
  }, []);

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

  // Afficher le loader pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0D6EB2] mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la consultation...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="flex items-center justify-center p-0 md:p-8 min-h-screen">
          <div className="max-w-2xl w-full bg-white md:rounded-lg shadow-lg p-6 md:p-12 text-center border-t-4 border-[#0D6EB2]">
          <div className="mb-6">
            <img src="/logo-veauche.png" alt="Veauche Mérite Mieux" className="h-32 md:h-40 mx-auto mb-6" />
          </div>
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-[#0D6EB2]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0D6EB2] mb-4">Merci !</h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
            Merci pour votre participation. Votre réponse sera prise en compte dans la construction de nos propositions pour Veauche. Nous vous donnons rendez-vous le <strong>6 décembre au Centre Culturel Emile Pelletier</strong> pour la présentation des résultats suivi d'un verre de l'amitié.
          </p>
          <div className="border-t border-gray-200 pt-6">
            <ShareButtons />
          </div>
        </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 py-4 text-center text-xs text-gray-500">
          <a href="/mentions-legales" className="hover:text-[#0D6EB2] underline mx-2">
            Mentions légales
          </a>
          <span>|</span>
          <a href="/rgpd" className="hover:text-[#0D6EB2] underline mx-2">
            RGPD
          </a>
          <span>|</span>
          <a href="mailto:veauchemeritemieux@gmail.com" className="hover:text-[#0D6EB2] underline mx-2">
            Nous contacter
          </a>
        </footer>
      </div>
    );
  }

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 p-0 md:p-8">
        <div className="max-w-4xl w-full bg-white md:rounded-lg shadow-lg p-6 md:p-8 border-t-4 border-[#0D6EB2]">
          <div className="mb-6 md:mb-8">
            <img src="/logo-veauche.png" alt="Veauche Mérite Mieux" className="hidden md:block h-24 mx-auto mb-6" />
            <img src="/header-consultation.png" alt="Consultation citoyenne" className="w-screen md:w-full md:rounded-lg shadow-md max-h-32 md:max-h-none object-cover -mx-6 md:mx-0 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] md:left-0 md:right-0 md:ml-0 md:mr-0 md:relative" />
          </div>
          <p className="text-center text-gray-600">
            Aucune question disponible pour le moment.
          </p>
          <ShareButtons />
        </div>
      </div>
    );
  }

  const renderQuestionInput = () => {
    const currentAnswer = answers[currentQuestion.id] || "";
    let options = [];
    try {
      options = currentQuestion.options ? JSON.parse(currentQuestion.options) : [];
    } catch (e) {
      // Si le parsing échoue, traiter comme une chaîne avec des lignes
      options = currentQuestion.options ? currentQuestion.options.split("\n").filter(opt => opt.trim()) : [];
    }

    switch (currentQuestion.questionType) {
      case "text":
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full text-base md:text-lg p-3 md:p-4 border-2 border-gray-300 focus:border-[#0D6EB2] rounded min-h-[48px]"
            placeholder="Votre réponse..."
          />
        );

      case "textarea":
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full text-base md:text-lg p-3 md:p-4 border-2 border-gray-300 focus:border-[#0D6EB2] rounded min-h-[120px] md:min-h-[150px]"
            placeholder="Votre réponse..."
          />
        );

      case "radio":
        return (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange} className="space-y-3 md:space-y-4">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-4 md:p-3 rounded hover:bg-gray-50 border border-gray-200 min-h-[56px] md:min-h-0 cursor-pointer" onClick={() => handleAnswerChange(option)}>
                <RadioGroupItem value={option} id={`option-${index}`} className="border-[#0D6EB2] min-w-[20px] min-h-[20px]" />
                <Label htmlFor={`option-${index}`} className="text-base md:text-lg cursor-pointer flex-1 leading-snug">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        const selectedOptions = currentAnswer ? currentAnswer.split("|||") : [];
        const toggleOption = (option: string) => {
          const newSelected = [...selectedOptions];
          if (selectedOptions.includes(option)) {
            handleAnswerChange(newSelected.filter(o => o !== option).join("|||"));
          } else {
            newSelected.push(option);
            handleAnswerChange(newSelected.join("|||"));
          }
        };
        return (
          <div className="space-y-3 md:space-y-4">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-4 md:p-3 rounded hover:bg-gray-50 border border-gray-200 min-h-[56px] md:min-h-0">
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                  className="border-[#0D6EB2] min-w-[20px] min-h-[20px]"
                />
                <label 
                  htmlFor={`checkbox-${index}`} 
                  className="text-base md:text-lg cursor-pointer flex-1 leading-snug"
                >
                  {option}
                </label>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Bannière en dehors du layout sur mobile */}
      <div className="md:hidden w-full">
        <img src="/header-consultation.png" alt="Consultation citoyenne" className="w-full shadow-md object-cover" />
      </div>
      
      <div className="flex items-center justify-center p-0 md:p-4 md:min-h-screen">
        <div className="max-w-4xl w-full bg-white md:rounded-lg shadow-lg p-4 md:p-8 border-t-4 md:border-t-4 border-t-0 border-[#0D6EB2]">
          {/* Header avec logo et image pour desktop */}
          <div className="mb-4 md:mb-8">
            <img src="/logo-veauche.png" alt="Veauche Mérite Mieux" className="hidden md:block h-24 mx-auto mb-6" />
            <img src="/header-consultation.png" alt="Consultation citoyenne" className="hidden md:block w-full rounded-lg shadow-md mb-6 max-h-none object-cover" />
          </div>

        {/* Barre de progression */}
        <div className="mb-4 md:mb-8 sticky top-0 bg-white py-2 -mx-4 md:mx-0 px-4 md:px-0 z-10 md:static">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs md:text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} sur {totalQuestions}
            </span>
            <span className="text-xs md:text-sm font-medium text-[#0D6EB2]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0D6EB2] to-[#DF9F14] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 leading-tight">
            {currentQuestion.questionText}
            {currentQuestion.isRequired === 1 && <span className="text-red-500 ml-1">*</span>}
          </h2>
          {renderQuestionInput()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-gray-200 gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex items-center gap-1 md:gap-2 border-[#0D6EB2] text-[#0D6EB2] hover:bg-[#0D6EB2] hover:text-white disabled:opacity-50 px-4 md:px-6 py-3 md:py-2 text-sm md:text-base min-h-[48px] md:min-h-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Précédent</span>
          </Button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext()}
              className="flex items-center gap-1 md:gap-2 bg-[#DF9F14] hover:bg-[#c88a10] text-white disabled:opacity-50 px-4 md:px-6 py-3 md:py-2 text-sm md:text-base min-h-[48px] md:min-h-0"
            >
              Terminer
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center gap-1 md:gap-2 bg-[#0D6EB2] hover:bg-[#0a5a94] text-white disabled:opacity-50 px-4 md:px-6 py-3 md:py-2 text-sm md:text-base min-h-[48px] md:min-h-0"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-xs text-gray-500">
        <a href="/mentions-legales" className="hover:text-[#0D6EB2] underline mx-2">
          Mentions légales
        </a>
        <span>|</span>
        <a href="/rgpd" className="hover:text-[#0D6EB2] underline mx-2">
          RGPD
        </a>
        <span>|</span>
        <a href="mailto:veauchemeritemieux@gmail.com" className="hover:text-[#0D6EB2] underline mx-2">
          Nous contacter
        </a>
      </footer>
    </div>
  );
}

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronUp, CheckCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function ResponsesPage() {
  const [, setLocation] = useLocation();
  const [openResponseId, setOpenResponseId] = useState<number | null>(null);

  // Vérifier l'authentification par mot de passe
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      setLocation("/admin-login");
    }
  }, [setLocation]);

  const { data: responses = [] } = trpc.responses.list.useQuery();
  const { data: questions = [] } = trpc.questions.list.useQuery();
  const { data: allAnswers = [] } = trpc.answers.getAll.useQuery();

  // Ne compter que les réponses qui ont au moins une question répondue
  const responsesWithAnswers = responses.filter(r => {
    return allAnswers.some(a => a.responseId === r.id && a.answerText && a.answerText.trim() !== '');
  });

  const toggleResponse = (responseId: number) => {
    setOpenResponseId(openResponseId === responseId ? null : responseId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réponses - Consultation citoyenne</h1>
          <p className="text-gray-600 mt-2">
            {responsesWithAnswers.length} réponse{responsesWithAnswers.length > 1 ? 's' : ''} reçue{responsesWithAnswers.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste des réponses en accordéon */}
        <div className="space-y-3">
          {responsesWithAnswers.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-600">Aucune réponse pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            responsesWithAnswers.map((response) => {
              const responseAnswers = allAnswers.filter(a => a.responseId === response.id);
              const isOpen = openResponseId === response.id;

              return (
                <Collapsible key={response.id} open={isOpen} onOpenChange={() => toggleResponse(response.id)}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <CardTitle className="text-lg">Réponse #{response.id}</CardTitle>
                              <CardDescription className="text-left">
                                {new Date(response.createdAt).toLocaleString("fr-FR")}
                              </CardDescription>
                            </div>
                            {response.completedAt !== null ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4" />
                                Complété
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-4 h-4" />
                                En cours
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {responseAnswers.length} / {questions.length} réponses
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-6 border-t pt-4">
                          {questions.map((question, index) => {
                            const answer = responseAnswers.find(a => a.questionId === question.id);
                            const answerText = answer?.answerText || "";
                            // Remplacer le séparateur ||| par des virgules pour l'affichage
                            const displayText = answerText.replace(/\|\|\|/g, ", ");

                            return (
                              <div key={question.id} className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0D6EB2] text-white text-sm font-medium flex-shrink-0">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 mb-2">{question.questionText}</p>
                                    {displayText ? (
                                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                                        {displayText}
                                      </p>
                                    ) : (
                                      <p className="text-gray-400 italic">Pas de réponse</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileDown, Users, CheckCircle, Clock } from "lucide-react";
import * as XLSX from "xlsx";
import { getLoginUrl } from "@/const";

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const { data: responses = [] } = trpc.responses.list.useQuery(undefined, { enabled: !!user });
  const { data: questions = [] } = trpc.questions.list.useQuery();
  const { data: allAnswers = [] } = trpc.answers.getAll.useQuery(undefined, { enabled: !!user });

  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.isCompleted === 1).length;
  const inProgressResponses = totalResponses - completedResponses;
  const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  const handleExport = () => {
    const exportData = responses.map((response) => {
      const row: Record<string, string> = {
        "ID Réponse": response.id.toString(),
        "Date": new Date(response.createdAt).toLocaleString("fr-FR"),
        "Statut": response.isCompleted === 1 ? "Complété" : "En cours",
      };

      questions.forEach((question) => {
        const answer = allAnswers.find(
          (a) => a.responseId === response.id && a.questionId === question.id
        );
        // Remplacer le séparateur ||| par des virgules pour l'affichage dans Excel
        const answerText = answer?.answerText || "";
        row[question.questionText] = answerText.replace(/\|\|\|/g, ", ");
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Réponses");
    XLSX.writeFile(wb, `consultation-citoyenne-${new Date().toISOString().split('T')[0]}.xlsx`);
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
            <CardDescription>Vous devez être connecté pour accéder aux statistiques.</CardDescription>
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
            <h1 className="text-3xl font-bold text-gray-900">Statistiques - Consultation citoyenne</h1>
            <p className="text-gray-600 mt-2">Analyse des réponses et taux de conversion</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-[#DF9F14] hover:bg-[#c88a10] flex items-center gap-2"
            disabled={responses.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Exporter en XLSX
          </Button>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-[#0D6EB2]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des réponses</CardTitle>
              <Users className="h-4 w-4 text-[#0D6EB2]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses}</div>
              <p className="text-xs text-gray-600 mt-1">Réponses commencées</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réponses complètes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedResponses}</div>
              <p className="text-xs text-gray-600 mt-1">{completionRate}% de complétion</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#DF9F14]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-[#DF9F14]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressResponses}</div>
              <p className="text-xs text-gray-600 mt-1">Réponses non terminées</p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel de conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Funnel de conversion par question</CardTitle>
            <CardDescription>Visualisez le taux de réponse pour chaque question du formulaire</CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-center text-gray-600 py-8">Aucune question disponible</p>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const answersForQuestion = allAnswers.filter(a => a.questionId === question.id);
                  const responseRate = totalResponses > 0 
                    ? Math.round((answersForQuestion.length / totalResponses) * 100) 
                    : 0;

                  return (
                    <div key={question.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Q{index + 1}: {question.questionText}
                        </span>
                        <span className="text-sm font-semibold text-[#0D6EB2]">
                          {answersForQuestion.length} / {totalResponses} ({responseRate}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#0D6EB2] to-[#DF9F14] h-full transition-all duration-300 rounded-full"
                          style={{ width: `${responseRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des réponses */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des réponses</CardTitle>
            <CardDescription>Toutes les réponses reçues pour ce formulaire</CardDescription>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <p className="text-center text-gray-600 py-8">Aucune réponse pour le moment</p>
            ) : (
              <div className="space-y-3">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Réponse #{response.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(response.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div>
                      {response.isCompleted === 1 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Complété
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          En cours
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

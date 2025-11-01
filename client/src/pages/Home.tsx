import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";
import { FileText, BarChart3, CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />}
            <span className="text-xl font-bold">{APP_TITLE}</span>
          </div>
          <Button asChild>
            <Link href="/admin">Accéder au back-office</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Créez des formulaires
            <br />
            <span className="text-primary">question par question</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une plateforme moderne pour créer des formulaires multi-pages élégants,
            collecter des réponses en temps réel et analyser les résultats avec précision.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/admin">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Une question à la fois</h3>
            <p className="text-muted-foreground">
              Interface épurée qui présente une seule question par page pour une meilleure expérience utilisateur.
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
              <CheckCircle className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Sauvegarde automatique</h3>
            <p className="text-muted-foreground">
              Chaque réponse est enregistrée instantanément, aucun risque de perdre les données.
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Analyse approfondie</h3>
            <p className="text-muted-foreground">
              Visualisez le funnel de conversion et exportez toutes les réponses en Excel.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center space-y-6 p-12 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 border">
          <h2 className="text-3xl font-bold">Prêt à commencer ?</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Connectez-vous avec votre compte Google et créez votre premier formulaire en quelques minutes.
          </p>
          <Button size="lg" asChild>
            <Link href="/admin">Accéder au back-office</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 {APP_TITLE}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

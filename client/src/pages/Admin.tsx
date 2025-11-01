import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, Eye, Settings } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Admin() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: forms = [], isLoading } = trpc.forms.list.useQuery();
  const createFormMutation = trpc.forms.create.useMutation();
  const deleteFormMutation = trpc.forms.delete.useMutation();

  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    try {
      await createFormMutation.mutateAsync({
        title: newFormTitle,
        description: newFormDescription,
      });
      toast.success("Formulaire créé avec succès");
      setIsCreateDialogOpen(false);
      setNewFormTitle("");
      setNewFormDescription("");
      utils.forms.list.invalidate();
    } catch (error) {
      toast.error("Erreur lors de la création du formulaire");
    }
  };

  const handleDeleteForm = async (formId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce formulaire ?")) {
      return;
    }

    try {
      await deleteFormMutation.mutateAsync({ formId });
      toast.success("Formulaire supprimé");
      utils.forms.list.invalidate();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Formulaires</h1>
            <p className="text-muted-foreground mt-1">
              Créez et gérez vos formulaires multi-pages
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau formulaire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau formulaire</DialogTitle>
                <DialogDescription>
                  Donnez un titre et une description à votre formulaire
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    placeholder="Mon formulaire"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newFormDescription}
                    onChange={(e) => setNewFormDescription(e.target.value)}
                    placeholder="Description du formulaire..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateForm} disabled={createFormMutation.isPending}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                Vous n'avez pas encore de formulaire.
                <br />
                Cliquez sur "Nouveau formulaire" pour commencer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{form.title}</span>
                    {form.isActive === 1 ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Actif
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        Inactif
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {form.description || "Aucune description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Créé le {new Date(form.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/form/${form.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/form/${form.id}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Gérer
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteForm(form.id)}
                    disabled={deleteFormMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

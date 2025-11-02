# Guide Utilisateur - Consultation Citoyenne Veauche Mérite Mieux

## Informations

**Objectif** : Recueillir les avis des citoyens de Veauche sur les priorités et améliorations souhaitées pour la ville.

**Accès** : Le formulaire public est accessible à tous. Le back-office nécessite un mot de passe fixe.

## Powered by Manus

Cette application est construite avec une stack technologique moderne et performante. Le frontend utilise React 19 avec TypeScript pour une interface utilisateur réactive et typée, Tailwind CSS 4 pour un design responsive optimisé mobile, shadcn/ui pour des composants UI élégants et accessibles, et @dnd-kit pour la réorganisation intuitive par glisser-déposer. Le backend repose sur Express 4 avec tRPC 11 pour une API type-safe de bout en bout, Drizzle ORM pour une gestion de base de données performante et sécurisée, et Manus OAuth pour une authentification simplifiée. La base de données MySQL/TiDB assure un stockage fiable et scalable des réponses. Les fonctionnalités avancées incluent l'export XLSX avec la bibliothèque xlsx pour l'analyse des données, un système de funnel pour visualiser le taux de complétion, et une sauvegarde automatique à chaque réponse pour éviter toute perte de données. Le déploiement bénéficie d'une infrastructure auto-scalable avec CDN global pour des performances optimales partout dans le monde.

## Utiliser Votre Site Web

Le formulaire de consultation citoyenne s'affiche directement sur la page d'accueil avec le logo Veauche Mérite Mieux et le header de consultation. Répondez aux questions une par une en utilisant les boutons "Suivant" et "Précédent" pour naviguer. La barre de progression en haut vous indique votre avancement. Vos réponses sont automatiquement sauvegardées à chaque question, vous pouvez donc quitter et revenir plus tard sans perdre vos données. Pour les questions à choix multiples, cochez simplement les options qui vous conviennent en cliquant sur toute la ligne. Cliquez sur "Terminer" à la dernière question pour soumettre définitivement votre participation.

## Gérer Votre Site Web

Accédez au back-office en naviguant vers `/admin-login` et entrez le mot de passe fourni. Une fois connecté, vous arrivez sur la page "Mes Formulaires" où vous pouvez gérer les questions. Utilisez le bouton "Ajouter une question" pour créer une nouvelle question en choisissant le type (texte court, texte long, choix unique, choix multiples). Réorganisez l'ordre des questions par glisser-déposer en utilisant les poignées colorées à gauche de chaque question. Cliquez sur "Statistiques" dans le menu latéral pour voir les réponses, le funnel de complétion et exporter les données en XLSX. Le panneau Settings permet de modifier le titre et le logo. Le panneau Database donne accès aux données brutes.

## Prochaines Étapes

Parlez à Manus AI à tout moment pour demander des modifications ou ajouter des fonctionnalités. Commencez par créer vos questions de consultation et partagez le lien du formulaire avec les citoyens de Veauche pour recueillir leurs avis et améliorer ensemble votre ville.

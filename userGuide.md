# Guide Utilisateur - Consultation Citoyenne Veauche Mérite Mieux

## Informations Générales

**Objectif**: Recueillir l'avis des citoyens de Veauche à travers un formulaire de consultation en ligne, avec une navigation fluide question par question et une sauvegarde automatique des réponses.

**Accès**: Le formulaire public est accessible à tous sans connexion. Le back-office administrateur nécessite une connexion Google OAuth et est accessible uniquement via une URL spécifique.

## Powered by Manus

Cette application de consultation citoyenne repose sur une architecture web moderne et performante. Le frontend utilise **React 19** avec **TypeScript** pour une interface utilisateur réactive et sécurisée, stylisée avec **Tailwind CSS 4** pour un design responsive adapté à tous les écrans. Le backend est construit avec **Express 4** et **tRPC 11** pour une communication type-safe entre client et serveur. La persistance des données est assurée par une base de données **MySQL/TiDB** via **Drizzle ORM**. L'authentification administrateur s'appuie sur **Manus OAuth** avec Google. Le déploiement bénéficie d'une infrastructure auto-scalable avec CDN global pour des temps de chargement optimaux partout dans le monde.

## Utiliser Votre Site Web

### Répondre au formulaire

Accédez à la page d'accueil du site. Vous verrez le logo "Veauche Mérite Mieux" et le header de consultation citoyenne. Lisez la question affichée et sélectionnez votre réponse parmi les options proposées. Votre réponse est automatiquement sauvegardée dès que vous la sélectionnez. Cliquez sur "Suivant" pour passer à la question suivante, ou "Précédent" pour revenir en arrière. Une barre de progression indique votre avancement. À la dernière question, cliquez sur "Terminer" pour soumettre définitivement vos réponses.

### Gérer les questions (administrateur)

Connectez-vous en accédant à l'URL `/admin-secret` puis authentifiez-vous avec Google. Une fois connecté, cliquez sur "Ajouter une question". Saisissez le texte de votre question, choisissez le type de réponse (texte court, texte long, choix unique, choix multiples ou liste déroulante). Pour les questions à choix, entrez les options une par ligne dans le champ prévu. Cochez "Question obligatoire" si nécessaire, puis cliquez sur "Ajouter". Les questions apparaissent dans l'ordre de création. Pour supprimer une question, cliquez sur l'icône corbeille à droite de la question.

### Consulter les statistiques (administrateur)

Depuis le back-office, accédez à la page "Statistiques" via le menu latéral ou l'URL `/admin-secret/analytics`. Vous verrez le nombre total de réponses, le taux de complétion, et le nombre de réponses en cours. Le funnel de conversion affiche le pourcentage de répondants ayant répondu à chaque question. Cliquez sur "Exporter en XLSX" pour télécharger toutes les réponses au format Excel avec une colonne par question.

## Gérer Votre Site Web

Utilisez le panneau **Settings** dans l'interface de gestion pour modifier le titre et le logo de l'application. Le panneau **Dashboard** affiche les statistiques de trafic et la visibilité du site. Le panneau **Database** permet de consulter directement les données stockées. Pour accéder au back-office, utilisez l'URL spécifique `/admin-secret` qui n'est pas visible publiquement.

## Prochaines Étapes

Parlez à Manus AI à tout moment pour demander des modifications ou ajouter des fonctionnalités. Commencez par créer vos premières questions de consultation et partagez le lien du formulaire avec les citoyens de Veauche pour recueillir leurs avis.

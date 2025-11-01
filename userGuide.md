# Guide Utilisateur - Formulaire Multi-Pages avec Back-Office

## Informations Générales

**Objectif**: Créer des formulaires multi-pages élégants, collecter des réponses en temps réel et analyser les résultats avec des statistiques détaillées.

**Accès**: Connexion requise via Google OAuth pour accéder au back-office. Les formulaires publics sont accessibles sans connexion.

## Powered by Manus

Cette application est construite avec une stack technologique moderne et performante. Le frontend utilise **React 19** avec **TypeScript** pour une expérience utilisateur fluide et sécurisée, accompagné de **Tailwind CSS 4** pour un design responsive et personnalisable. Le backend repose sur **Express 4** avec **tRPC 11** pour une communication type-safe entre le client et le serveur. La base de données **MySQL/TiDB** via **Drizzle ORM** assure la persistance des données. L'authentification est gérée par **Manus OAuth** avec Google. Le déploiement bénéficie d'une infrastructure auto-scalable avec CDN global pour des performances optimales partout dans le monde.

## Utiliser Votre Site Web

### Créer un formulaire

Après connexion, cliquez sur "Nouveau formulaire" depuis la page "Mes Formulaires". Remplissez le titre et la description, puis cliquez sur "Créer". Vous accédez ensuite à la gestion des questions en cliquant sur "Gérer".

### Ajouter des questions

Dans l'éditeur de formulaire, cliquez sur "Ajouter une question". Saisissez votre question, choisissez le type de réponse (texte court, texte long, choix unique, choix multiples ou liste déroulante). Pour les questions à choix, ajoutez les options une par ligne. Cochez "Question obligatoire" si nécessaire, puis cliquez sur "Ajouter".

### Partager le formulaire

Une fois vos questions créées, copiez le lien du formulaire affiché en bas de la page. Partagez ce lien avec vos répondants. Ils verront une question à la fois avec une barre de progression. Chaque réponse est automatiquement sauvegardée.

### Analyser les résultats

Cliquez sur "Voir les statistiques" depuis l'éditeur de formulaire ou "Statistiques" dans le menu. Vous verrez le nombre total de réponses, le taux de complétion, et le funnel de conversion par question. Cliquez sur "Exporter en XLSX" pour télécharger toutes les réponses au format Excel.

## Gérer Votre Site Web

Utilisez le panneau **Settings** dans l'interface de gestion pour modifier le titre et le logo de l'application. Le panneau **Dashboard** affiche les statistiques de trafic et la visibilité du site. Le panneau **Database** permet de consulter directement les données stockées. Pour gérer les formulaires, utilisez les boutons "Voir", "Gérer" et l'icône de suppression sur chaque carte de formulaire.

## Prochaines Étapes

Parlez à Manus AI à tout moment pour demander des modifications ou ajouter des fonctionnalités. Commencez par créer votre premier formulaire et partagez-le pour collecter vos premières réponses.

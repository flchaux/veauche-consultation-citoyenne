# Consultation Citoyenne - Veauche Mérite Mieux

Application web de formulaire multi-pages pour la consultation citoyenne de Veauche.

## Fonctionnalités

- **Formulaire public** : Navigation fluide avec une question par page, sauvegarde automatique des réponses
- **Back-office sécurisé** : Gestion des questions, visualisation des réponses, statistiques et funnel de conversion
- **Export XLSX** : Export des réponses pour analyse externe
- **Design responsive** : Optimisé pour mobile et desktop avec la palette de couleurs de Veauche Mérite Mieux

## Technologies

- Frontend : React 19 + TypeScript + Tailwind CSS 4
- Backend : Express 4 + tRPC 11
- Base de données : MySQL/TiDB
- Authentification : Google OAuth + mot de passe fixe pour le back-office

## Installation

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer la base de données
pnpm db:push

# Démarrer le serveur de développement
pnpm dev
```

## Accès

- **Formulaire public** : `/`
- **Back-office** : `/admin-login` (mot de passe : vmm4Ever)
- **Statistiques** : `/admin-secret/analytics`

## Déploiement

Le projet peut être déployé sur :
- Manus (recommandé - bouton Publish)
- Vercel / Railway / Render
- Tout hébergeur Node.js avec base de données MySQL

## License

Propriété de Veauche Mérite Mieux

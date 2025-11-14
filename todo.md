# Project TODO

## Formulaire Multi-Pages
- [x] Créer le schéma de base de données pour les formulaires et questions
- [x] Créer le schéma de base de données pour les réponses
- [x] Implémenter la page de formulaire public avec navigation une question par page
- [x] Implémenter la sauvegarde automatique à chaque réponse de question
- [x] Appliquer la palette de couleurs (#0D6EB2 et #DF9F14) au design

## Back-Office avec Authentification Google
- [x] Configurer l'authentification Google OAuth
- [x] Créer le layout du dashboard administrateur
- [x] Implémenter la gestion des formulaires (créer, éditer, supprimer)
- [x] Implémenter la gestion des questions (créer, éditer, supprimer, réordonner)

## Visualisation et Analyse
- [x] Créer la page de visualisation des réponses par formulaire
- [x] Implémenter le funnel de taux de réponse par question
- [x] Créer la fonctionnalité d'exportation des réponses en XLSX

## Design et UX
- [x] Appliquer la palette de couleurs personnalisée dans index.css
- [x] Créer des composants réutilisables avec le thème personnalisé
- [x] Assurer la responsivité sur mobile et desktop

## Modifications Architecture
- [x] Supprimer la gestion multi-formulaires (un seul formulaire unique)
- [x] Modifier la page d'accueil pour afficher directement le formulaire
- [x] Masquer le back-office sur une URL spécifique (/admin-secret)
- [x] Intégrer le logo Veauche Mérite Mieux
- [x] Intégrer le header de consultation citoyenne
- [x] Créer un design "papier" pour le formulaire
- [x] Adapter la palette de couleurs au branding de la ville

## Bugs à corriger
- [x] Erreur JSON lors de la création de questions à choix multiples (les options doivent être converties en tableau JSON)

## Nouvelle fonctionnalité
- [x] Ajouter la réorganisation des questions par glisser-déposer (drag and drop)

## Bugs à corriger
- [x] Certaines options des QCM ne peuvent pas être sélectionnées (Cadre de vie, Jeunesse)

## Améliorations mobile
- [x] Optimiser la taille du logo et de l'en-tête sur mobile
- [x] Augmenter la taille des zones de saisie (textarea, input)
- [x] Agrandir les checkboxes et radio buttons (min 44x44px)
- [x] Augmenter l'espacement entre les options
- [x] Améliorer les boutons de navigation (plus larges et visibles)
- [x] Fixer la barre de progression en haut lors du scroll
- [x] Augmenter la taille de police des questions sur mobile
- [x] Améliorer les zones cliquables (toute la ligne pour checkboxes)
- [x] Ajouter des marges latérales adaptées sur mobile

## Nouvelles modifications
- [x] Masquer le logo sur mobile (uniquement bannière visible)
- [x] Réduire au maximum les marges autour de la bannière sur mobile
- [x] Ajouter protection par mot de passe fixe "vmm4Ever" pour le back-office

## Ajustement bannière mobile
- [ ] Faire en sorte que la bannière prenne toute la largeur de la zone blanche sur mobile (sans marges latérales)

## Ajustements finaux
- [x] Faire en sorte que la bannière prenne toute la largeur de la zone blanche sur mobile (sans marges latérales)
- [x] Ajouter le logo sur la page de remerciement

## Bug à corriger
- [x] Le clic sur le label d'une checkbox doit sélectionner la checkbox

## Nouvelles modifications
- [x] Agrandir le logo sur la page de remerciement

## Corrections urgentes
- [x] Sortir la bannière du layout pour la mettre en full width sur mobile
- [x] Corriger les labels des checkboxes qui ne sont plus cliquables

## Ajustements bannière
- [x] Remplacer la bannière par la nouvelle version
- [x] Réduire la marge verticale entre la bannière et la question sur mobile (problème de min-height)

## Migration PostgreSQL
- [x] Remplacer le driver MySQL par PostgreSQL
- [x] Adapter le schéma Drizzle pour PostgreSQL
- [x] Mettre à jour les dépendances
- [ ] Configurer DATABASE_URL PostgreSQL et tester la migration

## Suppression OAuth
- [x] Supprimer toutes les mentions à OAuth dans le code
- [x] Supprimer les variables d'environnement OAuth
- [x] Simplifier l'authentification (mot de passe uniquement)

## Diagnostic et correction schéma PostgreSQL
- [x] Vérifier la configuration DATABASE_URL
- [x] Diagnostiquer pourquoi le schéma n'est pas créé (drizzle.config.ts utilisait "mysql" au lieu de "postgresql")
- [x] Générer et appliquer les migrations Drizzle
- [x] Vérifier que les tables sont créées correctement

## Ajout du favicon
- [x] Copier le favicon dans le dossier public
- [x] Mettre à jour le HTML pour référencer le nouveau favicon

## Modification message de remerciement et titre
- [x] Modifier le message de confirmation pour inclure l'invitation du 6 décembre
- [x] Changer le titre de la page HTML par "Consultation citoyenne"

## Correction nom du lieu
- [x] Changer "salle Emile Peltier" par "Centre Culturel Emile Pelletier"

## Ajout balises meta SEO
- [x] Ajouter les balises meta pour le référencement Google
- [x] Inclure les mots-clés pertinents pour Veauche Mérite Mieux

## Footer et pages légales
- [x] Créer la page Mentions légales
- [x] Créer la page RGPD
- [x] Ajouter un footer avec liens vers ces pages

## Correction RGPD
- [x] Corriger la page RGPD pour mentionner la collecte d'emails et numéros de téléphone

## Boutons de partage social
- [x] Créer le composant de partage social
- [x] Ajouter les boutons Facebook et email
- [x] Intégrer dans la page d'accueil

## Comptage des visites
- [x] Créer la table pour stocker les visites
- [x] Ajouter une procédure pour enregistrer les visites
- [x] Enregistrer automatiquement les visites sur la page d'accueil
- [x] Afficher les statistiques de visites dans le back-office

## Modification comptage des réponses
- [x] Ne compter que les réponses avec au moins une question répondue dans les statistiques

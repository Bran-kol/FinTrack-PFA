# 1. Introduction Générale

Le domaine traité par ce projet relevait de la gestion financière personnelle et de la tenue de comptes. Les enjeux consistaient à permettre à un utilisateur de suivre ses revenus et ses dépenses, de catégoriser ses opérations, d'établir des budgets et d'obtenir une vue synthétique de son solde et de ses indicateurs financiers. Ce domaine nécessitait une application ergonomique côté client, une API fiable côté serveur et une persistance structurée des données.

# 2. Introduction

L'application développée était une plateforme web composée d'une interface cliente en React et d'une API serveur en Node.js/Express. L'objectif principal était de fournir aux utilisateurs des fonctionnalités de gestion de budget, de catégorisation des transactions, d'authentification et d'un tableau de bord récapitulatif. Le périmètre couvrait la création et l'édition de budgets et catégories, la saisie de transactions, la consultation du solde et l'accès sécurisé aux ressources via des routes protégées.

# 3. Contexte du Projet

La problématique adressée fut l'absence d'un outil simple et centralisé permettant le suivi des finances personnelles, notamment pour les utilisateurs qui souhaitaient regrouper budgets, catégories et transactions dans une interface unique. La motivation principale fut de permettre une visualisation claire des flux financiers et un contrôle des budgets. La solution proposée combina une application monopage (SPA) en React pour l'expérience utilisateur et une API REST en Node.js/Express pour la logique métier et l'accès à la base de données MySQL.

# 4. Cadre du Projet

## 4.1 Besoins Fonctionnels

BF1: Gestion des utilisateurs et authentification.

BF1.1: Inscription d'un nouvel utilisateur via un formulaire d'enregistrement.

BF1.2: Authentification des utilisateurs et protection des routes sensibles.

BF2: Gestion des budgets.

BF2.1: Création, lecture, mise à jour et suppression (CRUD) des budgets.

BF3: Gestion des catégories.

BF3.1: CRUD des catégories de transaction permettant de regrouper les opérations.

BF4: Gestion des transactions.

BF4.1: Enregistrement de transactions (dépense ou recette), affectation à une catégorie et consultation historique.

BF5: Solde et tableau de bord.

BF5.1: Consultation du solde courant et affichage d'indicateurs sur un tableau de bord.

Analyse des besoins:

L'analyse fonctionnelle s'appuya sur la décomposition en modules frontend et backend, l'identification des entités principales (utilisateur, budget, catégorie, transaction, solde) et leurs relations. Pour formaliser ces besoins, des diagrammes UML avaient été prévus: un diagramme de cas d'utilisation pour les fonctionnalités principales, un diagramme de classes représentant les entités persistées et leurs attributs, et des diagrammes de séquence décrivant les interactions typiques (par exemple: authentification, création d'une transaction, mise à jour du solde). Ces diagrammes servaient de guide à l'implémentation et à la rédaction des routes et contrôleurs.

## 4.2 Besoins Non Fonctionnels

Performance: L'application visa à offrir des temps de réponse faibles pour les requêtes usuelles (consultation du tableau de bord, listes de transactions) via des endpoints REST optimisés.

Sécurité: L'accès aux ressources sensibles fut restreint par des mécanismes d'authentification et des middleware côté serveur. Les données utilisateurs étaient stockées côté serveur et la validation des entrées fut appliquée pour prévenir les injections.

Utilisabilité: L'interface cliente fut conçue en tant qu'application monopage réactive pour fournir une expérience fluide, avec des formulaires et des composants modulaires.

Maintenabilité: La séparation claire entre les couches (routes, contrôleurs, services, middleware) et l'organisation des composants React ont facilité la maintenance et l'évolution.

Scalabilité: L'architecture REST et la persistance sur MySQL permirent d'envisager une montée en charge modérée en séparant ultérieurement les services ou en ajoutant une mise en cache.

# 5. Technologies Utilisées

React: L'interface cliente fut réalisée avec React en tant que bibliothèque de construction d'interfaces utilisateur. Le code était organisé en composants réutilisables et en pages pour refléter les vues principales (connexion, inscription, tableau de bord, budgets, transactions).

Node.js et Express: Le serveur applicatif fut développé avec Node.js et le micro-framework Express, structuré autour de fichiers de routes, de contrôleurs et de middlewares pour gérer la logique métier et la sécurité.

MySQL: La persistance des données fut assurée par une base de données relationnelle MySQL; un script de schéma (`database/schema.sql`) était inclus pour définir les tables et contraintes.

XAMPP: XAMPP était mentionné comme environnement possible pour déployer une instance locale de MySQL et du serveur web pendant le développement et les tests.

Bibliothèques complémentaires: Le projet utilisa des bibliothèques côté client pour les appels HTTP et la gestion d'état (par exemple un service API centralisé et un contexte d'authentification), et côté serveur des middlewares pour la validation et la gestion des requêtes. Ces bibliothèques facilitèrent la communication entre client et serveur, la gestion des sessions/jetons et la validation des données.

# 6. Réalisation et Tests

## 6.1 Processus de Développement

Le développement suivit plusieurs phases classiques. D'abord, l'analyse des besoins et la définition des entités permirent d'élaborer le schéma de la base de données et les interfaces API. Ensuite, l'implémentation du backend organisa les routes et les contrôleurs selon les responsabilités: gestion de l'authentification, opérations CRUD pour budgets, catégories et transactions, logique métier pour le calcul des soldes et des indicateurs. Parallèlement, l'interface React fut développée en composants et pages: formulaires d'authentification, formulaires de saisie (budget, catégorie, transaction), et vues de consultation (tableau de bord, liste des transactions). Des middlewares de validation et d'authentification furent ajoutés pour sécuriser les endpoints. Enfin, des tests fonctionnels manuels et des vérifications de bout en bout furent réalisés pour valider les parcours utilisateurs.

## 6.2 Captures d’Écran

Page de connexion: capture montrant le formulaire d'authentification et la navigation vers l'inscription.

Page d'inscription: capture montrant le formulaire d'enregistrement d'un nouvel utilisateur.

Tableau de bord: capture illustrant l'affichage synthétique du solde et des indicateurs financiers.

Vue Budgets: capture montrant la liste des budgets et les interfaces de création/modification.

Vue Transactions: capture montrant la liste des transactions, les filtres par catégorie et le formulaire d'ajout.

## 6.3 Tests Réalisés

Tests d'authentification: connexion et inscription d'un utilisateur — Réussi.

Tests CRUD Budgets: création, lecture, mise à jour et suppression d'un budget — Réussi.

Tests CRUD Catégories: opérations CRUD sur les catégories de transaction — Réussi.

Tests CRUD Transactions: saisie et consultation des transactions, association à une catégorie — Réussi.

Tests Tableau de bord et Solde: consultation du solde et des indicateurs calculés à partir des transactions — Réussi.

# 7. Conclusion

Le projet avait permis de livrer une application complète de gestion financière personnelle, composée d'un client React et d'une API Node.js/Express avec une persistance MySQL. Les objectifs fonctionnels furent atteints: authentification, gestion des budgets, catégories et transactions, et présentation d'un tableau de bord synthétique. Les contributions techniques comprirent une architecture modulaire côté serveur (routes, contrôleurs, middleware), une organisation claire des composants React et l'intégration d'un schéma de base de données relationnel. Pour les perspectives futures, il fut recommandé d'ajouter des tests automatisés, d'améliorer la gestion des rôles et des permissions, d'introduire la pagination et la recherche pour les listes volumineuses, et d'envisager la mise en place d'une API publique documentée (OpenAPI/Swagger) ainsi que des optimisations de performance et de mises en cache.

# /start — Protocole de démarrage de session

Exécute le protocole de démarrage de session Fantasy Pétanque.

## Étape 1 — Lire l'inbox

Lis `TODO.md`, section `## Inbox`.

### Si l'inbox contient des items

1. Lis `ROADMAP.md` pour récupérer les tâches existantes.
2. Fusionne les items de l'inbox avec ceux de la roadmap :
   - Analyse chaque item de l'inbox (nature, complexité, dépendances).
   - Attribue une priorité : **haute** (bloquant ou critique), **moyenne** (fonctionnalité importante), **basse** (amélioration, polish).
   - Insère chaque item dans la bonne section de `ROADMAP.md`, avec le statut `[ ]`.
   - Formule les items de manière claire et actionnable si ce n'est pas déjà le cas.
3. Écrase `ROADMAP.md` avec le résultat fusionné.
4. Vide l'inbox dans `TODO.md` (remplace le contenu par le commentaire vide d'origine).
5. Présente à l'utilisateur la roadmap mise à jour et demande confirmation avant de continuer.

### Si l'inbox est vide

Passe directement à l'étape 2.

---

## Étape 2 — Choisir la prochaine tâche

1. Lis `ROADMAP.md`.
2. Prends la première tâche avec le statut `[ ]` (en commençant par la priorité haute).
3. Vérifie qu'aucune tâche `[en cours]` ne bloque celle-ci (dépendances).

---

## Étape 3 — Analyser la tâche

Avant de coder quoi que ce soit :

1. **Faisabilité** : la tâche est-elle bien définie ? Y a-t-il des ambiguïtés dans `fantasy-petanque.md` ?
2. **Scope** : qu'est-ce qui est inclus / exclu ? Quels fichiers seront touchés ?
3. **Architecture** : quels composants, hooks, stores, fonctions de domaine sont impliqués ? Y a-t-il des impacts sur le moteur de jeu ou le scoring ?
4. **Tests** : quels tests faudra-t-il ajouter ou modifier ?

Si un aspect de game design, de contrainte technique ou d'UX n'est pas clair, **poser les questions à l'utilisateur maintenant**, avant de commencer.

---

## Étape 4 — Valider et démarrer

Une fois l'analyse faite et les questions répondues :

1. Mettre la tâche à `[en cours]` dans `ROADMAP.md`.
2. Présenter le plan d'implémentation à l'utilisateur.
3. Attendre validation explicite avant de commencer à coder.

# TODO — Fantasy Pétanque

## Instructions pour les agents (Claude Code / Codex)

### Protocole de démarrage de session

1. **Lire cette inbox** (section ci-dessous).
2. **Si l'inbox contient des items** :
   - Lire `ROADMAP.md` pour récupérer les tâches déjà classées.
   - Fusionner les items de l'inbox avec ceux de la roadmap en les classant par priorité.
   - Écrire le résultat dans `ROADMAP.md` (écrase la version précédente).
   - Vider l'inbox (supprimer les items traités de cette section).
3. **Si l'inbox est vide** :
   - Lire `ROADMAP.md`.
   - Prendre la prochaine tâche disponible (ni `[en cours]` ni `[fait]`).
   - Analyser sa faisabilité, son scope et son architecture technique.
   - Entrer en mode plan (`/plan`) et poser les questions nécessaires à l'utilisateur si des aspects de game design, de contraintes techniques ou d'UX ne sont pas clairs.
   - Ne pas démarrer l'implémentation sans validation.

### Protocole d'exécution

4. **Avant de commencer** : mettre la tâche à `[en cours]` dans `ROADMAP.md`. Une tâche `[en cours]` ne peut pas être prise par un autre agent.
5. **Implémenter** selon les conventions de `CLAUDE.md` et `AGENTS.md`.
6. **Tester** : `npm test` doit passer, ajouter les tests nécessaires.
7. **Committer** avec un message clair (format dans `AGENTS.md`).
8. **Après le commit** :
   - Passer la tâche à `[fait]` dans `ROADMAP.md`.
   - Mettre à jour `MEMORY.md` si des décisions produit ou architecturales notables ont été prises.

---

## Inbox

<!-- Dépose ici tes instructions dans n'importe quel ordre. L'agent les traitera au prochain démarrage. -->

- En mode simple: Centrer verticalement les blocs.
- En mode simple: Afficher l'historique au dessus des blocs de score
- En mode simple: Cliquer sur "nouvelle mène" lance directement une nouvelle mène sans passer par un écran de score
- Tous les modes: En haut à gauche, un bouton retour permet d'annuler la partie. Une alerte prévient l'utilisateur que toute partie sera perdue s'il dit oui.
- Potentiel bug: Sur la partie "Totem d'immunité", la règle s'affiche 2 fois. C'est peut etre le cas sur d'autres règles.
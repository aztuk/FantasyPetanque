# AGENTS.md — Fantasy Pétanque

## Protocole de synchronisation roadmap

Ce protocole s'exécute **uniquement quand l'utilisateur demande la prochaine tâche** — formulations typiques : "quelle est la prochaine tâche ?", "qu'est-ce qu'on fait ?", "on commence quoi ?", "next task", ou équivalent. Il peut aussi être déclenché manuellement via `/start`.

**Ne pas exécuter ce protocole automatiquement à chaque début de session.**

### 1. Vérifier l'inbox de `TODO.md`

**Si `## Inbox` contient des items :**
- Lire `ROADMAP.md` (tâches existantes).
- Fusionner en attribuant une priorité à chaque item : **haute** (bloquant), **moyenne** (fonctionnalité), **basse** (polish).
- Écrire le résultat dans `ROADMAP.md` (écrase la version précédente).
- Vider l'inbox dans `TODO.md` (remettre le commentaire vide).
- Présenter la roadmap mise à jour et demander confirmation.

**Si l'inbox est vide :** passer directement au point 2.

### 2. Choisir la prochaine tâche

- Les tâches `[en cours]` **ne sont pas sélectionnables** — elles appartiennent à un agent ou une session en cours.
- Prendre la première tâche `[ ]` dans `ROADMAP.md` (priorité haute en premier).
- Vérifier que les tâches `[en cours]` ne créent pas de conflit (fichiers partagés, dépendances) avec la tâche choisie — si oui, le signaler à l'utilisateur avant de continuer.
- Si la tâche choisie est manifestement petite et sans ambiguïté, l'agent peut proposer de prendre en même temps la prochaine petite tâche compatible, à condition d'analyser les deux scopes, de vérifier l'absence de conflit, puis de marquer les deux tâches `[en cours]` avant de coder.

### 3. Analyser avant de coder

- **Faisabilité** : ambiguïtés dans `fantasy-petanque.md` ?
- **Scope** : fichiers touchés, inclus/exclus ?
- **Architecture** : composants, stores, moteur de jeu impactés ?
- **Tests** : quels tests ajouter ou modifier ?

Si un aspect de game design, UX ou contrainte technique n'est pas clair → **poser les questions à l'utilisateur avant de commencer**.

### 4. Démarrer

1. Mettre la tâche à `[en cours]` dans `ROADMAP.md`.
2. Présenter le plan d'implémentation.
3. Attendre validation avant de coder.

### 5. Demander un test manuel avant de terminer

Avant tout commit ou modification de `ROADMAP.md`, l'agent **doit** :

1. Décrire précisément le scénario de test manuel à effectuer (écran, actions, résultat attendu).
2. Demander explicitement à l'utilisateur de l'exécuter et de confirmer le résultat.
3. **Attendre la validation** — ne pas committer ni toucher `ROADMAP.md` avant la réponse.

Formulation attendue (exemple) :
> "Avant de committer, merci de tester manuellement : lance l'app, joue une mène avec la règle Casino, vérifie que [comportement X]. Dis-moi si c'est ok."

### 6. Terminer (après validation manuelle confirmée)

Seulement après confirmation explicite de l'utilisateur :
1. Committer les changements Git.
2. Passer la tâche à `[fait]` dans `ROADMAP.md` en indiquant obligatoirement :
   - la difficulté estimée de la tâche sur 5 ;
   - l'agent ayant terminé la tâche : `Codex` ou `Claude`.

   Format attendu :
   ```
   - [fait] Tâche X - Difficulté 1/5 - Codex
   ```
3. Mettre à jour `MEMORY.md` si des décisions produit ou architecturales notables ont été prises.

---

## Contexte du projet

Application mobile iOS/Android — Fantasy Pétanque.

Permet de jouer à la pétanque avec des règles spéciales tirées aléatoirement à chaque mène. L'app compte les scores, applique les bonus/malus/effets automatiquement, et conserve un historique complet.

**Spec principale** : `fantasy-petanque.md` — source de vérité absolue. En cas de doute, la spec prime sur tout le reste.

---

## Stack technique

- **React Native** + **Expo** (SDK 51+)
- **TypeScript** strict
- **Zustand** pour l'état global de partie
- **Jest** + **React Native Testing Library** pour les tests
- **React Navigation** pour la navigation

---

## Architecture

```
src/
  app/navigation/           # Stack de navigation
  features/game/
    components/             # Composants UI du jeu
    screens/                # Écrans (GameScreen, ScoringScreen, SummaryScreen)
    hooks/                  # Hooks React (useGame, useRuleDraw)
    state/                  # Store Zustand
  domain/game/
    models/                 # Types TypeScript
    rules/                  # Logique de chaque règle
    scoring/                # Moteur de score
    engine/                 # Moteur de tirage et résolution
  data/rules/               # Banque de règles (données)
  shared/
    components/             # Composants partagés
    constants/              # Constantes globales
    utils/                  # Utilitaires
  __tests__/                # Tests
```

**Principe fondamental** : séparer strictement le moteur de jeu (logique pure, testable sans UI) des composants React Native.

---

## Conventions de code

- TypeScript strict — pas de `any` implicite
- Composants : `PascalCase`
- Fonctions/hooks : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`
- Fichiers de données : `kebab-case`
- Named exports préférés aux default exports

---

## Règles de travail obligatoires

### Design system obligatoire

> **Contrainte bloquante — s'applique à toute tâche touchant à l'UI.**

**Avant de coder quoi que ce soit de visuel, lire les sections pertinentes de `Design.md`.**

`Design.md` est la source de vérité design (issue de Figma). Le code doit se conformer à `Design.md`, pas l'inverse.

Sections à lire selon la tâche :

| Si la tâche touche à… | Lire dans `Design.md` |
|---|---|
| Une couleur, un fond, une bordure | `## TOKENS — Couleurs` |
| Un texte, une police, une taille | `## TOKENS — Typographie` |
| Un padding, un gap, un margin | `## TOKENS — Espacements` |
| Un coin arrondi | `## TOKENS — Rayons de bordure` |
| Un composant partagé existant | `## COMPOSANTS — Partagés` |
| Un écran | `## ÉCRANS` (node-id Figma correspondant) |
| Un flow de navigation | `## FLOWS` |

**Violations bloquantes — ces actions sont interdites sans exception :**
- Écrire une valeur hex couleur directement dans un style — utiliser `colors.*`
- Inventer des valeurs de `fontSize`, `lineHeight`, `letterSpacing` — utiliser un preset de `textStyles`
- Implémenter un écran sans avoir vérifié son entrée dans la section `## ÉCRANS` de `Design.md`
- Ignorer une divergence constatée entre le code et `Design.md` — la signaler à l'utilisateur

### Interdiction du checkup visuel seul

Ne jamais conclure qu'une fonctionnalité est correcte uniquement parce qu'elle "semble bonne visuellement".

Chaque session doit inclure :
- des tests unitaires ou d'intégration
- une vérification fonctionnelle du comportement attendu
- une vérification de non-régression (`npm test`)
- un commit Git si le travail est valide

### Tests obligatoires

À chaque session :
1. Lancer les tests existants : `npm test`
2. Ajouter les tests couvrant les nouvelles fonctionnalités
3. Ne pas laisser de fonctionnalité critique sans test

Tests minimum requis (voir `CLAUDE.md` pour la liste complète) :
- score normal (ajout, annulation)
- désactivation de l'équipe adverse
- bonus/malus avec limites
- score minimum à 0
- Casino, Prédiction, Totem d'immunité
- L'impair contre-attaque
- Sortie de porc
- Assurance vie, Frontière
- Tirage sans répétition + véto
- Historique de mène

### Commit obligatoire (après validation manuelle)

En fin de session cohérente, et **uniquement après que l'utilisateur a validé le test manuel** :
- `git add` des fichiers concernés
- message de commit explicite et ciblé
- pas de mélange de sujets non liés dans un commit

Format recommandé :
```
feat(rules): implement Casino rule
fix(scoring): clamp score at zero
test(engine): cover veto and round draw
```

**Ne jamais committer ni marquer `[fait]` dans `ROADMAP.md` sans avoir reçu la confirmation explicite de l'utilisateur. Toute tâche marquée `[fait]` doit indiquer la difficulté sur 5 et l'agent (`Codex` ou `Claude`).**

### Questions produit/design

Si une ambiguïté ou incohérence est détectée dans `fantasy-petanque.md` :
1. Décrire précisément l'incohérence
2. Proposer 1 à 3 options
3. Recommander une option
4. Demander validation si la décision impacte le score, le flow, ou l'architecture

Décisions mineures : les prendre, les documenter dans `MEMORY.md` si elles peuvent influencer une session future, continuer.

---

## Règles produit clés

### Score

- Une équipe ne peut jamais descendre sous 0
- Score cible : **13 points**
- Une seule équipe marque les points normaux par mène
- Bonus/malus cumulables dans les limites de chaque règle

### Tirage de règles

- Pool sans répétition jusqu'à épuisement, puis recommence
- Véto : relance immédiate, la règle refusée peut revenir
- Totem d'immunité : pré-tire une règle `totem-compatible` pour la mène suivante

### Décisions produit prises

| Point ambigu | Décision retenue |
|---|---|
| Mène Totem nulle | Pas d'immunité accordée |
| Totem sans règle compatible | Recycler les règles `totem-compatible` déjà jouées |
| Contrat : même mission possible | Autorisé (non interdit par la spec) |
| Véto en chaîne | Chaque véto est indépendant |

---

## Commandes utiles

```bash
npx expo start          # Lancer le projet
npm test                # Tests
npm test -- --watch     # Tests en watch mode
npm test -- --coverage  # Couverture
npx tsc --noEmit        # Vérification TypeScript
npm run lint            # Lint
```

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `fantasy-petanque.md` | Spec — source de vérité gameplay |
| `Design.md` | Source de vérité design — tokens, composants, écrans, flows |
| `src/data/rules/rules.ts` | Banque de règles |
| `src/domain/game/engine/` | Moteur de tirage et résolution |
| `src/domain/game/scoring/` | Moteur de score |
| `src/features/game/state/gameStore.ts` | État global Zustand |
| `src/__tests__/` | Tests |

---

## Interdictions

- **Coder une tâche UI sans avoir lu les sections pertinentes de `Design.md` au préalable**
- **Utiliser une valeur hex directe ou des valeurs typographiques inventées — utiliser exclusivement `colors.*` et `textStyles.*`**
- Conclure une fonctionnalité terminée sur la seule base d'un test visuel
- Sauter les tests pour livrer plus vite
- Mélanger plusieurs sujets dans un commit
- Inventer silencieusement une décision produit structurante
- Ajouter `any` TypeScript sans justification explicite
- Ne jamais committer sans avoir demandé un test manuel à l'utilisateur et reçu sa validation explicite
- Ne jamais modifier `ROADMAP.md` (passer `[en cours]` → `[fait]`) sans validation manuelle confirmée, ni oublier la difficulté sur 5 et l'agent (`Codex` ou `Claude`)
- Ne jamais modifier `fantasy-petanque.md` (c'est la spec, pas le code)

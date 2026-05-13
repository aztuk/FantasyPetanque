# CLAUDE.md — Fantasy Pétanque

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
   - [fait] Tâche X - Difficulté 1/5 - Claude
   ```
3. Mettre à jour `MEMORY.md` si des décisions produit ou architecturales notables ont été prises.

---

## Contexte du projet

Application mobile iOS/Android permettant de jouer à la pétanque avec des règles "fantasy" tirées aléatoirement à chaque mène. L'app compte les scores, applique automatiquement les bonus/malus/effets spéciaux, et conserve un historique de partie.

**Spec principale** : `fantasy-petanque.md` — source de vérité absolue. En cas de doute, la spec prime sur tout le reste.

---

## Stack technique

- **React Native** avec **Expo** (SDK 51+)
- **TypeScript** strict
- **Zustand** pour l'état global
- **Jest** + **React Native Testing Library** pour les tests
- **React Navigation** (Stack + Bottom Tabs)
- **Expo Router** si applicable

---

## Architecture du projet

```
src/
  app/
    navigation/         # Navigation principale
  features/
    game/
      components/       # Composants UI du jeu
      screens/          # Écrans de jeu (GameScreen, ScoringScreen, SummaryScreen)
      hooks/            # Hooks React (useGame, useRuleDraw, etc.)
      state/            # Store Zustand de partie
  domain/
    game/
      models/           # Types TypeScript (Game, Round, Rule, Team, Score)
      rules/            # Logique de chaque règle
      scoring/          # Moteur de score (applyScore, applyBonus, etc.)
      engine/           # Moteur de jeu (drawRule, applyVeto, resolveRound)
  data/
    rules/              # Banque de règles (données JSON/TS)
  shared/
    components/         # Composants réutilisables (Button, ScoreBlock)
    constants/          # Constantes (WINNING_SCORE = 13, etc.)
    utils/              # Utilitaires
  __tests__/            # Tests unitaires et d'intégration
```

---

## Conventions de code

- **TypeScript strict** : `strict: true` dans tsconfig, pas de `any` implicite
- **Nommage** :
  - Composants : `PascalCase` (ex: `ScoreBlock`, `RuleCard`)
  - Fonctions/hooks : `camelCase` (ex: `drawRule`, `useGameState`)
  - Constantes : `UPPER_SNAKE_CASE` (ex: `WINNING_SCORE`, `MAX_MALUS_CENSURE`)
  - Fichiers : `kebab-case` pour les fichiers de données, `PascalCase` pour les composants
  - Types/interfaces : `PascalCase` avec préfixe `I` pour les interfaces si nécessaire
- **Exports** : préférer les named exports
- **Pas de `console.log`** en production (utiliser un logger conditionnel si besoin)

---

## Modèle de données clé

```typescript
type Team = 'blue' | 'red';

interface GameState {
  mode: 'simple' | 'fantasy';
  rounds: Round[];
  currentRound: CurrentRound | null;
  scores: Record<Team, number>;
  vetos: Record<Team, boolean>; // true = véto disponible
  playedRules: string[];        // ids des règles jouées ce cycle
  pendingNextRule: Rule | null; // règle pré-tirée par Totem
  immuneTeam: Team | null;      // équipe immunisée (après Totem)
}

interface Round {
  number: number;
  rule: Rule | null;
  normalPoints: Record<Team, number>;
  bonuses: BonusMalus[];
  maluses: BonusMalus[];
  specialEffects: SpecialEffect[];
  scoreAfter: Record<Team, number>;
  vetoUsed: Team | null;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  tags: RuleTag[];
  uiType: 'none' | 'bonus-buttons' | 'setup' | 'complex';
  condition?: (state: GameState) => boolean;
  skipNormalScore?: boolean;
}

type RuleTag =
  | 'fast'
  | 'setup'
  | 'specific'
  | 'bonus'
  | 'malus'
  | 'skip-normal-score'
  | 'requires-next-rule'
  | 'totem-compatible'
  | 'needs-manual-resolution'
  | 'score-modifier'
  | 'auto-resolution'
  | 'specific-ui'
  | 'gesture'
  | 'auto-arbitrage'
  | 'scoring-constraint'
  | 'instant-resolution'
  | 'bet'
  | 'not-available-at-zero'
  | 'future-rule'
  | 'skip-random-draw-next-turn'
  | 'mission'
  | 'reroll';
```

---

## Règles produit importantes

### Score
- Une équipe ne peut jamais descendre sous 0
- Score cible par défaut : **13 points**
- Une seule équipe marque les points normaux par mène
- Les bonus/malus sont cumulables selon les limites de chaque règle

### Tirage de règles
- Pool sans répétition jusqu'à épuisement, puis recommence
- Véto = relance immédiate, la règle refusée peut réapparaître plus tard
- Totem d'immunité : tire une règle `totem-compatible` pour la mène suivante
- Si aucune règle `totem-compatible` disponible dans le pool actuel → recycler les règles compatibles déjà jouées

### Décisions produit prises (ambiguïtés résolues)

1. **Mène Totem nulle** : pas d'immunité accordée, la règle suivante s'applique aux deux équipes.
2. **Totem sans règle compatible disponible** : recycler les règles `totem-compatible` déjà jouées pour ce tirage uniquement.
3. **Contrat** : les deux équipes peuvent choisir la même mission (non interdit par la spec).
4. **Véto en chaîne** : chaque véto est indépendant — après un premier véto, l'autre équipe peut vétower la nouvelle règle.

---

## Règles de travail obligatoires

### Pas de checkup visuel seul

Ne jamais conclure qu'une fonctionnalité est correcte uniquement parce qu'elle "semble bonne visuellement".

Chaque session doit inclure au moins :
- des tests unitaires ou d'intégration
- une vérification fonctionnelle du comportement
- une vérification de non-régression (`npm test`)
- un commit Git clair si le travail est valide

### Tests obligatoires

À chaque session de développement :
- lancer les tests : `npm test`
- ajouter ou modifier les tests pour couvrir les nouvelles fonctionnalités
- ne pas laisser une fonctionnalité critique sans test
- documenter ce qui a été testé

Tests minimum obligatoires :
- ajout de points normaux
- annulation de points normaux
- désactivation de l'équipe adverse pendant le score
- bonus/malus (Gauche caviar, Censure)
- score minimum à 0
- Casino (mise, résolution, gains/pertes)
- Prédiction (vérification auto, malus si réussie)
- Totem d'immunité (tirage de la prochaine règle, immunité)
- L'impair contre-attaque (résolution auto)
- Sortie de porc (saut du score normal)
- Assurance vie (effet sur score)
- Frontière (affichage du rappel)
- tirage sans répétition
- véto
- historique de mène

### Commit obligatoire (après validation manuelle)

À la fin de chaque session cohérente, et **uniquement après que l'utilisateur a validé le test manuel** :
- `git add` des fichiers concernés
- message de commit clair et précis
- pas de mélange de sujets non liés

**Ne jamais committer ni marquer `[fait]` dans `ROADMAP.md` sans confirmation explicite de l'utilisateur. Toute tâche marquée `[fait]` doit indiquer la difficulté sur 5 et l'agent (`Codex` ou `Claude`).**

Format de tâche terminée attendu dans `ROADMAP.md` :
```
- [fait] Tâche X - Difficulté 1/5 - Claude
```

Format de commit recommandé :
```
feat(rules): add Casino rule with betting UI
fix(scoring): prevent score going below zero
test(engine): add veto and draw tests
```

### Questions produit/design

Si une incohérence, une ambiguïté ou un problème apparaît :
1. Décrire précisément le problème
2. Proposer 1 à 3 options
3. Recommander une option
4. **Poser la question** si la décision impacte le flow utilisateur ou le score

Décisions mineures : les prendre, les documenter dans `MEMORY.md` si elles peuvent influencer une session future, continuer.

---

## Commandes utiles

```bash
# Démarrer le projet
npx expo start

# Tests
npm test
npm test -- --watch
npm test -- --coverage

# TypeScript
npx tsc --noEmit

# Lint
npm run lint
```

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `fantasy-petanque.md` | Spec principale — source de vérité |
| `src/data/rules/rules.ts` | Banque de toutes les règles |
| `src/domain/game/engine/` | Moteur de tirage et de résolution |
| `src/domain/game/scoring/` | Moteur de score |
| `src/features/game/state/gameStore.ts` | État global de partie (Zustand) |
| `src/__tests__/` | Tous les tests |

---

## Interdictions

- Ne jamais conclure une fonctionnalité terminée sur la seule base d'un test visuel
- Ne jamais sauter les tests pour livrer plus vite
- Ne jamais mélanger plusieurs sujets dans un commit
- Ne jamais inventer silencieusement une décision produit structurante
- Ne jamais ajouter de `any` TypeScript sans justification explicite
- **Ne jamais committer sans avoir demandé un test manuel à l'utilisateur et reçu sa validation explicite**
- **Ne jamais modifier `ROADMAP.md` (passer `[en cours]` → `[fait]`) sans validation manuelle confirmée, ni oublier la difficulté sur 5 et l'agent (`Codex` ou `Claude`)**
- Ne jamais modifier `fantasy-petanque.md` (c'est la spec, pas le code)
